/**
 * DigiShop AI — Vendor Stores API
 * 
 * GET: List vendor's stores (authenticated, vendor-scoped)
 * POST: Create a new store
 */
import { NextRequest, NextResponse } from "next/server";
import { getVendorContext, AuthError } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const ctx = await getVendorContext();
    if (!ctx) {
      return NextResponse.json(
        { success: false, error: "Vendor authentication required" },
        { status: 401 }
      );
    }

    const db = supabaseAdmin;
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database unavailable" },
        { status: 500 }
      );
    }

    const { data: stores, error } = await db
      .from("stores")
      .select(`
        id, vendor_id, name, slug, niche, description, logo_url,
        layout_config, seo_config, commerce_config,
        is_published, is_generating, custom_domain, subdomain,
        created_at, updated_at
      `)
      .eq("vendor_id", ctx.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Vendor Stores API] Query error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch stores" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, stores: stores || [] });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("[Vendor Stores API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getVendorContext();
    if (!ctx) {
      return NextResponse.json(
        { success: false, error: "Vendor authentication required" },
        { status: 401 }
      );
    }

    const db = supabaseAdmin;
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database unavailable" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, niche, description } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Store name is required" },
        { status: 400 }
      );
    }

    // Generate a unique slug
    const baseSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    
    let slug = baseSlug;
    let suffix = 1;
    
    // Check for slug uniqueness
    while (true) {
      const { data: existing } = await db
        .from("stores")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      
      if (!existing) break;
      slug = `${baseSlug}-${suffix++}`;
    }

    const { data: store, error } = await db
      .from("stores")
      .insert({
        vendor_id: ctx.user.id,
        name: name.trim(),
        slug,
        niche: niche?.trim() || "retail",
        description: description?.trim() || "",
        subdomain: slug,
        is_published: false,
        is_generating: false,
        layout_config: {},
        seo_config: {},
        commerce_config: { currency: "PKR", cod_enabled: true },
      })
      .select()
      .single();

    if (error) {
      console.error("[Vendor Stores API] Insert error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create store" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, store, message: "Store created successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("[Vendor Stores API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
