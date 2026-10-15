// 도노도노 베이비룸 공구예고 캐러셀 (갈이대 공구예고와 같은 흐름: 표지 → 사용 이야기 → 구성·사이즈 → 가격 비공개 + 알람)
// 공구 조건: 다예님 제공 표 옵션 C (2026-10-15)
// 문구 출처: 케넨님 블로그 후기(2026-09-17) + 위틀스토어 공식 상품정보·구매 후기 / 사진: 케넨님 촬영(p*: 원본 밝고 뽀얗게 보정) + 공식 이미지
// 디자인: 도노도노 갈이대 캐러셀과 동일 — 흰 각진 상자 + 검정 고딕, 표지는 썸네일 통일 기준(헤드카피 세로 정중앙)
// 기획 원칙: docs/공구콘텐츠_기획원칙.md
import { writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = 'C:/Users/user/Desktop/daye/delivery/donodono_babyroom';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
for (const d of ['html', 'out']) mkdirSync(join(root, d), { recursive: true });
for (const f of readdirSync(join(root, 'out'))) rmSync(join(root, 'out', f), { force: true });

// 글씨 묶음: g(top%, 정렬, 항목...) / 항목: title, box, sm(작은 상자), big-box, dark, label, cover, tag
const g = (top, align, ...items) => ({ top, align, items });

// 이번 공구 조건 (다예님 제공 표 옵션 C) — 할인율은 사이즈별 31·28·28·32·32% → "최대 32%"
const DEAL = { maxRate: '32%', gift: '올리브영 1만원', keyword: '알람' };
const SIZES = [
  ['특대형', '216 × 143'], ['슈퍼특대형', '253 × 143'], ['자이언트', '290 × 180'],
  ['슈퍼특대형 PLUS', '253 × 216'], ['자이언트 PLUS', '290 × 216'],
];
const slides = [
  // 1 표지 — 썸네일 통일 기준
  { src: 'pc', soft: true, groups: [
    { ...g(50, 'c', ['label', '<b>도노도노</b> 베이비룸 + 한판 매트'], ['cover', '최저가 공구예고']), mid: true },
  ]},
  // 2 이번 공구 구성 + 사이즈 5가지 + 증정 (게시된 갈이대 공구예고처럼 표지 바로 뒤)
  { sizes: true, groups: [
    g(4, 'c', ['title', '이번 공구 구성 <span class="emo">🎁</span>']),
  ]},
  // 3 그 전의 불편 (블로그: 안아 재우느라 서 있는 시간, 딱딱한 나무바닥, 발목)
  { src: 'p2', groups: [
    g(6, 'c', ['box', '출산하고 매일 아기 안고<br>서서 재우다 보니']),
    g(78, 'c', ['box', '딱딱한 나무 바닥에<br><b>발목이 너무 아프더라고요</b> <span class="emo">🥲</span>']),
  ]},
  // 4 그래서 베이비룸 + 한판 매트 (블로그: 매트 시공은 비용·이사 때문에 X, 푹신+적당히 탄탄, 관절 안 아픔)
  { src: 116, groups: [
    g(5, 'c', ['box', '매트 시공은 비싸고<br>이사도 가야 해서 패스 <span class="emo">🙅‍♀️</span>']),
    g(77, 'c', ['box', '베이비룸 + 한판 매트 깔았더니<br><b>푹신한데 탄탄</b>해서 관절이 편해요 <span class="emo">💛</span>']),
  ]},
  // 5 아기 눕힐 곳 (블로그: 눕힐 곳이 없어 매번 아기침대로 → 모빌 두고 깨어있는 시간 놀이 공간)
  { src: 'p1', groups: [
    { ...g(42, 'r', ['box', '전엔 눕힐 데가 없어서<br>매번 아기침대까지 왔다 갔다 <span class="emo">😅</span>']), x: 40 },
    g(80, 'c', ['box', '이젠 모빌 하나 두면<br><b>거실 놀이 공간</b> 완성! <span class="emo">🙌</span>']),
  ]},
  // 6 와이드뷰 (블로그: 주방·소파에서도 가드 사이로 확인, 아기도 엄마아빠를 봄)
  { src: 'p5', groups: [
    g(4, 'c', ['box', '주방에 있어도, 소파에 있어도']),
    g(80, 'c', ['box', '와이드뷰라 가드 사이로<br>아기가 <b>한눈에 쏙</b> 보여요 <span class="emo">👀</span>']),
  ]},
  // 7 튼튼 포인트 3가지 (블로그 + 공식: HDPE, 2중 논슬립캡, 66cm·출입문, KC)
  { checks: [
      { src: 'p3', t: '두툼한 HDPE 통판', d: '잡고 기대는 시기까지 생각한 두께' },
      { src: 123, pos: '50% 100%', t: '2중 논슬립캡', d: '바닥 흡착 + 밀림방지 패드로 꽉' },
      { src: 118, t: '66cm 하이가드 · 잠금 출입문', d: '쉽게 못 넘고, 쉽게 못 열어요' },
    ], groups: [
    g(4, 'c', ['title', '괜히 <b>"튼튼 밀림방지"</b>가 아니에요']),
    g(88, 'c', ['box', '<b>KC 인증</b> 받은 어린이제품이라 더 안심 <span class="emo">✔️</span>']),
  ]},
  // 8 강아지 (사진: 강아지는 밖, 아기는 안)
  { src: 'p8', groups: [
    g(4, 'c', ['box', '높이가 있어서<br><b>댕댕이도 출입 금지</b> ㅋㅋ']),
    { ...g(84, 'l', ['box', '강아지는 밖에서, 아기는 안에서 <span class="emo">🐶</span>']), x: 40 },
  ]},
  // 9 오래 쓰는 이유 (블로그: 크기 조절·볼풀장, 커서는 주방 가드, 놀이가드, 컬러 2종) — 공식 이미지
  { collage: [
      { src: 112, cap: '칸 줄여서 볼풀장으로' },
      { src: 110, cap: '커서는 주방 가드로' },
      { src: 114, cap: '놀이가드로 손 놀이', fit: 'contain' },
      { src: 111, cap: '퓨어밀크 · 오트밀', fit: 'contain' },
    ], groups: [
    g(4, 'c', ['title', '누워 있을 때부터 <b>걸음마 이후</b>까지 쭉 <span class="emo">💛</span>']),
    g(84, 'c', ['box', '조립식이라 칸 <b>넣었다 뺐다</b> 크기도 자유자재']),
  ]},
  // 10 마지막 — 갈이대·하베브릭스 공구예고 마지막 장과 같은 구성 (가격 비공개, 할인율 + 알람)
  { src: 'p0', groups: [
    g(5, 'c', ['title', '그래서 가격은요? <span class="emo">👀</span>']),
    g(42, 'c', ['big-box', `<b class="pink">'${DEAL.keyword}'</b> 댓글 남기면<br>정가 대비 <b class="pink">최대 ${DEAL.maxRate} 할인</b> 링크<br>오픈 당일에 보내드려요!`], ['dark', `+ 구매하면 ${DEAL.gift} <b>무조건 증정</b> <span class="emo">🎁</span>`]),
    g(82, 'c', ['box', `${DEAL.gift}은 추첨 아니고 <b>전원 증정!</b>`]),
  ]},
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=block');
@import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=block');
.emo{font-family:'Noto Color Emoji'}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:966px;height:1288px;overflow:hidden;background:#f4f1ec;font-family:'Noto Sans KR','Malgun Gothic',sans-serif}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.stack{position:absolute;display:flex;flex-direction:column;gap:16px}
.c{left:0;right:0;align-items:center}.l{left:60px;align-items:flex-start}.r{right:60px;align-items:flex-end}
.box,.title,.sm{background:#fff;color:#111;text-align:center;font-weight:400;letter-spacing:-0.5px;line-height:1.38}
.box{font-size:39px;padding:13px 30px}
.box b,.title b{font-weight:700;color:#E0337A}
.sm{font-size:28px;padding:8px 22px;color:#444}
.title{font-size:44px;padding:16px 40px}
.pink{color:#E0337A;font-weight:900}
.big-box{background:#fff;color:#111;text-align:center;font-size:44px;font-weight:500;line-height:1.38;letter-spacing:-0.5px;padding:22px 46px}
.big-box b{color:#E0337A}
.dark{background:rgba(30,26,24,.86);color:#fff;font-size:37px;padding:14px 32px;letter-spacing:-0.5px;font-weight:500}
.label{background:#fff;font-size:36px;font-weight:500;padding:10px 28px;letter-spacing:-0.5px;color:#1a1a1a}
.label b{color:#E0337A;font-weight:500}
.cover{color:#fff;font-size:124px;font-weight:900;letter-spacing:-2px;line-height:1.18;text-align:center;
  text-shadow:0 2px 3px rgba(0,0,0,.45),0 4px 18px rgba(0,0,0,.55)}
.tag{background:rgba(30,26,24,.86);color:#fff;font-size:34px;font-weight:700;padding:10px 30px;letter-spacing:-0.5px}
.soft{position:absolute;left:0;right:0;top:28%;height:44%;background:radial-gradient(ellipse at center,rgba(0,0,0,.30),rgba(0,0,0,0) 70%)}
.dark b{color:#FFD84D;font-weight:900}
.setimg{position:absolute;left:26px;right:26px;top:150px;height:380px;border:6px solid #fff;background:#fff;overflow:hidden}
.setimg img{width:100%;height:322px;object-fit:cover;object-position:center 60%}
.setimg .cap{height:52px;line-height:52px;text-align:center;font-size:30px;font-weight:700;letter-spacing:-0.5px;color:#111}
.setimg .cap b{color:#E0337A}
.sizes{position:absolute;left:26px;right:26px;top:556px;background:#fff;padding:14px 34px}
.sizes .hd{font-size:28px;color:#777;text-align:center;letter-spacing:-0.5px;padding:4px 0 10px;border-bottom:2px solid #eee}
.sizes .row{display:flex;justify-content:space-between;align-items:center;height:72px;border-bottom:1px solid #eee;font-size:34px;letter-spacing:-0.5px;color:#111}
.sizes .row:last-child{border-bottom:none}
.sizes .row b{font-weight:700}.sizes .row span{color:#555;font-weight:500}
.gift{position:absolute;left:26px;right:26px;top:1056px;height:176px;background:#fff;display:flex;align-items:center;gap:28px;padding:0 30px}
.gift .won{flex:none;width:150px;height:130px;background:#1e1a18;color:#FFD84D;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;font-size:44px;letter-spacing:-1px;line-height:1.1}
.gift .won small{font-size:24px;color:#fff;font-weight:500}
.gift .g1{display:inline-block;background:#E0337A;color:#fff;font-size:28px;font-weight:700;padding:4px 14px;margin-bottom:8px}
.gift .g2{font-size:38px;font-weight:700;color:#111;letter-spacing:-0.5px;line-height:1.3}
.chk{position:absolute;left:26px;right:26px;height:276px;background:#fff;display:flex;align-items:center;gap:30px;padding:0 30px 0 0}
.chk img{width:276px;height:276px;object-fit:cover;flex:none}
.chk .ct{font-size:40px;font-weight:700;color:#111;letter-spacing:-0.8px;display:flex;align-items:center;gap:12px}
.chk .mk{flex:none;width:44px;height:44px;border-radius:50%;background:#E0337A;color:#fff;font-size:26px;display:flex;align-items:center;justify-content:center}
.chk .cd{font-size:32px;color:#555;margin-top:10px;padding-left:56px;letter-spacing:-0.5px}
.cell{position:absolute;overflow:hidden;border:6px solid #fff;background:#fff}
.cell img{width:100%;height:calc(100% - 52px);object-fit:cover}
.cell img.contain{object-fit:contain}
.cell .cap{position:absolute;left:0;right:0;bottom:0;height:52px;background:#fff;font-size:28px;font-weight:500;text-align:center;line-height:52px;letter-spacing:-0.5px;color:#111}
`;

const item = ([k, t]) => `<div class="${k}">${t}</div>`;
const groups = (s) => s.groups.map((gr) => `<div class="stack ${gr.align}" style="${gr.mid ? 'top:50%;transform:translateY(-50%)' : 'top:' + gr.top + '%'}${gr.x != null ? (gr.align === 'r' ? ';right:' : ';left:') + gr.x + 'px' : ''}">${gr.items.map(item).join('')}</div>`).join('');

const bg = (s) => {
  if (s.checks) return '<div style="position:absolute;inset:0;background:#e6ddd1"></div>' + s.checks.map((c, k) =>
    `<div class="chk" style="top:${150 + k * 300}px"><img src="../src/${c.src}.jpg" style="object-position:${c.pos || 'center'}"><div><div class="ct"><span class="mk">✓</span>${c.t}</div><div class="cd">${c.d}</div></div></div>`).join('');
  if (s.sizes) return '<div style="position:absolute;inset:0;background:#e6ddd1"></div>'
    + '<div class="setimg"><img src="../src/107.jpg"><div class="cap">튼튼 밀림방지 베이비룸 + <b>먼지제로 투톤 한판 매트</b></div></div>'
    + '<div class="sizes"><div class="hd">사이즈 5가지 · 베이비룸 + 매트 세트 (cm)</div>' + SIZES.map(([n, d]) => `<div class="row"><b>${n}</b><span>${d}</span></div>`).join('') + '</div>'
    + `<div class="gift"><div class="won">1만원<small>올리브영</small></div><div><div class="g1">+ 증정 <span class="emo">🎁</span></div><div class="g2">구매하면 ${DEAL.gift}<br>무조건 드려요</div></div></div>`;
  if (!s.collage) return `<img class="bg" src="../src/${s.src}.jpg">${s.soft ? '<div class="soft"></div>' : ''}`;
  // 2×2 그리드 (제목 아래, 하단 상자 위)
  const W = 445, H = 420, x0 = 26, y0 = 150, gap = 24;
  return `<div style="position:absolute;inset:0;background:#e6ddd1"></div>` + s.collage.map((c, k) => {
    const x = x0 + (k % 2) * (W + gap), y = y0 + Math.floor(k / 2) * (H + gap);
    return `<div class="cell" style="left:${x}px;top:${y}px;width:${W}px;height:${H}px"><img class="${c.fit || ''}" src="../src/${c.src}.jpg"><div class="cap">${c.cap}</div></div>`;
  }).join('');
};

slides.forEach((s, i) => {
  const n = String(i + 1).padStart(2, '0');
  const htmlPath = join(root, 'html', `slide_${n}.html`);
  writeFileSync(htmlPath, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${bg(s)}${groups(s)}</body></html>`, 'utf8');
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=966,1288', '--virtual-time-budget=8000', `--screenshot=${join(root, 'out', `babyroom_${n}.png`)}`, 'file:///' + htmlPath], { stdio: 'ignore' });
  console.log('done', n);
});
