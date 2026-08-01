const db = require('../db');
const categories = require('../config/categories');
const { getPrimaryEntity, pickEventWord, buildDisplayKeyword } = require('./keywordExtractor');
const { notifyNewTrends } = require('./discordNotifier');

const LOOKBACK_MIN = 6 * 60; // 트렌드 계산에 사용할 전체 관찰 구간
const RECENT_WINDOW_MIN = 60; // "지금 뜨는"으로 볼 최근 구간
const MIN_ARTICLES = 3; // 최소 이 개수 이상 기사가 모여야 트렌드 후보
const TOP_K = 8; // 카테고리별 저장할 트렌드 개수
const SAME_STORY_OVERLAP = 0.5; // 두 키워드가 다루는 기사 중 이 비율 이상 겹치면 같은 이슈로 간주해 하나만 남김

// 두 키워드가 사실상 같은 기사 묶음(=같은 이슈)을 가리키는지 확인.
// 예: "글렌", "오토바이", "사고로"가 전부 같은 기사들에서 나온 단어라면 하나로 합쳐야 함.
function overlapRatio(setA, setB) {
  const [small, big] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
  let shared = 0;
  for (const link of small) {
    if (big.has(link)) shared += 1;
  }
  return shared / small.size;
}

const selectArticles = db.prepare(`
  SELECT title, link, pub_date, extracted_keywords
  FROM articles
  WHERE category = ? AND pub_date >= ?
`);

const insertSnapshot = db.prepare(`
  INSERT INTO trend_snapshots
    (category, keyword, article_count, spike_score, sample_titles, sample_links, first_seen_at, latest_article_at, snapshot_at)
  VALUES (@category, @keyword, @articleCount, @spikeScore, @sampleTitles, @sampleLinks, @firstSeenAt, @latestArticleAt, @snapshotAt)
`);

const deleteOldSnapshots = db.prepare(`DELETE FROM trend_snapshots WHERE category = ? AND snapshot_at < ?`);

const upsertSnapshotRun = db.prepare(`
  INSERT INTO category_snapshot_runs (category, last_run_at) VALUES (?, ?)
  ON CONFLICT(category) DO UPDATE SET last_run_at = excluded.last_run_at
`);

// 스파이크 판단(6h/60min)과 별개로, "이 주어가 실제로 언제 처음 등장했는지"는
// 시간 하한 없이 전체 기록에서 찾는다 — pub_date는 네이버가 준 실제 발행 시각이라 이미 정확하고,
// extracted_keywords는 JSON.stringify(토큰배열)로 저장돼 있어 LIKE '%"entity"%'로 정확히 매칭된다.
const selectEarliestForEntity = db.prepare(`
  SELECT MIN(pub_date) as earliest
  FROM articles
  WHERE category = ? AND extracted_keywords LIKE ?
`);

// 두 버킷의 기사들이 (entity 제외) 공통 단어를 하나라도 공유하는지 확인.
// 예: "야노" 버킷과 "야노시호" 버킷이 둘 다 "추성훈"/"이혼"을 언급한다면 같은 사건을 다루는 것.
function sharesNonEntityToken(articlesA, entityA, articlesB, entityB) {
  const tokensA = new Set();
  for (const a of articlesA) {
    for (const kw of a._keywords) if (kw !== entityA) tokensA.add(kw);
  }
  for (const b of articlesB) {
    for (const kw of b._keywords) {
      if (kw !== entityB && tokensA.has(kw)) return true;
    }
  }
  return false;
}

// "야노"/"야노시호"처럼 같은 인물이 띄어쓰기 차이 등으로 서로 다른 entity로 쪼개지는 걸 합친다.
// 조건: (1) 한쪽 이름이 다른 쪽의 접두사이고, (2) 두 버킷이 entity 아닌 공통 단어를 공유해야 함
// — 흔한 성씨 2글자만 우연히 겹치는 서로 다른 인물(예: "김준호"/"김준수")을 잘못 합치는 걸 막는 안전장치.
// 반환값의 key는 가장 긴(완전한) 이름 — 병합된 버킷의 대표 이름이자 카드 라벨의 기준이 된다.
function mergeAliasBuckets(byEntity) {
  const names = [...byEntity.keys()].sort((a, b) => b.length - a.length);
  const merged = new Map(); // canonicalName -> { articles, aliases: Set }

  for (const name of names) {
    const articles = byEntity.get(name);
    let target = null;
    for (const [existingName, bucket] of merged) {
      const isPrefixPair = existingName.startsWith(name) || name.startsWith(existingName);
      if (isPrefixPair && sharesNonEntityToken(bucket.articles, existingName, articles, name)) {
        target = existingName;
        break;
      }
    }
    if (target) {
      const bucket = merged.get(target);
      bucket.articles.push(...articles);
      bucket.aliases.add(name);
    } else {
      merged.set(name, { articles: [...articles], aliases: new Set([name]) });
    }
  }
  return merged;
}

function computeCategory(category) {
  const now = Date.now();
  const lookbackSince = new Date(now - LOOKBACK_MIN * 60 * 1000).toISOString();
  const recentSince = new Date(now - RECENT_WINDOW_MIN * 60 * 1000).toISOString();

  const rows = selectArticles.all(category.id, lookbackSince);

  // 토큰마다가 아니라 "주어(entity)"마다 버킷을 만든다 — 기사 1건당 버킷 1개.
  // 이렇게 하면 표현이 달라진 후속 기사도 같은 인물이면 같은 버킷(=같은 카드)에 계속 쌓인다.
  const byEntity = new Map();
  for (const row of rows) {
    let keywords;
    try {
      keywords = JSON.parse(row.extracted_keywords);
    } catch {
      continue;
    }
    const entity = getPrimaryEntity(keywords);
    if (!entity) continue;
    if (!byEntity.has(entity)) byEntity.set(entity, []);
    byEntity.get(entity).push({ ...row, _keywords: keywords });
  }

  const mergedEntities = mergeAliasBuckets(byEntity);

  const baselineMinutes = LOOKBACK_MIN - RECENT_WINDOW_MIN;
  const results = [];

  for (const [entity, { articles, aliases }] of mergedEntities) {
    if (articles.length < MIN_ARTICLES) continue;

    const recent = articles.filter((a) => a.pub_date >= recentSince);
    const baseline = articles.length - recent.length;
    if (recent.length === 0) continue;

    const baselineAvgPerRecentWindow = baseline * (RECENT_WINDOW_MIN / baselineMinutes);
    const spikeScore = recent.length / (baselineAvgPerRecentWindow + 1);

    const sorted = [...articles].sort((a, b) => (a.pub_date < b.pub_date ? 1 : -1));

    // firstSeenAt: 6시간으로 잘린 articles가 아니라 전체 기록에서 이 entity(별칭 포함)의
    // 진짜 최초 시점을 조회 — "야노시호"로 병합됐어도 과거 기사는 "야노"로만 저장돼 있을 수 있어
    // 병합에 쓰인 별칭 이름들을 전부 조회해서 그중 가장 이른 시각을 쓴다.
    let firstSeenAt = null;
    for (const alias of aliases) {
      const earliestRow = selectEarliestForEntity.get(category.id, `%"${alias}"%`);
      if (earliestRow && earliestRow.earliest && (!firstSeenAt || earliestRow.earliest < firstSeenAt)) {
        firstSeenAt = earliestRow.earliest;
      }
    }
    if (!firstSeenAt) {
      firstSeenAt = articles.reduce((min, a) => (a.pub_date < min ? a.pub_date : min), articles[0].pub_date);
    }

    // 카드 라벨: entity + (화이트리스트 사건어, 없으면 다음으로 자주 나온 보조 토큰)
    const tokenOccurrences = [];
    for (const a of articles) {
      for (const kw of a._keywords) if (kw !== entity) tokenOccurrences.push(kw);
    }
    const eventWord = pickEventWord(entity, tokenOccurrences);
    const displayKeyword = buildDisplayKeyword(entity, eventWord);

    results.push({
      category: category.id,
      keyword: displayKeyword,
      articleCount: articles.length,
      spikeScore,
      sampleTitles: JSON.stringify(sorted.slice(0, 3).map((a) => a.title)),
      sampleLinks: JSON.stringify(sorted.slice(0, 3).map((a) => a.link)),
      firstSeenAt,
      latestArticleAt: sorted[0].pub_date,
      snapshotAt: new Date(now).toISOString(),
      _linkSet: new Set(articles.map((a) => a.link)),
    });
  }

  results.sort((a, b) => b.spikeScore - a.spikeScore || b.articleCount - a.articleCount);

  // 점수 높은 순으로 훑으면서, 이미 뽑아둔 이슈와 기사 묶음이 많이 겹치면 같은 이슈로 보고 건너뜀
  const diversified = [];
  for (const candidate of results) {
    const isSameStoryAsExisting = diversified.some(
      (picked) => overlapRatio(picked._linkSet, candidate._linkSet) >= SAME_STORY_OVERLAP
    );
    if (isSameStoryAsExisting) continue;
    diversified.push(candidate);
    if (diversified.length >= TOP_K) break;
  }

  return diversified.map(({ _linkSet, ...rest }) => rest);
}

async function computeAll() {
  const snapshotAt = new Date().toISOString();
  const summary = {};

  const insertMany = db.transaction((allResults) => {
    for (const result of allResults) {
      insertSnapshot.run(result);
    }
  });

  for (const category of categories) {
    const results = computeCategory(category);
    insertMany(results);
    summary[category.id] = results.length;
    // 결과가 0건이어도 "방금 계산했다"는 사실 자체는 기록 — API가 낡은 스냅샷을
    // 최신인 것처럼 잘못 돌려주는 걸 막기 위함
    upsertSnapshotRun.run(category.id, snapshotAt);
    // 카테고리끼리도 순차 실행 — 디스코드 웹훅 속도 제한(429) 방지 (discordNotifier 내부에서 에러 처리)
    await notifyNewTrends(category, results);
    // 카테고리마다 최근 스냅샷 몇 개만 남기고 이전 기록은 정리 (DB 무한 증가 방지)
    deleteOldSnapshots.run(category.id, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  }

  return { summary, snapshotAt };
}

module.exports = { computeAll };
