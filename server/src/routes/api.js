const express = require('express');
const db = require('../db');
const categories = require('../config/categories');

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

module.exports = router;
