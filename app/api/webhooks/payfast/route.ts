import { NextRequest, NextResponse } from "next/server";
import { PaymentGatewayService } from "@/services/payment-gateway-service";
import { OrdersBackendService } from "@/services/orders-backend-service";

export async function POST(request: NextRequest) {
  try {
    // Parse form-data or JSON
    const contentType = request.headers.get("content-type") || "";
    let payload: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        payload[key] = value.toString();
      });
    } else {
      payload = await request.json();
    }

    const signature = payload.signature || "";
    if (!signature) {
      return NextResponse.json({ success: false, error: "Missing signature" }, { status: 400 });
    }

    const isValid = PaymentGatewayService.verifyPayFastWebhook(payload, signature);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid signature verification" }, { status: 401 });
    }

    const orderId = payload.m_payment_id;
    const paymentStatus = payload.payment_status; // "COMPLETE" in PayFast context

    if (orderId && (paymentStatus === "COMPLETE" || paymentStatus === "complete" || payload.pf_payment_id)) {
      // Transition order state machine to "paid"
      await OrdersBackendService.transitionStatus(orderId, "paid");
      console.log(`[PayFast Webhook] Order ${orderId} marked PAID successfully.`);
    }

    return NextResponse.json({ success: true, message: "PayFast webhook processed" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process PayFast webhook" },
      { status: 500 }
    );
  }
}
