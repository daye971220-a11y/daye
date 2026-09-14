// 네이버 검색광고(searchad.naver.com) API — 키워드도구(GetKeywordStats) 클라이언트.
// developers.naver.com 오픈 API(NAVER_CLIENT_ID/SECRET, naverClient.js)와는 별개 시스템이라
// 인증 방식도 다르다: 매 요청마다 타임스탬프+메서드+URI를 SECRET_KEY로 HMAC-SHA256 서명해서
// X-Signature 헤더로 보내야 한다. 발급 방법은 server/.env.example 주석 참고.
const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'https://api.searchad.naver.com';
const KEYWORDSTOOL_PATH = '/keywordstool';

function isConfigured() {
  const { NAVER_AD_API_KEY, NAVER_AD_SECRET_KEY, NAVER_AD_CUSTOMER_ID } = process.env;
  return Boolean(
    NAVER_AD_API_KEY &&
      NAVER_AD_SECRET_KEY &&
      NAVER_AD_CUSTOMER_ID &&
      !NAVER_AD_API_KEY.includes('여기에')
  );
}

function buildSignature(timestamp, method, uri, secretKey) {
  const message = `${timestamp}.${method}.${uri}`;
  return crypto.createHmac('sha256', secretKey).update(message).digest('base64');
}

function buildHeaders(method, uri) {
  const apiKey = process.env.NAVER_AD_API_KEY;
  const secretKey = process.env.NAVER_AD_SECRET_KEY;
  const customerId = process.env.NAVER_AD_CUSTOMER_ID;
  const timestamp = Date.now().toString();

  return {
    'X-Timestamp': timestamp,
    'X-API-KEY': apiKey,
    'X-Customer': customerId,
    'X-Signature': buildSignature(timestamp, method, uri, secretKey),
    'Content-Type': 'application/json; charset=UTF-8',
  };
}

// "< 10"처럼 문자열로 오는 저검색량 표기 — 실제 값은 알 수 없으니 대표값 5로 취급.
// (0으로 두면 "검색량 0"과 구분이 안 돼서 정렬/필터에서 진짜 0건과 섞여버림)
function parseCount(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim().startsWith('<')) return 5;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// hintKeywords는 한 번에 최대 5개까지만 허용되고, 공백/특수문자가 없는 명사형이어야 한다.
async function getKeywordStats(hintKeywords) {
  if (!isConfigured()) {
    throw new Error(
      'NAVER_AD_API_KEY / NAVER_AD_SECRET_KEY / NAVER_AD_CUSTOMER_ID가 설정되지 않았습니다. server/.env를 확인하세요.'
    );
  }
  if (!hintKeywords || hintKeywords.length === 0) return [];
  const chunk = hintKeywords.slice(0, 5).map((k) => k.replace(/\s+/g, ''));

  try {
    const res = await axios.get(`${BASE_URL}${KEYWORDSTOOL_PATH}`, {
      params: { hintKeywords: chunk.join(','), showDetail: 1 },
      headers: buildHeaders('GET', KEYWORDSTOOL_PATH),
      timeout: 10000,
    });

    return (res.data.keywordList || []).map((item) => ({
      keyword: item.relKeyword,
      pcQc: parseCount(item.monthlyPcQcCnt),
      mobileQc: parseCount(item.monthlyMobileQcCnt),
      // compIdx: "낮음" | "중간" | "높음" | "-"(집계 불가) 그대로 사용
      compIdx: item.compIdx && item.compIdx !== '-' ? item.compIdx : null,
      plAvgDepth: item.plAvgDepth ?? null,
    }));
  } catch (err) {
    const status = err.response?.status;
    const body = err.response?.data ? JSON.stringify(err.response.data).slice(0, 300) : '';
    console.error(`[searchAdClient] hintKeywords="${chunk.join(',')}" 호출 실패 (status=${status || 'N/A'}): ${err.message} ${body}`);
    return [];
  }
}

module.exports = { getKeywordStats, isConfigured };
