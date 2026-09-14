const express = require('express');
const db = require('../db');
const categories = require('../config/categories');
const keywordResearch = require('../services/keywordResearch');
const { buildWorkbook } = require('../services/keywordExcel');

const router = express.Router();

router.get('/categories', (req, res) => {
  res.json(categories.map(({ id, label, emoji }) => ({ id, label, emoji })));
});

const selectLatestTrends = db.prepare(`
  SELECT * FROM trend_snapshots
  WHERE category = ?
  ORDER BY snapshot_at DESC
  LIMIT 1
`);

const selectTrendsAtSnapshot = db.prepare(`
  SELECT * FROM trend_snapshots
  WHERE category = ? AND snapshot_at = ?
  ORDER BY spike_score DESC
`);

const selectLastRun = db.prepare(`SELECT last_run_at FROM category_snapshot_runs WHERE category = ?`);

router.get('/trends', (req, res) => {
  const { category } = req.query;
  if (!category || !categories.some((c) => c.id === category)) {
    return res.status(400).json({ error: '유효한 category 파라미터가 필요합니다.' });
  }

  const latest = selectLatestTrends.get(category);
  const lastRun = selectLastRun.get(category);

  // 가장 최근 계산 사이클이 트렌드 0건을 냈다면(트렌드 카드가 없어서 trend_snapshots엔
  // 행이 안 남음) latest.snapshot_at은 그보다 더 예전 사이클을 가리키게 된다 — 그럴 땐
  // 낡은 스냅샷을 보여주지 말고 "지금은 감지된 이슈 없음"으로 응답해야 함.
  const isStale = latest && lastRun && lastRun.last_run_at > latest.snapshot_at;
  if (!latest || isStale) {
    return res.json({ snapshotAt: lastRun ? lastRun.last_run_at : null, trends: [] });
  }

  const rows = selectTrendsAtSnapshot.all(category, latest.snapshot_at);
  const trends = rows.map((r) => ({
    keyword: r.keyword,
    articleCount: r.article_count,
    spikeScore: Number(r.spike_score.toFixed(2)),
    sampleTitles: JSON.parse(r.sample_titles),
    sampleLinks: JSON.parse(r.sample_links),
    firstSeenAt: r.first_seen_at,
    latestArticleAt: r.latest_article_at,
  }));

  res.json({ snapshotAt: latest.snapshot_at, trends });
});

const selectFeed = db.prepare(`
  SELECT title, link, pub_date, matched_keyword
  FROM articles
  WHERE category = ?
  ORDER BY pub_date DESC
  LIMIT 50
`);

router.get('/feed', (req, res) => {
  const { category } = req.query;
  if (!category || !categories.some((c) => c.id === category)) {
    return res.status(400).json({ error: '유효한 category 파라미터가 필요합니다.' });
  }

  const rows = selectFeed.all(category);
  res.json(
    rows.map((r) => ({
      title: r.title,
      link: r.link,
      pubDate: r.pub_date,
      matchedKeyword: r.matched_keyword,
    }))
  );
});

// --- 키워드 리서치 (여행/경제/연예 핵심 키워드 TOP100) ---

router.get('/keyword-topics', (req, res) => {
  res.json(keywordResearch.topics.map(({ id, label, emoji }) => ({ id, label, emoji })));
});

function findTopic(topicId) {
  return keywordResearch.topics.find((t) => t.id === topicId);
}

router.get('/keywords/:topic', (req, res) => {
  const topic = findTopic(req.params.topic);
  if (!topic) return res.status(400).json({ error: '유효하지 않은 토픽입니다.' });

  const data = keywordResearch.getLatest(topic.id);
  res.json(data);
});

// 새로고침은 검색광고/데이터랩 API를 여러 번 호출하는 무거운 작업이라, 토픽당 동시에
// 하나만 돌게 막는다 (버튼 연타로 API를 스팸하지 않도록).
const refreshingTopics = new Set();

router.post('/keywords/:topic/refresh', async (req, res) => {
  const topic = findTopic(req.params.topic);
  if (!topic) return res.status(400).json({ error: '유효하지 않은 토픽입니다.' });

  if (refreshingTopics.has(topic.id)) {
    return res.status(429).json({ error: '이미 새로고침 중입니다. 잠시 후 다시 시도해주세요.' });
  }

  refreshingTopics.add(topic.id);
  try {
    await keywordResearch.refreshTopic(topic.id);
    res.json(keywordResearch.getLatest(topic.id));
  } catch (err) {
    res.status(502).json({ error: err.message });
  } finally {
    refreshingTopics.delete(topic.id);
  }
});

router.get('/keywords/:topic/export.xlsx', async (req, res) => {
  const topic = findTopic(req.params.topic);
  if (!topic) return res.status(400).json({ error: '유효하지 않은 토픽입니다.' });

  const data = keywordResearch.getLatest(topic.id);
  if (data.rows.length === 0) {
    return res.status(404).json({ error: '내보낼 데이터가 없습니다. 먼저 새로고침 해주세요.' });
  }

  const wb = buildWorkbook(topic.label, data);
  const filename = encodeURIComponent(`${topic.label}_핵심키워드_TOP${data.rows.length}.xlsx`);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
  await wb.xlsx.write(res);
  res.end();
});

module.exports = router;
