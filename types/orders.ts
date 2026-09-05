export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export type EscrowStatus = "held_in_escrow" | "released_to_vendor" | "refunded_a2_escrow";

export type PaymentMethod =
  | "credit_card"
  | "paypal"
  | "stripe"
  | "cod"
  | "bank_transfer";

export type DeliveryMethod =
  | "standard"
  | "express"
  | "pickup"
  | "international";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  variant?: string;
  sku?: string;
  image?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string; // ISO date string
  step: "paid" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded";
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string;
  vendor_id?: string;
  customer_id?: string | null;
  orderNumber: string; // e.g. #ORD-8942
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  escrowStatus?: EscrowStatus;
  deliveryStatus: OrderStatus;
  deliveryMethod: DeliveryMethod;
  carrier?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  createdAt: string; // ISO date string
  shippingAddress: string;
  billingAddress?: string;
  items: OrderItem[];
  notes?: string;
  isNew?: boolean; // Real-time notification highlight
  timeline?: TimelineEvent[];
}

export type DateRangeOption = "all" | "today" | "last_7_days" | "last_30_days" | "custom";

export interface OrderFilterState {
  searchQuery: string;
  deliveryStatus: OrderStatus | "all";
  paymentStatus: PaymentStatus | "all";
  paymentMethod: PaymentMethod | "all";
  deliveryMethod: DeliveryMethod | "all";
  dateRange: DateRangeOption;
  customStartDate?: string;
  customEndDate?: string;
}
