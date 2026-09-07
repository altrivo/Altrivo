import { NextRequest, NextResponse } from "next/server";
import { OrdersBackendService } from "@/services/orders-backend-service";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing order ID" }, { status: 400 });
    }

    // 1. Fetch the order
    const order = await OrdersBackendService.getOrderById(orderId);

    // 2. Check DB shipments
    let shipmentData: any = null;
    let events: any[] = [];

    if (supabaseAdmin) {
      try {
        const { data: dbShipment } = await supabaseAdmin
          .from("shipments")
          .select("*")
          .eq("order_id", orderId)
          .maybeSingle();

        if (dbShipment) {
          shipmentData = dbShipment;
          const { data: dbEvents } = await supabaseAdmin
            .from("shipment_events")
            .select("*")
            .eq("shipment_id", dbShipment.id)
            .order("event_time", { ascending: true });
          events = dbEvents || [];
        }
      } catch (e) {}
    }

    const trackingNumber = shipmentData?.tracking_number || `TRX-${orderId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
    const courierName = shipmentData?.courier_name || "Trax Express Logistics";
    const status = shipmentData?.status || (order ? order.deliveryStatus : "processing");

    // Standard courier tracking timeline steps
    const steps = [
      {
        key: "order_placed",
        title: "Order Placed",
        description: "Customer placed the order",
        timestamp: order?.createdAt || new Date().toISOString(),
        completed: true,
      },
      {
        key: "confirmed",
        title: "Order Confirmed",
        description: "Vendor confirmed inventory and packed items",
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        completed: status !== "pending",
      },
      {
        key: "shipment_created",
        title: "Shipment Created",
        description: `Booking generated with ${courierName}. Waybill #${trackingNumber}`,
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        completed: ["shipped", "delivered", "out_for_delivery"].includes(status),
      },
      {
        key: "in_transit",
        title: "In Transit",
        description: "Package received at hub and routed to delivery station",
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        completed: ["shipped", "delivered", "out_for_delivery"].includes(status),
      },
      {
        key: "out_for_delivery",
        title: "Out for Delivery",
        description: "Rider dispatched with parcel for doorstep dropoff",
        timestamp: new Date().toISOString(),
        completed: ["delivered", "out_for_delivery"].includes(status),
      },
      {
        key: "delivered",
        title: "Delivered",
        description: "Successfully handed over to recipient",
        timestamp: shipmentData?.delivered_at || null,
        completed: status === "delivered" || status === "completed",
      },
    ];

    return NextResponse.json({
      success: true,
      order,
      tracking: {
        trackingNumber,
        courierName,
        courierProvider: "trax",
        status,
        estimatedDelivery: "2-4 Business Days",
        steps,
        events,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
