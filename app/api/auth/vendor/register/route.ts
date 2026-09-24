import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { EmailService } from "@/services/email-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, password, business_name, country, region } = body;

    // 1. Validate mandatory fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password is required." },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    // Normalize phone by removing spaces and dashes
    const cleanPhone = phone.trim().replace(/[\s\-]/g, "");

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // 3. Validate phone format (at least 10 digits)
    const phoneDigits = cleanPhone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid phone number (at least 10 digits)." },
        { status: 400 }
      );
    }

    // 4. Validate password complexity (Large alphabet, Small alphabet, Number, Symbol, min 8 chars)
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (password.length < 8 || !hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      const missing: string[] = [];
      if (password.length < 8) missing.push("minimum 8 characters");
      if (!hasUpper) missing.push("large alphabet (A-Z)");
      if (!hasLower) missing.push("small alphabet (a-z)");
      if (!hasNumber) missing.push("number (0-9)");
      if (!hasSymbol) missing.push("symbol (!@#$...)");

      return NextResponse.json(
        {
          success: false,
          error: `Password must include: ${missing.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Database service unavailable. Please check configuration." },
        { status: 500 }
      );
    }

    // 5. Duplicate Check in public.vendors
    // Check Email in vendors table
    const { data: vendorByEmail } = await supabaseAdmin
      .from("vendors")
      .select("id, email")
      .eq("email", cleanEmail)
      .maybeSingle();

    // Check Phone in vendors table
    const { data: vendorByPhone } = await supabaseAdmin
      .from("vendors")
      .select("id, phone")
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (vendorByEmail && vendorByPhone) {
      return NextResponse.json(
        {
          success: false,
          error: "This email address and mobile number are already registered as a vendor. Please sign in instead.",
          conflictField: "both",
        },
        { status: 409 }
      );
    }

    if (vendorByEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "This email address is already registered as a vendor. Please sign in or use another email.",
          conflictField: "email",
        },
        { status: 409 }
      );
    }

    if (vendorByPhone) {
      return NextResponse.json(
        {
          success: false,
          error: "This phone number is already registered with another vendor. Please use another number or sign in.",
          conflictField: "phone",
        },
        { status: 409 }
      );
    }

    // 6. Check if an account already exists in Supabase Auth (e.g. from customer portal or previous partial signup)
    let existingAuthUser: any = null;
    try {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      existingAuthUser = listData?.users?.find(
        (u) => u.email?.toLowerCase() === cleanEmail
      );
    } catch (authListErr) {
      console.warn("[Vendor Register] auth list check warning:", authListErr);
    }

    let userId: string;

    if (existingAuthUser) {
      // User account already exists in Supabase Auth, but is NOT yet in public.vendors.
      // Upgrade their account with vendor credentials, phone, and vendor role metadata
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
        existingAuthUser.id,
        {
          password: password,
          email_confirm: true,
          user_metadata: {
            ...existingAuthUser.user_metadata,
            name: cleanName,
            phone: cleanPhone,
            role: "vendor",
            business_name: business_name?.trim() || cleanName,
          },
        }
      );

      if (updateErr) {
        console.error("[Vendor Register] Error updating existing auth user:", updateErr);
        return NextResponse.json(
          {
            success: false,
            error: updateErr.message || "Failed to update account credentials.",
          },
          { status: 500 }
        );
      }

      userId = existingAuthUser.id;
    } else {
      // Create new Vendor User in Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: cleanName,
          phone: cleanPhone,
          role: "vendor",
          business_name: business_name?.trim() || cleanName,
        },
      });

      if (authError || !authUser?.user) {
        console.error("[Vendor Register] Auth creation error:", authError);
        return NextResponse.json(
          {
            success: false,
            error: authError?.message || "Failed to create vendor auth account.",
          },
          { status: 500 }
        );
      }

      userId = authUser.user.id;
    }

    // 7. Save / Update Vendor in public.vendors table
    // PostgreSQL trigger may have already inserted a blank vendor record, so we upsert
    const { data: updatedVendor, error: vendorDbError } = await supabaseAdmin
      .from("vendors")
      .upsert(
        {
          id: userId,
          name: cleanName,
          business_name: business_name?.trim() || cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          category: "General",
          region: region?.trim() || country?.trim() || "Pakistan",
          status: "pending",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (vendorDbError) {
      console.error("[Vendor Register] DB update error:", vendorDbError);
      // Fallback: try update directly
      await supabaseAdmin
        .from("vendors")
        .update({
          name: cleanName,
          business_name: business_name?.trim() || cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          status: "pending",
        })
        .eq("id", userId);
    }

    // Dispatch welcome notification email via Resend
    try {
      await EmailService.sendVendorWelcome(
        cleanName,
        cleanEmail,
        business_name?.trim() || cleanName
      );
    } catch (welcomeErr) {
      console.error("[Vendor Register] Error dispatching welcome email:", welcomeErr);
    }

    // Purge any stale server SSR session from a previous account
    try {
      const serverSupabase = await createClient();
      await serverSupabase.auth.signOut();
    } catch {}

    const response = NextResponse.json(
      {
        success: true,
        message: "Vendor account created successfully! Your account is pending approval. You can start onboarding while we verify your details.",
        vendor: {
          id: userId,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
        },
      },
      { status: 201 }
    );

    response.cookies.set("active_vendor_id", userId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      httpOnly: false,
    });

    // Clear any stale active_store_id from a previous vendor
    response.cookies.set("active_store_id", "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      httpOnly: false,
    });

    return response;
  } catch (error: any) {
    console.error("[Vendor Register] Server exception:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
