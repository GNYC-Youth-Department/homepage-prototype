/* Shared chrome for the gnycyouth.org prototype. Renders the ribbon, nav, footer and slot toggle
   into <div data-site="nav"> / <div data-site="footer"> so every page shares one menu. */
(function () {
  var ROOT = document.documentElement.getAttribute('data-root') || './';
  var CONGRESS = 'https://events.gnycyouth.com/event/13/adventist-youth-congress-xviii?aff=P1A3HA0V';
  var page = document.body.getAttribute('data-page') || '';
  function u(p) { return ROOT + p; }

  var clubs = [
    { key: 'adventurers', name: 'Adventurers', ages: 'Ages 4–9', crest: u('img/07.png'), dot: '#0ea5e9', href: u('ministries/adventurers.html'),
      sub: [['Awards & classes', u('ministries/adventurers/awards.html')], ['Family Network', u('ministries/adventurers.html')], ['Start a club', u('ministries/adventurers.html#find')]] },
    { key: 'pathfinders', name: 'Pathfinders', ages: 'Ages 10–16', crest: u('img/08.png'), dot: '#dc2626', href: u('ministries/pathfinders.html'),
      sub: [['Pathfinder Bible Experience', u('ministries/pathfinders/bible-experience.html'), u('img/pbe-logo.png')], ['Teen Leadership Training', u('ministries/pathfinders/teen-leadership-training.html'), u('img/tlt-logo.png')], ['Drum Corps', u('ministries/pathfinders/drum-corps.html')], ['Drilling & Marching', u('ministries/pathfinders/drilling-marching.html')]] },
    { key: 'masterguides', name: 'Master Guides', ages: 'Grade 11 to adult', crest: u('img/crest-mg.png'), dot: '#1e40af', href: u('ministries/master-guides.html'),
      sub: [['Curriculum & investiture', u('ministries/master-guides.html#classes')], ['Basic Staff Training', u('ministries/master-guides.html')], ['Master Guide clubs', u('ministries/master-guides.html#find')]] },
    { key: 'ay', name: 'AY Ministries', ages: 'Young adults', crest: u('img/crest-ay.png'), dot: '#0284c7', href: u('ministries/ay-ministries.html'),
      sub: [['Young Adults', u('ministries/ay/young-adults.html')], ['School of Evangelism', u('ministries/ay/school-of-evangelism.html')], ['Public Campus Ministry', u('ministries/ay/public-campus-ministry.html')]] }
  ];
  var about = [
    ['info', 'About us', 'Mission and who we serve', u('about.html')],
    ['groups', 'Leadership', 'Directors and coordinators', u('about.html#leadership')],
    ['history_edu', 'Our history', 'Youth ministry in New York', u('history.html')],
    ['mail', 'Contact', 'Youth office, Manhasset', u('about.html#contact')]
  ];

  function megaHTML() {
    return '<div class="menu-panel mega" role="menu">' + clubs.map(function (c) {
      return '<div class="mega-col" style="--dot:' + c.dot + '"><a class="mega-head" href="' + c.href + '"><img src="' + c.crest + '" alt=""><span><strong>' + c.name + '</strong><span>' + c.ages + '</span></span></a>' +
        '<ul class="mega-sub">' + c.sub.map(function (s) { return '<li><a href="' + s[1] + '"' + (s[2] ? ' class="has-mark"' : '') + '>' + (s[2] ? '<img src="' + s[2] + '" alt="">' : '') + s[0] + '</a></li>'; }).join('') + '</ul></div>';
    }).join('') + '<div class="mega-foot"><span>Not sure where your child fits? Every club is grouped by age, and directors help families move up together.</span><a href="' + u('ministries/pathfinders.html#find') + '">Find a club near you →</a></div></div>';
  }
  function aboutHTML() {
    return '<div class="menu-panel simple" role="menu">' + about.map(function (a) {
      return '<a href="' + a[3] + '"><span class="material-symbols-outlined" aria-hidden="true">' + a[0] + '</span><span>' + a[1] + '<small>' + a[2] + '</small></span></a>';
    }).join('') + '</div>';
  }
  function cur(k) { return page === k ? ' is-current' : ''; }

  var nav = document.querySelector('[data-site="nav"]');
  if (nav) nav.innerHTML =
    '<div class="proto-ribbon" role="note"><strong>Design prototype</strong><span>Proposed gnycyouth.org &middot; for review only, not the live site &middot; <a href="' + u('brief.html') + '">Content brief for the Director</a></span></div>' +
    '<nav class="glass-nav" aria-label="Main"><div class="wrap">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;height:72px">' +
    '<a href="' + u('index.html') + '" style="display:flex;align-items:center;gap:.75rem;text-decoration:none;padding:.25rem"><img src="' + u('img/00.png') + '" alt="GNYC Adventist Youth Ministries seal" style="height:44px;width:auto"><span style="display:flex;flex-direction:column"><span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#006194;line-height:1.2">Greater New York Conference</span><span class="font-heading" style="font-weight:800;font-size:18px;letter-spacing:-.01em;color:#0f172a;line-height:1.2">Adventist Youth</span></span></a>' +
    '<div class="nav-desktop" style="display:none;align-items:center;gap:.25rem">' +
      '<a class="nav-link' + cur('events') + '" href="' + u('events.html') + '">Events</a>' +
      '<div class="nav-item"><button class="nav-link' + cur('ministries') + '" aria-expanded="false" aria-haspopup="true">Ministries<span class="material-symbols-outlined" aria-hidden="true">expand_more</span></button>' + megaHTML() + '</div>' +
      '<a class="nav-link' + cur('resources') + '" href="' + u('resources.html') + '">Resources</a>' +
      '<a class="nav-link' + cur('news') + '" href="' + u('news.html') + '">News</a>' +
      '<div class="nav-item"><button class="nav-link' + cur('about') + '" aria-expanded="false" aria-haspopup="true">About<span class="material-symbols-outlined" aria-hidden="true">expand_more</span></button>' + aboutHTML() + '</div>' +
      '<a class="nav-link" href="#">Store</a>' +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:.5rem">' +
      '<div class="lang" role="group" aria-label="Language"><button id="lang-en" aria-pressed="true">EN</button><button id="lang-es" aria-pressed="false">ES</button></div>' +
      '<button aria-label="Search" class="nav-link" style="padding:.6rem"><span class="material-symbols-outlined" style="font-size:22px">search</span></button>' +
      '<a class="btn-primary nav-register" href="' + CONGRESS + '" target="_blank" rel="noopener noreferrer" style="display:none">Register</a>' +
      '<button id="menu-btn" class="nav-link nav-burger" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu" style="padding:.5rem"><span class="material-symbols-outlined">menu</span></button>' +
    '</div></div>' +
    '<div id="mobile-menu" class="m-menu" hidden>' +
      '<a href="' + u('events.html') + '">Events</a>' +
      '<button aria-expanded="false" data-acc="m-min">Ministries<span class="material-symbols-outlined">expand_more</span></button><div class="m-sub" id="m-min" hidden>' +
        clubs.map(function (c) { return '<a class="m-club" href="' + c.href + '"><span><img src="' + c.crest + '" alt="">' + c.name + '</span><small>' + c.ages + '</small></a><div class="m-sub">' + c.sub.map(function (s) { return '<a href="' + s[1] + '">' + s[0] + '</a>'; }).join('') + '</div>'; }).join('') + '</div>' +
      '<a href="' + u('resources.html') + '">Resources</a><a href="' + u('news.html') + '">News</a>' +
      '<button aria-expanded="false" data-acc="m-about">About<span class="material-symbols-outlined">expand_more</span></button><div class="m-sub" id="m-about" hidden>' + about.map(function (a) { return '<a href="' + a[3] + '">' + a[1] + '</a>'; }).join('') + '</div>' +
      '<a href="#">Store</a><a class="btn-primary" style="justify-content:center;margin-top:.5rem" href="' + CONGRESS + '">Register for AY Congress XVIII</a>' +
    '</div></div></nav>' +
    '<style>@media (min-width:1024px){.nav-desktop{display:flex!important}.nav-burger{display:none!important}}@media (min-width:640px){.nav-register{display:inline-flex!important}}</style>';

  var foot = document.querySelector('[data-site="footer"]');
  if (foot) foot.innerHTML =
    '<footer class="site-footer" id="about-footer"><div class="wrap" style="padding-block:4rem 3rem">' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2.5rem 2rem;padding-bottom:3rem;border-bottom:1px solid rgba(12,74,110,.5)">' +
    '<div style="grid-column:span 2;min-width:260px"><div style="display:flex;align-items:center;gap:.75rem"><img src="' + u('img/00.png') + '" alt="" style="height:64px;width:auto"><div><h3 class="font-heading" style="margin:0;font-size:18px;font-weight:800">Adventist Youth Ministries</h3><p style="margin:2px 0 0;font-size:12px;color:#bae6fd">Greater New York Conference of Seventh-day Adventists</p></div></div>' +
    '<p style="max-width:24rem;font-size:14px;line-height:1.6;color:rgba(224,242,254,.8)">Reaching young hearts across the five boroughs of New York City, Long Island and the surrounding upstate counties with everlasting hope and purpose.</p>' +
    '<div style="display:grid;gap:.5rem;font-size:14px;color:rgba(224,242,254,.9)"><span>7 Shelter Rock Rd, Manhasset, NY 11030</span><a href="tel:+15166279350">(516) 627-9350</a><a href="mailto:youth@gnycyouth.org">youth@gnycyouth.org</a></div>' +
    '<div style="display:flex;gap:.75rem;margin-top:1.5rem"><a class="soc" href="https://www.instagram.com/gnycyouth/" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3.5" y="3.5" width="17" height="17" rx="4.8"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg></a><a class="soc" href="https://www.facebook.com/GNYCYouth/" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8.2v3h2.5V21z"/></svg></a><a class="soc" href="https://www.tiktok.com/@gnycyouth" aria-label="TikTok"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.8a4.3 4.3 0 0 1-1-2.8h-3v12.4a2.6 2.6 0 1 1-2.6-2.7c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.2 1.3v-3a4.3 4.3 0 0 1-3.3-1.6z"/></svg></a></div></div>' +
    '<div><h4>Ministries</h4><ul>' + clubs.map(function (c) { return '<li><a class="f-club" href="' + c.href + '"><img src="' + c.crest + '" alt="">' + c.name + '</a></li>'; }).join('') + '<li><a class="f-club" href="' + u('ministries/pathfinders/bible-experience.html') + '"><img src="' + u('img/pbe-logo.png') + '" alt="">Bible Experience (PBE)</a></li><li><a class="f-club" href="' + u('ministries/pathfinders/teen-leadership-training.html') + '"><img src="' + u('img/tlt-logo.png') + '" alt="">Teen Leadership Training</a></li></ul></div>' +
    '<div><h4>Events</h4><ul><li><a href="' + CONGRESS + '" style="color:#fcd34d;font-weight:600">AY Congress XVIII</a></li><li><a href="' + u('events.html') + '">Upcoming events</a></li><li><a href="' + u('events.html') + '">Annual Camporee</a></li><li><a href="' + u('events.html') + '">Young Adult Retreat</a></li><li><a href="https://drive.google.com/file/d/1R9X7ByCJo2Y_s8DfSZvJ8EKGKVcLDpny/view?usp=drive_link">Year calendar (PDF)</a></li></ul></div>' +
    '<div><h4>Quick access</h4><ul><li><a href="#">Store</a></li><li><a href="' + u('resources.html') + '">Forms &amp; downloads</a></li><li><a href="' + u('about.html#leadership') + '">Leadership</a></li><li><a href="' + u('about.html') + '">About GNYC Youth</a></li><li><a href="' + u('about.html#contact') + '">Contact</a></li></ul></div></div>' +
    '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:1rem;padding-top:2rem;font-size:13px;color:rgba(186,230,253,.8)"><p style="margin:0">&copy; 2026 Greater New York Conference of Seventh-day Adventists. All rights reserved.</p><div style="display:flex;gap:1.5rem"><a href="#">Terms &amp; Conditions</a><a href="#">Privacy Policy</a><a href="#">Risk Management</a></div></div>' +
    '</div></footer>' +
    '<button class="slot-toggle" id="slot-toggle" type="button" aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">sell</span><span class="slot-toggle-label">Show content slots</span></button>';

  /* dropdowns */
  document.querySelectorAll('.nav-item').forEach(function (item) {
    var btn = item.querySelector('button'), t;
    function open(o) { item.classList.toggle('is-open', o); btn.setAttribute('aria-expanded', o); }
    item.addEventListener('mouseenter', function () { clearTimeout(t); open(true); });
    item.addEventListener('mouseleave', function () { t = setTimeout(function () { open(false); }, 120); });
    btn.addEventListener('click', function () { open(!item.classList.contains('is-open')); });
    item.addEventListener('keydown', function (e) { if (e.key === 'Escape') { open(false); btn.focus(); } });
    item.addEventListener('focusout', function (e) { if (!item.contains(e.relatedTarget)) open(false); });
  });
  if (/[?&]menu=1/.test(location.search)) { var f = document.querySelector('.nav-item'); if (f) { f.classList.add('is-open'); f.querySelector('button').setAttribute('aria-expanded', true); } }
  /* mobile */
  var mb = document.getElementById('menu-btn'), mm = document.getElementById('mobile-menu');
  if (mb) mb.addEventListener('click', function () { var o = mm.hidden; mm.hidden = !o; mb.setAttribute('aria-expanded', o); mb.firstElementChild.textContent = o ? 'close' : 'menu'; });
  document.querySelectorAll('[data-acc]').forEach(function (b) { b.addEventListener('click', function () { var s = document.getElementById(b.dataset.acc), o = s.hidden; s.hidden = !o; b.setAttribute('aria-expanded', o); }); });
  if (/[?&]menu=1/.test(location.search) && mm) { mm.hidden = false; var mi = document.getElementById('m-min'); if (mi) { mi.hidden = false; } }
  /* language toggle (visual only) */
  var en = document.getElementById('lang-en'), es = document.getElementById('lang-es');
  if (en) { en.onclick = function () { en.setAttribute('aria-pressed', true); es.setAttribute('aria-pressed', false); }; es.onclick = function () { es.setAttribute('aria-pressed', true); en.setAttribute('aria-pressed', false); }; }
  /* filters: any [data-filter-group="cls"] with [data-filter] buttons hides .cls items */
  document.querySelectorAll('[data-filter-group]').forEach(function (g) {
    var items = document.querySelectorAll('.' + g.dataset.filterGroup);
    g.addEventListener('click', function (e) { var p = e.target.closest('[data-filter]'); if (!p) return;
      g.querySelectorAll('[data-filter]').forEach(function (x) { var on = x === p; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
      items.forEach(function (it) { it.hidden = p.dataset.filter !== 'all' && (it.dataset.cats || '').split(' ').indexOf(p.dataset.filter) < 0; }); });
  });
  /* content-slot overlay */
  var st = document.getElementById('slot-toggle');
  function slots(on) { document.body.classList.toggle('show-slots', on); st.setAttribute('aria-pressed', on); st.querySelector('.slot-toggle-label').textContent = on ? 'Hide content slots' : 'Show content slots'; try { sessionStorage.setItem('slots', on ? '1' : '0'); } catch (e) {} }
  if (st) {
    var want = /[?&]slots=1/.test(location.search); try { if (!want && sessionStorage.getItem('slots') === '1') want = true; } catch (e) {}
    slots(want); st.addEventListener('click', function () { slots(!document.body.classList.contains('show-slots')); });
  }
})();
