import { NextRequest, NextResponse } from "next/server";
import { MetaMarketingService } from "@/services/marketing-wallet-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Missing productId" }, { status: 400 });
    }

    const variants = await MetaMarketingService.generateAdCopy(productId);
    return NextResponse.json({ success: true, variants });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate ad copy" },
      { status: 500 }
    );
  }
}
