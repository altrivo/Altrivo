import "@testing-library/jest-dom";
import { NextRequest } from "next/server";

import { LowStockAlertEngine } from "@/services/low-stock-alert-engine";

import { GET, PATCH } from "../route";

describe("Notifications API Route (/api/notifications)", () => {
  beforeEach(() => {
    LowStockAlertEngine.clearNotificationsStore();
  });

  it("fetches vendor notifications and unread badge count via GET", async () => {
    // Inject alert
    await LowStockAlertEngine.processStockChangedEvent({
      event: "stock_changed",
      variantId: "var_route_test",
      sku: "SKU-ROUTE-01",
      previousStock: 15,
      newStock: 2,
      lowStockThreshold: 10,
      isLowStock: true,
      isOutOfStock: false,
      timestamp: new Date().toISOString(),
    });

    const req = new NextRequest("http://localhost:3000/api/notifications?vendor_id=vendor_dev_123", {
      method: "GET",
    });

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.unreadBadgeCount).toBe(1);
    expect(json.notifications.length).toBe(1);
  });

  it("marks all notifications as read via PATCH", async () => {
    await LowStockAlertEngine.processStockChangedEvent({
      event: "stock_changed",
      variantId: "var_route_test_2",
      sku: "SKU-ROUTE-02",
      previousStock: 15,
      newStock: 0,
      lowStockThreshold: 5,
      isLowStock: true,
      isOutOfStock: true,
      timestamp: new Date().toISOString(),
    });

    const req = new NextRequest("http://localhost:3000/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-vendor-id": "vendor_dev_123" },
      body: JSON.stringify({ markAllRead: true }),
    });

    const res = await PATCH(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.markedReadCount).toBe(1);
  });
});
