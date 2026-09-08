import { NextResponse, NextRequest } from "next/server";
import { verifyVendorJwt } from "@/lib/auth/jwtAuth";

export async function GET(req: NextRequest) {
  const start = performance.now();
  const auth = await verifyVendorJwt(req);

  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Missing or invalid vendor JWT token" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "7d";
  const mult = range === "today" ? 0.15 : range === "30d" ? 3.5 : range === "90d" ? 9.8 : 1.0;

  const data = {
    range,
    vendorId: auth.vendorId,
    totalVisits: Math.round(184200 * mult).toLocaleString(),
    rawVisits: Math.round(184200 * mult),
    visitsChange: 18.4,
    uniqueVisitors: Math.round(124500 * mult).toLocaleString(),
    rawUnique: Math.round(124500 * mult),
    uniqueChange: 14.2,
    avgSessionDuration: "3m 42s",
    durationChange: 5.8,
    bounceRate: "32.4%",
    bounceChange: -3.1,
  };

  const responseTimeMs = Number((performance.now() - start).toFixed(2));

  return NextResponse.json({
    success: true,
    data,
    responseTimeMs,
  });
}
