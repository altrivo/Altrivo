import { test, expect } from "@playwright/test";

/**
 * E2E Flow 2 — Filter Analytics by Date Range
 * Analytics API routes require vendor JWT auth. We use the pre-seeded test token
 * "vendor-jwt-token-123" which maps to vendorId "v-default" in jwtAuth.ts.
 */

const AUTH_HEADERS = {
  Authorization: "Bearer vendor-jwt-token-123",
};

test.describe("E2E Flow 2 — Analytics Date Range Filter", () => {
  test("analytics page loads without error", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.locator("main")).toBeVisible();

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("Internal Server Error");
  });

  test("date range filter API returns valid data for last 7 days", async ({ request }) => {
    const res = await request.get(
      `/api/analytics/traffic?range=7d`,
      { headers: AUTH_HEADERS }
    );

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    // traffic route returns data as an object with dailySummary + trafficSources arrays
    expect(json.data).toBeDefined();
    expect(json.data.range).toBe("7d");
    expect(Array.isArray(json.data.trafficSources)).toBe(true);
    expect(json.data.trafficSources.length).toBeGreaterThan(0);
    expect(json.data.trafficSources[0].source).toBeDefined();
    expect(typeof json.data.trafficSources[0].percentage).toBe("number");
  });

  test("analytics summary API returns KPI card data", async ({ request }) => {
    const res = await request.get("/api/analytics/summary?range=7d", {
      headers: AUTH_HEADERS,
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(typeof json.data.rawVisits).toBe("number");
    expect(json.data.rawVisits).toBeGreaterThan(0);
    expect(typeof json.data.bounceRate).toBe("string");
  });

  test("analytics geo API returns Pakistan city heatmap data", async ({ request }) => {
    const res = await request.get("/api/analytics/geo?range=7d", {
      headers: AUTH_HEADERS,
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    // geo route returns data.pakistanCities as the city array
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data.pakistanCities)).toBe(true);
    expect(json.data.pakistanCities.length).toBeGreaterThan(0);
    expect(json.data.pakistanCities[0].city).toBeDefined();
    expect(json.data.pakistanCities[0].sharePercent).toBeGreaterThan(0);
  });
});
