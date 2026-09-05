import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, amount, method } = body;

    if (!vendorId || !amount || !method) {
      return NextResponse.json(
        { success: false, error: "Missing vendorId, amount, or method parameters" },
        { status: 400 }
      );
    }

    if (method !== "jazzcash" && method !== "easypaisa" && method !== "bank_transfer") {
      return NextResponse.json(
        { success: false, error: `Unsupported top-up method: ${method}` },
        { status: 400 }
      );
    }

    // Simulate A2's checkout integration redirect
    const topupSessionId = `wp_top_${Date.now()}`;
    const redirectUrl = `https://checkout.altrivo.com/wallet-topup?vendor_id=${vendorId}&amount=${amount}&method=${method}&session=${topupSessionId}`;

    return NextResponse.json({
      success: true,
      sessionId: topupSessionId,
      redirectUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create top-up checkout" },
      { status: 500 }
    );
  }
}
