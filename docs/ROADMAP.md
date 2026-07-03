# Farely Roadmap

Last updated: 2026-07-03

## Current Phase

Milestone-led startup buildout. Current active phase: Milestone 6, Search Experience 2.0.

## Next Product Milestones

1. Milestone 6: Search Experience 2.0.
2. Milestone 7: Farely AI Travel Consultant.
3. Milestone 8: Founder Intelligence Dashboard / Farely Control Centre.
4. Milestone 9: Production Readiness.
5. Milestone 10: Travel Platform Expansion.

## Milestone 6: Search Experience 2.0

- Rich flight cards: first pass implemented.
- Full airline names: first pass implemented.
- Airline logos: first pass implemented with carrier-code fallback.
- Full airport names: first pass implemented where the airport is known locally.
- Filters drawer: first pass implemented as a mobile-first bottom sheet.
- Budget filter: first pass implemented.
- Airline filter: first pass implemented.
- Morning/afternoon/evening filter: first pass implemented.
- Stops filter: first pass implemented.
- Airport selection filters: first pass implemented from visible result airports.
- Return-to-same-airport option: first pass implemented.
- Better CTA wording: first pass implemented as `Check partner deal`.
- Cheapest Month / Date Explorer UX: first pass reframed from warning-heavy flexible dates to a benefit-led flow; second pass now guides users through choosing a travel day before flight-comparison controls appear.
- Remaining AI/search sync fixes.

Goal: make Farely's search experience feel trustworthy, clear, and conversion-ready.

## Milestone 7: Farely AI Travel Consultant

- Better recommendation quality.
- Trip-type detection.
- Umrah mode: core launch use case, first-pass prompt routing and questions implemented.
- Beach planner.
- City break planner.
- Ski planner.
- Better follow-up questions.
- Better recommendation explanations.
- Better conversation memory.

Goal: help users decide where to go rather than simply filling a search form.

## Milestone 8: Founder Intelligence Dashboard

Turn the current analytics page into Farely Control Centre.

- Business: searches, clicks, CTR, revenue.
- AI: prompt trends, recommendation acceptance, conversation completion.
- Flights: top routes, top airlines, no-result searches.
- Affiliate: partner clicks, revenue by partner.
- System: API health, production status, Amadeus status, fallback usage.

## Milestone 9: Production Readiness

- Production provider.
- SEO.
- Security.
- Performance.
- Accessibility.
- Browser compatibility.
- Production monitoring.

## Milestone 10: Travel Platform Expansion

- Hotels.
- Car hire.
- Activities.
- eSIMs.
- Travel essentials.
- Packages.
- Trains.

## Product Principle

Every feature should improve user trust, user experience, conversion, long-term scalability, or revenue. If it does not, question whether it belongs in Farely.

## AI Principle

Farely should answer "Where should I go?" The AI should become the product, not just another feature.

## AI Planner Roadmap

- Build toward Milestone 7.
- Clarify the planner's main job: inspiration, itinerary planning, or trip refinement.
- Improve prompt handling around budget, destination style, dates, and constraints.
- Add better structured outputs for suggested trips.
- Connect planner suggestions more clearly to flight search results.
- Add guardrails so Farely does not overstate booking, payment, or travel-agent responsibilities.

## Flight Search Roadmap

- Build toward Milestone 6.
- Keep exact-date search stable.
- Keep Cheapest Month search stable.
- Improve outbound and return flight detail clarity.
- Continue improving airline logos, layover details, and result ranking.
- Add practical filters for budget, airline, time of day, stops, and airports.
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

- Build toward Milestone 8.
- Show simple health indicators for searches, provider errors, clicks, and popular routes.
- Show affiliate click totals and recent redirect issues.
- Show basic funnel metrics from search to result to `View Deal`.
- Keep dashboard private/admin-only.
- Avoid storing secrets or private user data in frontend code.

## Future Travel Expansion Roadmap

- Build toward Milestone 10.
- Hotels and accommodation comparison.
- Packages or trip bundles.
- Destination guides and SEO content.
- Travel insurance or airport transfer affiliate paths.
- Account features such as saved trips only after the core search and monetisation path is reliable.
