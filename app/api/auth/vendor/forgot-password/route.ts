import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { EmailService } from "@/services/email-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Authentication service unavailable." },
        { status: 500 }
      );
    }

    // Determine base redirect URL
    const headerOrigin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    let origin = headerOrigin || (referer ? new URL(referer).origin : "") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    origin = origin.replace(/\/$/, "");

    // Generate secure recovery link via Supabase Admin (does NOT send Supabase email)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: cleanEmail,
      options: {
        redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
      },
    });

    if (linkError) {
      console.warn("[Forgot Password] generateLink notice:", linkError.message);
      // For security, if email does not exist, still return success message
      return NextResponse.json({
        success: true,
        message: "If that email is registered with Altrivo, a recovery link has been dispatched.",
      });
    }

    const actionLink = linkData?.properties?.action_link;
    if (actionLink) {
      // Find recipient name if vendor exists
      const { data: vendorData } = await supabaseAdmin
        .from("vendors")
        .select("name")
        .eq("email", cleanEmail)
        .maybeSingle();

      const recipientName = vendorData?.name || linkData.user?.user_metadata?.name;

      // Dispatch Altrivo branded email purely via Resend
      const resendResult = await EmailService.sendPasswordReset(cleanEmail, actionLink, recipientName);

      const delivered = Boolean(resendResult?.success && !resendResult?.sandboxForwarded);
      const isSandbox = Boolean(resendResult?.sandboxForwarded);
      const deliveredEmail = resendResult?.deliveredTo || null;

      return NextResponse.json({
        success: true,
        delivered,
        isSandbox,
        deliveredEmail,
        message: delivered
          ? "A password recovery email has been sent to your address."
          : "Recovery link generated successfully. (Resend Sandbox preview active).",
        recoveryLink: actionLink || undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: "If that email is registered with Altrivo, a recovery link has been dispatched.",
    });
  } catch (error: any) {
    console.error("[Forgot Password] Server error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process password recovery." },
      { status: 500 }
    );
  }
}
