// 도노도노 베이비룸 공구예고 캐러셀 (게시된 갈이대 공구예고와 같은 흐름: 표지 → 구성 → 사용 이야기 → 튼튼 체크 → 형태 → 가격 비공개 + 알람)
// 공구 조건: 다예님 제공 표 옵션 C (2026-10-15)
// 문구 출처: 케넨님 블로그 후기(2026-09-17) + 위틀스토어 공식 상세페이지 / 사진: 케넨님 촬영(p*: 원본 밝고 뽀얗게 보정) + 공식 상세페이지 이미지(o_*, 1xx)
// 디자인: 흰 각진 상자 + 검정 고딕, 표지는 썸네일 통일 기준(헤드카피 세로 정중앙)
// 2026-10-15 수정: 제품(베이비룸)이 잘 보이는 사진 우선, 자막은 아기 얼굴·가드를 피해서 배치, 카드형 장은 위아래 여백·칸 간격 균일
// 기획 원칙: docs/공구콘텐츠_기획원칙.md
import { writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = 'C:/Users/user/Desktop/daye/delivery/donodono_babyroom';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
for (const d of ['html', 'out']) mkdirSync(join(root, d), { recursive: true });
for (const f of readdirSync(join(root, 'out'))) rmSync(join(root, 'out', f), { force: true });

// 이번 공구 조건 (다예님 제공 표 옵션 C) — 할인율은 사이즈별 31·28·28·32·32% → "최대 32%"
const DEAL = { maxRate: '32%', gift: '올리브영 1만원', keyword: '알람' };
const SIZES = [
  ['특대형', '216 × 143'], ['슈퍼특대형', '253 × 143'], ['자이언트', '290 × 180'],
  ['슈퍼특대형 PLUS', '253 × 216'], ['자이언트 PLUS', '290 × 216'],
];

// 글씨 묶음: g(top%, 정렬, 항목...) / 항목: title, box, big-box, dark, label, cover
const g = (top, align, ...items) => ({ top, align, items });
const emo = (e) => `<span class="emo">${e}</span>`;

const slides = [
  // 1 표지 — 썸네일 통일 기준
  { src: 'pc', soft: true, groups: [
    // 썸네일만 봐도 무슨 공구인지 보이게: 제품명을 '최저가 공구예고'만큼 크게(분홍 상자), 브랜드·구성은 위 라벨
    { ...g(50, 'c', ['label', '<b>도노도노</b> 튼튼 밀림방지 · 한판 매트 세트'], ['prod', '베이비룸'], ['cover', '최저가 공구예고']), mid: true },
  ]},
  // 2 이번 공구 구성 + 사이즈 5가지 + 증정
  { card: 'sizes', title: `이번 공구 구성 ${emo('🎁')}` },
  // 3 그 전의 불편 (블로그) — 소파 옆 베이비룸이 보이는 사진
  { src: 116, groups: [
    g(4, 'c', ['box', '출산하고 매일 아기 안고<br>서서 재우다 보니']),
    g(82, 'c', ['box', `딱딱한 나무 바닥에<br><b>발목이 너무 아프더라고요</b> ${emo('🥲')}`]),
  ]},
  // 4 그래서 베이비룸 + 한판 매트 (블로그) — 가드·매트가 보이는 사진, 자막은 매트 위
  { src: 109, groups: [
    g(60, 'c', ['box', `매트 시공은 비싸고<br>이사도 가야 해서 패스 ${emo('🙅‍♀️')}`],
      ['box', `베이비룸 + 한판 매트 깔았더니<br><b>푹신한데 탄탄</b>해서 관절이 편해요 ${emo('💛')}`]),
  ]},
  // 5 아기 눕힐 곳 (블로그) — 자막은 아기 얼굴 피해서 위·아래
  { src: 'p1', groups: [
    g(5, 'c', ['box', `전엔 눕힐 데가 없어서<br>매번 아기침대까지 갔는데 ${emo('😅')}`]),
    g(83, 'c', ['box', `이젠 모빌 하나 두면 <b>거실 놀이 공간</b> 완성! ${emo('🙌')}`]),
  ]},
  // 6 와이드뷰 (블로그 + 공식)
  { src: 'p5', groups: [
    g(4, 'c', ['box', '주방에 있어도, 소파에 있어도']),
    g(80, 'c', ['box', `와이드뷰라 가드 사이로<br>아기가 <b>한눈에 쏙</b> 보여요 ${emo('👀')}`]),
  ]},
  // 7 튼튼 포인트 3가지 (공식 상세페이지 이미지: 두께 3.3cm, 흡착판+실리콘 패드 2중 논슬립, 66cm 하이가드)
  { card: 'checks', title: '괜히 <b>"튼튼 밀림방지"</b>가 아니에요',
    rows: [
      { src: 'o_hand', t: '두께 3.3cm 통판', d: '잡고 기대는 시기까지<br>생각한 HDPE 두께' },
      { src: 'o_cap', t: '2중 논슬립캡', d: '흡착판 + 실리콘 패드로<br>바닥에 꽉', fit: 'contain' },
      { src: 'o_stand', t: '66cm 하이가드', d: '쉽게 못 넘고, 출입문은<br>쉽게 못 열어요' },
    ],
    foot: `<b>KC 인증</b> 받은 어린이제품이라 더 안심 ${emo('✔️')}` },
  // 8 강아지 (사진: 강아지는 밖, 아기는 안) — 위 자막은 한 줄로 아기 머리 위를 피함
  { src: 'p8', groups: [
    g(36, 'c', ['box', '높이가 있어서 <b>댕댕이도 출입 금지</b> ㅋㅋ']),
    { ...g(84, 'l', ['box', `강아지는 밖에서, 아기는 안에서 ${emo('🐶')}`]), x: 40 },
  ]},
  // 9 형태 자유자재 (공식 상세페이지: 기본형·미로형·ㄷ자형·수면 공간 분리 / 블로그: 크기 조절, 커서는 주방 가드)
  { card: 'grid', title: `누워 있을 때부터 <b>걸음마 이후</b>까지 쭉 ${emo('💛')}`,
    cells: [
      { src: 'o_basic', cap: '기본 사각형' },
      { src: 'o_maze', cap: '미로형 놀이방' },
      { src: 'o_kitchen', cap: 'ㄷ자형 주방 가드' },
      { src: 'o_sleep', cap: '침대 옆 수면 공간' },
    ],
    foot: '조립식이라 칸 <b>넣었다 뺐다</b> 모양도 크기도 자유자재' },
  // 10 마지막 — 가격 비공개 + 알람 (위: 공식 연출 사진으로 제품이 잘 보이게)
  { card: 'price' },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=block');
@import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=block');
.emo{font-family:'Noto Color Emoji'}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:966px;height:1288px;overflow:hidden;background:#e6ddd1;font-family:'Noto Sans KR','Malgun Gothic',sans-serif}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.stack{position:absolute;display:flex;flex-direction:column;gap:16px}
.c{left:0;right:0;align-items:center}.l{left:60px;align-items:flex-start}.r{right:60px;align-items:flex-end}
.box,.title{background:#fff;color:#111;text-align:center;font-weight:400;letter-spacing:-0.5px;line-height:1.38}
.box{font-size:39px;padding:13px 30px}
.box b,.title b{font-weight:700;color:#E0337A}
.title{font-size:44px;padding:16px 40px}
.pink{color:#E0337A;font-weight:900}
.big-box{background:#fff;color:#111;text-align:center;font-size:44px;font-weight:500;line-height:1.38;letter-spacing:-0.5px;padding:22px 46px}
.big-box b{color:#E0337A}
.dark{background:rgba(30,26,24,.9);color:#fff;font-size:37px;padding:14px 32px;letter-spacing:-0.5px;font-weight:500}
.dark b{color:#FFD84D;font-weight:900}
.label{background:#fff;font-size:36px;font-weight:500;padding:10px 28px;letter-spacing:-0.5px;color:#1a1a1a}
.label b{color:#E0337A;font-weight:500}
.cover{color:#fff;font-size:118px;font-weight:900;letter-spacing:-2px;line-height:1.18;text-align:center;
  text-shadow:0 2px 3px rgba(0,0,0,.45),0 4px 18px rgba(0,0,0,.55)}
.prod{background:#E0337A;color:#fff;font-size:118px;font-weight:900;letter-spacing:-2px;line-height:1.12;padding:6px 40px 12px;margin-top:4px}
.soft{position:absolute;left:0;right:0;top:28%;height:44%;background:radial-gradient(ellipse at center,rgba(0,0,0,.30),rgba(0,0,0,0) 70%)}
/* 카드형 장: 위아래 여백 52px, 칸 사이 간격 24px로 균일 */
.card{position:absolute;left:26px;right:26px;top:60px;bottom:60px;display:flex;flex-direction:column;gap:24px}
.card > .title,.card > .box{align-self:center}
.chk{flex:1;background:#fff;display:flex;align-items:center;gap:30px;padding-right:30px;min-height:0;overflow:hidden}
.chk .ph{height:100%;width:400px;flex:none;background:#f1ece5;border-right:3px solid #e6ddd1;overflow:hidden}
.chk .ph img{width:100%;height:100%;object-fit:cover;display:block}
.chk .ph img.contain{object-fit:contain;mix-blend-mode:multiply;padding:18px}
.chk .ct{font-size:36px;font-weight:700;color:#111;letter-spacing:-0.8px;display:flex;align-items:center;gap:12px}
.chk .mk{flex:none;width:44px;height:44px;border-radius:50%;background:#E0337A;color:#fff;font-size:26px;display:flex;align-items:center;justify-content:center}
.chk .cd{font-size:29px;color:#555;margin-top:10px;padding-left:56px;letter-spacing:-0.5px}
.grid{flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:24px;min-height:0}
.cell{background:#fff;border:6px solid #fff;display:flex;flex-direction:column;min-height:0}
.cell img{flex:1;min-height:0;width:100%;object-fit:cover}
.cell .cap{height:52px;line-height:52px;text-align:center;font-size:30px;font-weight:500;letter-spacing:-0.5px;color:#111}
.setimg{background:#fff;border:6px solid #fff;flex:1;display:flex;flex-direction:column;min-height:0}
.setimg img{flex:1;min-height:0;width:100%;object-fit:cover}
.setimg .cap{height:52px;line-height:52px;text-align:center;font-size:30px;font-weight:700;letter-spacing:-0.5px;color:#111}
.setimg .cap b{color:#E0337A}
.sizes{background:#fff;padding:12px 34px}
.sizes .hd{font-size:28px;color:#777;text-align:center;letter-spacing:-0.5px;padding:2px 0 8px;border-bottom:2px solid #eee}
.sizes .row{display:flex;justify-content:space-between;align-items:center;height:64px;border-bottom:1px solid #eee;font-size:34px;letter-spacing:-0.5px;color:#111}
.sizes .row:last-child{border-bottom:none}
.sizes .row b{font-weight:700}.sizes .row span{color:#555;font-weight:500}
.gift{background:#fff;display:flex;align-items:center;gap:28px;padding:20px 30px}
.gift .won{flex:none;width:150px;height:126px;background:#1e1a18;color:#FFD84D;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;font-size:44px;letter-spacing:-1px;line-height:1.1}
.gift .won small{font-size:24px;color:#fff;font-weight:500}
.gift .g1{display:inline-block;background:#E0337A;color:#fff;font-size:28px;font-weight:700;padding:4px 14px;margin-bottom:8px}
.gift .g2{font-size:38px;font-weight:700;color:#111;letter-spacing:-0.5px;line-height:1.3}
.hero{position:absolute;left:0;top:0;width:966px;height:674px;object-fit:cover}
.pricebox{position:absolute;left:26px;right:26px;top:626px;bottom:60px;display:flex;flex-direction:column;align-items:center;justify-content:space-between}
.pricebox .mid{display:flex;flex-direction:column;align-items:center;gap:16px}
`;

const item = ([k, t]) => `<div class="${k}">${t}</div>`;
const groups = (s) => (s.groups || []).map((gr) => `<div class="stack ${gr.align}" style="${gr.mid ? 'top:50%;transform:translateY(-50%)' : 'top:' + gr.top + '%'}${gr.x != null ? (gr.align === 'r' ? ';right:' : ';left:') + gr.x + 'px' : ''}">${gr.items.map(item).join('')}</div>`).join('');

const card = (s) => {
  if (s.card === 'checks') return `<div class="card"><div class="title">${s.title}</div>`
    + s.rows.map((r) => `<div class="chk"><div class="ph"><img class="${r.fit || ''}" src="../src/${r.src}.jpg"></div><div><div class="ct"><span class="mk">✓</span>${r.t}</div><div class="cd">${r.d}</div></div></div>`).join('')
    + `<div class="box">${s.foot}</div></div>`;
  if (s.card === 'grid') return `<div class="card"><div class="title">${s.title}</div><div class="grid">`
    + s.cells.map((c) => `<div class="cell"><img src="../src/${c.src}.jpg"><div class="cap">${c.cap}</div></div>`).join('')
    + `</div><div class="box">${s.foot}</div></div>`;
  if (s.card === 'sizes') return `<div class="card"><div class="title">${s.title}</div>`
    + '<div class="setimg"><img src="../src/107.jpg"><div class="cap">튼튼 밀림방지 베이비룸 + <b>먼지제로 투톤 한판 매트</b></div></div>'
    + '<div class="sizes"><div class="hd">사이즈 5가지 · 베이비룸 + 매트 세트 (cm)</div>' + SIZES.map(([n, d]) => `<div class="row"><b>${n}</b><span>${d}</span></div>`).join('') + '</div>'
    + `<div class="gift"><div class="won">1만원<small>올리브영</small></div><div><div class="g1">+ 증정 ${emo('🎁')}</div><div class="g2">구매하면 ${DEAL.gift}<br>무조건 드려요</div></div></div></div>`;
  if (s.card === 'price') return '<img class="hero" src="../src/o_wide.jpg">'
    + `<div class="pricebox"><div class="title">그래서 가격은요? ${emo('👀')}</div>`
    + `<div class="mid"><div class="big-box"><b class="pink">'${DEAL.keyword}'</b> 댓글 남기면<br>정가 대비 <b class="pink">최대 ${DEAL.maxRate} 할인</b> 링크<br>오픈 당일에 보내드려요!</div>`
    + `<div class="dark">+ 구매하면 ${DEAL.gift} <b>무조건 증정</b> ${emo('🎁')}</div></div>`
    + `<div class="box">${DEAL.gift}은 추첨 아니고 <b>전원 증정!</b></div></div>`;
  return '';
};

const bg = (s) => s.card ? card(s) : `<img class="bg" src="../src/${s.src}.jpg">${s.soft ? '<div class="soft"></div>' : ''}`;

slides.forEach((s, i) => {
  const n = String(i + 1).padStart(2, '0');
  const htmlPath = join(root, 'html', `slide_${n}.html`);
  writeFileSync(htmlPath, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${bg(s)}${groups(s)}</body></html>`, 'utf8');
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=966,1288', '--virtual-time-budget=8000', `--screenshot=${join(root, 'out', `babyroom_${n}.png`)}`, 'file:///' + htmlPath], { stdio: 'ignore' });
  console.log('done', n);
});
