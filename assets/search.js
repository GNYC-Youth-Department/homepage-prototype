/* Site search for the gnycyouth.org prototype.
   Instant autocomplete over assets/search-index.json (pages, sections, events, resources, honors, awards).
   Any <input data-search> gets a results panel with a preview; the nav's search button opens the same search in a dialog. */
(function () {
  var ROOT = document.documentElement.getAttribute('data-root') || './';
  var GROUPS = { Pages: { n: 4, c: '#0284c7' }, Sections: { n: 4, c: '#4f46e5' }, Events: { n: 3, c: '#d97706' }, Resources: { n: 3, c: '#059669' }, Honors: { n: 8, c: '#b91c1c', tiles: 1 }, Awards: { n: 8, c: '#0369a1', tiles: 1 } };
  var ORDER = ['Pages', 'Sections', 'Events', 'Resources', 'Honors', 'Awards'];
  var TRENDING = ['Camporee', 'Uniform', 'Knot tying', 'Bible Experience', 'Find a club', 'Forms'];
  var CLUBS = [['Adventurers', 'ministries/adventurers.html', 'img/07.png', 'Ages 4–9'], ['Pathfinders', 'ministries/pathfinders.html', 'img/08.png', 'Ages 10–15'], ['Master Guides', 'ministries/master-guides.html', 'img/crest-mg.png', 'Leaders'], ['AY Ministries', 'ministries/ay-ministries.html', 'img/crest-ay.png', 'Young adults']];
  var index = null, loading = null;
  function load() {
    if (index) return Promise.resolve(index);
    if (!loading) loading = fetch(ROOT + 'assets/search-index.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { d.forEach(function (x) { x._t = fold(x.t); x._s = fold(x.s || ''); x._k = fold(x.k || ''); x._a = x._t.split(/[^a-z0-9]+/).filter(function (w) { return w && !/^(and|of|the|a)$/.test(w); }).map(function (w) { return w[0]; }).join(''); }); index = d; return d; });
    return loading;
  }
  function fold(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and '); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function near(a, b) { /* one edit apart, for small typos */
    if (Math.abs(a.length - b.length) > 1) return false;
    var i = 0, j = 0, e = 0;
    while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; continue; } if (++e > 1) return false; if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; } }
    return e + (a.length - i) + (b.length - j) <= 1;
  }
  function score(x, toks) {
    var total = 0;
    for (var n = 0; n < toks.length; n++) {
      var t = toks[n], s = 0, words = x._t.split(/[^a-z0-9]+/);
      if (x.g === 'Pages' && t.length > 1 && x._a === t) s = 130;
      else if (x._t.indexOf(t) === 0) s = 100;
      else if (words.some(function (w) { return w.indexOf(t) === 0; })) s = 70;
      else if (x._t.indexOf(t) > -1) s = 45;
      else if (x._s.indexOf(t) > -1) s = 25;
      else if (x._k.indexOf(t) > -1) s = 12;
      else if (t.length > 3 && words.some(function (w) { return near(w, t) || (t.length > 4 && w.length > t.length && near(w.slice(0, t.length), t)); })) s = 30;
      if (!s) return 0;
      total += s;
    }
    if (x.g === 'Honors' || x.g === 'Awards') total -= 20; else if (x.g === 'Sections') total -= 12;
    if (x.g === 'Pages') total += 15; else if (x.g === 'Events') total += 30; else if (x.g === 'Resources') total -= 10;
    if (x._t === toks.join(' ')) total += 120;
    return total - x.t.length * 0.05;
  }
  function mark(text, toks) {
    var out = esc(text);
    toks.forEach(function (t) { if (t.length < 2) return; out = out.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); });
    return out;
  }
  function href(u) { return /^(https?:|mailto:)/.test(u) ? u : ROOT + u; }
  /* the crest a result belongs to, so each row carries its ministry's own imagery */
  function crest(x) {
    var u = x.u;
    if (/tlt|teen-leadership/i.test(u)) return 'img/tlt-logo.png';
    if (/bible-experience|nadpbe|PBE/.test(u)) return 'img/pbe-logo.png';
    if (/public-campus/.test(u)) return 'img/pcm-logo.png';
    if (/adventurer/i.test(u)) return 'img/07.png';
    if (/master-?guide/i.test(u)) return 'img/crest-mg.png';
    if (/ministries\/ay|ay-ministries/.test(u)) return 'img/crest-ay.png';
    if (/pathfinder|camporee/i.test(u)) return 'img/08.png';
    return 'img/00.png';
  }
  function dateTile(s, cls) { var m = /^([A-Z]{3}) (\d{1,2})/i.exec(s || ''); return m ? '<span class="ss-date' + (cls || '') + '"><small>' + m[1].toUpperCase() + '</small><b>' + m[2] + '</b></span>' : null; }
  function visual(x) {
    if (x.g === 'Events') return dateTile(x.s) || '<span class="ss-thumb"><img src="' + ROOT + crest(x) + '" alt=""></span>';
    if (x.g === 'Resources') return '<span class="ss-thumb ss-file"><span class="material-symbols-outlined" aria-hidden="true">' + (/\.pdf/i.test(x.u) ? 'picture_as_pdf' : /docs\.google|drive\.google/.test(x.u) ? 'description' : 'folder_open') + '</span></span>';
    return '<span class="ss-thumb"><img src="' + ROOT + crest(x) + '" alt=""></span>';
  }
  function sub(x) { return x.g === 'Events' ? ((x.s || '').replace(/^[A-Z]{3} \d{1,2} · ?/i, '') || 'Conference event') : (x.s || ''); }

  function attach(input) {
    var bar = input.closest('.ss-bar');
    var box = document.createElement('div'); box.className = 'ss-list'; box.id = 'ss-' + Math.random().toString(36).slice(2, 8); box.hidden = true;
    bar.appendChild(box);
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-expanded', 'false'); input.setAttribute('aria-controls', box.id); input.setAttribute('autocomplete', 'off');
    var active = -1, tab = 'All', lastQ = '', t, cache = [];
    function opts() { return box.querySelectorAll('.ss-opt'); }
    function close() { box.hidden = true; bar.classList.remove('is-open'); input.setAttribute('aria-expanded', 'false'); active = -1; input.removeAttribute('aria-activedescendant'); }
    function open() { box.hidden = false; bar.classList.add('is-open'); input.setAttribute('aria-expanded', 'true'); }
    function preview(el) {
      var pv = box.querySelector('.ss-pv'); if (!pv || !el) return;
      var x = cache[+el.dataset.k]; if (!x) return; var ext = /^https?:/.test(x.u);
      pv.style.setProperty('--c', GROUPS[x.g].c);
      var art = x.i ? '<img class="ss-pv-patch" src="' + esc(ROOT + x.i) + '" alt="">' : (x.g === 'Events' && dateTile(x.s, ' ss-date-lg')) || '<img class="ss-pv-crest" src="' + ROOT + crest(x) + '" alt="">';
      pv.innerHTML = '<div class="ss-pv-art">' + art + '</div><p class="ss-pv-g">' + (x.g === 'Honors' ? 'Pathfinder honor' : x.g === 'Awards' ? 'Adventurer award' : x.g.replace(/s$/, '')) + '</p><h3>' + esc(x.t) + '</h3><p class="ss-pv-s">' + esc(sub(x)) + '</p>' +
        '<a class="ss-pv-go" tabindex="-1" href="' + esc(href(x.u)) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + (ext ? 'Open link' : (x.g === 'Honors' || x.g === 'Awards') ? 'See the patch' : 'Go to page') + '<span class="material-symbols-outlined" aria-hidden="true">' + (ext ? 'open_in_new' : 'arrow_forward') + '</span></a>';
    }
    function setActive(i) {
      var o = opts(); if (!o.length) return;
      active = (i + o.length) % o.length;
      o.forEach(function (e, k) { e.classList.toggle('is-on', k === active); e.setAttribute('aria-selected', k === active); });
      input.setAttribute('aria-activedescendant', o[active].id); o[active].scrollIntoView({ block: 'nearest' }); preview(o[active]);
    }
    var FOOT = '<div class="ss-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span><span class="ss-foot-r">GNYC Youth</span></div>';
    function idle() {
      box.innerHTML = '<div class="ss-idle"><p class="ss-h">Trending</p><div class="ss-trend">' + TRENDING.map(function (w) { return '<button type="button" data-q="' + esc(w) + '"><span class="material-symbols-outlined" aria-hidden="true">trending_up</span>' + esc(w) + '</button>'; }).join('') + '</div>' +
        '<p class="ss-h">Our ministries</p><div class="ss-clubs">' + CLUBS.map(function (c) { return '<a href="' + ROOT + c[1] + '"><img src="' + ROOT + c[2] + '" alt=""><b>' + c[0] + '</b><small>' + c[3] + '</small></a>'; }).join('') + '</div></div>' + FOOT;
      open();
    }
    function render(q) {
      var toks = fold(q).split(/\s+/).filter(Boolean); lastQ = q;
      if (!toks.length) { idle(); return; }
      var hits = index.map(function (x) { return [score(x, toks), x]; }).filter(function (h) { return h[0] > 0; }).sort(function (a, b) { return b[0] - a[0]; });
      var by = {}; hits.forEach(function (h) { (by[h[1].g] = by[h[1].g] || []).push(h); });
      var order = ORDER.filter(function (g) { return by[g]; }).sort(function (a, b) { return by[b][0][0] - by[a][0][0]; });
      if (tab !== 'All' && !by[tab]) tab = 'All';
      cache = []; var n = 0, html = '';
      var tabs = '<div class="ss-tabs" role="tablist"><button type="button" role="tab" data-tab="All" aria-selected="' + (tab === 'All') + '">All <span>' + hits.length + '</span></button>' +
        order.map(function (g) { return '<button type="button" role="tab" data-tab="' + g + '" aria-selected="' + (tab === g) + '" style="--c:' + GROUPS[g].c + '"><i></i>' + g + ' <span>' + by[g].length + '</span></button>'; }).join('') + '</div>';
      (tab === 'All' ? order : [tab]).forEach(function (g) {
        var cfg = GROUPS[g], rows = by[g].slice(0, tab === 'All' ? cfg.n : 48);
        html += '<div class="ss-group" style="--c:' + cfg.c + '">' + (tab === 'All' ? '<div class="ss-gh"><i></i>' + g + (by[g].length > rows.length ? '<button type="button" class="ss-more" data-tab="' + g + '">See all ' + by[g].length + '</button>' : '') + '</div>' : '') + '<div class="' + (cfg.tiles ? 'ss-tiles' : 'ss-rows') + '">';
        rows.forEach(function (h) {
          var x = h[1], ext = /^https?:/.test(x.u); cache[n] = x;
          var a = '<a class="ss-opt' + (cfg.tiles ? ' ss-tile' : '') + '" role="option" id="' + box.id + '-' + n + '" data-k="' + n + '" href="' + esc(href(x.u)) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>';
          html += cfg.tiles ? a + '<span class="ss-tile-img"><img src="' + esc(ROOT + x.i) + '" alt="" loading="lazy"></span><b>' + mark(x.t, toks) + '</b></a>'
            : a + visual(x) + '<span class="ss-tx"><b>' + mark(x.t, toks) + '</b><small>' + esc(sub(x)) + '</small></span><span class="material-symbols-outlined ss-go" aria-hidden="true">' + (ext ? 'open_in_new' : 'arrow_forward') + '</span></a>';
          n++;
        });
        html += '</div></div>';
      });
      box.innerHTML = hits.length
        ? tabs + '<div class="ss-body"><div class="ss-res" role="listbox" aria-label="Search results">' + html + '</div><aside class="ss-pv" aria-hidden="true"></aside></div>' + FOOT
        : '<div class="ss-empty"><span class="material-symbols-outlined" aria-hidden="true">search_off</span><b>No matches for “' + esc(q) + '”</b><small>Try a shorter word, or one of these:</small><div class="ss-trend">' + TRENDING.slice(0, 4).map(function (w) { return '<button type="button" data-q="' + esc(w) + '">' + esc(w) + '</button>'; }).join('') + '</div></div>';
      open(); active = -1; var first = box.querySelector('.ss-opt'); if (first) preview(first);
    }
    box.addEventListener('mouseover', function (e) { var o = e.target.closest('.ss-opt'); if (o) preview(o); });
    box.addEventListener('mousedown', function (e) { if (e.target.closest('button')) e.preventDefault(); });
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; render(lastQ); return; }
      var q = e.target.closest('[data-q]'); if (q) { input.value = q.dataset.q; tab = 'All'; render(input.value); input.focus(); }
    });
    input.addEventListener('input', function () { var q = input.value; tab = 'All'; clearTimeout(t); t = setTimeout(function () { load().then(function () { render(q); }).catch(function () { box.innerHTML = '<div class="ss-empty"><b>Search is unavailable right now</b><small>Please use the menu to find your way.</small></div>'; open(); }); }, 70); });
    input.addEventListener('focus', function () {
      if (!input.closest('dialog')) { var r = input.getBoundingClientRect(); if (r.top > innerHeight * 0.3) window.scrollTo({ top: scrollY + r.top - 96, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
      load().then(function () { render(input.value); }).catch(function () {});
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (box.hidden) render(input.value); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Enter') { var o = opts(); var pick = o[active >= 0 ? active : 0]; if (pick) { e.preventDefault(); pick.click(); } }
      else if (e.key === 'Escape') { if (!box.hidden) { e.stopPropagation(); e.preventDefault(); close(); } }
    });
    document.addEventListener('click', function (e) { if (!e.target.isConnected || bar.contains(e.target)) return; close(); });
    var form = input.closest('form'); if (form) form.addEventListener('submit', function (e) { e.preventDefault(); var o = opts()[0]; if (o) o.click(); else input.focus(); });
  }

  document.querySelectorAll('input[data-search]').forEach(attach);

  /* page filter bars (Resources, Honors, Awards) share the look; Search jumps to the results */
  document.querySelectorAll('.ss-bar-page').forEach(function (f) { f.addEventListener('submit', function (e) { e.preventDefault(); var t = document.getElementById('results-top') || document.getElementById('list') || document.querySelector('main'); if (t) t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }); });

  /* the nav search button opens a search dialog on every page */
  var dlg = document.createElement('dialog'); dlg.className = 'ss-dlg'; dlg.setAttribute('aria-label', 'Search the site');
  dlg.innerHTML = '<form class="ss-bar ss-bar-dlg" role="search"><span class="ss-lead" aria-hidden="true"><span class="material-symbols-outlined">search</span></span><input type="search" placeholder="Search events, clubs, honors, forms…" aria-label="Search the site"><button type="button" class="ss-x" aria-label="Close search"><span class="material-symbols-outlined" aria-hidden="true">close</span></button></form>';
  document.body.appendChild(dlg);
  var dInput = dlg.querySelector('input'); attach(dInput);
  function openDlg() { if (!dlg.open) dlg.showModal(); dInput.focus(); dInput.select(); }
  dlg.querySelector('.ss-x').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  function heroInView() { var h = document.querySelector('input[data-search]'); if (!h) return null; var r = h.getBoundingClientRect(); return r.bottom > 80 && r.top < innerHeight ? h : null; }
  document.querySelectorAll('[data-open-search]').forEach(function (b) { b.addEventListener('click', function () { var h = heroInView(); if (h) h.focus(); else openDlg(); }); });
  document.addEventListener('keydown', function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    var pf = document.querySelector('.ss-bar-page input');
    if (e.key === '/' && pf && !/INPUT|TEXTAREA|SELECT/.test(tag)) { e.preventDefault(); pf.focus(); return; }
    if ((e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(tag)) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault(); var h = heroInView(); if (h) h.focus(); else openDlg();
    }
  });
})();
