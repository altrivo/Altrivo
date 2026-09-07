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

    // 1. If updating notes
    if (body.customerNote !== undefined || body.vendorNote !== undefined || body.internalNote !== undefined) {
      const updated = await OrdersBackendService.updateNotes(id, {
        customerNote: body.customerNote,
        vendorNote: body.vendorNote,
        internalNote: body.internalNote,
      });
      return NextResponse.json({ success: true, order: updated });
    }

    // 2. If transitioning status
    const status = body.status || body.orderStatus || body.deliveryStatus;
    if (status) {
      const updated = await OrdersBackendService.transitionStatus(id, status, {
        actorType: body.actorType || "vendor",
        actorId: body.actorId,
        reason: body.reason,
        courierDetails: body.courierDetails,
      });
      return NextResponse.json({ success: true, order: updated });
    }

    return NextResponse.json(
      { success: false, error: "No recognized update fields provided" },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update order" },
      { status: 400 }
    );
  }
}
