import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim().toLowerCase();
    const phone = searchParams.get("phone")?.trim().replace(/[\s\-]/g, "");

    let emailExists = false;
    let phoneExists = false;

    if (!supabaseAdmin) {
      return NextResponse.json({ emailExists: false, phoneExists: false });
    }

    if (email) {
      const { data: vEmail } = await supabaseAdmin
        .from("vendors")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (vEmail) {
        emailExists = true;
      }
    }

    if (phone) {
      const { data: vPhone } = await supabaseAdmin
        .from("vendors")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();
      if (vPhone) phoneExists = true;
    }

    return NextResponse.json({
      emailExists,
      phoneExists,
      message:
        emailExists && phoneExists
          ? "This email address and phone number are already registered. Please sign in or use different credentials."
          : emailExists
          ? "This email address is already registered. Please sign in or use another email."
          : phoneExists
          ? "This phone number is already registered. Please sign in or use another phone number."
          : "Available",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
