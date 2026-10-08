const express = require('express');
const crypto = require('node:crypto');
const { openStore } = require('./store');
const { genres, loadGuidelines, checks } = require('./guidelines');
const { generate } = require('./ai');
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const statuses = ['planned', 'draft', 'review', 'ready', 'naver', 'published', 'archived'];
const str = (value, max = 50000) => typeof value === 'string' && value.length <= max;

function createWorkshop({ store = openStore(), generator = generate } = {}) {
  const router = express.Router();
  router.use(express.json({ limit: '8mb' }));
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    if (!['GET', 'HEAD'].includes(req.method)) {
      const expected = process.env.WORKSHOP_PUBLIC_URL ? new URL(process.env.WORKSHOP_PUBLIC_URL).origin : `${req.protocol}://${req.get('host')}`;
      if (req.get('origin') !== expected) return res.status(403).json({ error: '작업실 화면에서 다시 요청해주세요.' });
    }
    next();
  });
  const local = req => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
  const configured = () => !!store.get('password');
  const secure = () => (process.env.WORKSHOP_PUBLIC_URL || '').startsWith('https://');
  const cookie = (token, age) => `daye_session=${token}; HttpOnly; SameSite=Strict; Path=/api/workshop; Max-Age=${age}${secure() ? '; Secure' : ''}`;
  const digest = token => crypto.createHash('sha256').update(token).digest('hex');
  const authenticated = req => {
    const token = (req.get('cookie') || '').split(';').find(c => c.trim().startsWith('daye_session='))?.trim().slice(13);
    if (!token) return false;
    const session = store.db.prepare('SELECT expires FROM sessions WHERE token=?').get(digest(token));
    return !!session && session.expires > Date.now();
  };
  router.get('/session', (req, res) => res.json({ authenticated: authenticated(req), configured: configured(), canSetup: local(req) && !process.env.WORKSHOP_PUBLIC_URL && !configured(), shared: !!process.env.WORKSHOP_PUBLIC_URL }));
  router.post('/setup', (req, res) => {
    if (configured() || !local(req) || process.env.WORKSHOP_PUBLIC_URL) return res.status(403).json({ error: '서버 관리자에게 작업실 로그인 설정을 요청해주세요.' });
    if (!str(req.body.password, 200) || req.body.password.length < 10) return res.status(400).json({ error: '작업실 비밀번호를 10자 이상으로 정해주세요.' });
    store.setPassword(req.body.password); res.json({ ok: true });
  });
  const attempts = new Map();
  router.post('/login', (req, res) => {
    const key = req.socket.remoteAddress, old = attempts.get(key);
    const attempt = old && old.until > Date.now() ? old : { count: 0, until: Date.now() + 15 * 60000 };
    if (attempt.count >= 5) return res.status(429).json({ error: '잠시 뒤 다시 로그인해주세요.' });
    if (!str(req.body.password, 200) || !configured() || !store.verifyPassword(req.body.password)) {
      attempt.count++; attempts.set(key, attempt);
      if (attempts.size > 1000) attempts.delete(attempts.keys().next().value);
      return res.status(401).json({ error: '작업실 비밀번호가 맞지 않아요.' });
    }
    attempts.delete(key);
    const token = crypto.randomBytes(32).toString('hex'), age = 7 * 86400;
    store.db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
    store.db.prepare('INSERT INTO sessions VALUES (?,?)').run(digest(token), Date.now() + age * 1000);
    res.set('Set-Cookie', cookie(token, age)); res.json({ ok: true });
  });
  router.use((req, res, next) => authenticated(req) ? next() : res.status(401).json({ error: '작업실에 로그인해주세요.' }));
  router.post('/logout', (req, res) => {
    const token = (req.get('cookie') || '').split(';').find(c => c.trim().startsWith('daye_session='))?.trim().slice(13);
    if (token) store.db.prepare('DELETE FROM sessions WHERE token=?').run(digest(token));
    res.set('Set-Cookie', cookie('', 0)); res.json({ ok: true });
  });
  router.get('/settings', (req, res) => res.json({ model: store.get('model') || process.env.OPENAI_MODEL || 'gpt-6.1-sol', aiConnected: !!(process.env.OPENAI_API_KEY || store.get('api_key')), guidelines: store.get('guidelines'), genres: Object.entries(genres).map(([value, g]) => ({ value, label: g.label })), shared: !!process.env.WORKSHOP_PUBLIC_URL }));
  router.put('/settings', (req, res) => {
    if (!str(req.body.guidelines, 20000) || !str(req.body.model, 100) || !/^[a-zA-Z0-9._-]+$/.test(req.body.model)) return res.status(400).json({ error: '설정 내용을 확인해주세요.' });
    if (req.body.apiKey !== undefined && (!str(req.body.apiKey, 500) || (req.body.apiKey && !req.body.apiKey.startsWith('sk-')))) return res.status(400).json({ error: 'AI 연결 키 형식을 확인해주세요.' });
    store.set('guidelines', req.body.guidelines); store.set('model', req.body.model);
    if (req.body.apiKey) store.set('api_key', store.encrypt(req.body.apiKey));
    res.json({ ok: true });
  });
  router.get('/guidelines/:genre', (req, res) => {
    if (!genres[req.params.genre]) return res.sendStatus(404);
    res.json(loadGuidelines(req.params.genre, store.get('guidelines')));
  });
  router.get('/documents', (req, res) => res.json(store.db.prepare('SELECT id,title,genre,status,revision,updated,batch FROM documents ORDER BY updated DESC').all()));
  router.post('/documents', (req, res) => {
    if (!str(req.body.title, 200) || !req.body.title.trim() || !genres[req.body.genre] || !str(req.body.brief || '', 50000)) return res.status(400).json({ error: '주제와 글 유형을 확인해주세요.' });
    const docId = id();
    store.db.prepare('INSERT INTO documents(id,title,genre,brief,updated) VALUES (?,?,?,?,?)').run(docId, req.body.title.trim(), req.body.genre, req.body.brief || '', now());
    res.status(201).json(store.document(docId));
  });
  function fullDoc(docId) {
    const doc = store.document(docId);
    if (!doc) return null;
    const photos = store.db.prepare('SELECT id,section,caption,mime FROM photos WHERE document_id=? ORDER BY rowid').all(docId);
    return { ...doc, photos, messages: store.db.prepare('SELECT id,role,text,created FROM messages WHERE document_id=? ORDER BY id').all(docId), sources: store.db.prepare('SELECT url,title FROM sources WHERE document_id=?').all(docId), jobs: store.db.prepare('SELECT id,state,error,result,created,updated FROM jobs WHERE document_id=? ORDER BY created DESC LIMIT 10').all(docId), checks: checks(doc, photos) };
  }
  router.get('/documents/:id', (req, res) => {
    const doc = fullDoc(req.params.id); if (!doc) return res.sendStatus(404); res.json(doc);
  });
  router.put('/documents/:id', (req, res) => {
    const current = store.document(req.params.id); if (!current) return res.sendStatus(404);
    if (!str(req.body.title, 200) || !str(req.body.body) || !str(req.body.brief) || !str(req.body.hook, 4000) || !statuses.includes(req.body.status) || !Number.isInteger(req.body.revision)) return res.status(400).json({ error: '원고 내용을 확인해주세요.' });
    const busy = store.db.prepare("SELECT id FROM jobs WHERE document_id=? AND state IN ('queued','running')").get(current.id);
    if (busy) return res.status(409).json({ error: 'AI가 원고를 작성 중이에요. 완료 후 수정해주세요.', current: fullDoc(current.id) });
    if (req.body.status === 'ready') {
      const result = checks({ ...current, ...req.body }, store.db.prepare('SELECT section FROM photos WHERE document_id=?').all(current.id));
      if (result.warnings.length) return res.status(422).json({ error: '검수할 부분이 남아 있어요.', checks: result });
    }
    const updated = store.db.prepare('UPDATE documents SET title=?,body=?,brief=?,hook=?,status=?,revision=revision+1,updated=? WHERE id=? AND revision=?').run(req.body.title, req.body.body, req.body.brief, req.body.hook, req.body.status, now(), current.id, req.body.revision);
    if (!updated.changes) return res.status(409).json({ error: '다른 창에서 수정한 내용이 있어요. 현재 입력은 보존했습니다.', current: fullDoc(current.id) });
    res.json(fullDoc(current.id));
  });
  router.post('/documents/:id/photos', (req, res) => {
    if (!store.document(req.params.id)) return res.sendStatus(404);
    const { mime, data, section, caption } = req.body;
    if (!str(data, 7000000) || !str(section, 200) || !str(caption, 500) || !['image/png', 'image/jpeg', 'image/webp'].includes(mime)) return res.status(400).json({ error: 'PNG·JPG·WebP 사진을 선택해주세요.' });
    const bytes = Buffer.from(data, 'base64');
    const valid = mime === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) : mime === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    if (!valid || bytes.length > 5 * 1024 * 1024) return res.status(400).json({ error: '5MB 이하의 정상 사진 파일이 필요해요.' });
    const photoId = id(); store.db.prepare('INSERT INTO photos VALUES (?,?,?,?,?,?)').run(photoId, req.params.id, section, caption, mime, bytes);
    res.status(201).json(fullDoc(req.params.id));
  });
  router.get('/photos/:id', (req, res) => {
    const photo = store.db.prepare('SELECT mime,data FROM photos WHERE id=?').get(req.params.id);
    if (!photo) return res.sendStatus(404); res.type(photo.mime).send(Buffer.from(photo.data));
  });
  let working = false;
  // A single worker claims durable jobs; closing the client does not cancel the run.
  async function drain() {
    if (working) return; working = true;
    try {
      let job;
      while ((job = store.db.prepare("SELECT * FROM jobs WHERE state='queued' ORDER BY created LIMIT 1").get())) {
        store.db.prepare("UPDATE jobs SET state='running',updated=? WHERE id=? AND state='queued'").run(now(), job.id);
        try {
          const doc = store.document(job.document_id);
          const result = await generator(store, doc, job.prompt);
          store.db.exec('BEGIN IMMEDIATE');
          try {
            const applied = store.db.prepare("UPDATE documents SET title=?,body=?,hook=?,photo_plan=?,status='review',revision=revision+1,updated=? WHERE id=? AND revision=?").run(result.title, result.body, result.hook, result.photoPlan, now(), doc.id, job.input_revision);
            if (!applied.changes) throw new Error('원고 버전이 달라 결과를 적용하지 않았어요.');
            store.db.prepare('DELETE FROM sources WHERE document_id=?').run(doc.id);
            for (const s of result.sources || []) store.db.prepare('INSERT INTO sources(document_id,url,title) VALUES (?,?,?)').run(doc.id, s.url, s.title);
            store.db.prepare('INSERT INTO messages(document_id,role,text,created) VALUES (?,?,?,?)').run(doc.id, 'assistant', result.reviewNote || '새 원고를 작성했어요. 사실·사진·문체를 최종 확인해주세요.', now());
            store.db.prepare("UPDATE jobs SET state='done',result=?,updated=? WHERE id=?").run(JSON.stringify(result), now(), job.id);
            store.db.exec('COMMIT');
          } catch (e) { store.db.exec('ROLLBACK'); throw e; }
        } catch (e) {
          store.db.prepare("UPDATE jobs SET state='failed',error=?,updated=? WHERE id=?").run(e.message, now(), job.id);
          store.db.prepare('INSERT INTO messages(document_id,role,text,created) VALUES (?,?,?,?)').run(job.document_id, 'assistant', e.message + ' 기존 원고는 유지했어요.', now());
        }
      }
    } finally { working = false; }
  }
  // No automatic billable retry after a restart; let the user decide to run again.
  store.db.prepare("UPDATE jobs SET state='failed',error='서버가 재시작되어 작업이 중단됐어요. 기존 원고를 확인한 뒤 다시 요청해주세요.',updated=? WHERE state IN ('running','queued')").run(now());
  router.post('/documents/:id/generate', (req, res) => {
    const doc = store.document(req.params.id); if (!doc) return res.sendStatus(404);
    if (!str(req.body.prompt, 10000) || !req.body.prompt.trim() || !str(req.body.requestId, 100) || !req.body.requestId) return res.status(400).json({ error: '작성 요청을 입력해주세요.' });
    const same = store.db.prepare('SELECT id,document_id FROM jobs WHERE request_id=?').get(req.body.requestId);
    if (same) return same.document_id === doc.id ? res.json({ id: same.id }) : res.sendStatus(409);
    if (req.body.revision !== doc.revision) return res.status(409).json({ error: '최신 원고를 다시 불러온 뒤 요청해주세요.' });
    if (!process.env.OPENAI_API_KEY && !store.get('api_key') && generator === generate) return res.status(503).json({ error: '설정에서 AI 연결 키를 먼저 입력해주세요.' });
    if (store.db.prepare("SELECT id FROM jobs WHERE document_id=? AND state IN ('queued','running')").get(doc.id)) return res.status(409).json({ error: '이미 작성 중이에요. 완료될 때까지 기다려주세요.' });
    const jobId = id();
    store.db.prepare('INSERT INTO messages(document_id,role,text,created) VALUES (?,?,?,?)').run(doc.id, 'user', req.body.prompt, now());
    store.db.prepare('INSERT INTO jobs(id,document_id,request_id,state,input_revision,prompt,created,updated) VALUES (?,?,?,?,?,?,?,?)').run(jobId, doc.id, req.body.requestId, 'queued', doc.revision, req.body.prompt, now(), now());
    res.status(202).json({ id: jobId }); setImmediate(drain);
  });
  router.post('/seed-cpa', (req, res) => {
    if (store.get('cpa_seeded')) return res.json({ ok: true });
    const entries = [
      ['몽골 게르·승마 패키지', '5998278', 'naver'], ['규슈 온천·힐튼 3일', '5957393', 'naver'], ['푸꾸옥 멜리아 2인 풀빌라', '6223589', 'naver'], ['북해도 온천·대게 4일', '6128563', 'naver'], ['시드니 체험 7일', '6155274', 'naver'], ['서유럽 3개국 9일', '6029552', 'naver'], ['푸꾸옥 베스트웨스턴 4인 풀빌라', '6057675', 'planned'], ['대만 노쇼핑 핵심 관광', '6245036', 'planned'], ['장가계 직항 노옵션·노쇼핑', '6245357', 'planned'], ['다낭·호이안 바나힐·마사지', '5998029', 'planned'],
    ];
    store.db.exec('BEGIN IMMEDIATE');
    try {
      for (const [title, product, status] of entries) store.db.prepare('INSERT INTO documents(id,title,genre,status,brief,updated,batch) VALUES (?,?,?,?,?,?,?)').run(id(), title, 'cpa', status, `상품: https://www.myrealtrip.com/pkc/detail/${product}\n일반 상품 링크를 사용한다. 현재 가격·포함 혜택을 재확인한다.\n${status === 'naver' ? '2026-10-07 네이버 daye971220에 저장된 원고. 본문을 아직 작업실로 가져오지 않았다. 중복 생성하지 말고 기존 글을 먼저 확인한다.' : 'research/myrealtrip-cpa-resume.md의 남은 작업. 사진과 제목, 가격, 문체를 검수한 뒤 임시저장한다.'}`, now(), '마이리얼트립 CPA 10편');
      store.set('cpa_seeded', '1'); store.db.exec('COMMIT');
    } catch (e) { store.db.exec('ROLLBACK'); throw e; }
    res.json({ ok: true });
  });
  router.use((err, req, res, next) => { if (res.headersSent) return next(err); res.status(err.status || 500).json({ error: err.status === 413 ? '사진 파일이 너무 커요.' : '요청을 완료하지 못했어요. 저장 상태를 확인해주세요.' }); });
  return router;
}
module.exports = { createWorkshop };
