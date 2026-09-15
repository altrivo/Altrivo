import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/auth/reset-password";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, origin));
      }
      console.warn("[Auth Callback] exchangeCodeForSession notice:", error.message);
    } catch (err) {
      console.error("[Auth Callback] Error exchanging code:", err);
    }
  }

  // Fallback redirect with code preserved so client component can also attempt exchange if needed
  const redirectUrl = new URL(next, origin);
  if (code) {
    redirectUrl.searchParams.set("code", code);
  }
  return NextResponse.redirect(redirectUrl);
}
