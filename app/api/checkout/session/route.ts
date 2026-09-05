import { NextRequest, NextResponse } from "next/server";
import { PaymentGatewayService } from "@/services/payment-gateway-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, currency, gateway } = body;

    if (!orderId || !amount || !gateway) {
      return NextResponse.json(
        { success: false, error: "Missing orderId, amount, or gateway parameters" },
        { status: 400 }
      );
    }

    let sessionResult;

    if (gateway === "payfast") {
      sessionResult = await PaymentGatewayService.createPayFastSession(orderId, amount, currency || "PKR");
    } else if (gateway === "safepay") {
      sessionResult = await PaymentGatewayService.createSafepaySession(orderId, amount, currency || "PKR");
    } else if (gateway === "stripe") {
      sessionResult = await PaymentGatewayService.createStripeSession(orderId, amount, currency || "USD");
    } else {
      return NextResponse.json(
        { success: false, error: `Unsupported gateway: ${gateway}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, ...sessionResult });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
