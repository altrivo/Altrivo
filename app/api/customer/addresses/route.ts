import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ success: false, addresses: [] });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, addresses: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("customer_addresses")
      .select("*")
      .eq("customer_id", customerId)
      .order("is_default", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, addresses: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      storeId = "753ea49c-abae-4dd3-9107-1dc8fcd6b221",
      label = "Home",
      full_name,
      phone,
      street_address,
      city,
      region = "Punjab",
      postal_code = "",
      is_default = false,
    } = body;

    if (!customerId || !full_name || !street_address || !city) {
      return NextResponse.json({ success: false, error: "Missing required address fields" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: "DB unavailable" }, { status: 500 });
    }

    // If setting as default, unset existing default
    if (is_default) {
      await supabaseAdmin
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("customer_id", customerId);
    }

    const { data, error } = await supabaseAdmin
      .from("customer_addresses")
      .insert({
        customer_id: customerId,
        label,
        street_address,
        city,
        is_default: !!is_default,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, address: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("id");
    const customerId = searchParams.get("customerId");

    if (!addressId || !customerId) {
      return NextResponse.json({ success: false, error: "Missing addressId or customerId" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: "DB unavailable" }, { status: 500 });
    }

    const { error } = await supabaseAdmin
      .from("customer_addresses")
      .delete()
      .eq("id", addressId)
      .eq("customer_id", customerId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Address deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
