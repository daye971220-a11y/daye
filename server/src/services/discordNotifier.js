const axios = require('axios');
const db = require('../db');

const NOTIFY_MIN_ARTICLES = 5; // 카드 노출 기준(3건)보다 확실히 높여서 진짜 뜨거운 것만 알림
const RENOTIFY_ARTICLE_INCREASE = 3; // 마지막 알림 이후 기사 수가 이만큼 더 늘면 재알림
const DISCORD_REQUEST_GAP_MS = 700; // 디스코드 웹훅 속도 제한(429) 방지용 — naverClient의 REQUEST_GAP_MS와 같은 이유
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const selectNotified = db.prepare(`
  SELECT last_notified_article_count FROM notified_trends WHERE category = ? AND keyword = ?
`);
const upsertNotified = db.prepare(`
  INSERT INTO notified_trends (category, keyword, last_notified_article_count, last_notified_at)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(category, keyword) DO UPDATE SET
    last_notified_article_count = excluded.last_notified_article_count,
    last_notified_at = excluded.last_notified_at
`);

async function sendDiscordMessage(webhookUrl, category, trend, isNew) {
  const sampleTitles = JSON.parse(trend.sampleTitles);
  const sampleLinks = JSON.parse(trend.sampleLinks);
  const badge = isNew ? '🆕 새 이슈' : '📈 더 커짐';

  await axios.post(webhookUrl, {
    embeds: [{
      title: `${category.emoji} ${category.label} · ${trend.keyword}`,
      description: `${badge} · 기사 ${trend.articleCount}건 몰림\n\n` +
        sampleTitles.slice(0, 3).map((t, i) => `• [${t}](${sampleLinks[i]})`).join('\n'),
      color: 0xff6b35,
    }],
  }, { timeout: 8000 });
}

// trends: trendEngine.computeCategory()가 반환한 해당 카테고리의 최신 카드 배열
async function notifyNewTrends(category, trends) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return; // 설정 안 했으면 조용히 스킵 (기존 사용자 영향 없음)

  for (const trend of trends) {
    if (trend.articleCount < NOTIFY_MIN_ARTICLES) continue;

    const prev = selectNotified.get(category.id, trend.keyword);
    const isNew = !prev;
    const grewEnough = prev && trend.articleCount >= prev.last_notified_article_count + RENOTIFY_ARTICLE_INCREASE;
    if (!isNew && !grewEnough) continue;

    try {
      await sendDiscordMessage(webhookUrl, category, trend, isNew);
      upsertNotified.run(category.id, trend.keyword, trend.articleCount, new Date().toISOString());
    } catch (err) {
      console.error(`[discordNotifier] "${trend.keyword}" 알림 실패:`, err.message);
    }
    await sleep(DISCORD_REQUEST_GAP_MS);
  }
}

module.exports = { notifyNewTrends };
