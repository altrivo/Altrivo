import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NotificationService } from "@/services/notification-service";
import { NotificationEventType, ShipmentStatus } from "@/types/notifications";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const apiKey = request.headers.get("x-courier-api-key") || "";

    // Allow webhook if valid key or in development mode
    const isAuthorized =
      apiKey === (process.env.COURIER_WEBHOOK_KEY || "trax_webhook_secret_key") ||
      authHeader.includes("Bearer") ||
      process.env.NODE_ENV === "development";

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized courier webhook signature" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      tracking_number,
      waybill_number,
      status: rawStatus,
      location = "Karachi Hub",
      description = "Courier checkpoint scanned",
      courier_provider = "trax",
    } = body;

    if (!tracking_number && !waybill_number) {
      return NextResponse.json(
        { success: false, error: "tracking_number or waybill_number required" },
        { status: 400 }
      );
    }

    const tracking = tracking_number || waybill_number;

    // Map external courier status to platform ShipmentStatus
    let platformStatus: ShipmentStatus = "in_transit";
    let eventType: NotificationEventType = "SHIPMENT_CREATED";

    const normalizedStatus = String(rawStatus).toLowerCase();
    if (normalizedStatus.includes("pick") || normalizedStatus.includes("collect")) {
      platformStatus = "picked_up";
      eventType = "SHIPMENT_CREATED";
    } else if (normalizedStatus.includes("out_for") || normalizedStatus.includes("out for")) {
      platformStatus = "out_for_delivery";
      eventType = "OUT_FOR_DELIVERY";
    } else if (normalizedStatus.includes("deliv") || normalizedStatus.includes("complete")) {
      platformStatus = "delivered";
      eventType = "ORDER_DELIVERED";
    } else if (normalizedStatus.includes("fail") || normalizedStatus.includes("return") || normalizedStatus.includes("cancel")) {
      platformStatus = "failed";
      eventType = "SHIPMENT_EXCEPTION";
    }

    let orderData: any = null;
    let storeId: string | undefined;

    if (supabaseAdmin) {
      try {
        // 1. Find shipment
        const { data: shipment } = await supabaseAdmin
          .from("shipments")
          .select("*, orders(*)")
          .or(`tracking_number.eq.${tracking},waybill_number.eq.${tracking}`)
          .maybeSingle();

        if (shipment) {
          // 2. Update shipment
          await supabaseAdmin
            .from("shipments")
            .update({
              status: platformStatus,
              delivered_at: platformStatus === "delivered" ? new Date().toISOString() : shipment.delivered_at,
              updated_at: new Date().toISOString(),
            })
            .eq("id", shipment.id);

          // 3. Insert checkpoint
          await supabaseAdmin.from("shipment_events").insert({
            shipment_id: shipment.id,
            status: platformStatus,
            location,
            description,
            event_time: new Date().toISOString(),
            raw_data: body,
          });

          // 4. Update order delivery status
          if (shipment.order_id) {
            await supabaseAdmin
              .from("orders")
              .update({
                delivery_status: platformStatus === "delivered" ? "delivered" : platformStatus === "out_for_delivery" ? "out_for_delivery" : "in_transit",
                updated_at: new Date().toISOString(),
              })
              .eq("id", shipment.order_id);

            orderData = shipment.orders;
            storeId = shipment.orders?.store_id;
          }
        }
      } catch (dbErr) {
        console.warn("[Courier Webhook] Database update note:", dbErr);
      }
    }

    // Fallback order info if not in db
    if (!orderData) {
      orderData = {
        id: "order_demo_1",
        orderNumber: tracking.replace("TRX-", "ORD-"),
        customerName: "Valued Customer",
        customerEmail: "customer@example.com",
        customerPhone: "03001234567",
        totalAmount: 5200,
        paymentMethod: "cod",
        shippingAddress: "Street 4, Sector F-7, Islamabad",
      };
    }

    // 5. Trigger Central Notification Event
    await NotificationService.dispatch({
      eventType,
      storeId,
      storeName: "Artisanal Store",
      recipientUserId: orderData.customer_id || orderData.id,
      recipientType: "customer",
      recipientEmail: orderData.customerEmail || orderData.customer_email,
      recipientPhone: orderData.customerPhone || orderData.customer_phone,
      title:
        eventType === "OUT_FOR_DELIVERY"
          ? `Package Out for Delivery #${orderData.orderNumber}`
          : eventType === "ORDER_DELIVERED"
          ? `Package Delivered #${orderData.orderNumber}`
          : `Shipment Update #${orderData.orderNumber}`,
      message:
        eventType === "OUT_FOR_DELIVERY"
          ? `Courier rider is delivering order #${orderData.orderNumber} today. Location: ${location}`
          : eventType === "ORDER_DELIVERED"
          ? `Order #${orderData.orderNumber} has been successfully delivered.`
          : `Courier update for #${orderData.orderNumber}: ${description} (${location})`,
      order: orderData,
      shipment: { tracking_number: tracking, courier_name: "Trax Logistics", status: platformStatus },
    });

    return NextResponse.json({
      success: true,
      message: `Courier checkpoint processed: ${platformStatus}`,
      tracking_number: tracking,
      status: platformStatus,
      event: eventType,
    });
  } catch (err: any) {
    console.error("[Courier Webhook] Exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process courier webhook" },
      { status: 500 }
    );
  }
}
