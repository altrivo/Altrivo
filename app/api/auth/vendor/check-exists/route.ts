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
      } else {
        // Also check auth.users
        try {
          const { data: authList } = await supabaseAdmin.auth.admin.listUsers();
          const match = authList?.users?.find((u) => u.email?.toLowerCase() === email);
          if (match) emailExists = true;
        } catch {}
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
          ? "Ye email aur number already register hain, doosra use karein."
          : emailExists
          ? "Ye mail already register h other use kry."
          : phoneExists
          ? "Ye number already register h other use kry."
          : "Available",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
