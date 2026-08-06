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

router.get('/trends', (req, res) => {
  const { category } = req.query;
  if (!category || !categories.some((c) => c.id === category)) {
    return res.status(400).json({ error: '유효한 category 파라미터가 필요합니다.' });
  }

  const latest = selectLatestTrends.get(category);
  if (!latest) {
    return res.json({ snapshotAt: null, trends: [] });
  }

  const rows = selectTrendsAtSnapshot.all(category, latest.snapshot_at);
  const trends = rows.map((r) => ({
    keyword: r.keyword,
    articleCount: r.article_count,
    spikeScore: Number(r.spike_score.toFixed(2)),
    blogCount: r.blog_count === null || r.blog_count === undefined ? null : Number(r.blog_count),
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
