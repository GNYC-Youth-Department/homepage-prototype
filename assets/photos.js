/* Real photos in the staff copy only. On the staff host (behind Cloudflare Access) the Worker lists the photos in the
   private Drive folder by slot code; each matching slot on the page shows its photo. The public GitHub Pages copy
   never loads this file's data: it keeps its placeholders. See staff-worker/README.md. */
(function () {
  var STAFF = ['site-review.gnycyouth.org', 'gnyc.webtekton.com'].indexOf(location.hostname) !== -1;   /* the staff copy; gnyc.webtekton.com is the older address, kept until the move is confirmed */
  var API = (function () { try { return localStorage.getItem('gnycyouth.photos.api') || ''; } catch (e) { return ''; } })();
  if (!STAFF && !API) return;
  var base = API || location.origin;
  var CODE = /^[A-Z]{2,3}-\d\d(?:-\d{1,2})?$/;
  var PHOTO = /photo|headshot|portrait|artwork|key art|^done|^file/i;
  var NOTE = { 401: 'You are not signed in, so photos are not shown. Reload the page to sign in again.',
    503: 'Photos are not connected yet: the Drive folder or the sign-in is still being set up.',
    502: 'Photos could not be read from Drive just now. Reload in a minute; if it stays, tell the site admin.' };
  function notice(status) {
    console.warn('photos: index answered ' + status);
    var msg = NOTE[status] || ('Photos could not be loaded (' + status + '). Reload the page; if your sign-in has expired it will ask for a new code.');
    var d = document.createElement('div'); d.setAttribute('role', 'status'); d.className = 'photo-notice'; d.textContent = msg;
    var x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Dismiss'); x.textContent = '\u00d7'; x.onclick = function () { d.remove(); }; d.appendChild(x);
    document.body.appendChild(d);
  }
  function load(url, done, fail) { var i = new Image(); i.onload = done; i.onerror = function () { console.warn('photos: could not load ' + url); fail(); }; i.src = url; }
  function fill(photos) {
    Object.keys(photos).forEach(function (code) {
      if (!CODE.test(code)) return;
      var url = base + '/photos/' + code + '?v=' + encodeURIComponent(photos[code]);
      document.querySelectorAll('[data-slot="' + code + '"]').forEach(function (el) {
        if (el.hasAttribute('data-photo') || el.querySelector('[data-slot]')) return;   /* done already, or a parent such as PF-14 whose photos are PF-14-1… */
        var img = el.tagName === 'IMG' ? el : (el.querySelectorAll('img').length === 1 ? el.querySelector('img') : null);
        var target = img, mode = 'img';
        if (!img) {
          if (!PHOTO.test(el.getAttribute('data-spec') || '')) return;
          target = el.classList.contains('ph') ? el : (el.querySelectorAll('.ph').length === 1 ? el.querySelector('.ph') : el);   /* a quote's avatar sits inside its caption */
          mode = target.classList.contains('ph') ? 'ph' : 'words';
        }
        el.setAttribute('data-photo', 'loading');
        load(url, function () {                                               /* swap only once the photo has loaded: a failure keeps the placeholder */
          if (mode === 'img') { img.removeAttribute('srcset'); img.src = url; img.classList.add('drive-photo'); }
          else {
            target.style.background = (mode === 'words' ? 'linear-gradient(to top,rgba(2,6,23,.78),rgba(2,6,23,.15) 60%),' : '') + 'url("' + url + '") center/cover no-repeat';
            target.classList.add('has-photo');
          }
          el.setAttribute('data-photo', 'drive');
        }, function () { el.setAttribute('data-photo', 'failed'); });
      });
    });
    document.querySelectorAll('tr[data-code]').forEach(function (tr) {     /* content brief: mark rows whose photo is in Drive */
      var c = tr.getAttribute('data-code'), td = tr.querySelector('td.code');
      if (photos[c] && td && !td.querySelector('.in-drive')) td.insertAdjacentHTML('beforeend', '<span class="in-drive">In Drive</span>');
    });
  }
  fetch(base + '/photos/index').then(function (r) {
    if (!r.ok) { notice(r.status); return null; }
    return r.json();
  }).then(function (j) {
    if (!j || !j.photos) return;
    window.gnycPhotos = j;
    fill(j.photos); setTimeout(function () { fill(j.photos); }, 1500);  /* the brief renders its tables after load */
  }).catch(function (e) { notice('network error'); console.warn('photos:', e && e.message); });
})();
