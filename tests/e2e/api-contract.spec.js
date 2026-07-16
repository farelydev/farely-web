import { expect, test } from "@playwright/test";
import { futureDate, futureMonth, rotatedRoute } from "./farely-test-data";

test.describe("Farely production API contract", () => {
  test.beforeEach(async (_, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "API contract tests run once to protect live API quota.");
  });

  test("critical health, autocomplete, validation, and redirect stay reachable @hourly @full", async ({ request, baseURL }) => {
    const health = await request.get("/api/health");
    expect(health.ok()).toBeTruthy();
    const healthJson = await health.json();
    expect(healthJson).toMatchObject({
      ok: true,
      service: "farely-api",
      demoFallbackEnabled: false,
      flightDealPartner: "travelpayouts",
      flightAffiliateConfigured: true,
      travelpayoutsConfigured: true,
    });

    const locations = await request.get("/api/locations?keyword=Mogadishu&limit=8");
    expect(locations.ok()).toBeTruthy();
    const locationsJson = await locations.json();
    expect(locationsJson.data.some((item) => item.iata === "MGQ")).toBeTruthy();

    const invalid = await request.get("/api/flights?origin=LHR&destination=DXB");
    expect(invalid.status()).toBe(400);
    await expect(invalid.json()).resolves.toMatchObject({ error: "MISSING_REQUIRED_PARAMS" });

    const route = rotatedRoute(1);
    const departDate = futureDate(45);
    const returnDate = futureDate(49);
    const redirect = await request.get(
      `/api/deals/flight?origin=${route.from}&destination=${route.to}&departureDate=${departDate}&returnDate=${returnDate}&price=250&currency=GBP&source=playwright-hourly`,
      { maxRedirects: 0 }
    );
    expect(redirect.status()).toBe(302);
    expect(redirect.headers().location).toContain("aviasales.com");
    expect(baseURL).toContain("tryfarely.com");
  });

  test("exact-date and flexible flight searches return live-shaped data @full", async ({ request }) => {
    const route = rotatedRoute(2);
    const departDate = futureDate(50);
    const returnDate = futureDate(54);

    const exact = await request.get(
      `/api/flights?origin=${route.from}&destination=${route.to}&date=${departDate}&returnDate=${returnDate}&adults=1&travelClass=ECONOMY&currency=GBP`,
      { timeout: 70_000 }
    );
    expect(exact.ok(), `/api/flights for ${route.name}`).toBeTruthy();
    const exactJson = await exact.json();
    expect(Array.isArray(exactJson.data)).toBeTruthy();
    expect(exactJson.source).toBe("amadeus");
    if (exactJson.data.length > 0) {
      expect(exactJson.data[0].dealPartnerName).toBe("Aviasales");
      expect(exactJson.data[0].dealUrl).toContain("/api/deals/flight");
      expect(exactJson.data[0].itineraries.length).toBeGreaterThanOrEqual(1);
    }

    const flexible = await request.get(
      `/api/flexible?origin=${route.from}&destination=${route.to}&month=${futureMonth(2)}&tripType=return&tripLength=4&adults=1&travelClass=ECONOMY&currency=GBP`,
      { timeout: 80_000 }
    );
    expect(flexible.ok(), `/api/flexible for ${route.name}`).toBeTruthy();
    const flexibleJson = await flexible.json();
    expect(Array.isArray(flexibleJson.days)).toBeTruthy();
    expect(flexibleJson.days.length).toBeGreaterThan(0);
    expect(flexibleJson.debug.demoFallbackEnabled).toBe(false);
  });
});
