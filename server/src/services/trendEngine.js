const db = require('../db');
const categories = require('../config/categories');

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

function computeCategory(category) {
  const now = Date.now();
  const lookbackSince = new Date(now - LOOKBACK_MIN * 60 * 1000).toISOString();
  const recentSince = new Date(now - RECENT_WINDOW_MIN * 60 * 1000).toISOString();

  const rows = selectArticles.all(category.id, lookbackSince);

  const byKeyword = new Map();
  for (const row of rows) {
    let keywords;
    try {
      keywords = JSON.parse(row.extracted_keywords);
    } catch {
      continue;
    }
    for (const kw of keywords) {
      if (!byKeyword.has(kw)) byKeyword.set(kw, []);
      byKeyword.get(kw).push(row);
    }
  }

  const baselineMinutes = LOOKBACK_MIN - RECENT_WINDOW_MIN;
  const results = [];

  for (const [keyword, articles] of byKeyword) {
    if (articles.length < MIN_ARTICLES) continue;

    const recent = articles.filter((a) => a.pub_date >= recentSince);
    const baseline = articles.length - recent.length;
    if (recent.length === 0) continue;

    const baselineAvgPerRecentWindow = baseline * (RECENT_WINDOW_MIN / baselineMinutes);
    const spikeScore = recent.length / (baselineAvgPerRecentWindow + 1);

    const sorted = [...articles].sort((a, b) => (a.pub_date < b.pub_date ? 1 : -1));
    const firstSeenAt = articles.reduce((min, a) => (a.pub_date < min ? a.pub_date : min), articles[0].pub_date);

    results.push({
      category: category.id,
      keyword,
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

function computeAll() {
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
    // 카테고리마다 최근 스냅샷 몇 개만 남기고 이전 기록은 정리 (DB 무한 증가 방지)
    deleteOldSnapshots.run(category.id, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  }

  return { summary, snapshotAt };
}

module.exports = { computeAll };
