# Farely Changelog

This changelog tracks completed Farely milestones and whether they were pushed to GitHub.

## 2026-07-17

- Commit hash: `eb6f1a2`.
- What changed:
  - Added a clear `Show all offers` action when active result filters remove every fare.
  - Kept the existing result-filter logic, flight search APIs, and server-controlled booking redirects unchanged.
  - Extended the hourly browser audit to prove travellers can recover from a no-match filter state.
- Checks run:
  - `npm run build` passed on 2026-07-17.
  - `npm run lint` passed on 2026-07-17 with 1 pre-existing warning in `src/components/LegalPage.jsx`.
  - Local hourly browser audit passed for the exact-date result flow and filter recovery path on `http://127.0.0.1:4017/`.
  - Targeted live production-bundle UI check passed on `https://tryfarely.com` using a controlled `/api/flights` response: the no-match filter state rendered `Show all offers`, reset filters, restored result cards, produced no console warnings/errors, and had no horizontal overflow.
  - Full local `npm run audit:hourly` also ran the production API contract and failed locally only because this laptop server reports `demoFallbackEnabled:true`; live production audit still needs to run after push.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-17.
- Deployment/live verification:
  - Partially verified on `https://tryfarely.com` on 2026-07-17. The live page served `assets/index-CLsCnw_Z.js`, the production API contract passed, and the deployed filter recovery UI passed with a controlled flight response. Full live exact-date provider verification was blocked because `/api/flights` returned Amadeus test-environment `500` responses across checked routes.

## 2026-07-16

- Commit hash: `06c0d53`.
- What changed:
  - Added a hidden provider-aware foundation to `/api/deals/flight`.
  - The current visible/default booking path remains Aviasales/Travelpayouts.
  - Future approved providers can be resolved by server config, while disabled or unconfigured provider requests fall back to the primary path.
  - Click metadata now records the resolved provider and any requested provider, which will help validate future second-provider testing.
  - Fixed the Playwright API contract hook so the audit suite runs under the current Playwright fixture rules.
- Checks run:
  - `npm run build` passed on 2026-07-16.
  - `npm run lint` passed on 2026-07-16 with 1 pre-existing warning in `src/components/LegalPage.jsx`.
  - `npm run audit:hourly` passed on 2026-07-16.
  - Local `/api/deals/flight` smoke checks passed: explicit `provider=travelpayouts` and disabled `provider=kiwi` requests both returned tracked `302` Aviasales redirects.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-16.
- Deployment/live verification:
  - Verified on `https://tryfarely.com` on 2026-07-16. Live `/api/health` reported `demoFallbackEnabled:false` with Travelpayouts configured; live `/api/deals/flight?provider=travelpayouts` returned a tracked `302` to Aviasales; post-push `npm run audit:hourly` passed.

- Commit hash: `0610d45` for the audit-suite implementation commit.
- What changed:
  - Added the first automated live Farely QA audit suite using Playwright.
  - Added production hourly and full audit scripts for API health, autocomplete, exact-date search, flexible-date search, one-way/mobile search, sorting, filters, booking CTA, console/network monitoring, and failure traces/screenshots.
  - Added rotating/future-date test data so audit dates do not expire.
  - Saved the first baseline audit report at `audits/2026-07-16-live-farely-baseline-audit.md`.
  - Kept live audit traffic deliberately limited after an earlier parallel run showed Amadeus/provider 429 sensitivity.
- Checks run:
  - `npm run audit:hourly` passed on 2026-07-16.
  - `npm run audit:full` passed on 2026-07-16: 8 passed, 2 duplicate mobile API checks intentionally skipped.
  - `npm run build` passed on 2026-07-16.
  - `npm run lint` passed on 2026-07-16 with 1 pre-existing warning in `src/components/LegalPage.jsx`.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-16.
- Deployment/live verification:
  - Not a production product change. The suite tested live `https://tryfarely.com` successfully.

- Commit hash: `50c2db8`.
- What changed:
  - Actioned the Milestone 6 second-provider decision without adding fake provider choices.
  - Documented Kiwi.com as the first realistic second-provider candidate after the current Aviasales/Travelpayouts path.
  - Added `docs/PROVIDER_SELECTION.md` with the decision, rationale, implementation guardrails, and current source links.
  - Kept the visible product unchanged until affiliate approval, tracking requirements, and the approved redirect/deep-link template are confirmed.
- Checks run:
  - Docs-only change; no production build required.
- Pushed to GitHub:
  - Pending final docs hash commit and push.
- Deployment/live verification:
  - Not applicable. No runtime product behavior changed.

## 2026-07-15

- Implementation commit hash: `f6fecd2`.
- What changed:
  - Improved Milestone 6 filter reliability for route changes.
  - Results now remount the filter state when the actual search context changes, including route, dates, selected Flexible date, trip type, cabin, or passenger count.
  - This prevents an old airline/airport/budget filter from silently hiding valid fares after the traveller changes route or search details.
- Checks run:
  - `npm run build` passed on 2026-07-15.
  - `npm run lint` passed on 2026-07-15 with 1 pre-existing warning in `src/components/LegalPage.jsx`.
  - Local API smoke on `http://127.0.0.1:4015/api/flights` returned 25 Amadeus LON -> DXB offers with `dealPartnerName:"Aviasales"`.
  - Local in-app Browser QA passed on `http://127.0.0.1:4015/`: after filtering LON -> DOH by `London Stansted (STN)`, changing the destination to Dubai reset `Filters (1)` back to `Filters`; the LON -> DXB result set then rendered 12 cards, 12 top booking strips, and no console warnings/errors.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-15.
- Deployment/live verification:
  - Verified on `https://tryfarely.com` on 2026-07-15. The live page served `assets/index-3otPvE22.js`; `/api/health` reported `demoFallbackEnabled:false`; live `/api/flights` for LON -> DXB returned 25 Amadeus offers with `dealPartnerName:"Aviasales"`; live Browser QA confirmed a stale LON -> DOH `London Stansted (STN)` filter reset from `Filters (1)` to `Filters` after changing destination to Dubai, then rendered 12 LON -> DXB result cards, 12 top booking strips, `Book via Aviasales`, and no page console warnings/errors.

## 2026-07-14

- Implementation commit hash: `49fb620`.
- What changed:
  - Improved Milestone 6 airline display and filtering for multi-carrier offers.
  - Result cards now collect all carrier codes from every itinerary segment plus validating airlines, so offers can show combinations such as `AZ / Lufthansa` instead of only the first carrier.
  - The airline filter now includes secondary carriers from visible offers and keeps matching multi-carrier offers visible when filtering, instead of only matching the first outbound carrier.
- Checks run:
  - `npm run build` passed on 2026-07-14.
  - `npm run lint` passed on 2026-07-14 with 1 pre-existing warning in `src/components/LegalPage.jsx`.
  - Local API smoke on `http://127.0.0.1:4014/api/flights` found LHR -> DXB live Amadeus offers with `AZ` and `LH` carrier segments on the default dates.
  - Local in-app Browser QA passed on `http://127.0.0.1:4014/`: LHR -> DXB rendered 12 result cards, showed `AZ / Lufthansa`, rendered two airline logo badges on multi-carrier cards, kept `Book via Aviasales`, exposed `Lufthansa (LH)` in the airline filter, and filtering by `LH` showed 8 of 12 offers.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-14.
- Deployment/live verification:
  - Verified on `https://tryfarely.com` on 2026-07-14. The live page served `assets/index-V_jUzpOJ.js`; `/api/health` reported `demoFallbackEnabled:false`; live `/api/flights` for LHR -> DXB returned Amadeus offers with `AZ` and `LH` carrier segments; live Browser QA rendered 12 result cards with `AZ / Lufthansa`, two airline logo badges on multi-carrier cards, `Book via Aviasales`, `Lufthansa (LH)` in the airline filter, and 8 of 12 offers after filtering by `LH`; `/api/deals/flight` returned a tracked `302` to Aviasales.

## 2026-07-12

- Implementation commit hash: `a6a7bff`.
- What changed:
  - Added a compact top booking strip to each result card.
  - The strip shows the current tracked partner option, for example `Book via Aviasales`, before the long outbound/return itinerary details.
  - The new CTA reuses the existing server-controlled `/api/deals/flight` redirect URL and does not add fake provider choices.
- Checks run:
  - `npm run build` passed on 2026-07-12.
  - `npm run lint` passed on 2026-07-12 with 1 pre-existing warning in `src/components/LegalPage.jsx`.
  - Local API smoke passed on `http://127.0.0.1:4012/api/flights`: LHR -> IST returned 5 live Amadeus offers with `dealPartnerName:"Aviasales"` and deal URLs.
  - Local in-app Browser QA passed on `http://127.0.0.1:4012/`: exact-date London -> Doha rendered 12 top booking strips, 12 lower `Book via Aviasales` CTAs, tracked `/api/deals/flight` hrefs, no 390px horizontal overflow, and no console warnings/errors.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-12.
- Deployment/live verification:
  - Verified on `https://tryfarely.com` on 2026-07-12. The live page served `assets/index-D69txwfL.js`; `/api/health` reported `demoFallbackEnabled:false`; live exact-date Browser QA rendered 12 top booking strips and 12 lower `Book via Aviasales` CTAs with tracked `/api/deals/flight` hrefs; 390px mobile live QA had no horizontal overflow and no console warnings/errors; the live `/api/deals/flight` URL returned a tracked `302` to Aviasales.

## 2026-07-11

- Commit hash: `648f843`.
- What changed:
  - Tightened Milestone 6 Flexible dates availability copy.
  - Successful `/api/flexible` responses now return `warning:null` unless fallback data or partial day failures actually occur.
  - The Flexible dates UI no longer creates a default warning message after successful results load.
  - The pre-search Flexible dates hint now says to confirm the final fare on the partner site.
- Checks run:
  - `npm run build` passed on 2026-07-11.
  - `npm run lint` passed on 2026-07-11 with 1 pre-existing warning in `src/components/LegalPage.jsx`.
  - Local API smoke passed on `http://localhost:4000/api/flexible`: LON -> DOH in August 2026 returned `source:"amadeus"`, `warning:null`, 3 travel days, 25 best-day offers, and 0 failed/fallback days.
  - Local Browser QA passed on `http://127.0.0.1:4000/`: Flexible dates rendered travel-day results, 12 booking options, `Book via Aviasales`, no false default warning, no broad limited-warning copy, and no console warnings/errors.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-11.
- Deployment/live verification:
  - Verified on `https://tryfarely.com` on 2026-07-11. The live page served `assets/index-BzhpUOY8.js`; `/api/health` reported `demoFallbackEnabled:false`; live `/api/flexible` returned Amadeus LON -> DOH travel-day data with `warning:null`, 3 successful days, 25 best-day offers, and 0 failed/fallback days; live Browser QA rendered 12 offers, 12 booking options, `Book via Aviasales`, no false default warning, no broad limited-warning copy, and no console warnings/errors; an offer-generated `/api/deals/flight` URL returned a tracked `302` to Aviasales.

## 2026-07-10

- Commit hash: `d664231`.
- What changed:
  - Improved Milestone 6 partner-path wording in the Flexible dates results flow.
  - The final Flexible dates workflow step now uses the configured booking partner name after live offers load, for example `Book via Aviasales`.
  - The fallback remains generic before offers exist, so Farely does not claim a provider before real offer data is available.
- Checks run:
  - `npm run build` passed on 2026-07-10 using `PATH=/Users/inspectorcalls/.nvm/versions/node/v20.20.0/bin:$PATH`.
  - `npm run lint` passed on 2026-07-10 with 1 pre-existing warning in `src/components/LegalPage.jsx`.
  - Live API pre-check passed on 2026-07-10: `https://tryfarely.com/api/health` reported `demoFallbackEnabled:false`; `/api/flexible` returned live Amadeus LHR -> IST travel days; and `/api/deals/flight` returned a tracked `302` Aviasales redirect for a real `GET` request.
  - Local in-app Browser QA passed on 2026-07-10 against `http://127.0.0.1:5173/`: exact-date London -> Doha rendered 12 result cards with `Book via Aviasales`, and Flexible dates rendered enabled travel-day buttons, 12 result cards, and workflow text `Book via Aviasales` with no console warnings/errors.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-10.
- Deployment/live verification:
  - Verified on `https://tryfarely.com` on 2026-07-10. The live page served `assets/index-45zrJkL9.js`; Flexible dates rendered enabled London -> Doha travel-day buttons, 12 result cards, and workflow text `Book via Aviasales` with no console warnings/errors.

## 2026-07-09

- Commit hash: `426b16d`.
- What changed:
  - Fixed urgent result-card price clarity for multi-passenger searches.
  - Result cards now lead with the per-person fare and show the total immediately underneath, for example `£216 per person / £649 total for 3 passengers`.
  - Booking rows and CTAs now use the configured partner name, so the current route says `Book via Aviasales` instead of implying a generic multi-partner booking path.
  - Added clear trust copy: prices are estimated live fares, final fare is confirmed on the partner site, and Farely may earn commission at no extra cost to the user.
  - Kept future partner expansion honest: Kiwi, Trip.com, WayAway, Expedia, and additional Travelpayouts partners are mentioned only as future approved/configured partners, not live price options.
- Checks run:
  - `npm run build` passed on 2026-07-09 using `PATH=/Users/inspectorcalls/.nvm/versions/node/v20.20.0/bin:$PATH`.
  - `npm run lint` passed on 2026-07-09 with 1 pre-existing warning in `src/components/LegalPage.jsx`.
  - Local API smoke passed on 2026-07-09 against `http://localhost:4010/api/flights` for a 3-passenger LHR -> IST return search: response included total GBP price and `dealPartnerName:"Aviasales"`.
  - Local in-app Browser QA passed on 2026-07-09 against `http://127.0.0.1:4010/`: a 3-passenger exact-date search rendered result cards showing `Price per person`, total price for 3 passengers, `Book via Aviasales`, and the new trust/commission copy.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-09.
- Deployment/live verification:
  - Verified on `https://tryfarely.com` on 2026-07-09. The live page served `assets/index-Oq1Z0OPr.js`; the bundle contained `Price per person`, final-fare trust copy, and commission disclosure copy; live `/api/flights` returned `dealPartnerName:"Aviasales"` for a 3-passenger LHR -> IST return search; `/api/deals/flight` returned a tracked `302` to Aviasales; and live in-app Browser QA rendered a 3-passenger exact-date card with `Price per person`, total price for 3 passengers, `Book via Aviasales`, and no console warnings/errors.

- Commit hash: `96c8248`.
- What changed:
  - Added a small Milestone 6 provider-comparison polish pass to result cards.
  - Each flight offer now shows a `Booking option` row for the current tracked partner redirect, including source, price, and a reminder to confirm the final fare on the partner site.
  - The copy stays honest: it makes room for future provider choices but does not claim multiple approved live partners yet.
- Checks run:
  - `npm run build` passed on 2026-07-09 using `PATH=/Users/inspectorcalls/.nvm/versions/node/v20.20.0/bin:$PATH`.
  - `npm run lint` passed on 2026-07-09 with 1 pre-existing warning in `src/components/LegalPage.jsx`.
  - Local in-app Browser QA passed on 2026-07-09 against `http://127.0.0.1:4173/`: LHR -> IST exact-date search rendered 12 result cards, 12 `Check partner deal` CTAs, and 12 booking-option rows with no console warnings/errors.
  - Local 390px mobile QA passed on 2026-07-09: the booking-option row and partner CTA stacked cleanly with no horizontal overflow.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-09.
- Deployment/live verification:
  - Verified on `https://tryfarely.com` on 2026-07-09. The live page served `assets/index-DhQawLBs.js`; the bundle contained `Booking option`, `Partner site via Farely`, and `More provider choices`; live LHR -> IST rendered 12 result cards, 12 `Check partner deal` CTAs, and 12 booking-option rows with no console warnings/errors; `/api/health` reported fallback off; exact-date `/api/flights` returned Amadeus fares; `/api/flexible` returned Amadeus flexible-day data; and `/api/deals/flight` returned a tracked `302`.

## 2026-07-08

- Commit hash: `266890a`
- What changed:
  - Added the approved SEO foundations patch.
  - Replaced the default Vite title/favicon reference with Farely-specific title, description, canonical, social preview, and brand favicon metadata.
  - Added a real `robots.txt` and `sitemap.xml` so search engines do not receive the app shell for those SEO files.
  - Added lightweight dynamic metadata for legal and support pages after the React app loads.
- Checks run:
  - `npm run build` passed on 2026-07-08 using `PATH=/Users/inspectorcalls/.nvm/versions/node/v20.20.0/bin:$PATH`.
  - `npm run lint` passed on 2026-07-08 with 1 pre-existing warning in `src/components/LegalPage.jsx`.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-08.
- Deployment/live verification:
  - Verified on `https://tryfarely.com` on 2026-07-08. The live homepage served the new title `Farely | AI flight search and cheap flexible flights` and bundle `assets/index-D-oTNT_f.js`; `/robots.txt` returned `text/plain` with the sitemap directive; `/sitemap.xml` returned `application/xml` with the expected public URLs.

## 2026-07-08

- Commit hash: `ad5664c`
- What changed:
  - Improved the Milestone 7 ski planner path.
  - Added Sofia, Geneva, and Innsbruck as ski-relevant AI recommendation cards.
  - Added supported local airport mappings for `SOF`, `GVA`, and `INN` so `Find flights` can fill the existing search form.
  - Tightened ski prompt ranking so ski prompts show ski-relevant cards instead of beach alternatives.
- Checks run:
  - `npm run build` passed on 2026-07-08 using `PATH=/Users/inspectorcalls/.nvm/versions/node/v20.20.0/bin:$PATH`.
  - `npm run lint` passed on 2026-07-08 with 1 pre-existing warning in `src/components/LegalPage.jsx`.
  - In-app Browser local QA passed on 2026-07-08: `4 nights ski trip in January under £300` returned Sofia, Geneva, and Innsbruck recommendation cards, logged no console warnings/errors, and selecting Sofia filled London -> Sofia in Flexible dates for January 2027 without starting live search.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-08.
- Deployment/live verification:
  - Verified on `https://tryfarely.com` on 2026-07-08. The live page served `assets/index-B3-SoQkm.js`; `4 nights ski trip in January under £300` returned Sofia, Geneva, and Innsbruck recommendation cards; selecting Sofia filled London -> Sofia in Flexible dates for January 2027 without starting live search; `/api/health` reported fallback off; exact-date `/api/flights` and `/api/flexible` returned live Amadeus Sofia data; and `/api/deals/flight` returned a tracked `302`.

## 2026-07-07

- Commit hash: `35c47fe`
- What changed:
  - Improved Milestone 7 conversation memory in the AI planner.
  - The planner now merges natural follow-up corrections after recommendations appear, including origin, timing/month, budget, trip length, trip style, and requested destination.
  - A correction such as `Actually from Manchester and I want Bosnia in November under £300` now updates the interpreted trip summary and re-ranks Bosnia first instead of keeping the old recommendation context.
- Checks run:
  - `npm run build` passed on 2026-07-07 using `PATH=/Users/inspectorcalls/.nvm/versions/node/v20.20.0/bin:$PATH`.
  - `npm run lint` passed on 2026-07-07 with 1 pre-existing warning in `src/components/LegalPage.jsx`.
  - In-app Browser desktop QA passed on 2026-07-07: `3 nights somewhere romantic under £250 flights` -> `August 2026` -> `Actually from Manchester and I want Bosnia in November under £300` updated the summary to `From Manchester`, `november 2026`, `3 nights`, `Under £300`, moved Bosnia first, and logged no console warnings/errors.
  - In-app Browser 390px mobile QA passed on 2026-07-07 with the same correction flow, no horizontal overflow, and no console warnings/errors.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-07.
- Deployment/live verification:
  - Verified on `https://tryfarely.com` on 2026-07-07. The live page served `assets/index-D7hUWsZ2.js`, the correction flow updated the summary to `From Manchester`, `november 2026`, `3 nights`, `Under £300`, Bosnia ranked first, and no console warnings/errors were logged.
  - Live `/api/health` reported `demoFallbackEnabled:false`; exact-date `/api/flights` returned live Amadeus offers; `/api/flexible` returned live Amadeus cheapest-day data; `/api/deals/flight` returned a tracked `302`.

## 2026-07-05

- Commit hash: `783a841`
- What changed:
  - Sent the withheld Farely handoff to ChatGPT through a fresh `MVP Factory` project chat, avoiding the slow old `Farely Product Strategy` thread.
  - ChatGPT/Product approved Milestone 6 as complete and directed Codex to begin Milestone 7: Farely AI Travel Consultant.
  - Improved the AI planner so natural prompts can infer London as the default origin, parse month/timing, budget, trip length, romantic/food/city/sunny intent, and ask one missing follow-up instead of a long sequence.
  - Added Lisbon and Rome-style romantic/city recommendations and added Lisbon to the local airport lookup so AI suggestions can fill the real search form.
  - Added an interpreted trip-intent summary before destination cards and preserved the existing review-before-live-search handoff.
- Checks run:
  - `npm run build` passed on 2026-07-05 using `PATH=/Users/inspectorcalls/.nvm/versions/node/v20.20.0/bin:$PATH`.
  - `npm run lint` passed on 2026-07-05 with 1 pre-existing warning in `src/components/LegalPage.jsx`.
  - Local Chrome QA passed on 2026-07-05: `cheap sunny weekend in Europe in August under £250 flights` asked only for nights, returned 4 destination cards, showed `From London`, `august 2026`, `3 nights`, `Under £250`, and `Find flights` filled London -> Lisbon without starting a live search.
  - Local 390px in-app Browser QA passed on 2026-07-05: `3 nights somewhere romantic under £250 flights` asked only for timing, returned 4 destination cards, showed no horizontal overflow, and logged no console warnings/errors.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` after adding a dedicated Farely Codex SSH key to GitHub.
  - Render auto-deployed commit `8a77e7a` and marked it live.
  - Live verification passed on 2026-07-05: `/api/health` reported fallback off, exact-date `/api/flights` returned live Amadeus return offers, `/api/flexible` returned live Amadeus flexible-day data, `/api/deals/flight` returned a tracked `302`, and the live planner prompt `3 nights somewhere romantic under £250 flights` filled London -> Lisbon after returning recommendation cards.
  - GitHub `main` now has classic branch protection enabled, with force pushes and branch deletion blocked.

## 2026-07-03

- Commit hash: `c882fd3`
- What changed:
  - Reverted the flexible-search product name from `Cheapest Month` to `Flexible dates` across the main search tab, menu, AI chip, planner title, summary copy, and results header.
  - Removed old feature-name wording from the visible flexible-date flow and added the clearer explanation: users choose a month and Farely compares the cheapest travel dates within that period.
  - Polished dark mode contrast for inactive tabs, section headings, input fields, flexible-date cards, result controls, filters, and active states without changing search functionality.
- Checks run:
  - `npm run build` passed on 2026-07-03 using `PATH=/Users/inspectorcalls/.nvm/versions/node/v20.20.0/bin:$PATH`.
  - `npm run lint` passed on 2026-07-03 with 1 pre-existing warning in `src/components/LegalPage.jsx`.
  - Local Playwright QA passed in forced dark mode on 2026-07-03 using system Chrome after the in-app Browser was unavailable: desktop 1440px and mobile 390px both showed `Flexible dates`, the new explanation copy, no visible `Cheapest Month`/`Cheapest month`/`beta` wording, no console warnings/errors, and no horizontal overflow.
  - Live verification passed on 2026-07-03: `https://tryfarely.com` served bundle `assets/index-CoO0sF0V.js`, the bundle contained `Flexible dates` and `Lowest guide price`, and a 390px dark-mode rendered smoke check showed the correct Flexible dates copy with no old feature-name/beta wording, no console warnings/errors, and no horizontal overflow.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` after the follow-up docs status update.

## 2026-07-03

- Commit hash: `2b1c86e`
- What changed:
  - Polished the Milestone 6 Cheapest Month flow so the user path is clearly `Choose month -> Choose travel day -> Compare flights -> Check partner deal`.
  - Changed flexible-search copy from stronger price claims to safer guide-price and partner-check wording.
  - Added selected departure/return date summary chips under the native exact-date inputs for better mobile context.
  - Improved the mobile Filters drawer with scroll locking, Escape-to-close behavior, sticky header/actions, quick-filter overflow handling, and no-horizontal-overflow safeguards.
  - Tightened mobile spacing for result titles, date cards, flight cards, airline metadata, badges, leg details, and CTA layout.
  - Replaced overpromising public copy including `Umrah packages` -> `Plan Umrah trip` and softened the hero subtitle.
- Checks run:
  - `npm run build` passed on 2026-07-03 using the local nvm Node path.
  - `npm run lint` passed with 1 pre-existing warning in `src/components/LegalPage.jsx` on 2026-07-03.
  - Local browser QA passed for desktop and mobile Search Experience checks, including Cheapest Month date selection and Filters drawer behavior.
  - Live bundle verification passed on 2026-07-03: `https://tryfarely.com` served the new frontend asset containing `Plan Umrah trip`, `Show travel days`, `Guide price from`, and `Check partner deal`.
  - Live API smoke checks passed on 2026-07-03: `/api/health` reported `demoFallbackEnabled:false`, exact-date `/api/flights` returned Amadeus `isDemo:false` offers, `/api/flexible` returned Amadeus cheapest-day results, and `/api/deals/flight` returned a tracked `302` redirect.
  - Live mobile browser render check passed at 390px with no console warnings/errors and no horizontal overflow.
- Pushed to GitHub:
  - Yes. Implementation commit `2b1c86e`; latest pushed docs/handoff commit before live verification was `c10ff5f`.

## 2026-07-03

- Commit hash: `c83a05c`
- What changed:
  - Improved the Farely AI planner so requested destinations matter in the recommendation order.
  - Added Bosnia/Sarajevo as a recognised planner/search destination.
  - Added a short analysing state with `Analysing destinations...`, `Checking budget fit...`, and `Comparing flexible options...`.
  - Upgraded planner recommendation cards with destination imagery, match scores, category badges, estimated price ranges, flight time, weather vibe, trip type, and concise fit explanations.
  - Added a `Why these destinations?` summary.
  - Changed the recommendation CTA to `Find flights` and preserved the review/edit step before live search.
- Checks run:
  - `node --check server.js` passed on 2026-07-03.
  - `npm run build` passed on 2026-07-03.
  - `npm run lint` passed with 1 pre-existing warning in `src/components/LegalPage.jsx` on 2026-07-03.
  - Local Chrome QA passed for a Bosnia under-£300 prompt.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-03.

## 2026-07-03

- Commit hash: `a5f251c`
- What changed:
  - Set `USE_DEMO_FALLBACK=false` in the Render dashboard for the live `farely-web` service.
  - Verified the live API now reports `demoFallbackEnabled:false`.
  - Verified exact-date search and flexible-month search still return live Amadeus results with fallback off.
  - Verified `View Deal` still returns a tracked partner redirect.
- Checks run:
  - Live `/api/health` probe passed.
  - Live `/api/flights` probe passed for `LHR` to `IST` on `2026-09-10`.
  - Live `/api/flexible` probe passed for `LHR` to `IST` in `2026-09`.
  - Live `/api/deals/flight` redirect probe returned `302`.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-03.

## 2026-07-03

- Commit hash: `0739d9b`
- What changed:
  - Pushed the security hardening, guided Cheapest Month UX, fallback-off flexible-search handling, and ChatGPT handoff workflow to GitHub `main`.
  - Verified the deployment on `https://tryfarely.com`.
  - Confirmed the live site serves the new frontend bundle with `Choose your departure date`, `Tap to compare flights`, and `Book with partner`.
  - Confirmed `/api/debug/amadeus` returns `404`, bad-origin CORS is not reflected, Helmet security headers are present, exact-date and flexible searches return live Amadeus results, and `/api/deals/flight` still returns a tracked `302` partner redirect.
- Checks run:
  - GitHub SSH authentication passed.
  - `git push origin main` succeeded.
  - Live production HTTP/API probes passed on 2026-07-03.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.

## 2026-07-03

- Commit hash: `844bbe1`
- What changed:
  - Changed the Render blueprint default for `USE_DEMO_FALLBACK` from `true` to `false`.
  - Updated deployment and project docs so fallback-off provider verification is the next required check.
- Checks run:
  - `git diff --check` passed on 2026-07-03.
  - `npm run build` could not run on this Mac because the local `/usr/local/bin/node` binary failed with a macOS `dyld` libc++ symbol error.
- Pushed to GitHub:
  - Yes, pushed to GitHub `main` on 2026-07-03.

## 2026-07-03

- Commit hash: `0f24a42`
- What changed:
  - Redesigned the Flexible Search / Cheapest Month results journey as a guided workflow.
  - Added progress copy for choose month, choose travel day, compare flights, and book with partner.
  - Added a clear `Choose your departure date` step before flight-comparison controls appear.
  - Changed flexible date-card action text to `Tap to compare flights`.
  - Hid Cheapest/Fastest/Best tabs and Filters until a flexible date is selected, then revealed the comparison section with a subtle animation.
- Checks run:
  - `npm run build` passed on 2026-07-03.
- Pushed to GitHub:
  - Yes, included in `origin/main`.

## 2026-07-03

- Commit hash: `7878c7a`
- What changed:
  - Added a clear fallback-off failure path for `/api/flexible`.
  - When demo fallback is disabled and every scanned flexible date fails, the backend now returns `429` for rate limits or `503` for provider unavailable instead of a normal-looking `200` response with no useful fares.
  - Added frontend handling for the new `amadeus-unavailable` response so users see plain-English guidance to narrow the date range, use Exact Dates, or retry shortly.
  - Updated the search card warning area so flexible-search live status messages can be shown before result cards.
- Checks run:
  - `node --check server.js` passed on 2026-07-03.
  - `npm run build` passed on 2026-07-03.
  - `npm run lint` passed with 1 pre-existing warning in `src/components/LegalPage.jsx` on 2026-07-03.
  - `npm install` audit output reported 0 vulnerabilities on 2026-07-03.
  - Local fallback-disabled probe passed: with `USE_DEMO_FALLBACK=false` and dummy Amadeus credentials, `/api/flexible` returned `503 Service Unavailable`, `source: "amadeus-unavailable"`, and a user-friendly Exact Dates retry message.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.

## 2026-07-03

- Commit hash: `8fe39a7`
- What changed:
  - Added Express security hardening with Helmet, a CSP, referrer policy, content-type hardening, frame protection, permissions policy, and disabled `X-Powered-By`.
  - Restricted production CORS to `https://tryfarely.com` and `https://www.tryfarely.com`.
  - Disabled `/api/debug/amadeus` in production so public visitors cannot see Amadeus credential/config status or trigger the diagnostic test call.
  - Removed analytics admin-token support from URL query parameters.
  - Stopped storing analytics admin tokens in `localStorage`; analytics unlock now uses in-memory state only.
  - Added `helmet` and updated vulnerable production dependencies through `npm audit fix`.
- Checks run:
  - `npm run build` passed on 2026-07-03.
  - `npm run lint` passed with 1 pre-existing warning in `src/components/LegalPage.jsx` on 2026-07-03.
  - `npm audit --omit=dev` passed with 0 vulnerabilities on 2026-07-03.
  - Local production-mode API/header probes passed on 2026-07-03.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.

## 2026-06-29

- Commit hash: `494c2f0`
- What changed:
  - Reframed flexible search as `Cheapest Month` in the main search navigation.
  - Removed beta/warning-heavy flexible-search language from the user-facing flow.
  - Added positive guidance around finding cheaper travel dates.
  - Added a simple flow: choose month, pick a date, check prices, compare flights.
  - Kept the existing `/api/flexible` backend contract intact while designing around its current provider constraints.
- Checks run:
  - `git diff --check` passed on 2026-06-29.
  - `npm run build` passed on 2026-06-29.
  - `npm run lint` passed with 2 pre-existing warnings on 2026-06-29.
  - Local Chrome mobile render check passed on 2026-06-29.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.

## 2026-06-29

- Commit hash: `a00066b`
- What changed:
  - Added richer flight result cards with airline logos/fallbacks, full airline names, full airport labels where known, outbound and return sections, duration, stops, cabin, baggage notes, and prominent total price.
  - Added recommendation badges such as `Cheapest`, `Fastest`, `Best Value`, and `Direct`.
  - Added a mobile-first filters bottom sheet with quick filters and advanced budget, airline, stops, time, airport, return-to-same-airport, duration, and cabin-bag controls.
  - Changed the active partner CTA wording to `Check partner deal`.
  - Routed Umrah-related AI prompts into Umrah mode and added Umrah-specific planning questions.
- Checks run:
  - `git diff --check` passed on 2026-06-29.
  - `npm run build` passed on 2026-06-29.
  - `npm run lint` passed with 2 pre-existing warnings on 2026-06-29.
  - Local Chrome mobile render check passed with mocked flight offers on 2026-06-29.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.

## 2026-06-29

- Commit hash: `5c97c19`
- What changed:
  - Removed unverified public email aliases from frontend defaults, backend support defaults, Render config, and deployment docs.
  - Standardised the public support/contact address on `info@tryfarely.com` until `support@tryfarely.com` has a verified Cloudflare route or mailbox.
  - Rechecked live production health for Amadeus search, return search, flexible search, static pages, and `View Deal` redirect behavior.
- Checks run:
  - `node --check server.js` passed on 2026-06-29.
  - `vite build` passed on 2026-06-29.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.

## 2026-06-29

- Commit hash: `589c1b1`
- What changed:
  - Added Farely Company Operating System v1 to `AGENTS.md`.
  - Reframed the project memory docs around milestone-led development.
  - Set Milestone 6, Search Experience 2.0, as the current active milestone.
  - Added Milestones 7-10 to the roadmap.
- Checks run:
  - `npm run build` passed on 2026-06-29.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.

## 2026-06-29

- Commit hash: `4bb3f0e`
- What changed:
  - Created the lightweight project memory system in `docs/`.
  - Added founder-to-ChatGPT handoff tracking.
  - Updated `AGENTS.md` so future Codex sessions maintain these docs before commit and push.
- Checks run:
  - `npm run build` passed on 2026-06-29.
- Pushed to GitHub:
  - Yes, pushed to `origin/main`.
