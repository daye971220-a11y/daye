// 기존 캔버스 79장 → 브랜드 가이드 준수판 변환
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '../artifact-files/6192fff3-8c18-42e4-af91-361757e0c263/project');
const OUT = path.join(__dirname, 'root/project');
fs.mkdirSync(OUT, { recursive: true });

const B = {
  wmBrand: '2c693914a82e84ed0e2428e2142bcada', msBrand: '1534c2b4deb9a4772f9543874ab0f55e', kwBrand: 'cbb5ea78ea6b756c370127d8fd968dd9',
  wmWhite: '870b9a546b3ddf8c6b9bdd47a5e11e0a', msWhite: '1a5e176a9718684f730b82c5a215ea51',
  charBrand: 'ab0b33930b453f4f18db1096f68dd37e', charWhite: 'eb8fdd2c9d9fca2bb7908f59008c4f03',
};
const REMAP = {
  '51043a212fd8d439332e8f895d4f26ce': B.wmBrand, '651a8b321495c997a81eb6e168ca6b8e': B.msBrand, 'b9ffc04d8638739eaafba319257af07d': B.kwBrand,
  'ed30e3d57a088f0333662edea0e6356b': B.wmWhite, 'ac9050a4b065cdfb3e98277d7c1c054b': B.msWhite,
  '7365bd0d70b2b0824b1f8ac70d051943': '7348f3a1c13bd1ec1542977e9f9e078d', '2eada20249bbcc79119b9bc40e96f1fa': 'b1bdb2810cd1cdfac88636c4cb98a8fe',
  '6c47d069ab6cd869c56cd9edcfa8cc8b': 'db60f31a7ee9e234df2a49cae58d1012', '15627681e9442d8358cf1e1ab720defb': '607c33edc4c48d5195413e8d0c126d1e',
  '105a1e3a2788d5b9af6b4a52cf6f32ed': '0bff5c07d1c0402b7fc31365b6f46610',
};
const FONTS = `@font-face{font-family:'Wanted Sans';src:url(/_blob/0231076b060aa16d3d37bc3c31105c27) format('woff2');font-weight:400;font-display:block}
@font-face{font-family:'Wanted Sans';src:url(/_blob/0231076b060aa16d3d37bc3c31105c27) format('woff2');font-weight:500;font-display:block}
@font-face{font-family:'Wanted Sans';src:url(/_blob/b5557ff49dafa7161b136f3972f3c7af) format('woff2');font-weight:600;font-display:block}
@font-face{font-family:'Wanted Sans';src:url(/_blob/dafb13aa57bcf9ec1074a075a079c191) format('woff2');font-weight:700;font-display:block}
@font-face{font-family:'Wanted Sans';src:url(/_blob/bf8f1faf4fa471db3a77b3dd75da6725) format('woff2');font-weight:800;font-display:block}
@font-face{font-family:'Wanted Sans';src:url(/_blob/d2b8f1b8848d5e21ae5ea55e26e5e11a) format('woff2');font-weight:900;font-display:block}`;

// ---- 색: 가이드 팔레트(#0A33B5 · 흰색 · K 무채색 · 포인트 노랑 #FFE14D)로 매핑
const KEEP = new Set(['#FFFFFF', '#0A33B5', '#FFE14D', '#000000']);
const hex2 = n => n.toString(16).padStart(2, '0').toUpperCase();
const rgbHex = (r, g, b) => '#' + hex2(r) + hex2(g) + hex2(b);
const gray = L => { const v = Math.round(L); return rgbHex(v, v, v); };
const tint = L => { const t = Math.min(0.6, Math.max(0.05, (255 - L) / 201.5)); return rgbHex(Math.round(255 - t * 245), Math.round(255 - t * 204), Math.round(255 - t * 74)); };
const colorLog = {};
function mapHex(h) {
  const H = h.toUpperCase();
  if (KEEP.has(H)) return H;
  const r = parseInt(H.slice(1, 3), 16), g = parseInt(H.slice(3, 5), 16), b = parseInt(H.slice(5, 7), 16);
  const L = 0.299 * r + 0.587 * g + 0.114 * b, ch = Math.max(r, g, b) - Math.min(r, g, b);
  let out;
  if (ch <= 12) out = ch <= 2 ? H : gray(L);               // 거의 무채색 → 완전 무채색
  else if (L < 35) out = '#111111';                        // 아주 어두운 남색/검정 계열 → K
  else if (r >= 190 && g >= 150 && b < 140 && ch > 60) out = L < 180 ? '#0A33B5' : '#FFE14D'; // 흰 바탕용 진한 금색은 블루로 // 노랑·골드·라임 → 포인트 노랑
  else if (L >= 150) out = ((b >= r || b > g) && (L >= 200 ? ch >= 20 : ch >= 40)) ? tint(L) : gray(L); // 연한 파랑·핑크·민트 → 브랜드 블루 틴트 / 크림 → 무채색
  else if (ch >= 50) out = '#0A33B5';                      // 진한 파랑·빨강·초록 → 브랜드 블루
  else out = gray(L);                                      // 푸른/누런 회색 → 무채색
  if (out !== H) colorLog[H] = out;
  return out;
}
const mapColors = s => s
  .replace(/#[0-9A-Fa-f]{6}\b/g, mapHex)
  .replace(/rgba\((\d+),\s*(\d+),\s*(\d+),/g, (m, r, g, b) => {
    const o = mapHex(rgbHex(+r, +g, +b));
    return `rgba(${parseInt(o.slice(1, 3), 16)},${parseInt(o.slice(3, 5), 16)},${parseInt(o.slice(5, 7), 16)},`;
  });

const canvas = JSON.parse(fs.readFileSync(path.join(SRC, 'canvas.json'), 'utf8'));
const report = {};
const note = (f, m) => (report[f] = report[f] || []).push(m);

for (const f of canvas.order) {
  let s = fs.readFileSync(path.join(SRC, f), 'utf8');
  // 1) helmet 재구성: 원티드 산스 + body + a 색만 남김 (안 쓰는 마스크/포스터 클래스, 구글폰트 제거)
  s = s.replace(/<helmet>[\s\S]*?<\/helmet>/, h => {
    const a = (h.match(/^a\{.*$/m) || [])[0];
    return `<helmet>\n<style>\n${FONTS}\nbody{margin:0;word-break:keep-all}${a ? '\n' + a : ''}\n</style>\n</helmet>`;
  });
  // 2) 서체 → Wanted Sans
  const before = s;
  s = s.replace(/'Nanum Gothic Coding', 'Pretendard', monospace/g, "'Wanted Sans', sans-serif")
       .replace(/'Nanum Pen Script', cursive/g, "'Wanted Sans', sans-serif")
       .replace(/'Pretendard'/g, "'Wanted Sans'");
  if (before !== s && f.indexOf('V14') !== 0) note(f, '서체→원티드 산스');
  // 3) 국문 로고 → 영문 워드마크 (혼용/단독 금지)
  s = s.replace(/<div style="width: (\d+)px; height: (\d+)px; overflow: hidden;?"><img src="\/_blob\/b9ffc04d8638739eaafba319257af07d" alt="[^"]*" style="[^"]*"><\/div>/g, (m, w, h) => {
    const k = (+h) / 43;
    note(f, '국문 로고→영문 로고');
    return `<div style="width: ${Math.round(340 * k)}px; height: ${h}px; overflow: hidden; flex-shrink: 0"><img src="/_blob/${B.wmBrand}" alt="TEXAS PAPA" style="display: block; width: ${Math.round(583 * k)}px; max-width: none; margin-left: -${Math.round(121 * k)}px; margin-top: -${Math.round(143 * k)}px"></div>`;
  });
  // 4) 조합형 로고에서 잘라낸 캐릭터 → 캐릭터 단독 원본 (글자 잘림/변형 방지), 투명도·회전 제거
  s = s.replace(/<div style="([^"]*)"><img src="\/_blob\/(651a8b321495c997a81eb6e168ca6b8e|ac9050a4b065cdfb3e98277d7c1c054b)"( alt="[^"]*")? style="([^"]*)"><\/div>/g, (m, wrap, id, alt, inner) => {
    let w2 = wrap;
    if (/opacity:\s*0\.\d+;\s*/.test(w2)) { w2 = w2.replace(/opacity:\s*0\.\d+;\s*/, ''); note(f, '캐릭터 투명도 제거'); }
    if (/;?\s*transform: rotate\([^)]*\)/.test(w2)) { w2 = w2.replace(/;?\s*transform: rotate\([^)]*\)/, ''); note(f, '캐릭터 회전 제거'); }
    const W = +(w2.match(/(?:^|; )width: (\d+)px/) || [])[1], H = +(w2.match(/height: (\d+)px/) || [])[1];
    if (W && H && W / H > 1.1) {
      const nh = Math.round(W * 803 / 871);
      w2 = w2.replace(/height: \d+px/, `height: ${nh}px`).replace(/; overflow: hidden/, '');
      note(f, '잘린 캐릭터→캐릭터 단독 원본');
      const cid = id === '651a8b321495c997a81eb6e168ca6b8e' ? B.charBrand : B.charWhite;
      return `<div style="${w2}"><img src="/_blob/${cid}" alt="텍사스파파 캐릭터" style="display: block; width: 100%; height: auto"></div>`;
    }
    return `<div style="${w2}"><img src="/_blob/${id}"${alt || ''} style="${inner}"></div>`;
  });
  // 5) 로고 글자를 일반 서체로 쓴 곳
  s = s.replace(/<span style="font-weight: 800; color: \{\{cobalt\}\}">TEXAS PAPA<\/span>/, () => {
    note(f, '"TEXAS PAPA" 텍스트→로고 이미지');
    const k = 22 / 43;
    return `<div style="width: ${Math.round(340 * k)}px; height: 22px; overflow: hidden; flex-shrink: 0"><img src="/_blob/${B.wmBrand}" alt="TEXAS PAPA" style="display: block; width: ${Math.round(583 * k)}px; max-width: none; margin-left: -${Math.round(121 * k)}px; margin-top: -${Math.round(143 * k)}px"></div>`;
  });
  s = s.replace(/>TEXAS PAPA 점주 후기</, () => { note(f, '"TEXAS PAPA" 텍스트→한글 브랜드명'); return '>텍사스파파 점주 후기<'; });
  // 6) 색
  const c0 = s;
  for (const k of Object.keys(colorLog)) delete colorLog[k];
  s = mapColors(s);
  if (c0 !== s) note(f, '색 정리: ' + Object.entries(colorLog).map(([a, b]) => a + '→' + b).join(' '));
  s = s.replace(/"options":\[([^\]]*)\]/g, (m, l) => '"options":[' + [...new Set(l.split(','))].join(',') + ']');
  // 7) 남색 로고 → 가이드 컬러 로고, 에셋 주소 새 캔버스로
  if (/51043a212fd8d439332e8f895d4f26ce|651a8b321495c997a81eb6e168ca6b8e/.test(s)) note(f, '로고 색 #034492→#0A33B5');
  s = s.replace(/[0-9a-f]{32}/g, id => REMAP[id] || id);
  const left = [...new Set((s.match(/_blob\/[0-9a-f]{32}/g) || []).map(x => x.slice(6)))].filter(id => !Object.values(REMAP).concat(Object.values(B), ['0231076b060aa16d3d37bc3c31105c27', 'b5557ff49dafa7161b136f3972f3c7af', 'dafb13aa57bcf9ec1074a075a079c191', 'bf8f1faf4fa471db3a77b3dd75da6725', 'd2b8f1b8848d5e21ae5ea55e26e5e11a']).includes(id));
  if (left.length) console.log('UNMAPPED', f, left);
  fs.writeFileSync(path.join(OUT, f), s);
}

// index: 같은 배치, 제목/생성 정보만 새로
const idx = { ...canvas, title: '창업 광고 시안 (브랜드 가이드 준수판)', createdOnFiles: { v: 1, at: new Date().toISOString().replace(/\.\d+Z$/, 'Z') } };
idx.notes = { ...canvas.notes };
for (const [k, n] of Object.entries(idx.notes)) if (typeof n.text === 'string' && n.kind === 'title1') idx.notes[k] = { ...n, text: n.text };
fs.writeFileSync(path.join(OUT, 'canvas.json'), JSON.stringify(idx, null, 1));
fs.writeFileSync(path.join(__dirname, 'report.json'), JSON.stringify(report, null, 1));
console.log(Object.keys(report).length, 'boards changed');
