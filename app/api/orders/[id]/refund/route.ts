import { NextRequest, NextResponse } from "next/server";
import { OrdersBackendService } from "@/services/orders-backend-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "Vendor requested refund";

    const updated = await OrdersBackendService.transitionStatus(id, "refunded");
    return NextResponse.json({ success: true, order: updated, refundedReason: reason });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to refund order" },
      { status: 400 }
    );
  }
}
