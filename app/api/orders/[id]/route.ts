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

    let updatedOrder = await OrdersBackendService.getOrderById(id);

    // 1. If updating notes
    if (
      body.customerNote !== undefined ||
      body.vendorNote !== undefined ||
      body.internalNote !== undefined ||
      body.notes !== undefined
    ) {
      updatedOrder = await OrdersBackendService.updateNotes(id, {
        customerNote: body.customerNote || body.notes,
        vendorNote: body.vendorNote,
        internalNote: body.internalNote,
      });
    }

    // 2. If updating tracking or courier details directly
    if (body.trackingNumber || body.carrier) {
      updatedOrder = await OrdersBackendService.updateTracking(id, {
        trackingNumber: body.trackingNumber,
        carrier: body.carrier,
      });
    }

    // 3. If transitioning status
    const status = body.status || body.orderStatus || body.deliveryStatus;
    if (status) {
      updatedOrder = await OrdersBackendService.transitionStatus(id, status, {
        actorType: body.actorType || "vendor",
        actorId: body.actorId,
        reason: body.reason,
        courierDetails: body.courierDetails || {
          trackingNumber: body.trackingNumber,
          courierName: body.carrier,
        },
      });
    }

    if (updatedOrder) {
      return NextResponse.json({ success: true, order: updatedOrder });
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
