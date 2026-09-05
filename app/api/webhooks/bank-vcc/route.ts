import { NextRequest, NextResponse } from "next/server";
import { WalletService } from "@/services/marketing-wallet-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, amount, merchant } = body;

    if (!cardId || !amount || !merchant) {
      return NextResponse.json(
        { success: false, error: "Missing cardId, amount, or merchant" },
        { status: 400 }
      );
    }

    const success = await WalletService.processVccTransactionWebhook(cardId, amount, merchant);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Authorization declined (inactive card or insufficient balance)" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Authorized successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process card webhook" },
      { status: 500 }
    );
  }
}
