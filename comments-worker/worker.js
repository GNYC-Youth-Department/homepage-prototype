/* Comments service for the gnycyouth.org prototype pages (GNYC-Youth-Department/homepage-prototype).
   Cloudflare Worker + D1. No sign-in for reviewers; a moderator key (secret MOD_KEY) allows deletes.
   Every comment belongs to a page and, optionally, to one content slot on it (a code such as HM-05 from the content brief).
   Routes:  GET /c?page=<key>                     -> { comments: [...] } newest first, for one page
            GET /c/all                            -> { comments: [...] } newest first, every page (at most 2000)
            POST /c {page,name,body,slot?,parent?} -> { comment }   slot: the code the comment is about; parent: the comment it replies to
            DELETE /c/<id>                        -> { ok }        header X-Mod-Key
            GET /c/check                          -> { ok }        header X-Mod-Key (validates the key)
*/
const ORIGINS = [/^https:\/\/gnyc-youth-department\.github\.io$/, /^https:\/\/gnyc\.webtekton\.com$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];
const PAGE = /^[a-z0-9-]{1,40}$/;
const SLOT = /^[A-Z]{2,3}-\d\d(?:-\d{1,2})?$/;
const LIMIT_PER_HOUR = 30;
const COLS = "id, page, slot, parent_id AS parent, name, body, created_at AS at";

const allowed = req => ORIGINS.some(r => r.test(req.headers.get("Origin") || ""));
function cors(req) {
  return {
    "Access-Control-Allow-Origin": allowed(req) ? req.headers.get("Origin") : "https://gnyc-youth-department.github.io",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Mod-Key",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Cache-Control": "no-store",
  };
}
const json = (req, data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...cors(req) } });

async function ipHash(req) {
  const ip = req.headers.get("CF-Connecting-IP") || "";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("gnycyouth|" + ip));
  return [...new Uint8Array(buf)].slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join("");
}
const clean = (s, max) => String(s ?? "").replace(/\r\n?/g, "\n").replace(/[^\S\n]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
/* No links in comments, from anyone: a web address, email or phone number in a comment is how a fake message lures a
   reader. Rendering never makes links clickable; this keeps them out altogether. File names such as PF-14-3.jpg pass. */
const TLD = "com|org|net|edu|gov|mil|int|io|info|biz|ly|gl|gd|gy|xyz|app|dev|site|online|link|click|top|ru|cn|tk|ml|ga|cf|gq|live|shop|store|page|tv|ws|cc|ca|uk|de|fr|es|nl|br|au|ng|jp|kr|sh|gg|lol|icu|cyou|buzz|rest|work|win|bid|cam|pro|club|vip|fun|art|blog|news|cloud|tech|space|website|email|network|support|help|login|today|world|life|best|mobi|name|plus|pw|su|ua|vn|ph|mx|pr|ar|cl|pe|ve|hn|gt|sv|cr|pa|ec|py|uy|nz|za|ke|gh|tz|ug|eu|asia|ms|tw|hk|sg|my|id|ir|tr|pl|ru|ro|cz|ch|se|no|fi|dk|pt|il|sa|ae|eg|pk|bd|lk|np|cx|nu|tc|vg|ai|mov|zip|co|me|to|it|so|in|us|do|is|am|be|at|go|on|or|my|by|me|tv";
const WORDY = /^(?:ai|mov|zip|co|me|to|it|so|in|us|do|is|am|be|at|go|on|or|my|by|no|id|pe|pa|ms|sh|win|work|best|life|news|art|fun|help|page|name|plus|live|top|link|click|email|today|world|support|network|space|cam|rest)$/i;   /* also English words or file types: count only with a path, e.g. "evil.co/x" */
const DOT = String.raw`(?:\s*\.\s*|\[\.\]|\(\.\)|\[dot\]|\(dot\)|\s+dot\s+)`;
const DOMAIN = new RegExp(String.raw`[a-z0-9-]` + DOT + "(" + TLD + String.raw`)\b(\/)?`, "gi");
const SCHEME = /:\s*\/\s*\/|\bh\s*[tx]\s*[tx]\s*p\s*s?\s*:|\bhxxps?\b|\b(?:javascript|vbscript)\s*:|\bdata:[a-z]+\/|\bfile:\/|\bmailto:|\bwww\s*(?:\.|\[\.\]|\s+dot\s+)|\b\d{1,3}(?:\.\d{1,3}){3}\b/i;
const PHONE = /(?:^|[^\d])(?:\+?1[\s.\-]?)?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}(?!\d)/;   /* US shape 3-3-4; dates such as 2026-10-17 pass */
const EMAIL = /\S@\S|\[at\]|\(at\)/i;   /* "name@host", also written "name [at] host"; a lone "@ 10" passes */
const OWN = /(?:https?:\/\/)?(?:[a-z0-9._%+-]{1,64}@)?(?:[a-z0-9-]{1,63}\.){0,4}gnycyouth\.(?:org|com)\b(?![.-][a-z0-9])/gi;   /* the conference's own address only; what follows it is still checked */
const prep = s => s.normalize("NFKC").replace(/[\p{Cf}]/gu, "").replace(/[\u3002\uff61\uff0e]/g, ".").replace(/\p{Nd}/gu, d => /\d/.test(d) ? d : String((d.codePointAt(0) - 0x30) % 16 % 10));
const hasLink = s => {
  let t = prep(s);
  if (/gnycyouth/i.test(t)) t = t.replace(OWN, " ");
  if (SCHEME.test(t) || PHONE.test(t) || EMAIL.test(t)) return true;
  for (const m of t.matchAll(DOMAIN)) {
    const spaced = /\s/.test(m[0]);
    if (WORDY.test(m[1]) && !m[2]) continue;                 /* "Done.So happy", "flyer.ai" */
    if (spaced && !/dot|\[|\(/i.test(m[0]) && !/\s\.\s/.test(m[0])) continue;   /* "end. Com…" is a sentence; "evil . com" is not */
    return true;
  }
  return false;
};
/* Names only the moderator may post under, so nobody can pose as the site admin. Each word is folded first, so
   "Dárwin", a Cyrillic look-alike or "D a r w i n" still count; "Darwin Rodriguez" or "Head Ministries" do not. */
const LOOKALIKE = { "\u0430": "a", "\u0435": "e", "\u043e": "o", "\u0440": "p", "\u0441": "c", "\u0456": "i", "\u04cf": "l", "\u0501": "d", "\u0261": "g", "\u0455": "s", "\u0445": "x", "\u0443": "y", "\u0578": "n", "\u0251": "a", "\u0131": "i", "0": "o", "1": "i", "3": "e", "4": "a", "@": "a", "$": "s" };
const foldWord = w => w.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/./gu, c => LOOKALIKE[c] || c).replace(/[^a-z]/g, "");
const words = name => {
  const out = []; let run = "";
  for (const w of prep(name).split(/[\s._\-,;:'"·|/\\]+/).map(foldWord).filter(Boolean)) {
    if (w.length === 1) { run += w; continue; }               /* "D a r w i n" joins back into one word */
    if (run) { out.push(run); run = ""; } out.push(w);
  }
  if (run) out.push(run);
  return out;
};
const RESERVED = new Set(["admin", "administrator", "siteadmin", "moderator", "webmaster", "gnycyouth", "darwingarcia"]);
const reserved = name => {
  const w = words(name);
  if (w.length === 1 && w[0] === "darwin") return true;
  return w.some((x, i) => RESERVED.has(x) || RESERVED.has(x + (w[i + 1] || "")) || (x === "darwin" && /^g/.test(w[i + 1] || "")));
};
const isMod = (req, env) => {
  const k = req.headers.get("X-Mod-Key") || "";
  return !!env.MOD_KEY && k.length === env.MOD_KEY.length && k === env.MOD_KEY;
};

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, "");

    if (req.method === "GET" && path === "/c/check") return json(req, { ok: isMod(req, env) }, isMod(req, env) ? 200 : 401);

    if (req.method === "GET" && path === "/c/all") {
      const { results } = await env.DB.prepare(
        "SELECT " + COLS + " FROM comments WHERE deleted_at IS NULL ORDER BY id DESC LIMIT 2000").all();
      return json(req, { comments: results });
    }

    if (req.method === "GET" && path === "/c") {
      const page = url.searchParams.get("page") || "";
      if (!PAGE.test(page)) return json(req, { error: "bad page" }, 400);
      const { results } = await env.DB.prepare(
        "SELECT " + COLS + " FROM comments WHERE page = ?1 AND deleted_at IS NULL ORDER BY id DESC LIMIT 400").bind(page).all();
      return json(req, { comments: results });
    }

    if (req.method === "POST" && path === "/c") {
      if (!allowed(req)) return json(req, { error: "origin not allowed" }, 403);
      let b; try { b = await req.json(); } catch { return json(req, { error: "bad json" }, 400); }
      if (b.hp) return json(req, { error: "rejected" }, 400); // honeypot field, filled only by bots
      const page = String(b.page || ""), name = clean(b.name, 60), body = clean(b.body, 2000);
      if (!PAGE.test(page)) return json(req, { error: "bad page" }, 400);
      if (!name) return json(req, { error: "Add your name so the team knows who said it." }, 422);
      if (!body) return json(req, { error: "Write the comment first." }, 422);
      if (hasLink(body) || hasLink(name)) return json(req, { error: "Comments cannot include web addresses, email addresses or phone numbers, except the conference's own gnycyouth.org. Name the page or the section code (such as PF-14) instead." }, 422);
      if (reserved(name) && !isMod(req, env)) return json(req, { error: "That name is reserved for the site admin. Please use your own name." }, 422);
      let slot = String(b.slot || "").toUpperCase();
      if (slot && !SLOT.test(slot)) return json(req, { error: "That section code is not one of ours." }, 422);
      slot = slot || null;
      // a reply hangs under a comment on the same page and takes its slot; a reply to a reply joins the same thread
      let parent = null;
      if (b.parent != null && b.parent !== "") {
        const pr = await env.DB.prepare("SELECT id, page, slot, parent_id FROM comments WHERE id = ?1 AND deleted_at IS NULL").bind(Number(b.parent) || 0).first();
        if (!pr || pr.page !== page) return json(req, { error: "That comment is no longer there." }, 422);
        parent = pr.parent_id || pr.id;
        slot = pr.slot;
      }
      const ip = await ipHash(req);
      const recent = await env.DB.prepare(
        "SELECT COUNT(*) AS n FROM comments WHERE ip_hash = ?1 AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 hour')").bind(ip).first("n");
      if (recent >= LIMIT_PER_HOUR) return json(req, { error: "That is a lot of comments in one hour. Try again a little later." }, 429);
      const row = await env.DB.prepare(
        "INSERT INTO comments (page, slot, parent_id, name, body, ip_hash) VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING " + COLS
      ).bind(page, slot, parent, name, body, ip).first();
      return json(req, { comment: row }, 201);
    }

    const m = path.match(/^\/c\/(\d+)$/);
    if (req.method === "DELETE" && m) {
      if (!isMod(req, env)) return json(req, { error: "moderator key not accepted" }, 401);
      await env.DB.prepare("UPDATE comments SET deleted_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?1").bind(Number(m[1])).run();
      return json(req, { ok: true });
    }

    return json(req, { error: "not found" }, 404);
  },
};
