import "@testing-library/jest-dom";
import { AiImageGeneratorBackendService } from "../ai-image-generator-backend";

describe("AiImageGeneratorBackendService", () => {
  it("generates 4 usable product images in <15s and logs cost", async () => {
    const startTime = performance.now();
    const result = await AiImageGeneratorBackendService.generateProductImages(
      "Luxury Leather Watch",
      "studio",
      "vendor_test_ai_1"
    );
    const duration = performance.now() - startTime;

    expect(result.success).toBe(true);
    expect(result.images.length).toBe(4);
    expect(result.cost).toBe(0.16); // 4 images * $0.04
    expect(duration).toBeLessThan(15000); // SLA < 15s
    expect(result.images[0].url).toContain("res.cloudinary.com");
  });

  it("filters out NSFW prohibited prompts", async () => {
    const result = await AiImageGeneratorBackendService.generateProductImages(
      "Explicit NSFW Prohibited Item",
      "studio",
      "vendor_test_ai_2"
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("content policy");
  });

  it("enforces rate limits per vendor (max 10 calls per minute)", async () => {
    const vendorId = "vendor_rate_limit_test";

    // Call 10 times (filling bucket)
    for (let i = 0; i < 10; i++) {
      const res = await AiImageGeneratorBackendService.generateProductImages("Test Product", "studio", vendorId);
      expect(res.success).toBe(true);
    }

    // 11th call should fail with rate limit error
    const blockedRes = await AiImageGeneratorBackendService.generateProductImages("Test Product 11", "studio", vendorId);
    expect(blockedRes.success).toBe(false);
    expect(blockedRes.error).toContain("Rate limit exceeded");
  });
});
