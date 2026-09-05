import "@testing-library/jest-dom";
import { NextRequest } from "next/server";

import { POST } from "../route";

describe("Cloudinary Sign Endpoint (/api/cloudinary/sign)", () => {
  it("generates signed upload credentials with vendor folder isolation", async () => {
    const req = new NextRequest("http://localhost:3000/api/cloudinary/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-vendor-id": "vendor_store_999",
      },
      body: JSON.stringify({ vendor_id: "vendor_store_999" }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.signature).toBeDefined();
    expect(typeof json.signature).toBe("string");
    expect(json.folder).toBe("vendors/vendor_store_999/products");
    expect(json.transformation).toBe("f_auto,q_auto,w_2000,c_limit");
    expect(json.maxFileSize).toBe(10485760);
    expect(json.allowedFormats).toContain("webp");
    expect(json.allowedFormats).toContain("avif");
  });
});
