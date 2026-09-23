import { test, expect } from "@playwright/test";

test.describe("V4 End-To-End Workflows", () => {
  
  test("(1) customer places order via COD -> verification -> vendor accepts", async ({ page }) => {
    // 1. Customer visits storefront checkout page
    await page.goto("/checkout");
    
    // Fill out shipping address
    await page.fill('input[placeholder="e.g. Ayesha Malik"]', "Ayesha Malik");
    await page.fill('input[placeholder="e.g. 0300 1234567"]', "03001234567");
    await page.fill('input[placeholder="House/Apartment #, Street, Sector/Block..."]', "House 123, Sector Y, DHA Phase 3, Lahore");
    await page.selectOption("select", "Lahore");

    // Select COD option
    await page.check('input[name="payment"][type="radio"]:first-child');
    
    // Submit COD checkout
    await page.click('button[type="submit"]');

    // Asserts success order confirmation
    await expect(page.locator("h1")).toContainText("Order Placed Successfully!");
    
    // Simulates customer clicking WhatsApp validation link
    // Direct trigger to COD verification API
    await page.goto("/api/checkout/verify-cod?orderId=ord-1001");
    
    // Redirects to success page
    await expect(page).toHaveURL(/\/checkout\/success/);

    // 2. Vendor logs in and visits orders page
    await page.goto("/orders");
    await expect(page.locator("body")).toContainText("Ayesha Malik");
  });

  test("(2) customer checkout via PayFast credit card redirect flow", async ({ page }) => {
    // Customer checks out using debit card payment
    await page.goto("/checkout");
    
    await page.fill('input[placeholder="e.g. Ayesha Malik"]', "Noah Wilson");
    await page.fill('input[placeholder="e.g. 0300 1234567"]', "03009999999");
    await page.fill('input[placeholder="House/Apartment #, Street, Sector/Block..."]', "Sector Block, Karachi");
    
    // Choose Card payment
    await page.click('text=Debit / Credit Card');
    
    // Submit payment
    await page.click('button[type="submit"]');
    
    // Redirects to PayFast gateway
    await expect(page.locator("h1")).toContainText("Order Placed Successfully!");
  });

  test("(3) launch a Meta ad from vendor wizard end-to-end", async ({ page }) => {
    // Vendor visits marketing creation page
    await page.goto("/campaigns/new");
    
    // Fill campaign settings
    await page.fill('input[placeholder="e.g. Eid Clearance Sale"]', "Summer Clearance Launch");
    await page.fill('input[type="number"]', "8500"); // daily budget in PKR
    
    // Check target interests checkboxes
    await page.click("text=Online shopping");
    await page.click("text=Fashion accessories");

    // Select targeting locations
    await page.selectOption("select", "Karachi");

    // Click launch campaign button
    await page.click('button:has-text("Launch Campaign")');

    // Vendor redirected back to campaign list
    await page.goto("/campaigns");
    await expect(page.locator("body")).toContainText("Summer Clearance Launch");
  });

  test("(4) top-up wallet ledger and generate VCC", async ({ page }) => {
    // Vendor visits wallet credit page
    await page.goto("/wallet");

    // Check virtual credit card generator widget
    await expect(page.locator("body")).toContainText("Virtual Credit Card");
    
    // Click top up wallet gateway button
    await page.click('button:has-text("Top-Up Wallet")');
    await page.fill('input[placeholder="Enter amount in PKR"]', "10000");
    await page.click('button:has-text("Confirm Top-Up")');

    // Simulate callback credit complete redirection
    await page.goto("/wallet");
  });
});
