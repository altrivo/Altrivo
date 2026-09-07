import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailOrPhone, password } = body;

    if (!emailOrPhone || typeof emailOrPhone !== "string" || !emailOrPhone.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your email or phone number / Email ya number enter karein." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter your password / Password enter karein." },
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
      // Verify vendor exists in database
      const { data: vendor, error: vErr } = await supabaseAdmin
        .from("vendors")
        .select("id, name, business_name, email, phone, status")
        .eq("email", targetEmail)
        .maybeSingle();

      if (vErr || !vendor) {
        return NextResponse.json(
          {
            success: false,
            error: "Aapki registration database mein save nahi hai. Baraye meharbani pehle signup karein.",
          },
          { status: 404 }
        );
      }
      vendorRecord = vendor;
    } else {
      // Lookup by Phone in database
      const { data: vendor, error: vErr } = await supabaseAdmin
        .from("vendors")
        .select("id, name, business_name, email, phone, status")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (vErr || !vendor) {
        return NextResponse.json(
          {
            success: false,
            error: "Ye mobile number database mein kisi vendor account se register nahi hai. Pehle signup karein.",
          },
          { status: 404 }
        );
      }
      targetEmail = vendor.email;
      vendorRecord = vendor;
    }

    // Now authenticate against Supabase Auth using the verified vendor email
    const { data: authData, error: authErr } = await supabaseAdmin.auth.signInWithPassword({
      email: targetEmail,
      password,
    });

    if (authErr || !authData?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Incorrect password. Please verify your credentials / Password ghalat hai.",
        },
        { status: 401 }
      );
    }

    // Double check that the authenticated user matches the vendor record
    if (authData.user.id !== vendorRecord.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Vendor ID verification failed.",
        },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful / Kamyabi se login ho gaya!",
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
