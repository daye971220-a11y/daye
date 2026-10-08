(function(root) {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const safeUrl = value => { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
  function inline(value) {
    const bold = text => escape(text).replace(/\*\*([^*]+)\*\*/g, (_, text) => `<strong${/\d[\d,]*원/.test(text) ? ' class="price"' : /포함|쿠폰|혜택|무료/.test(text) ? ' class="benefit"' : ''}>${text}</strong>`);
    let result = '', offset = 0;
    for (const match of value.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
      result += bold(value.slice(offset, match.index));
      const href = safeUrl(match[2]);
      result += href ? `<a href="${escape(href)}" target="_blank" rel="noopener noreferrer">${bold(match[1])}</a>` : bold(match[1]);
      offset = match.index + match[0].length;
    }
    return result + bold(value.slice(offset));
  }
  function render(doc, photoUrls = {}) {
    const photos = doc.photos || [];
    const image = section => photos.filter(p => p.section === section).map(p => `<figure><img src="${escape(photoUrls[p.id] || '/api/workshop/photos/' + p.id)}" alt="${escape(p.caption)}"><figcaption>${escape(p.caption)}</figcaption></figure>`).join('');
    const lines = doc.body.split('\n'); let html = image('intro'), paragraph = [], rows = [];
    const flush = () => { if (paragraph.length) { html += '<p>' + paragraph.map(inline).join('<br>') + '</p>'; paragraph = []; } if (rows.length) { const data = rows.filter(r => !/^\|?\s*:?-/.test(r)); html += '<table>' + data.map((r, i) => '<tr>' + r.replace(/^\||\|$/g,'').split('|').map(c => `<${i ? 'td' : 'th'}>${inline(c.trim())}</${i ? 'td' : 'th'}>`).join('') + '</tr>').join('') + '</table>'; rows=[]; } };
    for (const line of lines) { if (/^##\s/.test(line)) { flush(); const heading = line.replace(/^##\s*/, ''); html += '<h2>'+escape(heading)+'</h2>'+image(heading); } else if (/^\s*\|/.test(line)) { if (paragraph.length) flush(); rows.push(line); } else if (!line.trim()) flush(); else { if (rows.length) flush(); paragraph.push(line); } }
    flush(); return html;
  }
  const api = { render, escape, safeUrl };
  if (typeof module !== 'undefined') module.exports = api;
  else root.WorkshopRender = api;
})(typeof window !== 'undefined' ? window : globalThis);
