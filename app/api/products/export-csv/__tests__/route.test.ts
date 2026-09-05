import "@testing-library/jest-dom";
import { NextRequest } from "next/server";

import { GET } from "../route";

describe("Product CSV Export API (/api/products/export-csv)", () => {
  it("streams CSV response headers and product data", async () => {
    const req = new NextRequest("http://localhost:3000/api/products/export-csv?vendor_id=vendor_dev_123", {
      method: "GET",
    });

    const res = await GET(req);
    if (res.status === 500) {
      console.log("500 ERROR BODY:", await res.json());
    }
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(res.headers.get("content-disposition")).toContain("attachment; filename=");

    const text = await res.text();
    expect(text).toContain("Title,SKU,Category,Price");
    expect(text).toContain("Artisan Leather Tote Bag");
  });
});
