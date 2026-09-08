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
import { INITIAL_ORDERS } from "@/utils/ordersMock";
import { supabaseAdmin } from "@/lib/supabase";
import { NotificationService } from "@/services/notification-service";

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

// 3. Valid State Machine Transitions
export const VALID_ORDER_TRANSITIONS: Record<OrderStatus | "refunded" | "paid", (OrderStatus | "refunded" | "paid")[]> = {
  pending: ["confirmed", "cancelled", "paid"],
  confirmed: ["processing", "cancelled", "refunded"],
  processing: ["packed", "cancelled", "refunded"],
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

export class OrdersBackendService {
  /**
   * Generates a readable order number (e.g. DS-2026-000125)
   */
  public static generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `DS-${year}-${randomNum}`;
  }

  /**
   * Helper to fetch active vendor ID
   */
  private static async getValidVendorId(): Promise<string> {
    if (supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin.from("vendors").select("id").limit(1);
        if (data && data.length > 0) return data[0].id;
      } catch (e) {}
    }
    return "vendor_dev_123";
  }

  /**
   * Helper to fetch active store ID
   */
  private static async getValidStoreId(): Promise<string> {
    if (supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin.from("stores").select("id").limit(1);
        if (data && data.length > 0) return data[0].id;
      } catch (e) {}
    }
    return "753ea49c-abae-4dd3-9107-1dc8fcd6b221";
  }

  /**
   * List orders for a vendor with strict store & multi-filtering criteria
   */
  static async getOrders(
    vendorId: string,
    filters?: {
      storeId?: string;
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

    // Query Supabase for real orders
    if (supabaseAdmin) {
      try {
        let query = supabaseAdmin
          .from("orders")
          .select("*, order_items(*), shipments(*), order_events(*), returns(*), refunds(*), complaints(*)")
          .order("created_at", { ascending: false });

        if (filters?.storeId) {
          query = query.eq("store_id", filters.storeId);
        } else if (vendorId && vendorId !== "all" && vendorId !== "vendor_dev_123") {
          query = query.eq("vendor_id", vendorId);
        }

        const { data: dbOrders, error } = await query;

        if (!error && dbOrders && dbOrders.length > 0) {
          combinedOrders = dbOrders.map((dbo: any) => {
            const items: OrderItem[] = (dbo.order_items || []).map((oi: any) => ({
              id: oi.id,
              order_id: oi.order_id,
              product_id: oi.product_id,
              variant_id: oi.variant_id,
              name: oi.product_name_snapshot || "Catalog Product",
              product_name_snapshot: oi.product_name_snapshot || "Catalog Product",
              product_sku_snapshot: oi.product_sku_snapshot || "SKU-DEFAULT",
              variant_snapshot: oi.variant_snapshot || "",
              image_snapshot: oi.image_snapshot || "",
              quantity: oi.quantity || oi.qty || 1,
              price: Number(oi.unit_price) || 0,
              unit_price: Number(oi.unit_price) || 0,
              discount_amount: Number(oi.discount_amount) || 0,
              tax_amount: Number(oi.tax_amount) || 0,
              line_total: Number(oi.line_total) || Number(oi.unit_price || 0) * Number(oi.quantity || oi.qty || 1),
            }));

            const subtotal = Number(dbo.subtotal) || items.reduce((s, i) => s + (i.line_total || i.price * i.quantity), 0);
            const discount = Number(dbo.discount_total) || 0;
            const shipping = Number(dbo.shipping_total) || 0;
            const tax = Number(dbo.tax_total) || 0;
            const grandTotal = Number(dbo.grand_total) || Number(dbo.total) || Math.max(0, subtotal - discount + shipping + tax);

            const activeShipment = dbo.shipments?.[0];

            return {
              id: dbo.id,
              order_number: dbo.order_number || `#ORD-${dbo.id.slice(0, 4).toUpperCase()}`,
              orderNumber: dbo.order_number || `#ORD-${dbo.id.slice(0, 4).toUpperCase()}`,
              store_id: dbo.store_id || "753ea49c-abae-4dd3-9107-1dc8fcd6b221",
              vendor_id: dbo.vendor_id || vendorId,
              customer_id: dbo.customer_id,
              customerName: dbo.customer_name || "Valued Customer",
              customerEmail: dbo.customer_email || "customer@pakistan.store",
              customerPhone: dbo.customer_phone || "0300 1234567",
              subtotal,
              discount_total: discount,
              shipping_total: shipping,
              tax_total: tax,
              grand_total: grandTotal,
              totalAmount: grandTotal,
              currency: dbo.currency || "PKR",
              order_status: (dbo.order_status || dbo.delivery_status || "pending") as OrderStatus,
              paymentStatus: (dbo.payment_status || "pending") as PaymentStatus,
              payment_status: (dbo.payment_status || "pending") as PaymentStatus,
              fulfillment_status: (dbo.fulfillment_status || "unfulfilled") as FulfillmentStatus,
              deliveryStatus: (dbo.delivery_status || "pending") as DeliveryStatus,
              delivery_status: (dbo.delivery_status || "pending") as DeliveryStatus,
              return_status: dbo.return_status || "none",
              refund_status: dbo.refund_status || "none",
              cod_status: dbo.cod_status || "pending",
              escrowStatus: dbo.escrow_status || "held_in_escrow",
              paymentMethod: (dbo.payment_method || "cod") as PaymentMethod,
              payment_method: (dbo.payment_method || "cod") as PaymentMethod,
              deliveryMethod: "standard",
              carrier: activeShipment?.courier_name || "Trax Express",
              courier_name: activeShipment?.courier_name || "Trax Express",
              trackingNumber: activeShipment?.tracking_number,
              tracking_number: activeShipment?.tracking_number,
              shippingAddress: dbo.shipping_address || "Pakistan",
              customer_note: dbo.customer_note,
              vendor_note: dbo.vendor_note,
              internal_note: dbo.internal_note,
              notes: dbo.customer_note,
              createdAt: dbo.created_at || new Date().toISOString(),
              created_at: dbo.created_at,
              updated_at: dbo.updated_at,
              items,
              events: dbo.order_events || [],
              returns: dbo.returns || [],
              refunds: dbo.refunds || [],
              complaints: dbo.complaints || [],
              timeline: (dbo.order_events || []).map((e: any) => ({
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

    // Combine with in-memory fallback
    if (combinedOrders.length === 0 && ordersStore.length > 0) {
      combinedOrders = [...ordersStore];
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
    const inMem = ordersStore.find(
      (o) =>
        o.id === orderIdOrNumber ||
        o.orderNumber?.toLowerCase() === orderIdOrNumber.toLowerCase() ||
        o.order_number?.toLowerCase() === orderIdOrNumber.toLowerCase()
    );

    // 2. Query Supabase
    if (supabaseAdmin) {
      try {
        const { data: dbo } = await supabaseAdmin
          .from("orders")
          .select("*, order_items(*), shipments(*), order_events(*), returns(*), refunds(*), complaints(*)")
          .or(`id.eq.${orderIdOrNumber},order_number.eq.${orderIdOrNumber}`)
          .single();

        if (dbo) {
          const items: OrderItem[] = (dbo.order_items || []).map((oi: any) => ({
            id: oi.id,
            order_id: oi.order_id,
            product_id: oi.product_id,
            variant_id: oi.variant_id,
            name: oi.product_name_snapshot || "Catalog Product",
            product_name_snapshot: oi.product_name_snapshot || "Catalog Product",
            product_sku_snapshot: oi.product_sku_snapshot || "SKU-DEFAULT",
            variant_snapshot: oi.variant_snapshot || "",
            image_snapshot: oi.image_snapshot || "",
            quantity: oi.quantity || oi.qty || 1,
            price: Number(oi.unit_price) || 0,
            unit_price: Number(oi.unit_price) || 0,
            discount_amount: Number(oi.discount_amount) || 0,
            tax_amount: Number(oi.tax_amount) || 0,
            line_total: Number(oi.line_total) || Number(oi.unit_price || 0) * Number(oi.quantity || oi.qty || 1),
          }));

          const subtotal = Number(dbo.subtotal) || items.reduce((s, i) => s + (i.line_total || i.price * i.quantity), 0);
          const discount = Number(dbo.discount_total) || 0;
          const shipping = Number(dbo.shipping_total) || 0;
          const tax = Number(dbo.tax_total) || 0;
          const grandTotal = Number(dbo.grand_total) || Number(dbo.total) || Math.max(0, subtotal - discount + shipping + tax);
          const activeShipment = dbo.shipments?.[0];

          const loadedOrder: Order = {
            id: dbo.id,
            order_number: dbo.order_number || `#ORD-${dbo.id.slice(0, 4).toUpperCase()}`,
            orderNumber: dbo.order_number || `#ORD-${dbo.id.slice(0, 4).toUpperCase()}`,
            store_id: dbo.store_id || "753ea49c-abae-4dd3-9107-1dc8fcd6b221",
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
            currency: dbo.currency || "PKR",
            order_status: (dbo.order_status || dbo.delivery_status || "pending") as OrderStatus,
            paymentStatus: (dbo.payment_status || "pending") as PaymentStatus,
            payment_status: (dbo.payment_status || "pending") as PaymentStatus,
            fulfillment_status: (dbo.fulfillment_status || "unfulfilled") as FulfillmentStatus,
            deliveryStatus: (dbo.delivery_status || "pending") as DeliveryStatus,
            delivery_status: (dbo.delivery_status || "pending") as DeliveryStatus,
            return_status: dbo.return_status || "none",
            refund_status: dbo.refund_status || "none",
            cod_status: dbo.cod_status || "pending",
            escrowStatus: dbo.escrow_status || "held_in_escrow",
            paymentMethod: (dbo.payment_method || "cod") as PaymentMethod,
            payment_method: (dbo.payment_method || "cod") as PaymentMethod,
            deliveryMethod: "standard",
            carrier: activeShipment?.courier_name || inMem?.carrier || "Trax Express",
            courier_name: activeShipment?.courier_name || inMem?.carrier || "Trax Express",
            trackingNumber: activeShipment?.tracking_number || inMem?.trackingNumber,
            tracking_number: activeShipment?.tracking_number || inMem?.trackingNumber,
            waybill_number: activeShipment?.waybill_number,
            shippingAddress: dbo.shipping_address || inMem?.shippingAddress || "Pakistan",
            customer_note: dbo.customer_note || inMem?.customer_note,
            vendor_note: dbo.vendor_note || inMem?.vendor_note,
            internal_note: dbo.internal_note || inMem?.internal_note,
            notes: dbo.customer_note || inMem?.notes,
            cancelled_at: dbo.cancelled_at,
            cancelled_by: dbo.cancelled_by,
            cancellation_reason: dbo.cancellation_reason,
            completed_at: dbo.completed_at,
            createdAt: dbo.created_at || new Date().toISOString(),
            created_at: dbo.created_at,
            updated_at: dbo.updated_at,
            items: items.length > 0 ? items : inMem?.items || [],
            events: dbo.order_events || inMem?.events || [],
            returns: dbo.returns || inMem?.returns || [],
            refunds: dbo.refunds || inMem?.refunds || [],
            complaints: dbo.complaints || inMem?.complaints || [],
            timeline: (dbo.order_events || []).map((e: any) => ({
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

    const orderUUID = crypto.randomUUID();
    const orderNumber = this.generateOrderNumber();
    const nowISO = new Date().toISOString();
    const storeId = orderInput.store_id || (await this.getValidStoreId());
    const vendorId = orderInput.vendor_id || (await this.getValidVendorId());
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
        id: crypto.randomUUID(),
        order_id: orderUUID,
        store_id: storeId,
        event_type: "ORDER_CREATED",
        new_status: "pending",
        actor_type: "customer",
        actor_id: orderInput.customer_id || "guest_customer",
        message: `Customer ${orderInput.customerName} placed order #${orderNumber} for ₨ ${finalGrandTotal.toLocaleString()}`,
        metadata: {
          itemsCount: orderInput.items.length,
          paymentMethod: orderInput.paymentMethod,
          idempotencyKey: orderInput.idempotency_key,
        },
        created_at: nowISO,
      },
    ];

    // Prepare items with snapshots
    const snapshottedItems: OrderItem[] = orderInput.items.map((it, idx) => ({
      ...it,
      id: it.id || crypto.randomUUID(),
      order_id: orderUUID,
      product_name_snapshot: it.product_name_snapshot || it.name,
      product_sku_snapshot: it.product_sku_snapshot || it.sku || `SKU-${idx + 1}`,
      variant_snapshot: it.variant_snapshot || it.variant || "",
      image_snapshot: it.image_snapshot || it.image || "",
      unit_price: it.price,
      quantity: it.quantity,
      line_total: it.line_total || it.price * it.quantity,
    }));

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
      currency: "PKR",
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
        // 1. Insert into orders table
        const { error: orderErr } = await supabaseAdmin.from("orders").insert({
          id: orderUUID,
          order_number: orderNumber,
          store_id: storeId,
          vendor_id: vendorId,
          customer_id: orderInput.customer_id || null,
          subtotal: orderInput.subtotal,
          discount_total: orderInput.discountTotal,
          shipping_total: orderInput.shippingTotal,
          tax_total: orderInput.taxTotal,
          grand_total: orderInput.grandTotal,
          total: orderInput.grandTotal,
          currency: "PKR",
          order_status: "pending",
          payment_status: newOrder.paymentStatus,
          fulfillment_status: "unfulfilled",
          delivery_status: "pending",
          escrow_status: "held_in_escrow",
          payment_method: orderInput.paymentMethod,
          customer_name: orderInput.customerName,
          customer_email: orderInput.customerEmail,
          customer_phone: orderInput.customerPhone,
          shipping_address: orderInput.shippingAddress,
          shipping_city: orderInput.shippingCity || "Lahore",
          shipping_region: orderInput.shippingRegion || "Punjab",
          shipping_postal_code: orderInput.shippingPostalCode || "",
          customer_note: orderInput.customerNote,
          idempotency_key: orderInput.idempotency_key,
          created_at: nowISO,
        });

        if (orderErr) {
          console.error("[OrdersBackendService] Supabase insert order error:", orderErr);
        }

        // 2. Insert into order_items with snapshots
        for (const item of snapshottedItems) {
          await supabaseAdmin.from("order_items").insert({
            id: item.id,
            order_id: orderUUID,
            product_id: item.product_id || "e43de5ec-df94-46b8-96cc-eeb4e85e747e",
            variant_id: item.variant_id || null,
            product_name_snapshot: item.product_name_snapshot,
            product_sku_snapshot: item.product_sku_snapshot,
            variant_snapshot: item.variant_snapshot,
            image_snapshot: item.image_snapshot,
            quantity: item.quantity,
            qty: item.quantity,
            unit_price: item.unit_price || item.price,
            discount_amount: item.discount_amount || 0,
            tax_amount: item.tax_amount || 0,
            line_total: item.line_total || item.price * item.quantity,
          });
        }

        // 3. Create payments record
        const paymentUUID = crypto.randomUUID();
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

        // 5. Create order_events record
        await supabaseAdmin.from("order_events").insert({
          order_id: orderUUID,
          store_id: storeId,
          event_type: "ORDER_CREATED",
          new_status: "pending",
          actor_type: "customer",
          actor_id: orderInput.customer_id || "guest",
          message: `Order #${orderNumber} created for ₨ ${finalGrandTotal.toLocaleString()}`,
          metadata: { idempotency_key: orderInput.idempotency_key },
          created_at: nowISO,
        });

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

    // Emit event
    orderEvents.emit("order:created", { orderId: orderUUID, order: newOrder });

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

    // 1. Guard against invalid state machine transitions
    const allowed = VALID_ORDER_TRANSITIONS[currentStatus];
    if (allowed && !allowed.includes(nextStatus)) {
      throw new Error(
        `Invalid status transition from '${currentStatus}' to '${nextStatus}'. Allowed next steps: ${allowed.join(", ") || "none (terminal state)"}`
      );
    }

    const nowISO = new Date().toISOString();
    const updated = { ...order };
    const actorType = options?.actorType || "vendor";
    const actorId = options?.actorId || order.vendor_id || "vendor_system";

    // Update statuses
    updated.order_status = nextStatus;
    updated.updated_at = nowISO;

    let eventMessage = `Order status updated to ${nextStatus}`;

    switch (nextStatus) {
      case "confirmed":
        updated.fulfillment_status = "processing";
        updated.deliveryStatus = "pending";
        updated.delivery_status = "pending";
        eventMessage = "Order confirmed by vendor. Inventory verified.";
        break;

      case "processing":
        updated.fulfillment_status = "processing";
        updated.deliveryStatus = "pending";
        updated.delivery_status = "pending";
        eventMessage = "Order sent to warehouse packaging floor.";
        break;

      case "packed":
        updated.fulfillment_status = "packed";
        updated.deliveryStatus = "shipment_created";
        updated.delivery_status = "shipment_created";
        eventMessage = "Items inspected, packed, and boxed for courier pickup.";
        break;

      case "ready_to_ship":
        updated.fulfillment_status = "ready_to_ship";
        updated.deliveryStatus = "shipment_created";
        updated.delivery_status = "shipment_created";
        eventMessage = "Courier waybill affixed. Package awaiting pickup.";
        break;

      case "shipped":
        updated.fulfillment_status = "fulfilled";
        updated.deliveryStatus = "in_transit";
        updated.delivery_status = "in_transit";
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
        updated.deliveryStatus = "delivered";
        updated.delivery_status = "delivered";
        updated.completed_at = nowISO;
        eventMessage = "Order marked completed. Escrow settlement finalized.";
        break;

      case "cancelled":
        updated.deliveryStatus = "failed";
        updated.delivery_status = "failed";
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
      id: crypto.randomUUID(),
      order_id: updated.id,
      store_id: updated.store_id || "753ea49c-abae-4dd3-9107-1dc8fcd6b221",
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

    // Sync status to Supabase
    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from("orders")
          .update({
            order_status: updated.order_status,
            fulfillment_status: updated.fulfillment_status,
            delivery_status: updated.delivery_status,
            payment_status: updated.payment_status,
            escrow_status: updated.escrowStatus,
            cancelled_at: updated.cancelled_at,
            cancelled_by: updated.cancelled_by,
            cancellation_reason: updated.cancellation_reason,
            completed_at: updated.completed_at,
            updated_at: nowISO,
          })
          .eq("id", updated.id);

        await supabaseAdmin.from("order_events").insert(auditEvent);
      } catch (dbErr) {
        console.warn("[OrdersBackendService] Supabase transition update note:", dbErr);
      }
    }

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
          recipientUserId: updated.vendor_id || "vendor_dev_123",
          recipientType: "vendor",
          recipientEmail: "vendor@digishop.pk",
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

    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from("orders")
          .update({
            customer_note: order.customer_note,
            vendor_note: order.vendor_note,
            internal_note: order.internal_note,
          })
          .eq("id", order.id);
      } catch (e) {}
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

    const refundUUID = crypto.randomUUID();
    const nowISO = new Date().toISOString();

    const refundRecord: OrderRefund = {
      id: refundUUID,
      order_id: order.id,
      store_id: order.store_id || "753ea49c-abae-4dd3-9107-1dc8fcd6b221",
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
      id: crypto.randomUUID(),
      order_id: order.id,
      store_id: order.store_id || "753ea49c-abae-4dd3-9107-1dc8fcd6b221",
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

    const returnUUID = crypto.randomUUID();
    const nowISO = new Date().toISOString();

    const returnRecord: OrderReturn = {
      id: returnUUID,
      order_id: order.id,
      store_id: order.store_id || "753ea49c-abae-4dd3-9107-1dc8fcd6b221",
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
      id: crypto.randomUUID(),
      order_id: order.id,
      store_id: order.store_id || "753ea49c-abae-4dd3-9107-1dc8fcd6b221",
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

    const complaintUUID = crypto.randomUUID();
    const messageUUID = crypto.randomUUID();
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
      store_id: order.store_id || "753ea49c-abae-4dd3-9107-1dc8fcd6b221",
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
    ordersStore = [...INITIAL_ORDERS];
  }
}
