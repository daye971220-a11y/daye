// 여러 보드를 한 페이지에: node combine.js <srcDir> <out.html> measure|sheet [scale] [cols] [names...]
const fs=require('fs'),path=require('path');const {convert}=require('./build.js');
const [,,src,out,mode,scale='1',cols='1',...names]=process.argv;
const order=JSON.parse(fs.readFileSync(path.join(__dirname,'../guide/root/project/canvas.json'),'utf8')).order;
const list=(names.length?names.map(n=>n+'.dc.html'):order);
const styles=new Set();let body='';
for(const f of list){const h=convert(path.join(src,f),'none');
 const st=h.match(/<style>([\s\S]*?)<\/style>/)[1];st.split('\n').filter(l=>l.startsWith('@font-face')).forEach(l=>styles.add(l));
 const al=st.split('\n').find(l=>l.startsWith('a{'));if(al)styles.add(al.replace(/(^|\})a(:hover)?\{/g,(m,p,h)=>p+'section[data-name="'+f+'"] a'+(h||'')+'{'));
 const inner=h.match(/<div id="root">([\s\S]*)<\/div><\/body>/)[1];
 const pv=JSON.parse(fs.readFileSync(path.join(src,f),'utf8').match(/data-props='([^']*)'/)[1].replace(/&#39;/g,"'").replace(/&amp;/g,'&')).$preview;
 const s=+scale;body+=`<section data-name="${f}" style="width:${pv.width*s}px;height:${pv.height*s}px;overflow:hidden;position:relative;outline:1px solid #f0f"><div class="root" style="transform:scale(${s});transform-origin:0 0;width:${pv.width}px">${inner}</div><b style="position:absolute;left:0;top:0;background:#f0f;color:#fff;font:12px sans-serif;padding:1px 4px">${f.replace('.dc.html','')}</b></section>`;}
const m=fs.readFileSync(path.join(__dirname,'measure.js'),'utf8');
fs.writeFileSync(out,`<!doctype html><html><head><meta charset="utf-8"><style>${[...styles].join('\n')}
html,body{margin:0;overflow:hidden;background:#888}body{word-break:keep-all;display:grid;grid-template-columns:repeat(${cols},max-content);gap:10px;align-items:start}</style></head><body>${body}${mode==='measure'?'<script>'+m+'</script>':''}</body></html>`);
