import { NextResponse, NextRequest } from "next/server";
import { verifyVendorJwt } from "@/lib/auth/jwtAuth";

export async function GET(req: NextRequest) {
  const start = performance.now();
  const auth = verifyVendorJwt(req);

  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Missing or invalid vendor JWT token" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "7d";
  const mult = range === "today" ? 0.15 : range === "30d" ? 3.5 : range === "90d" ? 9.8 : 1.0;

  const conversionFunnel = [
    {
      stage: "Storefront Visited",
      count: Math.round(100000 * mult).toLocaleString(),
      rawCount: Math.round(100000 * mult),
      percentageOfTotal: 100,
      dropoffPercent: null,
    },
    {
      stage: "Viewed Product Page",
      count: Math.round(45000 * mult).toLocaleString(),
      rawCount: Math.round(45000 * mult),
      percentageOfTotal: 45,
      dropoffPercent: 55,
    },
    {
      stage: "Added to Cart",
      count: Math.round(12000 * mult).toLocaleString(),
      rawCount: Math.round(12000 * mult),
      percentageOfTotal: 12,
      dropoffPercent: 73.3,
    },
    {
      stage: "Purchased (Converted)",
      count: Math.round(3840 * mult).toLocaleString(),
      rawCount: Math.round(3840 * mult),
      percentageOfTotal: 3.84,
      dropoffPercent: 68,
    },
  ];

  const responseTimeMs = Number((performance.now() - start).toFixed(2));

  return NextResponse.json({
    success: true,
    data: {
      range,
      vendorId: auth.vendorId,
      conversionFunnel,
      overallConversionRate: "3.84%",
    },
    responseTimeMs,
  });
}
