import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { InventoryBackendService } from "@/services/inventory-backend-service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = performance.now();
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const simulateErrorHeader = request.headers.get("x-simulate-error");

    if (body.simulateError || simulateErrorHeader === "true" || body.price < 0 || body.stock < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Simulated database write error for optimistic rollback verification",
        },
        { status: 500 }
      );
    }

    const result = InventoryBackendService.updateVariant(id, body);
    const elapsedMs = Math.round(performance.now() - startTime);

    if (!result.success) {
      if (result.conflict) {
        return NextResponse.json(
          {
            success: false,
            conflict: true,
            item: result.item,
            error: result.error,
            performance: { queryTimeMs: elapsedMs },
          },
          { status: 409 } // 409 Conflict for Optimistic Concurrency Failure
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          performance: { queryTimeMs: elapsedMs },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        item: result.item,
        version: result.item?.version,
        eventEmitted: result.eventEmitted,
        message: "Inventory updated successfully",
        performance: {
          queryTimeMs: elapsedMs,
          sla: elapsedMs < 300 ? "PASS (<300ms)" : "WARN",
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = InventoryBackendService.getItem(id);

  if (!item) {
    return NextResponse.json(
      { success: false, error: "Inventory item not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { success: true, item, version: item.version },
    { status: 200 }
  );
}
