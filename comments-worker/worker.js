/* Comments service for the gnycyouth.org prototype pages (GNYC-Youth-Department/homepage-prototype).
   Cloudflare Worker + D1. No sign-in for reviewers; a moderator key (secret MOD_KEY) allows deletes.
   Every comment belongs to a page and, optionally, to one content slot on it (a code such as HM-05 from the content brief).
   Routes:  GET /c?page=<key>                     -> { comments: [...] } newest first, for one page
            GET /c/all                            -> { comments: [...] } newest first, every page (at most 2000)
            POST /c {page,name,body,slot?,parent?} -> { comment }   slot: the code the comment is about; parent: the comment it replies to
            DELETE /c/<id>                        -> { ok }        header X-Mod-Key
            GET /c/check                          -> { ok }        header X-Mod-Key (validates the key)
*/
const ORIGINS = [/^https:\/\/gnyc-youth-department\.github\.io$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];
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
