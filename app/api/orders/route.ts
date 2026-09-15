import { NextRequest, NextResponse } from "next/server";
import { OrdersBackendService } from "@/services/orders-backend-service";
import { NotificationService } from "@/services/notification-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("searchQuery") || "";
    const storeId = searchParams.get("storeId") || undefined;
    const vendorId = searchParams.get("vendorId") || undefined;
    const customerId = searchParams.get("customerId") || undefined;
    const customerEmail = searchParams.get("customerEmail") || undefined;
    const orderStatus = searchParams.get("orderStatus") || searchParams.get("status") || "all";
    const deliveryStatus = searchParams.get("deliveryStatus") || "all";
    const paymentStatus = searchParams.get("paymentStatus") || "all";
    const courier = searchParams.get("courier") || "all";
    const codOnly = searchParams.get("codOnly") === "true";
    const dateRange = searchParams.get("dateRange") || "all";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await OrdersBackendService.getOrders(vendorId || "all", {
      storeId,
      customerId,
      customerEmail,
      searchQuery,
      orderStatus,
      deliveryStatus,
      paymentStatus,
      courier,
      codOnly,
      dateRange,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      orders: result.orders,
      totalCount: result.totalCount,
      analytics: result.analytics,
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

    if (!body.customerName || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required order properties (customerName, items)" },
        { status: 400 }
      );
    }

    const subtotal = Number(body.subtotal) || body.items.reduce((s: number, i: any) => s + (Number(i.price || i.unit_price) * Number(i.quantity || 1)), 0);
    const discountTotal = Number(body.discountTotal || body.discount_total) || 0;
    const shippingTotal = body.shippingTotal !== undefined || body.shipping_total !== undefined
      ? Number(body.shippingTotal ?? body.shipping_total)
      : (subtotal >= 100 || subtotal === 0 ? 0 : 15);
    const taxTotal = Number(body.taxTotal || body.tax_total) || 0;
    const grandTotal = Number(body.grandTotal || body.totalAmount || body.total) || Math.max(0, subtotal - discountTotal + shippingTotal + taxTotal);

    const newOrder = await OrdersBackendService.createOrder({
      store_id: body.store_id || body.storeId,
      vendor_id: body.vendor_id || body.vendorId,
      customer_id: body.customer_id || body.customerId || null,
      idempotency_key: body.idempotency_key || body.idempotencyKey,
      customerName: body.customerName,
      customerEmail: body.customerEmail || "customer@example.pk",
      customerPhone: body.customerPhone || "0300 0000000",
      shippingAddress: body.shippingAddress || "Karachi, Pakistan",
      shippingCity: body.shippingCity || "Karachi",
      shippingRegion: body.shippingRegion || "Sindh",
      shippingPostalCode: body.shippingPostalCode,
      billingAddress: body.billingAddress,
      paymentMethod: body.paymentMethod || "cod",
      couponCode: body.couponCode,
      customerNote: body.customerNote || body.notes,
      items: body.items,
      subtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      grandTotal,
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
