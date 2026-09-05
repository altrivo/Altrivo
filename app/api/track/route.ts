import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown> = {};

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json") || contentType.includes("text/plain")) {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    }

    // GeoIP Header Extraction (Vercel / Cloudflare / Custom Proxies)
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const city =
      req.headers.get("x-vercel-ip-city") ||
      req.headers.get("cf-ipcity") ||
      "Karachi";

    const country =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      "Pakistan";

    const eventRecord = {
      id: "evt_" + Math.random().toString(36).substring(2, 9),
      vendorId: body.vendorId || "v-default",
      sessionId: body.sessionId || "sess_unknown",
      page: body.page || "/",
      referrer: body.referrer || "direct",
      device: body.device || "desktop",
      city,
      country,
      ip: clientIp,
      productContext: body.productContext || null,
      timestamp: body.timestamp || new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        tracked: true,
        event: eventRecord,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Tracking API Error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Invalid or malformed tracking payload",
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    service: "Artrivo Storefront Tracking Beacon Ingestion API",
    status: "healthy",
  });
}
