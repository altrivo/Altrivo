import { NextResponse } from "next/server";
import { getStoreById } from "@/lib/store/store-service";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export interface AnalyticsData {
  range: string;
  updatedAt: string;
  storeName?: string;
  isLive: boolean; // true when computed from real tracking events or real database orders
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
    sparklineVisits: number[];
    sparklineUnique: number[];
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
  orderSummary: {
    totalOrders: number;
    grossRevenue: string;
    aov: string;
    conversionRate: string;
  };
}

// ---------------------------------------------------------------------------
// File paths for local fallbacks
// ---------------------------------------------------------------------------
const EVENTS_FILE = path.join(process.cwd(), ".data", "tracking_events.json");
const ORDERS_FILE = path.join(process.cwd(), ".data", "orders_metadata.json");

// ---------------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------------
function loadTrackingEvents(): any[] {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      return JSON.parse(fs.readFileSync(EVENTS_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function loadOrdersMetadata(): Record<string, any> {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
    }
  } catch {}
  return {};
}

// ---------------------------------------------------------------------------
// Helper: Extract all products from a store's layout_config sections
// ---------------------------------------------------------------------------
function extractStoreProducts(store: any): any[] {
  const products: any[] = [];
  const seen = new Set<string>();

  const addProduct = (p: any) => {
    if (!p) return;
    const key = p.id || p.sku || p.name;
    if (!key || seen.has(key)) return;
    seen.add(key);
    products.push(p);
  };

  (store?.layout_config?.products || []).forEach(addProduct);
  (store?.layout_config?.sections || []).forEach((sec: any) => {
    const list = sec?.props?.products || sec?.content?.products || sec?.products || [];
    list.forEach(addProduct);
  });

  return products;
}

// ---------------------------------------------------------------------------
// Helper: Derive niche from store data
// ---------------------------------------------------------------------------
function detectNiche(store: any): string {
  const text = `${store?.name || ""} ${store?.slug || ""} ${store?.niche || ""}`.toLowerCase();
  if (text.includes("cloth") || text.includes("fashion") || text.includes("apparel") || text.includes("wear")) return "clothing";
  if (text.includes("watch") || text.includes("chron") || text.includes("time")) return "watches";
  if (text.includes("shoe") || text.includes("footwear") || text.includes("loafer") || text.includes("sneaker") || text.includes("step")) return "shoes";
  if (text.includes("beauty") || text.includes("cosmetic") || text.includes("skin") || text.includes("wellness") || text.includes("aura")) return "beauty";
  if (text.includes("perfume") || text.includes("oud") || text.includes("fragrance") || text.includes("attar")) return "perfumes";
  if (text.includes("jewel") || text.includes("gold") || text.includes("diamond")) return "jewelry";
  return "general";
}

// ---------------------------------------------------------------------------
// Helper: Build day-by-day buckets for the last N days
// ---------------------------------------------------------------------------
function buildDayBuckets(events: any[], nowMs: number, days: number): { label: string; events: any[] }[] {
  const buckets: { label: string; events: any[] }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = days - 1; i >= 0; i--) {
    const startMs = nowMs - (i + 1) * 86400000;
    const endMs = nowMs - i * 86400000;
    const d = new Date(startMs);
    const label = days <= 7 ? dayNames[d.getDay()] : `${d.getDate()}/${d.getMonth() + 1}`;
    buckets.push({
      label,
      events: events.filter((e) => {
        const t = new Date(e.timestamp || e.receivedAt || 0).getTime();
        return t >= startMs && t < endMs;
      }),
    });
  }
  return buckets;
}

// ---------------------------------------------------------------------------
// Helper: Compute avg session duration from events (estimate per session)
// ---------------------------------------------------------------------------
function computeAvgSessionDuration(events: any[]): string {
  if (events.length === 0) return "0m 00s";

  const sessions: Record<string, number> = {};
  events.forEach((e) => {
    const sid = e.sessionId || "unknown";
    sessions[sid] = (sessions[sid] || 0) + 1;
  });

  const counts = Object.values(sessions);
  const avgPages = counts.reduce((s, v) => s + v, 0) / Math.max(counts.length, 1);

  const totalSeconds = Math.round(avgPages * 90);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

// ---------------------------------------------------------------------------
// Helper: Compute bounce rate (sessions with only 1 page view)
// ---------------------------------------------------------------------------
function computeBounceRate(events: any[]): number {
  if (events.length === 0) return 0;

  const sessions: Record<string, number> = {};
  events.forEach((e) => {
    const sid = e.sessionId || "unknown";
    sessions[sid] = (sessions[sid] || 0) + 1;
  });

  const counts = Object.values(sessions);
  if (counts.length === 0) return 0;
  const bounced = counts.filter((c) => c === 1).length;
  return Math.round((bounced / counts.length) * 1000) / 10;
}

// ---------------------------------------------------------------------------
// Helper: Classify referrer string into source category
// ---------------------------------------------------------------------------
function classifyReferrer(referrer: string): string {
  if (!referrer || referrer === "direct" || referrer === "") return "Direct Link";
  const r = referrer.toLowerCase();
  if (r.includes("facebook") || r.includes("instagram") || r.includes("fb.com") || r.includes("ig.me")) return "Meta Ads (IG/FB)";
  if (r.includes("whatsapp") || r.includes("wa.me")) return "WhatsApp Store";
  if (r.includes("google") || r.includes("bing") || r.includes("yahoo") || r.includes("duckduckgo")) return "Organic Search";
  if (r.includes("tiktok") || r.includes("youtube") || r.includes("snapchat")) return "Social Media";
  return "Direct Link";
}

// ---------------------------------------------------------------------------
// Helper: Build traffic sources
// ---------------------------------------------------------------------------
function buildTrafficSources(events: any[]): AnalyticsData["trafficSources"] {
  const CHANNELS = [
    { source: "Meta Ads (IG/FB)", color: "#C47A8E" },
    { source: "WhatsApp Store", color: "#874759" },
    { source: "Organic Search", color: "#694873" },
    { source: "Direct Link", color: "#3B82F6" },
  ];

  if (events.length === 0) {
    return CHANNELS.map((c) => ({
      source: c.source,
      percentage: 0,
      count: "0",
      color: c.color,
    }));
  }

  const counts: Record<string, number> = {};
  events.forEach((e) => {
    const src = classifyReferrer(e.referrer || "direct");
    counts[src] = (counts[src] || 0) + 1;
  });

  const total = events.length;
  return CHANNELS.map((c) => {
    const count = counts[c.source] || 0;
    const percentage = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
    return {
      source: c.source,
      percentage,
      count: count.toLocaleString(),
      color: c.color,
    };
  }).sort((a, b) => b.percentage - a.percentage);
}

// ---------------------------------------------------------------------------
// Helper: Build device split
// ---------------------------------------------------------------------------
function buildDeviceSplit(events: any[]): AnalyticsData["deviceSplit"] {
  const counts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
  events.forEach((e) => {
    const d = (e.device || "desktop").toLowerCase();
    if (d === "mobile") counts.mobile++;
    else if (d === "tablet") counts.tablet++;
    else counts.desktop++;
  });

  const total = events.length;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);

  return [
    { device: "Mobile (iOS & Android)", percentage: pct(counts.mobile), count: counts.mobile.toLocaleString(), color: "#C47A8E" },
    { device: "Desktop & Laptop", percentage: pct(counts.desktop), count: counts.desktop.toLocaleString(), color: "#694873" },
    { device: "Tablet", percentage: pct(counts.tablet), count: counts.tablet.toLocaleString(), color: "#F59E0B" },
  ];
}

// ---------------------------------------------------------------------------
// Helper: Build city visitor counts
// ---------------------------------------------------------------------------
const CITY_DEF = [
  { city: "Karachi", province: "Sindh", coordinates: { x: 35, y: 78 } },
  { city: "Lahore", province: "Punjab", coordinates: { x: 68, y: 48 } },
  { city: "Islamabad & Rawalpindi", province: "ICT / Punjab", coordinates: { x: 62, y: 32 } },
  { city: "Faisalabad", province: "Punjab", coordinates: { x: 58, y: 52 } },
  { city: "Peshawar", province: "KPK", coordinates: { x: 52, y: 28 } },
  { city: "Multan", province: "Punjab", coordinates: { x: 50, y: 60 } },
];

function buildCityData(
  events: any[],
  realRevenue: number,
  orders: any[] = []
): AnalyticsData["pakistanCities"] {
  const totalVisits = events.length;

  return CITY_DEF.map((c) => {
    const cityKey = c.city.toLowerCase().split(" ")[0];
    const cityEvents = events.filter((e) =>
      (e.city || "").toLowerCase().includes(cityKey)
    );
    const rawVisitors = cityEvents.length;
    const sharePercent = totalVisits > 0 ? Math.round((rawVisitors / totalVisits) * 1000) / 10 : 0;

    const cityOrders = orders.filter((o) => {
      const cityField = (o.shipping_address?.city || o.city || o.shipping_city || "").toLowerCase();
      return cityField.includes(cityKey);
    });
    const cityRevUSD = cityOrders.reduce((sum, o) => sum + (parseFloat(o.total || 0) || 0), 0);

    return {
      city: c.city,
      province: c.province,
      visitors: rawVisitors.toLocaleString(),
      rawVisitors,
      sharePercent,
      revenue: `$ ${cityRevUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      coordinates: c.coordinates,
    };
  });
}

// ---------------------------------------------------------------------------
// Helper: Build new vs returning from real events + orders
// ---------------------------------------------------------------------------
function buildNewVsReturning(
  events: any[],
  orders: any[],
  dayBuckets: { label: string; events: any[] }[]
): AnalyticsData["newVsReturning"] {
  const seenGlobally = new Set<string>();

  return dayBuckets.map((b) => {
    let newC = 0;
    let retC = 0;
    const sessionsThisDay = new Set<string>();

    b.events.forEach((e) => {
      const sid = e.sessionId || e.id;
      if (sid && !sessionsThisDay.has(sid)) {
        sessionsThisDay.add(sid);
        if (seenGlobally.has(sid)) {
          retC++;
        } else {
          newC++;
          seenGlobally.add(sid);
        }
      }
    });

    return {
      period: b.label,
      newCustomers: newC,
      returningCustomers: retC,
    };
  });
}

// ---------------------------------------------------------------------------
// Helper: Top products by time (Real Catalog Products & Tracked Views)
// ---------------------------------------------------------------------------
function buildTopProducts(
  products: any[],
  events: any[]
): AnalyticsData["topProductsByTime"] {
  if (!products || products.length === 0) {
    return [];
  }

  const productStats = products.map((p, i) => {
    const pId = String(p.id || p.sku || "").toLowerCase();
    const pName = String(p.name || p.title || "").toLowerCase();

    const matchingEvents = events.filter((e) => {
      if (e.productContext?.productId && String(e.productContext.productId).toLowerCase() === pId) return true;
      const page = String(e.page || "").toLowerCase();
      if (pId && page.includes(pId)) return true;
      if (pName && page.includes(encodeURIComponent(pName))) return true;
      return false;
    });

    const views = matchingEvents.length;
    let avgTime = "0m 00s";
    if (views > 0) {
      const durationSec = Math.min(360, Math.max(30, views * 45));
      const m = Math.floor(durationSec / 60);
      const s = durationSec % 60;
      avgTime = `${m}m ${s.toString().padStart(2, "0")}s`;
    }

    return {
      name: p.name || p.title || `Product ${i + 1}`,
      sku: p.sku || `SKU-${i + 1}`,
      category: p.category || p.tag || "General",
      views,
      avgTimeSpent: avgTime,
    };
  });

  productStats.sort((a, b) => b.views - a.views);

  return productStats.slice(0, 5).map((p, i) => ({
    rank: i + 1,
    name: p.name,
    sku: p.sku,
    avgTimeSpent: p.avgTimeSpent,
    totalViews: p.views.toLocaleString(),
    category: p.category,
  }));
}

// ---------------------------------------------------------------------------
// GET /api/analytics
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "7d";
  const storeId = searchParams.get("storeId");
  const storeSlug = searchParams.get("storeSlug");
  let vendorId = searchParams.get("vendorId");

  // ── 0. Resolve authenticated vendor if not provided ─────────────────────
  if (!vendorId) {
    try {
      const supabase = await createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) vendorId = userData.user.id;
    } catch {}
  }
  if (!vendorId) {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const activeVendorId = cookieStore.get("active_vendor_id")?.value;
      if (activeVendorId) vendorId = activeVendorId;
    } catch {}
  }

  // ── 1. Fetch store from Supabase ────────────────────────────────────────
  let store: any = null;
  let storeName = "";
  const targetStoreId = (storeId || "").trim();
  const targetStoreSlug = (storeSlug || "").trim();

  if (supabaseAdmin && (targetStoreId || targetStoreSlug)) {
    try {
      let q = supabaseAdmin.from("stores").select("*");
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetStoreId)) {
        q = q.or(`id.eq.${targetStoreId},slug.eq.${targetStoreId}`);
      } else if (targetStoreId) {
        q = q.or(`slug.ilike.${targetStoreId},name.ilike.${targetStoreId}`);
      } else if (targetStoreSlug) {
        q = q.eq("slug", targetStoreSlug);
      }
      const { data: sData } = await q.maybeSingle();
      if (sData) {
        store = sData;
        storeName = store.name;
        if (store.vendor_id && !vendorId) vendorId = store.vendor_id;
      }
    } catch (err) {
      console.warn("[Analytics] Store resolution notice:", err);
    }
  }

  if (!store && targetStoreId) {
    try {
      store = await getStoreById(targetStoreId);
      if (store) {
        storeName = store.name;
        if (store.vendor_id && !vendorId) vendorId = store.vendor_id;
      }
    } catch {}
  }

  const niche = detectNiche(store);
  let storeProducts = extractStoreProducts(store);
  if (storeProducts.length === 0 && store?.commerce_config?.products?.length) {
    storeProducts = store.commerce_config.products;
  }
  if (storeProducts.length === 0 && supabaseAdmin && (vendorId || store?.vendor_id)) {
    try {
      const vId = vendorId || store?.vendor_id;
      const { data: dbProds } = await supabaseAdmin.from("products").select("*").eq("vendor_id", vId);
      if (dbProds && dbProds.length > 0) {
        storeProducts = dbProds;
      }
    } catch {}
  }

  // ── 2. Date window ──────────────────────────────────────────────────────
  const normalizedRange = range.toLowerCase();
  const now = Date.now();
  const days =
    normalizedRange === "today"
      ? 1
      : normalizedRange === "30d"
      ? 30
      : normalizedRange === "90d"
      ? 90
      : 7;
  const windowMs = days * 86400000;

  // ── 3. Load tracking events (Supabase + Local fallback) ─────────────────
  let windowEvents: any[] = [];
  if (supabaseAdmin && (vendorId || store?.vendor_id)) {
    try {
      const vId = vendorId || store?.vendor_id;
      const { data: pvs } = await supabaseAdmin
        .from("page_views")
        .select("*")
        .eq("vendor_id", vId)
        .gte("timestamp", new Date(now - windowMs).toISOString())
        .order("timestamp", { ascending: false });

      if (pvs && pvs.length > 0) {
        windowEvents = pvs.map((p) => ({
          id: p.id,
          sessionId: p.session_id,
          page: p.page,
          city: p.city,
          country: p.country,
          device: p.device,
          referrer: p.referrer,
          timestamp: p.timestamp,
          storeId: store?.id,
        }));
      }
    } catch (pvErr) {
      console.warn("[Analytics] page_views query notice:", pvErr);
    }
  }

  const validStoreIds = new Set(
    [
      targetStoreId ? targetStoreId.toLowerCase() : "",
      targetStoreSlug ? targetStoreSlug.toLowerCase() : "",
      store?.id ? String(store.id).toLowerCase() : "",
      store?.slug ? String(store.slug).toLowerCase() : "",
      store?.subdomain ? String(store.subdomain).toLowerCase() : "",
    ].filter(Boolean)
  );

  const allEvents = loadTrackingEvents();
  if (windowEvents.length === 0 && allEvents.length > 0) {
    windowEvents = allEvents.filter((e) => {
      const t = new Date(e.timestamp || e.receivedAt || 0).getTime();
      if (now - t > windowMs) return false;
      if (validStoreIds.size > 0) {
        const sid = (e.storeId || e.store_id || "").toLowerCase();
        return validStoreIds.has(sid);
      }
      return true;
    });
  }

  // ── 4. Load real orders from Supabase ───────────────────────────────────
  let realOrders: any[] = [];
  if (supabaseAdmin && (vendorId || store?.vendor_id)) {
    try {
      const vId = vendorId || store?.vendor_id;
      let validCustIds = new Set<string>();
      let validOrderIds = new Set<string>();

      if (store?.id) {
        const [custRes, eventRes, payRes] = await Promise.all([
          supabaseAdmin.from("store_customers").select("id").eq("store_id", store.id),
          supabaseAdmin.from("order_events").select("order_id").eq("store_id", store.id),
          supabaseAdmin.from("payments").select("order_id").eq("store_id", store.id),
        ]);
        validCustIds = new Set((custRes?.data || []).map((c: any) => c.id));
        validOrderIds = new Set([
          ...(eventRes?.data || []).map((e: any) => e.order_id),
          ...(payRes?.data || []).map((p: any) => p.order_id),
        ]);
      }

      const { data: dbOrders, error: dbOrdersErr } = await supabaseAdmin
        .from("orders")
        .select("*, order_items(*)")
        .eq("vendor_id", vId)
        .order("created_at", { ascending: false });

      if (!dbOrdersErr && dbOrders && dbOrders.length > 0) {
        if (store?.id) {
          realOrders = dbOrders.filter((o: any) => {
            if (o.customer_id && validCustIds.has(o.customer_id)) return true;
            if (validOrderIds.has(o.id)) return true;
            if (validCustIds.size === 0 && validOrderIds.size === 0) return true;
            return false;
          });
        } else {
          realOrders = dbOrders;
        }
      }
    } catch (err) {
      console.warn("[Analytics] Orders query notice:", err);
    }
  }

  // Merge with local orders metadata if any exist
  const ordersMetadata = loadOrdersMetadata();
  const metaOrders = Object.values(ordersMetadata) as any[];
  if (metaOrders.length > 0) {
    const matchedMeta = metaOrders.filter((o: any) => {
      const sid = (o.store_id || o.storeId || "").toLowerCase();
      return validStoreIds.has(sid);
    });
    const existingIds = new Set(realOrders.map((o) => o.id));
    matchedMeta.forEach((mo) => {
      if (!existingIds.has(mo.id || mo.orderNumber)) {
        realOrders.push(mo);
      }
    });
  }

  // Filter orders by date window
  const recentOrders = realOrders.filter((o: any) => {
    const created = o.created_at || o.createdAt;
    if (!created) return true;
    return now - new Date(created).getTime() <= windowMs;
  });

  // ── 5. Financial metrics from orders ────────────────────────────────────
  const totalOrderCount = recentOrders.length;
  const grossRevenue = recentOrders.reduce((sum: number, o: any) => {
    const amt = parseFloat(o.total || o.grand_total || o.totalAmount || 0);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);
  const realRevenue = grossRevenue;
  const realAOV = totalOrderCount > 0 ? realRevenue / totalOrderCount : 0;

  // ── 6. Per-store stable seed ────────────────────────────────────────────
  let storeSeed = 1.0;
  if (storeId) {
    let hash = 0;
    for (let i = 0; i < storeId.length; i++) {
      hash = (hash * 31 + storeId.charCodeAt(i)) % 1000;
    }
    storeSeed = 0.8 + (hash / 1000) * 0.45;
  }
  const rangeMult =
    normalizedRange === "today"
      ? 0.15
      : normalizedRange === "30d"
      ? 3.5
      : normalizedRange === "90d"
      ? 9.8
      : 1.0;
  const fallbackMult = rangeMult * storeSeed;

  // ── 7. Effective traffic visits & day buckets ───────────────────────────
  const effectiveVisits = windowEvents.length;
  const dayBuckets = buildDayBuckets(windowEvents, now, Math.min(days, 7));

  // ── 8. Core traffic metrics ─────────────────────────────────────────────
  const rawVisits = effectiveVisits;
  const uniqueSessions = new Set(windowEvents.map((e) => e.sessionId || e.id)).size;

  const visitsChange = 0;
  const uniqueChange = 0;

  const sparklineVisits = dayBuckets.map((b) => b.events.length);
  const sparklineUnique = dayBuckets.map((b) => new Set(b.events.map((e) => e.sessionId || e.id)).size);

  const avgSessionDuration = computeAvgSessionDuration(windowEvents);
  const bounceRate = computeBounceRate(windowEvents);

  // ── 9. Conversion funnel ─────────────────────────────────────────────────
  const totalVisited = effectiveVisits;
  const viewedProduct = windowEvents.filter(
    (e) => (e.page && e.page.includes("/product/")) || e.productContext
  ).length;
  const purchased = totalOrderCount;
  const addedCart = Math.max(
    purchased,
    windowEvents.filter((e) => e.page && e.page.includes("/cart")).length
  );

  const rawConvRate = totalVisited > 0 ? (purchased / totalVisited) * 100 : 0;
  const conversionRate = rawConvRate.toFixed(2);

  const pctOfTotal = (count: number) =>
    totalVisited > 0 ? Math.round((count / totalVisited) * 1000) / 10 : 0;

  const conversionFunnel: AnalyticsData["conversionFunnel"] = [
    {
      stage: "Storefront Visited",
      count: totalVisited.toLocaleString(),
      rawCount: totalVisited,
      percentageOfTotal: totalVisited > 0 ? 100 : 0,
      dropoffPercent: null,
    },
    {
      stage: "Viewed Product Page",
      count: viewedProduct.toLocaleString(),
      rawCount: viewedProduct,
      percentageOfTotal: pctOfTotal(viewedProduct),
      dropoffPercent:
        totalVisited > 0
          ? Math.max(0, Math.round(((totalVisited - viewedProduct) / totalVisited) * 100))
          : 0,
    },
    {
      stage: "Added to Cart",
      count: addedCart.toLocaleString(),
      rawCount: addedCart,
      percentageOfTotal: pctOfTotal(addedCart),
      dropoffPercent:
        viewedProduct > 0
          ? Math.max(0, Math.round(((viewedProduct - addedCart) / viewedProduct) * 100))
          : 0,
    },
    {
      stage: "Purchased (Converted)",
      count: purchased.toLocaleString(),
      rawCount: purchased,
      percentageOfTotal: parseFloat(conversionRate),
      dropoffPercent:
        addedCart > 0
          ? Math.max(0, Math.round(((addedCart - purchased) / addedCart) * 100))
          : 0,
    },
  ];

  // ── 10. Assemble response ────────────────────────────────────────────────
  const isLive = windowEvents.length > 0 || totalOrderCount > 0;

  const data: AnalyticsData = {
    range,
    updatedAt: new Date().toISOString(),
    storeName: storeName || undefined,
    isLive,

    trafficOverview: {
      totalVisits: rawVisits.toLocaleString(),
      rawVisits,
      visitsChange,
      uniqueVisitors: uniqueSessions.toLocaleString(),
      rawUnique: uniqueSessions,
      uniqueChange,
      avgSessionDuration,
      durationChange: 0,
      bounceRate: `${bounceRate}%`,
      bounceChange: 0,
      sparklineVisits,
      sparklineUnique,
    },

    pakistanCities: buildCityData(windowEvents, realRevenue, recentOrders),

    trafficSources: buildTrafficSources(windowEvents),

    newVsReturning: buildNewVsReturning(windowEvents, recentOrders, dayBuckets),

    conversionFunnel,

    deviceSplit: buildDeviceSplit(windowEvents),

    topProductsByTime: buildTopProducts(storeProducts, windowEvents),

    orderSummary: {
      totalOrders: totalOrderCount,
      grossRevenue: `$ ${realRevenue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      aov: `$ ${realAOV.toFixed(2)}`,
      conversionRate: `${conversionRate}%`,
    },
  };

  return NextResponse.json({ success: true, data });
}
