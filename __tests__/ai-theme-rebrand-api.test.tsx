import { POST, GET } from "@/app/api/theme/rebrand/route";

describe("Theme Backend — AI Theme Rebranding Service (/api/theme/rebrand)", () => {
  describe("POST /api/theme/rebrand", () => {
    it("generates AI theme tokens, validates output schema, and tracks LLM cost under $0.05", async () => {
      const payload = {
        vendorId: "vendor_brandxyz",
        prompt: "luxurious gold accents with deep obsidian background",
      };

      const req = {
        json: async () => payload,
      };

      const res = await POST(req as any);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.vendorId).toBe("vendor_brandxyz");

      // Schema validation
      expect(json.tokens.primaryColor).toMatch(/^#/);
      expect(json.tokens.accentColor).toMatch(/^#/);
      expect(json.tokens.headingFont).toBe("Playfair Display");
      expect(json.tokens.borderRadius).toBe("rounded-xl");

      // LLM Cost tracking (<$0.05 budget SLA)
      expect(json.cost.costUsd).toBeLessThan(0.05);
      expect(json.cost.isUnderBudget).toBe(true);
      expect(json.cost.totalTokens).toBeGreaterThan(0);
    });

    it("returns 400 Bad Request when prompt is missing or empty", async () => {
      const payload = { vendorId: "vendor_brandxyz", prompt: "   " };
      const req = { json: async () => payload };

      const res = await POST(req as any);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("Prompt is required");
    });
  });

  describe("GET /api/theme/rebrand", () => {
    it("retrieves current vendor theme tokens", async () => {
      const req = {
        url: "http://localhost:3000/api/theme/rebrand?vendorId=vendor_brandxyz",
      };

      const res = await GET(req as any);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.vendorId).toBe("vendor_brandxyz");
      expect(json.tokens).toBeDefined();
    });
  });
});
