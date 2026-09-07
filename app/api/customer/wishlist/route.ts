import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ success: false, items: [] });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, items: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("customer_wishlist")
      .select("*")
      .eq("customer_id", customerId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, items: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, productId } = body;

    if (!customerId || !productId) {
      return NextResponse.json({ success: false, error: "Missing customerId or productId" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: "DB unavailable" }, { status: 500 });
    }

    // Check if already in wishlist
    const { data: existing } = await supabaseAdmin
      .from("customer_wishlist")
      .select("id")
      .eq("customer_id", customerId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      // Remove it (toggle behavior)
      await supabaseAdmin.from("customer_wishlist").delete().eq("id", existing.id);
      return NextResponse.json({ success: true, action: "removed", inWishlist: false });
    }

    const { data, error } = await supabaseAdmin
      .from("customer_wishlist")
      .insert({
        customer_id: customerId,
        product_id: productId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, action: "added", inWishlist: true, item: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const productId = searchParams.get("productId");

    if (!customerId || !productId) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: "DB unavailable" }, { status: 500 });
    }

    await supabaseAdmin
      .from("customer_wishlist")
      .delete()
      .eq("customer_id", customerId)
      .eq("product_id", productId);

    return NextResponse.json({ success: true, message: "Removed from wishlist" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
