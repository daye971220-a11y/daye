// 도노맘마존 범보의자 + 바른자세쿠션 공구예고 캐러셀 (2026-10-19)
// 공구 조건: 정가 130,000 → 행사가 84,900, 쿠폰 5천원 → 79,900(최대 38%), 아기핸드폰 증정, 10/22~10/24
// 문구 출처: 실사용 엄마 후기(카톡 캡처 157·167·168, 다예님 제공) + 위틀스토어 공식 상세(범보의자 6260, 바른자세쿠션 6777)
//           + 당근 시세(2026-10-19, 용인 수지 기준 '범보의자' 검색: 풀세트 중고 4~9만 원대)
// 사진: 실사용 사진(1xx) + 공식 상세페이지 잘라 쓴 이미지(o_*) / 후기 캡처 잘라 붙임(r_*)
// 디자인: 흰 각진 상자 + 검정 고딕, 표지는 썸네일 확정 기준(브랜드 / 분홍 상자 제품명 / 최저가 공구예고, 정중앙)
import { writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = 'C:/Users/user/Desktop/daye/delivery/donodono_bumbo';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
for (const d of ['html', 'out']) mkdirSync(join(root, d), { recursive: true });
for (const f of readdirSync(join(root, 'out'))) rmSync(join(root, 'out', f), { force: true });

const DEAL = { maxRate: '38%', gift: '아기핸드폰', keyword: '알람' };
const g = (top, align, ...items) => ({ top, align, items });
const emo = (e) => `<span class="emo">${e}</span>`;
const img = (s) => `../src/${s}.${s.startsWith('r_') ? 'png' : 'jpg'}`;

const slides = [
  // 1 표지 — 썸네일 확정 기준
  { src: 150, soft: true, groups: [
    { ...g(50, 'c', ['cover', '도노도노'], ['prod', '범보의자'], ['cover', '최저가 공구예고']), mid: true },
  ]},
  // 2 이번 공구 구성
  { card: 'set' },
  // 3 하이체어 vs 범보의자 (후기: 하이체어는 무겁고 부피 크고 비쌈 / 범보는 가볍고 휴대간편, 흘려도 바로 옆 바닥)
  { card: 'vs',
    title: `다들 하이체어만 아는데 ${emo('👀')}`,
    left: { src: 'o_high', name: '하이체어', rows: [
      ['무겁고 자리 차지', '부엌·거실 옮기기 힘들어요'],
      ['가격 부담', '도노도노만 해도 20만 원 가까이'],
      ['높아서 흘리면 곤란', '밥 먹이다 보면 겁나 흘려요'],
    ]},
    right: { src: 161, name: '도노도노 범보의자', rows: [
      ['2.6kg 한 손으로 번쩍', '뒤 손잡이로 어디든 이동'],
      ['훨씬 착한 가격', '공식몰 의자 정가 7만 원'],
      ['바닥 바로 옆이라 안심', '흘려도 쓱 닦으면 끝'],
    ]},
  },
  // 4 식사 습관 (후기: 부엌에 두고 밥·간식은 거기서만 → 배고프면 스스로 가서 앉음)
  { src: 152, groups: [
    g(4, 'c', ['box', '부엌에 두고<br>밥이랑 간식은 <b>여기서만</b> 줬더니']),
  ], review: { src: 'r_self', tag: '실사용 엄마 후기', top: 62 } },
  // 5 흘려도 OK (후기: 하이체어는 겁나 흘림 / 범보는 바로 옆 바닥이라 바로 닦고 덜 위험)
  { src: 149, groups: [
    { ...g(4, 'l', ['box', `하이체어는 밥 먹이다 보면<br>겁나 흘리는데 ${emo('🥲')}`]), x: 40 },
    g(78, 'c', ['box', `범보는 바로 옆 바닥이라<br><b>쓱 닦으면 끝!</b> 높지 않아 덜 위험해요`]),
  ]},
  // 6 바른자세쿠션 (공식: 등·허리·엉덩이 밀착핏, 엉덩이 밀림 막는 가로선, 생활방수·통세탁, KC)
  { card: 'checks', title: `<b>바른자세쿠션</b>까지 세트로 ${emo('💛')}`,
    rows: [
      { src: 159, t: '등·허리·엉덩이 밀착핏', d: '앉는 연습할 때<br>몸이 기울지 않게 잡아줘요' },
      { src: 'o_line', t: '엉덩이 밀림 막는 가로선', d: '앞으로 쭉 미끄러지지 않아요' },
      { src: 'o_wash', t: '생활방수 + 통세탁', d: '쓱 닦고, 더러워지면<br>통째로 빨면 끝' },
    ],
    foot: `의자·쿠션 모두 <b>KC 인증</b> 완료 ${emo('✔️')}` },
  // 7 오래 쓰는 3way (공식: 6개월~5세, 범보의자·이유식 부스터·아기소파, 2.6kg 손잡이)
  { card: 'grid', title: `6개월부터 <b>5살까지</b> 쭉 ${emo('💛')}`,
    cells: [
      { src: 'o_bumbo', cap: '혼자 앉기 연습' },
      { src: 'o_booster', cap: '트레이 끼우고 이유식' },
      { src: 'o_sofa', cap: '커서는 아기 소파로' },
      { src: 'o_handle', cap: '2.6kg 손잡이로 번쩍' },
    ],
    foot: '부엌 · 거실 · 방 <b>어디든</b> 들고 다녀요' },
  // 8 후기 모음 (카톡 캡처에서 핵심만 잘라 붙임)
  { card: 'reviews', title: `써본 엄마들 반응 ${emo('💬')}`,
    items: [
      { src: 'r_night', tag: '밤에도 스스로 와서 앉아요' },
      { src: 'r_floor', tag: '하이체어보다 훨씬 많이 써요' },
      { src: 'r_keep', tag: '당근에 팔려다 안 팔았어요' },
      { src: 'r_manner', tag: '식사 예절까지' },
    ] },
  // 9 가격 — 공식몰 따로 구매 / 당근 중고 시세 비교 + 알람
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
.big-box{background:#fff;color:#111;text-align:center;font-size:40px;font-weight:500;line-height:1.38;letter-spacing:-0.5px;padding:18px 40px}
.big-box b{color:#E0337A}
.dark{background:rgba(30,26,24,.9);color:#fff;font-size:34px;padding:12px 30px;letter-spacing:-0.5px;font-weight:500}
.dark b{color:#FFD84D;font-weight:900}
.cover{color:#fff;font-size:118px;font-weight:900;letter-spacing:-2px;line-height:1.18;text-align:center;
  text-shadow:0 2px 3px rgba(0,0,0,.45),0 4px 18px rgba(0,0,0,.55)}
.prod{background:#E0337A;color:#fff;font-size:118px;font-weight:900;letter-spacing:-2px;line-height:1.12;padding:6px 40px 12px;margin-top:4px}
.soft{position:absolute;left:0;right:0;top:28%;height:44%;background:radial-gradient(ellipse at center,rgba(0,0,0,.30),rgba(0,0,0,0) 70%)}
/* 카드형 장: 위아래 여백 60px, 칸 간격 24px 균일 */
.card{position:absolute;left:26px;right:26px;top:60px;bottom:60px;display:flex;flex-direction:column;gap:24px}
.card > .title,.card > .box{align-self:center}
.ph{background:#f1ece5;overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
/* 구성 */
.hero{flex:1;min-height:0;background:#fff;border:6px solid #fff;display:flex;flex-direction:column}
.hero img{flex:1;min-height:0;width:100%;object-fit:cover;object-position:center 78%}
.cap{height:52px;line-height:52px;text-align:center;font-size:30px;font-weight:500;letter-spacing:-0.5px;color:#111;background:#fff}
.cap b{color:#E0337A;font-weight:700}
.duo{height:300px;display:grid;grid-template-columns:1fr 1fr;gap:24px}
.cell{background:#fff;border:6px solid #fff;display:flex;flex-direction:column;min-height:0}
.cell img{flex:1;min-height:0;width:100%;object-fit:cover}
.gift{background:#fff;display:flex;align-items:center;gap:28px;padding:16px 30px}
.gift img{width:120px;height:140px;object-fit:cover;flex:none}
.gift .g1{display:inline-block;background:#E0337A;color:#fff;font-size:28px;font-weight:700;padding:4px 14px;margin-bottom:8px}
.gift .g2{font-size:38px;font-weight:700;color:#111;letter-spacing:-0.5px;line-height:1.3}
/* VS */
.vswrap{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:24px;position:relative}
.vscol{display:flex;flex-direction:column;gap:16px;min-height:0}
.vsimg{flex:1;min-height:0;background:#fff;border:6px solid #fff;display:flex;flex-direction:column}
.vsimg img{flex:1;min-height:0;width:100%;object-fit:cover}
.vsname{height:52px;line-height:52px;text-align:center;font-size:32px;font-weight:500;color:#555;background:#fff;letter-spacing:-0.5px}
.vsname.ok{color:#E0337A;font-weight:700}
.vslist{background:#fff;padding:6px 20px}
.vsrow{display:flex;align-items:center;gap:14px;height:112px;border-bottom:1px solid #eee;font-size:29px;line-height:1.3;letter-spacing:-0.5px;color:#222}
.vsrow:last-child{border-bottom:none}
.vsrow b{display:block;font-weight:700;color:#4a4440}
.vscol.ok .vsrow b{color:#E0337A}
.vsrow small{display:block;font-size:24px;color:#777}
.mk{flex:none;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff;background:#9b948c}
.vscol.ok .mk{background:#E0337A}
.vsbadge{position:absolute;left:50%;top:230px;transform:translateX(-50%);width:80px;height:80px;border-radius:50%;background:#1e1a18;color:#fff;font-size:32px;font-weight:900;display:flex;align-items:center;justify-content:center}
/* 체크 */
.chk{flex:1;background:#fff;display:flex;align-items:center;gap:30px;padding-right:26px;min-height:0;overflow:hidden}
.chk .ph{height:100%;width:400px;flex:none;border-right:3px solid #e6ddd1}
.chk .ct{font-size:35px;font-weight:700;color:#111;letter-spacing:-0.8px;display:flex;align-items:center;gap:12px}
.chk .mk2{flex:none;width:44px;height:44px;border-radius:50%;background:#E0337A;color:#fff;font-size:26px;display:flex;align-items:center;justify-content:center}
.chk .cd{font-size:29px;color:#555;margin-top:10px;padding-left:56px;letter-spacing:-0.5px;line-height:1.35}
/* 그리드 */
.grid{flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:24px;min-height:0}
/* 후기 */
.revs{flex:1;display:flex;flex-direction:column;justify-content:space-between;min-height:0}
.rev{background:#fff;border-radius:26px;border:3px solid #f1c6d3;padding:14px 22px 10px;align-self:stretch}
.rev .tg{display:inline-block;background:#E0337A;color:#fff;font-size:26px;font-weight:700;padding:3px 14px;border-radius:20px;margin-bottom:6px;letter-spacing:-0.5px}
.rev img{display:block;width:100%}
.rev.sm{align-self:flex-start}
.rev.sm img{width:auto;height:76px}
.revcard{position:absolute;left:40px;right:40px;background:#fff;border-radius:26px;border:3px solid #f1c6d3;padding:14px 22px 10px;box-shadow:0 6px 24px rgba(0,0,0,.12)}
.revcard .tg{display:inline-block;background:#E0337A;color:#fff;font-size:26px;font-weight:700;padding:3px 14px;border-radius:20px;margin-bottom:6px}
.revcard img{display:block;width:100%}
/* 가격 */
.ptop{position:absolute;left:0;top:0;width:966px;height:470px;object-fit:cover;object-position:center 64%}
.pbox{position:absolute;left:26px;right:26px;top:420px;bottom:60px;display:flex;flex-direction:column;align-items:center;justify-content:space-between}
.cmp{background:#fff;align-self:stretch;padding:6px 30px}
.cmp .row{display:flex;justify-content:space-between;align-items:center;height:76px;border-bottom:1px solid #eee;font-size:30px;letter-spacing:-0.5px;color:#444}
.cmp .row:last-child{border-bottom:none;color:#111;font-weight:700}
.cmp .row s{color:#999}
.cmp .row .v{font-weight:700;color:#333}
.cmp .row:last-child .v{color:#E0337A;font-weight:900}
`;

const item = ([k, t]) => `<div class="${k}">${t}</div>`;
const groups = (s) => (s.groups || []).map((gr) => `<div class="stack ${gr.align}" style="${gr.mid ? 'top:50%;transform:translateY(-50%)' : 'top:' + gr.top + '%'}${gr.x != null ? (gr.align === 'r' ? ';right:' : ';left:') + gr.x + 'px' : ''}">${gr.items.map(item).join('')}</div>`).join('');

const vsCol = (side, ok) => `<div class="vscol ${ok ? 'ok' : ''}"><div class="vsimg"><img src="${img(String(side.src))}"><div class="vsname ${ok ? 'ok' : ''}">${side.name}</div></div>`
  + `<div class="vslist">${side.rows.map(([b, s]) => `<div class="vsrow"><span class="mk">${ok ? '✓' : '✕'}</span><span><b>${b}</b><small>${s}</small></span></div>`).join('')}</div></div>`;

const card = (s) => {
  if (s.card === 'set') return `<div class="card"><div class="title">이번 공구 구성 ${emo('🎁')}</div>`
    + `<div class="hero"><img src="${img('159')}"><div class="cap">범보의자(트레이 포함) + <b>바른자세쿠션</b></div></div>`
    + `<div class="duo"><div class="cell"><img src="${img('161')}"><div class="cap">범보의자 + 트레이</div></div><div class="cell"><img src="${img('158')}"><div class="cap">바른자세쿠션</div></div></div>`
    + `<div class="gift"><img src="${img('160')}"><div><div class="g1">+ 증정 ${emo('🎁')}</div><div class="g2">구매하면 ${DEAL.gift}까지 드려요</div></div></div></div>`;
  if (s.card === 'vs') return `<div class="card"><div class="title">${s.title}</div><div class="vswrap">${vsCol(s.left, false)}${vsCol(s.right, true)}<div class="vsbadge">VS</div></div></div>`;
  if (s.card === 'checks') return `<div class="card"><div class="title">${s.title}</div>`
    + s.rows.map((r) => `<div class="chk"><div class="ph"><img src="${img(String(r.src))}"></div><div><div class="ct"><span class="mk2">✓</span>${r.t}</div><div class="cd">${r.d}</div></div></div>`).join('')
    + `<div class="box">${s.foot}</div></div>`;
  if (s.card === 'grid') return `<div class="card"><div class="title">${s.title}</div><div class="grid">`
    + s.cells.map((c) => `<div class="cell"><img src="${img(c.src)}"><div class="cap">${c.cap}</div></div>`).join('')
    + `</div><div class="box">${s.foot}</div></div>`;
  if (s.card === 'reviews') return `<div class="card"><div class="title">${s.title}</div><div class="revs">`
    + s.items.map((r) => `<div class="rev ${r.src === 'r_manner' ? 'sm' : ''}"><div class="tg">${r.tag}</div><img src="${img(r.src)}"></div>`).join('')
    + `</div></div>`;
  if (s.card === 'price') return `<img class="ptop" src="${img('151')}"><div class="pbox"><div class="title">그래서 가격은요? ${emo('👀')}</div>`
    + `<div class="cmp"><div class="row"><span>공식몰에서 의자 + 쿠션 따로 사면</span><span class="v"><s>103,800원</s></span></div>`
    + `<div class="row"><span>당근 중고 범보의자 풀세트</span><span class="v">4~9만 원대</span></div>`
    + `<div class="row"><span>이번 공구 · 새 제품 + 쿠션 + ${DEAL.gift}</span><span class="v">'알람'으로 공개 ${emo('🔒')}</span></div></div>`
    + `<div class="big-box"><b class="pink">'${DEAL.keyword}'</b> 댓글 남기면<br>정가 대비 <b class="pink">최대 ${DEAL.maxRate} 할인</b> 링크<br>오픈 당일에 보내드려요!</div>`
    + `<div class="dark">10/22(목)~10/24(토) <b>단 3일</b> ${emo('⏰')}</div></div>`;
  return '';
};

const bg = (s) => s.card ? card(s) : `<img class="bg" src="${img(String(s.src))}">${s.soft ? '<div class="soft"></div>' : ''}`;
const review = (s) => s.review ? `<div class="revcard" style="top:${s.review.top}%"><div class="tg">${s.review.tag}</div><img src="${img(s.review.src)}"></div>` : '';

slides.forEach((s, i) => {
  const n = String(i + 1).padStart(2, '0');
  const htmlPath = join(root, 'html', `slide_${n}.html`);
  writeFileSync(htmlPath, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${bg(s)}${groups(s)}${review(s)}</body></html>`, 'utf8');
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=966,1288', '--virtual-time-budget=8000', `--screenshot=${join(root, 'out', `bumbo_${n}.png`)}`, 'file:///' + htmlPath], { stdio: 'ignore' });
  console.log('done', n);
});
