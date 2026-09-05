import { NextResponse } from "next/server";
import { OrdersBackendService } from "@/services/orders-backend-service";

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

    // Fetch real live orders from OrdersBackendService & Supabase
    const { orders: realOrders } = await OrdersBackendService.getOrders("vendor_dev_123", {
      limit: 100,
    });

    // Strictly sort by date descending
    const sortedOrders = [...realOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const formattedOrders: OrderItem[] = sortedOrders.map((o) => {
      const orderDate = new Date(o.createdAt);
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

      // Capitalize status
      let mappedStatus: OrderItem["status"] = "Pending";
      const st = o.deliveryStatus?.toLowerCase();
      if (st === "processing" || st === "confirmed") mappedStatus = "Processing";
      else if (st === "shipped") mappedStatus = "Shipped";
      else if (st === "delivered" || st === "completed") mappedStatus = "Delivered";
      else if (st === "cancelled" || st === "refunded") mappedStatus = "Cancelled";
      else mappedStatus = "Pending";

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName || "Store Customer",
        customerEmail: o.customerEmail || "customer@pakistan.store",
        amount: `₨ ${o.totalAmount.toLocaleString()}`,
        rawAmount: o.totalAmount,
        currency: "₨",
        status: mappedStatus,
        itemsCount: o.items?.length || 1,
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
