export type NotificationType = "low_stock" | "out_of_stock" | "system" | "order";

export interface VendorNotification {
  id: string;
  vendorId: string;
  type: NotificationType;
  variantId?: string;
  sku?: string;
  itemName?: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: {
    currentStock?: number;
    lowStockThreshold?: number;
    emailSent?: boolean;
    dedupSkipped?: boolean;
  };
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  vendorId: string;
  unreadBadgeCount: number;
  total: number;
  notifications: VendorNotification[];
}
