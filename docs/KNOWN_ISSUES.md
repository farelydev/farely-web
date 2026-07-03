# Farely Known Issues

Last updated: 2026-07-03

| Priority | Area | Issue | Status |
| --- | --- | --- | --- |
| Medium | API/provider | Demo fallback is now disabled in production, but Amadeus test/sandbox behavior can still limit result quality until production credentials are approved and verified. | In progress |
| High | Support/contact | Unverified email aliases must not be published. `info@tryfarely.com` is the only public business email until each alias has a verified receiving route or mailbox. | In progress |
| High | Affiliate | Production affiliate approval and final partner redirect template need confirmation. | Open |
| High | Affiliate | `View Deal` click tracking should be validated end to end after each redirect change. | Open |
| Medium | UX | Flight results and the guided Flexible dates journey passed live smoke validation after the final-sprint polish deployment; founder acceptance is still pending. | In progress |
| High | Security | Cloudflare SSL/TLS mode and WAF/security settings still need dashboard verification. Live post-deployment headers have been verified. | In progress |
| Medium | Security | Founder/admin analytics still exists inside the public app surface and should move to a separate private dashboard with proper authentication. | Open |
| Medium | UX | Milestone 6 filters drawer passed local desktop/mobile QA and live mobile render smoke validation; broader route/browser QA remains useful. | In progress |
| Medium | UX | Airport selection and return-to-same-airport filter behavior need production-data verification. | In progress |
| Medium | AI planner | Planner now has a first destination-personalisation pass, but still needs real model-backed reasoning and broader destination coverage. | In progress |
| Medium | AI planner | Remaining AI/search sync fixes belong to Milestone 6 before Milestone 7 begins. | Open |
| Medium | Analytics | Founder dashboard and business reporting are not yet built. | Open |
| Medium | Production readiness | Deployment health should be checked after each milestone, not assumed from local build success. | Open |
| Low | Documentation | Project memory docs are new and need to be maintained after each milestone. | In progress |

## Open Bugs

- Production previously advertised `support@tryfarely.com`, which bounced because that alias was not confirmed as a receiving mailbox/route. The app should show `info@tryfarely.com` until the support alias is properly configured.

## UX Issues

- Continue validating result cards and the guided Flexible dates flow for quick comparison with real provider data as traffic grows.
- QA Milestone 6 search filters and airport-selection behavior on more live routes with multiple offers.
- CTA wording has been changed to `Check partner deal`; validate click-through tracking after deployment.
- Keep affiliate disclosure visible without making the UI feel cluttered.
- Continue validating the AI planner with real user prompts so requested destinations are not silently replaced by unrelated alternatives.

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
