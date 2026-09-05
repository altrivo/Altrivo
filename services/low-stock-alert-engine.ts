import { Resend } from "resend";

import type { StockChangedEvent } from "@/types/inventory";
import type { VendorNotification } from "@/types/notification";

import { InventoryBackendService } from "./inventory-backend-service";

// 24 Hours Deduplication Window
const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000;

// In-memory notifications database & dedup cache
const vendorNotificationsStore: VendorNotification[] = [];
const lastAlertTimestamps: Map<string, number> = new Map();

// Initialize Resend Client if key exists
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export class LowStockAlertEngine {
  private static isInitialized = false;

  /**
   * Initializes the background event listener on stock_changed events.
   */
  static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    InventoryBackendService.onStockChanged((event: StockChangedEvent) => {
      this.processStockChangedEvent(event);
    });
  }

  /**
   * Processes a stock_changed event and triggers low-stock alerts if needed.
   */
  static async processStockChangedEvent(event: StockChangedEvent): Promise<{
    alertTriggered: boolean;
    dedupSkipped?: boolean;
    notification?: VendorNotification;
    emailSent?: boolean;
  }> {
    const { variantId, sku, newStock, lowStockThreshold, isLowStock, isOutOfStock } = event;
    const vendorId = "vendor_dev_123"; // Active vendor ID

    // Check if stock is low or out of stock
    if (!isLowStock && !isOutOfStock) {
      return { alertTriggered: false };
    }

    const NOW = Date.now();
    const lastAlertTime = lastAlertTimestamps.get(variantId) || 0;

    // 1. Deduplication Engine: Only one alert per variant per 24 hours
    if (NOW - lastAlertTime < DEDUP_WINDOW_MS) {
      return {
        alertTriggered: false,
        dedupSkipped: true,
      };
    }

    // Update last alert timestamp for deduplication
    lastAlertTimestamps.set(variantId, NOW);

    // Retrieve item name if available
    const item = InventoryBackendService.getItem(variantId);
    const itemName = item?.name || `Item ${sku}`;

    // 2. Create & Insert Notification Record
    const notification: VendorNotification = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      vendorId,
      type: isOutOfStock ? "out_of_stock" : "low_stock",
      variantId,
      sku,
      itemName,
      title: isOutOfStock ? `Out of Stock: ${sku}` : `Low-Stock Warning: ${sku}`,
      message: isOutOfStock
        ? `${itemName} (${sku}) is OUT OF STOCK (0 units remaining). Restock immediately!`
        : `${itemName} (${sku}) is low on stock (${newStock} units remaining; threshold: ${lowStockThreshold}).`,
      read: false,
      metadata: {
        currentStock: newStock,
        lowStockThreshold,
        emailSent: false,
        dedupSkipped: false,
      },
      createdAt: new Date().toISOString(),
    };

    vendorNotificationsStore.unshift(notification);

    // 3. Send Email via Resend
    let emailSent = false;
    try {
      if (resend) {
        await resend.emails.send({
          from: "Altrivo Alerts <alerts@altrivo.com>",
          to: ["vendor@altrivo.com"],
          subject: `⚠️ Low-Stock Alert: ${itemName} (${sku})`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #e11d48;">⚠️ Low-Stock Alert</h2>
              <p>Your product <strong>${itemName}</strong> (SKU: <code>${sku}</code>) has reached a low-stock level.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr style="background: #f8fafc;"><td style="padding: 8px;">Current Stock:</td><td style="padding: 8px; font-weight: bold;">${newStock} units</td></tr>
                <tr><td style="padding: 8px;">Low-Stock Threshold:</td><td style="padding: 8px;">${lowStockThreshold} units</td></tr>
              </table>
              <a href="https://altrivo.com/inventory" style="background: #4f46e5; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">Manage Inventory &amp; Restock</a>
            </div>
          `,
        });
        emailSent = true;
      } else {
        // Mock email dispatch for local testing
        console.log(`[Resend Email Mock] Dispatched Low-Stock Alert to vendor@altrivo.com for ${sku}`);
        emailSent = true;
      }
    } catch (err) {
      console.error("Resend email dispatch error:", err);
    }

    if (notification.metadata) {
      notification.metadata.emailSent = emailSent;
    }

    return {
      alertTriggered: true,
      notification,
      emailSent,
    };
  }

  /**
   * Retrieves all notifications for a vendor & unread badge count.
   */
  static getNotifications(vendorId = "vendor_dev_123"): {
    notifications: VendorNotification[];
    unreadBadgeCount: number;
  } {
    const list = vendorNotificationsStore.filter((n) => n.vendorId === vendorId);
    const unreadBadgeCount = list.filter((n) => !n.read).length;
    return {
      notifications: list,
      unreadBadgeCount,
    };
  }

  /**
   * Marks a notification as read.
   */
  static markAsRead(notificationId: string, vendorId = "vendor_dev_123"): boolean {
    const item = vendorNotificationsStore.find(
      (n) => n.id === notificationId && n.vendorId === vendorId
    );
    if (item) {
      item.read = true;
      return true;
    }
    return false;
  }

  /**
   * Marks all notifications as read for a vendor.
   */
  static markAllAsRead(vendorId = "vendor_dev_123"): number {
    let count = 0;
    vendorNotificationsStore.forEach((n) => {
      if (n.vendorId === vendorId && !n.read) {
        n.read = true;
        count++;
      }
    });
    return count;
  }

  /**
   * Resets dedup cache (for unit testing).
   */
  static resetDedupCache() {
    lastAlertTimestamps.clear();
  }

  /**
   * Clears notification store (for unit testing).
   */
  static clearNotificationsStore() {
    vendorNotificationsStore.length = 0;
    lastAlertTimestamps.clear();
  }
}

// Auto-initialize background listener
LowStockAlertEngine.init();
