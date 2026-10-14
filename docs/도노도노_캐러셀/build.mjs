// 도노도노 트롤리 기저귀갈이대 공구 오픈예정 캐러셀 (966×1288, 사진만)
// 디자인: 하베브릭스 스토리와 동일 — 흰 각진 상자 + 검정 고딕, 사진이 주인공
// 기획 원칙: docs/공구콘텐츠_기획원칙.md / 문구 출처: 대표님 블로그(2편) + 위틀스토어 공식 상세페이지
import { writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = 'C:/Users/user/Desktop/daye/delivery/donodono_carousel';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
for (const d of ['html', 'out']) mkdirSync(join(root, d), { recursive: true });
for (const f of readdirSync(join(root, 'out'))) rmSync(join(root, 'out', f), { force: true });

// 이번 공구 조건 (다예님 제공 표)
const DEAL = { list: '354,000', price: '209,000', rate: '41%', gift: '기저귀 크림스틱', limit: '250세트 한정', keyword: '알람' };

// 글씨 묶음: g(top%, 정렬, 항목...) / 항목: title, box, sm(작은 상자), big-box, dark
const g = (top, align, ...items) => ({ top, align, items });
const slides = [
  // 1 표지 — 하베브릭스 공구예고와 같은 시리즈 형식
  { src: 72, soft: true, groups: [
    g(6, 'c', ['label', '<b>도노도노</b> 트롤리 기저귀갈이대'], ['cover', '최저가 공구예고']),
  ]},
  // 2 허리 (블로그: 바닥까지 허리 숙이고 안아 올리기 힘듦 / 어른 허리 높이)
  { src: 71, groups: [
    g(7, 'r', ['box', '출산하고 나니 바닥까지 허리 숙였다<br>안아 올리는 게 생각보다 힘들더라고요 <span class="emo">🥲</span>']),
    g(80, 'l', ['box', '갈이대 높이가 딱 허리라<br>엄마 아빠 허리 지켜줘요 🙌']),
  ]},
  // 3 버둥 (블로그: 얌전히 누워있을 줄 알았는데 전혀 / 휘청거림 적음)
  { src: 63, groups: [
    g(7, 'c', ['box', '신생아라 얌전히 누워 있을 줄 알았는데<br>전혀요! 다리 차고 용쓰고 ㅋㅋ']),
    g(84, 'c', ['box', '그래도 갈이대는 같이 안 흔들려요 👌']),
  ]},
  // 4 트롤리형 선택 (블로그: X자형 고민 → 트롤리, 접을 일 없음)
  // → 피드백 반영: X자형(AI 예시 이미지) vs 도노도노 트롤리형 비교 한 장
  { vs: {
      left: { src: 'xtype_ai3', name: 'X자형', pros: ['버둥거리면 같이<br>흔들려서 불안', '천 커버라 디자인이<br>지저분해 보임', '수납공간 없음'] },
      right: { src: 56, name: '도노도노 트롤리형', pros: ['<b>튼튼함</b><small>3면 통판 · 최대 60kg 하중</small>', '<b>플라스틱이라 세척 용이</b><small>오염돼도 닦아주기만 하면 끝</small>', '<b>든든한 수납공간</b><small>걸이형 정리함 + 대용량 선반</small>'] },
    }, groups: [
    g(4, 'c', ['title', '원래 X자형 사려다 트롤리형으로 바꿨어요']),
  ]},
  // 5 오염 (블로그: 새 기저귀 꺼내는 찰나에 또 / 천 커버 비위생, 슥 닦기 / 패드 번갈아)
  { src: 70, groups: [
    g(30, 'c', ['box', '새 기저귀 꺼내는 그 찰나에<br>아기가 또 쌀 때 있죠 <span class="emo">🥲</span>']),
    g(76, 'c', ['box', '방수패드 덕분에 갈이대는 늘 깨끗하고<br>패드만 <b>쏙 빼서 빨면</b> 끝!']),
  ]},
  // 6 걸이형 정리함 (블로그: 한 손으로 아기 잡고 물티슈 찾기)
  { src: 62, groups: [
    g(7, 'l', ['box', '한 손으로 아기 잡고 있으면<br>필요한 게 꼭 멀리 있더라고요 <span class="emo">🥲</span>']),
    g(80, 'r', ['box', '갈이대 옆 정리함에<br>기저귀 · 크림 · 손수건<br><b>손만 뻗으면</b> 바로 꺼내요 🙌']),
  ]},
  // 7 수납 (맘카페 망설임: 뒤집기 전까지만 / 공식: 졸업 후 수납장)
  { src: 68, groups: [
    g(46, 'c', ['box', '뒤집기 전까지만 쓰는 거 아니냐고요?'], ['box', '기저귀갈이대 졸업해도<br><b>수납장으로 계속</b> 써요 💛']),
  ]},
  // 8 목욕 후 + 바퀴 (블로그: 목욕 후 자지러지게 울 때 한자리에서 / 바퀴로 욕실 동선)
  { src: 59, groups: [
    g(6, 'c', ['box', '목욕 끝나고 옷을 빨리 안 입히면<br>자지러지게 울어요 <span class="emo">🥲</span>']),
    { ...g(36, 'l', ['box', '그래서 목욕할 땐<br>바퀴로 욕실 앞까지 <b>쓱</b>']), x: 40 },
    g(80, 'c', ['box', '발로 <b>딸깍</b> 고정하고<br>기저귀 · 크림 · 옷까지 바로 한 번에!']),
  ]},
  // 9 세트 구성
  { collage: [56, 66, 74, 'blanket_official'], groups: [
    g(4, 'c', ['title', '이번 공구 구성 🎁']),
  ], gift: { src: 'creamstick_official', name: '보타니컬테라피 시카 기저귀 크림스틱 (17g)', desc: '기저귀 갈 때 엉덩이에 쓱 바르는 스틱형 크림' }, labels: ['트롤리 기저귀갈이대', '걸이형 정리함', '방수패드', '리틀드리머 블랭킷'] },
  // 10 마지막 — 하베브릭스 공구예고 마지막 장과 같은 구성 (가격 비공개, 할인율 + 알람)
  { src: 60, groups: [
    g(8, 'c', ['title', '그래서 가격은요? 👀']),
    g(40, 'c', ['big-box', `<b class="pink">'${DEAL.keyword}'</b> 댓글 남기면<br>정가 대비 <b class="pink">${DEAL.rate} 할인</b> 링크<br>오픈 당일에 보내드려요!`], ['dark', `+ 구매하면 ${DEAL.gift} <b>증정</b> 🎁`]),
    g(80, 'c', ['box', `<b>${DEAL.limit}</b>이라 알람 꼭 걸어두세요!`]),
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
.cover{color:#fff;font-size:124px;font-weight:900;letter-spacing:-2px;line-height:1.18;text-align:center;
  text-shadow:0 2px 3px rgba(0,0,0,.45),0 4px 18px rgba(0,0,0,.55)}
.tag{background:#E0337A;color:#fff;font-size:34px;font-weight:700;padding:10px 30px;letter-spacing:-0.5px}
.shade{position:absolute;left:0;right:0;top:0;height:52%;background:linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.3) 55%,rgba(0,0,0,0))}
.price{background:#fff;width:720px;padding:24px 36px;text-align:center;color:#111;letter-spacing:-0.5px}
.price .row{font-size:30px;color:#888}.price .row s{color:#999}
.price .deal{font-size:64px;font-weight:900;color:#E0337A;line-height:1.2}.price .deal span{font-size:34px;margin-left:10px}
.price .perks{margin-top:10px;display:flex;justify-content:center;gap:12px}
.price .perks div{background:#1e1a18;color:#fff;font-size:28px;font-weight:500;padding:8px 18px}
.price .perks b{color:#FFD84D}
.gift{position:absolute;left:26px;right:26px;top:1028px;height:200px;background:#fff;border:6px solid #fff;display:flex;align-items:center;gap:26px;padding-right:20px}
.gift img{height:186px;width:120px;object-fit:cover}
.gift .g1{display:inline-block;background:#E0337A;color:#fff;font-size:28px;font-weight:700;padding:4px 14px;margin-bottom:8px}
.gift .g2{font-size:34px;font-weight:700;color:#111;letter-spacing:-0.5px;line-height:1.3}
.gift .g3{font-size:27px;color:#555;margin-top:4px;letter-spacing:-0.5px}
.vsimg{position:absolute;top:150px;width:456px;height:470px;overflow:hidden;background:#fff}
.vsimg img{width:100%;height:100%;object-fit:cover}
.vsname{position:absolute;left:0;right:0;bottom:0;background:#fff;text-align:center;font-size:32px;font-weight:500;padding:8px 0;color:#555;letter-spacing:-0.5px}
.vsname.ok{color:#E0337A;font-weight:700}
.vsbadge{position:absolute;left:443px;top:345px;width:80px;height:80px;border-radius:50%;background:#1e1a18;color:#fff;font-size:32px;font-weight:900;display:flex;align-items:center;justify-content:center;letter-spacing:-1px}
.vslist{position:absolute;top:638px;width:456px;background:#fff;padding:14px 22px}
.vsrow{display:flex;align-items:center;gap:14px;font-size:29px;line-height:1.3;letter-spacing:-0.5px;color:#222;padding:9px 0;border-bottom:1px solid #eee}
.vsrow:last-child{border-bottom:none}
.vsrow b{color:#E0337A;font-weight:700;display:block}
.vsrow small{display:block;font-size:23px;color:#777;margin-top:2px;letter-spacing:-0.4px}
.mk{flex:none;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff}
.mk.no{background:#9b948c}.mk.ok{background:#E0337A}
.vsnote{position:absolute;left:0;right:0;top:1198px;text-align:center;font-size:22px;color:#6f675e;letter-spacing:-0.3px}
.cards{position:absolute;left:18px;right:18px;top:975px;display:flex;gap:12px;flex-wrap:wrap}
.card{flex:1;background:#fff;overflow:hidden}
.card img{width:100%;height:160px;object-fit:cover;display:block}
.card img[src*=card_panel]{object-fit:contain;background:#f6eee8}
.card div{font-size:25px;font-weight:500;text-align:center;padding:7px 0;color:#E0337A;letter-spacing:-0.5px}
.cardsrc{width:100%;text-align:right;font-size:19px;color:#7a7066;margin-top:-4px}
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
const groups = (s) => s.groups.map((gr) => `<div class="stack ${gr.align}" style="top:${gr.top}%${gr.x != null ? (gr.align === 'r' ? ';right:' : ';left:') + gr.x + 'px' : ''}">${gr.items.map(item).join('')}</div>`).join('');

const bg = (s) => {
  if (s.vs) {
    const col = (side, k) => {
      const x = 18 + k * 474, ok = k === 1;
      const rows = side.pros.map((p) => `<div class="vsrow"><span class="mk ${ok ? 'ok' : 'no'}">${ok ? '✓' : '✕'}</span><span>${p}</span></div>`).join('');
      return `<div class="vsimg" style="left:${x}px"><img src="../src/${side.src}.jpg"><div class="vsname ${ok ? 'ok' : ''}">${side.name}</div></div>`
        + `<div class="vslist" style="left:${x}px">${rows}</div>`;
    };
    return '<div style="position:absolute;inset:0;background:#e6ddd1"></div>' + col(s.vs.left, 0) + col(s.vs.right, 1)
      + '<div class="vsbadge">VS</div>'
      + '<div class="cards">' + [['card_panel', '다리 대신 3면 통판'], ['card_clean', '물 · 오염은 슥 닦기'], ['card_storage', '대용량 수납 선반']]
        .map(([src, cap]) => `<div class="card"><img src="../src/${src}.jpg"><div>${cap}</div></div>`).join('') + '</div>';
  }
  if (!s.collage) return `<img class="bg" src="../src/${s.src}.${s.src === 65 ? 'png' : 'jpg'}">${s.shade ? '<div class="shade"></div>' : ''}${s.soft ? '<div class="soft"></div>' : ''}`;
  // 2×2 구성 그리드 (제목 아래)
  const W = 445, H = 400, x0 = 26, y0 = 182, gap = 22;
  return `<div style="position:absolute;inset:0;background:#e6ddd1"></div>` + s.collage.map((src, k) => {
    const x = x0 + (k % 2) * (W + gap), y = y0 + Math.floor(k / 2) * (H + gap);
    return `<div class="cell" style="left:${x}px;top:${y}px;width:${W}px;height:${H}px"><img src="../src/${src}.jpg" style="object-position:center ${src === 'blanket_official' ? '60%' : '50%'}"><div class="cap">${s.labels[k]}</div></div>`;
  }).join('') + (s.gift ? `<div class="gift"><img src="../src/${s.gift.src}.jpg"><div><div class="g1">+ 증정 🎁</div><div class="g2">${s.gift.name}</div><div class="g3">${s.gift.desc}</div></div></div>` : '');
};

slides.forEach((s, i) => {
  const n = String(i + 1).padStart(2, '0');
  const htmlPath = join(root, 'html', `slide_${n}.html`);
  writeFileSync(htmlPath, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${bg(s)}${groups(s)}</body></html>`, 'utf8');
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=966,1288', '--virtual-time-budget=8000', `--screenshot=${join(root, 'out', `dono_${n}.png`)}`, 'file:///' + htmlPath], { stdio: 'ignore' });
  console.log('done', n);
});
