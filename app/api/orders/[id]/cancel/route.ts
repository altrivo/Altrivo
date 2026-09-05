import { NextRequest, NextResponse } from "next/server";
import { OrdersBackendService } from "@/services/orders-backend-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updated = await OrdersBackendService.transitionStatus(id, "cancelled");
    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to cancel order" },
      { status: 400 }
    );
  }
}
