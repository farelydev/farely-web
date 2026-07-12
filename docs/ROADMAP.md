# Farely Roadmap

Last updated: 2026-07-12

## Current Phase

Milestone-led startup buildout. Current active phase: Milestone 6, Search Experience 2.0 provider-comparison polish.

Delivery workflow: every milestone must move through `Implemented`, `Deployed`, and `Verified`. Only `Verified` counts as complete.

## Next Product Milestones

1. Milestone 6: Search Experience 2.0 provider-comparison polish.
2. Milestone 7: Farely AI Travel Consultant.
3. Milestone 8: Founder Intelligence Dashboard / Farely Control Centre.
4. Milestone 9: Production Readiness.
5. Milestone 10: Travel Platform Expansion.

## Milestone 6: Search Experience 2.0

Security gate before further UX/traffic/SEO/affiliate work:

- Disable public production debug diagnostics: verified live.
- Restrict production CORS to `https://tryfarely.com` and `https://www.tryfarely.com`: verified live.
- Remove URL/localStorage analytics token handling: deployed; continue validating analytics access during founder-dashboard work.
- Add Express security headers and remove `X-Powered-By`: verified live.
- Current state: `Verified` on `https://tryfarely.com` at commit `0739d9b`.
- Keep founder/admin analytics out of the public app long term; move toward a private authenticated dashboard.

After the security gate, the agreed priority order is search reliability, Amadeus/API robustness, affiliate redirect tracking, revenue analytics, SEO landing pages, then UX polish.

Current API robustness action:

- Prepare graceful flexible-search errors before disabling demo fallback: deployed.
- Verify Render has applied `USE_DEMO_FALLBACK=false`, then rerun the API health monitor: completed on 2026-07-03.
- Move from Amadeus test credentials to production credentials only after fallback-off behavior is verified.

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
- Better CTA wording: implemented and now aligned with the configured partner where possible, for example `Book via Aviasales`.
- Booking-option comparison row: implemented, pushed, deployed, and live-verified so each fare shows the current tracked partner redirect as a clear booking option, without claiming unapproved multi-provider coverage.
- Multi-passenger price clarity: implemented, pushed, deployed, and live-verified so result cards show per-person pricing first, total price directly underneath, and the current configured partner CTA as `Book via Aviasales`.
- Top booking strip: implemented and locally verified so the current tracked partner option appears before long itinerary details, helping mobile users reach `Book via Aviasales` faster without inventing extra providers.
- Flexible partner-step wording: implemented and locally verified so Flexible dates shows the configured partner name after offers load, without claiming extra live providers.
- Flexible availability copy: implemented, pushed, deployed, and live-verified so successful live travel-day results do not show the broad `limited on the live site` warning; fallback and partial-day failures still show a provider-availability note.
- Flexible dates UX: product naming has been reverted from `Cheapest Month` to `Flexible dates`; the flow now explains that users choose a month and Farely compares the cheapest travel dates within that period.
- Mobile date picker clarity: selected departure and return dates stay visible below the native date inputs.
- Mobile filters drawer: scroll locking, sticky drawer header/actions, quick-filter overflow handling, and no horizontal overflow checks added.
- Copy audit: overpromising copy softened, including `Umrah packages` changed to `Plan Umrah trip`.
- Flexible provider failures: fallback-off path now returns clear rate-limit/provider-unavailable guidance instead of silently looking healthy.
- AI/search sync: first Milestone 7 handoff path now fills the existing search form for review before live search.

Goal: make Farely's search experience feel trustworthy, clear, and conversion-ready.

Milestone 6 completion gate: completed. The final-sprint polish was deployed, live-verified, and founder/Product-approved through a fresh `MVP Factory` ChatGPT project chat on 2026-07-05.

## Milestone 7: Farely AI Travel Consultant

- Better recommendation quality: first destination-personalisation pass implemented.
- Trip-type detection: first guided pass implemented for sunny, romantic, food, city, Europe, budget, trip length, and flexible-month intent.
- Umrah mode: core launch use case, first-pass prompt routing and questions implemented.
- Beach planner: first guided pass implemented through warm/beach ranking.
- City break planner: first guided pass implemented through city/romantic/food ranking.
- Ski planner: first pass implemented, pushed, deployed, and live-verified with Sofia, Geneva, and Innsbruck recommendation cards and existing Flexible dates handoff.
- Better follow-up questions: first guided pass asks the single most important missing question, defaulting origin to London when not specified.
- Better recommendation explanations: first pass implemented with match scores, category badges, price ranges, flight times, weather vibe, trip type, and a "Why these destinations?" summary.
- Better conversation memory: first follow-up correction pass verified live so users can update origin, timing, budget, or requested destination after recommendations and get re-ranked cards.
- Search handoff: first guided pass shows an interpreted intent summary, then fills the existing exact/flexible search form without starting a live search.
- Delivery state: first guided pass is `Verified` on `https://tryfarely.com` at deployment commit `8a77e7a`; follow-up correction memory pass is `Verified` on `https://tryfarely.com` at implementation commit `35c47fe`; ski-planner first pass is `Verified` on `https://tryfarely.com` at implementation commit `ad5664c`.

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
- SEO: first foundations patch pushed, deployed, and live-verified on 2026-07-08 with homepage metadata, canonical/social tags, `robots.txt`, and `sitemap.xml`; next SEO content should start with one cheap flexible flights explainer before route or destination pages.
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

- Build through Milestone 7.
- Clarify the planner's main job: inspiration, itinerary planning, or trip refinement.
- Improve prompt handling around budget, destination style, dates, and constraints: first guided pass implemented, deployed, and live-verified.
- Add better structured outputs for suggested trips: intent summary and richer cards implemented, deployed, and live-verified.
- Connect planner suggestions more clearly to flight search results: first search-form handoff implemented, deployed, and live-verified.
- Add trip-type-specific destination coverage: ski first pass implemented and live-verified for Sofia, Geneva, and Innsbruck; continue with broader coverage.
- Add guardrails so Farely does not overstate booking, payment, or travel-agent responsibilities.

## Flight Search Roadmap

- Build toward Milestone 6.
- Keep exact-date search stable.
- Keep Flexible dates search stable.
- Treat fallback-off provider failures as a visible degraded state, not a successful empty result.
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
- Move founder/admin analytics out of the public app and into a private dashboard with proper authentication.
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
