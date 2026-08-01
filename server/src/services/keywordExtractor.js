// 형태소 분석기 없이 기사 제목에서 "반복 등장하는 핵심어"를 뽑아내기 위한 가벼운 토큰화.
// 정확한 명사 추출은 아니지만, 같은 이슈를 다루는 기사들의 제목엔 같은 고유명사/단어가
// 반복 등장하므로 빈도 기반 클러스터링에는 충분하다.

const STOPWORDS = new Set([
  '기자', '뉴스', '단독', '속보', '영상', '사진', '오늘', '내일', '어제',
  '이번', '올해', '작년', '내년', '결국', '한편', '이후', '전격', '공식',
  '위해', '통해', '대해', '관련', '동안', '가운데', '때문', '이라며', '라며',
  '있다', '했다', '한다', '된다', '있는', '없는', '것으로', '것이다', '등',
  '및', '그리고', '하지만', '그러나', '에서', '으로', '에게', '까지', '부터',
  // 특정 이슈를 가리키지 않는 범용 명사 — 이 단어들이 카드 라벨(entity/event word)에
  // 단독으로 들어가면 "근황"처럼 아무 정보도 없는 트렌드가 되므로 아예 후보에서 제외한다.
  '근황', '소감', '공개', '출연', '포착', '눈길', '화제', '전해', '깜짝',
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

// [포토], [S포토], [NC포토], [ET포토], [포토S] 등 언론사 포토 캡션 태그 —
// 브래킷이 사라진 뒤에도 "포토"만 단독/영문 접두·접미로 붙은 토큰은 항상 이 태그이지
// 실제 인물/작품명이 아니므로 제외한다(영화/드라마/패션 카테고리는 포토 캡션 기사 비중이
// 높아서, 이 태그가 첫 토큰으로 뽑히면 진짜 주어 대신 "S포토" 같은 게 entity가 되어버림).
const PHOTO_TAG = /^[A-Za-z]{0,4}포토[A-Za-z]{0,4}$/;
// [TD영상], [TOP영상]처럼 같은 패턴의 영상 캡션 태그도 동일한 이유로 제외한다.
const VIDEO_TAG = /^[A-Za-z0-9]{0,4}영상[A-Za-z0-9]{0,4}$/;

function extractKeywords(title) {
  const cleaned = title
    .replace(/["'“”‘’()\[\]<>『』「」…!?:]/g, ' ')
    .replace(/[.,]/g, ' ');

  const tokens = cleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map(stripParticle)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t) && !PHOTO_TAG.test(t) && !VIDEO_TAG.test(t) && !/^\d+$/.test(t));

  return Array.from(new Set(tokens));
}

// 카드 라벨용 "사건/행위" 화이트리스트 — entity 뒤에 붙여 "문근영 결혼" 같은 라벨을 만든다.
// 화이트리스트에 없으면 그다음으로 자주 나온 보조 토큰으로 대체한다.
const EVENT_WORDS = new Set([
  '결혼', '이혼', '열애', '스캔들', '사고', '사망', '은퇴', '컴백',
  '우승', '부상', '임신', '출산', '파경', '구속', '사퇴',
]);

// extractKeywords()의 결과는 제목에 등장한 순서 그대로다(Set은 삽입 순서 보존).
// 한국어 뉴스 제목은 관행적으로 "누가, ..." 형태로 시작하므로, 첫 생존 토큰을 주어(entity)로 삼는다.
function getPrimaryEntity(keywords) {
  return keywords.length > 0 ? keywords[0] : null;
}

// entity로 묶인 모든 기사의 (entity 제외) 토큰들 중에서 대표 "사건어"를 고른다.
// tokenOccurrences: 빈도 계산을 위해 중복 포함한 토큰 배열.
function pickEventWord(entity, tokenOccurrences) {
  const freq = new Map();
  for (const kw of tokenOccurrences) {
    if (kw === entity) continue;
    freq.set(kw, (freq.get(kw) || 0) + 1);
  }

  let best = null;
  for (const [kw, count] of freq) {
    if (EVENT_WORDS.has(kw) && (!best || count > best.count)) best = { kw, count };
  }
  if (best) return best.kw;

  let fallback = null;
  for (const [kw, count] of freq) {
    if (!fallback || count > fallback.count) fallback = { kw, count };
  }
  return fallback ? fallback.kw : null;
}

function buildDisplayKeyword(entity, eventWord) {
  return eventWord ? `${entity} ${eventWord}` : entity;
}

module.exports = { extractKeywords, EVENT_WORDS, getPrimaryEntity, pickEventWord, buildDisplayKeyword };
