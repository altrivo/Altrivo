/**
 * DigiShop AI — Store Settings API
 * 
 * GET: Fetch all settings sections for a store
 * PUT: Update a specific settings section
 */
import { NextRequest, NextResponse } from "next/server";
import { requireVendorStoreAccess, AuthError } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase";

const VALID_SECTIONS = [
  "identity",    // name, logo, favicon, description, contact
  "theme",       // colors, typography, spacing, dark/light
  "commerce",    // currency, tax, inventory, shipping, order limits
  "checkout",    // required fields, guest cart, account requirement
  "payments",    // enabled methods, provider config references, COD rules
  "notifications", // email/in-app/WhatsApp preferences
  "seo",         // titles, descriptions, robots, sitemap
  "marketing",   // campaigns, abandoned cart, tracking pixels
  "security",    // session settings, domain verification, webhooks
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    await requireVendorStoreAccess(storeId);

    const db = supabaseAdmin;
    if (!db) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    const { data: settings, error } = await db
      .from("store_settings")
      .select("section, settings, updated_at")
      .eq("store_id", storeId);

    if (error) {
      return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
    }

    // Build a map of section -> settings, with defaults for missing sections
    const settingsMap: Record<string, any> = {};
    for (const section of VALID_SECTIONS) {
      const found = settings?.find((s) => s.section === section);
      settingsMap[section] = found?.settings || {};
    }

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    await requireVendorStoreAccess(storeId);

    const db = supabaseAdmin;
    if (!db) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    const body = await request.json();
    const { section, settings: settingsData } = body;

    if (!section || !VALID_SECTIONS.includes(section)) {
      return NextResponse.json(
        { success: false, error: `Invalid section. Valid: ${VALID_SECTIONS.join(", ")}` },
        { status: 400 }
      );
    }

    if (!settingsData || typeof settingsData !== "object") {
      return NextResponse.json(
        { success: false, error: "Settings data must be a JSON object" },
        { status: 400 }
      );
    }

    // Upsert the settings section
    const { data, error } = await db
      .from("store_settings")
      .upsert(
        {
          store_id: storeId,
          section,
          settings: settingsData,
        },
        { onConflict: "store_id,section" }
      )
      .select()
      .single();

    if (error) {
      console.error("[Store Settings] Upsert error:", error);
      return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
    }

    return NextResponse.json({ success: true, section, settings: data?.settings || settingsData });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
