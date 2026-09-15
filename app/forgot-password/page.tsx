"use client";

import React, { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recoveryLink, setRecoveryLink] = useState<string | null>(null);
  const [delivered, setDelivered] = useState<boolean>(false);
  const [deliveredEmail, setDeliveredEmail] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/vendor/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send password reset email.");
      }
      if (data.recoveryLink) {
        setRecoveryLink(data.recoveryLink);
      }
      setDelivered(Boolean(data.delivered));
      setDeliveredEmail(data.deliveredEmail || null);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-[#5c3d5c]/20 p-8 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <h1 className="text-xl font-bold text-black">
          {delivered ? "Check Your Inbox" : "Recovery Link Ready"}
        </h1>
        {delivered ? (
          <p className="text-xs text-[#5c3d5c] leading-relaxed">
            We have sent a secure password reset link to <strong className="text-black">{email}</strong>. Please follow the instructions in the email to set a new password.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-[#5c3d5c] leading-relaxed">
              Resend Free Sandbox mode is active. Click the button below to reset your password immediately without waiting for email delivery:
            </p>
            {deliveredEmail && (
              <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                Sandbox email copy dispatched to registered admin: <strong>{deliveredEmail}</strong>
              </p>
            )}
          </div>
        )}
        {recoveryLink && (
          <div className="pt-2">
            <a
              href={recoveryLink}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#3e2845] hover:bg-[#2d1a33] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <span>Click Here to Reset Password Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
        <div className="pt-4">
          <Link
            href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#3e2845] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-[#5c3d5c]/20 p-8 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[#3e2845]/10 text-[#3e2845] flex items-center justify-center mx-auto mb-2">
          <KeyRound className="w-6 h-6 text-[#3e2845]" />
        </div>
        <h1 className="text-2xl font-bold text-black tracking-tight">Reset Password</h1>
        <p className="text-xs text-[#5c3d5c]">
          Enter your registered email address and we will send you a recovery link.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-black mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#5c3d5c] absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-[#5c3d5c]/30 text-xs text-black focus:outline-none focus:border-[#3e2845] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <span>Sending Link...</span>
          ) : (
            <>
              <span>Send Reset Link</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-[#5c3d5c]/10 text-center">
        <Link
          href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
          className="inline-flex items-center gap-1.5 text-xs text-[#5c3d5c] hover:text-[#3e2845] font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
}

export default function CustomerForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center text-xs text-[#5c3d5c]">Loading...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
