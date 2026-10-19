import { generateKeyPairSync, createSign, randomUUID } from 'node:crypto';
/* Tests for the staff Worker with a fake Drive, fake Access and keys generated per run: no real credentials.
   Run: node staff-worker/test/worker.test.mjs */
import assert from 'node:assert/strict';
const store = new Map();
const PHOTOS = { getWithMetadata: async k => store.get(k) || { value: null, metadata: null }, put: async (k, v, o) => { store.set(k, { value: v, metadata: o.metadata }); } };
const ga = generateKeyPairSync('rsa', { modulusLength: 2048 });
const ak = generateKeyPairSync('rsa', { modulusLength: 2048 });
const sa = { client_email: 'test@x.iam.gserviceaccount.com', private_key: ga.privateKey.export({ type: 'pkcs8', format: 'pem' }) };
const jwk = { ...ak.publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256' };
const b64u = b => Buffer.from(b).toString('base64url');
const TEAM = 'test.cloudflareaccess.com', AUD = 'aud123';
function accessJwt(claims) { const h = b64u(JSON.stringify({ alg: 'RS256', kid: 'k1' })), p = b64u(JSON.stringify(claims)); const s = createSign('RSA-SHA256').update(h + '.' + p).sign(ak.privateKey); return h + '.' + p + '.' + b64u(s); }
const now = Math.floor(Date.now() / 1000);
const good = accessJwt({ aud: [AUD], iss: 'https://' + TEAM, exp: now + 600, email: 'a@b.org' });
const files = { root: [ { id: 'f1', name: 'PF-14-3 camporee.jpg', mimeType: 'image/jpeg', modifiedTime: '2026-10-16T01:00:00Z' },
  { id: 'f2', name: 'pf-14-3 newer.JPG', mimeType: 'image/jpeg', modifiedTime: '2026-10-16T02:00:00Z' },
  { id: 'f3', name: 'notes.docx', mimeType: 'application/vnd.openxmlformats', modifiedTime: 'x' },
  { id: 'f4', name: 'HM-05-1.heic', mimeType: 'image/heic', modifiedTime: 'x' },
  { id: 'f5', name: 'HM-051.jpg', mimeType: 'image/jpeg', modifiedTime: 'x' },
  { id: 'sub', name: 'Adventurers', mimeType: 'application/vnd.google-apps.folder' } ],
  sub: [ { id: 'f6', name: 'AD-01_hero.png', mimeType: 'image/png', modifiedTime: '2026-10-15T00:00:00Z' } ] };
let calls = [];
globalThis.fetch = async (u, o = {}) => { u = String(u); calls.push(u);
  if (u === `https://${TEAM}/cdn-cgi/access/certs`) return Response.json({ keys: [jwk] });
  if (u === 'https://oauth2.googleapis.com/token') { const a = new URLSearchParams(o.body).get('assertion').split('.'); const c = JSON.parse(Buffer.from(a[1], 'base64url')); if (c.iss !== sa.client_email || !/drive.readonly/.test(c.scope)) return new Response('bad', { status: 400 });
    const { createVerify } = await import('node:crypto'); if (!createVerify('RSA-SHA256').update(a[0] + '.' + a[1]).verify(ga.publicKey, Buffer.from(a[2], 'base64url'))) return new Response('badsig', { status: 400 }); return Response.json({ access_token: 'tok' }); }
  if (u.startsWith('https://www.googleapis.com/drive/v3/files')) { if (o.headers?.Authorization !== 'Bearer tok') return new Response('noauth', { status: 401 });
    const url = new URL(u); if (url.pathname.endsWith('/files')) { const q = url.searchParams.get('q'); const id = /'([^']+)'/.exec(q)[1]; return Response.json({ files: files[id] || [] }); }
    if (url.searchParams.get('alt') === 'media') return new Response('ORIGINAL', { headers: { 'Content-Type': 'image/png' } });
    return Response.json({ thumbnailLink: url.pathname.endsWith('f2') ? 'https://lh3.googleusercontent.com/t/abc=s220' : undefined }); }
  if (u.startsWith('https://lh3.googleusercontent.com/t/abc=s2000')) return new Response('THUMB', { headers: { 'Content-Type': 'image/jpeg' } });
  if (u.startsWith('https://gnyc-youth-department.github.io/homepage-prototype/')) return new Response('PAGE ' + new URL(u).pathname, { headers: { 'Content-Type': 'text/html' } });
  return new Response('unexpected ' + u, { status: 599 }); };
const W = (await import(new URL('../worker.js', import.meta.url))).default;
const pending = []; const ctx = { waitUntil: p => pending.push(p) };
const env = { PHOTOS, FOLDER_ID: 'root', GOOGLE_SA: JSON.stringify(sa), ACCESS_TEAM: TEAM, ACCESS_AUD: AUD };
const go = async (path, hdr = {}, e = env) => { const r = await W.fetch(new Request('https://site-review.gnycyouth.org' + path, { headers: hdr }), e, ctx); return [r.status, r.headers.get('content-type'), await r.text()]; };
const A = { 'Cf-Access-Jwt-Assertion': good };
const eq = async (name, got, status, body) => { const [st, , b] = await got; assert.equal(st, status, name + ' status'); if (body !== undefined) assert.match(b, body, name + ' body'); console.log('ok', name); };
const noEnv = { FOLDER_ID: 'root', GOOGLE_SA: env.GOOGLE_SA };
await eq('photos fail closed until Access is configured', go('/photos/index', A, noEnv), 503);
await eq('pages served before Access is configured', go('/index.html', {}, { FOLDER_ID: 'root' }), 200, /^PAGE \/homepage-prototype\/index.html$/);
await eq('no sign-in: photos refused', go('/photos/index'), 401);
await eq('no sign-in: pages refused once configured', go('/index.html'), 401);
await eq('wrong audience refused', go('/photos/index', { 'Cf-Access-Jwt-Assertion': accessJwt({ aud: ['other'], iss: 'https://' + TEAM, exp: now + 600 }) }), 401);
await eq('wrong issuer refused', go('/photos/index', { 'Cf-Access-Jwt-Assertion': accessJwt({ aud: [AUD], iss: 'https://evil.cloudflareaccess.com', exp: now + 600 }) }), 401);
await eq('expired refused', go('/photos/index', { 'Cf-Access-Jwt-Assertion': accessJwt({ aud: [AUD], iss: 'https://' + TEAM, exp: now - 5 }) }), 401);
await eq('not yet valid refused', go('/photos/index', { 'Cf-Access-Jwt-Assertion': accessJwt({ aud: [AUD], iss: 'https://' + TEAM, exp: now + 600, nbf: now + 3600 }) }), 401);
await eq('no expiry refused', go('/photos/index', { 'Cf-Access-Jwt-Assertion': accessJwt({ aud: [AUD], iss: 'https://' + TEAM }) }), 401);
await eq('tampered signature refused', go('/photos/index', { 'Cf-Access-Jwt-Assertion': good.slice(0, -4) + 'AAAA' }), 401);
await eq('garbage signature refused without a crash', go('/photos/index', { 'Cf-Access-Jwt-Assertion': good.split('.').slice(0, 2).join('.') + '.%%%' }), 401);
await eq('alg none refused', go('/photos/index', { 'Cf-Access-Jwt-Assertion': b64u(JSON.stringify({ alg: 'none', kid: 'k1' })) + '.' + good.split('.')[1] + '.x' }), 401);
const [ist, , ib] = await go('/photos/index', A); assert.equal(ist, 200);
const ix = JSON.parse(ib);
assert.deepEqual(ix.photos, { 'PF-14-3': '2026-10-16T02:00:00Z', 'HM-05-1': 'x', 'AD-01': '2026-10-15T00:00:00Z' }, 'index: newest wins, sub-folders read, HEIC kept');
assert.deepEqual(ix.skipped.map(x => x.name).sort(), ['HM-051.jpg', 'notes.docx']); console.log('ok index');
await eq('thumbnail served at 2000px', go('/photos/PF-14-3?v=1', A), 200, /^THUMB$/);
await eq('original served when Drive has no thumbnail', go('/photos/ad-01', A), 200, /^ORIGINAL$/);
await eq('HEIC without a preview is not sent raw', go('/photos/HM-05-1', A), 502);
await eq('code with no file', go('/photos/HM-02', A), 404);
await eq('path traversal rejected', go('/photos/..%2Fsecret', A), 404);
await eq('pages proxied when signed in', go('/ministries/pathfinders.html?x=1', A), 200, /pathfinders/);
await Promise.all(pending); calls = [];
await eq('second request comes from KV', go('/photos/PF-14-3?v=1', A), 200, /^THUMB$/);
assert.equal(calls.filter(c => c.includes('lh3') || c.includes('alt=media')).length, 0, 'no Drive download on a KV hit'); console.log('ok kv cache');
// comments go to the comments service with the signed-in email, never one the browser sends
const seen = [];
const COMMENTS = { fetch: async r => { seen.push({ url: r.url, method: r.method, h: Object.fromEntries(r.headers), body: r.method === 'POST' ? await r.text() : null }); return Response.json({ ok: true }); } };
const cenv = { ...env, COMMENTS, STAFF_KEY: 'staff-key-abcdefghijklmnopqrstuvwxyz012345' };
const SAME = { Origin: 'https://site-review.gnycyouth.org', 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json' };
const goC = async (path, opt = {}, hdr = A) => { const r = await W.fetch(new Request('https://site-review.gnycyouth.org' + path, { ...opt, headers: { ...hdr, ...(opt.method ? SAME : {}), ...(opt.headers || {}) } }), cenv, ctx); return r.status; };
assert.equal(await goC('/c?page=hm', {}, {}), 401); assert.equal(seen.length, 0); console.log('ok comments need sign-in');
assert.equal(await goC('/c', { method: 'POST', body: '{"page":"hm","body":"hi"}', headers: { 'X-Staff-Email': 'christian@evil.example', 'X-Staff-Key': 'guess' } }), 200);
assert.equal(seen[0].h['x-staff-email'], 'a@b.org'); assert.equal(seen[0].h['x-staff-key'], 'staff-key-abcdefghijklmnopqrstuvwxyz012345'); assert.equal(seen[0].body, '{"page":"hm","body":"hi"}'); assert.equal(seen[0].url, 'https://comments.internal/c');
console.log('ok post carries the signed-in email; browser-sent identity headers are replaced');
assert.equal(await goC('/c/12', { method: 'DELETE', headers: { 'X-Mod-Key': 'mk' } }), 200); assert.equal(seen[1].method, 'DELETE'); assert.equal(seen[1].h['x-mod-key'], 'mk'); console.log('ok delete passes the moderator key');
assert.equal(await goC('/c', { method: 'POST', body: '{"page":"hm","body":"x"}', headers: { Origin: 'https://evil.example', 'Sec-Fetch-Site': 'cross-site' } }), 403); console.log('ok cross-site post refused');
assert.equal(await goC('/c', { method: 'POST', body: '{"page":"hm","body":"x"}', headers: { Origin: 'null' } }), 403); console.log('ok post without our origin refused');
assert.equal(await goC('/c', { method: 'POST', body: '{"page":"hm","body":"x"}', headers: { 'Content-Type': 'text/plain' } }), 415); console.log('ok form-style (text/plain) post refused');
assert.equal(await goC('/c/12', { method: 'DELETE', headers: { 'X-Mod-Key': 'mk', Origin: 'https://evil.example', 'Sec-Fetch-Site': 'cross-site' } }), 403); console.log('ok cross-site delete refused');
assert.equal(seen.length, 2, 'refused requests never reach the comments service');
assert.equal(await goC('/index.html', { method: 'POST', body: 'x' }), 405); console.log('ok only comments accept POST');
assert.equal(await (async () => { const r = await W.fetch(new Request('https://site-review.gnycyouth.org/c/me', { headers: A }), env, ctx); return r.status; })(), 503); console.log('ok comments fail closed without the binding');
console.log('all staff Worker tests passed');
