import { NextRequest, NextResponse } from "next/server";
import { MetaMarketingService } from "@/services/marketing-wallet-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category } = body;

    if (!category) {
      return NextResponse.json({ success: false, error: "Missing category" }, { status: 400 });
    }

    const targeting = await MetaMarketingService.getTargetingSuggestion(category);
    return NextResponse.json({ success: true, targeting });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate targeting suggestion" },
      { status: 500 }
    );
  }
}
