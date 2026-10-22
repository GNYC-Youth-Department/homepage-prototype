# Staff copy with real photos (`gnycyouth-staff`)

The public prototype on GitHub Pages never shows a real photo. This Worker serves the same pages to signed-in staff and fills each photo slot from a private Google Drive folder.

```
Uploader ──saves "PF-14-3 camporee.jpg"──▶ Drive folder "GNYC Website Content" (private)
                                                │ read-only: service account gnycyouth-photos
Staff viewer ──email code (Cloudflare Access)──▶ site-review.gnycyouth.org (Worker gnycyouth-staff) ──▶ pages from GitHub Pages
                                                └──▶ /photos/index, /photos/<code> (only files named by a slot code)
```

**Naming rule for uploaders:** start the file name with the slot code from the content brief, then anything: `PF-14-3 camporee.jpg`, `AB-07-1_abigail.png`. Sub-folders are fine. JPG, PNG, WebP, GIF, AVIF and iPhone HEIC are shown; the newest file wins when two share a code. Anything else stays in Drive and is listed as skipped in `/photos/index`.

**What protects the photos**
- The folder is never link-shared; only uploaders and the service account have access.
- Cloudflare Access sits in front of the Worker (email one-time code, approved list). The Worker also checks Access's signed assertion on every request (`ACCESS_TEAM`, `ACCESS_AUD`); until both are set, `/photos/*` answers 503.
- `assets/photos.js` runs only on the staff host; the GitHub Pages copy never asks for photos.

**Setup state and steps**
1. Service account `gnycyouth-photos` in Google Cloud project `youthcongress`, Drive API enabled, folder shared with it as Viewer.
2. Secret `GOOGLE_SA` (the JSON key) on the Worker, set through the Cloudflare API or the dashboard (Workers & Pages → gnycyouth-staff → Settings → Variables and Secrets). The key file is deleted after; it is never committed.
3. Account and address: the Greater New York Conference Cloudflare account, which holds gnycyouth.org; custom domain `site-review.gnycyouth.org`, no workers.dev address, so there is one door. Other prototypes follow the same pattern (`congress-review.gnycyouth.org`). Until October 2026 the copy ran at `gnyc.webtekton.com` on Darwin Garcia's personal account; it keeps showing photos (`assets/photos.js`) but no comments. The move was confirmed on October 22, 2026; the old address stays up only until Darwin Garcia turns it off in the personal account (Workers & Pages → gnycyouth-staff → Settings → Domains & Routes), after which it comes out of `assets/photos.js` and `assets/comments.js`.
4. Cloudflare Zero Trust team `gnycstaff.cloudflareaccess.com` (Free plan); Access application "GNYC site review" on the address above, email one-time code, 24-hour session; reusable policy "GNYC staff site reviewers" holds the staff emails (add people there). Worker vars `ACCESS_TEAM` = the team domain and `ACCESS_AUD` = the application's audience tag are set on the Worker.

Redeploy after editing `worker.js`: push, then upload the file served by GitHub Pages through the Cloudflare API with a SHA-256 check against the commit (no wrangler on this machine); the upload keeps the bindings (`keep_bindings`), and the bindings list is checked after. Bindings: `PHOTOS` (KV `gnycyouth-photos`), `COMMENTS` (service `gnycyouth-comments`), vars from `wrangler.toml`, secrets `GOOGLE_SA` and `STAFF_KEY`.

**Tests:** `node staff-worker/test/worker.test.mjs` (fake Drive, fake Access, keys generated per run; no credentials). Run before every deploy.

**Rollback:** revert the commit that added this folder; then delete the `gnycyouth-staff` Worker in the Cloudflare dashboard (or remove the `GOOGLE_SA` secret, which turns every photo request into a 503). The KV namespace `gnycyouth-photos` holds only cached copies and can be deleted with it.

**Known limits:** the index is cached per Worker instance for a minute, so a new upload shows within about a minute. Signed-in viewers can see the names of skipped files in `/photos/index` so uploaders can fix them; keep the staff list narrow, and keep photo releases for minors on file before anything is uploaded.
