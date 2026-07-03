# Farely Changelog

This changelog tracks completed Farely milestones and whether they were pushed to GitHub.

## 2026-07-03

- Commit hash: `0739d9b`
- What changed:
  - Pushed the security hardening, guided Cheapest Month UX, fallback-off flexible-search handling, and ChatGPT handoff workflow to GitHub `main`.
  - Verified the deployment on `https://tryfarely.com`.
  - Confirmed the live site serves the new frontend bundle with `Choose your departure date`, `Tap to compare flights`, and `Book with partner`.
  - Confirmed `/api/debug/amadeus` returns `404`, bad-origin CORS is not reflected, Helmet security headers are present, exact-date and flexible searches return live Amadeus results, and `/api/deals/flight` still returns a tracked `302` partner redirect.
- Checks run:
  - GitHub SSH authentication passed.
  - `git push origin main` succeeded.
  - Live production HTTP/API probes passed on 2026-07-03.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.

## 2026-07-03

- Commit hash: `844bbe1`
- What changed:
  - Changed the Render blueprint default for `USE_DEMO_FALLBACK` from `true` to `false`.
  - Updated deployment and project docs so fallback-off provider verification is the next required check.
- Checks run:
  - `git diff --check` passed on 2026-07-03.
  - `npm run build` could not run on this Mac because the local `/usr/local/bin/node` binary failed with a macOS `dyld` libc++ symbol error.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-03.

## 2026-07-03

- Commit hash: `0f24a42`
- What changed:
  - Redesigned the Flexible Search / Cheapest Month results journey as a guided workflow.
  - Added progress copy for choose month, choose travel day, compare flights, and book with partner.
  - Added a clear `Choose your departure date` step before flight-comparison controls appear.
  - Changed flexible date-card action text to `Tap to compare flights`.
  - Hid Cheapest/Fastest/Best tabs and Filters until a flexible date is selected, then revealed the comparison section with a subtle animation.
- Checks run:
  - `npm run build` passed on 2026-07-03.
- Pushed to GitHub:
  - Yes, included in `origin/main`.

## 2026-07-03

- Commit hash: `7878c7a`
- What changed:
  - Added a clear fallback-off failure path for `/api/flexible`.
  - When demo fallback is disabled and every scanned flexible date fails, the backend now returns `429` for rate limits or `503` for provider unavailable instead of a normal-looking `200` response with no useful fares.
  - Added frontend handling for the new `amadeus-unavailable` response so users see plain-English guidance to narrow the date range, use Exact Dates, or retry shortly.
  - Updated the search card warning area so flexible-search live status messages can be shown before result cards.
- Checks run:
  - `node --check server.js` passed on 2026-07-03.
  - `npm run build` passed on 2026-07-03.
  - `npm run lint` passed with 1 pre-existing warning in `src/components/LegalPage.jsx` on 2026-07-03.
  - `npm install` audit output reported 0 vulnerabilities on 2026-07-03.
  - Local fallback-disabled probe passed: with `USE_DEMO_FALLBACK=false` and dummy Amadeus credentials, `/api/flexible` returned `503 Service Unavailable`, `source: "amadeus-unavailable"`, and a user-friendly Exact Dates retry message.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.

## 2026-07-03

- Commit hash: `8fe39a7`
- What changed:
  - Added Express security hardening with Helmet, a CSP, referrer policy, content-type hardening, frame protection, permissions policy, and disabled `X-Powered-By`.
  - Restricted production CORS to `https://tryfarely.com` and `https://www.tryfarely.com`.
  - Disabled `/api/debug/amadeus` in production so public visitors cannot see Amadeus credential/config status or trigger the diagnostic test call.
  - Removed analytics admin-token support from URL query parameters.
  - Stopped storing analytics admin tokens in `localStorage`; analytics unlock now uses in-memory state only.
  - Added `helmet` and updated vulnerable production dependencies through `npm audit fix`.
- Checks run:
  - `npm run build` passed on 2026-07-03.
  - `npm run lint` passed with 1 pre-existing warning in `src/components/LegalPage.jsx` on 2026-07-03.
  - `npm audit --omit=dev` passed with 0 vulnerabilities on 2026-07-03.
  - Local production-mode API/header probes passed on 2026-07-03.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.

## 2026-06-29

- Commit hash: `494c2f0`
- What changed:
  - Reframed flexible search as `Cheapest Month` in the main search navigation.
  - Removed beta/warning-heavy flexible-search language from the user-facing flow.
  - Added positive guidance around finding cheaper travel dates.
  - Added a simple flow: choose month, pick a date, check prices, compare flights.
  - Kept the existing `/api/flexible` backend contract intact while designing around its current provider constraints.
- Checks run:
  - `git diff --check` passed on 2026-06-29.
  - `npm run build` passed on 2026-06-29.
  - `npm run lint` passed with 2 pre-existing warnings on 2026-06-29.
  - Local Chrome mobile render check passed on 2026-06-29.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.

## 2026-06-29

- Commit hash: `a00066b`
- What changed:
  - Added richer flight result cards with airline logos/fallbacks, full airline names, full airport labels where known, outbound and return sections, duration, stops, cabin, baggage notes, and prominent total price.
  - Added recommendation badges such as `Cheapest`, `Fastest`, `Best Value`, and `Direct`.
  - Added a mobile-first filters bottom sheet with quick filters and advanced budget, airline, stops, time, airport, return-to-same-airport, duration, and cabin-bag controls.
  - Changed the active partner CTA wording to `Check partner deal`.
  - Routed Umrah-related AI prompts into Umrah mode and added Umrah-specific planning questions.
- Checks run:
  - `git diff --check` passed on 2026-06-29.
  - `npm run build` passed on 2026-06-29.
  - `npm run lint` passed with 2 pre-existing warnings on 2026-06-29.
  - Local Chrome mobile render check passed with mocked flight offers on 2026-06-29.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.

## 2026-06-29

- Commit hash: `5c97c19`
- What changed:
  - Removed unverified public email aliases from frontend defaults, backend support defaults, Render config, and deployment docs.
  - Standardised the public support/contact address on `info@tryfarely.com` until `support@tryfarely.com` has a verified Cloudflare route or mailbox.
  - Rechecked live production health for Amadeus search, return search, flexible search, static pages, and `View Deal` redirect behavior.
- Checks run:
  - `node --check server.js` passed on 2026-06-29.
  - `vite build` passed on 2026-06-29.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.

## 2026-06-29

- Commit hash: `589c1b1`
- What changed:
  - Added Farely Company Operating System v1 to `AGENTS.md`.
  - Reframed the project memory docs around milestone-led development.
  - Set Milestone 6, Search Experience 2.0, as the current active milestone.
  - Added Milestones 7-10 to the roadmap.
- Checks run:
  - `npm run build` passed on 2026-06-29.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.

## 2026-06-29

- Commit hash: `4bb3f0e`
- What changed:
  - Created the lightweight project memory system in `docs/`.
  - Added founder-to-ChatGPT handoff tracking.
  - Updated `AGENTS.md` so future Codex sessions maintain these docs before commit and push.
- Checks run:
  - `npm run build` passed on 2026-06-29.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.
