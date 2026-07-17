import { expect, test } from "@playwright/test";
import { assertResultsLookBookable, expectNoCapturedErrors, expectNoHorizontalOverflow, runExactSearch, selectAirport, setExactDates, startErrorCapture } from "./farely-helpers";
import { futureDate, futureMonth, rotatedRoute } from "./farely-test-data";

test.describe("Farely live browser audit", () => {
  test("homepage loads and exact-date return search can be completed @hourly @full", async ({ page }) => {
    const capture = startErrorCapture(page);
    const route = rotatedRoute(0);
    const departDate = futureDate(45);
    const returnDate = futureDate(49);

    await page.goto("/");
    await expect(page).toHaveTitle(/Farely/);
    await expect(page.getByRole("button", { name: "Return" })).toBeVisible();

    await selectAirport(page, "Departing from", route.fromQuery, route.from);
    await selectAirport(page, "Going to", route.toQuery, route.to);
    await setExactDates(page, departDate, returnDate);
    await runExactSearch(page);
    await assertResultsLookBookable(page);

    await page.getByRole("button", { name: "Fastest" }).click();
    await expect(page.getByRole("button", { name: "Fastest" })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Best" }).click();
    await expect(page.getByRole("button", { name: "Best" })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: /^Filters/ }).click();
    await expect(page.getByRole("dialog", { name: "Flight filters" })).toBeVisible();
    await page.getByRole("button", { name: "Direct only" }).click();
    await page.getByLabel("Max flight duration").fill("1");
    await page.getByRole("button", { name: "Show results" }).click();
    await expect(page.getByText("No fares match these filters")).toBeVisible();
    await page.getByRole("button", { name: "Show all offers" }).click();
    await expect(page.locator(".fa-airlineRow").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /^Filters/ })).toHaveText("Filters");

    await expectNoHorizontalOverflow(page);
    await expectNoCapturedErrors(capture);
  });

  test("flexible-date return search renders travel-day choices and bookable results @full", async ({ page }) => {
    const capture = startErrorCapture(page);
    const route = rotatedRoute(3);

    await page.goto("/");
    await page.getByRole("button", { name: "Flexible dates", exact: true }).click();
    await selectAirport(page, "Departing from", route.fromQuery, route.from);
    await selectAirport(page, "Going to", route.toQuery, route.to);

    const targetMonth = futureMonth(2);
    const monthButton = page.locator(".fa-monthCard").filter({ hasText: monthName(targetMonth) }).first();
    if (await monthButton.count()) {
      await monthButton.click();
    }

    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/flexible") && response.status() < 500,
      { timeout: 80_000 }
    );
    await page.getByRole("button", { name: "Show travel days" }).click();
    const response = await responsePromise;
    expect(response.ok(), `/api/flexible status ${response.status()}`).toBeTruthy();

    await expect(page.getByText("Compare flights for your travel day")).toBeVisible({ timeout: 30_000 });
    await expect(page.locator(".fa-dayPill.isClickable").first()).toBeVisible();
    await assertResultsLookBookable(page);

    await expectNoHorizontalOverflow(page);
    await expectNoCapturedErrors(capture);
  });

  test("mobile homepage and one-way search controls remain usable @full", async ({ page }) => {
    const capture = startErrorCapture(page);

    await page.goto("/");
    await page.getByRole("button", { name: "One-way" }).click();
    await expect(page.getByText("One-way trip")).toBeVisible();
    await selectAirport(page, "Going to", "JFK", "JFK");
    await page.locator(".fa-dateInput").nth(0).fill(futureDate(42));
    await runExactSearch(page);
    await expect(page.getByText("One-way fare").first()).toBeVisible();
    await assertResultsLookBookable(page);

    await expectNoHorizontalOverflow(page);
    await expectNoCapturedErrors(capture);
  });
});

function monthName(monthValue) {
  const [year, month] = monthValue.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}
