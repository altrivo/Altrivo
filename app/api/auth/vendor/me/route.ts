import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    let userId: string | null = null;
    let authEmail: string | null = null;
    let authName: string | null = null;
    let authPhone: string | null = null;

    const cookieStore = await cookies();
    const activeVendorId = cookieStore.get("active_vendor_id")?.value;

    let ssrUser: any = null;
    try {
      const supabase = await createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        ssrUser = userData.user;
      }
    } catch {}

    // Priority 1: active_vendor_id cookie explicitly set by vendor login/registration
    if (activeVendorId) {
      userId = activeVendorId;
      if (ssrUser && ssrUser.id === activeVendorId) {
        authEmail = ssrUser.email || null;
        authName = ssrUser.user_metadata?.name || null;
        authPhone = ssrUser.user_metadata?.phone || null;
      }
    } else if (ssrUser?.id) {
      // Priority 2: Fallback to SSR session user
      userId = ssrUser.id;
      authEmail = ssrUser.email || null;
      authName = ssrUser.user_metadata?.name || null;
      authPhone = ssrUser.user_metadata?.phone || null;
    }

    if (!userId || !supabaseAdmin) {
      return NextResponse.json({
        authenticated: false,
        vendor: null,
        stores: [],
        hasStore: false,
        storesCount: 0,
      });
    }

    // 3. Fetch vendor record from public.vendors table
    const { data: vendor, error: vErr } = await supabaseAdmin
      .from("vendors")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (vErr || !vendor) {
      // If not in database, vendor is not registered
      return NextResponse.json({
        authenticated: false,
        vendor: null,
        stores: [],
        hasStore: false,
        storesCount: 0,
      });
    }

    // 4. Fetch stores belonging STRICTLY to this specific vendor
    const { data: stores, error: sErr } = await supabaseAdmin
      .from("stores")
      .select("id, name, slug, subdomain, is_published, created_at, layout_config")
      .eq("vendor_id", userId)
      .order("created_at", { ascending: false });

    const vendorStores = (!sErr && stores) ? stores : [];

    return NextResponse.json({
      authenticated: true,
      vendor: {
        id: vendor.id,
        name: vendor.name || authName || "Vendor",
        email: vendor.email || authEmail || "",
        phone: vendor.phone || authPhone || "",
        business_name: vendor.business_name || vendor.name,
        category: vendor.category || "General",
        status: vendor.status || "active",
      },
      stores: vendorStores,
      hasStore: vendorStores.length > 0,
      storesCount: vendorStores.length,
    });
  } catch (error: any) {
    console.error("[Vendor Me] Error:", error);
    return NextResponse.json({
      authenticated: false,
      vendor: null,
      stores: [],
      hasStore: false,
      storesCount: 0,
    });
  }
}
