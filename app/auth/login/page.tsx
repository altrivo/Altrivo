"use client";

import React, { useState, FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { createClient } from "@/lib/supabase/client";
import { Mail, Phone, AlertCircle, ArrowRight, Store, CheckCircle2, ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createClient());

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [errors, setErrors] = useState<{
    emailOrPhone?: string;
    password?: string;
  }>({});
  const [globalError, setGlobalError] = useState("");
  const [successBanner, setSuccessBanner] = useState("");

  useEffect(() => {
    const prefilledEmail = searchParams.get("email");
    if (prefilledEmail) {
      setEmailOrPhone(prefilledEmail);
      setSuccessBanner("Account registered successfully! Please enter your password to sign in.");
    }
    // Clean stale store references when landing on login
    try {
      localStorage.removeItem("active_store_id");
      localStorage.removeItem("artrivo_store_aliases");
      document.cookie = "active_store_id=; path=/; max-age=0";
    } catch {}
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    setSuccessBanner("");

    const newErrors: typeof errors = {};
    if (!emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email or phone number is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // 0. Explicitly clear previous client session and stale store state
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {}
      try {
        localStorage.removeItem("active_store_id");
        localStorage.removeItem("artrivo_store_aliases");
        document.cookie = "active_store_id=; path=/; max-age=0";
      } catch {}

      // 1. Verify vendor credentials and registration in database via backend
      const loginRes = await fetch("/api/auth/vendor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: emailOrPhone.trim(),
          password,
        }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok || !loginData.success) {
        setGlobalError(
          loginData.error || "Login failed. Incorrect credentials or vendor not found."
        );
        setLoading(false);
        return;
      }

      // 2. Establish client-side Supabase session with authoritative tokens or sign-in
      if (loginData.session?.access_token && loginData.session?.refresh_token) {
        try {
          await supabase.auth.setSession({
            access_token: loginData.session.access_token,
            refresh_token: loginData.session.refresh_token,
          });
        } catch (setErr) {
          console.warn("[Client Supabase Auth] setSession warning:", setErr);
        }
      } else {
        const targetEmail = loginData.targetEmail || emailOrPhone.trim();
        try {
          await supabase.auth.signInWithPassword({
            email: targetEmail,
            password,
          });
        } catch (sbAuthError) {
          console.warn("[Client Supabase Auth] Warning:", sbAuthError);
        }
      }

      // 3. Store active vendor identifier in localStorage as fast cache
      try {
        if (loginData.vendor) {
          localStorage.setItem("active_vendor_id", loginData.vendor.id);
          localStorage.setItem("active_vendor_name", loginData.vendor.name || "");
          localStorage.setItem("active_vendor_email", loginData.vendor.email || "");
          // Clean previous active store so new account doesn't inherit old stores
          localStorage.removeItem("active_store_id");
          localStorage.removeItem("artrivo_store_aliases");
          document.cookie = "active_store_id=; path=/; max-age=0";
        }
      } catch {}

      // 4. Full redirect to Dashboard to ensure all server components, cookies, and context reload clean
      window.location.href = "/dashboard";
    } catch (err: any) {
      setGlobalError(err.message || "Failed to log in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold mb-3">
          <Store className="w-3.5 h-3.5 text-primary-600" />
          <span>Vendor Portal Sign In</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight font-display">
          Vendor Login
        </h1>
        <p className="mt-1.5 text-sm text-body">
          Sign in using your registered email address or phone number.
        </p>
      </div>

      {/* Success banner if redirected from signup */}
      {successBanner && (
        <div className="flex items-start gap-3 rounded-xl border border-success-200 bg-success-50 p-4 text-xs text-success-700 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-success-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed font-medium">
            {successBanner}
          </div>
        </div>
      )}

      {/* Global Error Notice */}
      {globalError && (
        <div className="flex items-start gap-3 rounded-xl border border-error-200 bg-error-50 p-4 text-xs text-error-700 shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-error-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-error-900">Sign In Error</p>
            <p className="mt-0.5 text-xs text-error-700 leading-relaxed">
              {globalError}
            </p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email or Phone */}
        <div className="space-y-1.5">
          <label
            htmlFor="email-or-phone"
            className="block text-xs font-semibold text-heading uppercase tracking-wider"
          >
            Registered Email or Phone
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle">
              {emailOrPhone.includes("@") ? (
                <Mail className="w-4 h-4" />
              ) : (
                <Phone className="w-4 h-4" />
              )}
            </div>
            <input
              id="email-or-phone"
              type="text"
              value={emailOrPhone}
              onChange={(e) => {
                setEmailOrPhone(e.target.value);
                setErrors((p) => ({ ...p, emailOrPhone: undefined }));
                setGlobalError("");
              }}
              placeholder="e.g. vendor@example.com or 03001234567"
              className={`w-full h-input rounded-xl border bg-input pl-10 pr-4 text-sm text-heading placeholder:text-subtle transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                errors.emailOrPhone
                  ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
                  : "border-default focus:border-focus"
              }`}
            />
          </div>
          {errors.emailOrPhone && (
            <p className="text-xs text-error-500 mt-1 font-medium">{errors.emailOrPhone}</p>
          )}
        </div>

        {/* Password */}
        <PasswordInput
          label="Password"
          id="login-password"
          value={password}
          onChange={(val) => {
            setPassword(val);
            setErrors((p) => ({ ...p, password: undefined }));
            setGlobalError("");
          }}
          showStrength={false}
          error={errors.password}
          placeholder="Enter your password"
          autoComplete="current-password"
          rightLabelAction={
            <button
              type="button"
              onClick={() => setForgotPasswordOpen(true)}
              className="text-xs font-semibold text-link hover:text-link-hover hover:underline transition-colors"
            >
              Forgot password?
            </button>
          }
        />

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-600 h-input py-2.5 px-4 text-sm font-bold text-on-primary shadow-sm hover:shadow transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Verifying credentials & logging in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Vendor Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer / Signup Link */}
      <div className="text-center pt-3 border-t border-default">
        <p className="text-xs text-body">
          Don&apos;t have a vendor account yet?{" "}
          <Link
            href="/auth/signup"
            className="font-bold text-link hover:text-link-hover hover:underline ml-1"
          >
            Register new account
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </div>
  );
}

export default function VendorLoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-subtle">Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
