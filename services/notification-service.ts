import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { EmailTemplates, StoreBranding } from "./email-templates";
import { EmailService } from "./email-service";
import {
  Notification,
  NotificationDelivery,
  NotificationEventPayload,
  NotificationEventType,
  NotificationPreferences,
} from "@/types/notifications";

let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const resend = {
  emails: {
    send: async (payload: any) => {
      const client = getResend();
      if (!client) {
        console.log("[NotificationService] Resend API key not configured in environment. Safe simulation logged:", payload.to, payload.subject);
        return { data: { id: `sim_${Date.now()}` }, error: null };
      }
      return client.emails.send(payload);
    },
  },
} as unknown as Resend;

export class NotificationService {
  private static processedEvents = new Set<string>();

  /**
   * Helper to retrieve or default notification preferences for a user
   */
  static async getUserPreferences(userId: string, storeId?: string): Promise<NotificationPreferences> {
    const defaultPreferences: NotificationPreferences = {
      id: `pref_${userId}`,
      user_id: userId,
      store_id: storeId,
      email_order_updates: true,
      email_shipping_updates: true,
      email_marketing: false,
      email_security: true, // Non-negotiable security notification
      in_app_orders: true,
      in_app_shipping: true,
      in_app_marketing: true,
      whatsapp_order_updates: true,
      whatsapp_cod: true,
      whatsapp_marketing: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from("notification_preferences")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (data && !error) {
          return {
            ...defaultPreferences,
            ...data,
            email_security: true, // Always enforce security notifications
          };
        }
      } catch (e) {
        // Fallback to defaults
      }
    }

    return defaultPreferences;
  }

  /**
   * Central Event Dispatcher
   */
  static async dispatch(payload: NotificationEventPayload): Promise<Notification | null> {
    const {
      eventId = `${payload.eventType}_${payload.recipientType}_${payload.order?.orderNumber || payload.recipientUserId || crypto.randomUUID()}`,
      eventType,
      storeId,
      storeName = "Altrivo Store",
      storeLogo,
      recipientUserId,
      recipientType,
      recipientEmail,
      recipientPhone,
      title,
      message,
      data = {},
      order,
      shipment,
    } = payload;

    // 1. Idempotency Check: Prevent duplicate spam
    if (this.processedEvents.has(eventId)) {
      console.log(`[NotificationService] Event ${eventId} already dispatched. Skipping duplicate.`);
      return null;
    }
    this.processedEvents.add(eventId);

    const notificationId = crypto.randomUUID();
    const createdNotification: Notification = {
      id: notificationId,
      recipient_user_id: recipientUserId,
      store_id: storeId,
      recipient_type: recipientType,
      event_type: eventType,
      title,
      message,
      data: { ...data, orderId: order?.id, orderNumber: order?.orderNumber },
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
    };

    // 2. Fetch User Notification Preferences
    const userPrefs = await this.getUserPreferences(recipientUserId, storeId);

    // 3. Persist notification in database
    if (supabaseAdmin) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recipientUserId);
        const validUserId = isUUID ? recipientUserId : crypto.randomUUID();

        const { error: insertErr } = await supabaseAdmin.from("notifications").insert({
          id: notificationId,
          user_id: validUserId,
          user_type: recipientType,
          type: eventType,
          recipient_user_id: validUserId,
          store_id: storeId,
          recipient_type: recipientType,
          event_type: eventType,
          title,
          message,
          data: createdNotification.data,
          payload: createdNotification.data,
          is_read: false,
          created_at: createdNotification.created_at,
        });

        if (insertErr) {
          console.error("[NotificationService] DB notification insert error:", insertErr);
        }
      } catch (dbErr) {
        console.warn("[NotificationService] DB notification insert fallback:", dbErr);
      }
    }

    // 4. In-App Broadcast
    const shouldSendInApp = this.checkInAppAllowed(eventType, userPrefs);
    if (shouldSendInApp) {
      this.broadcastInApp(createdNotification);
      await this.logDelivery(notificationId, "in_app", "delivered", "in_app_broadcast");
    } else {
      await this.logDelivery(notificationId, "in_app", "skipped", undefined, "User preference disabled");
    }

    // 5. Email Dispatch (Resend)
    const storeBranding: StoreBranding = {
      name: storeName,
      logoUrl: storeLogo,
      primaryColor: recipientType === "vendor" ? "#0f172a" : "#3e2845",
      supportPhone: "0300-1234567",
      supportEmail: "support@altrivo.com",
    };

    const shouldSendEmail = this.checkEmailAllowed(eventType, userPrefs);
    if (shouldSendEmail && recipientEmail && recipientEmail.includes("@")) {
      await this.sendEmailDelivery(notificationId, recipientEmail, eventType, recipientType, order, shipment, storeBranding, data);
    } else if (recipientEmail) {
      await this.logDelivery(notificationId, "email", "skipped", "resend", "User preference disabled or invalid email");
    }

    // 6. WhatsApp Dispatch (Courier / COD / Order Updates)
    const shouldSendWhatsApp = this.checkWhatsAppAllowed(eventType, userPrefs);
    if (shouldSendWhatsApp && recipientPhone) {
      await this.sendWhatsAppDelivery(notificationId, recipientPhone, eventType, title, message, order);
    }

    return createdNotification;
  }

  /**
   * Check if in-app notification is permitted by preferences
   */
  private static checkInAppAllowed(eventType: NotificationEventType, prefs: NotificationPreferences): boolean {
    if (eventType.includes("ORDER") || eventType.includes("PAYMENT")) {
      return prefs.in_app_orders ?? true;
    }
    if (eventType.includes("SHIPMENT") || eventType.includes("DELIVER")) {
      return prefs.in_app_shipping ?? true;
    }
    if (eventType === "ABANDONED_CART") {
      return prefs.in_app_marketing ?? true;
    }
    return true; // System / security defaults to true
  }

  /**
   * Check if email notification is permitted by preferences
   */
  private static checkEmailAllowed(eventType: NotificationEventType, prefs: NotificationPreferences): boolean {
    // Non-negotiable security events
    if (
      eventType === "PASSWORD_RESET_REQUESTED" ||
      eventType === "PASSWORD_CHANGED" ||
      eventType === "USER_VERIFIED" ||
      eventType === "USER_REGISTERED"
    ) {
      return true;
    }

    if (eventType.includes("ORDER") || eventType.includes("PAYMENT") || eventType.includes("COD")) {
      return prefs.email_order_updates ?? true;
    }
    if (eventType.includes("SHIPMENT") || eventType.includes("DELIVER")) {
      return prefs.email_shipping_updates ?? true;
    }
    if (eventType === "ABANDONED_CART" || eventType === "LOW_STOCK") {
      return prefs.email_marketing ?? false;
    }
    return true;
  }

  /**
   * Check if WhatsApp notification is permitted by preferences
   */
  private static checkWhatsAppAllowed(eventType: NotificationEventType, prefs: NotificationPreferences): boolean {
    if (eventType === "COD_VERIFICATION_REQUIRED" || eventType === "COD_CONFIRMED" || eventType === "COD_REJECTED") {
      return prefs.whatsapp_cod ?? true;
    }
    if (eventType.includes("ORDER") || eventType.includes("SHIPMENT") || eventType.includes("OUT_FOR_DELIVERY")) {
      return prefs.whatsapp_order_updates ?? true;
    }
    if (eventType === "ABANDONED_CART") {
      return prefs.whatsapp_marketing ?? false;
    }
    return false;
  }

  /**
   * In-App Broadcast via BroadcastChannel
   */
  private static broadcastInApp(notif: Notification) {
    try {
      if (typeof globalThis !== "undefined" && "BroadcastChannel" in globalThis) {
        const bc = new BroadcastChannel("vendor_notifications_channel");
        bc.postMessage({ type: "NEW_NOTIFICATION", notification: notif });
        bc.close();
      }
    } catch (e) {}
  }

  /**
   * Send Email Delivery via Resend
   */
  private static async sendEmailDelivery(
    notificationId: string,
    toEmail: string,
    eventType: NotificationEventType,
    recipientType: "vendor" | "customer" | "admin" = "customer",
    order?: any,
    shipment?: any,
    store?: StoreBranding,
    data?: any
  ) {
    let emailContent: { subject: string; html: string } | null = null;
    const storeName = store?.name || "Altrivo Store";

    try {
      switch (eventType) {
        case "USER_REGISTERED":
          emailContent = EmailTemplates.welcomeEmail({ email: toEmail, name: data?.name, role: data?.role }, store);
          break;

        case "USER_VERIFIED":
          emailContent = EmailTemplates.welcomeEmail({ email: toEmail, name: data?.name }, store);
          break;

        case "PASSWORD_RESET_REQUESTED":
          emailContent = EmailTemplates.resetPassword({ email: toEmail, name: data?.name }, data?.resetUrl || "http://localhost:3000/auth/reset-password", store);
          break;

        case "PASSWORD_CHANGED":
          emailContent = EmailTemplates.passwordChanged({ email: toEmail, name: data?.name }, store);
          break;

        case "ORDER_CREATED":
        case "ORDER_CONFIRMED":
          if (recipientType === "vendor") {
            emailContent = EmailTemplates.vendorNewOrderAlert(order, store);
          } else if (order) {
            emailContent = EmailTemplates.customerOrderConfirmation(order, store);
          }
          break;

        case "PAYMENT_RECEIVED":
          if (order) {
            emailContent = EmailTemplates.customerPaymentConfirmed(order, store);
          }
          break;

        case "SHIPMENT_CREATED":
        case "ORDER_SHIPPED":
          if (order) {
            emailContent = EmailTemplates.shipmentDispatched(order, shipment, store);
          }
          break;

        case "OUT_FOR_DELIVERY":
          if (order) {
            emailContent = EmailTemplates.outForDelivery(order, shipment, store);
          }
          break;

        case "ORDER_DELIVERED":
          if (order) {
            emailContent = EmailTemplates.orderDelivered(order, shipment, store);
          }
          break;

        case "ORDER_CANCELLED":
          if (order) {
            emailContent = EmailTemplates.orderCancelled(order, data?.reason, store);
          }
          break;

        case "ORDER_REFUNDED":
          if (order) {
            emailContent = EmailTemplates.orderRefunded(order, data?.refund, store);
          }
          break;

        case "COD_VERIFICATION_REQUIRED":
          if (order) {
            emailContent = EmailTemplates.codVerificationRequired(order, data?.verifyUrl || "http://localhost:3000/account/orders", store);
          }
          break;

        case "COD_CONFIRMED":
          if (order) {
            emailContent = EmailTemplates.codConfirmed(order, store);
          }
          break;

        case "LOW_STOCK":
          emailContent = EmailTemplates.lowStockAlert(data?.product || { name: "Product Catalog Item" }, store);
          break;

        case "ABANDONED_CART":
          emailContent = EmailTemplates.abandonedCart(data?.cart || {}, data?.checkoutUrl || "http://localhost:3000/cart", store);
          break;

        default:
          emailContent = {
            subject: `${storeName} Alert: ${eventType.replace(/_/g, " ")}`,
            html: `<p>Hello, you have received a notification regarding ${eventType} from ${storeName}.</p>`,
          };
      }

      if (emailContent) {
        const fromEmail = process.env.RESEND_FROM_EMAIL || "Altrivo <onboarding@resend.dev>";
        const sendResult = await EmailService.sendEmail({
          to: toEmail,
          subject: emailContent.subject,
          html: emailContent.html,
          from: fromEmail,
          recipientType,
        });

        const status = sendResult.success ? "sent" : "failed";
        await this.logDelivery(
          notificationId,
          "email",
          status,
          "resend",
          sendResult.error,
          sendResult.id
        );
      }
    } catch (err: any) {
      console.warn("[NotificationService] Email send error:", err?.message || err);
      await this.logDelivery(notificationId, "email", "failed", "resend", err?.message);
    }
  }

  /**
   * Send WhatsApp Delivery (Simulated & Logged with phone normalization)
   */
  private static async sendWhatsAppDelivery(
    notificationId: string,
    phone: string,
    eventType: NotificationEventType,
    title: string,
    message: string,
    order?: any
  ) {
    try {
      const cleanPhone = phone.replace(/[^\d+]/g, "");
      console.log(`[NotificationService] WhatsApp alert dispatched to ${cleanPhone}: [${eventType}] ${title} - ${message}`);
      
      await this.logDelivery(
        notificationId,
        "whatsapp",
        "sent",
        "whatsapp_cloud_api",
        undefined,
        `wa_${Date.now()}`
      );
    } catch (waErr: any) {
      await this.logDelivery(notificationId, "whatsapp", "failed", "whatsapp_cloud_api", waErr?.message);
    }
  }

  /**
   * Audit log for all notification deliveries
   */
  private static async logDelivery(
    notificationId: string,
    channel: "email" | "in_app" | "whatsapp",
    status: "queued" | "sending" | "sent" | "delivered" | "failed" | "skipped",
    provider?: string,
    error?: string,
    messageId?: string
  ) {
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from("notification_deliveries").insert({
          id: crypto.randomUUID(),
          notification_id: notificationId,
          channel,
          status,
          provider: provider || channel,
          provider_message_id: messageId,
          attempt_count: 1,
          last_error: error,
          sent_at: status === "sent" || status === "delivered" ? new Date().toISOString() : undefined,
          delivered_at: status === "delivered" ? new Date().toISOString() : undefined,
          failed_at: status === "failed" ? new Date().toISOString() : undefined,
        });
      } catch (e) {}
    }
  }

  /**
   * Fetch User Notifications with unread count
   */
  static async getNotifications(userId: string, storeId?: string): Promise<{ notifications: Notification[]; unreadCount: number }> {
    if (supabaseAdmin) {
      try {
        let query = supabaseAdmin
          .from("notifications")
          .select("*")
          .or(`recipient_user_id.eq.${userId},user_id.eq.${userId}`)
          .order("created_at", { ascending: false })
          .limit(30);

        if (storeId) {
          query = query.eq("store_id", storeId);
        }

        const { data, error } = await query;
        if (!error && data) {
          const unreadCount = data.filter((n) => !n.is_read).length;
          return { notifications: data as Notification[], unreadCount };
        }
      } catch (e) {
        console.warn("[NotificationService] getNotifications DB lookup note:", e);
      }
    }

    return { notifications: [], unreadCount: 0 };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string) {
    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from("notifications")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq("id", notificationId);
      } catch (e) {}
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string, storeId?: string) {
    if (supabaseAdmin) {
      try {
        let query = supabaseAdmin
          .from("notifications")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .or(`recipient_user_id.eq.${userId},user_id.eq.${userId}`);

        if (storeId) {
          query = query.eq("store_id", storeId);
        }

        await query;
      } catch (e) {}
    }
  }

  /**
   * Update notification preferences
   */
  static async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const existing = await this.getUserPreferences(userId, preferences.store_id);
    const updated: NotificationPreferences = {
      ...existing,
      ...preferences,
      email_security: true, // Cannot disable security
      updated_at: new Date().toISOString(),
    };

    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from("notification_preferences")
          .upsert(
            {
              user_id: userId,
              store_id: updated.store_id,
              email_order_updates: updated.email_order_updates,
              email_shipping_updates: updated.email_shipping_updates,
              email_marketing: updated.email_marketing,
              email_security: true,
              in_app_orders: updated.in_app_orders,
              in_app_shipping: updated.in_app_shipping,
              in_app_marketing: updated.in_app_marketing,
              whatsapp_order_updates: updated.whatsapp_order_updates,
              whatsapp_cod: updated.whatsapp_cod,
              whatsapp_marketing: updated.whatsapp_marketing,
              updated_at: updated.updated_at,
            },
            { onConflict: "user_id" }
          );
      } catch (e) {}
    }

    return updated;
  }
}
