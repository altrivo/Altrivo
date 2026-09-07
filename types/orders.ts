export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "partially_refunded"
  | "refunded"
  | "cancelled";

export type FulfillmentStatus =
  | "unfulfilled"
  | "partially_fulfilled"
  | "processing"
  | "packed"
  | "ready_to_ship"
  | "fulfilled";

export type DeliveryStatus =
  | "pending"
  | "shipment_created"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "returned";

export type ReturnStatus =
  | "none"
  | "requested"
  | "approved"
  | "rejected"
  | "pickup_scheduled"
  | "received"
  | "inspected"
  | "approved_for_refund"
  | "completed";

export type RefundStatus =
  | "none"
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type CODStatus =
  | "pending"
  | "verification_required"
  | "confirmed"
  | "rejected";

export type EscrowStatus =
  | "held_in_escrow"
  | "released_to_vendor"
  | "refunded_a2_escrow";

export type PaymentMethod =
  | "credit_card"
  | "paypal"
  | "stripe"
  | "cod"
  | "bank_transfer"
  | "jazzcash"
  | "easypaisa";

export type DeliveryMethod =
  | "standard"
  | "express"
  | "pickup"
  | "international";

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id?: string;
  variant_id?: string | null;
  name: string;
  product_name_snapshot?: string;
  product_sku_snapshot?: string;
  variant_snapshot?: string;
  image_snapshot?: string;
  quantity: number;
  price: number;
  unit_price?: number;
  discount_amount?: number;
  tax_amount?: number;
  line_total?: number;
  variant?: string;
  sku?: string;
  image?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string; // ISO date string
  step: "paid" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled" | "refunded" | "completed";
  completed: boolean;
  current?: boolean;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  store_id: string;
  event_type: string;
  old_status?: string;
  new_status?: string;
  actor_type: "system" | "customer" | "vendor" | "courier";
  actor_id?: string;
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface OrderPayment {
  id: string;
  order_id: string;
  store_id: string;
  customer_id?: string;
  provider: string;
  payment_method: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transaction_id?: string;
  failure_code?: string;
  failure_message?: string;
  paid_at?: string;
  refunded_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface OrderReturn {
  id: string;
  order_id: string;
  store_id: string;
  customer_id?: string;
  status: ReturnStatus;
  reason: string;
  description?: string;
  items?: any[];
  restock_decision?: "restock" | "damaged_writeoff";
  requested_at: string;
  approved_at?: string;
  rejected_at?: string;
  received_at?: string;
  completed_at?: string;
}

export interface OrderRefund {
  id: string;
  order_id: string;
  store_id: string;
  payment_id?: string;
  customer_id?: string;
  amount: number;
  currency: string;
  reason: string;
  refund_type: "full" | "partial" | "item" | "shipping";
  status: RefundStatus;
  provider?: string;
  provider_refund_id?: string;
  requested_at: string;
  processed_at: string;
}

export interface ComplaintMessage {
  id: string;
  complaint_id: string;
  sender_type: "customer" | "vendor" | "admin";
  sender_id: string;
  sender_name: string;
  message: string;
  attachments?: string[];
  created_at: string;
}

export interface OrderComplaint {
  id: string;
  order_id: string;
  store_id: string;
  customer_id?: string;
  subject: string;
  status: "open" | "in_review" | "waiting_customer" | "resolved" | "rejected" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  messages: ComplaintMessage[];
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string; // Database internal UUID
  order_number?: string; // Human-friendly e.g. DS-2026-000125
  orderNumber: string; // alias for compatibility
  store_id?: string;
  vendor_id?: string;
  customer_id?: string | null;

  // Pricing breakdown (Server calculated)
  subtotal?: number;
  discount_total?: number;
  shipping_total?: number;
  tax_total?: number;
  grand_total?: number;
  totalAmount: number; // Grand total (compatibility)
  currency?: string;

  // Statuses
  order_status?: OrderStatus;
  paymentStatus: PaymentStatus;
  payment_status?: PaymentStatus;
  fulfillment_status?: FulfillmentStatus;
  deliveryStatus: OrderStatus | DeliveryStatus;
  delivery_status?: DeliveryStatus;
  return_status?: ReturnStatus;
  refund_status?: RefundStatus;
  cod_status?: CODStatus;
  escrowStatus?: EscrowStatus;
  fraud_status?: "normal" | "review" | "blocked";

  // Delivery & Courier
  paymentMethod: PaymentMethod;
  payment_method?: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  delivery_method?: DeliveryMethod;
  carrier?: string;
  courier_name?: string;
  courier_provider?: string;
  trackingNumber?: string;
  tracking_number?: string;
  waybill_number?: string;
  estimatedDeliveryDate?: string;
  estimated_delivery?: string;

  // Customer Info
  customerName: string;
  customer_name?: string;
  customerEmail: string;
  customer_email?: string;
  customerPhone?: string;
  customer_phone?: string;

  // Addresses
  shippingAddress: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_region?: string;
  shipping_postal_code?: string;
  shipping_country?: string;

  billingAddress?: string;
  billing_address?: string;
  billing_city?: string;
  billing_region?: string;
  billing_postal_code?: string;
  billing_country?: string;

  // Coupons & Notes
  coupon_id?: string;
  coupon_code?: string;
  customer_note?: string;
  vendor_note?: string;
  internal_note?: string;
  notes?: string;

  // Cancellation & Completion
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  completed_at?: string;
  idempotency_key?: string;

  // Metadata & Timestamps
  createdAt: string; // ISO date string
  created_at?: string;
  updated_at?: string;
  isNew?: boolean;

  // Sub-entities
  items: OrderItem[];
  timeline?: TimelineEvent[];
  events?: OrderEvent[];
  payments?: OrderPayment[];
  returns?: OrderReturn[];
  refunds?: OrderRefund[];
  complaints?: OrderComplaint[];
}

export type DateRangeOption = "all" | "today" | "last_7_days" | "last_30_days" | "custom";

export interface OrderFilterState {
  searchQuery: string;
  deliveryStatus: OrderStatus | DeliveryStatus | "all";
  paymentStatus: PaymentStatus | "all";
  paymentMethod: PaymentMethod | "all";
  deliveryMethod: DeliveryMethod | "all";
  dateRange: DateRangeOption;
  customStartDate?: string;
  customEndDate?: string;
  codOnly?: boolean;
}
