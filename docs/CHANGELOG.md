# Farely Changelog

This changelog tracks completed Farely milestones and whether they were pushed to GitHub.

## 2026-06-29

- Commit hash: pending
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
  - Pending.

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
