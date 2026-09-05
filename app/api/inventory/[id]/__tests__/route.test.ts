import "@testing-library/jest-dom";
import { NextRequest } from "next/server";

import { InventoryBackendService } from "@/services/inventory-backend-service";

import { PATCH } from "../route";

describe("Inventory API Route (/api/inventory/:variant_id)", () => {
  it("processes single field update (PATCH) and returns version increment", async () => {
    const items = InventoryBackendService.getAllItems();
    const item = items[0];

    const req = new NextRequest(`http://localhost:3000/api/inventory/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: 79.99,
        version: item.version,
      }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: item.id }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.item.price).toBe(79.99);
    expect(json.version).toBe(item.version + 1);
    expect(json.performance.queryTimeMs).toBeLessThan(300);
  });

  it("returns 409 Conflict when optimistic concurrency version mismatch occurs", async () => {
    const items = InventoryBackendService.getAllItems();
    const item = items[0];

    const req = new NextRequest(`http://localhost:3000/api/inventory/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stock: 50,
        version: 9999, // Intentional version mismatch
      }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: item.id }) });
    const json = await res.json();

    expect(res.status).toBe(409); // 409 Conflict
    expect(json.success).toBe(false);
    expect(json.conflict).toBe(true);
    expect(json.error).toContain("Optimistic concurrency conflict");
  });
});
