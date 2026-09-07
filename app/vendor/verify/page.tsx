"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Mail, CheckCircle2, RefreshCw, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function VendorVerifyContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [sending, setSending] = useState(false);
  const [sentMessage, setSentMessage] = useState("");
  const [error, setError] = useState("");
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleResend = async () => {
    if (!email) {
      setError("Please provide an email address to resend verification.");
      return;
    }

    setSending(true);
    setError("");
    setSentMessage("");

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (resendError) {
        throw resendError;
      }

      setSentMessage(`A fresh verification link has been sent to ${email}. Please check your inbox and spam folder.`);
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 border border-primary-200 flex items-center justify-center mx-auto shadow-xs">
          <Mail className="w-7 h-7 text-primary-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-heading tracking-tight">Verify Your Email</h1>
        <p className="text-xs text-subtle leading-relaxed max-w-sm mx-auto">
          We've sent a secure verification link to your registered business email
          {email ? <strong className="text-heading block mt-1">{email}</strong> : "."}
        </p>
      </div>

      {sentMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{sentMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="p-5 rounded-2xl bg-sidebar border border-default space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-heading">
          <ShieldCheck className="w-4 h-4 text-primary-600" />
          <span>Why is verification required?</span>
        </div>
        <p className="text-[11px] text-subtle leading-relaxed">
          Email verification secures your multi-tenant vendor store, protects COD courier payouts, and ensures you receive instant notifications for new orders and shipping airway bills.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleResend}
          disabled={sending}
          className="w-full h-11 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {sending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Resending Link...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Resend Verification Email</span>
            </>
          )}
        </button>

        <Link
          href="/auth/login"
          className="w-full h-11 rounded-xl bg-card hover:bg-sidebar-hover border border-default text-heading text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Vendor Login</span>
        </Link>
      </div>
    </div>
  );
}

export default function VendorVerifyPage() {
  return (
    <AuthLayout
      title="DigiShop Vendor Verification"
      subtitle="Complete email confirmation to activate your store."
    >
      <Suspense fallback={<div className="text-center text-xs text-subtle py-8">Loading verification...</div>}>
        <VendorVerifyContent />
      </Suspense>
    </AuthLayout>
  );
}
