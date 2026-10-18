# Comments service (prototype feedback)

A Cloudflare Worker with a D1 table that holds the comments reviewers leave on the gnycyouth.org prototype pages. Every page carries the Comments drawer from `assets/comments.js`; each comment belongs to a page and, when the reviewer picks one, to a content slot on it, named by the code from the content brief (`HM-05`, `PF-12`). `comments.html` lists every comment from every page.

- **URL:** https://gnycyouth-comments.rdgt07.workers.dev
- **Account:** Darwin Garcia's personal Cloudflare account (rdgt07), free tier. Database `gnycyouth-comments`. A copy of the Congress 2027 comments service, kept separate so the two prototypes do not share a table or a deployment.
- **Who can read:** anyone who can open a page; the public GitHub Pages copy shows comments read-only.
- **Who can post:** only people signed in on the staff copy (https://gnyc.webtekton.com, Cloudflare Access email code). The staff Worker forwards each post over a service binding with the signed-in email and the shared secret `STAFF_KEY`; nothing a browser sends can set the email. The name shown comes from the staff directory, secret `STAFF_NAMES` (JSON, email to full name), so nobody types a name and nobody can post as someone else. A signed-in email missing from the directory may read but not post. Emails are stored (column `email`) for tracing and the per-person limit of thirty an hour, and never returned: reads carry only `verified`. Comments posted before October 17, 2026 have typed names and no `verified` mark.
- **What a comment may contain:** no web addresses, email addresses or phone numbers, including disguised forms; allowed are the conference's own gnycyouth.org and Google Drive or Docs file, folder and document links, which the drawer makes clickable. Tests: `node comments-worker/test/rules.test.mjs`.
- **Adding a person:** add the email to the Access policy "GNYC staff photo reviewers" and to `STAFF_NAMES` (a Worker secret; never put the emails in this public repo).
- **Replies:** `POST /c` takes an optional `parent` (a comment id on the same page); a reply takes its thread's slot.
- **Moderation:** the drawer's "Moderate" link takes the moderator key (secret `MOD_KEY`, the same key as the Congress 2027 service, kept in Darwin Garcia's macOS Keychain under `congress2027-comments-modkey`). With it, every comment shows Delete. Deletes are soft (`deleted_at`).

**Database changes.** `schema.sql` is for a new, empty database only. The live database changes only through the numbered migration files, applied once each through the D1 query API, in order: `migration-0002-email.sql` (October 17, 2026) adds `email` and its index. Apply a migration before deploying the Worker that needs it; the older Worker ignores new columns, so that order is always safe. To undo 0002: `DROP INDEX IF EXISTS comments_email;` then `ALTER TABLE comments DROP COLUMN email;` (D1 Time Travel can also restore any point in the last 30 days).

**Deploying.** The Worker is deployed by hand through the Cloudflare API (no wrangler on this machine), byte for byte from the committed `worker.js` with a SHA-256 check. Its secrets stay on the Worker: `MOD_KEY`, `STAFF_KEY` (also on gnycyouth-staff), `STAFF_NAMES`.

Rollback: keep this Worker and remove the staff Worker's `COMMENTS` binding (posting stops; reading continues). Redeploying the older `worker.js` alone is not enough: it checks the Origin, which service-binding calls do not carry, so staff posting would break while the older pages, if live, would allow anonymous posts again. Roll back the pages and both Workers together, or not at all. The `email` column can stay either way.

**Deploy uploads keep bindings.** A script upload through the API replaces the Worker's bindings unless the metadata lists them or sets `keep_bindings`; check the bindings list after every upload.
