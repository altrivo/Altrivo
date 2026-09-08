import { NextResponse } from "next/server";
import { getStoreById } from "@/lib/store/store-service";

export interface AnalyticsData {
  range: string;
  updatedAt: string;
  storeName?: string;
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
  const storeId = searchParams.get("storeId");

  // Lookup store if storeId is provided
  let storeName = "";
  let niche = "decor";
  if (storeId) {
    try {
      const store = await getStoreById(storeId);
      if (store) {
        storeName = store.name;
        const text = `${store.name} ${store.slug} ${store.niche || ""}`.toLowerCase();
        if (text.includes("cloth") || text.includes("fashion") || text.includes("apparel") || text.includes("wear")) {
          niche = "clothing";
        } else if (text.includes("watch") || text.includes("time") || text.includes("chron")) {
          niche = "watches";
        } else if (text.includes("shoe") || text.includes("footwear") || text.includes("stepcraft") || text.includes("sneaker")) {
          niche = "shoes";
        }
      }
    } catch {}
  }

  // Simulate Network Latency
  await new Promise((resolve) => setTimeout(resolve, 250));

  // Multiplier for ranges
  const rangeMult = range === "Today" ? 0.15 : range === "30d" ? 3.5 : range === "90d" ? 9.8 : 1.0;

  // Derive stable per-store variance so stores have unique numbers
  let storeSeed = 1.0;
  if (storeId) {
    let hash = 0;
    for (let i = 0; i < storeId.length; i++) {
      hash = (hash * 31 + storeId.charCodeAt(i)) % 1000;
    }
    storeSeed = 0.8 + (hash / 1000) * 0.45; // between 0.8 and 1.25
  }

  const mult = rangeMult * storeSeed;

  // Niche-tailored top products
  let topProductsByTime = [
    { rank: 1, name: "Ceramic Minimalist Vase (Handcrafted)", sku: "ART-VAS-001", avgTimeSpent: "4m 12s", totalViews: "14,280", category: "Decor" },
    { rank: 2, name: "Abstract Canvas Painting 'Golden Dawn'", sku: "ART-CAN-089", avgTimeSpent: "3m 48s", totalViews: "11,620", category: "Art" },
    { rank: 3, name: "Nordic Wooden Desk Lamp", sku: "ART-LMP-012", avgTimeSpent: "3m 15s", totalViews: "9,840", category: "Lighting" },
    { rank: 4, name: "Handcrafted Genuine Leather Journal", sku: "ART-JRN-044", avgTimeSpent: "2m 50s", totalViews: "8,110", category: "Stationery" },
    { rank: 5, name: "Velvet Accent Cushion Cover", sku: "ART-CSH-021", avgTimeSpent: "2m 20s", totalViews: "6,950", category: "Home Textiles" },
  ];

  if (niche === "clothing") {
    topProductsByTime = [
      { rank: 1, name: "Embroidered Raw Silk Kurta", sku: "CLO-KRT-001", avgTimeSpent: "4m 18s", totalViews: Math.round(15200 * mult).toLocaleString(), category: "Apparel" },
      { rank: 2, name: "Luxury Chiffon Formal Dupatta", sku: "CLO-DUP-014", avgTimeSpent: "3m 50s", totalViews: Math.round(11800 * mult).toLocaleString(), category: "Formal" },
      { rank: 3, name: "Pure Cotton Casual Tunic", sku: "CLO-TNC-022", avgTimeSpent: "3m 12s", totalViews: Math.round(9950 * mult).toLocaleString(), category: "Casual" },
      { rank: 4, name: "Handcrafted Chikankari Shirt", sku: "CLO-CHK-088", avgTimeSpent: "2m 45s", totalViews: Math.round(8200 * mult).toLocaleString(), category: "Traditional" },
      { rank: 5, name: "Velvet Winter Shawl Collection", sku: "CLO-SHW-023", avgTimeSpent: "2m 15s", totalViews: Math.round(6700 * mult).toLocaleString(), category: "Shawls" },
    ];
  } else if (niche === "watches") {
    topProductsByTime = [
      { rank: 1, name: "Heritage Royal Chronograph (Rose Gold)", sku: "WAT-ROY-001", avgTimeSpent: "5m 25s", totalViews: Math.round(16800 * mult).toLocaleString(), category: "Chronograph" },
      { rank: 2, name: "Minimalist Sapphire Automatic", sku: "WAT-SAP-009", avgTimeSpent: "4m 15s", totalViews: Math.round(12400 * mult).toLocaleString(), category: "Automatic" },
      { rank: 3, name: "Classic Obsidian Leather Timepiece", sku: "WAT-OBS-044", avgTimeSpent: "3m 40s", totalViews: Math.round(10100 * mult).toLocaleString(), category: "Classic" },
      { rank: 4, name: "Aero-Pilot Titanium Sports Watch", sku: "WAT-AER-018", avgTimeSpent: "3m 05s", totalViews: Math.round(8600 * mult).toLocaleString(), category: "Sports" },
      { rank: 5, name: "Emerald Dial Vintage Dress Watch", sku: "WAT-EMR-077", avgTimeSpent: "2m 30s", totalViews: Math.round(7200 * mult).toLocaleString(), category: "Vintage" },
    ];
  } else if (niche === "shoes") {
    topProductsByTime = [
      { rank: 1, name: "Cap-Toe Oxford Leather Shoes", sku: "SHO-OXF-001", avgTimeSpent: "4m 35s", totalViews: Math.round(15800 * mult).toLocaleString(), category: "Formal" },
      { rank: 2, name: "Handcrafted Suede Loafers", sku: "SHO-LOA-002", avgTimeSpent: "3m 48s", totalViews: Math.round(11900 * mult).toLocaleString(), category: "Loafers" },
      { rank: 3, name: "Peshawari Chappal - Pure Leather", sku: "SHO-PES-003", avgTimeSpent: "3m 20s", totalViews: Math.round(10200 * mult).toLocaleString(), category: "Traditional" },
      { rank: 4, name: "Urban Streetwear Sneakers", sku: "SHO-SNK-004", avgTimeSpent: "2m 55s", totalViews: Math.round(8400 * mult).toLocaleString(), category: "Casual" },
      { rank: 5, name: "Double Monk Strap Italian Leather", sku: "SHO-MNK-005", avgTimeSpent: "2m 20s", totalViews: Math.round(6800 * mult).toLocaleString(), category: "Formal" },
    ];
  }

  const data: AnalyticsData = {
    range,
    updatedAt: new Date().toISOString(),
    storeName: storeName || undefined,
    trafficOverview: {
      totalVisits: Math.round(184200 * mult).toLocaleString(),
      rawVisits: Math.round(184200 * mult),
      visitsChange: Number((18.4 * (storeSeed > 1 ? 1.1 : 0.9)).toFixed(1)),
      uniqueVisitors: Math.round(124500 * mult).toLocaleString(),
      rawUnique: Math.round(124500 * mult),
      uniqueChange: Number((14.2 * (storeSeed > 1 ? 1.05 : 0.95)).toFixed(1)),
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
    topProductsByTime,
  };

  return NextResponse.json({
    success: true,
    data,
  });
}
