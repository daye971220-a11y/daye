const tabsEl = document.getElementById('tabs');
const statusEl = document.getElementById('status');
const cardsEl = document.getElementById('cards');
const refreshBtn = document.getElementById('refreshBtn');
const pageTitleEl = document.getElementById('pageTitle');

const modeTabsEl = document.getElementById('modeTabs');
const issueViewEl = document.getElementById('issueView');
const keywordViewEl = document.getElementById('keywordView');
const keywordTopicTabsEl = document.getElementById('keywordTopicTabs');
const keywordStatusEl = document.getElementById('keywordStatus');
const keywordRefreshBtn = document.getElementById('keywordRefreshBtn');
const keywordExportBtn = document.getElementById('keywordExportBtn');
const keywordTableBodyEl = document.getElementById('keywordTableBody');

const cardnewsModal = document.getElementById('cardnewsModal');
const cardnewsTitleEl = document.getElementById('cardnewsTitle');
const cardnewsSlidesEl = document.getElementById('cardnewsSlides');
const cardnewsCloseBtn = document.getElementById('cardnewsClose');
const cardnewsDownloadAllBtn = document.getElementById('cardnewsDownloadAll');

let categories = [];
let activeCategory = null;
let pollTimer = null;
let lastTrends = [];
let currentCardNewsSlides = [];
let currentCardNewsKeyword = '';

let mode = 'issue';
let keywordTopics = [];
let activeKeywordTopic = null;

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

function renderTabs() {
  tabsEl.innerHTML = categories
    .map(
      (c) =>
        `<button class="tab${c.id === activeCategory ? ' active' : ''}" data-id="${c.id}">${c.emoji} ${escapeHtml(c.label)}</button>`
    )
    .join('');

  tabsEl.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.id;
      renderTabs();
      loadTrends();
    });
  });
}

function switchMode(nextMode) {
  mode = nextMode;
  modeTabsEl.querySelectorAll('.mode-tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  const isIssue = mode === 'issue';
  issueViewEl.classList.toggle('hidden', !isIssue);
  keywordViewEl.classList.toggle('hidden', isIssue);
  refreshBtn.classList.toggle('hidden', !isIssue);
  pageTitleEl.textContent = isIssue ? '🔥 지금 뜨는 이슈' : '🔑 키워드 리서치';

  // 키워드 표는 DB 캐시만 읽는 가벼운 조회라(외부 API 호출 없음) 탭 전환마다 새로 불러와도 무방
  if (!isIssue && activeKeywordTopic) {
    loadKeywordTable();
  }
}

modeTabsEl.querySelectorAll('.mode-tab').forEach((btn) => {
  btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});

function renderKeywordTopicTabs() {
  keywordTopicTabsEl.innerHTML = keywordTopics
    .map(
      (t) =>
        `<button class="tab${t.id === activeKeywordTopic ? ' active' : ''}" data-id="${t.id}">${t.emoji} ${escapeHtml(t.label)}</button>`
    )
    .join('');

  keywordTopicTabsEl.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeKeywordTopic = btn.dataset.id;
      renderKeywordTopicTabs();
      loadKeywordTable();
    });
  });
}

const PRIORITY_CLASS = {
  '우선(급상승)': 'priority-hot',
  '우선': 'priority-high',
  '확장': 'priority-mid',
  '보류': 'priority-low',
};

function renderKeywordTable(data) {
  if (data.error) {
    keywordStatusEl.textContent = '';
    keywordTableBodyEl.innerHTML = `<tr><td colspan="10" class="error">${escapeHtml(data.error)}\nserver/.env에 NAVER_AD_API_KEY / NAVER_AD_SECRET_KEY / NAVER_AD_CUSTOMER_ID를 설정한 뒤 "새로고침"을 눌러주세요.</td></tr>`;
    return;
  }

  if (!data.rows || data.rows.length === 0) {
    keywordStatusEl.textContent = '아직 수집된 키워드가 없어요. "새로고침"을 눌러 시작해보세요.';
    keywordTableBodyEl.innerHTML = '';
    return;
  }

  keywordStatusEl.textContent = `마지막 갱신: ${timeAgo(data.lastRunAt)} · 키워드 ${data.rows.length}개`;

  keywordTableBodyEl.innerHTML = data.rows
    .map(
      (r) => `
        <tr>
          <td class="col-rank">${r.rank}</td>
          <td class="col-keyword">${escapeHtml(r.keyword)}</td>
          <td class="col-num">${r.pcQc.toLocaleString('ko-KR')}</td>
          <td class="col-num">${r.mobileQc.toLocaleString('ko-KR')}</td>
          <td class="col-num">${r.totalQc.toLocaleString('ko-KR')}</td>
          <td class="col-num">${r.mobileRatio.toFixed(1)}%</td>
          <td class="col-center">${escapeHtml(r.seasonType)}</td>
          <td class="col-center"><span class="priority-badge ${PRIORITY_CLASS[r.priority] || ''}">${escapeHtml(r.priority)}</span></td>
          <td class="col-center">${escapeHtml(r.compIdx || '-')}</td>
          <td class="col-title">${escapeHtml(r.recommendedTitle)}</td>
        </tr>
      `
    )
    .join('');
}

async function loadKeywordTable() {
  if (!activeKeywordTopic) return;
  try {
    const res = await fetch(`/api/keywords/${encodeURIComponent(activeKeywordTopic)}`);
    if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
    const data = await res.json();
    renderKeywordTable(data);
  } catch (err) {
    keywordStatusEl.textContent = '';
    keywordTableBodyEl.innerHTML = `<tr><td colspan="10" class="error">불러오기 실패: ${escapeHtml(err.message)}</td></tr>`;
  }
}

async function refreshActiveKeywordTopic() {
  if (!activeKeywordTopic) return;
  const originalLabel = keywordRefreshBtn.textContent;
  keywordRefreshBtn.disabled = true;
  keywordRefreshBtn.textContent = '수집 중... (최대 1분)';
  keywordStatusEl.textContent = '검색광고 API + 데이터랩에서 키워드를 모으는 중이에요...';

  try {
    const res = await fetch(`/api/keywords/${encodeURIComponent(activeKeywordTopic)}/refresh`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      renderKeywordTable({ error: data.error || `서버 오류 (${res.status})` });
    } else {
      renderKeywordTable(data);
    }
  } catch (err) {
    renderKeywordTable({ error: err.message });
  } finally {
    keywordRefreshBtn.disabled = false;
    keywordRefreshBtn.textContent = originalLabel;
  }
}

function exportActiveKeywordTopic() {
  if (!activeKeywordTopic) return;
  const a = document.createElement('a');
  a.href = `/api/keywords/${encodeURIComponent(activeKeywordTopic)}/export.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function loadKeywordTopics() {
  try {
    const res = await fetch('/api/keyword-topics');
    keywordTopics = await res.json();
    if (keywordTopics.length > 0) {
      activeKeywordTopic = keywordTopics[0].id;
      renderKeywordTopicTabs();
      await loadKeywordTable();
    }
  } catch (err) {
    keywordStatusEl.textContent = '';
    keywordTableBodyEl.innerHTML = `<tr><td colspan="10" class="error">서버에 연결할 수 없어요: ${escapeHtml(err.message)}</td></tr>`;
  }
}

keywordRefreshBtn.addEventListener('click', refreshActiveKeywordTopic);
keywordExportBtn.addEventListener('click', exportActiveKeywordTopic);

function renderTrends(data) {
  if (!data.trends || data.trends.length === 0) {
    statusEl.textContent = '아직 감지된 급상승 이슈가 없어요. 데이터가 쌓이면 자동으로 표시됩니다.';
    cardsEl.innerHTML = '';
    return;
  }

  statusEl.textContent = `마지막 갱신: ${timeAgo(data.snapshotAt)}`;

  lastTrends = data.trends;

  cardsEl.innerHTML = data.trends
    .map((t, idx) => {
      const samples = t.sampleTitles
        .map(
          (title, i) =>
            `<li><a href="${escapeHtml(t.sampleLinks[i])}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a></li>`
        )
        .join('');

      // blogCount는 아직 main 백엔드에 없는 필드(회사컴 backup 브랜치에서만 구현됨).
      // 나중에 병합되면 자동으로 뱃지가 살아나도록 null/undefined 둘 다 방어.
      const blogBadge =
        t.blogCount === null || t.blogCount === undefined
          ? ''
          : `<span class="badge badge-blog">✍️ 블로그 ${t.blogCount}개뿐</span>`;

      return `
        <article class="card">
          <div class="card-top">
            <span class="badge">🔥 ${t.articleCount}건 몰림</span>
            ${blogBadge}
          </div>
          <div class="keyword">${escapeHtml(t.keyword)}</div>
          <div class="meta">${timeAgo(t.firstSeenAt)} 처음 감지 · 최신 기사 ${timeAgo(t.latestArticleAt)}</div>
          <ul class="sample-list">${samples}</ul>
          <button class="cardnews-btn" data-idx="${idx}">🖼️ 카드뉴스 만들기</button>
        </article>
      `;
    })
    .join('');

  cardsEl.querySelectorAll('.cardnews-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      openCardNewsModal(lastTrends[idx], btn);
    });
  });
}

function sanitizeFilename(str) {
  return str.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_');
}

function downloadCanvas(canvas, filename) {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, 'image/png');
}

async function openCardNewsModal(trend, triggerBtn) {
  if (!trend || !window.CardNews) return;

  const originalLabel = triggerBtn ? triggerBtn.textContent : null;
  if (triggerBtn) {
    triggerBtn.disabled = true;
    triggerBtn.textContent = '만드는 중...';
  }

  let slides;
  try {
    const categoryMeta = categories.find((c) => c.id === activeCategory) || {};
    slides = await window.CardNews.generate(trend, categoryMeta);
  } finally {
    if (triggerBtn) {
      triggerBtn.disabled = false;
      triggerBtn.textContent = originalLabel;
    }
  }

  currentCardNewsSlides = slides;
  currentCardNewsKeyword = sanitizeFilename(trend.keyword);

  cardnewsTitleEl.textContent = `🖼️ 카드뉴스 - ${trend.keyword}`;
  cardnewsSlidesEl.innerHTML = '';

  slides.forEach((canvas, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'cardnews-slide';

    canvas.className = 'cardnews-canvas';

    const dlBtn = document.createElement('button');
    dlBtn.className = 'cardnews-dl-btn';
    dlBtn.textContent = `${i + 1}번 다운로드`;
    dlBtn.addEventListener('click', () =>
      downloadCanvas(canvas, `카드뉴스_${currentCardNewsKeyword}_${i + 1}.png`)
    );

    wrap.appendChild(canvas);
    wrap.appendChild(dlBtn);
    cardnewsSlidesEl.appendChild(wrap);
  });

  cardnewsModal.classList.remove('hidden');
}

function closeCardNewsModal() {
  cardnewsModal.classList.add('hidden');
}

cardnewsCloseBtn.addEventListener('click', closeCardNewsModal);
cardnewsModal.addEventListener('click', (e) => {
  if (e.target === cardnewsModal) closeCardNewsModal();
});

cardnewsDownloadAllBtn.addEventListener('click', () => {
  currentCardNewsSlides.forEach((canvas, i) => {
    setTimeout(
      () => downloadCanvas(canvas, `카드뉴스_${currentCardNewsKeyword}_${i + 1}.png`),
      i * 300
    );
  });
});

async function loadTrends() {
  if (!activeCategory) return;
  try {
    const res = await fetch(`/api/trends?category=${encodeURIComponent(activeCategory)}`);
    if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
    const data = await res.json();
    renderTrends(data);
  } catch (err) {
    statusEl.textContent = '';
    cardsEl.innerHTML = `<p class="error">불러오기 실패: ${escapeHtml(err.message)}\n네이버 API 키가 server/.env에 설정되어 있는지 확인해주세요.</p>`;
  }
}

async function init() {
  try {
    const res = await fetch('/api/categories');
    categories = await res.json();
    activeCategory = categories[0]?.id;
    renderTabs();
    await loadTrends();

    pollTimer = setInterval(loadTrends, 5 * 60 * 1000);
  } catch (err) {
    statusEl.textContent = '';
    cardsEl.innerHTML = `<p class="error">서버에 연결할 수 없어요: ${escapeHtml(err.message)}</p>`;
  }

  loadKeywordTopics();
}

refreshBtn.addEventListener('click', loadTrends);

init();
