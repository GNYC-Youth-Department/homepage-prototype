/* Site search for the gnycyouth.org prototype.
   Instant autocomplete over assets/search-index.json (pages, sections, events, resources, honors, awards).
   Any <input data-search> gets a suggestion list; the nav's search button opens the same search in a dialog. */
(function () {
  var ROOT = document.documentElement.getAttribute('data-root') || './';
  var GROUPS = [['Pages', 4, 'description'], ['Sections', 4, 'bookmark'], ['Events', 3, 'event'], ['Resources', 3, 'folder_open'], ['Honors', 4, null], ['Awards', 3, null]];
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
      else if (t.length > 3 && words.some(function (w) { return near(w, t) || near(w.slice(0, t.length), t); })) s = 30;
      if (!s) return 0;
      total += s;
    }
    if (x.g === 'Honors' || x.g === 'Awards') total -= 20;
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

  function attach(input, opts) {
    opts = opts || {};
    var box = document.createElement('div'); box.className = 'ss-list'; box.id = 'ss-' + Math.random().toString(36).slice(2, 8); box.setAttribute('role', 'listbox'); box.hidden = true;
    input.parentNode.appendChild(box);
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-expanded', 'false'); input.setAttribute('aria-controls', box.id); input.setAttribute('autocomplete', 'off');
    var items = [], active = -1, t;
    function close() { box.hidden = true; input.setAttribute('aria-expanded', 'false'); active = -1; input.removeAttribute('aria-activedescendant'); }
    function setActive(i) {
      var opts2 = box.querySelectorAll('.ss-opt'); if (!opts2.length) return;
      active = (i + opts2.length) % opts2.length;
      opts2.forEach(function (o, k) { o.classList.toggle('is-on', k === active); o.setAttribute('aria-selected', k === active); });
      input.setAttribute('aria-activedescendant', opts2[active].id); opts2[active].scrollIntoView({ block: 'nearest' });
    }
    function render(q) {
      var toks = fold(q).split(/\s+/).filter(Boolean);
      if (!toks.length) { close(); return; }
      var hits = index.map(function (x) { return [score(x, toks), x]; }).filter(function (h) { return h[0] > 0; }).sort(function (a, b) { return b[0] - a[0]; });
      var html = '', n = 0; items = [];
      function best(name) { for (var i = 0; i < hits.length; i++) if (hits[i][1].g === name) return hits[i][0]; return -1; }
      GROUPS.slice().sort(function (a, b) { return best(b[0]) - best(a[0]); }).forEach(function (g) {
        var inG = hits.filter(function (h) { return h[1].g === g[0]; }), rows = inG.slice(0, g[1]);
        if (!rows.length) return;
        html += '<div class="ss-group" role="presentation"><div class="ss-gh">' + g[0] + (inG.length > rows.length && (g[0] === 'Honors' || g[0] === 'Awards') ? '<a class="ss-more" href="' + href(g[0] === 'Honors' ? 'ministries/pathfinders/honors.html?q=' : 'ministries/adventurers/awards.html?q=') + encodeURIComponent(q) + '">All ' + inG.length + ' <span aria-hidden="true">&rarr;</span></a>' : '') + '</div>';
        rows.forEach(function (h) {
          var x = h[1], ext = /^https?:/.test(x.u);
          items.push(x);
          html += '<a class="ss-opt" role="option" id="' + box.id + '-' + n + '" href="' + esc(href(x.u)) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
            (x.i ? '<img src="' + esc(ROOT + x.i) + '" alt="" loading="lazy">' : '<span class="ss-ic material-symbols-outlined" aria-hidden="true">' + g[2] + '</span>') +
            '<span class="ss-tx"><b>' + mark(x.t, toks) + '</b><small>' + esc(x.s || '') + '</small></span>' +
            (ext ? '<span class="material-symbols-outlined ss-ext" aria-hidden="true">open_in_new</span>' : '') + '</a>';
          n++;
        });
        html += '</div>';
      });
      box.innerHTML = html || '<div class="ss-empty"><span class="material-symbols-outlined" aria-hidden="true">search_off</span><div><b>No matches for “' + esc(q) + '”</b><small>Try a shorter word, like “camporee”, “honors” or “uniform”.</small></div></div>';
      box.hidden = false; input.setAttribute('aria-expanded', 'true'); active = -1;
      if (opts.onRender) opts.onRender(n);
    }
    input.addEventListener('input', function () { var q = input.value; clearTimeout(t); t = setTimeout(function () { load().then(function () { render(q); }).catch(function () { box.innerHTML = '<div class="ss-empty"><div><b>Search is unavailable right now</b><small>Please use the menu to find your way.</small></div></div>'; box.hidden = false; }); }, 80); });
    input.addEventListener('focus', function () { load().catch(function () {});
      if (!input.closest('dialog')) { var r = input.getBoundingClientRect(); if (r.top > innerHeight * 0.35) window.scrollTo({ top: scrollY + r.top - 96, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } if (input.value.trim() && index) render(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (box.hidden && input.value.trim()) render(input.value); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Enter') { var o = box.querySelectorAll('.ss-opt'); var pick = o[active >= 0 ? active : 0]; if (pick) { e.preventDefault(); pick.click(); } }
      else if (e.key === 'Escape') { if (!box.hidden) { e.stopPropagation(); close(); } }
    });
    document.addEventListener('click', function (e) { if (!box.contains(e.target) && e.target !== input) close(); });
    var form = input.closest('form'); if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });
    return { close: close };
  }

  /* inline search bars */
  document.querySelectorAll('input[data-search]').forEach(function (i) { attach(i); });

  /* the nav search button opens a search dialog on every page */
  var dlg = document.createElement('dialog'); dlg.className = 'ss-dlg'; dlg.setAttribute('aria-label', 'Search the site');
  dlg.innerHTML = '<form class="ss-bar ss-bar-dlg" role="search"><span class="material-symbols-outlined ss-lead" aria-hidden="true">search</span><input type="search" placeholder="Search events, clubs, honors, forms…" aria-label="Search the site"><button type="button" class="ss-x" aria-label="Close search"><span class="material-symbols-outlined" aria-hidden="true">close</span></button></form><p class="ss-tip">Try “camporee”, “uniform”, “knot tying” or “find a club”.</p>';
  document.body.appendChild(dlg);
  var dInput = dlg.querySelector('input'); attach(dInput);
  function openDlg() { if (!dlg.open) dlg.showModal(); dInput.focus(); dInput.select(); }
  dlg.querySelector('.ss-x').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  document.querySelectorAll('[data-open-search]').forEach(function (b) { b.addEventListener('click', function () { var hero = document.querySelector('input[data-search]'); if (hero && hero.getBoundingClientRect().top > 0 && hero.getBoundingClientRect().bottom < innerHeight) { hero.focus(); return; } openDlg(); }); });
  document.addEventListener('keydown', function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if ((e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(tag) && !document.querySelector('#q')) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault(); var hero = document.querySelector('input[data-search]'); if (hero && hero.getBoundingClientRect().bottom > 0 && hero.getBoundingClientRect().top < innerHeight) hero.focus(); else openDlg();
    }
  });
})();
