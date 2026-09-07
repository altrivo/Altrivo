import { NextRequest, NextResponse } from "next/server";
import { OrdersBackendService } from "@/services/orders-backend-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.customerId || !body.subject || !body.message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: customerId, subject, message" },
        { status: 400 }
      );
    }

    const complaint = await OrdersBackendService.fileComplaint(id, body.customerId, {
      subject: body.subject,
      message: body.message,
      priority: body.priority || "medium",
    });

    const updatedOrder = await OrdersBackendService.getOrderById(id);

    return NextResponse.json({
      success: true,
      complaint,
      order: updatedOrder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit complaint" },
      { status: 400 }
    );
  }
}
