"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormInput,
  PasswordInput,
  SocialButtons,
  ForgotPasswordModal,
} from "@/components/auth";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "error";

export default function LoginPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [status, setStatus] = useState<Status>("idle");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ emailOrPhone?: string; password?: string }>({});
  const [globalError, setGlobalError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    setGlobalError("");

    if (!emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Please enter your email or phone number";
    }
    if (!password) {
      newErrors.password = "Please enter your password";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone)) {
      setErrors({ emailOrPhone: "Sign in with your email address (phone login isn't set up yet)" });
      return;
    }

    setStatus("loading");
    const { error } = await supabase.auth.signInWithPassword({
      email: emailOrPhone,
      password,
    });

    if (error) {
      setStatus("error");
      setGlobalError("Invalid credentials. Please check your email/phone and password.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2
            className="text-2xl font-bold text-heading"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-body">
            Sign in to your vendor account to continue.
          </p>
        </div>

        {/* Global error */}
        {globalError && (
          <div className="flex items-start gap-3 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
            <svg className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email or Phone */}
          <FormInput
            label="Email or Phone"
            type="text"
            value={emailOrPhone}
            onChange={(e) => {
              setEmailOrPhone(e.target.value);
              setErrors((p) => ({ ...p, emailOrPhone: undefined }));
              setGlobalError("");
            }}
            placeholder="you@company.com or 3XX XXXXXXX"
            error={errors.emailOrPhone}
            icon={
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            }
          />

          {/* Password */}
          <PasswordInput
            label="Password"
            value={password}
            onChange={(val) => {
              setPassword(val);
              setErrors((p) => ({ ...p, password: undefined }));
              setGlobalError("");
            }}
            placeholder="Enter your password"
            error={errors.password}
          />

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-default text-primary-500 accent-primary-500"
              />
              <span className="text-sm text-body">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="text-sm font-medium text-link transition-colors hover:text-link-hover"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex w-full h-12 items-center justify-center gap-2 rounded-lg bg-primary-500 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {status === "loading" ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </form>

        <SocialButtons mode="login" />

        <p className="text-center text-sm text-body">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-link transition-colors hover:text-link-hover"
          >
            Sign up
          </Link>
        </p>
      </div>

      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </>
  );
}
