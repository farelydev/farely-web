# Farely Known Issues

Last updated: 2026-06-29

| Priority | Area | Issue | Status |
| --- | --- | --- | --- |
| High | API/provider | Demo fallback and Amadeus test/sandbox behavior can make provider health look better than true live readiness. | Open |
| High | Affiliate | Production affiliate approval and final partner redirect template need confirmation. | Open |
| High | Affiliate | `View Deal` click tracking should be validated end to end after each redirect change. | Open |
| Medium | UX | Flight results still need continued clarity around outbound/return details, layovers, and comparison signals. | Open |
| Medium | AI planner | Planner experience needs clearer product scope and stronger structured trip outputs. | Open |
| Medium | Analytics | Founder dashboard and business reporting are not yet built. | Open |
| Medium | Production readiness | Deployment health should be checked after each milestone, not assumed from local build success. | Open |
| Low | Documentation | Project memory docs are new and need to be maintained after each milestone. | In progress |

## Open Bugs

- No confirmed new runtime bug from this documentation milestone.

## UX Issues

- Continue simplifying result cards for quick comparison.
- Keep affiliate disclosure visible without making the UI feel cluttered.
- Make AI planner next steps clearer for non-technical users.

## API / Provider Limitations

- Amadeus sandbox/test responses may fail or return limited results for some routes and dates.
- Fallback/demo behavior is useful for development but should not be treated as proof of production provider health.

## Production Readiness Concerns

- Affiliate redirect and click tracking are core business infrastructure and need live validation.
- Secrets must stay out of repo commits.
- Deployment state should be confirmed against GitHub/Render after meaningful changes.
