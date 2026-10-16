# Comments service (prototype feedback)

A Cloudflare Worker with a D1 table that holds the comments reviewers leave on the gnycyouth.org prototype pages. Every page carries the Comments drawer from `assets/comments.js`; each comment belongs to a page and, when the reviewer picks one, to a content slot on it, named by the code from the content brief (`HM-05`, `PF-12`). `comments.html` lists every comment from every page.

- **URL:** https://gnycyouth-comments.rdgt07.workers.dev
- **Account:** Darwin Garcia's personal Cloudflare account (rdgt07), free tier. Database `gnycyouth-comments`. A copy of the Congress 2027 comments service, kept separate so the two prototypes do not share a table or a deployment.
- **Who can post:** anyone who can open the page, name plus comment, no sign-in. Allowed origins are the GitHub Pages site (gnyc-youth-department.github.io) and localhost; thirty comments per hour per address; a honeypot field drops bots.
- **Replies:** `POST /c` takes an optional `parent` (a comment id on the same page); a reply takes its thread's slot.
- **Moderation:** the drawer's "Moderate" link takes the moderator key (secret `MOD_KEY`, the same key as the Congress 2027 service, kept in Darwin Garcia's macOS Keychain under `congress2027-comments-modkey`). With it, every comment shows Delete. Deletes are soft (`deleted_at`).

First deployment was made through the Cloudflare API from this repo (database created, `schema.sql` applied, `worker.js` uploaded with the D1 binding and the secret, workers.dev route enabled). To redeploy after editing `worker.js`: `npx wrangler deploy` from this folder, signed in to the rdgt07 account, which reads `wrangler.toml` (the database id is in it). The secret stays on the Worker; set it again only with `npx wrangler secret put MOD_KEY`.
