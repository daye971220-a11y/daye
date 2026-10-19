// 도노맘마존 범보의자 + 바른자세쿠션 공구예고 캐러셀 (2026-10-19, 시안2)
// 공구 조건: 정가 130,000 → 행사가 84,900, 쿠폰 5천원 → 79,900(최대 38%), 아기핸드폰 증정, 10/22~10/24
// 문구 출처: 실사용 엄마 카톡 후기(157·167·168, 다예님 제공) + 위틀스토어 공식 상세(범보의자 6260, 바른자세쿠션 6777)
//           + 당근 '범보의자 풀세트' 검색 화면 캡처(2026-10-19, dg_*) + 쿠팡 검색(의자 단품 70,000)
// 사진: 실사용 사진(1xx) + 공식 상세페이지 이미지(o_*) / 카톡 캡처 잘라 붙임(r_*)
// 시안2 수정: 표지는 경쟁 공구 썸네일처럼 의자 전체가 보이는 정면 컷(공식 b_lineup), 구성 장 대표 사진 크게,
//            VS 오른쪽은 공식 제품컷, 4장 자막은 아기 머리·등 위 + 카톡 말풍선 2개, 5장 문구 쉽게,
//            7장 손잡이 사진 다시 자름, 8장 카톡 캡처 형태, 9장 당근 실제 검색 화면 캡처
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
const img = (s) => `../src/${s}.${String(s).startsWith('r_') ? 'png' : 'jpg'}`;

// 카톡 말풍선: 실제 캡처 조각 + 형광펜(강조할 줄, 이미지 대비 % 좌표)
const KAKAO = {
  r_self: { hl: [[0, 50, 47.5, 25]] },              // 스스로 거기가서 앉아.
  r_night: { hl: [[0, 34, 70, 33]] },             // 스스로 나와서 의자에 딱 앉음 ㅋㅋ
  r_floor: { hl: [[35, 0, 65, 25]] },             // 흘려봤자 바로 옆 바닥이라
  r_keep: { hl: [[0, 34, 100, 33]] },             // 이걸로 의사소통이 돼서 너무 좋아서 안팔았
};
const bubble = (src, w) => `<div class="kb" style="${w ? 'width:' + w : ''}"><div class="kimg"><img src="${img(src)}">`
  + (KAKAO[src]?.hl || []).map(([x, y, ww, hh]) => `<i class="hl" style="left:${x}%;top:${y}%;width:${ww}%;height:${hh}%"></i>`).join('')
  + `</div></div>`;

const slides = [
  // 1 표지 — 직접 쓰는 사진 중 의자 전체(쿠션·손잡이·트레이)가 가장 잘 보이는 뒷모습 컷, 아래 제품 스티커만 흐리게 가림
  { src: 152, soft: true, patch: [33, 89, 34, 10], sticker: 'cut_170t', groups: [
    { ...g(50, 'c', ['cover', '도노도노'], ['prod', '범보의자'], ['cover', '최저가 공구예고']), mid: true },
  ]},
  // 2 이번 공구 구성
  { card: 'set' },
  // 3 하이체어 vs 범보의자
  { card: 'vs',
    title: `다들 하이체어만 아는데 ${emo('👀')}`,
    left: { src: 'o_high', name: '하이체어', rows: [
      ['무겁고 자리 차지', '부엌·거실 옮기기 힘들어요'],
      ['가격 부담', '도노도노만 해도 20만 원 가까이'],
      ['높아서 흘리면 곤란', '밥 먹이다 보면 겁나 흘려요'],
    ]},
    right: { src: 'o_chair', name: '도노도노 범보의자', contain: true, rows: [
      ['2.6kg 한 손으로 번쩍', '뒤 손잡이로 어디든 이동'],
      ['훨씬 착한 가격', '공식몰 의자 정가 7만 원'],
      ['바닥에 낮게 앉아 안심', '흘려도 쓱 닦으면 끝'],
    ]},
  },
  // 4 식사 습관 — 자막은 아기 머리·등 위, 카톡 말풍선 2개(실제 캡처)
  { src: 153, groups: [
    g(37, 'c', ['box', '부엌에 두고<br>밥이랑 간식은 <b>여기서만</b> 줬더니']),
  ], kakao: { top: 62, items: ['r_self'] } },
  // 5 흘려도 OK — 하이체어(높음) vs 범보의자(바닥에 낮게)
  { src: 149, groups: [
    { ...g(4, 'l', ['box', `하이체어는 높아서<br>밥 먹이면 사방으로 다 흘리는데 ${emo('🥲')}`]), x: 40 },
    g(74, 'c', ['box', `범보의자는 바닥에 낮게 앉으니까<br>흘려도 의자 옆만 <b>쓱 닦으면 끝!</b><br>높지 않아서 떨어질 걱정도 덜해요`]),
  ]},
  // 6 바른자세쿠션
  { card: 'checks', title: `<b>바른자세쿠션</b>까지 세트로 ${emo('💛')}`,
    rows: [
      { src: 159, t: '등·허리·엉덩이 밀착핏', d: '앉는 연습할 때<br>몸이 기울지 않게 잡아줘요' },
      { src: 'o_line', t: '엉덩이 밀림 막는 가로선', d: '앞으로 쭉 미끄러지지 않아요' },
      { src: 'o_wash', t: '생활방수 + 통세탁', d: '쓱 닦고, 더러워지면<br>통째로 빨면 끝' },
    ],
    foot: `의자·쿠션 모두 <b>KC 인증</b> 완료 ${emo('✔️')}` },
  // 7 3way
  { card: 'grid', title: `6개월부터 <b>5살까지</b> 쭉 ${emo('💛')}`,
    cells: [
      { src: 'o_bumbo', cap: '혼자 앉기 연습' },
      { src: 'o_booster', cap: '트레이 끼우고 이유식' },
      { src: 'o_sofa', cap: '커서는 아기 소파로' },
      { src: 'o_handle', cap: '2.6kg 손잡이로 번쩍' },
    ],
    foot: '부엌 · 거실 · 방 <b>어디든</b> 들고 다녀요' },
  // 8 후기 모음 — 실제 카톡 캡처 그대로(형광펜으로 강조)
  { card: 'reviews' },
  // 9 가격 — 당근 실제 검색 화면 + 공식몰 비교 + 알람
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
.box{font-size:38px;padding:13px 30px}
.box b,.title b{font-weight:700;color:#E0337A}
.title{font-size:44px;padding:16px 40px}
.pink{color:#E0337A;font-weight:900}
.big-box{background:#fff;color:#111;text-align:center;font-size:38px;font-weight:500;line-height:1.38;letter-spacing:-0.5px;padding:16px 36px}
.big-box b{color:#E0337A}
.dark{background:rgba(30,26,24,.9);color:#fff;font-size:32px;padding:10px 28px;letter-spacing:-0.5px;font-weight:500}
.dark b{color:#FFD84D;font-weight:900}
.cover{color:#fff;font-size:118px;font-weight:900;letter-spacing:-2px;line-height:1.18;text-align:center;
  text-shadow:0 2px 3px rgba(0,0,0,.45),0 4px 18px rgba(0,0,0,.55)}
.prod{background:#E0337A;color:#fff;font-size:118px;font-weight:900;letter-spacing:-2px;line-height:1.12;padding:6px 40px 12px;margin-top:4px}
.sticker{position:absolute;left:50%;top:56px;height:360px;transform:translateX(-50%) rotate(-4deg);filter:drop-shadow(0 0 0 #fff) drop-shadow(4px 0 0 #fff) drop-shadow(-4px 0 0 #fff) drop-shadow(0 4px 0 #fff) drop-shadow(0 -4px 0 #fff) drop-shadow(0 10px 18px rgba(0,0,0,.35))}
.patch{position:absolute;background:linear-gradient(90deg,rgb(168,158,140),rgb(182,174,158) 50%,rgb(190,184,172));filter:blur(10px);border-radius:24px}
.soft{position:absolute;left:0;right:0;top:28%;height:44%;background:radial-gradient(ellipse at center,rgba(0,0,0,.30),rgba(0,0,0,0) 70%)}
.card{position:absolute;left:26px;right:26px;top:60px;bottom:60px;display:flex;flex-direction:column;gap:24px}
.card > .title,.card > .box{align-self:center}
.ph{background:#f1ece5;overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
.cap{height:52px;line-height:52px;text-align:center;font-size:30px;font-weight:500;letter-spacing:-0.5px;color:#111;background:#fff}
.cap b{color:#E0337A;font-weight:700}
.cell{background:#fff;border:6px solid #fff;display:flex;flex-direction:column;min-height:0}
.cell img{flex:1;min-height:0;width:100%;object-fit:cover}
/* 구성: 왼쪽 대표 사진 크게, 오른쪽 쿠션·증정 */
.setgrid{flex:1;min-height:0;display:grid;grid-template-columns:1.45fr 1fr;grid-template-rows:1fr 1fr;gap:24px}
.setgrid .main{grid-row:1 / span 2}
.setgrid .main img{object-position:center 40%}
.gtag{position:absolute;left:12px;top:12px;background:#E0337A;color:#fff;font-size:28px;font-weight:700;padding:4px 14px}
.setsum{align-self:stretch;background:#fff;text-align:center;font-size:34px;padding:14px 20px;letter-spacing:-0.5px;color:#111}
.setsum b{color:#E0337A}
/* VS */
.vswrap{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:24px;position:relative}
.vscol{display:flex;flex-direction:column;gap:16px;min-height:0}
.vsimg{flex:1;min-height:0;background:#fff;border:6px solid #fff;display:flex;flex-direction:column}
.vsimg img{flex:1;min-height:0;width:100%;object-fit:cover}
.vsimg img.contain{object-fit:contain;background:#fff;padding:10px}
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
.grid{flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:24px;min-height:0}
/* 카톡 캡처 패널 */
.kpanel{background:#FFDDE2;border-radius:6px;padding:20px 22px 22px;display:flex;flex-direction:column;gap:14px}
.khead{display:flex;align-items:center;gap:10px;font-size:26px;font-weight:700;color:#3a3a3a;letter-spacing:-0.5px}
.khead .dot{width:44px;height:44px;border-radius:16px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:24px}
.kb{background:#fff;border:2.5px solid #4a4a4a;border-radius:30px;padding:16px 22px;align-self:flex-start}
.kimg{position:relative}
.kimg img{display:block;width:100%}
.hl{position:absolute;background:rgba(255,226,0,.5);mix-blend-mode:multiply}
.kraw{display:block;width:647px}
.rbg{position:absolute;inset:-30px;width:1026px;height:1348px;object-fit:cover;filter:blur(14px)}
.rdim{position:absolute;inset:0;background:rgba(40,30,25,.35)}
.rwrap{position:absolute;left:40px;right:40px;top:60px;bottom:60px;display:flex;flex-direction:column;align-items:center;justify-content:space-between}
.rtitle{color:#fff;font-size:64px;font-weight:900;letter-spacing:-1.5px;text-shadow:0 2px 3px rgba(0,0,0,.4),0 4px 16px rgba(0,0,0,.45)}
.rtitle span{color:#FFD84D}
.rcard{background:#fff;border-radius:22px;padding:20px 26px;box-shadow:0 8px 26px rgba(0,0,0,.25);width:100%}
.rcard .kimg{width:100%}
.rraw{display:block;width:58.75%}
.rsrc{color:#fff;font-size:24px;opacity:.85;letter-spacing:-0.3px}
.shots{flex:1;min-height:0;background:#FFDDE2;padding:22px 26px;display:flex;flex-direction:column;justify-content:space-between}
.shot{background:#FFDDE2;align-self:flex-start;filter:drop-shadow(0 6px 14px rgba(0,0,0,.14))}
.shot .kb{width:784px;padding:12px 20px;background:#fff}
.stag{display:inline-block;background:#E0337A;color:#fff;font-size:27px;font-weight:700;padding:4px 16px;margin:0 0 8px 6px;letter-spacing:-0.5px}
.kpanel.float{position:absolute;left:34px;right:34px;box-shadow:0 8px 28px rgba(0,0,0,.18)}
/* 가격 */
.pstage{position:absolute;left:0;top:0;width:966px;height:660px;background:radial-gradient(ellipse at 50% 55%,#fff6f2 0%,#f3e7df 55%,#e6ddd1 100%)}
.pcut{position:absolute;left:50%;top:44px;height:590px;transform:translateX(-50%)}
.pshadow{position:absolute;left:50%;top:590px;width:520px;height:60px;transform:translateX(-46%);background:radial-gradient(ellipse,rgba(0,0,0,.22),rgba(0,0,0,0) 70%)}
.pbox{position:absolute;left:26px;right:26px;top:640px;bottom:60px;display:flex;flex-direction:column;align-items:center;justify-content:space-between}
.dgwrap{align-self:stretch;background:#fff;padding:18px 20px 20px}
.dgwrap .dh{font-size:34px;font-weight:700;color:#333;letter-spacing:-0.5px;margin-bottom:8px}
.dgwrap .dh b{color:#E0337A}
.dgwrap .dh small{font-size:24px;color:#999;font-weight:500}
.dgbar{display:block;width:100%}
.dgrow{display:flex;gap:10px;margin-top:4px}
.dgrow img{flex:1;min-width:0;width:33%;display:block;border:2px solid #f3f3f3}
.cmp{background:#fff;align-self:stretch;padding:2px 26px}
.cmp .row{display:flex;justify-content:space-between;align-items:center;height:64px;border-bottom:1px solid #eee;font-size:29px;letter-spacing:-0.5px;color:#444}
.cmp .row:last-child{border-bottom:none;color:#111;font-weight:700}
.cmp .row s{color:#999}
.cmp .v{font-weight:700;color:#333}
.cmp .row:last-child .v{color:#E0337A;font-weight:900}
`;

const item = ([k, t]) => `<div class="${k}">${t}</div>`;
const groups = (s) => (s.groups || []).map((gr) => `<div class="stack ${gr.align}" style="${gr.mid ? 'top:50%;transform:translateY(-50%)' : 'top:' + gr.top + '%'}${gr.x != null ? (gr.align === 'r' ? ';right:' : ';left:') + gr.x + 'px' : ''}">${gr.items.map(item).join('')}</div>`).join('');

const vsCol = (side, ok) => `<div class="vscol ${ok ? 'ok' : ''}"><div class="vsimg"><img class="${side.contain ? 'contain' : ''}" src="${img(side.src)}"><div class="vsname ${ok ? 'ok' : ''}">${side.name}</div></div>`
  + `<div class="vslist">${side.rows.map(([b, s]) => `<div class="vsrow"><span class="mk">${ok ? '✓' : '✕'}</span><span><b>${b}</b><small>${s}</small></span></div>`).join('')}</div></div>`;

const khead = `<div class="khead"><span class="dot">${emo('💬')}</span>실제 카톡으로 받은 후기</div>`;

const card = (s) => {
  if (s.card === 'set') return `<div class="card"><div class="title">이번 공구 구성 ${emo('🎁')}</div><div class="setgrid">`
    + `<div class="cell main"><img src="${img(137)}"><div class="cap">범보의자 + 트레이 + <b>바른자세쿠션</b></div></div>`
    + `<div class="cell"><img src="${img(158)}"><div class="cap">바른자세쿠션</div></div>`
    + `<div class="cell" style="position:relative"><img src="${img(160)}"><span class="gtag">+ 증정 ${emo('🎁')}</span><div class="cap">아기핸드폰</div></div>`
    + `</div><div class="setsum">의자 + 트레이 + 쿠션 세트에 <b>${DEAL.gift}까지</b> 드려요</div></div>`;
  if (s.card === 'vs') return `<div class="card"><div class="title">${s.title}</div><div class="vswrap">${vsCol(s.left, false)}${vsCol(s.right, true)}<div class="vsbadge">VS</div></div></div>`;
  if (s.card === 'checks') return `<div class="card"><div class="title">${s.title}</div>`
    + s.rows.map((r) => `<div class="chk"><div class="ph"><img src="${img(r.src)}"></div><div><div class="ct"><span class="mk2">✓</span>${r.t}</div><div class="cd">${r.d}</div></div></div>`).join('')
    + `<div class="box">${s.foot}</div></div>`;
  if (s.card === 'grid') return `<div class="card"><div class="title">${s.title}</div><div class="grid">`
    + s.cells.map((c) => `<div class="cell"><img src="${img(c.src)}"><div class="cap">${c.cap}</div></div>`).join('')
    + `</div><div class="box">${s.foot}</div></div>`;
  if (s.card === 'reviews') {
    // 참고: 다른 공구 계정 후기 장 = 흐린 생활 사진 배경 + 흰 굵은 제목 + 가운데 흰 후기 캡처 카드
    const card2 = (src, raw) => `<div class="rcard">${raw ? `<img class="rraw" src="${img(src)}">` : `<div class="kimg"><img src="${img(src)}">${(KAKAO[src]?.hl || []).map(([x, y, w, h]) => `<i class="hl" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"></i>`).join('')}</div>`}</div>`;
    return `<img class="rbg" src="${img(149)}"><div class="rdim"></div><div class="rwrap"><div class="rtitle">써본 엄마들 <span>#찐후기</span></div>`
      + card2('r_night') + card2('r_floor') + card2('r_keep') + card2('r_manner', true)
      + `<div class="rsrc">실사용 엄마들과 나눈 카톡 캡처</div></div>`;
  }
  if (s.card === 'price') return `<div class="pstage"><div class="pshadow"></div><img class="pcut" src="../src/cut_150t.png"></div><div class="pbox"><div class="title">그래서 가격은요? ${emo('👀')}</div>`
    + `<div class="cmp"><div class="row"><span>공식몰에서 의자 + 쿠션 따로 사면</span><span class="v"><s>103,800원</s></span></div>`
    + `<div class="row"><span>이번 공구 · 새 제품 + 쿠션 + ${DEAL.gift}</span><span class="v">'알람'으로 공개 ${emo('🔒')}</span></div></div>`
    + `<div class="big-box"><b class="pink">'${DEAL.keyword}'</b> 댓글 남기면 정가 대비<br><b class="pink">최대 ${DEAL.maxRate} 할인</b> 링크 오픈 당일에 보내드려요!</div>`
    + `<div class="dark">10/22(목)~10/24(토) <b>단 3일</b> ${emo('⏰')}</div></div>`;
  return '';
};

const bg = (s) => s.card ? card(s) : `<img class="bg" src="${img(s.src)}" style="object-position:${s.pos || 'center'}${s.zoom ? ';transform:scale(' + s.zoom + ');transform-origin:50% 0' : ''}">${s.soft ? '<div class="soft"></div>' : ''}${s.sticker ? `<img class="sticker" src="../src/${s.sticker}.png">` : ''}${s.patch ? `<div class="patch" style="left:${s.patch[0]}%;top:${s.patch[1]}%;width:${s.patch[2]}%;height:${s.patch[3]}%"></div>` : ''}`;
const kakao = (s) => s.kakao ? `<div class="kpanel float" style="top:${s.kakao.top}%">${khead}${s.kakao.items.map((k) => bubble(k, '94%')).join('')}</div>` : '';

slides.forEach((s, i) => {
  const n = String(i + 1).padStart(2, '0');
  const htmlPath = join(root, 'html', `slide_${n}.html`);
  writeFileSync(htmlPath, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${bg(s)}${groups(s)}${kakao(s)}</body></html>`, 'utf8');
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=966,1288', '--virtual-time-budget=8000', `--screenshot=${join(root, 'out', `bumbo_${n}.png`)}`, 'file:///' + htmlPath], { stdio: 'ignore' });
  console.log('done', n);
});
