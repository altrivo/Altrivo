import { NextResponse, NextRequest } from "next/server";
import {
  generateAiThemeWithCost,
  getVendorStoredTheme,
} from "@/lib/storefront/aiThemeGenerator";
import { invalidateVendorThemeCache } from "@/lib/storefront/themeCache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, vendorId = "v-default" } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required and must be a non-empty string.",
        },
        { status: 400 }
      );
    }

    // Generate AI Theme with Smart Token Optimization & Cost Tracking (<$0.05 SLA)
    const { tokens, cost } = generateAiThemeWithCost(prompt, vendorId);

    // Invalidate 5-minute SSR theme cache immediately upon theme edit
    invalidateVendorThemeCache(vendorId);

    // Schema Validation
    const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
    if (!hexColorRegex.test(tokens.primaryColor) || !hexColorRegex.test(tokens.accentColor)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid theme output schema: primaryColor or accentColor failed hex format validation.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        vendorId,
        tokens,
        cost,
        message: "AI Theme Rebranding successful. Tokens saved to database.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[AI Theme Rebrand Error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process AI theme rebranding request",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId") || "v-default";

  const theme = getVendorStoredTheme(vendorId);

  return NextResponse.json({
    success: true,
    vendorId,
    tokens: theme || null,
  });
}
