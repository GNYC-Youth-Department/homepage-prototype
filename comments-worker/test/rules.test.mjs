/* Tests for the comment rules: no web addresses, reserved admin names. Fake D1, no network.
   Run: node comments-worker/test/rules.test.mjs */
import assert from 'node:assert/strict';
const W = (await import(new URL('../worker.js', import.meta.url))).default;
const DB = { prepare: () => ({ bind: () => ({ first: async col => col === 'n' ? 0 : { id: 1, page: 'hm', slot: null, parent: null, name: 'x', body: 'y', at: 'now' } }) }) };
const env = { DB, MOD_KEY: 'test-mod-key-1234567890' };
const post = async (name, body, mod) => {
  const headers = { 'Content-Type': 'application/json', Origin: 'https://gnyc.webtekton.com' };
  if (mod) headers['X-Mod-Key'] = env.MOD_KEY;
  const r = await W.fetch(new Request('https://c.example/c', { method: 'POST', headers, body: JSON.stringify({ page: 'hm', name, body }) }), env);
  return r.status;
};
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
const fakes = ['Darwin Garcia', 'darwin', 'D a r w i n  G a r c i a', 'Dárwin García', 'Dаrwin Garcia' /* Cyrillic a */, 'D4rwin', 'Admin', 'GNYC Youth', 'Site moderator', 'Darwin G.', 'Site Admin', 'Moderator', 'GNYC-Youth', 'DarwinGarcia'];
for (const n of fakes) { assert.equal(await post(n, 'Please review this.'), 422, 'should reserve: ' + n); }
console.log('ok', fakes.length, 'admin look-alike names refused');
assert.equal(await post('Darwin Garcia', 'Posted with the moderator key.', true), 201); console.log('ok moderator may post as Darwin Garcia');
assert.equal(await post('Darwin Garcia', 'www.evil.com', true), 422); console.log('ok moderator cannot post links either');
for (const n of ['Mary Smith', 'José Martínez', 'Christian Genao', 'Gabriel Garcia', 'Darwin Rodriguez', 'Head Ministries', 'Admina Lopez'.replace('Admina','Adina')]) assert.equal(await post(n, 'Looks good.'), 201, 'should allow name: ' + n);
console.log('ok real names allowed');
console.log('all comment rule tests passed');
