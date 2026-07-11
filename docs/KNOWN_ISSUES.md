# Farely Known Issues

Last updated: 2026-07-11

| Priority | Area | Issue | Status |
| --- | --- | --- | --- |
| Medium | API/provider | Demo fallback is now disabled in production, but Amadeus test/sandbox behavior can still limit result quality until production credentials are approved and verified. | In progress |
| High | Support/contact | Unverified email aliases must not be published. `info@tryfarely.com` is the only public business email until each alias has a verified receiving route or mailbox. | In progress |
| High | Affiliate | Production affiliate approval and final partner redirect template need confirmation. | Open |
| High | Affiliate | `View Deal` click tracking should be validated end to end after each redirect change. | Open |
| Medium | Affiliate/UX | Result cards and the Flexible dates workflow now use the configured booking partner name where available, such as `Book via Aviasales`; true Skyscanner-style multi-provider comparison still needs approved providers and reliable price data. | In progress |
| Medium | UX | Flight results and the guided Flexible dates journey passed live smoke validation after the final-sprint polish deployment, and Milestone 6 is founder/Product-approved. Broader route/browser QA remains useful. | In progress |
| High | Security | Cloudflare SSL/TLS mode and WAF/security settings still need dashboard verification. Live post-deployment headers have been verified. | In progress |
| Medium | Security | Founder/admin analytics still exists inside the public app surface and should move to a separate private dashboard with proper authentication. | Open |
| Medium | UX | Milestone 6 filters drawer passed local desktop/mobile QA and live mobile render smoke validation; broader route/browser QA remains useful. | In progress |
| Medium | UX | Airport selection and return-to-same-airport filter behavior need production-data verification. | In progress |
| Medium | AI planner | Planner now has the first Milestone 7 guided-consultant pass, follow-up correction memory pass, and first ski-planner destination pass deployed and live-verified; it still needs real model-backed reasoning and broader destination coverage. | In progress |
| Medium | AI planner | Keep validating AI suggestion-to-search handoff so every recommended destination exists in the local airport/search mapping. | In progress |
| Medium | Analytics | Founder dashboard and business reporting are not yet built. | Open |
| Medium | SEO | SEO foundations are live-verified; route/destination pages and the first cheap flexible flights explainer are still not built. | Open |
| Medium | Production readiness | Deployment health should be checked after each milestone, not assumed from local build success. | Open |
| Low | Documentation | Project memory docs are new and need to be maintained after each milestone. | In progress |

## Open Bugs

- Production previously advertised `support@tryfarely.com`, which bounced because that alias was not confirmed as a receiving mailbox/route. The app should show `info@tryfarely.com` until the support alias is properly configured.

## UX Issues

- Continue validating result cards and the guided Flexible dates flow for quick comparison with real provider data as traffic grows.
- Continue checking multi-passenger result cards across more routes so `per person` and total-price copy stays clear with varied fare amounts.
- QA Milestone 6 search filters and airport-selection behavior on more live routes with multiple offers.
- CTA wording now uses the configured booking partner where available; continue validating click-through tracking after deployment.
- The booking-option row was live-verified after deployment on an exact-date result card; continue checking it on more routes and Flexible dates selected-day results.
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
- Secrets must stay out of repo commits.
- Deployment state should be confirmed against GitHub/Render after meaningful changes.
- GitHub `main` now has classic branch protection enabled so force pushes and branch deletion are blocked.
- SEO content growth should stay small and product-led: foundations are verified, so the next SEO step should be one focused cheap flexible flights explainer before larger route or niche pages.
