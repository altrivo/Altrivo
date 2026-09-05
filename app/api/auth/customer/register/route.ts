import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { StoreCustomer } from "@/types/customer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      store_id = "753ea49c-abae-4dd3-9107-1dc8fcd6b221",
      name,
      email,
      password,
      phone,
    } = body;

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

    // 1. Check if user already exists
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = listData?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    if (existingAuthUser) {
      return NextResponse.json(
        {
          success: false,
          error: `An account with "${cleanEmail}" already exists. Please sign in instead.`,
        },
        { status: 409 }
      );
    }

    // 2. Create the user in Supabase Auth
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        phone: phone?.trim() || "",
        role: "customer",
        store_id,
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

    const createdAuthUser = authData.user;
    const customerId = createdAuthUser.id;

    const newCustomer: StoreCustomer = {
      id: customerId,
      store_id,
      auth_user_id: customerId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || "",
      created_at: createdAuthUser.created_at || new Date().toISOString(),
    };

    // 3. Try storing in store_customers table
    try {
      await supabaseAdmin.from("store_customers").insert({
        id: customerId,
        store_id,
        auth_user_id: customerId,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        created_at: newCustomer.created_at,
      });
    } catch (dbEx) {
      console.warn("[Customer Register] DB table insert fallback:", dbEx);
    }

    return NextResponse.json({
      success: true,
      customer: newCustomer,
      message: "Account created successfully",
    });
  } catch (err: any) {
    console.error("[Customer Register] Server exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to register customer" },
      { status: 500 }
    );
  }
}
