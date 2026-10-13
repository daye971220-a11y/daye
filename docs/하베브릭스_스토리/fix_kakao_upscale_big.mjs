// 하베브릭스 공구예고 스토리 세트 v3: 사진 슬라이드(966×1288 PNG) + 영상 슬라이드(1080×1920 MP4, 원본 소리)
// 영상 소리는 원본 그대로 쓰되 휴대폰 녹음이 작아서 loudnorm으로 크기만 맞춤
// 사진: HTML → 크롬 헤드리스 스크린샷 / 영상: 투명 자막 PNG를 크롬으로 뽑아 ffmpeg로 합성
import { writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = 'C:/Users/PC_1M/AppData/Local/Temp/claude/C--Users-PC-1M-Desktop-claude-practice/51a7024d-aed2-4077-b5f6-5cd958151054/scratchpad/fix';
const videoSrc = 'C:/Users/user/Downloads/육아 공구/모빌';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
for (const d of ['html', 'out', 'tmp']) mkdirSync(join(root, d), { recursive: true });
// 폴더가 탐색기에 열려 있어도 되도록 폴더 대신 안의 파일만 비움


// 공구 조건 (공구 제안서 기준)
const PRICE = { list: '299,000', deal: '157,000', rate: '47%', perItem: '약 7만 8천원', gift: '올리브영 5천원' };

// 글씨 묶음(g): [top%, 정렬('c'|'l'|'r'), 항목들]
// 항목: title(번호 제목) / box(흰 상자) / dark(검정 반투명 상자, 혜택 강조) / hot(분홍 글씨 흰 상자) / price(가격 카드) / cover(마지막 장)
const g = (top, align, ...items) => ({ top, align, items });
const slides = [
  { src: 24, groups: [
    // 문장을 한 덩어리로 뭉치지 않고 사진 빈 곳에 구간별로 나눠 배치 (아기 얼굴은 비움)
    { ...g(7, 'l', ['box', '아기가 2개월에 접어들며<br>깨어 있는 시간이 많아졌는데,<br>엄마가 놀아주는 법을 모르니<br>자꾸 짜증 내더라고요 <span class="emo">🥲</span>']), x: 60 },
    g(42, 'c', ['box', '흑백 모빌 보면서 눈맞춤 시작하고<br>엄마 손도 자유로워졌어요! 🙌']),
  ]},
  { video: '093703050', ss: 4.5, t: 6, groups: [
    g(12, 'c', ['box', '어제는 무려 1시간을 모빌만 보며<br>혼자 놀았어요!']),
    g(66, 'c', ['box', '양방향으로 크게 도는 와이드 모션'], ['box', '회전 반경이 40.5cm라<br>누워서 보기 딱 좋아요']),
  ]},
  { video: '093610405', ss: 8.5, t: 7, groups: [
    g(12, 'c', ['box', '인형 따라 눈이 쭉~ 따라가요 👀']),
    g(74, 'c', ['box', '이 집중력 실화인가요 ㅋㅋ']),
  ]},
  // 좌: 아기 침대에 단 모빌(사진 전체) / 우: 바닥 거치대(093703050 영상 캡처, 받침대까지 보이게 자름) — 2칸 비교
  { collage: [22, 'floorpanel'], groups: [
    g(7, 'c', ['box', '모빌은 분리형이라<br>아기 침대에도<br>부착할 수 있어요!']),
    g(78, 'c', ['big-box', '침대에 달아도 쏙 👌']),
  ]},
  { src: 20, groups: [
    g(40, 'c', ['box', '흑백 인형 → 컬러 인형<br>시기 따라 바꿔 달아요 🧸'], ['box', '3개월까지는 흑백 인형<br>3개월 이후엔 컬러 인형<br><b>인형 10종 전부</b> 보내드려요!']),
  ]},
  { video: '093758644', ss: 20, t: 8, groups: [
    g(12, 'c', ['box', '동요·클래식 29곡에 백색소음까지 🎶'], ['box', '엄마도 매일 듣다 보니<br>엄마가 더 신나해요 ㅋㅋㅋ']),
    // 아기 얼굴 아래(배 쪽), 인스타 하단 메시지창에 안 걸리게 80% 안쪽 + 글씨 살짝 작게
    g(70, 'c', ['box sm', '백색소음기 따로 안 사도<br>쉬~~ 소리가 나오니까<br>잘 때도 침대에 모빌 부착해 사용 가능!']),
  ]},
  // 표지 바로 뒤에 올 장: 1.5배속, 번호 제목 + 자막 처음부터 (위쪽 모빌은 비우고 가운데 울타리 쪽)
  { video: '093909163', ss: 0.3, t: 9.5, speed: 1.5, groups: [
    g(43, 'c', ['title', '1. 흑백/컬러 모빌'], ['box', '밥 한 끼 편하게 먹는 게<br>이렇게 소중할 줄이야 <span class="emo">😄</span>']),
    g(70, 'c', ['box', '아기는 모빌 보고<br>엄마는 편하게 밥 먹고 🥄']),
  ]},
  { src: 33, groups: [
    g(8, 'c', ['title', '2. 손 뻗기 시작하면 아기체육관 ✋'], ['box', '딸랑이 한번 잡으면 안 놔줘요 ㅋㅋ']),
    g(66, 'l', ['box', '손 뻗고, 잡고, 흔들고<br>혼자서도 잘 놀아요']),
  ]},
  { video: '093624634', ss: 22, t: 7, groups: [
    g(70, 'c', ['box', '모빌 + 손놀이 장난감까지<br>체육관 하나로 다 돼요']),
  ]},
  { src: 31, groups: [
    g(8, 'r', ['box', '딸랑이 · 비즈 · 거울까지<br>손놀이 장난감이 한가득']),
    g(78, 'c', ['box', '구슬 굴러가는 소리에<br>집중 또 집중 👀']),
  ]},
  { src: 27, groups: [
    g(80, 'c', ['box', '바람개비도 흑백 ↔ 컬러 양면 교체'], ['box', '안 쓸 땐 모빌대 접어서 보관 OK']),
  ]},
  { src: 30, groups: [
    { ...g(6, 'l', ['box sm', '타사 모빌 1개 가격에<br>모빌+체육관 같이!<br>당근보다 저렴한 거 실화? 😳']), x: 40 },
    g(76, 'c', ['box', '누워서 보는 시기엔 모빌<br>손발 뻗는 시기엔 아기체육관'], ['box', '신생아부터 뒤집기까지 이 세트로 쭉 💛']),
  ]},
  { video: '093738892', ss: 41, t: 5, groups: [
    g(12, 'c', ['box', '보다가 방긋 😊<br>이 표정 보려고 매일 틀어줘요']),
  ]},
  { src: 23, groups: [
    g(8, 'c', ['title', '그래서 가격은요? 👀']),
    // 가격 카드 대신 오픈 알림 안내 + 올리브영 혜택 강조
    g(56, 'c', ['big-box', '‘알람’ 설정하면<br>정가 대비 <b class="pink">47% 할인</b> 링크<br>오픈 당일에 보내드려요!'], ['dark', `+ 구매하면 ${PRICE.gift} <b>무조건</b> 증정 🎁`]),
    g(85, 'c', ['box', '5천원권은 추첨이 아닌 <b>전원 제공!</b><br>쓰기 어려운 적립금 아니고 <b>즉시 사용 가능!</b>']),
  ]},
  { src: 32, cover: true },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=block');
@import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=block');
/* 윈도우 기본 이모지는 입이 진분홍이라 화나 보여서, 필요한 곳만 노란 얼굴(노토) 이모지로 */
.emo{font-family:'Noto Color Emoji'}
*{margin:0;padding:0;box-sizing:border-box}
body{position:relative;overflow:hidden;font-family:'Noto Sans KR','Malgun Gothic',sans-serif}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.stack{position:absolute;display:flex;flex-direction:column;gap:16px}
.c{left:0;right:0;align-items:center}.l{left:36px;align-items:flex-start}.r{right:36px;align-items:flex-end}
.box,.title,.hot{background:#fff;color:#111;text-align:center;font-weight:400;letter-spacing:-0.5px;line-height:1.38}
.box{font-size:35px;padding:12px 28px}
.box.sm{font-size:31px;padding:10px 24px}
.box b{font-weight:700;color:#E0337A}
.title{font-size:44px;padding:16px 40px}
.pink{color:#E0337A;font-weight:900}
.big-box{background:#fff;color:#111;text-align:center;font-size:44px;font-weight:500;line-height:1.38;letter-spacing:-0.5px;padding:22px 46px}
.dark{background:rgba(30,26,24,.86);color:#fff;font-size:37px;padding:14px 32px;letter-spacing:-0.5px;font-weight:500}
.dark b{color:#FFD84D;font-weight:900}
.label{background:#fff;font-size:39px;font-weight:500;padding:10px 30px;letter-spacing:-0.5px;color:#1a1a1a}
.label b{color:#E0337A;font-weight:500}
.big{color:#fff;font-size:124px;font-weight:900;letter-spacing:-2px;line-height:1.05;
  text-shadow:0 6px 22px rgba(0,0,0,.28),0 2px 4px rgba(0,0,0,.18)}
/* 마지막 장: 밝은 사진 위 큰 흰 글씨가 묻혀서 위쪽만 은은하게 어둡게 + 그림자 강화 */
.shade{position:absolute;left:0;right:0;top:0;height:46%;background:linear-gradient(rgba(0,0,0,.42),rgba(0,0,0,.28) 55%,rgba(0,0,0,0))}
.cover-big{text-shadow:0 2px 3px rgba(0,0,0,.45),0 4px 18px rgba(0,0,0,.55)!important}
.sub{background:#fff;font-size:33px;padding:12px 34px;color:#111}
/* 가격 카드: 레퍼런스(희아 1번 슬라이드)처럼 흰 카드 + 정가 취소선 + 공구가 */
.price{background:#fff;width:780px;padding:26px 40px 24px;display:flex;gap:30px;align-items:center;
  box-shadow:0 6px 24px rgba(0,0,0,.12)}
.price .tag{flex:none;width:150px;height:150px;border-radius:50%;background:#E0337A;color:#fff;
  display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
.price .tag b{font-size:56px;font-weight:900;letter-spacing:-1px}.price .tag span{font-size:24px;margin-top:6px;font-weight:500}
.price .info{flex:1;color:#222;letter-spacing:-0.5px}
.price .name{font-size:33px;font-weight:700;line-height:1.3;margin-bottom:10px}
.price .row{display:flex;justify-content:space-between;font-size:29px;color:#888;line-height:1.5}
.price .row s{color:#999}
.price .deal{display:flex;justify-content:space-between;align-items:baseline;margin-top:4px;border-top:2px solid #eee;padding-top:8px}
.price .deal span{font-size:31px;font-weight:700}.price .deal b{font-size:58px;font-weight:900;color:#E0337A;letter-spacing:-1px}
`;

const priceCard = `<div class="price">
  <div class="tag"><b>${PRICE.rate}</b><span>할인</span></div>
  <div class="info">
    <div class="name">하베브릭스<br>아기체육관 + 양방향 모빌</div>
    <div class="row"><span>정가</span><s>${PRICE.list}원</s></div>
    <div class="deal"><span>공구가</span><b>${PRICE.deal}원</b></div>
  </div></div>`;

const item = ([k, t]) => k === 'price' ? priceCard : `<div class="${k}">${t}</div>`;
const body = (s) => s.cover
  ? `<div class="shade"></div>
     <div class="stack c" style="top:4%;gap:10px">
       <div class="label"><b>하베브릭스</b> 아기체육관+양방향 모빌</div>
       <div class="big cover-big" style="font-size:112px">최저가 공구 예정</div>
       <div class="sub" style="margin-top:8px">정가 ${PRICE.list} → <b style="color:#E0337A;font-weight:900">${PRICE.deal}원 (${PRICE.rate}↓)</b></div>
       <div class="dark">+ ${PRICE.gift} <b>무조건</b> 증정 🎁</div>
     </div>
     <div class="stack c" style="top:91%"><div class="sub">댓글에 ‘모빌’ 남겨주시면 10.22 오픈 때 DM 드릴게요 💌</div></div>`
  : s.groups.filter((gr) => (gr.from ?? 0) === (s.only ?? 0)).map((gr) => `<div class="stack ${gr.align}" style="top:${gr.top}%${gr.x != null ? (gr.align === 'r' ? ';right:' : ';left:') + gr.x + 'px' : ''}">${gr.items.map(item).join('')}</div>`).join('');

const shot = (htmlPath, w, h, out, transparent) => execFileSync(chrome, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  `--window-size=${w},${h}`, '--virtual-time-budget=8000',
  ...(transparent ? ['--default-background-color=00000000'] : []),
  `--screenshot=${out}`, 'file:///' + htmlPath], { stdio: 'ignore' });

// 카톡으로 받은 406×720 영상(자막이 이미 박혀 깨짐) → 1080×1920으로 키우고, 같은 자리에 선명한 자막을 새로 덮음
// 박힌 옛 자막 상자 테두리가 비치지 않도록 흰 상자를 사방 8px 넓힘
const DL = 'C:/Users/PC_1M/Downloads';
const OUT = 'C:/Users/PC_1M/Downloads/하베브릭스_스토리_수정본6';
mkdirSync(OUT, { recursive: true });
const map = { 2: '184849635', 3: '184852629', 6: '184847234', 7: '184843354', 9: '184855691', 13: '184840197' };
const cover = ".box,.title{box-shadow:0 0 0 4px #fff}body{font-family:'Noto Sans KR','Noto Color Emoji','Malgun Gothic',sans-serif}";
for (const [num, kt] of Object.entries(map)) {
  const s = slides[num - 1];
  const n = String(num).padStart(2, '0');
  const htmlPath = join(root, 'html', `slide_${n}.html`);
  writeFileSync(htmlPath, `<!doctype html><html><head><meta charset="utf-8"><style>${css}${cover}
html,body{width:1080px;height:1920px;background:transparent}.stack{zoom:1.6}</style></head>
<body>${body(s)}</body></html>`, 'utf8');
  const png = join(root, 'tmp', `overlay_${n}.png`);
  shot(htmlPath, 1080, 1920, png, true);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', `${DL}/KakaoTalk_20261013_${kt}.mp4`, '-i', png,
    '-filter_complex', '[0:v]scale=1080:1920:flags=lanczos,unsharp=5:5:0.5,setsar=1,format=yuv444p[v];[v][1:v]overlay=0:0:format=yuv444[o]',
    '-map', '[o]', '-map', '0:a?', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p',
    '-c:a', 'copy', '-movflags', '+faststart', `${OUT}/story_${n}.mp4`]);
  console.log('done', n);
}
