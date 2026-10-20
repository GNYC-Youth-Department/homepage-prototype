# GNYC Youth homepage prototype

`TIER: 1 | OVERLAYS: none`

Design prototype of the proposed gnycyouth.org homepage revamp, published so reviewers can open it in a browser:

**https://gnyc-youth-department.github.io/homepage-prototype/**

- **Purpose:** collect feedback on the visual direction. It is for review only and is not the live site.
- **Owner:** Darwin Garcia, Greater New York Conference Youth Ministries.
- **Lifespan:** throwaway. It is replaced or deleted once the direction is decided.

## What it is

Static pages, no build step: `index.html` (home), the four ministry pages under `ministries/` (Adventurers, Pathfinders, Master Guides, AY Ministries) and their program pages under `ministries/pathfinders/` (Bible Experience, TLT, Drum Corps, Drilling & Marching) and `ministries/ay/` (Young Adults, School of Evangelism, Public Campus Ministry), `news.html`, `history.html`, `events.html`, `resources.html`, `about.html`, `design.html` (design guidelines) and `brief.html` (content brief with every slot the Director provides). `assets/site.js` renders the shared nav, footer and content-slot overlay (`?slots=1`). Styling comes from the Tailwind CDN and Google Fonts; there is no build step and no data is collected. The event filters, resource filters and mobile menu work; the EN | ES switch is visual only.

## Comments on every page

Every page has a **Comments** button at the bottom right, above the slot toggle. It opens a drawer with the comments for that page: name and comment, no sign-in, visible to everyone who opens the page, newest conversation first; the button shows how many there are. Each comment names the section it is about by its code from the content brief (`HM-05`, `PF-12`), or the whole page. Two ways to pick the section: choose it in the drawer's **About** list, or press **Show content slots**, then the **Comment** button that appears on any slot; that opens the drawer filtered to that code with the slot lit on the page. The code on a comment is a link that scrolls to the slot. Anyone can **Reply**; replies sit under the comment, one level deep.

**Comments** in the review ribbon opens `comments.html`, every comment from every page in one place, with a filter per page, the page and code each one refers to (the code links to that section of the page), replies, and Reply.

The comments are kept by a small comments service (`comments-worker/`, a Cloudflare Worker with a D1 table on the Greater New York Conference Cloudflare account; see its README). They are for staff only: the drawer and the comments page work on the staff copy at `https://site-review.gnycyouth.org`, after the email sign-in, and this public copy shows no comments. Darwin Garcia can remove a comment through the drawer's **Moderate** link with the moderator key.

## Real photos: staff copy only

This public copy never shows a real photo; every photo slot keeps its placeholder. Signed-in staff see the same pages at `https://site-review.gnycyouth.org`, where each slot shows the photo whose file name starts with its code in the private Drive folder **GNYC Website Content** (for example `PF-14-3 camporee.jpg`). Sign-in is Cloudflare Access with an email code; the list of staff emails is kept there. `assets/site.js` loads `assets/photos.js` on every page, and it does nothing outside the staff host. How it works, how to set it up and its tests: `staff-worker/README.md`.

## Placeholders

Every photograph has its own code, so a file can be named by it. A section with several photos numbers each one under its code: the Pathfinders gallery is `PF-14-1` to `PF-14-9`, the Club Ministry lead area coordinators are `AB-07-1` to `AB-07-7`, each with the person or caption in its label; a file is named `PF-14-1-camporee.jpg`. The content brief lists every photo code under its section, and the codes show on the page with the slot toggle. Photos already on the site from gnycyouth.org keep a code too, labeled Done, so a replacement can be sent under it. Event flyers in the auto-filled event lists have no code of their own: a flyer belongs to its event record.

Story photos, the Camporee and Leadership Summit dates, and the Store link are placeholders. Dates and venues marked TBA have not been confirmed.

## Notes for the implementation build

Decisions recorded during the prototype, to carry into the real site. None of these is built in the prototype.

- **How the real site is built.** WordPress stays, for public content and the store; Elementor is replaced by a custom block theme made from these pages, with locked block patterns staff fill in. Not headless: a phone app can read the same content through WordPress's REST API. Decided and argued in the website backend repository (`GNYC-Youth-Department/website-backend`, `docs/DECISIONS.md` ADR-003, update of October 20, 2026), with the data flows in its `docs/architecture.md`.

- **Principles here, publications at the source.** Pages state the ministry's purpose, philosophy and the GNYC steps. Requirements, manuals, curriculum, uniform standards and record cards link to the page where the North American Division or the General Conference maintains them, so GNYC does not keep copies up to date.
- **External links are marked.** Every link to another site shows a small arrow, names the site (on cards, in the link line; on text links, on hover or focus), opens in a new tab and tells screen readers where it goes. The prototype does this in `assets/site.js` (`extLinks`); the real site keeps the same rule.
- **Scheduled dead-link check.** A script runs daily or weekly, checks every internal page, anchor and external link, and sends the page admin a report of what broke and on which page, so it can be updated. It must retry before reporting, and load gcyouthministries.org in a real browser, one fresh session per page, because its Cloudflare check blocks scripts and repeat loads.
- **Admin portal for maintenance.** An admin portal for preventive maintenance (the link report, content due for review, slots still waiting on content) and remedial maintenance (fixing or replacing a broken link or outdated item without a developer).
