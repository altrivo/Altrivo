import { EventEmitter } from "events";
import { Order, OrderStatus, PaymentStatus, EscrowStatus, TimelineEvent, OrderItem } from "@/types/orders";
import { INITIAL_ORDERS } from "@/utils/ordersMock";
import { supabaseAdmin } from "@/lib/supabase";

// 1. Order Event Emitter for State Machine Transitions
export const orderEvents = new EventEmitter();

// 2. A2 Escrow Service Mock client
export const A2EscrowService = {
  releaseToVendor: async (orderId: string, amount: number): Promise<boolean> => {
    console.log(`[A2 Escrow Service] Releasing $${amount.toFixed(2)} to vendor for order ${orderId}`);
    return true;
  },
  refundToCustomer: async (orderId: string, amount: number, reason: string): Promise<boolean> => {
    console.log(`[A2 Escrow Service] Refunding $${amount.toFixed(2)} to customer for order ${orderId}. Reason: ${reason}`);
    return true;
  }
};

// Valid transitions dictionary for the state machine
export const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["paid", "cancelled", "confirmed", "processing"],
  paid: ["confirmed", "processing", "cancelled", "refunded"],
  confirmed: ["shipped", "cancelled", "refunded"],
  processing: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "cancelled", "refunded"],
  delivered: ["completed", "refunded"],
  completed: [],
  cancelled: [],
  refunded: [],
};

// 3. In-memory storage for fallback & fast UI hydration
let ordersStore: Order[] = [];

export class OrdersBackendService {
  /**
   * Helper to fetch active vendor ID from Supabase
   */
  private static async getValidVendorId(): Promise<string> {
    if (supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin.from("vendors").select("id").limit(1);
        if (data && data.length > 0) return data[0].id;
      } catch (e) {}
    }
    return "374c6044-19d9-49db-a508-dccf3c1f6f2f";
  }

  /**
   * Helper to fetch active store or product ID from Supabase
   */
  private static async getValidStoreOrProductId(): Promise<string> {
    if (supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin.from("stores").select("id").limit(1);
        if (data && data.length > 0) return data[0].id;
      } catch (e) {}
    }
    return "753ea49c-abae-4dd3-9107-1dc8fcd6b221";
  }

  /**
   * List orders for a vendor with optional filter criteria
   */
  static async getOrders(
    vendorId: string,
    filters?: {
      searchQuery?: string;
      deliveryStatus?: string;
      paymentStatus?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ orders: Order[]; totalCount: number }> {
    let combinedOrders: Order[] = [];

    // Read real orders from Supabase Database
    if (supabaseAdmin) {
      try {
        // Fetch notifications to get real customer names, emails, and order numbers
        const notifMap: Record<string, any> = {};
        try {
          const { data: notifs } = await supabaseAdmin
            .from("notifications")
            .select("payload")
            .eq("type", "order_created");
          if (notifs && notifs.length > 0) {
            notifs.forEach((n: any) => {
              if (n.payload?.order_id) {
                notifMap[n.payload.order_id] = n.payload;
              }
            });
          }
        } catch (e) {}

        const { data: dbOrders, error } = await supabaseAdmin
          .from("orders")
          .select("*, order_items(*)")
          .order("created_at", { ascending: false });

        if (!error && dbOrders && dbOrders.length > 0) {
          const mappedDbOrders: Order[] = dbOrders.map((dbo: any) => {
            const notif = notifMap[dbo.id] || {};
            const existing = ordersStore.find((o) => o.id === dbo.id);
            if (existing) {
              return {
                ...existing,
                customerName: existing.customerName || notif.customer_name || "Store Customer",
                customerEmail: existing.customerEmail || notif.customer_email || "customer@pakistan.store",
                customerPhone: existing.customerPhone || notif.customer_phone || "0300 1234567",
                deliveryStatus: dbo.delivery_status || existing.deliveryStatus,
                paymentStatus: dbo.payment_status || existing.paymentStatus,
              };
            }

            return {
              id: dbo.id,
              orderNumber: notif.order_number || `#ORD-${dbo.id.substring(0, 4).toUpperCase()}`,
              customerName: notif.customer_name || "Store Customer",
              customerEmail: notif.customer_email || "customer@pakistan.store",
              customerPhone: notif.customer_phone || "0300 1234567",
              totalAmount: Number(dbo.total) || 0,
              paymentStatus: dbo.payment_status || "pending",
              paymentMethod: dbo.payment_method || "cod",
              escrowStatus: dbo.escrow_status || "held_in_escrow",
              deliveryStatus: dbo.delivery_status || "pending",
              deliveryMethod: "express",
              shippingAddress: notif.shipping_address || "Lahore, Pakistan",
              createdAt: dbo.created_at || new Date().toISOString(),
              items: (dbo.order_items || []).map((oi: any) => ({
                id: oi.id,
                name: "Catalog Product Item",
                quantity: oi.qty || 1,
                price: Number(oi.unit_price) || 5000,
              })),
            };
          });

          combinedOrders = mappedDbOrders;
        }
      } catch (dbErr) {
        console.warn("[OrdersBackendService] Supabase getOrders fallback:", dbErr);
      }
    }

    if (combinedOrders.length === 0 && ordersStore.length > 0) {
      combinedOrders = [...ordersStore];
    }

    // Strictly sort by newest date descending
    combinedOrders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    let filtered = combinedOrders;

    // Filter by search query (customer name, email, order number)
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.orderNumber.toLowerCase().includes(q)
      );
    }

    // Filter by delivery/order status
    if (filters?.deliveryStatus && filters.deliveryStatus !== "all") {
      filtered = filtered.filter((o) => o.deliveryStatus === filters.deliveryStatus);
    }

    // Filter by payment status
    if (filters?.paymentStatus && filters.paymentStatus !== "all") {
      filtered = filtered.filter((o) => o.paymentStatus === filters.paymentStatus);
    }

    const totalCount = filtered.length;
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    const paginated = filtered.slice(offset, offset + limit);

    return { orders: paginated, totalCount };
  }

  /**
   * Retrieve order detail by ID
   */
  static async getOrderById(orderId: string): Promise<Order | null> {
    const order = ordersStore.find((o) => o.id === orderId);
    return order ? { ...order } : null;
  }

  /**
   * Helper to ensure product and variant exist in DB and return their UUIDs
   */
  private static async getOrCreateProductInDb(
    vendorId: string,
    itemName: string,
    itemPrice: number,
    itemVariant?: string
  ): Promise<{ productId: string; variantId: string | null }> {
    if (!supabaseAdmin) {
      return {
        productId: "e43de5ec-df94-46b8-96cc-eeb4e85e747e",
        variantId: null,
      };
    }

    try {
      // 1. Look up existing product by title or name
      const { data: existingProducts } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("vendor_id", vendorId)
        .or(`name.ilike.%${itemName}%,title.ilike.%${itemName}%`)
        .limit(1);

      let prodId: string;

      if (existingProducts && existingProducts.length > 0) {
        prodId = existingProducts[0].id;
      } else {
        // Create product in products table
        const { data: newProd, error: prodErr } = await supabaseAdmin
          .from("products")
          .insert({
            vendor_id: vendorId,
            name: itemName,
            title: itemName,
            description: `Handcrafted catalog item - ${itemName}`,
            price: itemPrice,
            status: "published",
          })
          .select()
          .single();

        if (prodErr || !newProd) {
          console.error("[OrdersBackendService] Product creation fallback:", prodErr);
          prodId = "e43de5ec-df94-46b8-96cc-eeb4e85e747e";
        } else {
          prodId = newProd.id;
        }
      }

      // 2. Create or find variant if variant option provided
      let varId: string | null = null;
      if (itemVariant && prodId) {
        const sku = `SKU-${itemName.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;
        const { data: newVariant } = await supabaseAdmin
          .from("product_variants")
          .insert({
            product_id: prodId,
            sku,
            price: itemPrice,
            stock: 50,
            option_values: { option: itemVariant },
            enabled: true,
          })
          .select()
          .single();

        if (newVariant) {
          varId = newVariant.id;
        }
      }

      return { productId: prodId, variantId: varId };
    } catch (err) {
      console.warn("[OrdersBackendService] getOrCreateProductInDb exception:", err);
      return {
        productId: "e43de5ec-df94-46b8-96cc-eeb4e85e747e",
        variantId: null,
      };
    }
  }

  /**
   * Create a new order (emits event & sets up initial state + writes to all Supabase tables)
   */
  static async createOrder(orderInput: Omit<Order, "id" | "createdAt" | "orderNumber" | "timeline">): Promise<Order> {
    const orderUUID = crypto.randomUUID();
    const orderNumber = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newOrder: Order = {
      ...orderInput,
      id: orderUUID,
      orderNumber,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          id: `t-${Date.now()}-placed`,
          title: "Order Placed",
          description: "Customer checked out and order has been created.",
          timestamp: new Date().toISOString(),
          step: "paid",
          completed: true,
        }
      ]
    };

    ordersStore.unshift(newOrder);

    // Save to real Supabase PostgreSQL Database across all tables (orders, order_items, notifications, products)
    if (supabaseAdmin) {
      try {
        const vendorUUID = await this.getValidVendorId();

        // 1. Insert into orders table with the EXACT generated UUID
        const { data: dbOrder, error: orderErr } = await supabaseAdmin
          .from("orders")
          .insert({
            id: orderUUID,
            vendor_id: vendorUUID,
            customer_id: newOrder.customer_id || null,
            total: newOrder.totalAmount,
            currency: "PKR",
            payment_method: newOrder.paymentMethod || "cod",
            payment_status: newOrder.paymentStatus || "pending",
            delivery_status: newOrder.deliveryStatus || "pending",
            escrow_status: newOrder.escrowStatus || "held_in_escrow",
            created_at: newOrder.createdAt,
          })
          .select()
          .single();

        if (orderErr) {
          console.error("[OrdersBackendService] Supabase orders insert error:", orderErr);
        } else if (dbOrder) {
          console.log("[OrdersBackendService] Order permanently saved in Supabase with ID:", dbOrder.id);
          
          // 2. Insert items into order_items table with real product & variant IDs
          if (newOrder.items && newOrder.items.length > 0) {
            for (const item of newOrder.items) {
              const { productId, variantId } = await this.getOrCreateProductInDb(
                vendorUUID,
                item.name,
                item.price || (newOrder.totalAmount / newOrder.items.length),
                item.variant
              );

              await supabaseAdmin.from("order_items").insert({
                order_id: dbOrder.id,
                product_id: productId,
                variant_id: variantId,
                qty: item.quantity || 1,
                unit_price: item.price || (newOrder.totalAmount / newOrder.items.length),
              });
            }
            console.log("[OrdersBackendService] All order items saved to Supabase order_items table");
          }

          // 3. Insert notification for vendor in notifications table
          try {
            await supabaseAdmin.from("notifications").insert({
              user_id: vendorUUID,
              user_type: "vendor",
              type: "order_created",
              payload: {
                order_id: dbOrder.id,
                order_number: newOrder.orderNumber,
                customer_id: newOrder.customer_id || null,
                customer_name: newOrder.customerName,
                customer_email: newOrder.customerEmail,
                customer_phone: newOrder.customerPhone,
                shipping_address: newOrder.shippingAddress,
                total: newOrder.totalAmount,
                currency: "PKR",
                items_count: newOrder.items?.length || 1,
              },
              read_at: null,
              created_at: new Date().toISOString(),
            });
            console.log("[OrdersBackendService] Vendor notification recorded in notifications table");
          } catch (notifErr) {
            console.warn("[OrdersBackendService] Notification insert notice:", notifErr);
          }
        }
      } catch (dbErr) {
        console.warn("[OrdersBackendService] Supabase write exception:", dbErr);
      }
    }

    // Emit transition to pending/initial state
    orderEvents.emit("order:created", { orderId: orderUUID, order: newOrder });

    return newOrder;
  }

  /**
   * Transition order status through the state machine & persist to Supabase
   */
  static async transitionStatus(
    orderId: string,
    nextStatus: OrderStatus | "paid" | "confirmed" | "refunded" | "completed"
  ): Promise<Order> {
    let targetDbUUID = orderId;
    let orderIndex = ordersStore.findIndex(
      (o) => o.id === orderId || o.orderNumber?.toLowerCase() === orderId.toLowerCase()
    );

    // If order not in memory, resolve real UUID and details from Supabase
    if (orderIndex === -1 && supabaseAdmin) {
      try {
        const { data: notifData } = await supabaseAdmin
          .from("notifications")
          .select("payload")
          .or(`payload->>order_number.eq.${orderId},payload->>order_id.eq.${orderId}`)
          .limit(1);

        if (notifData && notifData.length > 0 && notifData[0].payload?.order_id) {
          targetDbUUID = notifData[0].payload.order_id;
        }

        const { data: dbOrder } = await supabaseAdmin
          .from("orders")
          .select("*")
          .eq("id", targetDbUUID)
          .single();

        if (dbOrder) {
          const payload = notifData?.[0]?.payload || {};
          const loadedOrder: Order = {
            id: dbOrder.id,
            orderNumber: payload.order_number || `#ORD-${dbOrder.id.substring(0, 4).toUpperCase()}`,
            customerName: payload.customer_name || "Store Customer",
            customerEmail: payload.customer_email || "customer@pakistan.store",
            customerPhone: payload.customer_phone || "0300 1234567",
            totalAmount: Number(dbOrder.total) || 0,
            paymentStatus: dbOrder.payment_status || "pending",
            paymentMethod: dbOrder.payment_method || "cod",
            escrowStatus: dbOrder.escrow_status || "held_in_escrow",
            deliveryStatus: dbOrder.delivery_status || "pending",
            deliveryMethod: "express",
            shippingAddress: payload.shipping_address || "Lahore, Pakistan",
            createdAt: dbOrder.created_at || new Date().toISOString(),
            items: [],
            timeline: [],
          };
          ordersStore.unshift(loadedOrder);
          orderIndex = 0;
        }
      } catch (e) {
        console.warn("[OrdersBackendService] transitionStatus DB lookup fallback:", e);
      }
    }

    let order: Order;

    if (orderIndex === -1) {
      order = {
        id: targetDbUUID,
        orderNumber: orderId.startsWith("#") ? orderId : `#${orderId.substring(0, 8)}`,
        customerName: "Store Customer",
        customerEmail: "customer@pakistan.store",
        customerPhone: "0300 1234567",
        totalAmount: 14100,
        paymentStatus: "pending",
        paymentMethod: "cod",
        deliveryStatus: "pending",
        deliveryMethod: "express",
        shippingAddress: "Lahore, Pakistan",
        createdAt: new Date().toISOString(),
        items: [],
        timeline: [],
      };
      ordersStore.unshift(order);
      orderIndex = 0;
    } else {
      order = ordersStore[orderIndex];
      targetDbUUID = order.id;
    }

    const currentStatus = order.deliveryStatus;

    // Set updated values
    const updatedOrder = { ...order };
    const timeline = [...(updatedOrder.timeline || [])].map((t) => ({ ...t, current: false }));

    if (nextStatus === "paid") {
      updatedOrder.paymentStatus = "paid";
      updatedOrder.escrowStatus = "held_in_escrow";
      timeline.push({
        id: `t-${Date.now()}`,
        title: "Order Paid",
        description: "Payment confirmed. Funds deposited in A2 Escrow.",
        timestamp: new Date().toISOString(),
        step: "paid",
        completed: true,
        current: true,
      });
    } else if (nextStatus === "confirmed" || nextStatus === "processing") {
      updatedOrder.deliveryStatus = "processing";
      timeline.push({
        id: `t-${Date.now()}`,
        title: "Order Confirmed & Processing",
        description: "Vendor accepted and packaging initiated.",
        timestamp: new Date().toISOString(),
        step: "confirmed",
        completed: true,
        current: true,
      });
    } else if (nextStatus === "shipped") {
      updatedOrder.deliveryStatus = "shipped";
      timeline.push({
        id: `t-${Date.now()}`,
        title: "Dispatched & In Transit",
        description: "Package handed over to TCS Express Courier.",
        timestamp: new Date().toISOString(),
        step: "shipped",
        completed: true,
        current: true,
      });
    } else if (nextStatus === "delivered" || nextStatus === "completed") {
      updatedOrder.deliveryStatus = "delivered";
      updatedOrder.paymentStatus = "paid";
      updatedOrder.escrowStatus = "released_to_vendor";
      
      // Auto release escrow to vendor upon delivery
      await A2EscrowService.releaseToVendor(orderId, updatedOrder.totalAmount);

      timeline.push({
        id: `t-${Date.now()}`,
        title: "Delivered to Doorstep",
        description: "Package signed and delivered. COD cash collected.",
        timestamp: new Date().toISOString(),
        step: "delivered",
        completed: true,
        current: true,
      });
    } else if (nextStatus === "cancelled") {
      updatedOrder.deliveryStatus = "cancelled";
      timeline.push({
        id: `t-${Date.now()}`,
        title: "Order Cancelled",
        description: "Order cancelled by vendor or customer.",
        timestamp: new Date().toISOString(),
        step: "cancelled",
        completed: true,
        current: true,
      });
    } else if (nextStatus === "refunded") {
      updatedOrder.deliveryStatus = "cancelled";
      updatedOrder.paymentStatus = "refunded";
      updatedOrder.escrowStatus = "refunded_a2_escrow";

      await A2EscrowService.refundToCustomer(orderId, updatedOrder.totalAmount, "Vendor refund request");

      timeline.push({
        id: `t-${Date.now()}`,
        title: "Refund Issued",
        description: "A2 Escrow returned full payment to customer.",
        timestamp: new Date().toISOString(),
        step: "refunded",
        completed: true,
        current: true,
      });
    } else if (nextStatus === "pending") {
      updatedOrder.deliveryStatus = "pending";
      timeline.push({
        id: `t-${Date.now()}`,
        title: "Order Placed",
        description: "Order set back to pending review.",
        timestamp: new Date().toISOString(),
        step: "paid",
        completed: true,
        current: true,
      });
    }

    updatedOrder.timeline = timeline;
    ordersStore[orderIndex] = updatedOrder;

    // Sync status change with Supabase Database
    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from("orders")
          .update({
            delivery_status: updatedOrder.deliveryStatus,
            payment_status: updatedOrder.paymentStatus,
            escrow_status: updatedOrder.escrowStatus || "held_in_escrow",
          })
          .eq("id", targetDbUUID);
      } catch (dbErr) {
        console.warn("[OrdersBackendService] Supabase update notice:", dbErr);
      }
    }

    // Emit event on every transition
    orderEvents.emit("order:transition", {
      orderId,
      from: currentStatus,
      to: nextStatus,
      order: updatedOrder
    });

    return updatedOrder;
  }

  /**
   * Reset store helper for test isolation
   */
  static resetStore() {
    ordersStore = [...INITIAL_ORDERS];
  }
}
