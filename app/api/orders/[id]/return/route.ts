import { NextRequest, NextResponse } from "next/server";
import { OrdersBackendService } from "@/services/orders-backend-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.customerId || !body.reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: customerId, reason" },
        { status: 400 }
      );
    }

    const returnRecord = await OrdersBackendService.requestReturn(id, body.customerId, {
      reason: body.reason,
      description: body.description,
      items: body.items,
    });

    const updatedOrder = await OrdersBackendService.getOrderById(id);

    return NextResponse.json({
      success: true,
      returnRecord,
      order: updatedOrder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process return request" },
      { status: 400 }
    );
  }
}
