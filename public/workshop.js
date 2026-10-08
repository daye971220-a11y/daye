/* Private studio: the server is the source of truth; no API keys in browser storage. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id), R = window.WorkshopRender;
  const labels = { planned:'준비 중', draft:'초안', review:'검토 중', ready:'검토 완료', naver:'네이버 저장됨', published:'발행함', archived:'보관함' };
  let settings, current, documents = [], dirty = false, conflict = false, saving = null, timer, editVersion = 0, setup = false;
  function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => $('toast').hidden = true, 4500); }
  async function api(path, method = 'GET', body) {
    const response = await fetch('/api/workshop' + path, { method, credentials:'same-origin', headers: body ? { 'Content-Type':'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { const error = new Error(result.error || '요청을 완료하지 못했어요.'); error.status = response.status; error.detail = result; throw error; }
    return result;
  }
  function values() { return { title:$('title').value, body:$('body').value, brief:$('brief').value, hook:$('hook').value, status:$('status').value, revision:current.revision }; }
  const busy = doc => doc?.jobs?.some(job => ['queued','running'].includes(job.state));
  function preview() {
    if (!current) return;
    const doc = { ...current, ...values() };
    $('preview').innerHTML = R.render(doc);
    const headings = [...doc.body.matchAll(/^##\s+(.+)$/gm)].map(m => m[1].trim());
    const selected = $('photoSection').value;
    $('photoSection').replaceChildren(...[['intro','제목 아래 본문 사진'], ...headings.map(h => [h,h]), ['thumbnail','별도 썸네일']].map(([v,t]) => new Option(t,v)));
    if ([...$('photoSection').options].some(o => o.value === selected)) $('photoSection').value = selected;
  }
  function draw(doc) {
    const focused = document.activeElement;
    const selection = focused && ['title','body','brief','hook'].includes(focused.id) ? { element:focused, start:focused.selectionStart, end:focused.selectionEnd, scroll:focused.scrollTop } : null;
    current = doc; dirty = false; conflict = false; $('conflict').hidden = true;
    $('welcome').hidden = true; $('editorArea').hidden = false;
    $('genreLabel').textContent = settings.genres.find(g => g.value === doc.genre)?.label || doc.genre;
    $('documentHeading').textContent = doc.title;
    for (const field of ['title','body','brief','hook','status']) $(field).value = doc[field] || '';
    $('photoPlan').textContent = doc.photo_plan || '사진 배치 제안은 원고를 작성한 뒤 여기에 표시돼요.';
    $('messages').replaceChildren(...doc.messages.map(message => { const el = document.createElement('div'); el.className = 'message ' + message.role; el.textContent = message.text; return el; }));
    $('messages').scrollTop = $('messages').scrollHeight;
    $('checks').textContent = `본문 ${doc.checks.chars.toLocaleString()}자 (공백 제외)\n` + (doc.checks.warnings.length ? doc.checks.warnings.join('\n') : '자동 형식 검수 통과 · 사실과 문체를 마지막으로 확인해주세요.');
    $('sources').replaceChildren(...doc.sources.map(source => { const p = document.createElement('p'), a = document.createElement('a'); if (!R.safeUrl(source.url)) return p; a.href = source.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = source.title || source.url; p.append(a); return p; }));
    $('photoList').replaceChildren(...doc.photos.map(photo => { const card = document.createElement('figure'), img = document.createElement('img'), caption = document.createElement('figcaption'), link = document.createElement('a'); img.src = '/api/workshop/photos/' + photo.id; img.alt = photo.caption; caption.textContent = `${photo.section === 'thumbnail' ? '별도 썸네일' : photo.section} · ${photo.caption}`; link.href = img.src; link.download = photo.id + (photo.mime === 'image/jpeg' ? '.jpg' : photo.mime === 'image/webp' ? '.webp' : '.png'); link.textContent = '사진 내려받기'; card.append(img,caption,link); return card; }));
    const running = busy(doc);
    for (const field of ['title','body','brief','hook','status']) $(field).disabled = running;
    $('generateButton').disabled = running;
    $('jobState').hidden = !running;
    $('jobState').textContent = '공식 자료와 작성 지침을 적용하고 원고를 검토 중이에요. 다른 글을 열거나 창을 닫아도 작업은 이어집니다.';
    $('saveState').textContent = running ? '작성 진행 중' : '서버에 저장됨';
    const last = doc.jobs[0];
    $('ruleHash').textContent = '';
    if (last?.state === 'done') { try { $('ruleHash').textContent = JSON.parse(last.result).guidelineHash || ''; } catch {} }
    preview();
    if (selection && !running) { selection.element.focus(); selection.element.setSelectionRange(selection.start,selection.end); selection.element.scrollTop=selection.scroll; }
  }
  async function list() {
    documents = await api('/documents');
    const filter = $('genreFilter').value;
    $('documentList').replaceChildren(...documents.filter(d => !filter || d.genre === filter).map(doc => { const b = document.createElement('button'); b.className = 'doc-card' + (doc.id === current?.id ? ' selected' : ''); const t = document.createElement('strong'), s = document.createElement('span'); t.textContent = doc.title; s.textContent = `${settings.genres.find(g => g.value === doc.genre)?.label || doc.genre} · ${labels[doc.status]}`; b.append(t,s); b.onclick = () => open(doc.id).catch(e => toast(e.message)); return b; }));
    $('summary').textContent = `${documents.length}개의 글 · ${documents.filter(d => d.status === 'review').length}개의 검토 중인 글`;
  }
  async function save() {
    if (saving) { await saving; if (dirty) return save(); return true; }
    if (!dirty || !current) return !conflict;
    if (conflict) return false;
    const documentId = current.id, version = editVersion, input = values();
    $('saveState').textContent = '저장 중…';
    saving = (async () => {
      try {
        const saved = await api('/documents/' + documentId, 'PUT', input);
        if (current?.id !== documentId) return true;
        current = saved;
        if (version === editVersion) { dirty = false; draw(saved); }
        else { dirty = true; $('saveState').textContent = '추가 수정 저장 대기 중'; }
        await list(); return true;
      } catch (e) {
        $('saveState').textContent = '저장 안 됨 · 입력 내용은 이 창에 유지';
        if (e.status === 409) { conflict = true; $('conflict').hidden = false; }
        toast(e.message); return false;
      } finally { saving = null; }
    })();
    return saving;
  }
  async function open(id) { clearTimeout(timer); if (!(await save())) return; draw(await api('/documents/' + id)); history.replaceState(null,'','#' + id); await list(); }
  function change() { dirty = true; editVersion++; $('saveState').textContent = '수정 중 · 저장 대기'; preview(); clearTimeout(timer); timer = setTimeout(() => save(), 900); }
  async function enter() {
    settings = await api('/settings'); $('auth').hidden = true; $('studio').hidden = false;
    $('connectionState').textContent = settings.shared ? '공용 서버 · 같은 주소에서 이어쓰기' : '이 컴퓨터 · 외부 접속 연결 필요';
    for (const select of ['newGenre','genreFilter']) { const options = settings.genres.map(g => new Option(g.label,g.value)); if (select === 'newGenre') $(select).replaceChildren(...options); else $(select).replaceChildren(new Option('모든 글 유형',''), ...options); }
    await list(); $('saveState').textContent = '작업실 준비됨';
    const hash = location.hash.slice(1); if (documents.some(d => d.id === hash)) await open(hash);
  }
  async function init() {
    const session = await api('/session'); setup = session.canSetup;
    if (session.authenticated) return enter();
    $('loginButton').textContent = setup ? '비밀번호 정하고 시작하기' : '로그인';
    if (!session.configured && !setup) { $('authDescription').textContent = '서버에서 작업실 비밀번호 설정이 필요해요.'; $('loginButton').disabled = true; }
  }
  $('loginForm').onsubmit = async event => { event.preventDefault(); $('authError').textContent = ''; try { const password = $('password').value; if (setup) { await api('/setup','POST',{password}); setup = false; } await api('/login','POST',{password}); $('password').value = ''; await enter(); } catch(e) { $('authError').textContent = e.message; } };
  ['newDocument','welcomeNew'].forEach(id => $(id).onclick = () => $('newDialog').showModal());
  document.querySelectorAll('[data-close]').forEach(el => el.onclick = () => $(el.dataset.close).close());
  $('createForm').onsubmit = async event => { event.preventDefault(); if (!(await save())) return; try { const doc = await api('/documents','POST',{title:$('newTitle').value,genre:$('newGenre').value,brief:$('newBrief').value}); $('newDialog').close(); $('createForm').reset(); await open(doc.id); } catch(e) { toast(e.message); } };
  $('genreFilter').onchange = () => list();
  ['title','body','brief','hook','status'].forEach(id => $(id).addEventListener('input',change));
  $('loadRemote').onclick = async () => { if (!current || !confirm('이 창의 입력 대신 서버 최신본을 열까요? 필요한 내용은 먼저 내려받아주세요.')) return; dirty = false; conflict = false; await open(current.id); };
  function download(data,name,type='text/html') { const a = document.createElement('a'), url = URL.createObjectURL(new Blob([data],{type})); a.href=url; a.download=name; a.click(); setTimeout(() => URL.revokeObjectURL(url),2000); }
  $('downloadLocal').onclick = () => download(JSON.stringify(values(),null,2),'저장되지-않은-입력.json','application/json');
  $('seedCpa').onclick = async () => { try { await api('/seed-cpa','POST',{}); await list(); toast('진행 목록을 가져왔어요. 네이버 원고 본문은 별도로 불러와야 해요.'); } catch(e) { toast(e.message); } };
  $('settingsButton').onclick = () => { $('apiKey').value=''; $('model').value=settings.model; $('customGuidelines').value=settings.guidelines; $('aiStatus').textContent=settings.aiConnected ? 'AI 연결 키가 저장돼 있어요.' : 'AI 연결 키를 등록하면 글 작성이 가능해요. ChatGPT 구독과 별도로 API 사용료가 발생합니다.'; $('settingsDialog').showModal(); };
  $('settingsForm').onsubmit = async event => { event.preventDefault(); try { await api('/settings','PUT',{model:$('model').value,guidelines:$('customGuidelines').value,apiKey:$('apiKey').value}); $('apiKey').value=''; settings = await api('/settings'); $('settingsDialog').close(); toast('작성 설정을 저장했어요.'); } catch(e) { toast(e.message); } };
  $('showGuidelines').onclick = async () => { try { const g = await api('/guidelines/' + (current?.genre || 'cpa')); $('guidelineText').textContent=g.text; $('guidelineText').hidden=false; } catch(e) { toast(e.message); } };
  $('logout').onclick = async () => { if (!(await save())) return; await api('/logout','POST',{}); location.reload(); };
  document.querySelectorAll('.view-tab').forEach(button => button.onclick = () => { document.querySelectorAll('.view-tab').forEach(b => b.classList.toggle('active', b === button)); $('preview').hidden=button.dataset.view !== 'preview'; $('photosView').hidden=button.dataset.view !== 'photos'; $('checksView').hidden=button.dataset.view !== 'checks'; });
  $('generateForm').onsubmit = async event => { event.preventDefault(); if (!(await save())) return; $('generateButton').disabled=true; try { await api('/documents/' + current.id + '/generate','POST',{prompt:$('prompt').value,requestId:crypto.randomUUID(),revision:current.revision}); $('prompt').value=''; draw(await api('/documents/' + current.id)); } catch(e) { toast(e.message); $('generateButton').disabled=false; } };
  $('copyRequest').onclick = async () => {
    if (!(await save())) return;
    try {
      const rules = await api('/guidelines/' + current.genre);
      const request = `다음 작성 지침과 자료를 읽고 블로그 원고를 작성·수정해줘. 최신 사실은 공식 자료로 재검증해줘.\n\n${rules.text}\n\n주제: ${current.title}\n자료와 실제 경험:\n${current.brief}\n\n현재 원고:\n${current.body}\n\n수정 대화:\n${current.messages.map(m => `${m.role}: ${m.text}`).join('\n')}\n\n이번 요청: ${$('prompt').value || '이 지침으로 원고를 작성해줘.'}\n\n본문은 ## 1. 짧은 소제목, **강조**, 표, 마크다운 링크로 작성해줘. 제목, 본문, 썸네일 후킹, 사진·스티커 안내, 출처를 따로 전달해줘.`;
      await navigator.clipboard.writeText(request);
      toast('지침과 현재 글을 함께 복사했어요. 기존 ChatGPT·Codex에 붙여 넣으세요.');
    } catch(e) { toast('복사하지 못했어요. 지침 읽기에서 내용을 확인해주세요.'); }
  };
  function dataUrl(blob) { return new Promise((resolve,reject) => { const reader=new FileReader(); reader.onload=() => resolve(reader.result); reader.onerror=reject; reader.readAsDataURL(blob); }); }
  $('photoForm').onsubmit = async event => { event.preventDefault(); if (!(await save())) return; const file=$('photoFile').files[0]; if (!file || file.size > 5*1024*1024) return toast('5MB 이하 사진을 선택해주세요.'); try { const result=await api('/documents/' + current.id + '/photos','POST',{mime:file.type,data:(await dataUrl(file)).split(',')[1],section:$('photoSection').value,caption:$('photoCaption').value}); draw(result); $('photoForm').reset(); preview(); toast('사진을 서버에 저장했어요.'); } catch(e) { toast(e.message); } };
  async function exportHtml() {
    const photos={}; await Promise.all(current.photos.map(async p => { const response=await fetch('/api/workshop/photos/'+p.id); if (!response.ok) throw new Error('사진을 불러오지 못했어요.'); photos[p.id]=await dataUrl(await response.blob()); }));
    const container=document.createElement('div'); container.innerHTML=R.render({...current,...values()},photos);
    const styles={h2:'font-size:19px;font-weight:bold;color:#555;border-left:3px solid #75a78b;padding:8px 12px;margin:32px 0 18px',p:'font-size:16px;color:#111;text-align:center;line-height:1.8;margin:0 0 24px',img:'max-width:100%;height:auto',table:'border-collapse:collapse;width:100%;font-size:15px',th:'border:1px solid #ddd;padding:10px;background:#eff6ef',td:'border:1px solid #ddd;padding:10px',figcaption:'font-size:12px;color:#777',a:'color:#c44280;font-weight:bold'};
    container.querySelectorAll('*').forEach(el => { if(styles[el.tagName.toLowerCase()]) el.style.cssText=styles[el.tagName.toLowerCase()]; if(el.tagName==='STRONG') { el.style.color=el.className.includes('price') ? '#d43737' : '#c44280'; if(el.className.includes('benefit')) el.style.backgroundColor='#fff1a0'; } });
    return `<div style="font-family:Arial,sans-serif;color:#111;text-align:center;max-width:760px;margin:auto">${container.innerHTML}</div>`;
  }
  $('downloadDraft').onclick = async () => { try { const html=await exportHtml(); download(`<!doctype html><html lang="ko"><meta charset="utf-8"><title>${R.escape(current.title)}</title><h1 style="text-align:center">${R.escape($('title').value)}</h1>${html}</html>`,'사진-포함-완성본.html'); download($('title').value+'\n\n'+$('body').value,'복사-수정-원고.txt','text/plain'); } catch(e) { toast(e.message); } };
  $('copyDraft').onclick = async () => { try { const html=await exportHtml(); await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([$('body').value],{type:'text/plain'})})]); toast('서식 포함 본문을 복사했어요. 네이버에 붙인 뒤 사진과 서식이 유지되는지 확인해주세요.'); } catch(e) { toast('이 브라우저에서 복사하지 못했어요. 완성본을 내려받아 복사해주세요.'); } };
  window.addEventListener('beforeunload',event => { if(dirty) { event.preventDefault(); event.returnValue=''; } });
  setInterval(async () => { if(!current || dirty || saving || conflict || document.hidden) return; const id=current.id; try { const doc=await api('/documents/'+id); if(current?.id !== id || dirty || saving) return; if(doc.revision !== current.revision || JSON.stringify(doc.jobs) !== JSON.stringify(current.jobs) || doc.photos.length !== current.photos.length) { draw(doc); await list(); } } catch {} },4000);
  init().catch(e => { $('authError').textContent=e.message; });
})();
