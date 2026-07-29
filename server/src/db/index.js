const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(path.join(dataDir, 'trend.db'));
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    pub_date TEXT NOT NULL,
    category TEXT NOT NULL,
    matched_keyword TEXT NOT NULL,
    extracted_keywords TEXT NOT NULL,
    first_seen_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
  CREATE INDEX IF NOT EXISTS idx_articles_pub_date ON articles(pub_date);

  CREATE TABLE IF NOT EXISTS trend_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    keyword TEXT NOT NULL,
    article_count INTEGER NOT NULL,
    spike_score REAL NOT NULL,
    sample_titles TEXT NOT NULL,
    sample_links TEXT NOT NULL,
    first_seen_at TEXT NOT NULL,
    latest_article_at TEXT NOT NULL,
    snapshot_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_snapshots_category_time ON trend_snapshots(category, snapshot_at);
`);

// better-sqlite3 스타일의 db.transaction(fn) API를 node:sqlite 위에 흉내낸다.
db.transaction = (fn) => (arg) => {
  db.exec('BEGIN');
  try {
    fn(arg);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
};

module.exports = db;
