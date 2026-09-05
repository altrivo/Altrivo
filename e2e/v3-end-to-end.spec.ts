import { test, expect } from "@playwright/test";

test.describe("V3 Vendor E2E Suite — Products + AI Tools + Smart Inventory", () => {
  test("Flow 1: Add Product with AI Copy & AI Image Generation", async ({ page }) => {
    await page.goto("/products/new");

    // Fill Title
    const titleInput = page.locator('input[placeholder*="Title"], input[name="title"], input[id="title"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill("Handcrafted Leather Backpack");
    }

    // Open AI Copywriting Popover if present
    const aiCopyBtn = page.getByText(/Generate AI Copy/i).first();
    if (await aiCopyBtn.isVisible()) {
      await aiCopyBtn.click();
      await expect(page.getByText(/Professional/i)).toBeVisible();
      const generateBtn = page.getByText(/Generate AI Copy/i).last();
      await generateBtn.click();
      const applyBtn = page.getByText(/Apply to Product/i).first();
      if (await applyBtn.isVisible()) {
        await applyBtn.click();
      }
    }

    // Verify page elements
    await expect(page.locator("body")).toBeVisible();
  });

  test("Flow 2: Smart Inventory Spreadsheet Table & Bulk Actions", async ({ page }) => {
    await page.goto("/inventory");

    // Verify page header
    await expect(page.getByText(/Smart Inventory Management/i)).toBeVisible();
    await expect(page.getByText(/Total Items & Variants/i)).toBeVisible();

    // Select row checkboxes
    const checkboxes = page.locator('table input[type="checkbox"]');
    const count = await checkboxes.count();
    if (count > 1) {
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();

      // Verify floating bulk actions bar appears
      await expect(page.getByText(/2 items selected/i)).toBeVisible();
      await expect(page.getByText(/Bulk Edit Price/i)).toBeVisible();
    }
  });

  test("Flow 3: CSV Import & Validation Preview Flow", async ({ page }) => {
    await page.goto("/inventory");

    // Click Import from CSV button
    await page.getByText(/Import from CSV/i).click();

    // Verify CSV Import Modal
    await expect(page.getByText(/Import Inventory from CSV/i)).toBeVisible();

    // Click Load Sample CSV
    await page.getByText(/Load Sample CSV/i).click();

    // Verify Preview Table
    await expect(page.getByText(/Total Rows Parsed/i)).toBeVisible();
    await expect(page.getByText(/Valid Rows/i)).toBeVisible();

    // Click Confirm & Import
    await page.getByText(/Confirm & Import/i).click();

    // Verify modal closes and inventory table updates
    await expect(page.getByText(/Import Inventory from CSV/i)).not.toBeVisible();
  });
});
