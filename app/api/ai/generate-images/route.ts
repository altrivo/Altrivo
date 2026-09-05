import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AiImageGeneratorBackendService } from "@/services/ai-image-generator-backend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const vendor_id =
      request.headers.get("x-vendor-id") ||
      body.vendor_id ||
      "vendor_dev_123";

    const prompt = body.prompt || body.productContext;
    const style = body.style || "studio";

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error: 'prompt' or 'productContext' string is required.",
        },
        { status: 400 }
      );
    }

    const result = await AiImageGeneratorBackendService.generateProductImages(
      prompt.trim(),
      style,
      vendor_id
    );

    if (!result.success) {
      const statusCode = result.error?.includes("Rate limit") ? 429 : 400;
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          rateLimit: result.rateLimit,
        },
        { status: statusCode }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // GET endpoint retrieves usage & billing logs for the vendor
  const { searchParams } = new URL(request.url);
  const vendor_id = searchParams.get("vendor_id") || request.headers.get("x-vendor-id") || "vendor_dev_123";

  const logs = AiImageGeneratorBackendService.getVendorBillingLogs(vendor_id);
  const totalCost = logs.reduce((acc, l) => acc + l.cost, 0);

  return NextResponse.json({
    success: true,
    vendor_id,
    totalCost: Math.round(totalCost * 100) / 100,
    totalGenerations: logs.length,
    totalImagesGenerated: logs.length * 4,
    logs,
  });
}
