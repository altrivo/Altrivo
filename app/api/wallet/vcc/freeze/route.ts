import { NextRequest, NextResponse } from "next/server";
import { WalletService } from "@/services/marketing-wallet-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId } = body;

    if (!cardId) {
      return NextResponse.json({ success: false, error: "Missing cardId" }, { status: 400 });
    }

    const card = await WalletService.freezeVcc(cardId);
    return NextResponse.json({ success: true, card });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to freeze VCC" },
      { status: 500 }
    );
  }
}
