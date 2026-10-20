// 도노맘마존 4in1 뉴본 러닝타워 폴딩 원목 하이체어 공구예고 썸네일 (2026-10-20)
// 다예님 요청: 공식 사진 4장(뉴본 바운서 → 러닝타워 → 키즈체어 → 하이체어)을 4분할, 표지 확정 틀(3줄 118px 정중앙)
// 사진 보정: 뽀얗게(그림자 살짝 띄움 + 채도 0.9 + 은은한 글로우) — 흰 의자 윤곽이 날아가지 않게 약하게
// 4분할은 같은 크기 2x2(다예님 선택). TONE=0이면 원본 사진, 기본은 뽀얀 보정본
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = 'C:/Users/user/Desktop/daye/delivery/donodono_highchair';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
for (const d of ['html', 'out']) mkdirSync(join(root, d), { recursive: true });
const emoCss = '';
const TONE = process.env.TONE !== '0';
const DIR = TONE ? 'src_tone' : 'src';
const OUT = TONE ? 'highchair_01_뽀얀보정.png' : 'highchair_01_원본.png';

const cells = [
  { src: 'o_181', pos: '45% 0%' },   // 뉴본 바운서
  { src: 'o_182', pos: '50% 0%' },   // 러닝타워
  { src: 'o_183', pos: '50% 0%' },   // 키즈체어
  { src: 'o_184', pos: '50% 8%' },   // 하이체어(트레이)
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=block');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:966px;height:1288px;overflow:hidden;background:#fff;font-family:'Noto Sans KR','Malgun Gothic',sans-serif}
.grid{position:absolute;inset:0;display:grid;grid-template-columns:480px 480px;grid-template-rows:641px 641px;gap:6px;background:#fff}
.grid img{width:100%;height:100%;min-width:0;min-height:0;object-fit:cover;display:block}
.soft{position:absolute;left:0;right:0;top:28%;height:44%;background:radial-gradient(ellipse at center,rgba(0,0,0,.26),rgba(0,0,0,0) 70%)}
.stack{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:16px}
.cover{color:#fff;font-size:118px;font-weight:900;letter-spacing:-2px;line-height:1.18;text-align:center;
  text-shadow:0 2px 3px rgba(0,0,0,.45),0 4px 18px rgba(0,0,0,.55)}
.prod{background:#E0337A;color:#fff;font-size:118px;font-weight:900;letter-spacing:-2px;line-height:1.12;padding:6px 40px 12px;margin-top:4px}
${emoCss}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="grid">${cells.map((c) => `<img src="../${DIR}/${c.src}.jpg" style="object-position:${c.pos}">`).join('')}</div>
<div class="soft"></div>
<div class="stack"><div class="cover">도노도노</div><div class="prod">하이체어</div><div class="cover">최저가 공구예고</div></div>
</body></html>`;

const htmlPath = join(root, 'html', TONE ? 'cover.html' : 'cover_orig.html');
writeFileSync(htmlPath, html, 'utf8');
execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  '--window-size=966,1288', '--virtual-time-budget=8000', `--screenshot=${join(root, 'out', OUT)}`, 'file:///' + htmlPath], { stdio: 'ignore' });
console.log('done');
