// 네이버 데이터랩 "통합 검색어 트렌드" API — 검색광고 API와 달리 developers.naver.com
// 오픈 API 키(NAVER_CLIENT_ID/SECRET, naverClient.js와 동일)를 그대로 쓴다. 별도 발급 불필요.
//
// 실시간 인기검색어 순위 API는 네이버가 2021년에 없앴기 때문에, "지금 뜨는 키워드"를
// 직접 목록으로 받아올 방법은 없다. 대신 이 API로 "우리가 이미 아는 시드 키워드들의
// 최근 검색 추세(상대 지수)"를 받아서, 최근 며칠 새 지수가 튄 시드를 "급상승"으로,
// 1년치 지수 편차가 큰 시드를 "계절형"으로 분류하는 방식으로 흉내낸다.
// → 시드 자체가 아니라 키워드도구가 확장한 "연관 키워드"까지 전수 조사하는 건 호출 수가
//   너무 커져서(연관 키워드는 토픽당 수백 개) 하지 않음 — 연관 키워드는 자신을 만들어낸
//   시드의 급상승/계절 판정을 물려받는 방식으로 근사한다 (keywordResearch.js 참고).
const axios = require('axios');

const DATALAB_URL = 'https://openapi.naver.com/v1/datalab/search';
const REQUEST_GAP_MS = 300;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isConfigured() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  return Boolean(clientId && clientSecret && !clientId.includes('여기에'));
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

async function fetchTrend(keywordGroups, { startDate, endDate, timeUnit }) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  try {
    const res = await axios.post(
      DATALAB_URL,
      { startDate, endDate, timeUnit, keywordGroups },
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    return res.data.results || [];
  } catch (err) {
    const status = err.response?.status;
    console.error(`[datalabClient] 트렌드 조회 실패 (status=${status || 'N/A'}): ${err.message}`);
    return [];
  }
}

function average(nums) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function stddev(nums) {
  if (nums.length === 0) return 0;
  const avg = average(nums);
  return Math.sqrt(average(nums.map((n) => (n - avg) ** 2)));
}

// 시드 키워드들을 5개씩 묶어 "최근 30일 일간 추세"(급상승 판정용)와
// "최근 13개월 월간 추세"(계절성 판정용)를 조회하고, 시드별로 분류 결과를 돌려준다.
// 반환: Map<keyword, { rising: boolean, seasonal: boolean, momentum: number, seasonCv: number }>
async function classifySeeds(seedKeywords) {
  const result = new Map();
  if (!isConfigured() || seedKeywords.length === 0) return result;

  const today = new Date();
  const chunks = [];
  for (let i = 0; i < seedKeywords.length; i += 5) chunks.push(seedKeywords.slice(i, i + 5));

  for (const chunk of chunks) {
    const groups = chunk.map((kw) => ({ groupName: kw, keywords: [kw] }));

    const dailyEnd = formatDate(today);
    const dailyStart = formatDate(new Date(today.getTime() - 30 * 86400000));
    const dailyResults = await fetchTrend(groups, { startDate: dailyStart, endDate: dailyEnd, timeUnit: 'date' });
    await sleep(REQUEST_GAP_MS);

    const monthlyEnd = formatDate(today);
    const monthlyStart = formatDate(new Date(today.getTime() - 395 * 86400000));
    const monthlyResults = await fetchTrend(groups, { startDate: monthlyStart, endDate: monthlyEnd, timeUnit: 'month' });
    await sleep(REQUEST_GAP_MS);

    for (const kw of chunk) {
      const daily = dailyResults.find((r) => r.title === kw);
      const monthly = monthlyResults.find((r) => r.title === kw);

      let momentum = 1;
      if (daily && daily.data.length >= 10) {
        const points = daily.data.map((d) => d.ratio);
        const recent = average(points.slice(-7));
        const past = average(points.slice(0, -7));
        momentum = past > 0 ? recent / past : recent > 0 ? 2 : 1;
      }

      let seasonCv = 0;
      if (monthly && monthly.data.length >= 6) {
        const points = monthly.data.map((d) => d.ratio);
        const avg = average(points);
        seasonCv = avg > 0 ? stddev(points) / avg : 0;
      }

      result.set(kw, {
        rising: momentum >= 1.3,
        seasonal: seasonCv >= 0.45,
        momentum: Number(momentum.toFixed(2)),
        seasonCv: Number(seasonCv.toFixed(2)),
      });
    }
  }

  return result;
}

module.exports = { classifySeeds, isConfigured };
