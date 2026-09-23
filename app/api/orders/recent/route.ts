import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase";

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: string;
  rawAmount: number;
  currency: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  itemsCount: number;
  date: string;
  time: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    let vendorId = searchParams.get("vendorId");
    const storeId = searchParams.get("storeId");
    const storeSlug = searchParams.get("storeSlug");

    // 1. Identify active logged in vendor from Supabase session
    if (!vendorId) {
      try {
        const supabase = await createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          vendorId = userData.user.id;
        }
      } catch (authErr) {
        // Continue
      }
    }

    if (!vendorId) {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const activeVendorId = cookieStore.get("active_vendor_id")?.value;
        if (activeVendorId) {
          vendorId = activeVendorId;
        }
      } catch {}
    }

    // 2. If no vendor is logged in, return empty orders
    if (!vendorId) {
      return NextResponse.json({
        success: true,
        page,
        limit,
        totalOrders: 0,
        totalPages: 1,
        orders: [],
      });
    }

    // 3. Resolve target store UUID first, then fetch orders with direct store_id filter
    // CRITICAL: Filter at DB level — never fetch all-vendor orders and post-filter
    let vendorOrders: any[] = [];
    if (supabaseAdmin) {
      let targetStoreId = storeId || "";
      const targetStoreSlug = storeSlug || "";

      // Resolve non-UUID store identifier to actual UUID
      if (targetStoreId || targetStoreSlug) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetStoreId);
        if (targetStoreId && !isUUID) {
          try {
            const { data: sRow } = await supabaseAdmin
              .from("stores")
              .select("id, slug")
              .or(`slug.ilike.${targetStoreId},name.ilike.${targetStoreId}`)
              .limit(1)
              .maybeSingle();
            if (sRow?.id) targetStoreId = sRow.id;
          } catch {}
        } else if (!targetStoreId && targetStoreSlug) {
          try {
            const { data: sRow } = await supabaseAdmin
              .from("stores")
              .select("id")
              .eq("slug", targetStoreSlug)
              .limit(1)
              .maybeSingle();
            if (sRow?.id) targetStoreId = sRow.id;
          } catch {}
        }
      }

      // Fetch store customers for this store
      let storeCustIds = new Set<string>();
      if (targetStoreId) {
        try {
          const { data: storeCusts } = await supabaseAdmin
            .from("store_customers")
            .select("id, auth_user_id")
            .eq("store_id", targetStoreId);
          storeCustIds = new Set((storeCusts || []).flatMap((c: any) => [c.id, c.auth_user_id]).filter(Boolean));
        } catch {}
      }

      const { data: orders, error } = await supabaseAdmin
        .from("orders")
        .select("*, order_items(*)")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });

      if (!error && orders) {
        const fs = await import("fs");
        const path = await import("path");
        const metaFile = path.join(process.cwd(), ".data", "orders_metadata.json");
        let ordersMetadata: Record<string, any> = {};
        try {
          if (fs.existsSync(metaFile)) ordersMetadata = JSON.parse(fs.readFileSync(metaFile, "utf-8"));
        } catch {}

        vendorOrders = orders.filter((o: any) => {
          if (o.customer_id && storeCustIds.has(o.customer_id)) return true;
          const meta = ordersMetadata[o.id];
          if (meta) {
            const sid = String(meta.store_id || meta.storeId || "").toLowerCase();
            if (targetStoreId && sid === targetStoreId.toLowerCase()) return true;
            if (targetStoreSlug && sid === targetStoreSlug.toLowerCase()) return true;
          }
          return false;
        });
      }
    }

    // New vendor with 0 orders gets empty array
    if (vendorOrders.length === 0) {
      return NextResponse.json({
        success: true,
        page,
        limit,
        totalOrders: 0,
        totalPages: 1,
        orders: [],
      });
    }


    const formattedOrders: OrderItem[] = vendorOrders.map((o: any) => {
      const orderDate = new Date(o.created_at || Date.now());
      const isToday =
        orderDate.toDateString() === new Date().toDateString();
      const isYesterday =
        orderDate.toDateString() ===
        new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

      let dateLabel = orderDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (isToday) dateLabel = "Today";
      else if (isYesterday) dateLabel = "Yesterday";

      const timeLabel = orderDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      let mappedStatus: OrderItem["status"] = "Pending";
      const st = (o.delivery_status || o.status || "pending").toLowerCase();
      if (st === "processing" || st === "confirmed") mappedStatus = "Processing";
      else if (st === "shipped") mappedStatus = "Shipped";
      else if (st === "delivered" || st === "completed") mappedStatus = "Delivered";
      else if (st === "cancelled" || st === "refunded") mappedStatus = "Cancelled";
      else mappedStatus = "Pending";

      const totalAmt = Number(o.total) || 0;

      return {
        id: o.id,
        orderNumber: o.order_number || `#ORD-${o.id.substring(0, 4).toUpperCase()}`,
        customerName: o.customer_name || "Customer",
        customerEmail: o.customer_email || "customer@example.com",
        amount: `$${totalAmt.toLocaleString()}`,
        rawAmount: totalAmt,
        currency: "$",
        status: mappedStatus,
        itemsCount: o.order_items?.length || 1,
        date: dateLabel,
        time: timeLabel,
      };
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = formattedOrders.slice(startIndex, endIndex);
    const totalPages = Math.max(1, Math.ceil(formattedOrders.length / limit));

    return NextResponse.json({
      success: true,
      page,
      limit,
      totalOrders: formattedOrders.length,
      totalPages,
      orders: paginatedOrders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch recent orders" },
      { status: 500 }
    );
  }
}
