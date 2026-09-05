import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { StoreCustomer } from "@/types/customer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_id = "753ea49c-abae-4dd3-9107-1dc8fcd6b221", email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Both email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Authentication service unavailable. Please try again later." },
        { status: 500 }
      );
    }

    // 1. Check if user exists in Supabase Auth
    const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      console.error("[Customer Login] Error checking users list:", listErr);
    }

    const existingAuthUser = listData?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    // If user does not exist in database, REJECT LOGIN with explicit error
    if (!existingAuthUser) {
      return NextResponse.json(
        {
          success: false,
          error: `No registered account found for "${cleanEmail}". Please create an account first.`,
        },
        { status: 404 }
      );
    }

    // 2. Validate password via Supabase Auth signInWithPassword
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Auth client unavailable." },
        { status: 500 }
      );
    }

    const { data: authSession, error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (signInError) {
      console.warn("[Customer Login] Password verification failed:", signInError.message);
      return NextResponse.json(
        {
          success: false,
          error: "Incorrect password. Please verify your password and try again.",
        },
        { status: 401 }
      );
    }

    // 3. User authenticated successfully! Fetch or build their store customer profile
    let customerProfile: StoreCustomer;

    try {
      const { data: dbCustomer } = await supabaseAdmin
        .from("store_customers")
        .select("*")
        .eq("store_id", store_id)
        .eq("email", cleanEmail)
        .single();

      if (dbCustomer) {
        customerProfile = dbCustomer;
      } else {
        // Build profile from Supabase Auth user metadata
        const meta = existingAuthUser.user_metadata || {};
        const inferredName =
          meta.name ||
          cleanEmail
            .split("@")[0]
            .replace(/[\._]/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase());

        customerProfile = {
          id: existingAuthUser.id,
          store_id,
          auth_user_id: existingAuthUser.id,
          name: inferredName,
          email: cleanEmail,
          phone: meta.phone || "",
          created_at: existingAuthUser.created_at || new Date().toISOString(),
        };

        // Try persisting in store_customers table
        try {
          await supabaseAdmin.from("store_customers").insert({
            id: customerProfile.id,
            store_id,
            auth_user_id: customerProfile.auth_user_id,
            name: customerProfile.name,
            email: customerProfile.email,
            phone: customerProfile.phone,
            created_at: customerProfile.created_at,
          });
        } catch (e) {}
      }
    } catch (dbErr) {
      const meta = existingAuthUser.user_metadata || {};
      customerProfile = {
        id: existingAuthUser.id,
        store_id,
        auth_user_id: existingAuthUser.id,
        name: meta.name || cleanEmail.split("@")[0],
        email: cleanEmail,
        phone: meta.phone || "",
        created_at: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      customer: customerProfile,
      message: "Login successful",
    });
  } catch (err: any) {
    console.error("[Customer Login] Internal exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to log in" },
      { status: 500 }
    );
  }
}
