// 형태소 분석기 없이 기사 제목에서 "반복 등장하는 핵심어"를 뽑아내기 위한 가벼운 토큰화.
// 정확한 명사 추출은 아니지만, 같은 이슈를 다루는 기사들의 제목엔 같은 고유명사/단어가
// 반복 등장하므로 빈도 기반 클러스터링에는 충분하다.

const STOPWORDS = new Set([
  '기자', '뉴스', '단독', '속보', '영상', '사진', '오늘', '내일', '어제',
  '이번', '올해', '작년', '내년', '결국', '한편', '이후', '전격', '공식',
  '위해', '통해', '대해', '관련', '동안', '가운데', '때문', '이라며', '라며',
  '있다', '했다', '한다', '된다', '있는', '없는', '것으로', '것이다', '등',
  '및', '그리고', '하지만', '그러나', '에서', '으로', '에게', '까지', '부터',
]);

const PARTICLE_SUFFIXES = ['에서의', '이라는', '했다는', '한다는', '에게', '으로', '에서', '에도', '까지', '부터', '이라', '라는', '은', '는', '이', '가', '을', '를', '도', '만', '와', '과'];

function stripParticle(word) {
  for (const suffix of PARTICLE_SUFFIXES) {
    if (word.length > suffix.length + 1 && word.endsWith(suffix)) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

function extractKeywords(title) {
  const cleaned = title
    .replace(/["'“”‘’()\[\]<>『』「」…!?]/g, ' ')
    .replace(/[.,]/g, ' ');

  const tokens = cleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map(stripParticle)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t) && !/^\d+$/.test(t));

  return Array.from(new Set(tokens));
}

module.exports = { extractKeywords };
