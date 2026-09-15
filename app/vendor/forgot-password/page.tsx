"use client";

import React, { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

function VendorForgotPasswordForm() {
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
        throw new Error(data.error || "Failed to send password recovery link.");
      }

      if (data.recoveryLink) {
        setRecoveryLink(data.recoveryLink);
      }
      setDelivered(Boolean(data.delivered));
      setDeliveredEmail(data.deliveredEmail || null);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to send password recovery link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>
        <h2 className="text-xl font-extrabold text-heading">
          {delivered ? "Check Your Inbox" : "Recovery Link Ready"}
        </h2>
        {delivered ? (
          <p className="text-xs text-subtle leading-relaxed">
            We have sent a secure recovery link to <strong className="text-heading">{email}</strong>. Please follow the instructions in the email to set a new password.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-subtle leading-relaxed">
              Resend Free Sandbox mode is active. Click the button below to reset your password immediately without waiting for email delivery:
            </p>
            {deliveredEmail && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                Sandbox email copy dispatched to registered admin: <strong>{deliveredEmail}</strong>
              </p>
            )}
          </div>
        )}
        {recoveryLink && (
          <div className="pt-2">
            <a
              href={recoveryLink}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <span>Click Here to Reset Password Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
        <div className="pt-4">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Vendor Login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 border border-primary-200 flex items-center justify-center mx-auto mb-2 shadow-xs">
          <KeyRound className="w-6 h-6 text-primary-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-heading tracking-tight">Vendor Password Recovery</h1>
        <p className="text-xs text-subtle">
          Enter your registered business email and we will send you a secure password reset link.
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
          <label className="block text-xs font-extrabold text-heading mb-1.5">Business Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-subtle absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@yourbrand.com"
              className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-default bg-card text-xs text-body focus:outline-none focus:border-primary-600 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <span>Sending Link...</span>
          ) : (
            <>
              <span>Send Recovery Link</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-default text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs text-subtle hover:text-heading font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
}

export default function VendorForgotPasswordPage() {
  return (
    <AuthLayout
      title="Recover Your Password"
      subtitle="DigiShop AI Multi-Tenant Vendor Portal"
    >
      <Suspense fallback={<div className="text-center text-xs text-subtle py-8">Loading...</div>}>
        <VendorForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
