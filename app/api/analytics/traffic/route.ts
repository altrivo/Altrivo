import { NextResponse, NextRequest } from "next/server";
import { verifyVendorJwt } from "@/lib/auth/jwtAuth";
import { getDailySummary, getSourceAttribution } from "@/lib/analytics/analyticsRepository";

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

  const dailySummary = getDailySummary(auth.vendorId);
  const sourceAttribution = getSourceAttribution(auth.vendorId);

  const trafficSources = [
    { source: "Meta Ads (IG/FB)", percentage: 42.5, count: "78,285", color: "#C47A8E" },
    { source: "WhatsApp Store", percentage: 28.2, count: "51,944", color: "#10B981" },
    { source: "Organic Search", percentage: 17.8, count: "32,787", color: "#694873" },
    { source: "Direct Link", percentage: 11.5, count: "21,183", color: "#3B82F6" },
  ];

  const responseTimeMs = Number((performance.now() - start).toFixed(2));

  return NextResponse.json({
    success: true,
    data: {
      range,
      vendorId: auth.vendorId,
      dailySummary,
      sourceAttribution,
      trafficSources,
    },
    responseTimeMs,
  });
}
