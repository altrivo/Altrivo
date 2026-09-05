import { NextResponse } from "next/server";

export interface AnalyticsData {
  range: string;
  updatedAt: string;
  trafficOverview: {
    totalVisits: string;
    rawVisits: number;
    visitsChange: number;
    uniqueVisitors: string;
    rawUnique: number;
    uniqueChange: number;
    avgSessionDuration: string;
    durationChange: number;
    bounceRate: string;
    bounceChange: number;
  };
  pakistanCities: {
    city: string;
    province: string;
    visitors: string;
    rawVisitors: number;
    sharePercent: number;
    revenue: string;
    coordinates: { x: number; y: number };
  }[];
  trafficSources: {
    source: string;
    percentage: number;
    count: string;
    color: string;
  }[];
  newVsReturning: {
    period: string;
    newCustomers: number;
    returningCustomers: number;
  }[];
  conversionFunnel: {
    stage: string;
    count: string;
    rawCount: number;
    percentageOfTotal: number;
    dropoffPercent: number | null;
  }[];
  deviceSplit: {
    device: string;
    percentage: number;
    count: string;
    color: string;
  }[];
  topProductsByTime: {
    rank: number;
    name: string;
    sku: string;
    avgTimeSpent: string;
    totalViews: string;
    category: string;
  }[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "7d";

  // Simulate Network Latency
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Multiplier for ranges
  const mult = range === "Today" ? 0.15 : range === "30d" ? 3.5 : range === "90d" ? 9.8 : 1.0;

  const data: AnalyticsData = {
    range,
    updatedAt: new Date().toISOString(),
    trafficOverview: {
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
    },
    pakistanCities: [
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
    ],
    trafficSources: [
      { source: "Meta Ads (IG/FB)", percentage: 42.5, count: Math.round(78285 * mult).toLocaleString(), color: "#C47A8E" },
      { source: "WhatsApp Store", percentage: 28.2, count: Math.round(51944 * mult).toLocaleString(), color: "#10B981" },
      { source: "Organic Search", percentage: 17.8, count: Math.round(32787 * mult).toLocaleString(), color: "#694873" },
      { source: "Direct Link", percentage: 11.5, count: Math.round(21183 * mult).toLocaleString(), color: "#3B82F6" },
    ],
    newVsReturning: [
      { period: "Mon", newCustomers: Math.round(420 * mult), returningCustomers: Math.round(280 * mult) },
      { period: "Tue", newCustomers: Math.round(480 * mult), returningCustomers: Math.round(310 * mult) },
      { period: "Wed", newCustomers: Math.round(520 * mult), returningCustomers: Math.round(350 * mult) },
      { period: "Thu", newCustomers: Math.round(490 * mult), returningCustomers: Math.round(390 * mult) },
      { period: "Fri", newCustomers: Math.round(610 * mult), returningCustomers: Math.round(440 * mult) },
      { period: "Sat", newCustomers: Math.round(750 * mult), returningCustomers: Math.round(520 * mult) },
      { period: "Sun", newCustomers: Math.round(820 * mult), returningCustomers: Math.round(610 * mult) },
    ],
    conversionFunnel: [
      { stage: "Storefront Visited", count: Math.round(100000 * mult).toLocaleString(), rawCount: 100000 * mult, percentageOfTotal: 100, dropoffPercent: null },
      { stage: "Viewed Product Page", count: Math.round(45000 * mult).toLocaleString(), rawCount: 45000 * mult, percentageOfTotal: 45, dropoffPercent: 55 },
      { stage: "Added to Cart", count: Math.round(12000 * mult).toLocaleString(), rawCount: 12000 * mult, percentageOfTotal: 12, dropoffPercent: 73.3 },
      { stage: "Purchased (Converted)", count: Math.round(3840 * mult).toLocaleString(), rawCount: 3840 * mult, percentageOfTotal: 3.84, dropoffPercent: 68 },
    ],
    deviceSplit: [
      { device: "Mobile (iOS & Android)", percentage: 78.4, count: Math.round(144412 * mult).toLocaleString(), color: "#C47A8E" },
      { device: "Desktop & Laptop", percentage: 17.6, count: Math.round(32419 * mult).toLocaleString(), color: "#694873" },
      { device: "Tablet", percentage: 4.0, count: Math.round(7368 * mult).toLocaleString(), color: "#F59E0B" },
    ],
    topProductsByTime: [
      { rank: 1, name: "Ceramic Minimalist Vase (Handcrafted)", sku: "ART-VAS-001", avgTimeSpent: "4m 12s", totalViews: "14,280", category: "Decor" },
      { rank: 2, name: "Abstract Canvas Painting 'Golden Dawn'", sku: "ART-CAN-089", avgTimeSpent: "3m 48s", totalViews: "11,620", category: "Art" },
      { rank: 3, name: "Nordic Wooden Desk Lamp", sku: "ART-LMP-012", avgTimeSpent: "3m 15s", totalViews: "9,840", category: "Lighting" },
      { rank: 4, name: "Handcrafted Genuine Leather Journal", sku: "ART-JRN-044", avgTimeSpent: "2m 50s", totalViews: "8,110", category: "Stationery" },
      { rank: 5, name: "Velvet Accent Cushion Cover", sku: "ART-CSH-021", avgTimeSpent: "2m 20s", totalViews: "6,950", category: "Home Textiles" },
    ],
  };

  return NextResponse.json({
    success: true,
    data,
  });
}
