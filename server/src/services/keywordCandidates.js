// 키워드 리서치용 후보 키워드 마이너.
// keywordTopics.js의 고정 시드만으로는 "지금 막 뜬" 후보를 못 잡기 때문에, 해당 토픽의
// 최신 뉴스 헤드라인(네이버 뉴스 검색 API)에서 자주 등장하는 단어를 추가 후보로 뽑는다.
// 형태소 분석 없이 러프하게 토큰화하는 keywordExtractor.extractKeywords를 그대로 재사용
// (트렌드 피드 기능과 동일한 알려진 한계를 그대로 가짐 — keywordExtractor.js 주석 참고).
const { searchNews } = require('./naverClient');
const { extractKeywords } = require('./keywordExtractor');

const REQUEST_GAP_MS = 300;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MIN_TOKEN_LEN = 2;
const MAX_CANDIDATES = 15;

// 뉴스 헤드라인 토큰은 "제목에 쓰인 표현"이라 검색광고 키워드도구가 기대하는 공백 없는
// 명사형과 다를 수 있다 — 그대로 hintKeywords에 넣어도 대부분 동작하지만, 너무 긴 토큰은
// 검색량이 거의 항상 0으로 잡혀서 노이즈만 늘리므로 길이 상한을 둔다.
const MAX_TOKEN_LEN = 8;

async function mineCandidates(topic) {
  const freq = new Map();

  for (const query of topic.newsQueries || []) {
    const articles = await searchNews(query, { display: 20 });
    await sleep(REQUEST_GAP_MS);

    for (const article of articles) {
      const tokens = extractKeywords(article.title);
      for (const token of tokens) {
        if (token.length < MIN_TOKEN_LEN || token.length > MAX_TOKEN_LEN) continue;
        freq.set(token, (freq.get(token) || 0) + 1);
      }
    }
  }

  const seedSet = new Set(topic.seedKeywords);
  return Array.from(freq.entries())
    .filter(([token, count]) => count >= 2 && !seedSet.has(token))
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_CANDIDATES)
    .map(([token]) => token);
}

module.exports = { mineCandidates };
