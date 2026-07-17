# Farely Known Issues

Last updated: 2026-07-17

| Priority | Area | Issue | Status |
| --- | --- | --- | --- |
| Medium | API/provider | Demo fallback is now disabled in production, but Amadeus test/sandbox behavior can still limit result quality until production credentials are approved and verified. | In progress |
| High | API/provider | On 2026-07-17, live exact-date `/api/flights` returned Amadeus test-environment `500` responses across checked routes, blocking full live exact-date UI verification. | Open |
| Medium | QA/monitoring | Live browser audits must stay rate-limit aware. A first parallel full-audit attempt encountered Amadeus/provider 429 behavior, so production audits now run serially and API checks run only once per full audit. | In progress |
| Low | UX/autocomplete | When users type exact airport codes such as `LHR` or `JFK`, city/all-airports rows can appear because their tags include those codes. Consider ranking exact IATA airport rows first if traveller testing shows confusion. | Open |
| High | Support/contact | Unverified email aliases must not be published. `info@tryfarely.com` is the only public business email until each alias has a verified receiving route or mailbox. | In progress |
| High | Affiliate | Kiwi.com is the first documented second-provider candidate, and the hidden provider-aware redirect foundation now exists, but approval status and the final redirect/deep-link template still need confirmation before any visible provider row is built. | Open |
| High | Affiliate | `View Deal` click tracking should be validated end to end after each redirect change. | Open |
| Medium | Affiliate/UX | Result cards and the Flexible dates workflow now use the configured booking partner name where available, such as `Book via Aviasales`; true Skyscanner-style multi-provider comparison still needs approved providers and reliable price data. | In progress |
| Medium | UX | Flight results and the guided Flexible dates journey passed live smoke validation after the final-sprint polish deployment, and Milestone 6 is founder/Product-approved. Broader route/browser QA remains useful. | In progress |
| High | Security | Cloudflare SSL/TLS mode and WAF/security settings still need dashboard verification. Live post-deployment headers have been verified. | In progress |
| Medium | Security | Founder/admin analytics still exists inside the public app surface and should move to a separate private dashboard with proper authentication. | Open |
| Medium | UX | Milestone 6 filters drawer passed local desktop/mobile QA and live mobile render smoke validation; broader route/browser QA remains useful. | In progress |
| Medium | UX | Airport selection and return-to-same-airport filter behavior need broader production-data verification; stale filter reset after route/search changes is live-verified. | In progress |
| Low | UX | The 2026-07-14 multi-carrier airline filter fix is live-verified on LHR -> DXB; continue checking varied production routes as provider data changes. | In progress |
| Medium | AI planner | Planner now has the first Milestone 7 guided-consultant pass, follow-up correction memory pass, and first ski-planner destination pass deployed and live-verified; it still needs real model-backed reasoning and broader destination coverage. | In progress |
| Medium | AI planner | Keep validating AI suggestion-to-search handoff so every recommended destination exists in the local airport/search mapping. | In progress |
| Medium | Analytics | Founder dashboard and business reporting are not yet built. | Open |
| Medium | SEO | SEO foundations are live-verified; route/destination pages and the first cheap flexible flights explainer are still not built. | Open |
| Medium | Production readiness | Deployment health should be checked after each milestone, not assumed from local build success. | Open |
| Low | Documentation | Project memory docs are new and need to be maintained after each milestone. | In progress |

## Open Bugs

- Production previously advertised `support@tryfarely.com`, which bounced because that alias was not confirmed as a receiving mailbox/route. The app should show `info@tryfarely.com` until the support alias is properly configured.

## UX Issues

- Automated Playwright QA is now available through `npm run audit:hourly` and `npm run audit:full`; continue adding regression tests for every confirmed live bug.
- Continue validating result cards and the guided Flexible dates flow for quick comparison with real provider data as traffic grows.
- Continue checking multi-passenger result cards across more routes so `per person` and total-price copy stays clear with varied fare amounts.
- QA Milestone 6 search filters and airport-selection behavior on more live routes with multiple offers. The 2026-07-17 filter empty-state recovery adds `Show all offers` for no-match filter states and was verified on the live production bundle with a controlled flight response; repeat with real provider data after Amadeus exact-date responses recover.
- The 2026-07-15 filter-reset update is live-verified: stale airport filters clear after a route/search-context change instead of hiding valid new fares.
- Multi-carrier airline labels and filters were live-verified on LHR -> DXB; repeat on more routes as provider data varies.
- CTA wording now uses the configured booking partner where available; continue validating click-through tracking after deployment.
- Do not show Kiwi.com as a live booking option until the account approval, tracking rules, and approved redirect/deep-link template are confirmed. The backend can now resolve provider-aware redirect requests, but disabled/unconfigured provider requests should continue falling back to the primary Aviasales path.
- The booking-option row was live-verified after deployment on an exact-date result card; continue checking it on more routes and Flexible dates selected-day results.
- The top booking strip was live-verified on desktop and 390px mobile on 2026-07-12; continue checking it across more routes as traffic grows.
- Flexible dates availability copy was tightened and live-verified on 2026-07-11 so clean successful results do not show a broad reliability warning.
- The pre-search Flexible dates hint now tells users to confirm the final fare on the partner site; the verified post-result workflow step uses the configured partner name.
- Keep affiliate disclosure visible without making the UI feel cluttered.
- Continue validating the AI planner with real user prompts so requested destinations are not silently replaced by unrelated alternatives and new recommendations fill supported search routes.
- Post-recommendation corrections such as `Actually from Manchester and I want Bosnia in November under £300` were live-verified; continue testing more real user prompt variations.
- Ski prompts now have a live-verified first pass with Sofia, Geneva, and Innsbruck; continue checking that selected ski destinations fill supported search routes as coverage grows.

## API / Provider Limitations

- Amadeus sandbox/test responses may fail or return limited results for some routes and dates.
- Fallback/demo behavior is useful for development but should not be treated as proof of production provider health.
- Keep monitoring fallback-off exact-date and flexible-search behavior before moving to Amadeus production credentials.

## Production Readiness Concerns

- The first small security-hardening pass is pushed, deployed, and verified on the live site.
- Milestones now require three states: `Implemented`, `Deployed`, and `Verified`; only live verification counts as complete.
- Contact details must only show verified receiving addresses.
- Affiliate redirect and click tracking are core business infrastructure and need live validation.
- Kiwi.com can be prepared as a second-provider candidate, and the hidden provider-aware redirect foundation is now in place, but visible multi-provider comparison remains blocked until approved live redirect data exists.
- Secrets must stay out of repo commits.
- Deployment state should be confirmed against GitHub/Render after meaningful changes.
- GitHub `main` now has classic branch protection enabled so force pushes and branch deletion are blocked.
- SEO content growth should stay small and product-led: foundations are verified, so the next SEO step should be one focused cheap flexible flights explainer before larger route or niche pages.
