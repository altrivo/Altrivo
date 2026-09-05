import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { EmailTemplates } from "./email-templates";
import {
  Notification,
  NotificationDelivery,
  NotificationEventPayload,
  NotificationEventType,
} from "@/types/notifications";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY is not configured");
}

const resend = new Resend(resendApiKey);
export class NotificationService {
  private static processedEvents = new Set<string>();

  /**
   * Central Event Dispatcher
   */
  static async dispatch(payload: NotificationEventPayload): Promise<Notification | null> {
    const {
      eventId = `${payload.eventType}_${payload.order?.orderNumber || crypto.randomUUID()}`,
      eventType,
      storeId,
      storeName = "Artisanal Store",
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

    // 1. Idempotency Check: Prevent duplicate email/notification spam
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

    // 2. Persist notification in database
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from("notifications").insert({
          id: notificationId,
          recipient_user_id: recipientUserId,
          store_id: storeId,
          recipient_type: recipientType,
          event_type: eventType,
          title,
          message,
          data: createdNotification.data,
          is_read: false,
          created_at: createdNotification.created_at,
        });
      } catch (dbErr) {
        console.warn("[NotificationService] DB save fallback:", dbErr);
      }
    }

    // 3. Dispatch Multi-Channel Deliveries
    // A. In-App Broadcast
    this.broadcastInApp(createdNotification);

    // B. Email Dispatch (Resend)
    if (recipientEmail && recipientEmail.includes("@")) {
      this.sendEmailDelivery(notificationId, recipientEmail, eventType, order, shipment, storeName);
    }

    return createdNotification;
  }

  /**
   * Realtime In-App Notification Broadcast
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
   * Multi-Template Email Sender
   */
  private static async sendEmailDelivery(
    notificationId: string,
    toEmail: string,
    eventType: NotificationEventType,
    order?: any,
    shipment?: any,
    storeName?: string
  ) {
    let emailContent: { subject: string; html: string } | null = null;

    try {
      switch (eventType) {
        case "ORDER_CREATED":
        case "ORDER_CONFIRMED":
          if (order) {
            emailContent = EmailTemplates.customerOrderConfirmation(order, { name: storeName || "DigiShop" });
          }
          break;

        case "SHIPMENT_CREATED":
        case "ORDER_SHIPPED":
          if (order) {
            emailContent = EmailTemplates.shipmentDispatched(order, shipment, { name: storeName || "DigiShop" });
          }
          break;

        default:
          emailContent = {
            subject: `DigiShop Notification: ${eventType}`,
            html: `<p>Hello, you have a new notification from ${storeName}.</p>`,
          };
      }

      if (emailContent) {
        const { data, error } = await resend.emails.send({
          from: `${storeName || "DigiShop"} <onboarding@resend.dev>`,
          to: [toEmail],
          subject: emailContent.subject,
          html: emailContent.html,
        });

        const deliveryStatus = error ? "failed" : "sent";
        const deliveryError = error ? error.message : undefined;

        // Log delivery to notification_deliveries table
        if (supabaseAdmin) {
          try {
            await supabaseAdmin.from("notification_deliveries").insert({
              notification_id: notificationId,
              channel: "email",
              status: deliveryStatus,
              provider: "resend",
              provider_message_id: data?.id,
              attempt_count: 1,
              last_error: deliveryError,
              sent_at: deliveryStatus === "sent" ? new Date().toISOString() : undefined,
              failed_at: deliveryStatus === "failed" ? new Date().toISOString() : undefined,
            });
          } catch (e) {}
        }
      }
    } catch (err: any) {
      console.warn("[NotificationService] Email delivery exception:", err?.message || err);
    }
  }

  /**
   * Fetch User Notifications with Unread Count
   */
  static async getNotifications(userId: string, storeId?: string): Promise<{ notifications: Notification[]; unreadCount: number }> {
    if (supabaseAdmin) {
      try {
        let query = supabaseAdmin
          .from("notifications")
          .select("*")
          .eq("recipient_user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20);

        if (storeId) {
          query = query.eq("store_id", storeId);
        }

        const { data, error } = await query;
        if (!error && data) {
          const unreadCount = data.filter((n) => !n.is_read).length;
          return { notifications: data as Notification[], unreadCount };
        }
      } catch (e) {}
    }

    // Default mock notifications for active development experience
    const mockNotifs: Notification[] = [
      {
        id: "notif-1",
        recipient_user_id: userId,
        recipient_type: "vendor",
        event_type: "ORDER_CREATED",
        title: "New Order #ORD-9407 Received",
        message: "Customer placed a new order for ₨ 10,400 via Cash on Delivery.",
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: "notif-2",
        recipient_user_id: userId,
        recipient_type: "vendor",
        event_type: "STORE_PUBLISHED",
        title: "Storefront Live & Synced",
        message: "Your store 'stepcraft-premium' is live and ready to take customer orders.",
        is_read: true,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    return { notifications: mockNotifs, unreadCount: 1 };
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
  static async markAllAsRead(userId: string) {
    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from("notifications")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq("recipient_user_id", userId);
      } catch (e) {}
    }
  }
}
