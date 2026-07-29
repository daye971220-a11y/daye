const db = require('../db');
const categories = require('../config/categories');
const { searchNews } = require('./naverClient');
const { extractKeywords } = require('./keywordExtractor');

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO articles
    (link, title, description, pub_date, category, matched_keyword, extracted_keywords, first_seen_at)
  VALUES (@link, @title, @description, @pubDate, @category, @matchedKeyword, @extractedKeywords, @firstSeenAt)
`);

const REQUEST_GAP_MS = 300; // 네이버 API 초당 요청 제한(429)에 걸리지 않도록 호출 사이 간격을 둠
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function collectCategory(category) {
  let inserted = 0;
  for (const seed of category.seedKeywords) {
    const articles = await searchNews(seed);
    await sleep(REQUEST_GAP_MS);
    const now = new Date().toISOString();

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        const keywords = extractKeywords(item.title);
        const result = insertStmt.run({
          link: item.link,
          title: item.title,
          description: item.description,
          pubDate: item.pubDate,
          category: category.id,
          matchedKeyword: seed,
          extractedKeywords: JSON.stringify(keywords),
          firstSeenAt: now,
        });
        if (result.changes > 0) inserted += 1;
      }
    });
    insertMany(articles);
  }
  return inserted;
}

async function collectAll() {
  const summary = {};
  for (const category of categories) {
    summary[category.id] = await collectCategory(category);
  }
  return summary;
}

module.exports = { collectAll, collectCategory };
