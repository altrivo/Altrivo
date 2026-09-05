import { NextResponse } from "next/server";
import { OrdersBackendService } from "@/services/orders-backend-service";

export interface KPIMetric {
  id: string;
  title: string;
  formattedValue: string;
  rawValue: number;
  currencySymbol?: string;
  unit?: string;
  changePercent: number;
  trend: "up" | "down";
  sparkline: number[];
  dates: string[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";

    const { orders } = await OrdersBackendService.getOrders("vendor_dev_123", {
      limit: 100,
    });

    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrdersCount = orders.length;

    const dates = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const metrics: Record<string, KPIMetric> = {
      sales: {
        id: "sales",
        title: "Total Store Sales",
        formattedValue: `₨ ${totalSales.toLocaleString()}`,
        rawValue: totalSales,
        currencySymbol: "₨",
        changePercent: 14.8,
        trend: "up",
        sparkline: [
          Math.round(totalSales * 0.65),
          Math.round(totalSales * 0.75),
          Math.round(totalSales * 0.82),
          Math.round(totalSales * 0.9),
          Math.round(totalSales * 0.95),
          totalSales,
        ],
        dates,
      },
      orders: {
        id: "orders",
        title: "Total Customer Orders",
        formattedValue: `${totalOrdersCount}`,
        rawValue: totalOrdersCount,
        unit: "orders",
        changePercent: 12.5,
        trend: "up",
        sparkline: [
          Math.max(1, totalOrdersCount - 4),
          Math.max(1, totalOrdersCount - 3),
          Math.max(2, totalOrdersCount - 2),
          Math.max(2, totalOrdersCount - 1),
          totalOrdersCount,
        ],
        dates,
      },
      views: {
        id: "views",
        title: "Storefront Visitors",
        formattedValue: "3,840",
        rawValue: 3840,
        unit: "views",
        changePercent: 6.2,
        trend: "up",
        sparkline: [3100, 3350, 3500, 3680, 3750, 3840],
        dates,
      },
      conversion: {
        id: "conversion",
        title: "Conversion Rate",
        formattedValue: `${
          totalOrdersCount > 0 ? (totalOrdersCount / 38.4).toFixed(2) : "3.84"
        }%`,
        rawValue: 3.84,
        unit: "%",
        changePercent: 2.1,
        trend: "up",
        sparkline: [2.5, 2.9, 3.2, 3.6, 3.84],
        dates,
      },
    };

    return NextResponse.json({
      success: true,
      range,
      updatedAt: new Date().toISOString(),
      data: metrics,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to calculate KPIs" },
      { status: 500 }
    );
  }
}
