import "@testing-library/jest-dom";
import { NextRequest } from "next/server";

import { GET, POST } from "../route";

describe("Categories API Route (/api/categories)", () => {
  it("fetches category tree structure via GET", async () => {
    const req = new NextRequest("http://localhost:3000/api/categories?vendor_id=vendor_dev_123", {
      method: "GET",
    });

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.categories).toBeDefined();
    expect(Array.isArray(json.categories)).toBe(true);
  });

  it("creates a new category via POST", async () => {
    const req = new NextRequest("http://localhost:3000/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-vendor-id": "vendor_route_test" },
      body: JSON.stringify({
        name: "Home & Outdoor Living",
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.category.slug).toBe("home-outdoor-living");
    expect(json.category.depth).toBe(1);
  });
});
