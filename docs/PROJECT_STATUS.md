# Farely Project Status

Last updated: 2026-07-03

## Current Milestone

Milestone 6: Search Experience 2.0.

## Current Production Readiness Status

Farely is live and in MVP hardening. Core flight search flows are present, the first small security-hardening pass has been pushed, deployed, and verified on the live site, and demo fallback is now disabled on Render. Production readiness still depends on Cloudflare dashboard checks, stronger provider monitoring, affiliate approval/configuration, private founder analytics architecture, and continued search reliability work.

Delivery state rule: work is only complete when it is `Implemented`, `Deployed`, and `Verified` on the live production site. The current security hardening has reached `Verified` on `https://tryfarely.com`.

## Latest Deployment / Commit

- Branch: `main`
- Latest verified security-hardening commit: `0739d9b`
- Deployment source: GitHub `farelydev/farely-web` on `main`
- Live verification: `https://tryfarely.com` served the new frontend bundle, `/api/debug/amadeus` returned `404`, bad-origin CORS was not reflected, Helmet security headers were present, exact-date and flexible searches returned live Amadeus results, and `/api/deals/flight` returned a tracked `302` partner redirect.

## What Is Working

- React/Vite frontend exists.
- Node/Express backend exists.
- Exact-date flight search is implemented.
- Cheapest Month search is implemented on top of the existing flexible-month backend.
- Cheapest Month now runs with demo fallback disabled in production; fallback-off live checks returned Amadeus results, and the API has a visible rate-limit/provider-unavailable response if every live flexible date fails.
- Cheapest-day results render.
- Cheapest Month results now use a guided workflow: choose month, choose travel day, compare flights, then book with a partner.
- Flight offer results render.
- Richer result cards now show airline branding, outbound/return sections, full airport labels where known, price, cabin, baggage notes, recommendation badges, and clearer partner CTA wording.
- A mobile-first filters drawer now exists with quick filters and advanced filter controls.
- Umrah-related AI prompts now route into the Umrah planning mode instead of the generic planner path.
- The AI planner now respects requested destinations in its recommendation order, shows a short analysing state, presents visual recommendation cards with match scores and scannable trip details, explains why alternatives were suggested, and fills the search form for review before live search.
- Farely uses a server-controlled affiliate redirect architecture.
- Production security hardening now disables the public Amadeus debug endpoint, restricts production CORS to the Farely domains, removes URL/localStorage analytics-token handling, adds Helmet security headers, and removes `X-Powered-By`.
- Legal/affiliate disclosure pages and notices exist.
- `info@tryfarely.com` is the only public business email that should be shown until more aliases are verified.
- Project instructions exist in `AGENTS.md`.
- Repo-based project memory docs exist in `docs/`.

## What Is Incomplete

- Milestone 6 Search Experience 2.0 is not complete.
- Milestone 6 still needs live-production validation, deeper Cheapest Month/filter QA against real Amadeus responses, accessibility polish, and any remaining AI/search sync fixes.
- Production affiliate partner approval/configuration is not yet fully confirmed in this repo.
- Click tracking needs ongoing validation against live traffic and analytics requirements.
- Founder analytics should move out of the public app into a private dashboard with proper authentication.
- AI trip-planning experience still needs product decisions and iteration, but the first destination-personalisation pass is implemented.
- Founder/admin dashboard is not yet built.
- Production deployment health should be rechecked after each feature milestone.
- These memory docs are initialized and should be updated after every completed milestone.

## Current Blockers

- Live provider behavior is now easier to verify because `USE_DEMO_FALLBACK=false` is active on Render.
- Cloudflare SSL/TLS mode and WAF/security settings still need live dashboard verification.
- `support@tryfarely.com`, `privacy@tryfarely.com`, `security@tryfarely.com`, and `noreply@tryfarely.com` should not be advertised until Cloudflare Email Routing or a real mailbox provider is configured for each alias.
- Real affiliate monetisation depends on partner approval, configured redirect templates, and reliable click metadata.
- The founder-to-ChatGPT handoff was previously manual; this docs system now reduces that risk but needs discipline after each milestone.

## Recommended Next Engineering Priority

Next engineering priority: monitor fallback-off API reliability on live traffic, then move toward production Amadeus credentials when the founder is ready.
