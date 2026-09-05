import { NextRequest, NextResponse } from "next/server";
import { PaymentGatewayService } from "@/services/payment-gateway-service";
import { OrdersBackendService } from "@/services/orders-backend-service";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-safepay-signature") || "";

    if (!signature) {
      return NextResponse.json({ success: false, error: "Missing signature header" }, { status: 400 });
    }

    const isValid = PaymentGatewayService.verifySafepayWebhook(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid Safepay signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const orderId = payload.order_id;
    const status = payload.status; // "paid" or "success"

    if (orderId && (status === "paid" || status === "success")) {
      await OrdersBackendService.transitionStatus(orderId, "paid");
      console.log(`[Safepay Webhook] Order ${orderId} marked PAID successfully.`);
    }

    return NextResponse.json({ success: true, message: "Safepay webhook processed" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process Safepay webhook" },
      { status: 500 }
    );
  }
}
