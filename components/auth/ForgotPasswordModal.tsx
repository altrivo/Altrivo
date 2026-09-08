"use client";

import { useState } from "react";
import { FormInput } from "./FormInput";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

type ModalState = "email" | "sending" | "sent";

export function ForgotPasswordModal({ open, onClose }: ForgotPasswordModalProps) {
  const [state, setState] = useState<ModalState>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setState("sending");
    try {
      const res = await fetch("/api/auth/vendor/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setState("email");
        setError(data.error || "Failed to send reset link.");
        return;
      }
      setState("sent");
    } catch (err: any) {
      setState("email");
      setError(err.message || "Failed to send reset link.");
    }
  };

  const handleClose = () => {
    setState("email");
    setEmail("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-overlay"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md rounded-2xl bg-card p-8 shadow-modal animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-subtle transition-colors hover:bg-muted hover:text-heading"
          aria-label="Close"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {state === "sent" ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
              <svg
                className="h-8 w-8 text-success-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-heading">Check your email</h3>
              <p className="mt-1.5 text-sm text-body">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-medium text-heading">{email}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full h-input rounded-lg bg-primary-500 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-600"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-heading">Forgot Password</h3>
              <p className="text-sm text-body">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            <FormInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="you@company.com"
              error={error}
              icon={
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              }
            />

            <button
              type="submit"
              disabled={state === "sending"}
              className="flex w-full h-input items-center justify-center gap-2 rounded-lg bg-primary-500 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-600 disabled:opacity-50"
            >
              {state === "sending" ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-full text-center text-sm text-link transition-colors hover:text-link-hover"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
