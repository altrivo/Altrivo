/**
 * DigiShop AI — Individual Store API
 * 
 * GET: Store details
 * PUT: Update store settings
 * DELETE: Deactivate store (soft delete)
 */
import { NextRequest, NextResponse } from "next/server";
import { requireVendorStoreAccess, AuthError } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const ctx = await requireVendorStoreAccess(storeId);

    const db = supabaseAdmin;
    if (!db) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    const { data: store, error } = await db
      .from("stores")
      .select("*")
      .eq("id", storeId)
      .eq("vendor_id", ctx.user.id)
      .single();

    if (error || !store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    // Fetch settings
    const { data: settings } = await db
      .from("store_settings")
      .select("section, settings")
      .eq("store_id", storeId);

    // Fetch domains
    const { data: domains } = await db
      .from("domains")
      .select("*")
      .eq("store_id", storeId);

    return NextResponse.json({
      success: true,
      store,
      settings: settings || [],
      domains: domains || [],
    });
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
    const ctx = await requireVendorStoreAccess(storeId);

    const db = supabaseAdmin;
    if (!db) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    const body = await request.json();
    
    // Only allow specific fields to be updated
    const allowedFields = [
      "name", "slug", "niche", "description", "logo_url",
      "layout_config", "seo_config", "commerce_config",
      "is_published", "custom_domain", "subdomain",
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 });
    }

    const { data: store, error } = await db
      .from("stores")
      .update(updates)
      .eq("id", storeId)
      .eq("vendor_id", ctx.user.id)
      .select()
      .single();

    if (error) {
      console.error("[Store Update] Error:", error);
      return NextResponse.json({ success: false, error: "Failed to update store" }, { status: 500 });
    }

    return NextResponse.json({ success: true, store });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    // Soft delete: unpublish the store
    const { error } = await db
      .from("stores")
      .update({ is_published: false })
      .eq("id", storeId);

    if (error) {
      return NextResponse.json({ success: false, error: "Failed to deactivate store" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Store deactivated" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
