// 케넨홈 피드(실제 게시된 공구 캐러셀 사진: 평균 밝기 ~200, 빨강-파랑 차이 5~25)에 맞춘 사진별 보정
// 1) 그림자 끌어올리는 공통 커브(다예님 아이폰 보정: 그림자+100, 밝기+) 2) 사진마다 평균색을 목표값으로 화이트밸런스
const { execFileSync } = require('child_process');
const fs = require('fs');
const avg = (f) => { const b = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-vf', 'scale=1:1:flags=area,format=rgb24', '-f', 'rawvideo', '-']); return [b[0], b[1], b[2]]; };
const CURVE = "curves=all='0/0.03 0.06/0.13 0.5/0.70 0.8/0.85 1/1'";
const files = fs.readdirSync('src').filter((f) => /^1\d+\.jpg$/.test(f));
fs.mkdirSync('src_tone', { recursive: true });
for (const f of files) {
  const tmp = `src_tone/_tmp_${f}`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', `src/${f}`, '-vf', CURVE, '-q:v', '2', tmp]);
  const [r, g, b] = avg(tmp);
  const L = 0.299 * r + 0.587 * g + 0.114 * b;
  const T = Math.max(L, 190); // 너무 어두운 사진만 살짝 더 밝게
  const target = [T + 9, T + 1, T - 9]; // 살짝 따뜻하게(빨강-파랑 약 18)
  const k = [target[0] / r, target[1] / g, target[2] / b].map((v) => Math.min(Math.max(v, 0.85), 1.12).toFixed(3));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-vf', `colorchannelmixer=rr=${k[0]}:gg=${k[1]}:bb=${k[2]}`, '-q:v', '2', `src_tone/${f}`]);
  fs.rmSync(tmp);
  console.log(f, [r, g, b].join(','), '->', avg(`src_tone/${f}`).join(','), k.join(' '));
}
