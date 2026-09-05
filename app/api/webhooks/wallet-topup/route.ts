import { NextRequest, NextResponse } from "next/server";
import { WalletService } from "@/services/marketing-wallet-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, amount, status, signature } = body;

    if (!vendorId || !amount || !status) {
      return NextResponse.json(
        { success: false, error: "Missing vendorId, amount, or status parameters" },
        { status: 400 }
      );
    }

    // Verify webhook signature (simple developer check)
    if (signature !== "altrivo_wallet_topup_secret_sig") {
      return NextResponse.json({ success: false, error: "Invalid signature payload" }, { status: 401 });
    }

    if (status === "success" || status === "complete") {
      // Append positive amount to ledger
      await WalletService.recordTransaction(vendorId, "top-up", parseFloat(amount), `ref_${Date.now()}`);
      console.log(`[Wallet Webhook] Credited $${amount} to vendor ${vendorId} balance.`);
    }

    return NextResponse.json({ success: true, message: "Topup webhook verified and processed" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process topup webhook" },
      { status: 500 }
    );
  }
}
