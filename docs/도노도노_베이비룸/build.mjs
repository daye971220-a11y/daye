// 도노도노 베이비룸 캐러셀: 신생아 때부터 베이비룸 쓴 이유 (생활 이야기형 → 실사용 리뷰형)
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
const slides = [
  // 1 표지 — 썸네일 통일 기준
  { src: 'pc', soft: true, groups: [
    { ...g(50, 'c', ['label', '<b>도노도노</b> 베이비룸'], ['cover', '신생아 때부터<br>베이비룸 쓴 이유']), mid: true },
  ]},
  // 2 그 전의 불편 (블로그: 안아 재우느라 서 있는 시간, 출산 직후 관절, 딱딱한 나무바닥)
  { src: 'p2', groups: [
    g(6, 'c', ['box', '아기 안고 재우다 보면<br>서 있는 시간이 정말 길어요 <span class="emo">🥲</span>']),
    g(77, 'c', ['box', '출산 직후라 관절도 약한데<br>딱딱한 나무 바닥이라 <b>발목이 너무 아팠어요</b>']),
  ]},
  // 3 그래서 베이비룸 (블로그: 매트 시공은 월세·비용 부담 → 베이비룸, 푹신+적당히 탄탄)
  { src: 116, groups: [
    g(5, 'c', ['box', '매트 시공은 비싸고 곧 이사도 가야 해서<br><b>베이비룸 + 매트</b>로 거실 한쪽을 바꿨어요']),
    g(78, 'c', ['box', '푹신하면서도 적당히 탄탄해서<br>여기 있으면 관절이 안 아파요']),
  ]},
  // 4 아기 눕힐 곳 (블로그: 소파에서 안고 있다 매번 아기침대로 → 모빌·체육관 두고 깨어있는 시간 놀이 공간)
  { src: 'p1', groups: [
    { ...g(43, 'r', ['box', '전엔 안고 있다가 눕히려면<br>매번 아기침대까지 갔는데']), x: 40 },
    g(80, 'c', ['box', '이젠 모빌 두고<br><b>깨어 있는 시간 놀이 공간</b>이 됐어요']),
  ]},
  // 5 와이드뷰 (블로그 + 공식)
  { src: 'p5', groups: [
    g(4, 'c', ['box', '주방이나 소파에 있어도<br>가드 사이로 아기가 다 보여요']),
    g(80, 'c', ['box', '아기도 안에서 엄마 아빠를 볼 수 있는<br><b>와이드뷰 가드</b>예요']),
  ]},
  // 6 소재·인증 (블로그: HDPE, 두께·마감, KC / 위틀스토어 후기: 튼튼하다는 말이 가장 많음)
  { src: 'p3', groups: [
    g(5, 'c', ['box', '매일 잡고 기대고 흔드는 거라<br><b>소재</b>부터 확인했어요']),
    g(72, 'c', ['box', '무게감 있는 <b>HDPE</b> 소재 · <b>KC 인증</b> 어린이제품'], ['sm', '구매 후기에서도 "튼튼하다"는 말이 제일 많았어요']),
  ]},
  // 7 밀림방지 (블로그 + 공식: 2중 밀림방지 논슬립캡) — 자막은 논슬립캡 바로 위
  { src: 123, groups: [
    g(5, 'c', ['box', '잡고 일어서기 시작하면<br><b>안 밀리는 게</b> 제일 중요해요']),
    g(63, 'c', ['box', '바닥 흡착 + 밀림방지 패드<br><b>2중 논슬립캡</b>이라 잘 안 밀려요']),
  ]},
  // 8 높이·출입문 + 강아지 (블로그: 66cm 하이가드, 쉽게 못 여는 출입문 / 사진: 강아지는 밖)
  { src: 'p8', groups: [
    g(4, 'c', ['box', '<b>66cm 하이가드</b>라 쉽게 못 넘어오고<br>출입문도 아기가 쉽게 못 열어요']),
    { ...g(84, 'l', ['box', '강아지는 밖에서, 아기는 안에서 <span class="emo">🐶</span>']), x: 40 },
  ]},
  // 9 오래 쓰는 이유 (블로그: 크기 조절·볼풀장, 커서는 주방 가드, 놀이가드, 컬러 2종) — 공식 이미지
  { collage: [
      { src: 112, cap: '칸 줄여서 볼풀장으로' },
      { src: 110, cap: '커서는 주방 가드로' },
      { src: 114, cap: '놀이가드로 손 놀이', fit: 'contain' },
      { src: 111, cap: '퓨어밀크 · 오트밀', fit: 'contain' },
    ], groups: [
    g(4, 'c', ['title', '누워 있을 때부터 <b>걸음마 이후</b>까지']),
    g(84, 'c', ['box', '조립식이라 칸을 <b>더하고 빼서</b> 크기 조절해요']),
  ]},
  // 10 마무리 — 추천 + 저장·공유
  { src: 'p4', groups: [
    g(46, 'c', ['box', '그래서 베이비룸은<br><b>출산 전에 미리 설치</b>해두길 추천해요']),
    g(72, 'c', ['big-box', '베이비룸 고를 때<br><b class="pink">저장</b>해두고 비교해보세요 <span class="emo">📌</span>'], ['box', '예비맘 친구에게 <b>공유</b>도 <span class="emo">💌</span>']),
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
.cell{position:absolute;overflow:hidden;border:6px solid #fff;background:#fff}
.cell img{width:100%;height:calc(100% - 52px);object-fit:cover}
.cell img.contain{object-fit:contain}
.cell .cap{position:absolute;left:0;right:0;bottom:0;height:52px;background:#fff;font-size:28px;font-weight:500;text-align:center;line-height:52px;letter-spacing:-0.5px;color:#111}
`;

const item = ([k, t]) => `<div class="${k}">${t}</div>`;
const groups = (s) => s.groups.map((gr) => `<div class="stack ${gr.align}" style="${gr.mid ? 'top:50%;transform:translateY(-50%)' : 'top:' + gr.top + '%'}${gr.x != null ? (gr.align === 'r' ? ';right:' : ';left:') + gr.x + 'px' : ''}">${gr.items.map(item).join('')}</div>`).join('');

const bg = (s) => {
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
