const axios = require('axios');

const NAVER_NEWS_URL = 'https://openapi.naver.com/v1/search/news.json';
const NAVER_BLOG_URL = 'https://openapi.naver.com/v1/search/blog.json';

function stripHtml(text) {
  return text.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

// 네이버 뉴스 검색 API를 호출해 특정 키워드의 최신 기사를 가져온다.
// 실패해도 예외를 던지지 않고 빈 배열을 반환한다 (다음 수집 주기에 다시 시도하면 되므로).
async function searchNews(query, { display = 30 } = {}) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.includes('여기에')) {
    throw new Error('NAVER_CLIENT_ID / NAVER_CLIENT_SECRET이 설정되지 않았습니다. server/.env 파일을 확인하세요.');
  }

  try {
    const res = await axios.get(NAVER_NEWS_URL, {
      params: { query, display, sort: 'date' },
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
      timeout: 8000,
    });

    return (res.data.items || []).map((item) => ({
      title: stripHtml(item.title),
      description: stripHtml(item.description || ''),
      link: item.originallink || item.link,
      pubDate: new Date(item.pubDate).toISOString(),
    }));
  } catch (err) {
    const status = err.response?.status;
    console.error(`[naverClient] "${query}" 검색 실패 (status=${status || 'N/A'}): ${err.message}`);
    return [];
  }
}

// 특정 키워드(이슈 라벨)를 다룬 블로그 글이 총 몇 건인지 조회.
// "기사는 떴는데 블로그는 아직 거의 없는" 이슈를 가려내는 데 사용하므로,
// 실제 글 목록이 아니라 전체 건수(total)만 필요해 display=1로 최소 호출한다.
// 실패 시 null을 반환해 호출부에서 "확인 불가"로 처리하고 필터링에서 제외하지 않게 한다.
async function getBlogCount(query) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.includes('여기에')) {
    throw new Error('NAVER_CLIENT_ID / NAVER_CLIENT_SECRET이 설정되지 않았습니다. server/.env 파일을 확인하세요.');
  }

  try {
    const res = await axios.get(NAVER_BLOG_URL, {
      params: { query, display: 1 },
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
      timeout: 8000,
    });

    return typeof res.data.total === 'number' ? res.data.total : null;
  } catch (err) {
    const status = err.response?.status;
    console.error(`[naverClient] 블로그 검색 실패 "${query}" (status=${status || 'N/A'}): ${err.message}`);
    return null;
  }
}

module.exports = { searchNews, getBlogCount };
