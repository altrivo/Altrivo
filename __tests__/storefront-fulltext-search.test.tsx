import { GET } from "@/app/api/storefront/search/route";
import { searchVendorProducts, calculateTrigramSimilarity } from "@/lib/storefront/searchRepository";

describe("Storefront Backend — Postgres Full-Text & Trigram Search (/api/storefront/search)", () => {
  describe("1. Search Repository Unit Tests", () => {
    it("calculates trigram similarity correctly for typos", () => {
      const sim1 = calculateTrigramSimilarity("vase", "vasse");
      expect(sim1).toBeGreaterThan(0.3);

      const sim2 = calculateTrigramSimilarity("ceramic", "ceramik");
      expect(sim2).toBeGreaterThan(0.3);
    });

    it("matches product titles with typos via trigram search ('vasse' -> 'Ceramic Minimalist Vase')", async () => {
      const res = await searchVendorProducts("v-default", "vasse");
      expect(res.products.length).toBeGreaterThan(0);
      expect(res.products[0].name).toBe("Ceramic Minimalist Vase");
      expect(res.executionTimeMs).toBeLessThan(200);
    });

    it("scopes search results strictly to the vendor's domain", async () => {
      const resDefault = await searchVendorProducts("v-default", "clock");
      expect(resDefault.products.length).toBe(0);

      const resOther = await searchVendorProducts("vendor_other", "clock");
      expect(resOther.products.length).toBe(1);
      expect(resOther.products[0].name).toBe("Brass Vintage Wall Clock");
    });

    it("ranks products sensibly by relevance score and sales count popularity", async () => {
      const res = await searchVendorProducts("v-default", "handcrafted");
      expect(res.products.length).toBeGreaterThan(1);
      // Top result should have highest relevance score
      expect(res.products[0].relevanceScore).toBeGreaterThanOrEqual(res.products[1].relevanceScore);
    });
  });

  describe("2. GET /api/storefront/search API Endpoint Tests", () => {
    it("returns 200 OK with search results, SLA compliance, and execution time <200ms", async () => {
      const req = {
        url: "http://localhost:3000/api/storefront/search?q=ceramik&vendorId=v-default",
        headers: new Headers(),
      };

      const res = await GET(req as any);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.query).toBe("ceramik");
      expect(json.vendorId).toBe("v-default");
      expect(json.executionTimeMs).toBeLessThan(200);
      expect(json.isSlaCompliant).toBe(true);
      expect(json.products.length).toBeGreaterThan(0);
      expect(json.products[0].name).toBe("Ceramic Minimalist Vase");
    });

    it("resolves vendor from x-vendor-id header when vendorId query param is omitted", async () => {
      const headers = new Headers();
      headers.set("x-vendor-id", "vendor_other");

      const req = {
        url: "http://localhost:3000/api/storefront/search?q=clock",
        headers,
      };

      const res = await GET(req as any);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.vendorId).toBe("vendor_other");
      expect(json.products.length).toBe(1);
      expect(json.products[0].name).toBe("Brass Vintage Wall Clock");
    });
  });
});
