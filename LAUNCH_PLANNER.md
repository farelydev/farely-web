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

## Best Next Move

Deploy Farely to Render and get the live URL.

Once the live URL exists, use it for the Travelpayouts application.
