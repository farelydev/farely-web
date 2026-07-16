# Farely Live Browser Audit - 2026-07-16

## 1. Date and Time

- Audit time: 2026-07-16 03:07 BST
- Auditor: Codex

## 2. Environment

- Website tested: `https://tryfarely.com`
- Live frontend asset observed: `assets/index-3otPvE22.js`
- Backend tested: same Render service through `https://tryfarely.com/api/*`
- Deployment platform confirmed from repo: Render single Node web service behind Cloudflare
- GitHub remote confirmed: `git@github.com:farelydev/farely-web.git`
- Branch confirmed: `main`
- Baseline commit before audit-suite work: `fe03fdb`

## 3. Browser and Screen Sizes

- Playwright Chromium desktop: 1440 x 1000
- Playwright Chromium mobile emulation: Pixel 7
- In-app Browser plugin: unavailable in this Codex run, so Playwright Chromium was used

## 4. Searches Performed

- API health: `GET /api/health`
- Airport lookup: Mogadishu, Tokyo
- Exact-date return browser search: rotating route data, including London to Dubai during the passing hourly run
- Flexible-date return browser search: rotating route data using future months
- One-way browser search on mobile and desktop project runs
- Deal redirect check: `/api/deals/flight` returned a `302` to Aviasales

## 5. Features That Passed

- Homepage loaded with the expected Farely title.
- Live backend `/api/health` returned 200.
- Amadeus credentials are loaded on production.
- Demo fallback is off on production.
- Autocomplete found worldwide locations including `MGQ` for Mogadishu and Tokyo results.
- Exact-date return search submitted successfully in the browser.
- Flexible-date search submitted successfully in the browser.
- Result cards rendered instead of staying blank or loading forever.
- Outbound and return sections rendered.
- GBP price display rendered.
- Cheapest, Fastest, and Best sorting controls responded.
- Filters drawer opened and applied a quick filter.
- Top `Book via Aviasales` CTA rendered with a tracked `/api/deals/flight` URL.
- Mobile layout had no detected horizontal overflow in the tested flows.
- No relevant browser console errors or non-asset network failures remained in the passing run.

## 6. Confirmed Defects

No customer-facing defects were confirmed in the final passing audit run.

## 7. Possible Defects Requiring Further Investigation

### Medium - Amadeus live quota/rate-limit sensitivity

- Status: recurring operational risk
- Evidence: An earlier full-audit attempt made too many live exact/flexible searches in parallel and one `/api/flights` response returned `429`.
- Expected behaviour: Farely audits should test production without exhausting provider quota.
- Actual behaviour: Parallel full-audit checks can reach provider limits.
- Likely cause: live Amadeus test/sandbox quota sensitivity plus too much parallel audit traffic.
- Recommended fix: keep recurring full audits serial, keep hourly checks lightweight, and add mocked/local regression tests for high-volume combinations.
- Regression added: the full audit script now runs with `--workers=1`, and API contract tests run only once instead of once per viewport.

### Low - Autocomplete exact-code selection needs careful testing

- Status: test-harness issue, product behaviour worth monitoring
- Evidence: When searching for `LHR` or `JFK`, city-level rows such as `LON` or `NYC` can appear because their tags include those airport codes.
- Expected behaviour: tests that ask for a specific IATA code should pick the exact code row.
- Actual behaviour: the first test selector picked the first row containing the text, which could be an all-airports city row.
- Recommended fix: keep exact-code selector coverage in automated tests and review whether travellers typing an airport code should see the exact airport above city/all-airports rows.
- Regression added: Playwright helper now selects the exact `.fa-itemCode` row.

## 8. Console, Network, API, or Server Errors

- Final hourly audit: passed.
- Final full audit: 8 passed, 2 intentionally skipped duplicate mobile API contract checks.
- Known earlier setup/test failures:
  - Playwright Chromium was missing and had to be installed.
  - First full-audit attempt triggered a 429 during parallel live checks.
  - Early Playwright locators were too broad and were fixed.

## 9. Skyscanner Comparison Findings

- Direct Skyscanner browser comparison was attempted once at `https://www.skyscanner.net/`.
- Skyscanner presented a robot/captcha page, so no live Skyscanner search was performed and no price comparison was claimed.
- Public Skyscanner documentation confirms useful benchmark areas for Farely:
  - flexible-date month/day grids,
  - Cheapest Month / Whole Month style browsing,
  - Everywhere search,
  - provider breadth,
  - price alerts and saved lists.
- Farely is currently simpler and more honest, but still lacks Skyscanner-level provider breadth, alerts/saved trips, and destination-agnostic Everywhere search.

## 10. Screenshots, Logs, or Reproduction Steps

- Passing Playwright run produced no failure screenshots.
- On future failures, Playwright will retain screenshots, videos, and traces under local `test-results/`.
- Reproduction for hourly smoke:
  1. Run `npm run audit:hourly`.
  2. Confirm `/api/health`, autocomplete, redirect, homepage, exact-date search, results, sorting, filters, and booking CTA pass.
- Reproduction for full audit:
  1. Run `npm run audit:full`.
  2. Confirm API exact/flexible checks plus desktop/mobile browser checks pass.

## 11. Severity

- Critical: none.
- High: none confirmed.
- Medium: live provider quota/rate-limit sensitivity during overly parallel audits.
- Low: exact-code autocomplete ordering should be watched.

## 12. Recommended Fixes

- Use `npm run audit:hourly` for lightweight hourly health checks.
- Use `npm run audit:full` for twice-daily full checks.
- Keep full audits serial and route-rotated.
- Add mocked/local regression tests before expanding to many route/date/passenger/cabin combinations.
- Consider a small product refinement later: when a traveller types an exact IATA code, show the exact airport row above city/all-airports rows.

## 13. Product or UX Improvements Noticed

- Add a true Everywhere-style flow later for users who know budget/month but not destination.
- Add price alerts/saved trips later, after core search/redirect reliability is stronger.
- Continue building honest multi-provider comparison only after approved provider data exists.
- Add a stronger traveller-facing empty-state test for routes/months with no available fares.

## 14. Tests Added

- Production smoke/API contract tests.
- Live browser exact-date return search test.
- Live browser flexible-date search test.
- Live browser one-way/mobile usability test.
- Console and non-asset network failure monitoring.
- Future-date and route-rotation helpers.
- Playwright screenshots, videos, and traces on failure.

## 15. Changes Proposed Since Previous Audit

- Add Playwright as a dev dependency.
- Add `playwright.config.js`.
- Add `tests/e2e` live audit suite.
- Add scripts:
  - `npm run audit:hourly`
  - `npm run audit:full`
  - `npm run test:e2e`
- Ignore generated Playwright output folders.

## 16. New, Recurring, or Fixed

- New: automated live browser audit suite.
- Recurring: Amadeus/provider rate-limit sensitivity.
- Fixed in test suite: excessive full-audit parallelism and broad autocomplete selectors.
- Already fixed from earlier Farely work: stale filter reset, flexible-date booking partner wording, top booking strip, multi-carrier airline display.

## ChatGPT / MVP Factory Handoff

Direct posting into the MVP Factory ChatGPT project was unavailable in this Codex run. Copy-paste message:

```text
Farely baseline QA audit completed on 2026-07-16.

What was tested:
- Live site: https://tryfarely.com
- API health, autocomplete, exact-date search, flexible-date search, one-way/mobile search, sorting, filters, and Aviasales redirect.
- Desktop Chromium and Pixel 7 mobile emulation through Playwright.

Result:
- Final hourly audit passed.
- Final full audit passed: 8 passed, 2 duplicate mobile API tests intentionally skipped.
- No customer-facing defect was confirmed in the passing run.

Important finding:
- A first full-audit attempt was too parallel and hit/encountered Amadeus 429 behaviour. Codex reduced the audit load by making full audits serial and running API contract checks only once.

Safest next step:
- Use the new Playwright suite for hourly/twice-daily monitoring.
- Do not expand live production route coverage too aggressively until we add mocked/local regression tests.

Needs founder/Product decision:
- Should Codex later make exact IATA-code autocomplete rows rank above city/all-airports rows when the user types a specific airport code such as LHR or JFK?
```
