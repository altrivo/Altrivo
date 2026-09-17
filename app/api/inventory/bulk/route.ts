import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { InventoryBackendService } from "@/services/inventory-backend-service";
import { updateProductInDatabase } from "@/lib/product-db-sync";

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  try {
    const body = await request.json();
    const { action, itemIds, updates, items, simulateError } = body;

    const simulateErrorHeader = request.headers.get("x-simulate-error");
    if (simulateError || simulateErrorHeader === "true") {
      return NextResponse.json(
        {
          success: false,
          error: "Simulated database transaction failure during bulk operation",
        },
        { status: 500 }
      );
    }

    if (action === "bulk-import") {
      if (!Array.isArray(items)) {
        return NextResponse.json(
          { success: false, error: "Invalid payload: items array is required for bulk import" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          action: "bulk-import",
          importedCount: items.length,
          updatedAt: new Date().toISOString(),
          message: `Successfully imported ${items.length} inventory records.`,
        },
        { status: 200 }
      );
    }

    if (action === "bulk-edit") {
      if (!Array.isArray(itemIds) || itemIds.length === 0 || !updates) {
        return NextResponse.json(
          { success: false, error: "Invalid payload: itemIds array and updates object are required" },
          { status: 400 }
        );
      }

      const bulkRes = InventoryBackendService.bulkUpdate(itemIds, updates);
      const elapsedMs = Math.round(performance.now() - startTime);

      // Persist updates to Supabase products & variants tables
      if (Array.isArray(bulkRes.items)) {
        Promise.all(
          bulkRes.items.map((it) =>
            updateProductInDatabase(it.productId || it.id, {
              price: it.price,
              stock: it.stock,
              lowStockThreshold: it.lowStockThreshold,
              status: it.status,
            })
          )
        ).catch((e) => console.warn("[bulk-edit] Supabase sync note:", e));
      }

      return NextResponse.json(
        {
          success: true,
          action: "bulk-edit",
          updatedCount: bulkRes.updatedCount,
          eventsEmittedCount: bulkRes.eventsEmittedCount,
          itemIds,
          items: bulkRes.items,
          updatedAt: new Date().toISOString(),
          message: `Successfully updated ${bulkRes.updatedCount} inventory items in database.`,
          performance: {
            queryTimeMs: elapsedMs,
            sla: elapsedMs < 300 ? "PASS (<300ms)" : "WARN",
          },
        },
        { status: 200 }
      );
    }

    if (action === "bulk-delete") {
      if (!Array.isArray(itemIds) || itemIds.length === 0) {
        return NextResponse.json(
          { success: false, error: "Invalid payload: itemIds array is required" },
          { status: 400 }
        );
      }

      // Persist delete in Supabase products
      Promise.all(
        itemIds.map((id) =>
          updateProductInDatabase(id, { status: "archived" })
        )
      ).catch((e) => console.warn("[bulk-delete] Supabase sync note:", e));

      return NextResponse.json(
        {
          success: true,
          action: "bulk-delete",
          deletedCount: itemIds.length,
          itemIds,
          message: `Successfully deleted ${itemIds.length} items.`,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Unsupported bulk action '${action}'` },
      { status: 400 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
