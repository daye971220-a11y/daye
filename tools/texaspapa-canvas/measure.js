document.fonts.ready.then(() => setTimeout(() => {
  const RES={};for(const sec of document.querySelectorAll('section')){const root=sec.querySelector('.root').firstElementChild;
  const R = root.getBoundingClientRect();
  const out = [];
  const els = [...root.querySelectorAll('*')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
  els.forEach((e, i) => {
    const text = e.textContent.replace(/\s+/g, ' ').trim();
    // 줄 단위로 글자 모으기
    const lines = [];
    for (const n of e.childNodes) {
      if (n.nodeType !== 3) { if (n.nodeType === 1) { const r = n.getBoundingClientRect(); if (r.width) lines.push({ top: Math.round(r.top), txt: n.textContent, l: r.left, r: r.right }); } continue; }
      const t = n.textContent;
      for (let k = 0; k < t.length; k++) {
        if (!t[k].trim()) continue;
        const rg = document.createRange(); rg.setStart(n, k); rg.setEnd(n, k + 1);
        const r = rg.getBoundingClientRect(); if (!r.width) continue;
        lines.push({ top: Math.round(r.top), txt: t[k], l: r.left, r: r.right });
      }
    }
    const byTop = [];
    lines.sort((a, b) => a.top - b.top).forEach(c => {
      const L = byTop.find(x => Math.abs(x.top - c.top) < 6);
      if (L) { L.txt += c.txt; L.l = Math.min(L.l, c.l); L.r = Math.max(L.r, c.r); } else byTop.push({ ...c });
    });
    const issues = [];
    // 부모 박스 밖으로 넘침
    let p = e; while (p && p !== root && getComputedStyle(p).display.includes('inline')) p = p.parentElement;
    const pr = p.getBoundingClientRect(), cs = getComputedStyle(p);
    const cl = pr.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), cr = pr.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
    byTop.forEach(L => {
      if (L.r > cr + 3 || L.l < cl - 3) issues.push('박스밖 ' + Math.round(Math.max(L.r - cr, cl - L.l)) + 'px');
      if (L.r > R.right + 1 || L.l < R.left - 1) issues.push('시안밖');
    });
    // 숨김 부모에서 잘림
    let q = e.parentElement;
    while (q && q !== root.parentElement) {
      const s2 = getComputedStyle(q);
      if (s2.overflow === 'hidden' || q === root) {
        const qr = q.getBoundingClientRect();
        if (byTop.some(L => L.r > qr.right + 2 || L.l < qr.left - 2 || L.top < qr.top - 2) || e.getBoundingClientRect().bottom > qr.bottom + 2) { issues.push('잘림(' + (q === root ? '시안' : q.tagName) + ')'); }
        break;
      }
      q = q.parentElement;
    }
    if (byTop.length > 1) { const last = byTop[byTop.length - 1].txt.replace(/[\s.,!?·)]/g, ''); if (last.length <= 2) issues.push('외톨이줄 "' + byTop[byTop.length - 1].txt + '"'); }
    out.push({ i, text: text.slice(0, 40), lines: byTop.length, lineTxt: byTop.map(l => l.txt), issues: [...new Set(issues)] });
  });
  RES[sec.dataset.name]=out;}
  const pre = document.createElement('pre'); pre.id = 'out'; pre.textContent = JSON.stringify(RES); document.body.appendChild(pre);
}, 300));
