// "키워드 리서치" 탭의 핵심 오케스트레이터.
// 흐름: (시드 키워드 + 뉴스 헤드라인 후보) → 데이터랩으로 급상승/계절성 판정
//       → 검색광고 키워드도구로 PC/모바일 검색량·경쟁도 조회 → 파생 컬럼 계산 → DB 저장.
//
// 검색광고 API 키가 없으면(NAVER_AD_*) 이 기능 전체가 에러를 던진다 — 사이트의 다른
// 기능(지금 뜨는 이슈)에는 영향 없음. keywordResearch_runs.error에 메시지를 남겨서
// 프론트가 "API 키 설정 필요" 안내를 보여줄 수 있게 한다.
const db = require('../db');
const topics = require('../config/keywordTopics');
const searchAdClient = require('./searchAdClient');
const datalabClient = require('./datalabClient');
const { mineCandidates } = require('./keywordCandidates');

const REQUEST_GAP_MS = 300;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TOP_K = 100;
const MAX_SEEDS_FOR_DATALAB = 30; // 데이터랩 호출 수를 bound하기 위한 상한 (5개씩 묶어 청크당 2콜)

function quantile(sortedNums, q) {
  if (sortedNums.length === 0) return 0;
  const idx = Math.min(sortedNums.length - 1, Math.floor(sortedNums.length * q));
  return sortedNums[idx];
}

// 확장된 연관 키워드(relKeyword)가 어떤 시드에서 파생됐는지 API가 알려주지 않으므로,
// 문자열 포함 관계로 가장 가까운 시드를 찾아 급상승/계절성 판정을 물려받는다.
// 완벽하지 않은 근사치 — 정확히 매칭되는 시드가 없으면 기본값(상시형/급상승 아님)을 쓴다.
function findMatchingSeedInfo(keyword, seedInfoMap) {
  for (const [seed, info] of seedInfoMap) {
    if (keyword.includes(seed) || seed.includes(keyword)) return info;
  }
  return null;
}

function pickTitle(topic, keyword, idx) {
  const templates = topic.titleTemplates;
  return templates[idx % templates.length](keyword);
}

async function collectSeeds(topic) {
  const extra = await mineCandidates(topic);
  return Array.from(new Set([...topic.seedKeywords, ...extra]));
}

async function fetchStats(seeds) {
  const merged = new Map(); // keyword -> stats
  for (let i = 0; i < seeds.length; i += 5) {
    const chunk = seeds.slice(i, i + 5);
    const items = await searchAdClient.getKeywordStats(chunk);
    await sleep(REQUEST_GAP_MS);
    for (const item of items) {
      if (!merged.has(item.keyword)) merged.set(item.keyword, item);
    }
  }
  return merged;
}

async function refreshTopic(topicId) {
  const topic = topics.find((t) => t.id === topicId);
  if (!topic) throw new Error(`알 수 없는 토픽: ${topicId}`);

  if (!searchAdClient.isConfigured()) {
    const err = 'NAVER_AD_API_KEY / NAVER_AD_SECRET_KEY / NAVER_AD_CUSTOMER_ID 미설정';
    recordRunError(topicId, err);
    throw new Error(err);
  }

  const seeds = await collectSeeds(topic);
  const seedInfoMap = await datalabClient.classifySeeds(seeds.slice(0, MAX_SEEDS_FOR_DATALAB));
  const statsMap = await fetchStats(seeds);

  const rows = [];
  let idx = 0;
  for (const [keyword, stats] of statsMap) {
    const totalQc = stats.pcQc + stats.mobileQc;
    if (totalQc <= 0) continue;

    const seedInfo = findMatchingSeedInfo(keyword, seedInfoMap);
    rows.push({
      keyword,
      pcQc: stats.pcQc,
      mobileQc: stats.mobileQc,
      totalQc,
      mobileRatio: Number(((stats.mobileQc / totalQc) * 100).toFixed(1)),
      seasonType: seedInfo?.seasonal ? '계절형' : '상시형',
      rising: Boolean(seedInfo?.rising),
      compIdx: stats.compIdx,
      recommendedTitle: pickTitle(topic, keyword, idx++),
    });
  }

  rows.sort((a, b) => b.totalQc - a.totalQc);
  const top = rows.slice(0, TOP_K);

  const totalQcSorted = top.map((r) => r.totalQc).sort((a, b) => a - b);
  const p50 = quantile(totalQcSorted, 0.5);
  const p80 = quantile(totalQcSorted, 0.8);

  const withPriority = top.map((r) => {
    let priority;
    if (r.rising) {
      priority = '우선(급상승)';
    } else if (r.totalQc >= p80 && r.compIdx !== '높음') {
      priority = '우선';
    } else if (r.totalQc >= p50) {
      priority = '확장';
    } else {
      priority = '보류';
    }
    return { ...r, priority };
  });

  saveTopic(topicId, withPriority, rows.length);
  return withPriority;
}

function recordRunError(topicId, error) {
  db.prepare(
    `INSERT INTO keyword_research_runs (topic, last_run_at, candidate_count, error)
     VALUES (@topic, @lastRunAt, 0, @error)
     ON CONFLICT(topic) DO UPDATE SET last_run_at = @lastRunAt, error = @error`
  ).run({ topic: topicId, lastRunAt: new Date().toISOString(), error });
}

const saveTopic = db.transaction((topicId, rows, candidateCount) => {
  db.prepare('DELETE FROM keyword_research WHERE topic = ?').run(topicId);

  const insert = db.prepare(`
    INSERT INTO keyword_research
      (topic, rank, keyword, pc_qc, mobile_qc, total_qc, mobile_ratio, season_type, priority, comp_idx, recommended_title, computed_at)
    VALUES (@topic, @rank, @keyword, @pcQc, @mobileQc, @totalQc, @mobileRatio, @seasonType, @priority, @compIdx, @recommendedTitle, @computedAt)
  `);

  const computedAt = new Date().toISOString();
  rows.forEach((r, i) => {
    insert.run({
      topic: topicId,
      rank: i + 1,
      keyword: r.keyword,
      pcQc: r.pcQc,
      mobileQc: r.mobileQc,
      totalQc: r.totalQc,
      mobileRatio: r.mobileRatio,
      seasonType: r.seasonType,
      priority: r.priority,
      compIdx: r.compIdx,
      recommendedTitle: r.recommendedTitle,
      computedAt,
    });
  });

  db.prepare(
    `INSERT INTO keyword_research_runs (topic, last_run_at, candidate_count, error)
     VALUES (@topic, @lastRunAt, @candidateCount, NULL)
     ON CONFLICT(topic) DO UPDATE SET last_run_at = @lastRunAt, candidate_count = @candidateCount, error = NULL`
  ).run({ topic: topicId, lastRunAt: computedAt, candidateCount: candidateCount });
});

const selectRows = db.prepare(`
  SELECT * FROM keyword_research WHERE topic = ? ORDER BY rank ASC
`);
const selectRun = db.prepare(`SELECT * FROM keyword_research_runs WHERE topic = ?`);

function getLatest(topicId) {
  const run = selectRun.get(topicId);
  const rows = selectRows.all(topicId).map((r) => ({
    rank: r.rank,
    keyword: r.keyword,
    pcQc: r.pc_qc,
    mobileQc: r.mobile_qc,
    totalQc: r.total_qc,
    mobileRatio: r.mobile_ratio,
    seasonType: r.season_type,
    priority: r.priority,
    compIdx: r.comp_idx,
    recommendedTitle: r.recommended_title,
  }));

  return {
    lastRunAt: run?.last_run_at || null,
    error: run?.error || null,
    rows,
  };
}

module.exports = { refreshTopic, getLatest, topics };
