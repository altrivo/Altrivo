import "@testing-library/jest-dom";
import { LowStockAlertEngine } from "../low-stock-alert-engine";

describe("LowStockAlertEngine (24h Deduplication & Resend Integration)", () => {
  beforeEach(() => {
    LowStockAlertEngine.clearNotificationsStore();
  });

  it("triggers alert notification and increments badge when stock <= threshold", async () => {
    const res = await LowStockAlertEngine.processStockChangedEvent({
      event: "stock_changed",
      variantId: "var_dedup_001",
      sku: "SKU-ALERT-001",
      previousStock: 25,
      newStock: 4,
      lowStockThreshold: 10,
      isLowStock: true,
      isOutOfStock: false,
      timestamp: new Date().toISOString(),
    });

    expect(res.alertTriggered).toBe(true);
    expect(res.notification?.sku).toBe("SKU-ALERT-001");
    expect(res.notification?.type).toBe("low_stock");

    const status = LowStockAlertEngine.getNotifications("vendor_dev_123");
    expect(status.unreadBadgeCount).toBe(1);
    expect(status.notifications.length).toBe(1);
  });

  it("deduplicates alerts — prevents duplicate alert within 24 hours", async () => {
    // First alert call
    const res1 = await LowStockAlertEngine.processStockChangedEvent({
      event: "stock_changed",
      variantId: "var_dedup_002",
      sku: "SKU-ALERT-002",
      previousStock: 25,
      newStock: 2,
      lowStockThreshold: 10,
      isLowStock: true,
      isOutOfStock: false,
      timestamp: new Date().toISOString(),
    });

    expect(res1.alertTriggered).toBe(true);

    // Immediate second alert call for same variant (within 24h)
    const res2 = await LowStockAlertEngine.processStockChangedEvent({
      event: "stock_changed",
      variantId: "var_dedup_002",
      sku: "SKU-ALERT-002",
      previousStock: 2,
      newStock: 1,
      lowStockThreshold: 10,
      isLowStock: true,
      isOutOfStock: false,
      timestamp: new Date().toISOString(),
    });

    expect(res2.alertTriggered).toBe(false);
    expect(res2.dedupSkipped).toBe(true);

    // Notification count should remain 1 (no duplicate notification created)
    const status = LowStockAlertEngine.getNotifications("vendor_dev_123");
    expect(status.unreadBadgeCount).toBe(1);
  });

  it("marks notification as read and decrements unread badge count", async () => {
    const res = await LowStockAlertEngine.processStockChangedEvent({
      event: "stock_changed",
      variantId: "var_dedup_003",
      sku: "SKU-ALERT-003",
      previousStock: 20,
      newStock: 0,
      lowStockThreshold: 5,
      isLowStock: true,
      isOutOfStock: true,
      timestamp: new Date().toISOString(),
    });

    const notifId = res.notification!.id;
    expect(LowStockAlertEngine.getNotifications("vendor_dev_123").unreadBadgeCount).toBe(1);

    // Mark single notification read
    const marked = LowStockAlertEngine.markAsRead(notifId, "vendor_dev_123");
    expect(marked).toBe(true);
    expect(LowStockAlertEngine.getNotifications("vendor_dev_123").unreadBadgeCount).toBe(0);
  });
});
