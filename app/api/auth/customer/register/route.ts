import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { findStoreCustomer, saveStoreCustomer, resolveStoreInfo } from "@/lib/customer/customer-store";
import { StoreCustomer } from "@/types/customer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawStoreId = body.store_id || body.storeId || "";
    const name = body.name || body.fullName;
    const email = body.email;
    const password = body.password;
    const phone = body.phone;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Registration service unavailable. Please try again later." },
        { status: 500 }
      );
    }

    // 1. Resolve store info strictly
    const storeInfo = await resolveStoreInfo(rawStoreId);
    const resolvedStoreId = storeInfo?.id || rawStoreId;
    const storeSlug = storeInfo?.slug || (typeof rawStoreId === "string" ? rawStoreId : "");
    const storeName = storeInfo?.name || "this store";

    // 2. Check if customer is already registered on THIS store
    const alreadyRegistered = await findStoreCustomer(resolvedStoreId || storeSlug, cleanEmail);
    if (alreadyRegistered) {
      return NextResponse.json(
        {
          success: false,
          error: `An account for "${cleanEmail}" already exists on ${storeName}. Please sign in instead.`,
        },
        { status: 409 }
      );
    }

    // 3. Check if user already exists in global Supabase Auth
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = listData?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    let customerId: string;
    let authUserId: string;

    if (existingAuthUser) {
      // User exists in auth system. Verify their password to authorize adding this store to their profile
      if (supabase) {
        const { error: verifyErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (verifyErr) {
          return NextResponse.json(
            {
              success: false,
              error: `An account with "${cleanEmail}" exists. Please enter your existing password to register on ${storeName}.`,
            },
            { status: 401 }
          );
        }
      }

      customerId = crypto.randomUUID();
      authUserId = existingAuthUser.id;
    } else {
      // Create new user in Supabase Auth
      const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: name.trim(),
          phone: phone?.trim() || "",
          role: "customer",
          store_id: resolvedStoreId,
          store_slug: storeSlug,
          store_name: storeName,
        },
      });

      if (authErr || !authData?.user) {
        console.error("[Customer Register] Auth user creation error:", authErr);
        return NextResponse.json(
          {
            success: false,
            error: authErr?.message || "Failed to create account in auth system.",
          },
          { status: 500 }
        );
      }

      customerId = authData.user.id;
      authUserId = authData.user.id;
    }

    const newCustomer: StoreCustomer = {
      id: customerId,
      store_id: resolvedStoreId,
      auth_user_id: authUserId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || "",
      store_slug: storeSlug,
      store_name: storeName,
      created_at: new Date().toISOString(),
    };

    // 4. Save to store_customers table and local backup
    await saveStoreCustomer(newCustomer);

    return NextResponse.json({
      success: true,
      customer: newCustomer,
      message: `Account created successfully on ${storeName}`,
    });
  } catch (err: any) {
    console.error("[Customer Register] Server exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to register customer" },
      { status: 500 }
    );
  }
}
