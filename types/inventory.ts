import type { ProductStatus } from "./product";

export interface InventoryItem {
  id: string;
  productId: string;
  variantId?: string;
  isVariant: boolean;
  parentName?: string;
  variantTitle?: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  version: number; // Optimistic Concurrency Control version field
  thumbnail: string;
  category: string;
  status: ProductStatus;
  updatedAt: string;
}

export type EditableInventoryField = "price" | "stock" | "lowStockThreshold";

export interface InventoryUpdateRequest {
  id: string;
  field: EditableInventoryField;
  value: number;
  version?: number; // Expected version for optimistic concurrency check
  simulateError?: boolean;
}

export interface InventoryPatchInput {
  price?: number;
  stock?: number;
  lowStockThreshold?: number;
  threshold?: number;
  version?: number; // Expected version for optimistic concurrency check
  simulateError?: boolean;
}

export interface StockChangedEvent {
  event: "stock_changed";
  variantId: string;
  sku: string;
  previousStock: number;
  newStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  timestamp: string;
}

export interface InventoryUpdateResponse {
  success: boolean;
  item?: InventoryItem;
  version?: number;
  eventEmitted?: StockChangedEvent | null;
  error?: string;
  updatedAt?: string;
}

export interface CellPosition {
  rowIndex: number;
  colKey: EditableInventoryField;
}
