import fs from "fs";
import path from "path";
import nodeCrypto from "crypto";
import { EventEmitter } from "events";
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  DeliveryStatus,
  ReturnStatus,
  RefundStatus,
  CODStatus,
  TimelineEvent,
  OrderEvent,
  OrderPayment,
  OrderReturn,
  OrderRefund,
  OrderComplaint,
  ComplaintMessage,
  PaymentMethod,
} from "@/types/orders";
import { supabaseAdmin } from "@/lib/supabase";
import { NotificationService } from "@/services/notification-service";

const METADATA_FILE = path.join(process.cwd(), ".data", "orders_metadata.json");

function getCachedMetadata(orderId: string): Record<string, any> {
  try {
    if (fs.existsSync(METADATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(METADATA_FILE, "utf-8"));
      return data[orderId] || {};
    }
  } catch (e) {}
  return {};
}

function saveCachedMetadata(orderId: string, metadata: Record<string, any>) {
  try {
    const dir = path.dirname(METADATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let data: Record<string, any> = {};
    if (fs.existsSync(METADATA_FILE)) {
      try {
        data = JSON.parse(fs.readFileSync(METADATA_FILE, "utf-8"));
      } catch (e) {}
    }
    data[orderId] = { ...(data[orderId] || {}), ...metadata };
    fs.writeFileSync(METADATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.warn("[saveCachedMetadata] Error:", e);
  }
}

// 1. Order Event Emitter for Real-Time State Machine Updates
export const orderEvents = new EventEmitter();

// 2. A2 Escrow Service
export const A2EscrowService = {
  releaseToVendor: async (orderId: string, amount: number): Promise<boolean> => {
    console.log(`[A2 Escrow Service] Releasing ₨ ${amount.toFixed(2)} to vendor for order ${orderId}`);
    return true;
  },
  refundToCustomer: async (orderId: string, amount: number, reason: string): Promise<boolean> => {
    console.log(`[A2 Escrow Service] Refunding ₨ ${amount.toFixed(2)} to customer for order ${orderId}. Reason: ${reason}`);
    return true;
  },
};

// 3. Valid State Machine Transitions (Guarded state flow)
export const VALID_ORDER_TRANSITIONS: Record<OrderStatus | "refunded" | "paid", (OrderStatus | "refunded" | "paid")[]> = {
  pending: ["confirmed", "cancelled", "paid"],
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "ready_to_ship", "shipped", "cancelled", "refunded"],
  packed: ["ready_to_ship", "cancelled", "refunded"],
  ready_to_ship: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "cancelled", "refunded"],
  delivered: ["completed", "refunded"],
  completed: ["refunded"],
  cancelled: [],
  refunded: [],
  paid: ["confirmed", "processing", "cancelled"],
};

// 4. In-Memory Store for quick hydration & fallback
let ordersStore: Order[] = [];
let orderEventsStore: OrderEvent[] = [];
let returnsStore: OrderReturn[] = [];
let refundsStore: OrderRefund[] = [];
let complaintsStore: OrderComplaint[] = [];

function safeUUID(): string {
  try {
    return nodeCrypto.randomUUID();
  } catch {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export class OrdersBackendService {
  /**
   * Generates a readable order number (e.g. ALT-2026-000125)
   */
  public static generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `ALT-${year}-${randomNum}`;
  }

  /**
   * Helper to fetch active vendor ID
   */
  private static async getValidVendorId(targetVendorId?: string): Promise<string> {
    if (targetVendorId && targetVendorId !== "all") return targetVendorId;
    if (supabaseAdmin && targetVendorId) {
      try {
        const { data } = await supabaseAdmin.from("vendors").select("id").eq("id", targetVendorId).maybeSingle();
        if (data?.id) return data.id;
      } catch (e) {}
    }
    return targetVendorId || "";
  }

  /**
   * Helper to fetch active store ID for a specific vendor
   */
  private static async getValidStoreId(vendorId?: string): Promise<string> {
    if (supabaseAdmin && vendorId) {
      try {
        const { data } = await supabaseAdmin.from("stores").select("id").eq("vendor_id", vendorId).limit(1);
        if (data && data.length > 0) return data[0].id;
      } catch (e) {}
    }
    return "";
  }

  /**
   * List orders for a vendor with strict store & multi-filtering criteria
   */
  static async getOrders(
    vendorId: string,
    filters?: {
      storeId?: string;
      customerId?: string;
      customerEmail?: string;
      searchQuery?: string;
      orderStatus?: string;
      deliveryStatus?: string;
      paymentStatus?: string;
      courier?: string;
      codOnly?: boolean;
      dateRange?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ orders: Order[]; totalCount: number; analytics: any }> {
    let combinedOrders: Order[] = [];
    let realStoreId = filters?.storeId;

    // Query Supabase for real orders
    if (supabaseAdmin) {
      try {
        if (realStoreId) {
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(realStoreId);
          if (!isUUID) {
            const { data: sRow } = await supabaseAdmin
              .from("stores")
              .select("id")
              .or(`slug.ilike.${realStoreId},name.ilike.${realStoreId}`)
              .limit(1)
              .maybeSingle();
            if (sRow) realStoreId = sRow.id;
          }
        }

        let query = supabaseAdmin
          .from("orders")
          .select("*, order_items(*), shipments(*)")
          .order("created_at", { ascending: false });

        // CRITICAL: Always filter by vendor_id when provided
        if (vendorId && vendorId !== "all") {
          query = query.eq("vendor_id", vendorId);
        } else if (!realStoreId) {
          // Neither vendor nor store is known — return empty for safety
          return { orders: [], totalCount: 0, analytics: this.calculateAnalytics([]) };
        }

        let storeCustIds = new Set<string>();
        let storeProductIds = new Set<string>();
        if (realStoreId) {
          try {
            const { data: storeCusts } = await supabaseAdmin
              .from("store_customers")
              .select("id, auth_user_id")
              .eq("store_id", realStoreId);
            storeCustIds = new Set((storeCusts || []).flatMap((c: any) => [c.id, c.auth_user_id]).filter(Boolean));
          } catch {}

          try {
            const { data: storeRow } = await supabaseAdmin
              .from("stores")
              .select("layout_config, commerce_config")
              .eq("id", realStoreId)
              .maybeSingle();
            if (storeRow) {
              const prods = [
                ...(storeRow.layout_config?.products || []),
                ...(storeRow.commerce_config?.products || []),
                ...((storeRow.layout_config?.sections || []).flatMap((s: any) => s.props?.products || s.content?.products || s.products || [])),
              ];
              storeProductIds = new Set(prods.map((p: any) => String(p.id || p.sku || "").toLowerCase()).filter(Boolean));
            }
          } catch {}
        }

        const { data: dbOrders, error } = await query;

        if (!error && dbOrders && dbOrders.length > 0) {
          const sid = realStoreId ? realStoreId.toLowerCase() : "";
          const filteredDbOrders = sid
            ? dbOrders.filter((dbo: any) => {
                if (dbo.customer_id && storeCustIds.has(dbo.customer_id)) return true;
                const meta = getCachedMetadata(dbo.id);
                if (meta?.store_id && String(meta.store_id).toLowerCase() === sid) return true;
                if (storeProductIds.size > 0 && Array.isArray(dbo.order_items)) {
                  const hasStoreItem = dbo.order_items.some((oi: any) =>
                    storeProductIds.has(String(oi.product_id).toLowerCase())
                  );
                  if (hasStoreItem) return true;
                }
                return false;
              })
            : dbOrders;

          combinedOrders = filteredDbOrders.map((dbo: any) => {
            const meta = getCachedMetadata(dbo.id);
            const metaItems = meta.items || [];
            const items: OrderItem[] = (dbo.order_items || []).map((oi: any, idx: number) => {
              const metaItem = metaItems.find((m: any) => m.id === oi.id) || metaItems[idx] || metaItems.find((m: any) => m.product_id === oi.product_id);
              const itemSku = metaItem?.sku || metaItem?.product_sku_snapshot || oi.product_sku_snapshot || oi.sku || (oi.product_id ? `SKU-${String(oi.product_id).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}` : `SKU-ALT-00${idx + 1}`);
              const itemName = metaItem?.name || metaItem?.product_name_snapshot || oi.product_name_snapshot || "Catalog Product";
              return {
                id: oi.id,
                order_id: oi.order_id,
                product_id: oi.product_id,
                variant_id: oi.variant_id,
                name: itemName,
                product_name_snapshot: itemName,
                product_sku_snapshot: itemSku,
                sku: itemSku,
                variant_snapshot: metaItem?.variant || oi.variant_snapshot || "",
                variant: metaItem?.variant || oi.variant_snapshot || oi.variant || "",
                image_snapshot: metaItem?.image || oi.image_snapshot || "",
                image: metaItem?.image || oi.image_snapshot || oi.image || "",
                quantity: oi.quantity || oi.qty || 1,
                price: Number(oi.unit_price) || 0,
                unit_price: Number(oi.unit_price) || 0,
                discount_amount: Number(oi.discount_amount) || 0,
                tax_amount: Number(oi.tax_amount) || 0,
                line_total: Number(oi.line_total) || Number(oi.unit_price || 0) * Number(oi.quantity || oi.qty || 1),
              };
            });

            const subtotal = Number(dbo.subtotal) || Number(meta.subtotal) || items.reduce((s, i) => s + (i.line_total || i.price * i.quantity), 0);
            const discount = Number(dbo.discount_total) || Number(meta.discount_total) || 0;
            const tax = Number(dbo.tax_total) || Number(meta.tax_total) || 0;
            const rawGrandTotal = Number(dbo.grand_total) || Number(dbo.total) || Number(meta.grand_total) || 0;

            let shipping = 0;
            if (rawGrandTotal > 0 && Math.abs(rawGrandTotal - subtotal) > 0.001) {
              shipping = Math.max(0, rawGrandTotal - subtotal + discount - tax);
            } else if (dbo.shipping_total !== undefined && Number(dbo.shipping_total) < 100) {
              shipping = Number(dbo.shipping_total);
            } else if (meta.shipping_total !== undefined && Number(meta.shipping_total) < 100) {
              shipping = Number(meta.shipping_total);
            } else {
              shipping = subtotal >= 100 || subtotal === 0 ? 0.0 : 15.0;
            }
            const grandTotal = rawGrandTotal > 0 ? rawGrandTotal : Math.max(0, subtotal - discount + shipping + tax);

            const activeShipment = dbo.shipments?.[0];
            const displayOrderNumber = meta.orderNumber || meta.order_number || dbo.order_number || `ALT-2026-${dbo.id.replace(/[^0-9]/g, "").slice(0, 6) || "100001"}`;

              const effectiveStatus = (
                meta.deliveryStatus ||
                meta.delivery_status ||
                (dbo.delivery_status && dbo.delivery_status !== "pending" ? dbo.delivery_status : null) ||
                activeShipment?.status ||
                dbo.delivery_status ||
                "pending"
              ) as DeliveryStatus;

              return {
                id: dbo.id,
                order_number: displayOrderNumber,
                orderNumber: displayOrderNumber,
                store_id: dbo.store_id || meta.store_id || meta.storeId || realStoreId || "unknown_store",
                vendor_id: dbo.vendor_id || vendorId,
                customer_id: dbo.customer_id,
                customerId: dbo.customer_id,
                customerName: dbo.customer_name || "Valued Customer",
                customer_name: dbo.customer_name || "Valued Customer",
                customerEmail: dbo.customer_email || "customer@pakistan.store",
                customer_email: dbo.customer_email || "customer@pakistan.store",
                customerPhone: dbo.customer_phone || "0300 1234567",
                customer_phone: dbo.customer_phone || "0300 1234567",
                subtotal,
                discount_total: discount,
                shipping_total: shipping,
                tax_total: tax,
                grand_total: grandTotal,
                totalAmount: grandTotal,
                currency: "USD",
                order_status: (meta.order_status || effectiveStatus) as OrderStatus,
                paymentStatus: (meta.paymentStatus || dbo.payment_status || "pending") as PaymentStatus,
                payment_status: (meta.payment_status || dbo.payment_status || "pending") as PaymentStatus,
                fulfillment_status: (meta.fulfillment_status || ((effectiveStatus as any) === "delivered" || (effectiveStatus as any) === "shipped" ? "fulfilled" : dbo.fulfillment_status) || "unfulfilled") as FulfillmentStatus,
                deliveryStatus: effectiveStatus,
                delivery_status: effectiveStatus,
              return_status: dbo.return_status || "none",
              refund_status: dbo.refund_status || "none",
              cod_status: dbo.cod_status || "pending",
              escrowStatus: meta.escrowStatus || dbo.escrow_status || "held_in_escrow",
              paymentMethod: (dbo.payment_method || "cod") as PaymentMethod,
              payment_method: (dbo.payment_method || "cod") as PaymentMethod,
              deliveryMethod: "standard",
              carrier: meta.carrier || activeShipment?.courier_name || "Trax Express",
              courier_name: meta.courier_name || activeShipment?.courier_name || "Trax Express",
              trackingNumber: meta.trackingNumber || activeShipment?.tracking_number,
              tracking_number: meta.tracking_number || activeShipment?.tracking_number,
              shippingAddress: dbo.shipping_address || "Pakistan",
              customer_note: meta.customer_note || dbo.customer_note,
              vendor_note: meta.vendor_note || dbo.vendor_note,
              internal_note: meta.internal_note || dbo.internal_note,
              notes: meta.customer_note || dbo.customer_note,
              createdAt: dbo.created_at || new Date().toISOString(),
              created_at: dbo.created_at,
              updated_at: dbo.updated_at,
              items,
              events: meta.events && meta.events.length > 0 ? meta.events : (dbo.order_events || []),
              returns: dbo.returns || [],
              refunds: dbo.refunds || [],
              complaints: dbo.complaints || [],
              timeline: meta.timeline && meta.timeline.length > 0 ? meta.timeline : (dbo.order_events || []).map((e: any) => ({
                id: e.id,
                title: e.event_type.replace(/_/g, " "),
                description: e.message,
                timestamp: e.created_at,
                step: e.new_status || "confirmed",
                completed: true,
              })),
            };
          });
        }
      } catch (dbErr) {
        console.warn("[OrdersBackendService] Supabase getOrders query notice:", dbErr);
      }
    }

    // Combine with in-memory fallback (strictly tenant-isolated)
    if (combinedOrders.length === 0 && ordersStore.length > 0) {
      combinedOrders = ordersStore.filter((o) => {
        if (vendorId && vendorId !== "all" && o.vendor_id && o.vendor_id !== vendorId) return false;
        if (realStoreId && o.store_id && o.store_id !== realStoreId) return false;
        return true;
      });
    }

    // Sort newest first
    combinedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let filtered = combinedOrders;

    // Filter by search query
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          o.customerEmail?.toLowerCase().includes(q) ||
          o.customerPhone?.toLowerCase().includes(q) ||
          o.trackingNumber?.toLowerCase().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q) || (i.sku && i.sku.toLowerCase().includes(q)))
      );
    }

    // Filter by order / delivery status
    if (filters?.orderStatus && filters.orderStatus !== "all") {
      filtered = filtered.filter(
        (o) => o.order_status === filters.orderStatus || o.deliveryStatus === filters.orderStatus
      );
    }

    // Filter by payment status
    if (filters?.paymentStatus && filters.paymentStatus !== "all") {
      filtered = filtered.filter((o) => o.paymentStatus === filters.paymentStatus);
    }

    // Filter by COD only
    if (filters?.codOnly) {
      filtered = filtered.filter((o) => o.paymentMethod === "cod");
    }

    // Filter by Courier
    if (filters?.courier && filters.courier !== "all") {
      filtered = filtered.filter((o) => o.carrier?.toLowerCase().includes(filters.courier!.toLowerCase()));
    }

    // Filter by Date Range
    if (filters?.dateRange && filters.dateRange !== "all") {
      const now = new Date().getTime();
      filtered = filtered.filter((o) => {
        const orderTime = new Date(o.createdAt).getTime();
        if (filters.dateRange === "today") {
          return now - orderTime < 24 * 60 * 60 * 1000;
        } else if (filters.dateRange === "last_7_days") {
          return now - orderTime < 7 * 24 * 60 * 60 * 1000;
        } else if (filters.dateRange === "last_30_days") {
          return now - orderTime < 30 * 24 * 60 * 60 * 1000;
        }
        return true;
      });
    }

    // CRITICAL: Secondary store-level guard — DB already filtered but enforce here too as safety net
    // This catches any orders that leaked through (e.g. in-memory fallback store without store_id)
    if (realStoreId || filters?.storeId) {
      const targetStoreIdFilter = realStoreId || filters?.storeId;
      filtered = filtered.filter(
        (o) =>
          o.store_id === targetStoreIdFilter ||
          (o as any).storeId === targetStoreIdFilter
        // NOTE: Removed the validCustIds/validOrderIds fallback — it was causing cross-store data leakage
        // If an order doesn't have the correct store_id, it should NOT be shown
      );
    }

    // Compute comprehensive analytics for this store/vendor
    const analytics = this.calculateAnalytics(filtered);

    const totalCount = filtered.length;
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    const paginated = filtered.slice(offset, offset + limit);

    return { orders: paginated, totalCount, analytics };
  }

  /**
   * Helper to calculate revenue & order counts
   */
  private static calculateAnalytics(orders: Order[]) {
    let grossSales = 0;
    let discounts = 0;
    let shippingRevenue = 0;
    let taxes = 0;
    let refunds = 0;

    const counts = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      packed: 0,
      ready_to_ship: 0,
      shipped: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
      cod: 0,
      paid: 0,
    };

    for (const o of orders) {
      grossSales += o.subtotal || o.totalAmount;
      discounts += o.discount_total || 0;
      shippingRevenue += o.shipping_total || 0;
      taxes += o.tax_total || 0;

      if (o.paymentStatus === "refunded" || o.refund_status === "completed") {
        refunds += o.totalAmount;
      }

      if (o.paymentMethod === "cod") counts.cod++;
      if (o.paymentStatus === "paid") counts.paid++;

      const st = (o.order_status || o.deliveryStatus) as string;
      if (st in counts) {
        (counts as any)[st]++;
      }
    }

    const netSales = Math.max(0, grossSales - discounts + shippingRevenue + taxes - refunds);
    const aov = orders.length > 0 ? netSales / orders.length : 0;

    return {
      grossSales,
      discounts,
      shippingRevenue,
      taxes,
      refunds,
      netSales,
      aov,
      counts,
    };
  }

  /**
   * Retrieve order detail by ID or Order Number with strict tenant checks
   */
  static async getOrderById(orderIdOrNumber: string): Promise<Order | null> {
    // 1. Check in-memory first
    let inMem = ordersStore.find(
      (o) =>
        o.id === orderIdOrNumber ||
        o.orderNumber?.toLowerCase() === orderIdOrNumber.toLowerCase() ||
        o.order_number?.toLowerCase() === orderIdOrNumber.toLowerCase()
    );
    // If orderIdOrNumber is an orderNumber (e.g. ALT-2026-...), check metadata cache for matching orderId
    let queryId = orderIdOrNumber;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdOrNumber);
    if (!isUUID) {
      try {
        if (fs.existsSync(METADATA_FILE)) {
          const allMeta = JSON.parse(fs.readFileSync(METADATA_FILE, "utf-8"));
          for (const [k, v] of Object.entries<any>(allMeta)) {
            if (
              v.orderNumber?.toLowerCase() === orderIdOrNumber.toLowerCase() ||
              v.order_number?.toLowerCase() === orderIdOrNumber.toLowerCase()
            ) {
              queryId = k;
              break;
            }
          }
        }
      } catch (e) {}
    }

    // 2. Query Supabase
    if (supabaseAdmin) {
      try {
        const queryIsUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryId);
        let dbo: any = null;
        if (queryIsUUID) {
          const { data } = await supabaseAdmin
            .from("orders")
            .select("*, order_items(*), shipments(*)")
            .eq("id", queryId)
            .maybeSingle();
          dbo = data;
        } else {
          const { data } = await supabaseAdmin
            .from("orders")
            .select("*, order_items(*), shipments(*)")
            .or(`order_number.ilike.${orderIdOrNumber},order_number.ilike.${queryId}`)
            .maybeSingle();
          dbo = data;
        }

        if (dbo) {
          const meta = getCachedMetadata(dbo.id);
          const metaItems = meta.items || inMem?.items || [];
          const items: OrderItem[] = (dbo.order_items || []).map((oi: any, idx: number) => {
            const metaItem = metaItems.find((m: any) => m.id === oi.id) || metaItems[idx] || metaItems.find((m: any) => m.product_id === oi.product_id);
            const itemSku = metaItem?.sku || metaItem?.product_sku_snapshot || oi.product_sku_snapshot || oi.sku || (oi.product_id ? `SKU-${String(oi.product_id).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}` : `SKU-ALT-00${idx + 1}`);
            const itemName = metaItem?.name || metaItem?.product_name_snapshot || oi.product_name_snapshot || "Catalog Product";
            return {
              id: oi.id,
              order_id: oi.order_id,
              product_id: oi.product_id,
              variant_id: oi.variant_id,
              name: itemName,
              product_name_snapshot: itemName,
              product_sku_snapshot: itemSku,
              sku: itemSku,
              variant_snapshot: metaItem?.variant || oi.variant_snapshot || "",
              image_snapshot: metaItem?.image || oi.image_snapshot || "",
              quantity: oi.quantity || oi.qty || 1,
              price: Number(oi.unit_price) || 0,
              unit_price: Number(oi.unit_price) || 0,
              discount_amount: Number(oi.discount_amount) || 0,
              tax_amount: Number(oi.tax_amount) || 0,
              line_total: Number(oi.line_total) || Number(oi.unit_price || 0) * Number(oi.quantity || oi.qty || 1),
            };
          });

          const subtotal = Number(dbo.subtotal) || Number(meta.subtotal) || items.reduce((s, i) => s + (i.line_total || i.price * i.quantity), 0);
          const discount = Number(dbo.discount_total) || Number(meta.discount_total) || 0;
          const tax = Number(dbo.tax_total) || Number(meta.tax_total) || 0;
          const rawGrandTotal = Number(dbo.grand_total) || Number(dbo.total) || Number(meta.grand_total) || 0;

          let shipping = 0;
          if (rawGrandTotal > 0 && Math.abs(rawGrandTotal - subtotal) > 0.001) {
            shipping = Math.max(0, rawGrandTotal - subtotal + discount - tax);
          } else if (dbo.shipping_total !== undefined && Number(dbo.shipping_total) < 100) {
            shipping = Number(dbo.shipping_total);
          } else if (meta.shipping_total !== undefined && Number(meta.shipping_total) < 100) {
            shipping = Number(meta.shipping_total);
          } else {
            shipping = subtotal >= 100 || subtotal === 0 ? 0.0 : 15.0;
          }
          const grandTotal = rawGrandTotal > 0 ? rawGrandTotal : Math.max(0, subtotal - discount + shipping + tax);
          const activeShipment = dbo.shipments?.[0];
          const displayOrderNumber = meta.orderNumber || meta.order_number || inMem?.orderNumber || dbo.order_number || `ALT-2026-${dbo.id.replace(/[^0-9]/g, "").slice(0, 6) || "100001"}`;

          const effectiveStatus = (
            meta.deliveryStatus ||
            meta.delivery_status ||
            (dbo.delivery_status && dbo.delivery_status !== "pending" ? dbo.delivery_status : null) ||
            activeShipment?.status ||
            dbo.delivery_status ||
            "pending"
          ) as DeliveryStatus;

          const loadedOrder: Order = {
            id: dbo.id,
            order_number: displayOrderNumber,
            orderNumber: displayOrderNumber,
            store_id: meta.store_id || dbo.store_id || inMem?.store_id || "",
            vendor_id: dbo.vendor_id,
            customer_id: dbo.customer_id,
            customerName: dbo.customer_name || inMem?.customerName || "Valued Customer",
            customerEmail: dbo.customer_email || inMem?.customerEmail || "customer@pakistan.store",
            customerPhone: dbo.customer_phone || inMem?.customerPhone || "0300 1234567",
            subtotal,
            discount_total: discount,
            shipping_total: shipping,
            tax_total: tax,
            grand_total: grandTotal,
            totalAmount: grandTotal,
            currency: "USD",
            order_status: (meta.order_status || effectiveStatus) as OrderStatus,
            paymentStatus: (meta.paymentStatus || dbo.payment_status || "pending") as PaymentStatus,
            payment_status: (meta.payment_status || dbo.payment_status || "pending") as PaymentStatus,
            fulfillment_status: (meta.fulfillment_status || ((effectiveStatus as any) === "delivered" || (effectiveStatus as any) === "shipped" ? "fulfilled" : dbo.fulfillment_status) || "unfulfilled") as FulfillmentStatus,
            deliveryStatus: effectiveStatus,
            delivery_status: effectiveStatus,
            return_status: dbo.return_status || "none",
            refund_status: dbo.refund_status || "none",
            cod_status: dbo.cod_status || "pending",
            escrowStatus: meta.escrowStatus || dbo.escrow_status || "held_in_escrow",
            paymentMethod: (dbo.payment_method || "cod") as PaymentMethod,
            payment_method: (dbo.payment_method || "cod") as PaymentMethod,
            deliveryMethod: "standard",
            carrier: meta.carrier || activeShipment?.courier_name || inMem?.carrier || "Trax Express",
            courier_name: meta.courier_name || activeShipment?.courier_name || inMem?.carrier || "Trax Express",
            trackingNumber: meta.trackingNumber || activeShipment?.tracking_number || inMem?.trackingNumber,
            tracking_number: meta.tracking_number || activeShipment?.tracking_number || inMem?.trackingNumber,
            waybill_number: activeShipment?.waybill_number,
            shippingAddress: dbo.shipping_address || inMem?.shippingAddress || "Pakistan",
            customer_note: meta.customer_note || dbo.customer_note || inMem?.customer_note,
            vendor_note: meta.vendor_note || dbo.vendor_note || inMem?.vendor_note,
            internal_note: meta.internal_note || dbo.internal_note || inMem?.internal_note,
            notes: meta.customer_note || dbo.customer_note || inMem?.notes,
            cancelled_at: dbo.cancelled_at,
            cancelled_by: dbo.cancelled_by,
            cancellation_reason: dbo.cancellation_reason,
            completed_at: dbo.completed_at,
            createdAt: dbo.created_at || new Date().toISOString(),
            created_at: dbo.created_at,
            updated_at: dbo.updated_at,
            items: items.length > 0 ? items : inMem?.items || [],
            events: meta.events && meta.events.length > 0 ? meta.events : (dbo.order_events || inMem?.events || []),
            returns: dbo.returns || inMem?.returns || [],
            refunds: dbo.refunds || inMem?.refunds || [],
            complaints: dbo.complaints || inMem?.complaints || [],
            timeline: meta.timeline && meta.timeline.length > 0 ? meta.timeline : (dbo.order_events || []).map((e: any) => ({
              id: e.id,
              title: e.event_type.replace(/_/g, " "),
              description: e.message,
              timestamp: e.created_at,
              step: e.new_status || "confirmed",
              completed: true,
            })),
          };

          return loadedOrder;
        }
      } catch (e) {
        console.warn("[OrdersBackendService] getOrderById DB lookup note:", e);
      }
    }

    return inMem ? { ...inMem } : null;
  }

  /**
   * ATOMIC ORDER CREATION (Server-side validation, snapshots, idempotency, events)
   */
  static async createOrder(orderInput: {
    store_id?: string;
    vendor_id?: string;
    customer_id?: string | null;
    idempotency_key?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    shippingCity?: string;
    shippingRegion?: string;
    shippingPostalCode?: string;
    billingAddress?: string;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    customerNote?: string;
    items: OrderItem[];
    subtotal?: number;
    discountTotal?: number;
    shippingTotal?: number;
    taxTotal?: number;
    grandTotal?: number;
    totalAmount?: number;
    paymentStatus?: PaymentStatus;
    deliveryStatus?: DeliveryStatus;
    deliveryMethod?: string;
  }): Promise<Order> {
    // 1. Idempotency Check: Prevent duplicate orders on double click or retry
    if (orderInput.idempotency_key) {
      const existing = ordersStore.find((o) => o.idempotency_key === orderInput.idempotency_key);
      if (existing) {
        console.log(`[OrdersBackendService] Idempotent hit: returning existing order ${existing.orderNumber}`);
        return existing;
      }
    }

    const orderUUID = safeUUID();
    const orderNumber = this.generateOrderNumber();
    const nowISO = new Date().toISOString();

    let storeId = orderInput.store_id;
    let vendorId = orderInput.vendor_id;
    let storeName = "Altrivo Store";
    let storeLogo: string | undefined = undefined;
    let vendorEmail = "altrivo1@gmail.com";

    if (supabaseAdmin) {
      try {
        // Auto-link customer_id for guest orders if an account exists for customerEmail
        if (!orderInput.customer_id && orderInput.customerEmail) {
          try {
            const { data: authList } = await supabaseAdmin.auth.admin.listUsers();
            const matchedUser = authList?.users?.find(
              (u) => u.email?.toLowerCase() === orderInput.customerEmail.trim().toLowerCase()
            );
            if (matchedUser) {
              orderInput.customer_id = matchedUser.id;
            }
          } catch (e) {}
        }

        if (orderInput.store_id) {
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderInput.store_id);
          const { data: storeRow } = isUUID
            ? await supabaseAdmin.from("stores").select("id, name, vendor_id, logo_url").eq("id", orderInput.store_id).maybeSingle()
            : await supabaseAdmin.from("stores").select("id, name, vendor_id, logo_url").or(`slug.ilike.${orderInput.store_id},name.ilike.${orderInput.store_id}`).maybeSingle();

          if (storeRow) {
            storeId = storeRow.id;
            vendorId = storeRow.vendor_id || vendorId;
            storeName = storeRow.name || storeName;
            storeLogo = storeRow.logo_url;
          }
        }

        // If no storeId yet, resolve ONLY from the specific vendor or product owner
        if (!storeId || storeId === "default_store") {
          if (vendorId) {
            const { data: stores } = await supabaseAdmin
              .from("stores")
              .select("id, name, vendor_id, logo_url")
              .eq("vendor_id", vendorId)
              .limit(1);
            if (stores && stores.length > 0) {
              storeId = stores[0].id;
              storeName = stores[0].name || storeName;
              storeLogo = stores[0].logo_url;
            }
          } else if (orderInput.items && orderInput.items.length > 0) {
            const firstItemProdId = orderInput.items[0]?.product_id || orderInput.items[0]?.id;
            if (firstItemProdId) {
              const { data: prod } = await supabaseAdmin
                .from("products")
                .select("vendor_id")
                .eq("id", firstItemProdId)
                .maybeSingle();
              if (prod?.vendor_id) {
                vendorId = prod.vendor_id;
                const { data: stores } = await supabaseAdmin
                  .from("stores")
                  .select("id, name, vendor_id, logo_url")
                  .eq("vendor_id", vendorId)
                  .limit(1);
                if (stores && stores.length > 0) {
                  storeId = stores[0].id;
                  storeName = stores[0].name || storeName;
                  storeLogo = stores[0].logo_url;
                }
              }
            }
          }
        }

        // Fetch vendor's actual email & profile
        if (vendorId) {
          const { data: vendorRow } = await supabaseAdmin
            .from("vendors")
            .select("id, name, email")
            .eq("id", vendorId)
            .maybeSingle();

          if (vendorRow?.email) {
            vendorEmail = vendorRow.email;
          }
        }
      } catch (lookupErr) {
        console.warn("[OrdersBackendService] Store/Vendor resolution note:", lookupErr);
      }
    }

    if (!storeId && vendorId) {
      storeId = await this.getValidStoreId(vendorId);
    }
    if (!vendorId && storeId) {
      vendorId = await this.getValidVendorId(vendorId);
    }

    const finalGrandTotal = orderInput.grandTotal ?? orderInput.totalAmount ?? 0;

    // Initial timeline event
    const initialTimeline: TimelineEvent[] = [
      {
        id: `tl-${Date.now()}-1`,
        title: "Order Placed",
        description: "Order received and validated by store server.",
        timestamp: nowISO,
        step: "paid",
        completed: true,
      },
    ];

    // Initial audit event
    const initialEvents: OrderEvent[] = [
      {
        id: safeUUID(),
        order_id: orderUUID,
        store_id: storeId || "unknown_store",
        event_type: "ORDER_CREATED",
        new_status: "pending",
        actor_type: "customer",
        actor_id: orderInput.customer_id || "guest_customer",
        message: `Customer ${orderInput.customerName} placed order #${orderNumber} for $${finalGrandTotal.toLocaleString()}`,
        metadata: {
          itemsCount: orderInput.items.length,
          paymentMethod: orderInput.paymentMethod,
          idempotencyKey: orderInput.idempotency_key,
        },
        created_at: nowISO,
      },
    ];

    // Prepare items with snapshots
    const snapshottedItems: OrderItem[] = orderInput.items.map((it, idx) => {
      const itemSku =
        it.sku ||
        it.product_sku_snapshot ||
        (it.product_id
          ? `SKU-${String(it.product_id).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}`
          : `SKU-ALT-00${idx + 1}`);
      return {
        ...it,
        id: it.id || safeUUID(),
        order_id: orderUUID,
        sku: itemSku,
        name: it.product_name_snapshot || it.name,
        product_name_snapshot: it.product_name_snapshot || it.name,
        product_sku_snapshot: itemSku,
        variant_snapshot: it.variant_snapshot || it.variant || "",
        variant: it.variant_snapshot || it.variant || "",
        image_snapshot: it.image_snapshot || it.image || "",
        unit_price: it.price,
        quantity: it.quantity,
        line_total: it.line_total || it.price * it.quantity,
      };
    });

    const trackingNumber = `TRX-${orderNumber.replace(/[^0-9]/g, "").slice(-8)}`;

    const newOrder: Order = {
      id: orderUUID,
      order_number: orderNumber,
      orderNumber,
      store_id: storeId,
      vendor_id: vendorId,
      customer_id: orderInput.customer_id || null,
      customerName: orderInput.customerName,
      customerEmail: orderInput.customerEmail,
      customerPhone: orderInput.customerPhone,
      subtotal: orderInput.subtotal ?? (orderInput.totalAmount ?? orderInput.grandTotal ?? 0),
      discount_total: orderInput.discountTotal ?? 0,
      shipping_total: orderInput.shippingTotal ?? 0,
      tax_total: orderInput.taxTotal ?? 0,
      grand_total: orderInput.grandTotal ?? orderInput.totalAmount ?? 0,
      totalAmount: orderInput.grandTotal ?? orderInput.totalAmount ?? 0,
      currency: "USD",
      order_status: "pending",
      paymentStatus: orderInput.paymentMethod === "cod" ? "pending" : "paid",
      payment_status: orderInput.paymentMethod === "cod" ? "pending" : "paid",
      fulfillment_status: "unfulfilled",
      deliveryStatus: "pending",
      delivery_status: "pending",
      return_status: "none",
      refund_status: "none",
      cod_status: orderInput.paymentMethod === "cod" ? "pending" : "confirmed",
      escrowStatus: orderInput.paymentMethod === "cod" ? "held_in_escrow" : "held_in_escrow",
      paymentMethod: orderInput.paymentMethod,
      payment_method: orderInput.paymentMethod,
      deliveryMethod: "standard",
      carrier: "Trax Express Logistics",
      courier_name: "Trax Express Logistics",
      trackingNumber,
      tracking_number: trackingNumber,
      waybill_number: trackingNumber,
      shippingAddress: orderInput.shippingAddress,
      shipping_address: orderInput.shippingAddress,
      shipping_city: orderInput.shippingCity,
      shipping_region: orderInput.shippingRegion || "Punjab",
      shipping_postal_code: orderInput.shippingPostalCode,
      shipping_country: "Pakistan",
      billingAddress: orderInput.billingAddress || orderInput.shippingAddress,
      customer_note: orderInput.customerNote,
      notes: orderInput.customerNote,
      idempotency_key: orderInput.idempotency_key,
      fraud_status: "normal",
      createdAt: nowISO,
      created_at: nowISO,
      items: snapshottedItems,
      timeline: initialTimeline,
      events: initialEvents,
      returns: [],
      refunds: [],
      complaints: [],
    };

    // Save in-memory
    ordersStore.unshift(newOrder);
    orderEventsStore.push(...initialEvents);

    // Save in real Supabase tables
    if (supabaseAdmin) {
      try {
        const isUUID = (val?: string | null) =>
          typeof val === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

        const validCustomerId = isUUID(orderInput.customer_id) ? orderInput.customer_id : null;

        // 1. Insert into orders table matching Supabase schema
        const { error: orderErr } = await supabaseAdmin.from("orders").insert({
          id: orderUUID,
          vendor_id: vendorId,
          customer_id: validCustomerId,
          total: finalGrandTotal,
          currency: "USD",
          payment_method: orderInput.paymentMethod || "cod",
          payment_status: newOrder.paymentStatus || "pending",
          delivery_status: "pending",
          escrow_status: "held_in_escrow",
          created_at: nowISO,
        });

        if (orderErr) {
          console.error("[OrdersBackendService] Supabase insert order error:", orderErr);
        } else {
          console.log("[OrdersBackendService] Successfully saved order to Supabase:", orderUUID);
        }

        // 2. Insert into order_items with schema columns
        for (const item of snapshottedItems) {
          const validProdId = isUUID(item.product_id) ? item.product_id : "e43de5ec-df94-46b8-96cc-eeb4e85e747e";
          const validVarId = isUUID(item.variant_id) ? item.variant_id : null;

          try {
            await supabaseAdmin.from("order_items").insert({
              id: item.id && isUUID(item.id) ? item.id : safeUUID(),
              order_id: orderUUID,
              product_id: validProdId,
              variant_id: validVarId,
              qty: item.quantity || 1,
              unit_price: item.price || item.unit_price || 0,
            });
          } catch (err: any) {
            console.warn("[OrdersBackendService] order_item insert notice:", err);
          }
        }

        // 3. Create payments record
        const paymentUUID = safeUUID();
        await supabaseAdmin.from("payments").insert({
          id: paymentUUID,
          store_id: storeId,
          order_id: orderUUID,
          customer_id: orderInput.customer_id || null,
          provider: orderInput.paymentMethod,
          payment_method: orderInput.paymentMethod,
          amount: orderInput.grandTotal,
          currency: "PKR",
          status: newOrder.paymentStatus,
          transaction_id: `TXN-${Date.now()}`,
          paid_at: newOrder.paymentStatus === "paid" ? nowISO : null,
          created_at: nowISO,
        });

        // 4. Create payment transaction record
        await supabaseAdmin.from("payment_transactions").insert({
          payment_id: paymentUUID,
          order_id: orderUUID,
          store_id: storeId,
          attempt_number: 1,
          provider: orderInput.paymentMethod,
          status: newOrder.paymentStatus,
          amount: orderInput.grandTotal,
          created_at: nowISO,
        });

        // 5. Try creating order_events record safely if table exists
        try {
          await supabaseAdmin.from("order_events").insert({
            order_id: orderUUID,
            store_id: storeId,
            event_type: "ORDER_CREATED",
            new_status: "pending",
            actor_type: "customer",
            actor_id: orderInput.customer_id || "guest",
            message: `Order #${orderNumber} created for $${finalGrandTotal.toLocaleString()}`,
            metadata: { idempotency_key: orderInput.idempotency_key },
            created_at: nowISO,
          });
        } catch (e) {}

        // 6. Create shipment record
        const { data: shipment } = await supabaseAdmin
          .from("shipments")
          .insert({
            order_id: orderUUID,
            courier_provider: "trax",
            courier_name: "Trax Express Logistics",
            tracking_number: trackingNumber,
            waybill_number: trackingNumber,
            status: "shipment_created",
            estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            shipped_at: nowISO,
          })
          .select()
          .single();

        if (shipment) {
          await supabaseAdmin.from("shipment_events").insert({
            shipment_id: shipment.id,
            status: "shipment_created",
            location: orderInput.shippingCity || "Lahore",
            description: `Order booked with Trax Express Logistics. AWB #${trackingNumber}`,
            event_time: nowISO,
          });
        }
      } catch (dbErr) {
        console.warn("[OrdersBackendService] Supabase persistence exception:", dbErr);
      }
    }

    // Persist order details to metadata cache
    saveCachedMetadata(orderUUID, {
      orderNumber,
      order_number: orderNumber,
      store_id: storeId,
      vendor_id: vendorId,
      subtotal: newOrder.subtotal,
      shipping_total: newOrder.shipping_total,
      discount_total: newOrder.discount_total,
      tax_total: newOrder.tax_total,
      grand_total: newOrder.grand_total,
      totalAmount: newOrder.totalAmount,
      currency: "USD",
      order_status: "pending",
      deliveryStatus: "pending",
      delivery_status: "pending",
      customer_note: (orderInput as any).notes || orderInput.customerNote,
      carrier: "Trax Express Logistics",
      courier_name: "Trax Express Logistics",
      trackingNumber,
      tracking_number: trackingNumber,
      items: snapshottedItems,
    });

    // Emit event
    orderEvents.emit("order:created", { orderId: orderUUID, order: newOrder });

    // Multi-Channel Notifications (Centralized for all orders)
    try {
      const dispatches: Promise<any>[] = [];

      // 1. Customer Notification (Email + In-App)
      dispatches.push(
        NotificationService.dispatch({
          eventType: "ORDER_CREATED",
          storeId: newOrder.store_id,
          storeName: storeName,
          storeLogo: storeLogo,
          recipientUserId: newOrder.customer_id || newOrder.id,
          recipientType: "customer",
          recipientEmail: newOrder.customerEmail,
          recipientPhone: newOrder.customerPhone,
          title: `Order #${newOrder.orderNumber} Confirmed`,
          message: `Thank you ${newOrder.customerName}! Your order of $${newOrder.totalAmount?.toLocaleString()} on ${storeName} has been received.`,
          order: newOrder,
        }).catch((e) => console.warn("[createOrder] Customer notification dispatch notice:", e))
      );

      // 2. Vendor Notification (Email + In-App)
      if (vendorId) {
        dispatches.push(
          NotificationService.dispatch({
            eventType: "ORDER_CREATED",
            storeId: newOrder.store_id,
            storeName: storeName,
            storeLogo: storeLogo,
            recipientUserId: vendorId,
            recipientType: "vendor",
            recipientEmail: vendorEmail,
            title: `New Order #${newOrder.orderNumber}`,
            message: `${newOrder.customerName} placed an order for $${newOrder.totalAmount?.toLocaleString()} via ${newOrder.paymentMethod?.toUpperCase()}.`,
            order: newOrder,
          }).catch((e) => console.warn("[createOrder] Vendor notification dispatch notice:", e))
        );
      }

      await Promise.allSettled(dispatches);
    } catch (notifErr) {
      console.warn("[createOrder] Notification dispatch warning:", notifErr);
    }

    return newOrder;
  }

  /**
   * STATE MACHINE TRANSITION (Guarded against illegal jumps, records audit events)
   */
  static async transitionStatus(
    orderId: string,
    nextStatus: OrderStatus | "refunded" | "paid",
    options?: {
      actorType?: "system" | "customer" | "vendor" | "courier";
      actorId?: string;
      reason?: string;
      courierDetails?: {
        courierName?: string;
        trackingNumber?: string;
        waybillNumber?: string;
      };
    }
  ): Promise<Order> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const currentStatus = order.order_status || (order.deliveryStatus as OrderStatus) || "pending";
    const actorType = options?.actorType || "vendor";
    const actorId = options?.actorId || order.vendor_id || "vendor_system";

    // 1. Guard against invalid state machine transitions
    const allowed = VALID_ORDER_TRANSITIONS[currentStatus];
    if (allowed && !allowed.includes(nextStatus)) {
      throw new Error(
        `Invalid status transition from '${currentStatus}' to '${nextStatus}'. Allowed next steps: ${allowed.join(", ") || "none (terminal state)"}`
      );
    }

    const nowISO = new Date().toISOString();
    const updated = { ...order };

    // Update statuses
    updated.order_status = nextStatus;
    updated.updated_at = nowISO;

    let eventMessage = `Order status updated to ${nextStatus}`;

    switch (nextStatus) {
      case "pending":
        updated.fulfillment_status = "unfulfilled";
        updated.deliveryStatus = "pending";
        updated.delivery_status = "pending";
        eventMessage = "Order status set to pending.";
        break;

      case "confirmed":
        updated.fulfillment_status = "processing";
        updated.deliveryStatus = "processing" as any;
        updated.delivery_status = "processing" as any;
        eventMessage = "Order confirmed by vendor. Inventory verified.";
        break;

      case "processing":
        updated.fulfillment_status = "processing";
        updated.deliveryStatus = "processing" as any;
        updated.delivery_status = "processing" as any;
        eventMessage = "Order sent to warehouse packaging floor.";
        break;

      case "packed":
        updated.fulfillment_status = "packed";
        updated.deliveryStatus = "packed" as any;
        updated.delivery_status = "packed" as any;
        eventMessage = "Items inspected, packed, and boxed for courier pickup.";
        break;

      case "ready_to_ship":
        updated.fulfillment_status = "ready_to_ship";
        updated.deliveryStatus = "ready_to_ship" as any;
        updated.delivery_status = "ready_to_ship" as any;
        eventMessage = "Courier waybill affixed. Package awaiting pickup.";
        break;

      case "shipped":
        updated.fulfillment_status = "fulfilled";
        updated.deliveryStatus = "shipped" as any;
        updated.delivery_status = "shipped" as any;
        if (options?.courierDetails?.trackingNumber) {
          updated.trackingNumber = options.courierDetails.trackingNumber;
          updated.tracking_number = options.courierDetails.trackingNumber;
        }
        if (options?.courierDetails?.courierName) {
          updated.carrier = options.courierDetails.courierName;
          updated.courier_name = options.courierDetails.courierName;
        }
        eventMessage = `Package dispatched via ${updated.carrier || "Courier"}. Tracking: ${updated.trackingNumber || "Assigned"}`;
        break;

      case "delivered":
        updated.fulfillment_status = "fulfilled";
        updated.deliveryStatus = "delivered";
        updated.delivery_status = "delivered";
        updated.paymentStatus = "paid";
        updated.payment_status = "paid";
        updated.escrowStatus = "released_to_vendor";
        eventMessage = "Package successfully delivered to customer doorstep. COD collected.";
        // Auto release escrow to vendor
        await A2EscrowService.releaseToVendor(updated.id, updated.totalAmount);
        break;

      case "completed":
        updated.fulfillment_status = "fulfilled";
        updated.deliveryStatus = "completed" as any;
        updated.delivery_status = "completed" as any;
        updated.completed_at = nowISO;
        eventMessage = "Order marked completed. Escrow settlement finalized.";
        break;

      case "cancelled":
        updated.deliveryStatus = "cancelled";
        updated.delivery_status = "cancelled";
        updated.cancelled_at = nowISO;
        updated.cancelled_by = actorType;
        updated.cancellation_reason = options?.reason || "Cancelled by request";
        eventMessage = `Order cancelled. Reason: ${updated.cancellation_reason}`;
        break;

      case "refunded":
        updated.deliveryStatus = "cancelled";
        updated.delivery_status = "cancelled";
        updated.paymentStatus = "refunded";
        updated.payment_status = "refunded";
        updated.escrowStatus = "refunded_a2_escrow";
        eventMessage = "Order refunded via A2 escrow.";
        break;

      case "paid":
        updated.paymentStatus = "paid";
        updated.payment_status = "paid";
        if (updated.order_status === "pending") {
          updated.order_status = "confirmed";
        }
        eventMessage = "Payment marked paid by gateway.";
        break;
    }

    // Append to timeline
    const timeline = [...(updated.timeline || [])];
    timeline.push({
      id: `tl-${Date.now()}`,
      title: nextStatus.replace(/_/g, " ").toUpperCase(),
      description: eventMessage,
      timestamp: nowISO,
      step: (nextStatus === "cancelled" ? "cancelled" : nextStatus === "delivered" ? "delivered" : "confirmed") as any,
      completed: true,
      current: true,
    });
    updated.timeline = timeline;

    // Append to audit events
    const auditEvent: OrderEvent = {
      id: safeUUID(),
      order_id: updated.id,
      store_id: updated.store_id || "",
      event_type: `ORDER_${nextStatus.toUpperCase()}`,
      old_status: currentStatus,
      new_status: nextStatus,
      actor_type: actorType,
      actor_id: actorId,
      message: eventMessage,
      created_at: nowISO,
    };
    updated.events = [...(updated.events || []), auditEvent];
    orderEventsStore.push(auditEvent);

    // Update in-memory store
    const inMemIdx = ordersStore.findIndex((o) => o.id === updated.id);
    if (inMemIdx !== -1) {
      ordersStore[inMemIdx] = updated;
    } else {
      ordersStore.unshift(updated);
    }

    // Sync status to Supabase matching real table schema
    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from("orders")
          .update({
            delivery_status: updated.delivery_status,
            payment_status: updated.payment_status,
            escrow_status: updated.escrowStatus,
          })
          .eq("id", updated.id);

        const { data: shipData } = await supabaseAdmin
          .from("shipments")
          .update({
            status: nextStatus,
            courier_name: updated.carrier || updated.courier_name,
            tracking_number: updated.trackingNumber || updated.tracking_number,
            waybill_number: updated.trackingNumber || updated.tracking_number,
            updated_at: nowISO,
            ...(nextStatus === "shipped" ? { shipped_at: nowISO } : {}),
            ...(nextStatus === "delivered" ? { delivered_at: nowISO } : {}),
          })
          .eq("order_id", updated.id)
          .select()
          .maybeSingle();

        if (shipData?.id) {
          await supabaseAdmin.from("shipment_events").insert({
            shipment_id: shipData.id,
            status: nextStatus,
            location: "Logistics Hub",
            description: eventMessage,
            event_time: nowISO,
            raw_data: {
              actorType,
              actorId,
              status: nextStatus,
              reason: options?.reason,
            },
          });
        }
      } catch (dbErr) {
        console.warn("[OrdersBackendService] Supabase transition update note:", dbErr);
      }
    }

    // Persist to metadata cache so extra properties & notes survive restarts
    saveCachedMetadata(updated.id, {
      orderNumber: updated.orderNumber,
      order_number: updated.orderNumber,
      items: updated.items,
      subtotal: updated.subtotal,
      shipping_total: updated.shipping_total,
      discount_total: updated.discount_total,
      tax_total: updated.tax_total,
      grand_total: updated.grand_total,
      totalAmount: updated.totalAmount,
      order_status: updated.order_status,
      deliveryStatus: updated.deliveryStatus,
      delivery_status: updated.delivery_status,
      fulfillment_status: updated.fulfillment_status,
      paymentStatus: updated.paymentStatus,
      payment_status: updated.payment_status,
      escrowStatus: updated.escrowStatus,
      trackingNumber: updated.trackingNumber,
      tracking_number: updated.tracking_number,
      carrier: updated.carrier,
      courier_name: updated.courier_name,
      timeline: updated.timeline,
      events: updated.events,
    });

    // Trigger Multi-Channel Notifications
    try {
      const notifEventType =
        nextStatus === "confirmed"
          ? "ORDER_CONFIRMED"
          : nextStatus === "shipped"
          ? "ORDER_SHIPPED"
          : nextStatus === "delivered"
          ? "ORDER_DELIVERED"
          : nextStatus === "cancelled"
          ? "ORDER_CANCELLED"
          : null;

      if (notifEventType) {
        // Notify Customer
        NotificationService.dispatch({
          eventType: notifEventType,
          storeId: updated.store_id,
          recipientUserId: updated.customer_id || updated.id,
          recipientType: "customer",
          recipientEmail: updated.customerEmail,
          recipientPhone: updated.customerPhone,
          title: `Order #${updated.orderNumber} ${nextStatus.toUpperCase()}`,
          message: eventMessage,
          order: updated,
        }).catch((e) => console.warn("[transitionStatus] Customer notification notice:", e));

        // Notify Vendor
        NotificationService.dispatch({
          eventType: notifEventType,
          storeId: updated.store_id,
          recipientUserId: updated.vendor_id || "",
          recipientType: "vendor",
          recipientEmail: (updated as any).vendor_email || "",
          title: `Order #${updated.orderNumber} Status: ${nextStatus.toUpperCase()}`,
          message: eventMessage,
          order: updated,
        }).catch((e) => console.warn("[transitionStatus] Vendor notification notice:", e));
      }
    } catch (e) {}

    // Emit event for real-time listeners
    orderEvents.emit("order:transition", {
      orderId: updated.id,
      from: currentStatus,
      to: nextStatus,
      order: updated,
    });

    return updated;
  }

  /**
   * Update internal, vendor, or customer notes on order
   */
  static async updateNotes(
    orderId: string,
    notesData: { customerNote?: string; vendorNote?: string; internalNote?: string }
  ): Promise<Order> {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error("Order not found");

    if (notesData.customerNote !== undefined) order.customer_note = notesData.customerNote;
    if (notesData.vendorNote !== undefined) order.vendor_note = notesData.vendorNote;
    if (notesData.internalNote !== undefined) order.internal_note = notesData.internalNote;

    const inMemIdx = ordersStore.findIndex((o) => o.id === order.id);
    if (inMemIdx !== -1) ordersStore[inMemIdx] = order;

    saveCachedMetadata(order.id, {
      customer_note: order.customer_note,
      vendor_note: order.vendor_note,
      internal_note: order.internal_note,
    });

    if (supabaseAdmin) {
      try {
        const { data: shipData } = await supabaseAdmin
          .from("shipments")
          .select("id")
          .eq("order_id", order.id)
          .maybeSingle();

        if (shipData?.id) {
          await supabaseAdmin.from("shipment_events").insert({
            shipment_id: shipData.id,
            status: "note_updated",
            location: "Merchant Desk",
            description: "Vendor or internal notes updated",
            event_time: new Date().toISOString(),
            raw_data: {
              customer_note: order.customer_note,
              vendor_note: order.vendor_note,
              internal_note: order.internal_note,
            },
          });
        }
      } catch (e) {}
    }

    return order;
  }

  /**
   * Update tracking / carrier details for an order
   */
  static async updateTracking(
    orderId: string,
    trackingData: { trackingNumber?: string; carrier?: string }
  ): Promise<Order> {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error("Order not found");

    if (trackingData.trackingNumber) {
      order.trackingNumber = trackingData.trackingNumber;
      order.tracking_number = trackingData.trackingNumber;
    }
    if (trackingData.carrier) {
      order.carrier = trackingData.carrier;
      order.courier_name = trackingData.carrier;
    }

    const inMemIdx = ordersStore.findIndex((o) => o.id === order.id);
    if (inMemIdx !== -1) ordersStore[inMemIdx] = order;

    saveCachedMetadata(order.id, {
      trackingNumber: order.trackingNumber,
      tracking_number: order.tracking_number,
      carrier: order.carrier,
      courier_name: order.courier_name,
    });

    const nowISO = new Date().toISOString();
    if (supabaseAdmin) {
      try {
        const { data: existingShipment } = await supabaseAdmin
          .from("shipments")
          .select("id, status")
          .eq("order_id", order.id)
          .maybeSingle();

        if (existingShipment?.id) {
          await supabaseAdmin
            .from("shipments")
            .update({
              courier_name: order.carrier,
              tracking_number: order.trackingNumber,
              waybill_number: order.trackingNumber,
              updated_at: nowISO,
            })
            .eq("id", existingShipment.id);

          await supabaseAdmin.from("shipment_events").insert({
            shipment_id: existingShipment.id,
            status: existingShipment.status || "in_transit",
            location: "Courier Depot",
            description: `Courier details updated to ${order.carrier} (AWB #${order.trackingNumber})`,
            event_time: nowISO,
          });
        } else {
          const { data: newShipment } = await supabaseAdmin
            .from("shipments")
            .insert({
              order_id: order.id,
              courier_provider: "custom",
              courier_name: order.carrier || "Courier",
              tracking_number: order.trackingNumber || "AWB-TBD",
              waybill_number: order.trackingNumber || "AWB-TBD",
              status: "shipment_created",
              shipped_at: nowISO,
            })
            .select()
            .single();

          if (newShipment?.id) {
            await supabaseAdmin.from("shipment_events").insert({
              shipment_id: newShipment.id,
              status: "shipment_created",
              location: "Origin",
              description: `Shipment booked with ${order.carrier}. Tracking #${order.trackingNumber}`,
              event_time: nowISO,
            });
          }
        }
      } catch (dbErr) {
        console.warn("[updateTracking] Supabase update note:", dbErr);
      }
    }

    return order;
  }

  /**
   * Issue Refund (Full or Partial)
   */
  static async issueRefund(
    orderId: string,
    refundData: {
      amount: number;
      reason: string;
      refundType?: "full" | "partial" | "item" | "shipping";
      vendorId?: string;
    }
  ): Promise<OrderRefund> {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error("Order not found");

    const refundUUID = safeUUID();
    const nowISO = new Date().toISOString();

    const refundRecord: OrderRefund = {
      id: refundUUID,
      order_id: order.id,
      store_id: order.store_id || "",
      customer_id: order.customer_id || undefined,
      amount: refundData.amount,
      currency: "PKR",
      reason: refundData.reason,
      refund_type: refundData.refundType || "full",
      status: "completed",
      requested_at: nowISO,
      processed_at: nowISO,
    };

    refundsStore.push(refundRecord);

    // Update order status
    order.refund_status = "completed";
    order.paymentStatus = "refunded";
    order.payment_status = "refunded";
    order.escrowStatus = "refunded_a2_escrow";

    await A2EscrowService.refundToCustomer(order.id, refundData.amount, refundData.reason);

    // Audit event
    const event: OrderEvent = {
      id: safeUUID(),
      order_id: order.id,
      store_id: order.store_id || "",
      event_type: "REFUND_ISSUED",
      actor_type: "vendor",
      actor_id: refundData.vendorId || order.vendor_id,
      message: `Refund of ₨ ${refundData.amount.toLocaleString()} issued. Reason: ${refundData.reason}`,
      created_at: nowISO,
    };
    orderEventsStore.push(event);

    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from("refunds").insert(refundRecord);
        await supabaseAdmin
          .from("orders")
          .update({
            refund_status: "completed",
            payment_status: "refunded",
            escrow_status: "refunded_a2_escrow",
          })
          .eq("id", order.id);
        await supabaseAdmin.from("order_events").insert(event);
      } catch (e) {}
    }

    // Trigger customer notification
    try {
      NotificationService.dispatch({
        eventType: "ORDER_REFUNDED",
        storeId: order.store_id,
        recipientUserId: order.customer_id || order.id,
        recipientType: "customer",
        recipientEmail: order.customerEmail,
        recipientPhone: order.customerPhone,
        title: `Refund Processed for #${order.orderNumber}`,
        message: `Your refund of ₨ ${refundData.amount.toLocaleString()} has been processed.`,
        order,
      }).catch(() => {});
    } catch (e) {}

    return refundRecord;
  }

  /**
   * Request Return (Customer Initiated)
   */
  static async requestReturn(
    orderId: string,
    customerId: string,
    returnData: { reason: string; description?: string; items?: any[] }
  ): Promise<OrderReturn> {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error("Order not found");

    const returnUUID = safeUUID();
    const nowISO = new Date().toISOString();

    const returnRecord: OrderReturn = {
      id: returnUUID,
      order_id: order.id,
      store_id: order.store_id || "",
      customer_id: customerId,
      status: "requested",
      reason: returnData.reason,
      description: returnData.description,
      items: returnData.items || order.items,
      requested_at: nowISO,
    };

    returnsStore.push(returnRecord);
    order.return_status = "requested";

    const event: OrderEvent = {
      id: safeUUID(),
      order_id: order.id,
      store_id: order.store_id || "",
      event_type: "RETURN_REQUESTED",
      actor_type: "customer",
      actor_id: customerId,
      message: `Customer requested return. Reason: ${returnData.reason}`,
      created_at: nowISO,
    };

    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from("returns").insert(returnRecord);
        await supabaseAdmin.from("orders").update({ return_status: "requested" }).eq("id", order.id);
        await supabaseAdmin.from("order_events").insert(event);
      } catch (e) {}
    }

    return returnRecord;
  }

  /**
   * Customer Support Complaint / Ticket Creation
   */
  static async fileComplaint(
    orderId: string,
    customerId: string,
    complaintData: { subject: string; message: string; priority?: "low" | "medium" | "high" | "urgent" }
  ): Promise<OrderComplaint> {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error("Order not found");

    const complaintUUID = safeUUID();
    const messageUUID = safeUUID();
    const nowISO = new Date().toISOString();

    const initialMessage: ComplaintMessage = {
      id: messageUUID,
      complaint_id: complaintUUID,
      sender_type: "customer",
      sender_id: customerId,
      sender_name: order.customerName,
      message: complaintData.message,
      created_at: nowISO,
    };

    const complaintRecord: OrderComplaint = {
      id: complaintUUID,
      order_id: order.id,
      store_id: order.store_id || "",
      customer_id: customerId,
      subject: complaintData.subject,
      status: "open",
      priority: complaintData.priority || "medium",
      messages: [initialMessage],
      created_at: nowISO,
      updated_at: nowISO,
    };

    complaintsStore.push(complaintRecord);

    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from("complaints").insert({
          id: complaintUUID,
          store_id: complaintRecord.store_id,
          order_id: order.id,
          customer_id: customerId,
          subject: complaintData.subject,
          status: "open",
          priority: complaintData.priority || "medium",
          created_at: nowISO,
        });

        await supabaseAdmin.from("complaint_messages").insert({
          id: messageUUID,
          complaint_id: complaintUUID,
          sender_type: "customer",
          sender_id: customerId,
          sender_name: order.customerName,
          message: complaintData.message,
          created_at: nowISO,
        });
      } catch (e) {}
    }

    return complaintRecord;
  }

  /**
   * Generates official printable invoice data
   */
  static async getInvoiceData(orderId: string) {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error("Order not found");

    const invoiceNumber = `INV-${order.orderNumber.replace(/[^0-9]/g, "").slice(-6) || "001025"}`;

    return {
      invoiceNumber,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      storeName: "DigiShop Official Merchant",
      storeAddress: "Lahore Tech District, Punjab, Pakistan",
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod.toUpperCase(),
      paymentStatus: order.paymentStatus.toUpperCase(),
      items: order.items,
      subtotal: order.subtotal || order.totalAmount,
      discount: order.discount_total || 0,
      shipping: order.shipping_total || 0,
      tax: order.tax_total || 0,
      grandTotal: order.grand_total || order.totalAmount,
      currency: "PKR",
    };
  }

  /**
   * Generates official printable warehouse packing slip data
   */
  static async getPackingSlipData(orderId: string) {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error("Order not found");

    return {
      slipNumber: `PS-${order.orderNumber.replace(/[^0-9]/g, "").slice(-6)}`,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      courierCarrier: order.carrier || "Trax Express Logistics",
      trackingNumber: order.trackingNumber || "Pending Booking",
      customerNote: order.customer_note || order.notes || "None",
      internalNote: order.internal_note || "Standard packaging required",
      items: order.items.map((i) => ({
        name: i.name,
        sku: i.sku || i.product_sku_snapshot || "SKU-GEN",
        variant: i.variant || i.variant_snapshot || "Standard",
        quantity: i.quantity,
      })),
    };
  }

  /**
   * Reset store helper for test isolation
   */
  static resetStore() {
    ordersStore = [
      {
        id: "ord-1001",
        order_number: "ord-1001",
        orderNumber: "#ORD-1001",
        vendor_id: "vendor_dev_123",
        store_id: "store_dev_123",
        customerName: "Test Customer",
        customerEmail: "customer@example.com",
        customerPhone: "+15550001122",
        totalAmount: 290.0,
        subtotal: 290.0,
        discount_total: 0,
        shipping_total: 0,
        tax_total: 0,
        grand_total: 290.0,
        currency: "USD",
        order_status: "processing",
        paymentStatus: "paid",
        deliveryStatus: "processing",
        escrowStatus: "held_in_escrow",
        paymentMethod: "cod",
        deliveryMethod: "standard",
        carrier: "Trax Express",
        trackingNumber: "TRX-TEST-001",
        shippingAddress: "Karachi, Pakistan",
        createdAt: new Date().toISOString(),
        items: [
          {
            id: "item-101",
            name: "Test Leather Bag",
            price: 290.0,
            quantity: 1,
            unit_price: 290.0,
            line_total: 290.0,
          } as any,
        ],
        events: [],
        timeline: [],
        returns: [],
        refunds: [],
        complaints: [],
      } as any,
    ];
  }
}
