const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');

function openStore(dir = process.env.WORKSHOP_DATA_DIR || path.join(__dirname, '../../data/workshop')) {
  fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, 'workshop.db'));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY,value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY,expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY,title TEXT NOT NULL,genre TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'planned',brief TEXT NOT NULL DEFAULT '',body TEXT NOT NULL DEFAULT '',hook TEXT NOT NULL DEFAULT '',photo_plan TEXT NOT NULL DEFAULT '',revision INTEGER NOT NULL DEFAULT 1,updated TEXT NOT NULL,batch TEXT NOT NULL DEFAULT '');
    CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY,document_id TEXT NOT NULL,role TEXT NOT NULL,text TEXT NOT NULL,created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY,document_id TEXT NOT NULL,request_id TEXT UNIQUE NOT NULL,state TEXT NOT NULL,input_revision INTEGER NOT NULL,prompt TEXT NOT NULL,result TEXT NOT NULL DEFAULT '',error TEXT NOT NULL DEFAULT '',created TEXT NOT NULL,updated TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY,document_id TEXT NOT NULL,section TEXT NOT NULL,caption TEXT NOT NULL,mime TEXT NOT NULL,data BLOB NOT NULL);
    CREATE TABLE IF NOT EXISTS sources (id INTEGER PRIMARY KEY,document_id TEXT NOT NULL,url TEXT NOT NULL,title TEXT NOT NULL);
  `);
  const get = key => db.prepare('SELECT value FROM settings WHERE key=?').get(key)?.value || '';
  const set = (key, value) => db.prepare('INSERT INTO settings VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key, value);
  const secretFile = path.join(dir, 'secret.key');
  if (!fs.existsSync(secretFile)) fs.writeFileSync(secretFile, crypto.randomBytes(32), { mode: 0o600, flag: 'wx' });
  const secret = fs.readFileSync(secretFile);
  function encrypt(text) {
    const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', secret, iv);
    const bytes = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), bytes]).toString('base64');
  }
  function decrypt(text) {
    if (!text) return '';
    const bytes = Buffer.from(text, 'base64'), cipher = crypto.createDecipheriv('aes-256-gcm', secret, bytes.subarray(0, 12));
    cipher.setAuthTag(bytes.subarray(12, 28));
    return Buffer.concat([cipher.update(bytes.subarray(28)), cipher.final()]).toString('utf8');
  }
  function setPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    set('password', salt + ':' + crypto.scryptSync(password, salt, 32).toString('hex'));
  }
  function verifyPassword(password) {
    const [salt, hash] = get('password').split(':');
    if (!salt || !hash) return false;
    const actual = crypto.scryptSync(password, salt, 32);
    return crypto.timingSafeEqual(actual, Buffer.from(hash, 'hex'));
  }
  if (!get('password') && process.env.WORKSHOP_PASSWORD) {
    if (process.env.WORKSHOP_PASSWORD.length < 10) throw new Error('WORKSHOP_PASSWORD must contain at least 10 characters.');
    setPassword(process.env.WORKSHOP_PASSWORD);
  }
  const document = id => db.prepare('SELECT * FROM documents WHERE id=?').get(id);
  return { db, get, set, encrypt, decrypt, setPassword, verifyPassword, document };
}
module.exports = { openStore };
