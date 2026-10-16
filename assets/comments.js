/* Comments on the gnycyouth.org prototype. Every page gets a Comments button beside the slot toggle and a drawer
   with the comments for that page. A comment is about the whole page or about one content slot, named by the
   code from the content brief (HM-05); while the codes are shown, every slot carries its own Comment button.
   Kept by a small comments service (comments-worker/, a Cloudflare Worker with a D1 table). Loaded by assets/site.js;
   comments.html loads it directly and uses window.gnycComments. */
(function () {
  var API = (function () { try { return localStorage.getItem('gnycyouth.comments.api') || ''; } catch (e) { return ''; } })() || 'https://gnycyouth-comments.rdgt07.workers.dev';
  var KN = 'gnycyouth.comments.name', KM = 'gnycyouth.comments.mod';
  var MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  /* page key, name, path: the key is the slot prefix of the page's codes, in lower case */
  var PAGES = [
    ['hm', 'Homepage', 'index.html'], ['ev', 'Events', 'events.html'], ['nw', 'News & stories', 'news.html'], ['rs', 'Resources', 'resources.html'],
    ['ab', 'About & Leadership', 'about.html'], ['hs', 'Our history', 'history.html'],
    ['ad', 'Adventurers', 'ministries/adventurers.html'], ['ada', 'Adventurer Awards', 'ministries/adventurers/awards.html'],
    ['pf', 'Pathfinders', 'ministries/pathfinders.html'], ['pfh', 'Pathfinder Honors', 'ministries/pathfinders/honors.html'],
    ['pbe', 'Pathfinder Bible Experience', 'ministries/pathfinders/bible-experience.html'], ['tlt', 'Teen Leadership Training', 'ministries/pathfinders/teen-leadership-training.html'],
    ['dc', 'Drum Corps', 'ministries/pathfinders/drum-corps.html'], ['dm', 'Drilling & Marching', 'ministries/pathfinders/drilling-marching.html'],
    ['mg', 'Master Guides', 'ministries/master-guides.html'], ['ay', 'AY Ministries', 'ministries/ay-ministries.html'],
    ['ya', 'Young Adults', 'ministries/ay/young-adults.html'], ['soe', 'School of Evangelism', 'ministries/ay/school-of-evangelism.html'],
    ['pcm', 'Public Campus Ministry', 'ministries/ay/public-campus-ministry.html'],
    ['brief', 'Content brief', 'brief.html'], ['sitemap', 'Page map', 'sitemap.html'], ['design', 'Design guidelines', 'design.html']
  ];
  var h = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ls = function (k, v) { try { if (v === undefined) return localStorage.getItem(k) || ''; if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return ''; } };
  var when = function (iso) { var d = new Date(iso); if (isNaN(d)) return ''; var hh = ((d.getHours() + 11) % 12) + 1, mm = String(d.getMinutes()).padStart(2, '0'); return MO[d.getMonth()] + ' ' + d.getDate() + ', ' + hh + ':' + mm + ' ' + (d.getHours() >= 12 ? 'PM' : 'AM'); };
  var mod = ls(KM);
  var api = function (path, opt) { opt = opt || {}; var hd = { 'Content-Type': 'application/json' }; if (mod) hd['X-Mod-Key'] = mod;
    return fetch(API + path, Object.assign({}, opt, { headers: hd })).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status)); return j; }); }); };
  var unreachable = function (err) { return /Failed to fetch|NetworkError|Load failed|origin not allowed/.test(err.message); };
  /* threads: top comments with their replies, the thread with the newest message first */
  function threads(all) { var by = {}, ids = {}; all.forEach(function (c) { ids[String(c.id)] = 1; if (c.parent) (by[c.parent] = by[c.parent] || []).push(c); });
    var tops = all.filter(function (c) { return !c.parent; }); Object.keys(by).forEach(function (k) { if (!ids[k]) tops.push({ id: Number(k), gone: true, at: '', page: by[k][0].page, slot: by[k][0].slot }); });
    return tops.map(function (t) { var reps = (by[t.id] || []).sort(function (a, b) { return a.id - b.id; }); var last = [t.at || ''].concat(reps.map(function (r) { return r.at; })).sort().pop(); return { t: t, reps: reps, last: last }; })
      .sort(function (a, b) { return b.last.localeCompare(a.last) || b.t.id - a.t.id; }); }
  var REP_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v5"/></svg>';
  function pageFor(path) { for (var i = 0; i < PAGES.length; i++) { var p = PAGES[i]; if (path.slice(-p[2].length - 1) === '/' + p[2] || (p[2] === 'index.html' && /\/$/.test(path))) return p; } return null; }
  window.gnycComments = { API: API, PAGES: PAGES, KN: KN, api: api, threads: threads, when: when, h: h, ls: ls, unreachable: unreachable, REP_SVG: REP_SVG,
    getMod: function () { return mod; }, setMod: function (k) { mod = k || ''; ls(KM, mod || null); } };

  if (document.body.getAttribute('data-page') === 'comments') return;
  var ROOT = document.documentElement.getAttribute('data-root') || './';
  var P = pageFor(location.pathname); var firstSlot = document.querySelector('[data-slot]');
  var page = P ? P[0] : (firstSlot ? firstSlot.dataset.slot.split('-')[0].toLowerCase() : 'page');
  var label = P ? P[1] : document.title.replace(/\s*[·|].*$/, '');
  /* the slots on this page, by code */
  var SLOTS = []; var seen = {};
  document.querySelectorAll('[data-slot]').forEach(function (el) { var c = el.dataset.slot; if (!/^[A-Z]{2,3}-\d\d$/.test(c) || seen[c]) return; seen[c] = 1; SLOTS.push({ code: c, spec: el.dataset.spec || '', el: el }); });
  SLOTS.sort(function (a, b) { return a.code < b.code ? -1 : 1; });
  var specOf = function (code) { for (var i = 0; i < SLOTS.length; i++) if (SLOTS[i].code === code) return SLOTS[i].spec; return ''; };
  var short = function (s) { s = s.replace(/^[^·]*·\s*/, ''); return s.length > 48 ? s.slice(0, 46) + '…' : s; };

  /* the floating button */
  var fab = document.createElement('button'); fab.className = 'cmt-fab'; fab.type = 'button'; fab.setAttribute('aria-haspopup', 'dialog');
  fab.title = 'Comments on this page, visible to everyone with the link';
  fab.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">forum</span><span>Comments</span><span class="n" aria-label="comments on this page"></span>';
  document.body.appendChild(fab);
  /* a Comment button on each slot, shown while the codes are shown */
  SLOTS.forEach(function (s) { var host = /^(IMG|VIDEO|INPUT|A|BUTTON)$/.test(s.el.tagName) ? s.el.parentElement : s.el; if (host && host !== s.el) host.classList.add('slot-host'); if (!host) return;
    var b = document.createElement('button'); b.className = 'slot-cm'; b.type = 'button'; b.dataset.for = s.code; b.title = 'Comment on ' + s.code; b.innerHTML = 'Comment<i></i>';
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); show(s.code); }); host.appendChild(b); s.btn = b; });

  var list = null, open = null, filter = '';
  function badge() { fab.querySelector('.n').textContent = list && list.length ? String(list.length) : '';
    SLOTS.forEach(function (s) { if (!s.btn) return; var n = list ? list.filter(function (c) { return c.slot === s.code; }).length : 0; s.btn.querySelector('i').textContent = n ? String(n) : ''; }); }
  function load() { return api('/c?page=' + encodeURIComponent(page)).then(function (j) { list = j.comments || []; badge(); return list; }); }
  function chip(c) { return c.slot ? '<a class="sl" href="#' + h(c.slot) + '" title="' + h(specOf(c.slot)) + '">' + h(c.slot) + (specOf(c.slot) ? '<small>' + h(short(specOf(c.slot))) + '</small>' : '') + '</a>' : ''; }
  function one(c, r) { return '<article class="c' + (r ? ' r' : '') + '" data-id="' + c.id + '"><div class="who"><b>' + h(c.name) + '</b><time datetime="' + h(c.at) + '">' + when(c.at) + '</time>' + (!r && !filter ? chip(c) : '') + (mod ? '<button class="del" type="button">Delete</button>' : '') + '</div><p>' + h(c.body) + '</p></article>'; }
  function renderList() { if (!open) return; var L = open.querySelector('.list'); if (list === null) { L.innerHTML = '<div class="none">Loading…</div>'; return; }
    var rows = filter ? list.filter(function (c) { return c.slot === filter; }) : list;
    if (!rows.length) { L.innerHTML = '<div class="none"><b>No comments yet' + (filter ? ' on ' + h(filter) : '') + '</b>Be the first: what works, what does not, what you would change.</div>'; return; }
    L.innerHTML = threads(rows).map(function (th) { var t = th.t; return '<div class="th" data-th="' + t.id + '">' + (t.gone ? '<div class="c gone">This comment was removed.</div>' : one(t)) +
      (th.reps.length ? '<div class="reps">' + th.reps.map(function (r) { return one(r, 1); }).join('') + '</div>' : '') +
      (t.gone ? '' : '<button class="rep" type="button" data-to="' + t.id + '" aria-label="Reply to ' + h(t.name) + '">' + REP_SVG + 'Reply</button>') + '</div>'; }).join(''); }
  function renderFilter() { if (!open) return; var F = open.querySelector('.flt'), sel = open.querySelector('select[name="slot"]');
    if (filter) { F.hidden = false; F.innerHTML = '<b>' + h(filter) + '</b><span>' + h(specOf(filter) || 'this section') + '</span><button type="button">Show all</button>'; F.querySelector('button').onclick = function () { setFilter(''); }; }
    else { F.hidden = true; F.innerHTML = ''; }
    if (sel && sel.value !== filter) sel.value = filter; }
  function setFilter(code) { filter = code; renderFilter(); renderList();
    document.querySelectorAll('.slot-here').forEach(function (x) { x.classList.remove('slot-here'); });
    if (code) { var s = SLOTS.filter(function (x) { return x.code === code; })[0]; if (s) { document.body.classList.add('show-slots'); s.el.classList.add('slot-here'); } } }
  function renderFoot() { if (!open) return; var F = open.querySelector('footer');
    F.innerHTML = mod ? '<span>Moderating as Darwin Garcia · Delete shows on every comment.</span><button type="button" class="stop">Stop</button>' : '<span>Visible to everyone with the link. Darwin Garcia can remove a comment.</span><button type="button" class="modb">Moderate</button>';
    var m = F.querySelector('.modb'); if (m) m.onclick = function () { F.innerHTML = '<input type="password" placeholder="Moderator key" aria-label="Moderator key" autocomplete="off"><button type="button" class="use">Use key</button><button type="button" class="cancel">Cancel</button>';
      var i = F.querySelector('input'); i.focus(); F.querySelector('.cancel').onclick = renderFoot;
      var go = function () { var k = i.value.trim(); if (!k) return; mod = k; api('/c/check').then(function () { window.gnycComments.setMod(k); renderList(); renderFoot(); }).catch(function () { mod = ''; F.querySelector('.use').textContent = 'Key not accepted'; i.focus(); }); };
      F.querySelector('.use').onclick = go; i.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } }; };
    var s = F.querySelector('.stop'); if (s) s.onclick = function () { window.gnycComments.setMod(''); mod = ''; renderList(); renderFoot(); }; }
  function close() { if (!open) return; open.remove(); open = null; var sc = document.querySelector('.cmts-scrim'); if (sc) sc.remove(); fab.focus(); }
  function show(slot) { if (open) { if (slot === undefined) { close(); return; } setFilter(slot); open.querySelector('textarea[name="body"]').focus(); return; }
    var sc = document.createElement('div'); sc.className = 'cmts-scrim'; sc.onclick = close; document.body.appendChild(sc);
    open = document.createElement('aside'); open.className = 'cmts'; open.setAttribute('role', 'dialog'); open.setAttribute('aria-modal', 'true'); open.setAttribute('aria-labelledby', 'cmt-h');
    var opts = '<option value="">The whole page</option>' + SLOTS.map(function (s) { return '<option value="' + h(s.code) + '">' + h(s.code) + (s.spec ? ' · ' + h(short(s.spec)) : '') + '</option>'; }).join('');
    open.innerHTML = '<header><div><h2 id="cmt-h">Comments</h2><span class="sub">' + h(label) + ' · each comment names the section it is about, by its code</span></div><button class="x" type="button" aria-label="Close comments">✕</button></header><div class="flt" hidden></div><div class="list" aria-live="polite"></div>' +
      '<form class="add"><label>Your name<input name="name" maxlength="60" value="' + h(ls(KN)) + '" autocomplete="name"></label><label>About<select name="slot">' + opts + '</select></label><label>Comment<textarea name="body" maxlength="2000" placeholder="What works, what does not, what you would change"></textarea></label><input class="hp" name="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="acts"><span class="st" role="status">Posted comments are kept and shown to everyone who opens this page.</span><button class="post" type="submit">Post comment</button></div></form><footer></footer>';
    document.body.appendChild(open); open.querySelector('.x').onclick = close;
    var f = open.querySelector('.add'), st = open.querySelector('.st'), pb = open.querySelector('.post'), L = open.querySelector('.list');
    f.slot.onchange = function () { setFilter(f.slot.value); };
    setFilter(slot || ''); renderFoot();
    f.onsubmit = function (e) { e.preventDefault(); var name = f.name.value.trim(), body = f.body.value.trim(); if (!name || !body) { st.className = 'st bad'; st.textContent = !name ? 'Add your name so the team knows who said it.' : 'Write the comment first.'; (!name ? f.name : f.body).focus(); return; }
      pb.disabled = true; st.className = 'st'; st.textContent = 'Posting…';
      api('/c', { method: 'POST', body: JSON.stringify({ page: page, name: name, body: body, slot: f.slot.value || null, hp: f.hp.value }) }).then(function (j) { ls(KN, name); list = [j.comment].concat(list || []); badge(); renderList(); f.body.value = ''; st.className = 'st ok'; st.textContent = 'Posted. Thank you.'; L.scrollTop = 0; })
        .catch(function (err) { st.className = 'st bad'; st.textContent = unreachable(err) ? 'Comments cannot be reached from here. Open the shared link at gnyc-youth-department.github.io.' : err.message; }).then(function () { pb.disabled = false; }); };
    L.addEventListener('click', function (e) { var rb = e.target.closest('.rep'); if (rb) { var to = rb.dataset.to, who = (list.filter(function (c) { return String(c.id) === to; })[0] || {}).name || ''; var prev = L.querySelector('.rf'); if (prev) { var pbt = prev.previousElementSibling; prev.remove(); if (pbt) pbt.hidden = false; }
        var rf = document.createElement('form'); rf.className = 'rf'; rf.dataset.to = to; rf.innerHTML = '<input name="name" maxlength="60" value="' + h(ls(KN)) + '" placeholder="Your name" aria-label="Your name" autocomplete="name"><textarea name="body" maxlength="2000" placeholder="Reply to ' + h(who) + '" aria-label="Reply to ' + h(who) + '"></textarea><input class="hp" name="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="acts"><span class="st" role="status"></span><button type="button" class="cancel">Cancel</button><button class="post" type="submit">Post reply</button></div>';
        rb.hidden = true; rb.after(rf); (ls(KN) ? rf.body : rf.name).focus(); rf.scrollIntoView({ block: 'nearest' }); return; }
      if (e.target.closest('.rf .cancel')) { var rf2 = e.target.closest('.rf'), rb2 = rf2.previousElementSibling; rf2.remove(); if (rb2) { rb2.hidden = false; rb2.focus(); } return; }
      var a = e.target.closest('a.sl'); if (a) { close(); return; }
      var d = e.target.closest('.del'); if (d) { var art = d.closest('.c'), id = art.dataset.id; if (d.dataset.arm !== '1') { d.dataset.arm = '1'; d.textContent = 'Confirm delete'; d.onblur = function () { d.dataset.arm = ''; d.textContent = 'Delete'; }; return; }
        d.disabled = true; api('/c/' + id, { method: 'DELETE' }).then(function () { list = list.filter(function (c) { return String(c.id) !== String(id); }); badge(); renderList(); }).catch(function (err) { d.disabled = false; d.textContent = err.message.indexOf('key') > -1 ? 'Key not accepted' : 'Could not delete'; }); } });
    L.addEventListener('submit', function (e) { var rf = e.target.closest('.rf'); if (!rf) return; e.preventDefault(); var st2 = rf.querySelector('.st'), pb2 = rf.querySelector('.post'), name = rf.name.value.trim(), body = rf.body.value.trim();
      if (!name || !body) { st2.className = 'st bad'; st2.textContent = !name ? 'Add your name.' : 'Write the reply first.'; (!name ? rf.name : rf.body).focus(); return; }
      pb2.disabled = true; st2.className = 'st'; st2.textContent = 'Posting…';
      api('/c', { method: 'POST', body: JSON.stringify({ page: page, name: name, body: body, parent: Number(rf.dataset.to), hp: rf.hp.value }) }).then(function (j) { ls(KN, name); list = [j.comment].concat(list); badge(); renderList(); var n = L.querySelector('.c[data-id="' + j.comment.id + '"]'); if (n) { n.scrollIntoView({ block: 'nearest' }); var b = n.closest('.th').querySelector('.rep'); if (b) b.focus(); } })
        .catch(function (err) { st2.className = 'st bad'; st2.textContent = unreachable(err) ? 'Comments cannot be reached from here.' : err.message; pb2.disabled = false; }); });
    load().then(renderList).catch(function (err) { if (!open) return; L.innerHTML = '<div class="none"><b>Comments cannot be reached from here</b>' + (unreachable(err) ? 'Open the shared link at gnyc-youth-department.github.io, or a local server.' : h(err.message)) + '</div>'; });
    (ls(KN) ? f.body : f.name).focus(); }
  fab.addEventListener('click', function () { show(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) close(); });
  load().catch(function (err) { console.warn('Comments: count not loaded.', err.message); });
})();
