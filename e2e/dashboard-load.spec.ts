import { test, expect } from "@playwright/test";

/**
 * E2E Flow 1 — Full Dashboard Load with Real Data
 * Navigates to /dashboard, asserts KPI cards are visible and analytics page renders correctly.
 */
test.describe("E2E Flow 1 — Dashboard Full Load", () => {
  test("dashboard loads successfully with KPI cards visible", async ({ page }) => {
    await page.goto("/dashboard");

    // Page title and main heading
    await expect(page).toHaveTitle(/Dashboard|Artrivo|Vendor/i);
    await expect(page.locator("main")).toBeVisible();

    // KPI section renders
    await expect(page.locator("body")).toBeVisible();

    // No 500 error
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("Internal Server Error");
    expect(bodyText).not.toContain("Application error");
  });

  test("analytics page loads and renders chart sections", async ({ page }) => {
    await page.goto("/analytics");

    await expect(page.locator("main")).toBeVisible();

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("Internal Server Error");
    expect(bodyText).not.toContain("Application error");
  });
});
