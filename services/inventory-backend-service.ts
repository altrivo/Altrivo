import { initialInventoryData } from "@/lib/mock-inventory";
import type {
  InventoryItem,
  InventoryPatchInput,
  StockChangedEvent,
} from "@/types/inventory";

// Initialize in-memory inventory database with concurrency version = 1
const inventoryStore: InventoryItem[] = initialInventoryData.map((item) => ({
  ...item,
  version: item.version || 1,
}));

// Event listener subscribers for stock_changed events
type StockEventListener = (event: StockChangedEvent) => void;
const stockEventListeners: StockEventListener[] = [];

// Logged events history for audit/testing
const emittedStockEvents: StockChangedEvent[] = [];

export class InventoryBackendService {
  /**
   * Subscribe to stock_changed events.
   */
  static onStockChanged(listener: StockEventListener): () => void {
    stockEventListeners.push(listener);
    return () => {
      const idx = stockEventListeners.indexOf(listener);
      if (idx !== -1) stockEventListeners.splice(idx, 1);
    };
  }

  /**
   * Emit stock_changed event for low-stock detection & event listeners.
   */
  private static emitStockChanged(event: StockChangedEvent) {
    emittedStockEvents.push(event);
    stockEventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in stock_changed listener:", err);
      }
    });
  }

  /**
   * Retrieves all emitted stock_changed events (for testing & auditing).
   */
  static getEmittedStockEvents(): StockChangedEvent[] {
    return [...emittedStockEvents];
  }

  /**
   * Clears emitted events buffer.
   */
  static clearEmittedEvents() {
    emittedStockEvents.length = 0;
  }

  /**
   * Retrieves single item by ID or variant ID.
   */
  static getItem(id: string): InventoryItem | null {
    const item = inventoryStore.find((i) => i.id === id || i.variantId === id);
    return item ? { ...item } : null;
  }

  /**
   * Retrieves all inventory items.
   */
  static getAllItems(): InventoryItem[] {
    return [...inventoryStore];
  }

  /**
   * Updates single variant item with Optimistic Concurrency Control (version field) and event emission.
   * Target SLA: < 300ms P95
   */
  static updateVariant(
    id: string,
    input: InventoryPatchInput
  ): {
    success: boolean;
    item?: InventoryItem;
    conflict?: boolean;
    eventEmitted?: StockChangedEvent | null;
    error?: string;
  } {
    const index = inventoryStore.findIndex((i) => i.id === id || i.variantId === id);
    if (index === -1) {
      return {
        success: false,
        error: `Inventory variant '${id}' not found.`,
      };
    }

    const currentItem = inventoryStore[index];

    // 1. Optimistic Concurrency Check (version field)
    if (
      typeof input.version === "number" &&
      input.version !== currentItem.version
    ) {
      return {
        success: false,
        conflict: true,
        item: { ...currentItem },
        error: `Optimistic concurrency conflict: Variant '${id}' was modified by another session (expected version ${input.version}, actual version ${currentItem.version}).`,
      };
    }

    // 2. Perform Single Field / Multi Field Updates
    const previousStock = currentItem.stock;
    const newPrice = typeof input.price === "number" ? Math.max(0, input.price) : currentItem.price;
    const newStock = typeof input.stock === "number" ? Math.max(0, Math.round(input.stock)) : currentItem.stock;
    const newThreshold =
      typeof input.lowStockThreshold === "number"
        ? Math.max(0, Math.round(input.lowStockThreshold))
        : typeof input.threshold === "number"
        ? Math.max(0, Math.round(input.threshold))
        : currentItem.lowStockThreshold;

    const newStatus =
      newStock === 0
        ? "out-of-stock"
        : currentItem.status === "out-of-stock"
        ? "published"
        : currentItem.status;

    // Increment version for optimistic concurrency control
    const nextVersion = (currentItem.version || 1) + 1;

    const updatedItem: InventoryItem = {
      ...currentItem,
      price: Math.round(newPrice * 100) / 100,
      stock: newStock,
      lowStockThreshold: newThreshold,
      status: newStatus,
      version: nextVersion,
      updatedAt: new Date().toISOString(),
    };

    inventoryStore[index] = updatedItem;

    // 3. Emit stock_changed event if stock value changed
    let stockEvent: StockChangedEvent | null = null;
    if (typeof input.stock === "number" && input.stock !== previousStock) {
      stockEvent = {
        event: "stock_changed",
        variantId: updatedItem.id,
        sku: updatedItem.sku,
        previousStock,
        newStock: updatedItem.stock,
        lowStockThreshold: updatedItem.lowStockThreshold,
        isLowStock: updatedItem.stock <= updatedItem.lowStockThreshold && updatedItem.stock > 0,
        isOutOfStock: updatedItem.stock === 0,
        timestamp: new Date().toISOString(),
      };

      this.emitStockChanged(stockEvent);
    }

    return {
      success: true,
      item: updatedItem,
      eventEmitted: stockEvent,
    };
  }

  /**
   * Bulk updates multiple inventory variants.
   */
  static bulkUpdate(
    itemIds: string[],
    updates: { price?: number; stock?: number; lowStockThreshold?: number; status?: string }
  ): {
    success: boolean;
    updatedCount: number;
    eventsEmittedCount: number;
    items: InventoryItem[];
  } {
    let updatedCount = 0;
    let eventsEmittedCount = 0;
    const updatedItems: InventoryItem[] = [];

    itemIds.forEach((id) => {
      const res = this.updateVariant(id, updates);
      if (res.success && res.item) {
        updatedCount++;
        updatedItems.push(res.item);
        if (res.eventEmitted) eventsEmittedCount++;
      }
    });

    return {
      success: true,
      updatedCount,
      eventsEmittedCount,
      items: updatedItems,
    };
  }
}
