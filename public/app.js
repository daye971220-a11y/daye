const tabsEl = document.getElementById('tabs');
const statusEl = document.getElementById('status');
const cardsEl = document.getElementById('cards');
const refreshBtn = document.getElementById('refreshBtn');

let categories = [];
let activeCategory = null;
let pollTimer = null;

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

function renderTrends(data) {
  if (!data.trends || data.trends.length === 0) {
    statusEl.textContent = '아직 감지된 급상승 이슈가 없어요. 데이터가 쌓이면 자동으로 표시됩니다.';
    cardsEl.innerHTML = '';
    return;
  }

  statusEl.textContent = `마지막 갱신: ${timeAgo(data.snapshotAt)}`;

  cardsEl.innerHTML = data.trends
    .map((t) => {
      const samples = t.sampleTitles
        .map(
          (title, i) =>
            `<li><a href="${escapeHtml(t.sampleLinks[i])}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a></li>`
        )
        .join('');

      return `
        <article class="card">
          <div class="card-top">
            <span class="badge">🔥 ${t.articleCount}건 몰림</span>
          </div>
          <div class="keyword">${escapeHtml(t.keyword)}</div>
          <div class="meta">${timeAgo(t.firstSeenAt)} 처음 감지 · 최신 기사 ${timeAgo(t.latestArticleAt)}</div>
          <ul class="sample-list">${samples}</ul>
        </article>
      `;
    })
    .join('');
}

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
}

refreshBtn.addEventListener('click', loadTrends);

init();
