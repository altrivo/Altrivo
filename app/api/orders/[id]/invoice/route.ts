import { NextRequest, NextResponse } from "next/server";
import { OrdersBackendService } from "@/services/orders-backend-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceData = await OrdersBackendService.getInvoiceData(id);
    return NextResponse.json({ success: true, invoice: invoiceData });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate invoice" },
      { status: 404 }
    );
  }
}
