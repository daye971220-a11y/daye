const db = require('../db');
const categories = require('../config/categories');
const { getBlogCount } = require('./naverClient');

const LOOKBACK_MIN = 6 * 60; // 트렌드 계산에 사용할 전체 관찰 구간
const RECENT_WINDOW_MIN = 60; // "지금 뜨는"으로 볼 최근 구간
const MIN_ARTICLES = 3; // 최소 이 개수 이상 기사가 모여야 트렌드 후보
const TOP_K = 8; // 카테고리별 저장할 트렌드 개수
const SAME_STORY_OVERLAP = 0.5; // 두 키워드가 다루는 기사 중 이 비율 이상 겹치면 같은 이슈로 간주해 하나만 남김

const LABEL_EXTRA_WORDS = 2; // 대표 단어(anchor) 뒤에 덧붙일 연관 단어 최대 개수. "황정민" -> "황정민 불륜"
const LABEL_COOCCUR_RATIO = 0.4; // 연관 단어로 인정하려면 같은 이슈 기사 중 이 비율 이상에 등장해야 함

const BLOG_MAX_COUNT = 10; // 이 개수 미만으로 블로그에 아직 안 다뤄진 이슈만 소개 (블로그 소재로서의 메리트 기준)
const BLOG_REQUEST_GAP_MS = 250; // 네이버 블로그 검색 API 호출 간격 (429 방지)

const STORY_RETENTION_DAYS = 30; // "이미 소개한 이슈" 기록 보관 기간

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 날짜는 서버 로케일이 아니라 한국 시간(KST) 기준으로 비교해야
// "어제 소개한 이슈를 오늘 또 새 이슈로 올리는" 실수를 막을 수 있다.
const kstDateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' });
function kstDateString(isoString) {
  return kstDateFormatter.format(new Date(isoString));
}

// 두 키워드가 사실상 같은 기사 묶음(=같은 이슈)을 가리키는지 확인.
// 예: "글렌", "핸사드", "사고로"가 전부 같은 기사들에서 나온 단어라면 하나로 합쳐야 함.
function overlapRatio(setA, setB) {
  const [small, big] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
  let shared = 0;
  for (const link of small) {
    if (big.has(link)) shared += 1;
  }
  return shared / small.size;
}

// 이슈 클러스터 안에서 anchor 단어와 자주 같이 등장하는 단어를 찾아 붙여서
// "황정민" 대신 "황정민 불륜"처럼 무슨 이슈인지 알 수 있는 라벨을 만든다.
// (형태소 분석기가 없어 항상 자연스러운 어순이 되는 건 아님)
function buildLabel(anchor, articles) {
  const freq = new Map();
  for (const article of articles) {
    let keywords;
    try {
      keywords = JSON.parse(article.extracted_keywords);
    } catch {
      continue;
    }
    for (const kw of keywords) {
      if (kw === anchor) continue;
      freq.set(kw, (freq.get(kw) || 0) + 1);
    }
  }

  const threshold = Math.max(2, Math.ceil(articles.length * LABEL_COOCCUR_RATIO));
  const extras = [...freq.entries()]
    .filter(([, count]) => count >= threshold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, LABEL_EXTRA_WORDS)
    .map(([kw]) => kw);

  return [anchor, ...extras].join(' ');
}

const selectArticles = db.prepare(`
  SELECT title, link, pub_date, extracted_keywords
  FROM articles
  WHERE category = ? AND pub_date >= ?
`);

const insertSnapshot = db.prepare(`
  INSERT INTO trend_snapshots
    (category, keyword, article_count, spike_score, blog_count, sample_titles, sample_links, first_seen_at, latest_article_at, snapshot_at)
  VALUES (@category, @keyword, @articleCount, @spikeScore, @blogCount, @sampleTitles, @sampleLinks, @firstSeenAt, @latestArticleAt, @snapshotAt)
`);

const deleteOldSnapshots = db.prepare(`DELETE FROM trend_snapshots WHERE category = ? AND snapshot_at < ?`);

const selectStory = db.prepare(`SELECT first_surfaced_at FROM surfaced_stories WHERE category = ? AND story_key = ?`);
const upsertStory = db.prepare(`
  INSERT INTO surfaced_stories (category, story_key, first_surfaced_at, last_surfaced_at)
  VALUES (@category, @storyKey, @now, @now)
  ON CONFLICT(category, story_key) DO UPDATE SET last_surfaced_at = @now
`);
const deleteOldStories = db.prepare(`DELETE FROM surfaced_stories WHERE last_surfaced_at < ?`);

// 오늘 이전에 이미 같은 라벨(story_key)로 소개한 적 있는지 확인.
// 같은 인물이라도 "황정민 불륜"과 "황정민 마약"은 story_key 자체가 다르므로 별개 이슈로 취급된다.
function isAlreadyCoveredBefore(category, storyKey, today) {
  const row = selectStory.get(category, storyKey);
  if (!row) return false;
  return kstDateString(row.first_surfaced_at) < today;
}

function markStorySurfaced(category, storyKey, now) {
  upsertStory.run({ category, storyKey, now });
}

async function computeCategory(category) {
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const today = kstDateString(nowIso);
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
  const candidates = [];

  for (const [keyword, articles] of byKeyword) {
    if (articles.length < MIN_ARTICLES) continue;

    const recent = articles.filter((a) => a.pub_date >= recentSince);
    const baseline = articles.length - recent.length;
    if (recent.length === 0) continue;

    const baselineAvgPerRecentWindow = baseline * (RECENT_WINDOW_MIN / baselineMinutes);
    const spikeScore = recent.length / (baselineAvgPerRecentWindow + 1);

    const sorted = [...articles].sort((a, b) => (a.pub_date < b.pub_date ? 1 : -1));
    const firstSeenAt = articles.reduce((min, a) => (a.pub_date < min ? a.pub_date : min), articles[0].pub_date);

    candidates.push({
      anchor: keyword,
      articles,
      articleCount: articles.length,
      spikeScore,
      sampleTitles: sorted.slice(0, 3).map((a) => a.title),
      sampleLinks: sorted.slice(0, 3).map((a) => a.link),
      firstSeenAt,
      latestArticleAt: sorted[0].pub_date,
      _linkSet: new Set(articles.map((a) => a.link)),
    });
  }

  candidates.sort((a, b) => b.spikeScore - a.spikeScore || b.articleCount - a.articleCount);

  const diversified = [];
  const pickedLinkSets = [];

  for (const candidate of candidates) {
    if (diversified.length >= TOP_K) break;

    // 이미 채택했거나 (사유 불문) 건너뛴 이슈와 기사 묶음이 많이 겹치면 같은 이슈이므로 스킵.
    // 스킵된 후보의 링크셋도 계속 등록해둬야, 같은 이슈가 다른 단어(예: "황정민" 대신 "불륜")를
    // anchor로 삼아 다시 후보로 올라와도 중복으로 걸러진다.
    const isSameStoryAsExisting = pickedLinkSets.some(
      (linkSet) => overlapRatio(linkSet, candidate._linkSet) >= SAME_STORY_OVERLAP
    );
    if (isSameStoryAsExisting) continue;

    const label = buildLabel(candidate.anchor, candidate.articles);
    pickedLinkSets.push(candidate._linkSet);

    // 어제 이전에 이미 소개한 이슈면, 오늘 기사가 더 붙었더라도 "오늘의 새 이슈"로 다시 올리지 않음
    if (isAlreadyCoveredBefore(category.id, label, today)) continue;

    let blogCount = null;
    try {
      blogCount = await getBlogCount(label);
    } catch {
      blogCount = null;
    }
    await sleep(BLOG_REQUEST_GAP_MS);

    // 이미 블로그 글이 많이 올라온 이슈는 지금 써봤자 메리트가 없으므로 제외 (확인 실패 시엔 통과시킴)
    if (blogCount !== null && blogCount >= BLOG_MAX_COUNT) continue;

    diversified.push({
      category: category.id,
      keyword: label,
      articleCount: candidate.articleCount,
      spikeScore: candidate.spikeScore,
      blogCount,
      sampleTitles: JSON.stringify(candidate.sampleTitles),
      sampleLinks: JSON.stringify(candidate.sampleLinks),
      firstSeenAt: candidate.firstSeenAt,
      latestArticleAt: candidate.latestArticleAt,
      snapshotAt: nowIso,
    });

    markStorySurfaced(category.id, label, nowIso);
  }

  return diversified;
}

async function computeAll() {
  const snapshotAt = new Date().toISOString();
  const summary = {};

  const insertMany = db.transaction((allResults) => {
    for (const result of allResults) {
      insertSnapshot.run(result);
    }
  });

  deleteOldStories.run(new Date(Date.now() - STORY_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString());

  for (const category of categories) {
    const results = await computeCategory(category);
    insertMany(results);
    summary[category.id] = results.length;
    // 카테고리마다 최근 스냅샷 몇 개만 남기고 이전 기록은 정리 (DB 무한 증가 방지)
    deleteOldSnapshots.run(category.id, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  }

  return { summary, snapshotAt };
}

module.exports = { computeAll };
