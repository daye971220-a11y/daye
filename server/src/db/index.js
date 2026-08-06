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
    blog_count INTEGER,
    sample_titles TEXT NOT NULL,
    sample_links TEXT NOT NULL,
    first_seen_at TEXT NOT NULL,
    latest_article_at TEXT NOT NULL,
    snapshot_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_snapshots_category_time ON trend_snapshots(category, snapshot_at);

  -- 카테고리별로 "이미 소개한 적 있는 이슈"를 기록해서, 다음날 같은 이슈가 다시 몰려도
  -- 새 이슈인 것처럼 재노출하지 않기 위한 테이블. story_key는 트렌드 라벨(예: "황정민 불륜")과 동일하게 써서
  -- "황정민 불륜"과 "황정민 마약"처럼 같은 인물이라도 실제로 다른 이슈면 별개로 취급되게 한다.
  CREATE TABLE IF NOT EXISTS surfaced_stories (
    category TEXT NOT NULL,
    story_key TEXT NOT NULL,
    first_surfaced_at TEXT NOT NULL,
    last_surfaced_at TEXT NOT NULL,
    PRIMARY KEY (category, story_key)
  );
`);

// 기존에 만들어져 있던 DB(위 CREATE TABLE이 no-op인 경우)에도 새 컬럼을 추가.
// 이미 컬럼이 있으면 에러가 나므로 무시한다.
try {
  db.exec('ALTER TABLE trend_snapshots ADD COLUMN blog_count INTEGER');
} catch {
  // 이미 존재함
}

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
