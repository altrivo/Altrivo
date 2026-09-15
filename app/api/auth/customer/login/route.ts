import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { findStoreCustomer, resolveStoreInfo } from "@/lib/customer/customer-store";
import { StoreCustomer } from "@/types/customer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawStoreId = body.store_id || body.storeId || "";
    const { email, password } = body;

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

    // 1. Resolve store info strictly
    const storeInfo = await resolveStoreInfo(rawStoreId);
    const resolvedStoreId = storeInfo?.id || rawStoreId;
    const storeSlug = storeInfo?.slug || (typeof rawStoreId === "string" ? rawStoreId : "");
    const storeName = storeInfo?.name || "this store";

    // 2. Check if user exists in Supabase Auth
    const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      console.error("[Customer Login] Error checking users list:", listErr);
    }

    const existingAuthUser = listData?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    if (!existingAuthUser) {
      return NextResponse.json(
        {
          success: false,
          error: `No registered account found for "${cleanEmail}". Please create an account on ${storeName} first.`,
        },
        { status: 404 }
      );
    }

    // 3. Validate password via Supabase Auth signInWithPassword
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Auth client unavailable." },
        { status: 500 }
      );
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
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

    // 4. Strict Store Isolation Check: Is this customer registered on THIS store?
    const storeCustomer = await findStoreCustomer(resolvedStoreId || storeSlug, cleanEmail);

    if (!storeCustomer) {
      // User exists in auth, BUT NOT on this store! Reject login!
      return NextResponse.json(
        {
          success: false,
          error: `You do not have an active customer account on "${storeName}". Please register on ${storeName} first.`,
        },
        { status: 403 }
      );
    }

    const customerProfile: StoreCustomer = {
      ...storeCustomer,
      store_id: resolvedStoreId,
      store_slug: storeSlug,
      store_name: storeName,
    };

    return NextResponse.json({
      success: true,
      customer: customerProfile,
      message: `Welcome back to ${storeName}!`,
    });
  } catch (err: any) {
    console.error("[Customer Login] Internal exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to log in" },
      { status: 500 }
    );
  }
}
