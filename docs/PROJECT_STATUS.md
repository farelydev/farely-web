# Farely Project Status

Last updated: 2026-07-08

## Current Milestone

Milestone 7: Farely AI Travel Consultant.

## Current Production Readiness Status

Farely is live and in MVP hardening. Core flight search flows are present, the first small security-hardening pass has been pushed, deployed, and verified on the live site, and demo fallback is now disabled on Render. The Milestone 6 final-sprint polish and the founder-requested Flexible dates/dark-mode adjustment have been pushed, deployed, live-verified on `https://tryfarely.com`, and founder/Product-approved through a fresh `MVP Factory` ChatGPT project chat on 2026-07-05. Milestone 7 has started with the first guided AI Travel Consultant improvement pushed, deployed, and live-verified on `https://tryfarely.com`; the conversation-memory increment lets the planner merge natural follow-up corrections into the same trip intent and has also been pushed, deployed, and live-verified. The latest local Milestone 7 increment adds first-pass ski trip recommendations for Sofia, Geneva, and Innsbruck, with local build/lint and browser QA passed; GitHub push and live verification are pending for this increment. Production readiness still depends on Cloudflare dashboard checks, stronger provider monitoring, affiliate approval/configuration, private founder analytics architecture, and continued search reliability work.

Delivery state rule: work is only complete when it is `Implemented`, `Deployed`, and `Verified` on the live production site. The first Milestone 7 guided AI planner pass has reached `Verified` on `https://tryfarely.com`; the conversation-memory increment is also `Verified` on `https://tryfarely.com`. The ski-planner increment is currently `Implemented` locally only until GitHub push, Render deployment, and live verification pass.

## Latest Deployment / Commit

- Branch: `main`
- Latest local Milestone 7 ski-planner implementation commit: pending
- Latest verified Milestone 7 conversation-memory implementation commit: `35c47fe`
- Latest verified Milestone 7 guided AI planner deployment commit: `8a77e7a`
- Latest Flexible dates naming and dark-mode polish implementation commit: `c882fd3`
- Latest verified Milestone 6 final-sprint implementation commit: `2b1c86e`
- Latest Milestone 7 guided AI planner implementation commit: `783a841`
- Latest pushed handoff/docs commit before final status cleanup: `8a77e7a`
- Latest verified security-hardening commit: `0739d9b`
- Deployment source: GitHub `farelydev/farely-web` on `main`
- Live verification: `https://tryfarely.com` served the Milestone 7 conversation-memory bundle `assets/index-D7hUWsZ2.js`; `/api/health` reported `demoFallbackEnabled:false`; exact-date `/api/flights` returned live Amadeus return offers; `/api/flexible` returned live Amadeus flexible-day data; `/api/deals/flight` returned a tracked `302` partner redirect; and the live planner correction flow `3 nights somewhere romantic under £250 flights` -> `August 2026` -> `Actually from Manchester and I want Bosnia in November under £300` updated the summary to Manchester/November/Under £300 and ranked Bosnia first.
- GitHub protection: classic branch protection is enabled for `main`; force pushes and branch deletion are not allowed.

## What Is Working

- React/Vite frontend exists.
- Node/Express backend exists.
- Exact-date flight search is implemented.
- Flexible dates search is implemented on top of the existing flexible-month backend.
- Flexible dates now runs with demo fallback disabled in production; fallback-off live checks returned Amadeus results, and the API has a visible rate-limit/provider-unavailable response if every live flexible date fails.
- Cheapest-day results render.
- Flexible dates results now use a guided workflow: choose month, choose travel day, compare flights, then check partner deal.
- Flight offer results render.
- Richer result cards now show airline branding, outbound/return sections, full airport labels where known, price, cabin, baggage notes, recommendation badges, and clearer partner CTA wording.
- A mobile-first filters drawer now exists with quick filters, advanced filter controls, scroll locking, Escape-to-close behavior, and mobile overflow safeguards.
- Exact-date date selection now keeps the selected departure and return dates visible below the native date inputs.
- Public copy has been softened where needed, including replacing `Umrah packages` with `Plan Umrah trip`.
- Umrah-related AI prompts now route into the Umrah planning mode instead of the generic planner path.
- The AI planner now respects requested destinations in its recommendation order, shows a short analysing state, presents visual recommendation cards with match scores and scannable trip details, explains why alternatives were suggested, and fills the search form for review before live search.
- The AI planner now starts Milestone 7 by defaulting missing origin to London, parsing natural prompts for timing, budget, trip length, sunny/romantic/food/city intent, asking one missing follow-up when needed, showing an interpreted trip-intent summary, and routing new Lisbon/Rome-style suggestions into the existing search-form review step.
- The AI planner can now merge natural follow-up corrections after recommendations appear, such as changing origin, timing, budget, or requested destination, then re-rank the destination cards without starting a live search.
- The AI planner now has a first-pass ski planner path locally: ski prompts can recommend Sofia, Geneva, and Innsbruck, then fill the existing Flexible dates search form for review before live search.
- Farely uses a server-controlled affiliate redirect architecture.
- Production security hardening now disables the public Amadeus debug endpoint, restricts production CORS to the Farely domains, removes URL/localStorage analytics-token handling, adds Helmet security headers, and removes `X-Powered-By`.
- Legal/affiliate disclosure pages and notices exist.
- `info@tryfarely.com` is the only public business email that should be shown until more aliases are verified.
- Project instructions exist in `AGENTS.md`.
- Repo-based project memory docs exist in `docs/`.

## What Is Incomplete

- Milestone 6 Search Experience 2.0 is founder/Product-approved as complete, but broader accessibility review remains useful during production readiness.
- Production affiliate partner approval/configuration is not yet fully confirmed in this repo.
- Click tracking needs ongoing validation against live traffic and analytics requirements.
- Founder analytics should move out of the public app into a private dashboard with proper authentication.
- AI trip-planning experience is now the active Milestone 7 focus; the first guided pass and follow-up correction memory pass are live-verified, and the first ski-planner increment is implemented locally, but it still needs live verification, real model-backed reasoning, and broader destination coverage.
- Founder/admin dashboard is not yet built.
- Production deployment health should be rechecked after each feature milestone.
- These memory docs are initialized and should be updated after every completed milestone.

## Current Blockers

- Live provider behavior is now easier to verify because `USE_DEMO_FALLBACK=false` is active on Render.
- Cloudflare SSL/TLS mode and WAF/security settings still need live dashboard verification.
- `support@tryfarely.com`, `privacy@tryfarely.com`, `security@tryfarely.com`, and `noreply@tryfarely.com` should not be advertised until Cloudflare Email Routing or a real mailbox provider is configured for each alias.
- Real affiliate monetisation depends on partner approval, configured redirect templates, and reliable click metadata.
- The founder-to-ChatGPT handoff was previously manual; this docs system now reduces that risk but needs discipline after each milestone.
- GitHub SSH was repaired on this Mac with a dedicated Farely Codex SSH key, and `main` is now protected against force pushes and deletion.

## Recommended Next Engineering Priority

Next engineering priority: after live-verifying the ski-planner increment, continue Milestone 7 with broader destination coverage or real model-backed planner reasoning.
