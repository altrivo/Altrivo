import { NextResponse, NextRequest } from "next/server";
import { GeneratedThemeTokens } from "@/lib/storefront/aiThemeGenerator";
import { invalidateVendorThemeCache } from "@/lib/storefront/themeCache";

// In-memory theme store for active vendor theme
let ACTIVE_VENDOR_THEME: GeneratedThemeTokens = {
  primaryColor: "#694873",
  accentColor: "#F2DDE1",
  fontFamily: "Plus Jakarta Sans",
  borderRadius: "rounded-xl",
  styleName: "Artrivo Signature Luxury",
  styleDescription: "Original signature deep purple primary with soft rose accent.",
};

export async function GET() {
  return NextResponse.json({
    success: true,
    theme: ACTIVE_VENDOR_THEME,
    updatedAt: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.primaryColor || !body.accentColor) {
      return NextResponse.json(
        { success: false, error: "Missing required theme fields (primaryColor, accentColor)" },
        { status: 400 }
      );
    }

    ACTIVE_VENDOR_THEME = {
      primaryColor: body.primaryColor,
      accentColor: body.accentColor,
      fontFamily: body.fontFamily || "Plus Jakarta Sans",
      borderRadius: body.borderRadius || "rounded-xl",
      styleName: body.styleName || "Vendor Custom Theme",
      styleDescription: body.styleDescription || "Vendor updated theme settings.",
    };

    // Invalidate 5-minute SSR theme cache immediately upon theme edit
    invalidateVendorThemeCache("v-default");

    return NextResponse.json({
      success: true,
      message: "Theme saved successfully. Reflects on public storefront immediately.",
      theme: ACTIVE_VENDOR_THEME,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to process theme update" },
      { status: 500 }
    );
  }
}
