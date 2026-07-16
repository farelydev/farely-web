# Farely Provider Selection

Last updated: 2026-07-16

## Current Decision

Farely should prepare Kiwi.com as the first realistic second booking-provider candidate after the current Aviasales/Travelpayouts path.

This is a product and monetisation decision record, not a live integration. Farely must not show Kiwi.com as a live booking option until the founder has confirmed approval, tracking requirements, and the correct deep-link or redirect template.

## Why Kiwi.com First

- It is flight-focused, so it supports Milestone 6 provider comparison without moving Farely into hotels or packages too early.
- It fits Farely's current user promise around cheap, flexible, and complex flight options.
- Travelpayouts lists a Kiwi.com affiliate offer with flight ticket monetisation, which is closer to Farely's current affiliate architecture than a full enterprise API integration.
- It gives Farely a clearer second-provider story than only saying "more partners coming later."

## Why Not Trip.com First

Trip.com is useful later because it covers flights, hotels, trains, tours, and broader travel products. For the immediate Milestone 6 goal, it is a broader travel-commerce partner rather than the cleanest first flight-comparison partner.

## Why Not Expedia First

Expedia Group is strong for hotels, packages, and larger travel-platform expansion. Its Rapid API path is more enterprise-style and requires becoming an Expedia partner, so it is better suited to Milestone 10 or a future hotel/package path than the first small second-provider flight option.

## Implementation Rule

Do not add a visible Kiwi.com comparison row yet.

Codex has added a hidden provider-aware redirect foundation in `server.js` at implementation commit `06c0d53`. This does not make Kiwi.com live. The current default remains Aviasales/Travelpayouts, and disabled or unconfigured provider requests fall back to the primary path.

The next safe implementation should only happen after the founder confirms:

- Kiwi.com affiliate approval is active.
- The correct approved deep-link or redirect template is available.
- Farely can track clicks with route, dates, cabin, currency, price, trip type, sort, and result rank.
- The UI copy can honestly say `Book via Kiwi.com` without implying Farely has compared a separate live Kiwi fare price.

## Safe Engineering Next Step

After approval, add the approved Kiwi.com redirect/deep-link template to the existing server-controlled provider config, verify tracking internally, then show a disabled/internal-only comparison row until live click tracking and redirect behavior are verified.

## Sources Checked

- Travelpayouts Kiwi.com offer: https://www.travelpayouts.com/en/offers/kiwi-affiliate-program
- Kiwi.com affiliate/program context: https://media.kiwi.com/articles-and-interviews/better-for-business-kiwi-com-takes-a-new-approach-to-partnerships/
- Travelpayouts Aviasales affiliate tools: https://support.travelpayouts.com/hc/en-us/articles/203955643-Affiliate-tools-for-Aviasales-program
- Travelpayouts API/data-feed access overview: https://support.travelpayouts.com/hc/en-us/articles/20384016664594-Brands-that-provide-access-to-APIs-and-data-feeds-for-Travelpayouts-partners
- Trip.com partner programme: https://www.trip.com/partners
- Expedia Group Rapid API: https://partner.expediagroup.com/en-us/solutions/build-your-travel-experience/rapid-api
