import { Order, OrderStatus, PaymentStatus, PaymentMethod, DeliveryMethod, TimelineEvent } from "@/types/orders";

export const INITIAL_ORDERS: Order[] = [];

let nextOrderSeq = 8943;

export function generateMockOrder(): Order {
  const seq = nextOrderSeq++;
  const name = "Incoming Live Customer";
  const email = `live.customer.${seq}@example.com`;
  const total = 290.0;

  return {
    id: `ord-${Date.now()}`,
    orderNumber: `#ORD-${seq}`,
    customerName: name,
    customerEmail: email,
    customerPhone: "+15550001122",
    totalAmount: total,
    paymentStatus: "paid",
    paymentMethod: "stripe",
    escrowStatus: "held_in_escrow",
    deliveryStatus: "processing",
    deliveryMethod: "express",
    carrier: "FedEx Express",
    trackingNumber: `TRK-LIVE-${seq}`,
    createdAt: new Date().toISOString(),
    shippingAddress: "100 New Live Stream St, San Jose, CA 95113",
    billingAddress: "100 New Live Stream St, San Jose, CA 95113",
    items: [
      {
        id: `item-${Date.now()}`,
        name: "Abstract Canvas Painting (24x36)",
        quantity: 1,
        price: 290.0,
        sku: "ART-ABS-2436",
      },
    ],
    notes: "Real-time incoming customer order via Supabase",
    isNew: true,
    timeline: [
      {
        id: "t1",
        title: "Order Placed & Paid",
        description: "Live real-time payment confirmed. Funds deposited into A2 Escrow.",
        timestamp: new Date().toISOString(),
        step: "paid",
        completed: true,
      },
      {
        id: "t2",
        title: "Order Confirmed",
        description: "Awaiting vendor processing.",
        timestamp: new Date().toISOString(),
        step: "confirmed",
        completed: true,
        current: true,
      },
      {
        id: "t3",
        title: "Shipped & In Transit",
        description: "Pending shipment.",
        timestamp: "",
        step: "shipped",
        completed: false,
      },
      {
        id: "t4",
        title: "Delivered to Customer",
        description: "Pending delivery.",
        timestamp: "",
        step: "delivered",
        completed: false,
      },
    ],
  };
}

export function getOrderById(idOrNumber: string): Order | undefined {
  const normalized = idOrNumber.trim().toLowerCase();
  return INITIAL_ORDERS.find(
    (o) =>
      o.id.toLowerCase() === normalized ||
      o.orderNumber.toLowerCase() === normalized ||
      o.orderNumber.toLowerCase().replace("#", "") === normalized.replace("#", "")
  );
}
