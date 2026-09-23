import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const storeId = searchParams.get("store_id");

    if (!customerId || !storeId) {
      return NextResponse.json({ success: false, customer: null });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: "DB unavailable" }, { status: 500 });
    }

    const { data: customer, error } = await supabaseAdmin
      .from("store_customers")
      .select("*")
      .eq("id", customerId)
      .eq("store_id", storeId)
      .maybeSingle();

    if (error || !customer) {
      return NextResponse.json({ success: false, customer: null });
    }

    return NextResponse.json({ success: true, customer });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, storeId, name, phone } = body;

    if (!customerId || !name) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: "DB unavailable" }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("store_customers")
      .update({
        name: name.trim(),
        phone: phone?.trim() || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, customer: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
