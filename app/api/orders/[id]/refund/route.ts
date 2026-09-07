import { NextRequest, NextResponse } from "next/server";
import { OrdersBackendService } from "@/services/orders-backend-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.amount || !body.reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: amount, reason" },
        { status: 400 }
      );
    }

    const refund = await OrdersBackendService.issueRefund(id, {
      amount: Number(body.amount),
      reason: body.reason,
      refundType: body.refundType || "full",
      vendorId: body.vendorId,
    });

    const updatedOrder = await OrdersBackendService.getOrderById(id);

    return NextResponse.json({
      success: true,
      refund,
      order: updatedOrder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to issue refund" },
      { status: 400 }
    );
  }
}
