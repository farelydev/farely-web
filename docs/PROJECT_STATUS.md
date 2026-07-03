# Farely Project Status

Last updated: 2026-07-03

## Current Milestone

Milestone 6: Search Experience 2.0.

## Current Production Readiness Status

Farely is live and in MVP hardening. Core flight search flows are present, the first small security-hardening pass has been pushed, deployed, and verified on the live site, and demo fallback is now disabled on Render. The Milestone 6 final-sprint polish and the founder-requested Flexible dates/dark-mode adjustment have been pushed, deployed, and live-verified on `https://tryfarely.com`; founder approval is still needed before Milestone 6 can be called complete. Production readiness still depends on Cloudflare dashboard checks, stronger provider monitoring, affiliate approval/configuration, private founder analytics architecture, and continued search reliability work.

Delivery state rule: work is only complete when it is `Implemented`, `Deployed`, and `Verified` on the live production site. The current security hardening has reached `Verified` on `https://tryfarely.com`.

## Latest Deployment / Commit

- Branch: `main`
- Latest Flexible dates naming and dark-mode polish implementation commit: `c882fd3`
- Latest verified Milestone 6 final-sprint implementation commit: `2b1c86e`
- Latest pushed handoff/docs commit: `c10ff5f`
- Latest verified security-hardening commit: `0739d9b`
- Deployment source: GitHub `farelydev/farely-web` on `main`
- Live verification: `https://tryfarely.com` served the new Flexible dates/dark-mode frontend bundle, the live 390px dark-mode smoke check passed with no old feature-name or beta wording visible, `/api/debug/amadeus` returned `404`, bad-origin CORS was not reflected, Helmet security headers were present, exact-date and flexible searches returned live Amadeus results, and `/api/deals/flight` returned a tracked `302` partner redirect.

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
- Farely uses a server-controlled affiliate redirect architecture.
- Production security hardening now disables the public Amadeus debug endpoint, restricts production CORS to the Farely domains, removes URL/localStorage analytics-token handling, adds Helmet security headers, and removes `X-Powered-By`.
- Legal/affiliate disclosure pages and notices exist.
- `info@tryfarely.com` is the only public business email that should be shown until more aliases are verified.
- Project instructions exist in `AGENTS.md`.
- Repo-based project memory docs exist in `docs/`.

## What Is Incomplete

- Milestone 6 Search Experience 2.0 is not complete until the founder approves the final-sprint polish.
- Milestone 6 still needs founder acceptance and a broader accessibility review.
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

Next engineering priority: ask the founder for Milestone 6 acceptance before moving to Milestone 7.
