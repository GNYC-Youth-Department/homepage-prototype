/* Staff copy of the gnycyouth.org prototype: the same pages as GitHub Pages, with real photos from Google Drive.
   Cloudflare Worker behind Cloudflare Access (email one-time code). Pages are fetched from the public GitHub Pages
   copy, so every push shows up here too; only this copy fills photo slots, and only for a signed-in viewer.
   Photos live in a private Drive folder (var FOLDER_ID, sub-folders included) shared read-only with a Google service
   account (secret GOOGLE_SA, the account's JSON key). A file counts when its name starts with a slot code, e.g.
   "PF-14-3 camporee.jpg"; the newest file wins when two share a code. Drafts, PDFs and anything else are never served.
   Routes:  GET /photos/index        -> { photos: { CODE: version }, skipped: [{ name, reason }] }
            GET /photos/<CODE>?v=..  -> the image (Drive thumbnail at 2000px when available, else the original)
            /c, /c/...               -> the comments service (binding COMMENTS), with the signed-in email (secret STAFF_KEY)
            anything else            -> the page from GitHub Pages
   Cache: Workers KV (binding PHOTOS), keyed by code, Drive file id and modified time; the Cache API does not run on
   workers.dev or behind Access. Entries expire after 30 days.
   Access: vars ACCESS_TEAM (e.g. gnycstaff.cloudflareaccess.com) and ACCESS_AUD (the Access application's audience tag).
   Until both are set, /photos/* answers 503 and nothing from Drive leaves the Worker (fail closed).
*/
const ORIGIN = "https://gnyc-youth-department.github.io/homepage-prototype";
const CODE = /^[A-Z]{2,3}-\d\d(?:-\d{1,2})?$/;
const LEAD = /^([A-Za-z]{2,3}-\d\d(?:-\d{1,2})?)(?=[\s._()-]|$)/;
const SHOWN = /^image\/(jpeg|png|webp|gif|avif|heic|heif)$/;   /* HEIC (iPhone) is shown through the JPEG preview Drive makes */
const BROWSER = /^image\/(jpeg|png|webp|gif|avif)$/;
const MAX_FOLDERS = 60;

const text = (s, status) => new Response(s, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" } });
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0));

/* ---------- Cloudflare Access: verify the signed assertion on every request ---------- */
let certs = { at: 0, keys: [] };
async function signedIn(req, env) {
  try { return await verifyAccess(req, env); } catch (e) { return false; }
}
async function verifyAccess(req, env) {
  if (!env.ACCESS_TEAM || !env.ACCESS_AUD) return false;
  const tok = req.headers.get("Cf-Access-Jwt-Assertion");
  if (!tok) return false;
  const [h, p, s] = tok.split(".");
  if (!s) return false;
  let head, claims;
  try { head = JSON.parse(new TextDecoder().decode(unb64u(h))); claims = JSON.parse(new TextDecoder().decode(unb64u(p))); } catch { return false; }
  if (head.alg !== "RS256") return false;
  if (Date.now() - certs.at > 3600e3 || (!certs.keys.some(k => k.kid === head.kid) && Date.now() - certs.at > 60e3)) {   /* an unknown kid refetches at most once a minute */
    const r = await fetch(`https://${env.ACCESS_TEAM}/cdn-cgi/access/certs`);
    if (!r.ok) return false;
    certs = { at: Date.now(), keys: (await r.json()).keys || [] };
  }
  const jwk = certs.keys.find(k => k.kid === head.kid);
  if (!jwk) return false;
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, unb64u(s), new TextEncoder().encode(h + "." + p));
  const aud = [].concat(claims.aud || []);
  const t = Date.now() / 1000;
  return ok && aud.includes(env.ACCESS_AUD) && claims.iss === `https://${env.ACCESS_TEAM}` && claims.exp > t && !(claims.nbf > t + 60) ? claims : false;
}

/* ---------- Google Drive through the service account ---------- */
let token = { at: 0, value: "" };
async function driveToken(env) {
  if (token.value && Date.now() - token.at < 50 * 60e3) return token.value;
  const sa = JSON.parse(env.GOOGLE_SA);
  const now = Math.floor(Date.now() / 1000);
  const enc = o => b64u(new TextEncoder().encode(JSON.stringify(o)));
  const unsigned = enc({ alg: "RS256", typ: "JWT" }) + "." + enc({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/drive.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 });
  const der = Uint8Array.from(atob(sa.private_key.replace(/-----[^-]+-----|\s/g, "")), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + unsigned + "." + b64u(sig) });
  if (!r.ok) throw new Error("google token " + r.status);
  token = { at: Date.now(), value: (await r.json()).access_token };
  return token.value;
}
const drive = async (env, path, params) => {
  const u = new URL("https://www.googleapis.com/drive/v3/" + path);
  for (const [k, v] of Object.entries(params || {})) u.searchParams.set(k, v);
  return fetch(u, { headers: { Authorization: "Bearer " + await driveToken(env) } });
};

let index = { at: 0, files: null, skipped: [] };
async function photoIndex(env) {
  if (index.files && Date.now() - index.at < 60e3) return index;
  const files = {}, skipped = [], queue = [env.FOLDER_ID], seen = new Set();
  while (queue.length) {
    if (seen.size >= MAX_FOLDERS) { skipped.push({ name: queue.length + " more folders", reason: "only the first " + MAX_FOLDERS + " folders are read; move files up a level" }); break; }
    const folder = queue.shift(); if (seen.has(folder)) continue; seen.add(folder);
    let pageToken = "";
    do {
      const r = await drive(env, "files", { q: `'${folder}' in parents and trashed = false`, fields: "nextPageToken, files(id, name, mimeType, modifiedTime)",
        pageSize: "1000", supportsAllDrives: "true", includeItemsFromAllDrives: "true", ...(pageToken ? { pageToken } : {}) });
      if (!r.ok) throw new Error("drive list " + r.status);
      const j = await r.json();
      for (const f of j.files || []) {
        if (f.mimeType === "application/vnd.google-apps.folder") { queue.push(f.id); continue; }
        const m = LEAD.exec(f.name);
        if (!m) { skipped.push({ name: f.name, reason: "name does not start with a slot code" }); continue; }
        if (!SHOWN.test(f.mimeType)) { skipped.push({ name: f.name, reason: "not a JPG, PNG, WebP, GIF, AVIF or HEIC image (" + f.mimeType + ")" }); continue; }
        const code = m[1].toUpperCase();
        if (!files[code] || files[code].modifiedTime < f.modifiedTime) files[code] = f;
      }
      pageToken = j.nextPageToken || "";
    } while (pageToken);
  }
  index = { at: Date.now(), files, skipped };
  return index;
}

async function photo(env, code, ctx) {
  const f = (await photoIndex(env)).files[code];
  if (!f) return text("no photo for " + code, 404);
  const kvKey = `${code}/${f.id}/${f.modifiedTime}`;
  if (!env.PHOTOS) console.error("KV binding PHOTOS is missing: every photo is read from Drive");
  const hit = env.PHOTOS && await env.PHOTOS.getWithMetadata(kvKey, "arrayBuffer");
  if (hit && hit.value) return new Response(hit.value, { headers: { "Content-Type": hit.metadata.type, "Cache-Control": "private, max-age=86400", "X-Content-Type-Options": "nosniff" } });
  let r;
  const meta = await drive(env, "files/" + f.id, { fields: "thumbnailLink", supportsAllDrives: "true" });
  const thumb = meta.ok ? (await meta.json()).thumbnailLink : "";
  if (thumb) {
    r = await fetch(thumb.replace(/=s\d+$/, "") + "=s2000", { headers: { Authorization: "Bearer " + await driveToken(env) } });
    if (!r.ok || !/^image\//.test(r.headers.get("Content-Type") || "")) r = null;
  }
  if (!r && !BROWSER.test(f.mimeType)) return text("Drive has no preview of this HEIC photo yet; try again in a minute or save it as JPG", 502);
  if (!r) r = await drive(env, "files/" + f.id, { alt: "media", supportsAllDrives: "true" });
  if (!r.ok) return text("photo unavailable", 502);
  const type = r.headers.get("Content-Type") || f.mimeType, bytes = await r.arrayBuffer();
  if (env.PHOTOS && bytes.byteLength < 25e6) ctx.waitUntil(env.PHOTOS.put(kvKey, bytes, { expirationTtl: 30 * 86400, metadata: { type } }).catch(e => console.error("kv put", e.message)));
  return new Response(bytes, { headers: { "Content-Type": type, "Cache-Control": "private, max-age=86400", "X-Content-Type-Options": "nosniff" } });
}

/* Comments go to the comments service over the service binding, carrying who signed in. Headers are built fresh, so
   nothing a browser sends can claim to be someone else. */
async function comments(req, env, url, who) {
  if (!env.COMMENTS || !env.STAFF_KEY) return text("comments are not configured yet", 503);
  if (!who || !who.email) return text("sign in required", 401);
  if (req.method === "POST" || req.method === "DELETE") {
    /* Writes only from this site's own pages: another site cannot make a signed-in browser post in someone's name. */
    if (req.headers.get("Origin") !== url.origin || (req.headers.get("Sec-Fetch-Site") || "same-origin") !== "same-origin") return text("cross-site request refused", 403);
    if (req.method === "POST" && !/^application\/json\b/i.test(req.headers.get("Content-Type") || "")) return text("send JSON", 415);
  }
  const headers = { "Content-Type": "application/json", "X-Staff-Key": env.STAFF_KEY, "X-Staff-Email": String(who.email) };
  const mk = req.headers.get("X-Mod-Key"); if (mk) headers["X-Mod-Key"] = mk;
  const init = { method: req.method, headers };
  if (req.method === "POST") { init.body = await req.text(); if (init.body.length > 8000) return text("too long", 413); }
  try { return await env.COMMENTS.fetch(new Request("https://comments.internal" + url.pathname + url.search, init)); }
  catch (e) { console.error("comments", e.message); return text("comments could not be reached", 502); }
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const isComments = url.pathname === "/c" || url.pathname.startsWith("/c/");
    if (req.method !== "GET" && req.method !== "HEAD" && !(isComments && (req.method === "POST" || req.method === "DELETE"))) return text("method not allowed", 405);
    const configured = env.ACCESS_TEAM && env.ACCESS_AUD;
    if (url.pathname.startsWith("/photos/")) {
      if (!configured || !env.GOOGLE_SA || !env.FOLDER_ID) return text("photos are not configured yet", 503);
      if (!(await signedIn(req, env))) return text("sign in required", 401);
      try {
        if (url.pathname === "/photos/index") {
          const ix = await photoIndex(env);
          return json({ photos: Object.fromEntries(Object.entries(ix.files).map(([c, f]) => [c, f.modifiedTime])), skipped: ix.skipped });
        }
        const code = decodeURIComponent(url.pathname.slice(8)).toUpperCase();
        if (!CODE.test(code)) return text("not a slot code", 404);
        return await photo(env, code, ctx);
      } catch (e) { console.error("photos", e.message); return text("drive error", 502); }
    }
    const who = configured && await signedIn(req, env);
    if (configured && !who) return text("sign in required", 401);
    if (url.pathname === "/c" || url.pathname.startsWith("/c/")) return comments(req, env, url, who);
    let r;
    try { r = await fetch(ORIGIN + url.pathname + url.search, { cf: { cacheTtl: 60 } }); } catch (e) { return text("the public pages could not be reached; try again", 502); }
    const out = new Response(r.body, r);
    out.headers.set("Cache-Control", "private, max-age=60");
    out.headers.set("X-Robots-Tag", "noindex, nofollow");
    return out;
  }
};
