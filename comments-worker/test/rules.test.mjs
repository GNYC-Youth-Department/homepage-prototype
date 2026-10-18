/* Tests for the comments service: posting only with the staff Worker's key and a listed email, names from the
   directory, no web addresses (Google Drive and Docs allowed), emails never returned. Fake D1, no network.
   Run: node comments-worker/test/rules.test.mjs */
import assert from 'node:assert/strict';
const W = (await import(new URL('../worker.js', import.meta.url))).default;
const sql = [], binds = [];
const DB = { prepare: q => { sql.push(q); return { bind: (...a) => { binds.push(a); return { first: async col => col === 'n' ? 0 : { id: 1, page: 'hm', slot: null, parent: null, name: a[3], body: a[4], at: 'now', verified: 1 }, all: async () => ({ results: [] }) }; }, all: async () => ({ results: [] }) }; } };
const env = { DB, MOD_KEY: 'test-mod-key-1234567890', STAFF_KEY: 'staff-key-abcdefghijklmnopqrstuvwxyz012345', STAFF_NAMES: JSON.stringify({ 'mary.smith@example.org': 'Mary Smith', 'Pastor@Example.org': 'Christian Genao' }) };
const call = (path, opt = {}, as = 'mary.smith@example.org', key = env.STAFF_KEY) => {
  const headers = { 'Content-Type': 'application/json' };
  if (as) { headers['X-Staff-Email'] = as; headers['X-Staff-Key'] = key; }
  return W.fetch(new Request('https://c.example' + path, { headers, ...opt }), env);
};
const post = async (name, body) => (await call('/c', { method: 'POST', body: JSON.stringify({ page: 'hm', name, body }) })).status;
const blocked = ['see https://evil.example/x', 'go to http://a.b', 'www.evil.com', 'WWW . evil . com', 'bit.ly/abc', 'tinyurl.com/x', 'evil[.]com', 'evil dot com', 'evil(.)ru',
  'login-gnycyouth.org.verify.xyz', 'hxxps evil', 'javascript:alert(1)', 'mailto:me@x.org', 'visit 192.168.10.4 now', 'ftp://files.example', 'Dropbox: dropbox.com/s/abc', 'ｅｖｉｌ．ｃｏｍ',
  'Call me at 718-555-0142', 'text (917) 555 0199 now', '+1 212 555 0100', 'email pastor.genao@gmail.com', 'write to genao [at] gnyc dot org',
  'gnycyouth.org.evil.xyz/login', 'https://gnyc-youth.org', 'help@gnycyouth-support.com', 'evil.com/gnycyouth.org', 'gnycyouth.org@evil.com', 'youth@gnycyouth.org.verify.ru', 'https://gnycyouth.org@evil.com/x', 'https://evil.com/?r=gnycyouth.org', 'https://gnycyouth.org/go?to=evil.com', 'gnycyouth.org/x@evil.ru',
  'evil . com', 'evil\u200b.com', 'evil.\u200bcom', 'evil\u00ad.com', 'evil。com', 'evil.pro', 'evil.club', 'evil.do/x', 'rb.gy/x', 'evil.co/login',
  '\u0667\u0661\u0668\u0665\u0665\u0665\u0660\u0661\u0664\u0662', 'h t t p s : / / evil', 'data:text/html,x'];
for (const b of blocked) { assert.equal(await post('Mary Smith', b), 422, 'should block: ' + b); }
console.log('ok', blocked.length, 'link tricks refused');
const fine = ['The photo for PF-14-3.jpg is too dark.', 'Love the hero! Can we use the Jan. 29 flyer?', 'Mr. Smith asked about St. Paul club.', 'U.S. spelling please.',
  'Version 2.0 looks better than 1.5', 'Ages 10-15. Grades 5-10.', 'Use the PBE logo; see slot HM-03.', 'Is the time 7:30 or 8:00?', 'e.g. the Bronx', 'It is 3.14 times better', 'Camporee is 2026-10-17 to 2026-10-19', 'Room 101, 9:00 to 12:30', 'Ages 4-9, about 120 kids', 'Meet at the church @ 10',
  'end with: if you need more information email us at youth@gnycyouth.org.', 'Link to https://gnycyouth.org/shop/ for uniforms', 'see events.gnycyouth.com/event/13', 'GNYCYOUTH.ORG in caps',
  'File: PF-14-3.jpg', 'Updated data: 120 kids', 'flyer.ai is attached', 'camporee.mov', 'photos.zip', 'Looks good.It is fine', 'Done.So happy', 'Seasons 2023-2024-2025',
  '2026-10-17 2026-10-19', 'Reply @ Mary', 'Great job. Me and the team agree.', 'Plan B. Go with it.'];
for (const b of fine) { assert.equal(await post('Mary Smith', b), 201, 'should allow: ' + b); }
console.log('ok', fine.length, 'normal comments allowed');
// who may post, and under what name
assert.equal((await call('/c', { method: 'POST', body: JSON.stringify({ page: 'hm', body: 'hi' }) }, null)).status, 403); console.log('ok no staff key: refused');
assert.equal((await call('/c', { method: 'POST', body: JSON.stringify({ page: 'hm', body: 'hi' }) }, 'mary.smith@example.org', 'wrong-key-abcdefghijklmnopqrstuvwxyz012345')).status, 403); console.log('ok wrong staff key: refused');
assert.equal((await call('/c', { method: 'POST', body: JSON.stringify({ page: 'hm', body: 'hi' }) }, 'stranger@example.org')).status, 403); console.log('ok signed in but not in the directory: refused');
binds.length = 0;
const r1 = await (await call('/c', { method: 'POST', body: JSON.stringify({ page: 'hm', name: 'Darwin Garcia', body: 'Typed name is ignored.' }) }, 'PASTOR@example.org')).json();
assert.equal(r1.comment.name, 'Christian Genao'); assert.equal(binds.at(-1)[5], 'pastor@example.org'); console.log('ok name comes from the directory, typed name ignored, email stored lower case');
assert.deepEqual(await (await call('/c/me')).json(), { name: 'Mary Smith' }); console.log('ok /c/me gives the directory name');
assert.equal((await call('/c/me', {}, 'stranger@example.org')).status, 403); console.log('ok /c/me refuses an unlisted email');
// Google Drive and Docs links for signed-in staff; look-alikes still refused
for (const b of ['Photos: https://drive.google.com/drive/folders/1Udv4Di_tE94kylc2wXvVoRDRXx1rR5aV', 'Form https://docs.google.com/forms/d/e/1FAIpQLSdAbCdEfGh/viewform', 'https://docs.google.com/document/d/1aBcDeFgHiJkLmNoP/edit?usp=sharing', 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view'])
  assert.equal(await post('x', b), 201, 'should allow: ' + b);
console.log('ok Google Drive and Docs links allowed');
for (const b of ['https://drive.google.com.evil.ru/file/d/1AbCdEfGhIjKlMnOp', 'https://docs.google.com/url?q=https://evil.com', 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view.evil.com', 'https://sites.google.com/view/evil', 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp@evil.com'])
  assert.equal(await post('x', b), 422, 'should block: ' + b);
console.log('ok Drive look-alikes refused');
// emails never leave the service
sql.length = 0; await call('/c?page=hm', {}, null); await call('/c/all', {}, null);
for (const q of sql.filter(q => /^SELECT/.test(q))) { assert.ok(!/(^|[\s,])email(\s*,|\s+FROM)/i.test(q.replace(/\(email IS NOT NULL\) AS verified/, '')), 'query returns email: ' + q); }
console.log('ok reads return only a signed-in flag, never the email');
assert.equal((await W.fetch(new Request('https://c.example/c', { method: 'POST', headers: { 'X-Staff-Email': 'mary.smith@example.org', 'X-Staff-Key': 'short' }, body: '{"page":"hm","body":"hi"}' }), { ...env, STAFF_KEY: 'short' })).status, 403); console.log('ok a short staff key is never accepted');
assert.equal((await W.fetch(new Request('https://c.example/c', { method: 'POST', headers: { 'X-Staff-Email': 'mary.smith@example.org', 'X-Staff-Key': env.STAFF_KEY }, body: '{"page":"hm","body":"hi"}' }), { ...env, STAFF_NAMES: '{oops' })).status, 503); console.log('ok a broken directory says not configured');
console.log('all comment rule tests passed');
