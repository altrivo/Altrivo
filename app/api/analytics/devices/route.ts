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

  const deviceSplit = [
    {
      device: "Mobile (iOS & Android)",
      percentage: 78.4,
      count: Math.round(144412 * mult).toLocaleString(),
      color: "#C47A8E",
    },
    {
      device: "Desktop & Laptop",
      percentage: 17.6,
      count: Math.round(32419 * mult).toLocaleString(),
      color: "#694873",
    },
    {
      device: "Tablet",
      percentage: 4.0,
      count: Math.round(7368 * mult).toLocaleString(),
      color: "#F59E0B",
    },
  ];

  const topProductsByTime = [
    {
      rank: 1,
      name: "Ceramic Minimalist Vase (Handcrafted)",
      sku: "ART-VAS-001",
      avgTimeSpent: "4m 12s",
      totalViews: Math.round(14280 * mult).toLocaleString(),
      category: "Decor",
    },
    {
      rank: 2,
      name: "Abstract Canvas Painting 'Golden Dawn'",
      sku: "ART-CAN-089",
      avgTimeSpent: "3m 48s",
      totalViews: Math.round(11620 * mult).toLocaleString(),
      category: "Art",
    },
    {
      rank: 3,
      name: "Nordic Wooden Desk Lamp",
      sku: "ART-LMP-012",
      avgTimeSpent: "3m 15s",
      totalViews: Math.round(9840 * mult).toLocaleString(),
      category: "Lighting",
    },
    {
      rank: 4,
      name: "Handcrafted Genuine Leather Journal",
      sku: "ART-JRN-044",
      avgTimeSpent: "2m 50s",
      totalViews: Math.round(8110 * mult).toLocaleString(),
      category: "Stationery",
    },
    {
      rank: 5,
      name: "Velvet Accent Cushion Cover",
      sku: "ART-CSH-021",
      avgTimeSpent: "2m 20s",
      totalViews: Math.round(6950 * mult).toLocaleString(),
      category: "Home Textiles",
    },
  ];

  const responseTimeMs = Number((performance.now() - start).toFixed(2));

  return NextResponse.json({
    success: true,
    data: {
      range,
      vendorId: auth.vendorId,
      deviceSplit,
      topProductsByTime,
    },
    responseTimeMs,
  });
}
