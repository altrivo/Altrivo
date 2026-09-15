"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/auth";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight } from "lucide-react";

type Status = "idle" | "loading" | "success";

export default function ResetPasswordPage() {
  const [supabase] = useState(() => createClient());
  const [status, setStatus] = useState<Status>("idle");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.warn("[ResetPassword] Client exchangeCodeForSession notice:", error.message);
        }
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("[ResetPassword] PASSWORD_RECOVERY session active");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    setGlobalError("");

    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus("loading");
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("idle");
      setGlobalError(
        error.message === "Auth session missing!"
          ? "This reset link has expired or was already used. Request a new one from the login page."
          : error.message
      );
      return;
    }

    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-100">
          <svg className="h-10 w-10 text-success-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
            Password Reset Successfully
          </h2>
          <p className="mt-2 text-sm text-body">
            Your password has been updated. You can now sign in with your new password.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="inline-flex h-input w-full items-center justify-center gap-1.5 rounded-lg bg-primary-500 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-600"
        >
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
          Set New Password
        </h2>
        <p className="mt-1 text-sm text-body">
          Choose a strong password for your vendor account.
        </p>
      </div>

      {globalError && (
        <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput
          label="New Password"
          value={password}
          onChange={(val) => {
            setPassword(val);
            setErrors((p) => ({ ...p, password: undefined }));
          }}
          showStrength
          error={errors.password}
        />

        <PasswordInput
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(val) => {
            setConfirmPassword(val);
            setErrors((p) => ({ ...p, confirmPassword: undefined }));
          }}
          placeholder="Re-enter your new password"
          error={errors.confirmPassword}
        />

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
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>

        <Link
          href="/auth/login"
          className="block text-center text-sm text-link transition-colors hover:text-link-hover"
        >
          Back to Login
        </Link>
      </form>
    </div>
  );
}
