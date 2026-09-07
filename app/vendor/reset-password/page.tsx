"use client";

import React, { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, AlertCircle, ArrowRight, Lock } from "lucide-react";

function VendorResetPasswordForm() {
  const [supabase] = useState(() => createClient());
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      // Notify backend to trigger PASSWORD_CHANGED notification if possible
      if (data?.user?.email) {
        try {
          await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventType: "PASSWORD_CHANGED",
              recipientUserId: data.user.id,
              recipientType: "vendor",
              recipientEmail: data.user.email,
              title: "Vendor Password Changed",
              message: "Your vendor account password was updated successfully.",
            }),
          });
        } catch (e) {}
      }

      setSuccess(true);
    } catch (err: any) {
      setError(
        err.message === "Auth session missing!"
          ? "This reset link has expired or was already used. Please request a new recovery link."
          : err.message || "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>
        <h2 className="text-xl font-extrabold text-heading">Password Updated</h2>
        <p className="text-xs text-subtle leading-relaxed">
          Your vendor account password has been reset successfully. You can now sign in to your store dashboard with your new credentials.
        </p>
        <div className="pt-4">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold shadow-xs transition-all"
          >
            <span>Go to Vendor Login</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 border border-primary-200 flex items-center justify-center mx-auto mb-2 shadow-xs">
          <Lock className="w-6 h-6 text-primary-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-heading tracking-tight">Set New Password</h1>
        <p className="text-xs text-subtle">
          Choose a secure password of at least 8 characters for your vendor account.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="New Password"
          value={password}
          onChange={(val) => setPassword(val)}
          placeholder="At least 8 characters"
        />

        <PasswordInput
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(val) => setConfirmPassword(val)}
          placeholder="Repeat your password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <span>Updating Password...</span>
          ) : (
            <>
              <span>Update Password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function VendorResetPasswordPage() {
  return (
    <AuthLayout
      title="Create New Password"
      subtitle="DigiShop AI Multi-Tenant Vendor Portal"
    >
      <Suspense fallback={<div className="text-center text-xs text-subtle py-8">Loading...</div>}>
        <VendorResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
