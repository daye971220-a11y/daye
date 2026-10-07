// .dc.html → 정적 HTML (로컬 에셋) 로 바꿔서 Edge headless로 렌더/측정
const fs = require('fs'), path = require('path');
const S = path.join(__dirname, '..');
const A = p => 'file:///' + path.join(S, p).replace(/\\/g, '/');
const BLOB = {
  // 새 캔버스
  '0231076b060aa16d3d37bc3c31105c27': 'fonts/WantedSans-Medium.woff2', 'b5557ff49dafa7161b136f3972f3c7af': 'fonts/WantedSans-SemiBold.woff2',
  'dafb13aa57bcf9ec1074a075a079c191': 'fonts/WantedSans-Bold.woff2', 'bf8f1faf4fa471db3a77b3dd75da6725': 'fonts/WantedSans-ExtraBold.woff2',
  'd2b8f1b8848d5e21ae5ea55e26e5e11a': 'fonts/WantedSans-Black.woff2',
  '7348f3a1c13bd1ec1542977e9f9e078d': 'photos/crepe_strawberry.jpg', 'b1bdb2810cd1cdfac88636c4cb98a8fe': 'photos/crepe_nutella.jpg', 'db60f31a7ee9e234df2a49cae58d1012': 'photos/crepe_table.jpg',
  '607c33edc4c48d5195413e8d0c126d1e': 'cutouts/cutout_strawberry_1416.png', '0bff5c07d1c0402b7fc31365b6f46610': 'cutouts/cutout_oreo_1416.png',
  '2c693914a82e84ed0e2428e2142bcada': 'logos2/logo_wm_brand.png', '1534c2b4deb9a4772f9543874ab0f55e': 'logos2/logo_ms_brand.png', 'cbb5ea78ea6b756c370127d8fd968dd9': 'logos2/logo_kw_brand.png',
  '870b9a546b3ddf8c6b9bdd47a5e11e0a': 'logos/logo_wm_white.png', '1a5e176a9718684f730b82c5a215ea51': 'logos/logo_ms_white.png',
  'ab0b33930b453f4f18db1096f68dd37e': 'logos2/character_brand.png', 'eb8fdd2c9d9fca2bb7908f59008c4f03': 'logos2/character_white.png',
  // 원본 캔버스
  'cda603d4c87ffb7667913ddb8d045f72': 'fonts/Pretendard-Regular.woff2', 'c57aa1a9bc351f0a556babcffd81b69d': 'fonts/Pretendard-Bold.woff2',
  '80ae9d555d327a83e63fa753987a8aad': 'fonts/Pretendard-ExtraBold.woff2', '0e50b2d29d7304dfccb7590e26a7cf65': 'fonts/Pretendard-Black.woff2',
  '77de97a3d609ed05ca3ff09a458977f2': 'fonts/WantedSans-Medium.woff2', 'f3eb9ab8bb77fc7799b28862131a4579': 'fonts/WantedSans-SemiBold.woff2',
  'aab60dc62628aa651831cd9fce40a7eb': 'fonts/WantedSans-Bold.woff2', 'ce12dd468c3705f6089d2fb53caea3d0': 'fonts/WantedSans-ExtraBold.woff2',
  '9a9747a6f472f9f278df81ae0ff085dd': 'fonts/WantedSans-Black.woff2',
  '7365bd0d70b2b0824b1f8ac70d051943': 'photos/crepe_strawberry.jpg', '2eada20249bbcc79119b9bc40e96f1fa': 'photos/crepe_nutella.jpg', '6c47d069ab6cd869c56cd9edcfa8cc8b': 'photos/crepe_table.jpg',
  '15627681e9442d8358cf1e1ab720defb': 'cutouts/cutout_strawberry_1416.png', '105a1e3a2788d5b9af6b4a52cf6f32ed': 'cutouts/cutout_oreo_1416.png',
  '51043a212fd8d439332e8f895d4f26ce': 'logos/logo_wm_navy.png', '651a8b321495c997a81eb6e168ca6b8e': 'logos/logo_ms_navy.png', 'b9ffc04d8638739eaafba319257af07d': 'logos/logo_kw_navy.png',
  'ed30e3d57a088f0333662edea0e6356b': 'logos/logo_wm_white.png', 'ac9050a4b065cdfb3e98277d7c1c054b': 'logos/logo_ms_white.png',
};
const MEASURE = fs.readFileSync(path.join(__dirname, 'measure.js'), 'utf8');
function convert(src, mode) {
  const s = fs.readFileSync(src, 'utf8');
  const x = s.match(/<x-dc>([\s\S]*)<\/x-dc>/)[1];
  const helmet = (x.match(/<helmet>([\s\S]*?)<\/helmet>/) || [, ''])[1].replace(/<link[^>]*>/g, '');
  let body = x.replace(/<helmet>[\s\S]*?<\/helmet>/, '');
  const vals = {};
  for (const m of s.matchAll(/(\w+):\s*this\.props\.\w+\s*\?\?\s*'([^']*)'/g)) vals[m[1]] = m[2];
  body = body.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, k) => vals[k] ?? m);
  const fix = t => t.replace(/\/_blob\/([0-9a-f]{32})/g, (m, id) => BLOB[id] ? A(BLOB[id]) : m);
  const pv = JSON.parse(s.match(/data-props='([^']*)'/)[1].replace(/&#39;/g, "'").replace(/&amp;/g, '&')).$preview || {};
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fix(helmet).replace(/<\/?style>/g, '')}</style></head><body><div id="root">${fix(body)}</div>` +
    (mode === 'measure' ? `<script>${MEASURE}</script>` : '') + `</body></html>`;
}
module.exports = { convert };
if (require.main === module) {
  const [, , srcDir, outDir, mode] = process.argv;
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of fs.readdirSync(srcDir).filter(f => f.endsWith('.dc.html')))
    fs.writeFileSync(path.join(outDir, f.replace('.dc.html', '.html')), convert(path.join(srcDir, f), mode));
}
