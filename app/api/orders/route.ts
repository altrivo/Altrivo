import { NextRequest, NextResponse } from "next/server";
import { OrdersBackendService } from "@/services/orders-backend-service";
import { NotificationService } from "@/services/notification-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("searchQuery") || "";
    const deliveryStatus = searchParams.get("deliveryStatus") || "all";
    const paymentStatus = searchParams.get("paymentStatus") || "all";
    
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await OrdersBackendService.getOrders("vendor_dev_123", {
      searchQuery,
      deliveryStatus,
      paymentStatus,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      orders: result.orders,
      totalCount: result.totalCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simple verification
    if (!body.customerName || !body.totalAmount || !body.items) {
      return NextResponse.json(
        { success: false, error: "Missing required order properties" },
        { status: 400 }
      );
    }

    const newOrder = await OrdersBackendService.createOrder({
      vendor_id: body.vendor_id || "vendor_dev_123",
      customer_id: body.customer_id || null,
      customerName: body.customerName,
      customerEmail: body.customerEmail || "",
      customerPhone: body.customerPhone || "",
      totalAmount: body.totalAmount,
      paymentStatus: body.paymentStatus || "pending",
      paymentMethod: body.paymentMethod || "cod",
      deliveryStatus: body.deliveryStatus || "pending",
      deliveryMethod: body.deliveryMethod || "standard",
      shippingAddress: body.shippingAddress || "",
      items: body.items,
      notes: body.notes || "",
    });

    // Dispatch Multi-Channel Notifications (Email to Customer + In-App to Vendor)
    try {
      // 1. Customer Notification (Order Confirmation & Resend Email)
      NotificationService.dispatch({
        eventType: "ORDER_CREATED",
        storeId: body.store_id || "stepcraft-premium",
        storeName: "Artisanal Store",
        recipientUserId: newOrder.customer_id || newOrder.id,
        recipientType: "customer",
        recipientEmail: newOrder.customerEmail,
        recipientPhone: newOrder.customerPhone,
        title: `Order #${newOrder.orderNumber} Confirmed`,
        message: `Thank you ${newOrder.customerName}! Your order of ₨ ${newOrder.totalAmount?.toLocaleString()} has been received.`,
        order: newOrder,
      }).catch((e) => console.warn("[Orders POST] Notification customer dispatch failed:", e));

      // 2. Vendor Notification (In-App Dashboard Alert & Order Tracker)
      NotificationService.dispatch({
        eventType: "ORDER_CREATED",
        storeId: body.store_id || "stepcraft-premium",
        storeName: "Artisanal Store",
        recipientUserId: body.vendor_id || "vendor_dev_123",
        recipientType: "vendor",
        recipientEmail: "vendor@digishop.pk",
        title: `New Order #${newOrder.orderNumber}`,
        message: `${newOrder.customerName} placed an order for ₨ ${newOrder.totalAmount?.toLocaleString()} via ${newOrder.paymentMethod?.toUpperCase()}.`,
        order: newOrder,
      }).catch((e) => console.warn("[Orders POST] Notification vendor dispatch failed:", e));
    } catch (notifErr) {
      console.warn("[Orders POST] Notification dispatch warning:", notifErr);
    }

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
