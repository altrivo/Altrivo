"use client";

import React, { useState, FormEvent, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { createClient } from "@/lib/supabase/client";
import { Mail, Phone, Lock, AlertCircle, ArrowRight, Store, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createClient());

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    setSuccessBanner("");

    const newErrors: typeof errors = {};
    if (!emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email ya phone number enter karein / Enter email or phone";
    }
    if (!password) {
      newErrors.password = "Password enter karein / Enter password";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
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
          loginData.error || "Login failed. Registration check or password incorrect."
        );
        setLoading(false);
        return;
      }

      // 2. Establish client-side Supabase session using the target email
      const targetEmail = loginData.targetEmail || emailOrPhone.trim();
      const { error: sbAuthError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (sbAuthError) {
        console.warn("[Client Supabase Auth] Warning:", sbAuthError);
      }

      // 3. Store active vendor identifier in localStorage as fast cache
      try {
        if (loginData.vendor) {
          localStorage.setItem("active_vendor_id", loginData.vendor.id);
          localStorage.setItem("active_vendor_name", loginData.vendor.name || "");
          localStorage.setItem("active_vendor_email", loginData.vendor.email || "");
        }
      } catch {}

      // 4. Redirect to Dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setGlobalError(err.message || "Failed to log in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3e2845]/10 border border-[#5c3d5c]/20 text-[#3e2845] text-xs font-semibold mb-3">
          <Store className="w-3.5 h-3.5 text-[#3e2845]" />
          <span>Vendor Portal Sign In</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
          Vendor Login
        </h1>
        <p className="mt-1.5 text-xs text-[#5c3d5c]">
          Sign in using your registered email or phone number.
        </p>
      </div>

      {/* Success banner if redirected from signup */}
      {successBanner && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed font-medium">
            {successBanner}
          </div>
        </div>
      )}

      {/* Global Error Notice */}
      {globalError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">Sign In Error</p>
            <p className="mt-0.5 text-xs text-red-700 leading-relaxed">
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
            className="block text-xs font-semibold text-black tracking-wide"
          >
            Registered Email or Phone
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5c3d5c]">
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
              placeholder="e.g. vendor@example.com ya 03001234567"
              className={`w-full h-10 rounded-xl border bg-white pl-10 pr-4 text-xs text-black placeholder:text-[#5c3d5c]/60 transition-all duration-200 focus:outline-none ${
                errors.emailOrPhone
                  ? "border-red-500 focus:border-red-600"
                  : "border-[#5c3d5c]/30 focus:border-[#3e2845]"
              }`}
            />
          </div>
          {errors.emailOrPhone && (
            <p className="text-xs text-red-600 mt-1">{errors.emailOrPhone}</p>
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
        />

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] py-2.5 px-4 text-xs font-bold text-white shadow-xs transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Checking database & logging in...</span>
              </>
            ) : (
              <>
                <span>Vendor Login Karein</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer / Signup Link */}
      <div className="text-center pt-2 border-t border-[#5c3d5c]/20">
        <p className="text-xs text-[#5c3d5c]">
          Don&apos;t have a vendor account yet?{" "}
          <Link
            href="/auth/signup"
            className="font-bold text-[#3e2845] hover:text-[#4b3254] hover:underline"
          >
            Naya vendor signup karein / Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VendorLoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-[#5c3d5c]">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
