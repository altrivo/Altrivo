import { NextRequest, NextResponse } from "next/server";
import { OrdersBackendService } from "@/services/orders-backend-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await OrdersBackendService.getOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch order detail" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Missing required 'status' property" },
        { status: 400 }
      );
    }

    const updated = await OrdersBackendService.transitionStatus(id, status);
    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to transition order status" },
      { status: 400 } // Bad request for invalid transitions
    );
  }
}
