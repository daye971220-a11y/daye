// 렌더 검수 후 손으로 고친 것들 (convert.js 다음에 실행)
const fs = require('fs'), path = require('path');
const P = path.join(__dirname, 'root/project');
const CHAR = 'ab0b33930b453f4f18db1096f68dd37e', LOCK = '1534c2b4deb9a4772f9543874ab0f55e';
const changed = new Set();
function fix(file, from, to) {
  const f = path.join(P, file); const s = fs.readFileSync(f, 'utf8');
  if (!s.includes(from)) throw new Error('not found in ' + file + ': ' + from.slice(0, 80));
  fs.writeFileSync(f, s.split(from).join(to)); changed.add(file);
}
const charDiv = (pos, w) => `<div style="${pos}; width: ${w}px; height: ${Math.round(w * 803 / 871)}px; flex-shrink: 0"><img src="/_blob/${CHAR}" alt="텍사스파파 캐릭터" style="display: block; width: 100%; height: auto"></div>`;

// 1) V14 가맹안내서: 아치 배경이 바탕과 같은 블루가 돼서 묻힘 → 흰색 12% 겹쳐 톤 차이
fix('V14Guide.dc.html', 'box-shadow: 0 30px 60px rgba(0,0,0,0.3); background: #0A33B5"', 'box-shadow: 0 30px 60px rgba(0,0,0,0.3); background: rgba(255,255,255,0.12)"');

// 2) V5 메모지: 상단 로고를 영문으로 바꾸면서 하단 조합형 로고와 로고가 두 번 → 하단은 캐릭터 단독으로
fix('V5Notepad.dc.html', `<div style="position: absolute; right: 40px; bottom: 49px; width: 230px; height: 292px; overflow: hidden"><img src="/_blob/${LOCK}" alt="텍사스파파 캐릭터" style="display: block; width: 748px; max-width: none; margin-left: -259px; margin-top: -64px"></div>`, charDiv('position: absolute; right: 40px; bottom: 60px', 230));
fix('V5NotepadC2.dc.html', `<div style="position: absolute; right: 70px; bottom: 50px; width: 200px; height: 254px; overflow: hidden; flex-shrink: 0;"><img src="/_blob/${LOCK}" alt="텍사스파파 캐릭터" style="display: block; width: 651px; max-width: none; margin-left: -225px; margin-top: -56px"></div>`, charDiv('position: absolute; right: 70px; bottom: 60px', 200));
fix('V5NotepadStory.dc.html', `<div style="position: absolute; right: 64px; top: 1260px; width: 220px; height: 280px; overflow: hidden; flex-shrink: 0;"><img src="/_blob/${LOCK}" alt="텍사스파파 캐릭터" style="display: block; width: 716px; max-width: none; margin-left: -248px; margin-top: -62px"></div>`, charDiv('position: absolute; right: 64px; top: 1300px', 220));

// 3) V4 창업타입: 상단에 조합형 로고가 있어 하단 로고는 중복 → 하단 로고 제거
fix('V4Types.dc.html', `<div style="width: 174px; height: 22px; overflow: hidden; flex-shrink: 0"><img src="/_blob/2c693914a82e84ed0e2428e2142bcada" alt="TEXAS PAPA" style="display: block; width: 298px; max-width: none; margin-left: -62px; margin-top: -73px"></div>`, '');

// 4) V11: 캐릭터 단독 원본이 예전 크롭보다 키가 커서 말풍선에 닿음 → 살짝 줄임
for (const f of ['V11Quit.dc.html', 'V11Family.dc.html', 'V11Switch.dc.html'])
  fix(f, charDiv('position: absolute; right: 56px; top: 620px', 250), charDiv('position: absolute; right: 60px; top: 626px', 220));
fix('V11QuitStory.dc.html', charDiv('position: absolute; right: 56px; top: 890px', 300), charDiv('position: absolute; right: 60px; top: 900px', 260));

// 5) V8 스토리: 조합형 로고가 헤드라인 "시작은,"과 겹침 (원본부터 있던 문제) → 로고 축소
fix('V8MessageStory.dc.html', `<div style="position: absolute; right: 43px; top: 276px; width: 432px; height: 549px; overflow: hidden; flex-shrink: 0"><img src="/_blob/${LOCK}" alt="텍사스파파 캐릭터" style="display: block; width: 1406px; max-width: none; margin-left: -487px; margin-top: -121px"></div>`,
  `<div style="position: absolute; right: 52px; top: 300px; width: 350px; height: 445px; overflow: hidden; flex-shrink: 0"><img src="/_blob/${LOCK}" alt="텍사스파파 캐릭터" style="display: block; width: 1139px; max-width: none; margin-left: -395px; margin-top: -98px"></div>`);

// 6) 사진 위 흰 글씨 가독성 (원본부터 있던 문제): 하단 그림자 막 / 글자 그림자 보강
for (const f of ['V12Native.dc.html', 'V13Native.dc.html'])
  fix(f, '<div style="position: absolute; left: 64px; bottom: 150px; display: flex; flex-direction: column; gap: 6px; color: #FFFFFF; text-shadow: 0 1px 6px rgba(0,0,0,0.35)">',
    '<div style="position: absolute; left: 0; right: 0; bottom: 128px; height: 220px; background: linear-gradient(180deg, rgba(17,17,17,0) 0%, rgba(17,17,17,0.62) 100%)"></div><div style="position: absolute; left: 64px; bottom: 150px; display: flex; flex-direction: column; gap: 6px; color: #FFFFFF; text-shadow: 0 1px 8px rgba(0,0,0,0.6)">');
for (const f of ['V12Growth.dc.html', 'V13Growth.dc.html'])
  fix(f, 'bottom: 150px; font-size: 16px; color: #FFFFFF; opacity: 0.9">', 'bottom: 150px; font-size: 16px; color: #FFFFFF; text-shadow: 0 1px 8px rgba(0,0,0,0.75)">');
fix('V5Growth.dc.html', 'bottom: 30px; font-size: 16px; color: rgba(255,255,255,0.85)">', 'bottom: 30px; font-size: 16px; color: #FFFFFF; text-shadow: 0 1px 8px rgba(0,0,0,0.75)">');
// V3 에디토리얼: 흰 로고가 밝은 접시 위 → 하단 그림자 막을 키움
fix('V3Editorial.dc.html', 'height: 160px; background: linear-gradient(180deg, rgba(17,17,17,0) 0%, rgba(17,17,17,0.5) 100%)', 'height: 240px; background: linear-gradient(180deg, rgba(17,17,17,0) 0%, rgba(17,17,17,0.72) 100%)');

console.log([...changed].join(' '));
