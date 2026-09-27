# GNYC Youth homepage prototype

`TIER: 1 | OVERLAYS: none`

Design prototype of the proposed gnycyouth.org homepage revamp, published so reviewers can open it in a browser:

**https://gnyc-youth-department.github.io/homepage-prototype/**

- **Purpose:** collect feedback on the visual direction. It is for review only and is not the live site.
- **Owner:** Darwin Garcia, Greater New York Conference Youth Ministries.
- **Lifespan:** throwaway. It is replaced or deleted once the direction is decided.

## What it is

Static pages, no build step: `index.html` (home), the four ministry pages under `ministries/` (Adventurers, Pathfinders, Master Guides, AY Ministries) and their program pages under `ministries/pathfinders/` (Bible Experience, TLT, Drum Corps, Drilling & Marching) and `ministries/ay/` (Young Adults, School of Evangelism, Public Campus Ministry), `news.html`, `history.html`, `events.html`, `resources.html`, `about.html`, `design.html` (design guidelines) and `brief.html` (content brief with every slot the Director provides). `assets/site.js` renders the shared nav, footer and content-slot overlay (`?slots=1`). Styling comes from the Tailwind CDN and Google Fonts; there is no build step and no data is collected. The event filters, resource filters and mobile menu work; the EN | ES switch is visual only.

## Placeholders

Story photos, the Camporee and Leadership Summit dates, and the Store link are placeholders. Dates and venues marked TBA have not been confirmed.

## Notes for the implementation build

Decisions recorded during the prototype, to carry into the real site. None of these is built in the prototype.

- **Principles here, publications at the source.** Pages state the ministry's purpose, philosophy and the GNYC steps. Requirements, manuals, curriculum, uniform standards and record cards link to the page where the North American Division or the General Conference maintains them, so GNYC does not keep copies up to date.
- **External links are marked.** Every link to another site shows a small arrow, names the site (on cards, in the link line; on text links, on hover or focus), opens in a new tab and tells screen readers where it goes. The prototype does this in `assets/site.js` (`extLinks`); the real site keeps the same rule.
- **Scheduled dead-link check.** A script runs daily or weekly, checks every internal page, anchor and external link, and sends the page admin a report of what broke and on which page, so it can be updated. It must retry before reporting, and load gcyouthministries.org in a real browser, one fresh session per page, because its Cloudflare check blocks scripts and repeat loads.
- **Admin portal for maintenance.** An admin portal for preventive maintenance (the link report, content due for review, slots still waiting on content) and remedial maintenance (fixing or replacing a broken link or outdated item without a developer).
