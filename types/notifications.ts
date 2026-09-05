export type NotificationRecipientType = "vendor" | "customer" | "admin";

export type NotificationEventType =
  | "USER_REGISTERED"
  | "USER_VERIFIED"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_CHANGED"
  | "VENDOR_PROFILE_CREATED"
  | "STORE_CREATED"
  | "STORE_PUBLISHED"
  | "STORE_GENERATION_COMPLETED"
  | "AI_OPERATION_COMPLETED"
  | "DOMAIN_CONNECTED"
  | "DOMAIN_VERIFICATION_FAILED"
  | "ORDER_CREATED"
  | "ORDER_CONFIRMED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_FAILED"
  | "ORDER_CANCELLED"
  | "ORDER_REFUNDED"
  | "SHIPMENT_CREATED"
  | "ORDER_SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "ORDER_DELIVERED"
  | "SHIPMENT_EXCEPTION"
  | "COD_VERIFICATION_REQUIRED"
  | "COD_CONFIRMED"
  | "COD_REJECTED"
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "ABANDONED_CART"
  | "SUBSCRIPTION_EXPIRING"
  | "SUBSCRIPTION_RENEWED"
  | "SUBSCRIPTION_PAYMENT_FAILED"
  | "INTEGRATION_CONNECTED"
  | "INTEGRATION_FAILED";

export interface Notification {
  id: string;
  recipient_user_id: string;
  store_id?: string;
  recipient_type: NotificationRecipientType;
  event_type: NotificationEventType;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface NotificationDelivery {
  id: string;
  notification_id: string;
  channel: "email" | "in_app" | "whatsapp";
  status: "queued" | "sending" | "sent" | "delivered" | "failed" | "skipped";
  provider?: string;
  provider_message_id?: string;
  attempt_count: number;
  last_error?: string;
  sent_at?: string;
  delivered_at?: string;
  failed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  store_id?: string;
  email_order_updates: boolean;
  email_shipping_updates: boolean;
  email_marketing: boolean;
  email_security: boolean;
  in_app_orders: boolean;
  in_app_shipping: boolean;
  in_app_marketing: boolean;
  whatsapp_order_updates: boolean;
  whatsapp_cod: boolean;
  whatsapp_marketing: boolean;
  created_at: string;
  updated_at: string;
}

export type ShipmentStatus =
  | "label_created"
  | "confirmed"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "returned";

export interface Shipment {
  id: string;
  order_id: string;
  courier_provider: string;
  courier_name: string;
  tracking_number: string;
  waybill_number?: string;
  status: ShipmentStatus;
  estimated_delivery?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ShipmentEvent {
  id: string;
  shipment_id: string;
  status: ShipmentStatus;
  location?: string;
  description?: string;
  event_time: string;
  raw_data?: Record<string, any>;
  created_at: string;
}

export interface NotificationEventPayload {
  eventId?: string;
  eventType: NotificationEventType;
  storeId?: string;
  storeName?: string;
  storeLogo?: string;
  recipientUserId: string;
  recipientType: NotificationRecipientType;
  recipientEmail?: string;
  recipientPhone?: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  order?: any;
  shipment?: any;
}
