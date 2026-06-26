# Farely Launch Planner

## Current Announcement

Farely is now in pre-launch mode.

The core flight-search MVP is working, the Amadeus backend has been diagnosed, affiliate disclosure pages are in place, and the project is ready for a first live deployment so Travelpayouts can review the website.

## Ticked Off

- [x] Main Farely homepage built
- [x] Flight search form working
- [x] Exact-date search connected to `/api/flights`
- [x] Flexible-date search connected to `/api/flexible`
- [x] `/api/health` endpoint available
- [x] `/api/debug/amadeus` endpoint added
- [x] Amadeus credentials are checked safely without exposing secrets
- [x] Amadeus errors are clearer for missing credentials, bad codes, bad dates, auth issues, no results, rate limits, and test limitations
- [x] Demo fallback warnings preserved
- [x] AI planner bar started with rule-based parsing
- [x] Umrah chip flow preserved
- [x] Planner modal preserved
- [x] Multi-city planner UI preserved
- [x] View Deal redirect route added
- [x] Deal-click analytics added
- [x] Analytics dashboard protected from normal visitors
- [x] Affiliate disclosure added near deal links
- [x] Footer legal links added
- [x] Affiliate Disclosure page added
- [x] Privacy Policy page added
- [x] Terms of Use page added
- [x] Render deployment config added
- [x] Deployment guide added

## Next Ticks

- [ ] Review the AI trip planner architecture in `AI_TRIP_PLANNER_ARCHITECTURE.md`
- [ ] Decouple the AI planner from flight-search form state
- [ ] Replace first-message autofill with conversational follow-up questions
- [ ] Add destination recommendations before search-form handoff
- [ ] Push the project to GitHub
- [ ] Connect the GitHub repo to Render
- [ ] Add production environment variables in Render
- [ ] Deploy Farely and get the live URL
- [ ] Test the live homepage
- [ ] Test live `/api/health`
- [ ] Test live `/api/debug/amadeus`
- [ ] Test live legal pages:
  - `/affiliate-disclosure`
  - `/privacy`
  - `/terms`
- [ ] Add the live URL to Travelpayouts
- [ ] Wait for Travelpayouts approval
- [ ] Add `TRAVELPAYOUTS_MARKER` to Render
- [ ] Test Search → View Deal → partner site
- [ ] Confirm deal click appears in private analytics

## Launch Message

Farely is ready for its first live deployment.

This version is not the finished product, but it is strong enough for partner review:

- users can search for flights
- provider issues are handled safely
- affiliate disclosure is visible
- privacy and terms pages are available
- deal clicks can be tracked privately
- the site can be deployed to a public Render URL

## What Not To Do Yet

- [ ] Do not buy ads yet
- [ ] Do not promise guaranteed prices
- [ ] Do not hide demo fallback results
- [ ] Do not add payment collection yet
- [ ] Do not share the private analytics token
- [ ] Do not let AI planner prompts silently choose destinations, dates, or booking routes without user confirmation

## Best Next Move

Review the AI trip planner architecture, then implement the Phase 1 planner/search decoupling before adding smarter AI features.

This protects the core Farely product vision: traditional flight search for users who know what they want, and Farely AI for users who need help deciding where to go.
