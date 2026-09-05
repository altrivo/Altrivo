import "@testing-library/jest-dom";
import { NextRequest } from "next/server";

import { POST, GET } from "../route";

describe("AI Image Generation API Route (/api/ai/generate-images)", () => {
  it("handles valid image generation request", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/generate-images", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-vendor-id": "vendor_api_test_1" },
      body: JSON.stringify({ prompt: "Ceramic Coffee Dripper", style: "lifestyle" }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.images.length).toBe(4);
    expect(json.cost).toBe(0.16);
  });

  it("returns 400 for NSFW prompts", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/generate-images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Nude explicit image" }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toContain("content policy");
  });

  it("retrieves vendor usage and billing logs via GET", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/generate-images?vendor_id=vendor_api_test_1", {
      method: "GET",
    });

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.vendor_id).toBe("vendor_api_test_1");
    expect(typeof json.totalCost).toBe("number");
  });
});
