import { NextRequest, NextResponse } from "next/server";
import { CodVerificationService } from "@/services/marketing-wallet-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId") || "";

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 400 });
    }

    const verified = await CodVerificationService.verifyOrder(orderId);
    if (!verified) {
      return NextResponse.json(
        { success: false, error: "Order is not pending verification or has already been verified." },
        { status: 400 }
      );
    }

    // Redirect to checkout success page
    return NextResponse.redirect(new URL("/checkout/success", request.url));
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to verify COD order" },
      { status: 500 }
    );
  }
}
