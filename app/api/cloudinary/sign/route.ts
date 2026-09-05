import crypto from "crypto";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const vendor_id =
      request.headers.get("x-vendor-id") ||
      body.vendor_id ||
      "vendor_dev_123";

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "artrivo-cloud";
    const apiKey =
      process.env.CLOUDINARY_API_KEY ||
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
      "mock_api_key_884920";
    const apiSecret =
      process.env.CLOUDINARY_API_SECRET || "mock_api_secret_secret992";

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `vendors/${vendor_id}/products`;
    const transformation = "f_auto,q_auto,w_2000,c_limit";

    // Cloudinary signature parameters must be sorted alphabetically
    const paramsToSign = [
      `folder=${folder}`,
      `timestamp=${timestamp}`,
      `transformation=${transformation}`,
    ].sort().join("&");

    // Generate SHA-256 signature with API Secret
    const signature = crypto
      .createHash("sha256")
      .update(paramsToSign + apiSecret)
      .digest("hex");

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    return NextResponse.json(
      {
        success: true,
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder,
        transformation,
        uploadUrl,
        maxFileSize: 10485760, // 10MB limit
        allowedFormats: ["jpg", "jpeg", "png", "webp", "avif", "gif"],
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Support GET request for quick signature status check
  return POST(request);
}
