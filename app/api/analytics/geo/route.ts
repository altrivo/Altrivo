import { NextResponse, NextRequest } from "next/server";
import { verifyVendorJwt } from "@/lib/auth/jwtAuth";
import { getGeoHeatmap } from "@/lib/analytics/analyticsRepository";

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

  const geoMV = getGeoHeatmap(auth.vendorId);

  const pakistanCities = [
    {
      city: "Karachi",
      province: "Sindh",
      visitors: Math.round(52400 * mult).toLocaleString(),
      rawVisitors: Math.round(52400 * mult),
      sharePercent: 38.5,
      revenue: `₨ ${Math.round(485000 * mult).toLocaleString()}`,
      coordinates: { x: 35, y: 78 },
    },
    {
      city: "Lahore",
      province: "Punjab",
      visitors: Math.round(38200 * mult).toLocaleString(),
      rawVisitors: Math.round(38200 * mult),
      sharePercent: 28.0,
      revenue: `₨ ${Math.round(362000 * mult).toLocaleString()}`,
      coordinates: { x: 68, y: 48 },
    },
    {
      city: "Islamabad & Rawalpindi",
      province: "ICT / Punjab",
      visitors: Math.round(24100 * mult).toLocaleString(),
      rawVisitors: Math.round(24100 * mult),
      sharePercent: 17.6,
      revenue: `₨ ${Math.round(248000 * mult).toLocaleString()}`,
      coordinates: { x: 62, y: 32 },
    },
    {
      city: "Faisalabad",
      province: "Punjab",
      visitors: Math.round(10800 * mult).toLocaleString(),
      rawVisitors: Math.round(10800 * mult),
      sharePercent: 7.9,
      revenue: `₨ ${Math.round(98000 * mult).toLocaleString()}`,
      coordinates: { x: 58, y: 52 },
    },
    {
      city: "Peshawar",
      province: "KPK",
      visitors: Math.round(6200 * mult).toLocaleString(),
      rawVisitors: Math.round(6200 * mult),
      sharePercent: 4.5,
      revenue: `₨ ${Math.round(54000 * mult).toLocaleString()}`,
      coordinates: { x: 52, y: 28 },
    },
    {
      city: "Multan",
      province: "Punjab",
      visitors: Math.round(4800 * mult).toLocaleString(),
      rawVisitors: Math.round(4800 * mult),
      sharePercent: 3.5,
      revenue: `₨ ${Math.round(42000 * mult).toLocaleString()}`,
      coordinates: { x: 50, y: 60 },
    },
  ];

  const responseTimeMs = Number((performance.now() - start).toFixed(2));

  return NextResponse.json({
    success: true,
    data: {
      range,
      vendorId: auth.vendorId,
      pakistanCities,
      geoMaterializedView: geoMV,
    },
    responseTimeMs,
  });
}
