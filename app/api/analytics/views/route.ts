import { NextResponse, NextRequest } from "next/server";
import {
  getDailySummary,
  getGeoHeatmap,
  getSourceAttribution,
  refreshMaterializedViews,
  benchmarkQueryPerformance,
} from "@/lib/analytics/analyticsRepository";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all";
  const vendorId = searchParams.get("vendorId") || "v-default";

  const benchmark = benchmarkQueryPerformance(vendorId, 100000);

  if (type === "daily") {
    return NextResponse.json({
      success: true,
      data: getDailySummary(vendorId),
      benchmark,
    });
  }

  if (type === "geo") {
    return NextResponse.json({
      success: true,
      data: getGeoHeatmap(vendorId),
      benchmark,
    });
  }

  if (type === "source") {
    return NextResponse.json({
      success: true,
      data: getSourceAttribution(vendorId),
      benchmark,
    });
  }

  return NextResponse.json({
    success: true,
    views: {
      dailySummary: getDailySummary(vendorId),
      geoHeatmap: getGeoHeatmap(vendorId),
      sourceAttribution: getSourceAttribution(vendorId),
    },
    benchmark,
  });
}

export async function POST() {
  const result = refreshMaterializedViews();
  return NextResponse.json({
    success: true,
    message: "Materialized views refreshed concurrently.",
    result,
  });
}
