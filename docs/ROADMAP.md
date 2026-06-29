# Farely Roadmap

Last updated: 2026-06-29

## Current Phase

MVP hardening and monetisation readiness.

## Next Product Milestones

1. Make flight results feel production-ready and easy to compare.
2. Validate `View Deal` redirect and click tracking end to end.
3. Improve the AI trip planner from a simple assistant into a useful planning flow.
4. Prepare the first affiliate monetisation path.
5. Add a lightweight founder dashboard for business and product visibility.

## AI Planner Roadmap

- Clarify the planner's main job: inspiration, itinerary planning, or trip refinement.
- Improve prompt handling around budget, destination style, dates, and constraints.
- Add better structured outputs for suggested trips.
- Connect planner suggestions more clearly to flight search results.
- Add guardrails so Farely does not overstate booking, payment, or travel-agent responsibilities.

## Flight Search Roadmap

- Keep exact-date search stable.
- Keep flexible-month search stable.
- Improve outbound and return flight detail clarity.
- Continue improving airline logos, layover details, and result ranking.
- Add clearer loading, empty, and provider-error states.
- Validate behavior against live Amadeus provider responses after deployments.

## Affiliate Monetisation Roadmap

- Keep affiliate links server-controlled.
- Keep click tracking inside the backend redirect flow.
- Confirm the first approved affiliate partner and required URL template.
- Pass useful metadata such as route, dates, cabin, currency, price, trip type, sort, and result rank.
- Avoid Travelpayouts Drive scripts or automatic link-rewriting unless required for approval or usage.
- Add reporting that helps the founder see clicks, conversion signals, and broken redirects.

## Founder Dashboard Roadmap

- Show simple health indicators for searches, provider errors, clicks, and popular routes.
- Show affiliate click totals and recent redirect issues.
- Show basic funnel metrics from search to result to `View Deal`.
- Keep dashboard private/admin-only.
- Avoid storing secrets or private user data in frontend code.

## Future Travel Expansion Roadmap

- Hotels and accommodation comparison.
- Packages or trip bundles.
- Destination guides and SEO content.
- Travel insurance or airport transfer affiliate paths.
- Account features such as saved trips only after the core search and monetisation path is reliable.
