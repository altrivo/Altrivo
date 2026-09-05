import "@testing-library/jest-dom";
import { InventoryBackendService } from "../inventory-backend-service";

describe("InventoryBackendService (OCC Versioning & Stock Events)", () => {
  beforeEach(() => {
    InventoryBackendService.clearEmittedEvents();
  });

  it("updates variant fields in <300ms SLA and increments version", () => {
    const items = InventoryBackendService.getAllItems();
    const item = items[0];
    const initialVersion = item.version || 1;

    const startTime = performance.now();
    const res = InventoryBackendService.updateVariant(item.id, {
      price: 55.0,
      version: initialVersion,
    });
    const duration = performance.now() - startTime;

    expect(res.success).toBe(true);
    expect(res.item?.price).toBe(55.0);
    expect(res.item?.version).toBe(initialVersion + 1);
    expect(duration).toBeLessThan(300); // SLA <300ms requirement
  });

  it("detects optimistic concurrency conflicts when version mismatches", () => {
    const items = InventoryBackendService.getAllItems();
    const item = items[0];

    // Attempt update with wrong version (expected version 999 instead of actual version)
    const res = InventoryBackendService.updateVariant(item.id, {
      price: 99.99,
      version: 999,
    });

    expect(res.success).toBe(false);
    expect(res.conflict).toBe(true);
    expect(res.error).toContain("Optimistic concurrency conflict");
  });

  it("emits stock_changed event with low-stock detection when stock changes", () => {
    const items = InventoryBackendService.getAllItems();
    const item = items[0];

    // Update stock to low stock level (e.g. stock = 2, threshold = 10)
    const res = InventoryBackendService.updateVariant(item.id, {
      stock: 2,
      lowStockThreshold: 10,
    });

    expect(res.success).toBe(true);
    expect(res.eventEmitted).toBeDefined();
    expect(res.eventEmitted?.event).toBe("stock_changed");
    expect(res.eventEmitted?.isLowStock).toBe(true);
    expect(res.eventEmitted?.isOutOfStock).toBe(false);

    const logs = InventoryBackendService.getEmittedStockEvents();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[logs.length - 1].newStock).toBe(2);
  });
});
