import "@testing-library/jest-dom";
import { NextRequest } from "next/server";

import { POST } from "../route";

describe("Product CSV Import API (/api/products/import-csv)", () => {
  it("executes transactional import for valid product CSV payload", async () => {
    const csvContent = [
      "Title,SKU,Category,Price,Stock,Status",
      "Handcrafted Leather Belt,SKU-BLT-101,Fashion,39.99,30,published",
      "Minimalist Desk Lamp,SKU-LAMP-102,Home,79.00,12,published",
    ].join("\n");

    const req = new NextRequest("http://localhost:3000/api/products/import-csv", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-vendor-id": "vendor_import_test" },
      body: JSON.stringify({ csvContent }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.transactionStatus).toBe("COMMITTED");
    expect(json.importedCount).toBe(2);
    expect(json.performance.executionTimeMs).toBeLessThan(30000);
  });

  it("aborts transaction (All-or-Nothing) when any row contains validation error", async () => {
    const invalidCsv = [
      "Title,SKU,Category,Price,Stock,Status",
      "Valid Item 1,SKU-VAL-001,Fashion,29.99,10,published",
      "Invalid Price Item,SKU-ERR-002,Fashion,-10.00,10,published", // Invalid row
    ].join("\n");

    const req = new NextRequest("http://localhost:3000/api/products/import-csv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csvContent: invalidCsv }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.transactionStatus).toContain("ABORTED");
    expect(json.errorCount).toBe(1);
    expect(json.errors[0].rowNumber).toBe(2);
  });
});
