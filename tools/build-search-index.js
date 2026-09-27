/* Builds assets/search-index.json from the prototype's own pages and data.
   Run from the repo root with a local server on :8799:  python3 -m http.server 8799 & node tools/build-search-index.js
   Needs Playwright (any local install); set PLAYWRIGHT to its path if it isn't resolvable. */
const path = require('path'), fs = require('fs');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const BASE = 'http://localhost:8799/';
const SKIP = ['brief.html', 'sitemap.html', 'design.html'];   // internal review pages, not for visitors
(async () => {
  const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage();
  const pages = fs.readdirSync('.').filter(f => f.endsWith('.html'))
    .concat(...['ministries', 'ministries/pathfinders', 'ministries/adventurers', 'ministries/ay'].map(d => fs.readdirSync(d).filter(f => f.endsWith('.html')).map(f => d + '/' + f)))
    .filter(f => !SKIP.includes(f));
  const out = [];
  for (const u of pages) {
    await p.goto(BASE + u, { waitUntil: 'networkidle' });
    const r = await p.evaluate((u) => {
      const clean = s => (s || '').replace(/\s+/g, ' ').trim();
      const h1 = document.querySelector('h1'), head = clean(h1 && h1.innerText), title = u === 'index.html' ? 'Home' : (document.title.split('·')[0].trim() || head);
      let n = h1 && h1.nextElementSibling; while (n && n.tagName !== 'P') n = n.nextElementSibling; const lede = clean(n && n.innerText).slice(0, 140);
      const img = (document.querySelector('header img:not([aria-hidden="true"])') || {}).getAttribute ? document.querySelector('header img:not([aria-hidden="true"])').getAttribute('src') : null;
      const items = [{ g: 'Pages', t: title, s: lede || head, u: u, k: (head + ' ' + lede).toLowerCase() }];
      document.querySelectorAll('main h2, section h2').forEach(h => {
        const sec = h.closest('[id]'); if (!sec || sec.id === 'list' || h.closest('#list')) return;
        const t = clean(h.innerText); if (!t) return;
        const eb = clean((h.parentElement.querySelector('.eyebrow') || {}).textContent || '');
        const body = clean(sec.innerText).slice(0, 600);
        items.push({ g: 'Sections', t: t, s: title + (eb ? ' · ' + eb : ''), u: u + '#' + sec.id, k: body });
      });
      if (u === 'events.html') document.querySelectorAll('.evrow').forEach(e => {
        const t = clean((e.querySelector('h4') || {}).innerText); if (!t) return;
        const d = clean(e.querySelector('.d') && e.querySelector('.d').innerText).replace(' ', ' ');
        const href = e.getAttribute('href');
        items.push({ g: 'Events', t: t, s: d + ' · ' + clean(e.querySelector('.text-xs') && e.querySelector('.text-xs').innerText), u: href ? (href.startsWith('http') ? href : href) : 'events.html', k: clean(e.innerText) });
      });
      if (u === 'resources.html') document.querySelectorAll('a.row').forEach(e => {
        const t = clean((e.querySelector('b') || {}).innerText).replace(/(\s+[A-ZÑ&]{2,}(\s+[A-ZÑ&]{2,})*)+$/, '');
        if (t) items.push({ g: 'Resources', t: t, s: 'Resources', u: e.getAttribute('href'), k: clean(e.innerText) });
      });
      return items;
    }, u);
    out.push(...r);
  }
  await b.close();
  const honors = JSON.parse(fs.readFileSync('data/pathfinder-honors.json'));
  const CAT = ['Arts, Crafts and Hobbies', 'Health and Science', 'Household Arts', 'Nature', 'Outdoor Industries', 'Recreation', 'Spiritual Growth, Outreach and Heritage', 'Vocational'];
  honors.forEach(h => out.push({ g: 'Honors', t: h.n, s: 'Pathfinder honor · ' + CAT[h.c] + ' · Level ' + h.l, u: 'ministries/pathfinders/honors.html?h=' + h.s, i: 'img/honors/' + h.s + '.webp' }));
  const awards = JSON.parse(fs.readFileSync('data/adventurer-awards.json')).filter(a => a.img);
  awards.forEach(a => out.push({ g: 'Awards', t: a.name, s: 'Adventurer award · ' + a.cls, u: 'ministries/adventurers/awards.html?a=' + encodeURIComponent(a.name), i: a.img }));
  const seen = new Set(), uniq = out.filter(x => { const k = x.g + x.t + x.u; if (seen.has(k)) return false; seen.add(k); return true; });
  uniq.forEach(x => { if (x.k) x.k = x.k.toLowerCase(); if (!x.i) delete x.i; if (!x.k) delete x.k; });
  fs.writeFileSync('assets/search-index.json', JSON.stringify(uniq));
  const c = {}; uniq.forEach(x => c[x.g] = (c[x.g] || 0) + 1); console.log(uniq.length, c, (fs.statSync('assets/search-index.json').size / 1024).toFixed(0) + ' KB');
})();
