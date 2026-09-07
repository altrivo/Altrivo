import { NextRequest, NextResponse } from "next/server";
import { OrdersBackendService } from "@/services/orders-backend-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slipData = await OrdersBackendService.getPackingSlipData(id);
    return NextResponse.json({ success: true, packingSlip: slipData });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate packing slip" },
      { status: 404 }
    );
  }
}
