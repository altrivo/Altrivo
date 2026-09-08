import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}

  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  response.cookies.delete("active_vendor_id");
  response.cookies.delete("active_store_id");
  return response;
}
