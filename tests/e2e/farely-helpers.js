import { expect } from "@playwright/test";

export function startErrorCapture(page) {
  const consoleErrors = [];
  const requestFailures = [];

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleErrors.push(`${message.type()}: ${message.text()}`);
    }
  });

  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText || "unknown";
    const type = request.resourceType();
    const url = request.url();
    const isExpectedAutocompleteAbort = url.includes("/api/locations") && failure.includes("ERR_ABORTED");
    if (!["image", "media", "font"].includes(type)) {
      if (isExpectedAutocompleteAbort) return;
      requestFailures.push(`${request.method()} ${request.url()} ${failure}`);
    }
  });

  return { consoleErrors, requestFailures };
}

export async function expectNoCapturedErrors(capture) {
  expect(capture.consoleErrors, "browser console warnings/errors").toEqual([]);
  expect(capture.requestFailures, "failed non-asset network requests").toEqual([]);
}

export async function selectAirport(page, labelText, query, expectedCode) {
  const field = page.locator(".fa-field").filter({ hasText: labelText }).first();
  const input = field.locator("input").first();

  await input.fill("");
  await input.fill(query);

  const option = page
    .locator(".fa-dropdown button")
    .filter({ has: page.locator(`.fa-itemCode:text-is("${expectedCode}")`) })
    .first();
  await expect(option).toBeVisible({ timeout: 20_000 });
  await option.click();
  await expect(field.locator(".fa-selectedHint")).toBeVisible();
  await expect(field.locator(".fa-selectedHint")).toContainText(expectedCode);
}

export async function setExactDates(page, departDate, returnDate) {
  await page.locator(".fa-dateInput").nth(0).fill(departDate);
  await page.locator(".fa-dateInput").nth(1).fill(returnDate);
}

export async function runExactSearch(page) {
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/flights") && response.status() < 500,
    { timeout: 70_000 }
  );

  await page.getByRole("button", { name: /^Search flights$/ }).click();
  const response = await responsePromise;
  expect(response.ok(), `/api/flights status ${response.status()}`).toBeTruthy();

  await expect(page.getByRole("heading", { name: /Trip ideas and partner fares/ })).toBeVisible({ timeout: 30_000 });
  await expect(page.locator(".fa-airlineRow").first()).toBeVisible({ timeout: 30_000 });
}

export async function assertResultsLookBookable(page) {
  await expect(page.getByText("Price per person").first()).toBeVisible();
  await expect(page.getByText(/£\d/).first()).toBeVisible();
  await expect(page.getByText("Outbound").first()).toBeVisible();
  await expect(page.getByText("Return").first()).toBeVisible();
  await expect(page.getByText("Best current booking option").first()).toBeVisible();

  const bookingLink = page.locator("a.fa-topBookingCta").first();
  await expect(bookingLink).toContainText(/Book via/);
  const href = await bookingLink.getAttribute("href");
  expect(href).toContain("/api/deals/flight");
}

export async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "horizontal overflow in CSS pixels").toBeLessThanOrEqual(2);
}
