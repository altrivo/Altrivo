import { NextRequest, NextResponse } from "next/server";
import { PaymentGatewayService } from "@/services/payment-gateway-service";
import { OrdersBackendService } from "@/services/orders-backend-service";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    if (!signature) {
      return NextResponse.json({ success: false, error: "Missing stripe-signature header" }, { status: 400 });
    }

    const isValid = PaymentGatewayService.verifyStripeWebhook(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid Stripe signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.type;

    if (eventType === "checkout.session.completed") {
      const session = payload.data.object;
      const orderId = session.metadata?.order_id || session.client_reference_id;
      
      if (orderId) {
        await OrdersBackendService.transitionStatus(orderId, "paid");
        console.log(`[Stripe Webhook] Order ${orderId} marked PAID successfully.`);
      }
    }

    return NextResponse.json({ success: true, received: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process Stripe webhook" },
      { status: 500 }
    );
  }
}
