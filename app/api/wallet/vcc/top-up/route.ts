import { NextRequest, NextResponse } from "next/server";
import { WalletService } from "@/services/marketing-wallet-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, vendorId, amount } = body;

    if (!cardId || !vendorId || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing cardId, vendorId, or amount" },
        { status: 400 }
      );
    }

    const card = await WalletService.topUpVccFromWallet(cardId, vendorId, amount);
    return NextResponse.json({ success: true, card });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to top up VCC" },
      { status: 500 }
    );
  }
}
