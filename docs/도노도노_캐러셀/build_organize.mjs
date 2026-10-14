// 도노도노 기저귀갈이대 정보형 캐러셀 ②: 한 손으로 끝내는 기저귀 존 정리법 (사용법·활용형, 저장 유도)
// 디자인: 하베브릭스 스토리와 동일 — 흰 각진 상자 + 검정 고딕, 사진이 주인공
// 기획 원칙: docs/공구콘텐츠_기획원칙.md / 문구 출처: 대표님 블로그(2편) + 위틀스토어 공식 상세페이지
import { writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = 'C:/Users/user/Desktop/daye/delivery/donodono_carousel';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
for (const d of ['html', 'out_organize']) mkdirSync(join(root, d), { recursive: true });
for (const f of readdirSync(join(root, 'out_organize'))) rmSync(join(root, 'out_organize', f), { force: true });

// 이번 공구 조건 (다예님 제공 표)
const DEAL = { list: '354,000', price: '209,000', rate: '41%', gift: '기저귀 크림스틱', limit: '250세트 한정', keyword: '알람' };

// 글씨 묶음: g(top%, 정렬, 항목...) / 항목: title, box, sm(작은 상자), big-box, dark
const g = (top, align, ...items) => ({ top, align, items });
const slides = [
  // 1 표지 — 상황 훅 (케넨홈 표지 형식: 흰 띠 + 큰 흰 글씨)
  { src: 66, soft: true, groups: [
    g(6, 'c', ['label', '<b>도노도노</b> 기저귀갈이대 정리법'], ['cover', '"물티슈 어디 갔지?"<br>이제 그만!']),
  ]},
  // 2 문제 (블로그: 한 손으로 아기 잡고 물티슈 찾으면 난이도 두 배)
  { src: 71, groups: [
    g(7, 'r', ['box', '기저귀 갈 땐 한 손으로<br>아기를 잡고 있을 때가 많아요 🥲'], ['box', '그때 물티슈 찾기 시작하면<br>난이도가 <b>두 배</b>가 돼요 ㅠㅠ']),
  ]},
  // 3 걸이형 정리함 — 기저귀·손수건
  { src: 62, groups: [
    g(7, 'l', ['box', '① 걸이형 정리함엔<br>기저귀 · 손수건'], ['box', '갈다가 <b>손만 뻗으면</b> 바로 🙌']),
  ]},
  // 4 크림 세워 꽂기
  { src: 67, groups: [
    g(6, 'c', ['box', '② 크림 · 로션은 세워서 쏙'], ['box', '뚜껑만 열고 바로 발라요']),
  ]},
  // 5 칸 나누기
  { src: 64, groups: [
    g(82, 'c', ['box', '③ 칸이 나뉘어 있어서<br>자주 쓰는 것끼리 <b>칸칸이</b> 정리 💛']),
  ]},
  // 6 아래 선반 — 대용량 (공식: 대용량 수납 선반)
  { src: 68, groups: [
    g(46, 'c', ['box', '④ 대용량 기저귀팩 · 물티슈는<br>아래 선반에 넉넉하게'], ['box', '위에 다 쓰면 <b>바로 아래서</b> 채워요']),
  ]},
  // 7 손수건 돌돌
  { src: 69, groups: [
    g(78, 'c', ['box', '⑤ 손수건은 돌돌 말아 세워두면<br>한 장씩 <b>쏙쏙</b> 빼기 편해요']),
  ]},
  // 8 마무리 — 목욕 후 한자리 + 저장 유도 + 공구 연결
  { src: 63, groups: [
    g(6, 'c', ['box', '목욕하고 나와 자지러지게 울어도<br>기저귀 · 크림 · 옷까지 <b>한자리에서 끝!</b>']),
    g(78, 'c', ['big-box', '출산 전에 <b class="pink">저장</b>해두고<br>그대로 따라 해보세요 📌'], ['sm', '도노도노 기저귀갈이대 공구 알림은 \'알람\' 댓글로 🔔']),
  ]},
];


const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=block');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:966px;height:1288px;overflow:hidden;background:#f4f1ec;font-family:'Noto Sans KR','Malgun Gothic',sans-serif}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.stack{position:absolute;display:flex;flex-direction:column;gap:16px}
.c{left:0;right:0;align-items:center}.l{left:60px;align-items:flex-start}.r{right:60px;align-items:flex-end}
.box,.title,.sm{background:#fff;color:#111;text-align:center;font-weight:400;letter-spacing:-0.5px;line-height:1.38}
.box{font-size:35px;padding:12px 28px}
.box b,.title b{font-weight:700;color:#E0337A}
.sm{font-size:26px;padding:8px 20px;color:#444}
.title{font-size:44px;padding:16px 40px}
.pink{color:#E0337A;font-weight:900}
.big-box{background:#fff;color:#111;text-align:center;font-size:44px;font-weight:500;line-height:1.38;letter-spacing:-0.5px;padding:22px 46px}
.big-box b{color:#E0337A}
.dark{background:rgba(30,26,24,.86);color:#fff;font-size:37px;padding:14px 32px;letter-spacing:-0.5px;font-weight:500}
.dark b{color:#FFD84D;font-weight:900}
.soft{position:absolute;left:0;right:0;top:0;height:32%;background:radial-gradient(ellipse at center,rgba(0,0,0,.28),rgba(0,0,0,0) 70%)}
.label{background:#fff;font-size:36px;font-weight:500;padding:10px 28px;letter-spacing:-0.5px;color:#1a1a1a}
.label b{color:#E0337A;font-weight:500}
.cover{color:#fff;font-size:100px;font-weight:900;letter-spacing:-2px;line-height:1.18;text-align:center;
  text-shadow:0 2px 3px rgba(0,0,0,.45),0 4px 18px rgba(0,0,0,.55)}
.tag{background:#E0337A;color:#fff;font-size:34px;font-weight:700;padding:10px 30px;letter-spacing:-0.5px}
.shade{position:absolute;left:0;right:0;top:0;height:52%;background:linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.3) 55%,rgba(0,0,0,0))}
.price{background:#fff;width:720px;padding:24px 36px;text-align:center;color:#111;letter-spacing:-0.5px}
.price .row{font-size:30px;color:#888}.price .row s{color:#999}
.price .deal{font-size:64px;font-weight:900;color:#E0337A;line-height:1.2}.price .deal span{font-size:34px;margin-left:10px}
.price .perks{margin-top:10px;display:flex;justify-content:center;gap:12px}
.price .perks div{background:#1e1a18;color:#fff;font-size:28px;font-weight:500;padding:8px 18px}
.price .perks b{color:#FFD84D}
.cell{position:absolute;overflow:hidden;border:6px solid #fff;background:#fff}
.cell img{width:100%;height:100%;object-fit:cover}
.cell .cap{position:absolute;left:0;right:0;bottom:0;background:#fff;font-size:28px;font-weight:500;text-align:center;padding:8px 0;letter-spacing:-0.5px;color:#111}
`;

const priceCard = `<div class="price">
  <div class="row">정가 <s>${DEAL.list}원</s></div>
  <div class="deal">${DEAL.price}원<span>(${DEAL.rate}↓)</span></div>
  <div class="perks"><div>+ ${DEAL.gift} <b>증정</b></div><div><b>${DEAL.limit}</b></div></div>
</div>`;
const item = ([k, t]) => k === 'price' ? priceCard : `<div class="${k}">${t}</div>`;
const groups = (s) => s.groups.map((gr) => `<div class="stack ${gr.align}" style="top:${gr.top}%">${gr.items.map(item).join('')}</div>`).join('');

const bg = (s) => {
  if (!s.collage) return `<img class="bg" src="../src/${s.src}.${s.src === 65 ? 'png' : 'jpg'}">${s.shade ? '<div class="shade"></div>' : ''}${s.soft ? '<div class="soft"></div>' : ''}`;
  // 2×2 구성 그리드 (제목 아래)
  const W = 445, H = 540, x0 = 26, y0 = 150, gap = 24;
  return `<div style="position:absolute;inset:0;background:#f4f1ec"></div>` + s.collage.map((src, k) => {
    const x = x0 + (k % 2) * (W + gap), y = y0 + Math.floor(k / 2) * (H + gap);
    return `<div class="cell" style="left:${x}px;top:${y}px;width:${W}px;height:${H}px"><img src="../src/${src}.jpg"><div class="cap">${s.labels[k]}</div></div>`;
  }).join('');
};

slides.forEach((s, i) => {
  const n = String(i + 1).padStart(2, '0');
  const htmlPath = join(root, 'html', `org_slide_${n}.html`);
  writeFileSync(htmlPath, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${bg(s)}${groups(s)}</body></html>`, 'utf8');
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=966,1288', '--virtual-time-budget=8000', `--screenshot=${join(root, 'out_organize', `org_${n}.png`)}`, 'file:///' + htmlPath], { stdio: 'ignore' });
  console.log('done', n);
});
