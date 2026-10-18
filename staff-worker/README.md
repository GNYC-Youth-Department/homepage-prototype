# Staff copy with real photos (`gnycyouth-staff`)

The public prototype on GitHub Pages never shows a real photo. This Worker serves the same pages to signed-in staff and fills each photo slot from a private Google Drive folder.

```
Uploader ──saves "PF-14-3 camporee.jpg"──▶ Drive folder "GNYC Website Content" (private)
                                                │ read-only: service account gnycyouth-photos
Staff viewer ──email code (Cloudflare Access)──▶ gnyc.webtekton.com (Worker gnycyouth-staff) ──▶ pages from GitHub Pages
                                                └──▶ /photos/index, /photos/<code> (only files named by a slot code)
```

**Naming rule for uploaders:** start the file name with the slot code from the content brief, then anything: `PF-14-3 camporee.jpg`, `AB-07-1_abigail.png`. Sub-folders are fine. JPG, PNG, WebP, GIF, AVIF and iPhone HEIC are shown; the newest file wins when two share a code. Anything else stays in Drive and is listed as skipped in `/photos/index`.

**What protects the photos**
- The folder is never link-shared; only uploaders and the service account have access.
- Cloudflare Access sits in front of the Worker (email one-time code, approved list). The Worker also checks Access's signed assertion on every request (`ACCESS_TEAM`, `ACCESS_AUD`); until both are set, `/photos/*` answers 503.
- `assets/photos.js` runs only on the staff host; the GitHub Pages copy never asks for photos.

**Setup state and steps**
1. Service account `gnycyouth-photos` in Google Cloud project `youthcongress`, Drive API enabled, folder shared with it as Viewer.
2. Secret: `npx wrangler secret put GOOGLE_SA` (paste the JSON key), from this folder, signed in to the rdgt07 account. The key file is deleted after; it is never committed.
3. Address: custom domain `gnyc.webtekton.com` (zone webtekton.com, same Cloudflare account); the workers.dev address is turned off so there is one door. Moving to `staff.gnycyouth.org` later means the Worker must live in the account that holds gnycyouth.org; add the new host to `assets/photos.js` (STAFF) and the comments allow-list.
4. Cloudflare Zero Trust team `gnycyouth.cloudflareaccess.com`; Access application "GNYC staff prototype (real photos)" on the address above, email one-time code, policy "GNYC staff photo reviewers" holds the staff emails (add people there). Worker vars `ACCESS_TEAM` = the team domain and `ACCESS_AUD` = the application's audience tag are set on the Worker.

Redeploy after editing `worker.js`: `npx wrangler deploy` from this folder. 

**Tests:** `node staff-worker/test/worker.test.mjs` (fake Drive, fake Access, keys generated per run; no credentials). Run before every deploy.

**Rollback:** revert the commit that added this folder; then delete the `gnycyouth-staff` Worker in the Cloudflare dashboard (or remove the `GOOGLE_SA` secret, which turns every photo request into a 503). The KV namespace `gnycyouth-staff-photos` holds only cached copies and can be deleted with it.

**Known limits:** the index is cached per Worker instance for a minute, so a new upload shows within about a minute. Signed-in viewers can see the names of skipped files in `/photos/index` so uploaders can fix them; keep the staff list narrow, and keep photo releases for minors on file before anything is uploaded.
