import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailOrPhone, password } = body;

    if (!emailOrPhone || typeof emailOrPhone !== "string" || !emailOrPhone.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your email or phone number." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter your password." },
        { status: 400 }
      );
    }

    const input = emailOrPhone.trim();
    const cleanPhone = input.replace(/[\s\-]/g, "");
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Database service unavailable. Please check configuration." },
        { status: 500 }
      );
    }

    let targetEmail = "";
    let vendorRecord: any = null;

    if (isEmail) {
      targetEmail = input.toLowerCase();
      // Check if vendor exists in database
      const { data: vendor } = await supabaseAdmin
        .from("vendors")
        .select("id, name, business_name, email, phone, status")
        .eq("email", targetEmail)
        .maybeSingle();

      if (vendor) {
        vendorRecord = vendor;
      }
    } else {
      // Lookup by Phone in database
      const { data: vendor } = await supabaseAdmin
        .from("vendors")
        .select("id, name, business_name, email, phone, status")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (vendor) {
        targetEmail = vendor.email;
        vendorRecord = vendor;
      } else {
        // Search in Supabase Auth user metadata
        try {
          const { data: authList } = await supabaseAdmin.auth.admin.listUsers();
          const matchUser = authList?.users?.find(
            (u) =>
              u.user_metadata?.phone?.replace(/[\s\-]/g, "") === cleanPhone ||
              u.phone?.replace(/[\s\-]/g, "") === cleanPhone
          );
          if (matchUser?.email) {
            targetEmail = matchUser.email;
          }
        } catch {}
      }
    }

    if (!targetEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "No vendor account found with this mobile number. Please check or register first.",
        },
        { status: 404 }
      );
    }

    // Authenticate against Supabase Auth using target email
    const { data: authData, error: authErr } = await supabaseAdmin.auth.signInWithPassword({
      email: targetEmail,
      password,
    });

    if (authErr || !authData?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Incorrect password or credentials. Please check and try again.",
        },
        { status: 401 }
      );
    }

    // If vendor record does not exist yet in public.vendors, provision/heal it now
    if (!vendorRecord) {
      const meta = authData.user.user_metadata || {};
      const fallbackName = meta.name || targetEmail.split("@")[0];
      const fallbackBusiness = meta.business_name || fallbackName;
      const fallbackPhone = meta.phone || cleanPhone || "";

      const { data: healedVendor } = await supabaseAdmin
        .from("vendors")
        .upsert(
          {
            id: authData.user.id,
            name: fallbackName,
            business_name: fallbackBusiness,
            email: targetEmail,
            phone: fallbackPhone,
            category: "General",
            region: "Pakistan",
            status: "pending",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select()
        .maybeSingle();

      vendorRecord = healedVendor || {
        id: authData.user.id,
        name: fallbackName,
        business_name: fallbackBusiness,
        email: targetEmail,
        phone: fallbackPhone,
      };
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful!",
      vendor: {
        id: vendorRecord.id,
        name: vendorRecord.name,
        businessName: vendorRecord.business_name,
        email: vendorRecord.email,
        phone: vendorRecord.phone,
      },
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at,
      },
      targetEmail,
    });

    response.cookies.set("active_vendor_id", vendorRecord.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      httpOnly: false,
    });

    return response;
  } catch (error: any) {
    console.error("[Vendor Login] Server exception:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
