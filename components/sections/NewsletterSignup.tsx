"use client";

import React, { useState } from "react";
import { Mail, Check, AlertCircle, ArrowRight } from "lucide-react";

export interface NewsletterSignupProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  layout?: "strip" | "box";
  onSubscribe?: (email: string) => Promise<boolean>;
}

export default function NewsletterSignup({
  title = "Subscribe to our Newsletter",
  subtitle = "Stay updated with seasonal drops, private collection discount codes, and artisan stories.",
  placeholder = "Enter your email address",
  buttonText = "Subscribe",
  layout = "box",
  onSubscribe,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const validateEmail = (val: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(val);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");

    try {
      let success = true;
      if (onSubscribe) {
        success = await onSubscribe(email);
      } else {
        // Mock API call delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (success) {
        setStatus("success");
        setEmail("");
      } else {
        setError("Something went wrong. Please try again.");
        setStatus("idle");
      }
    } catch {
      setError("Failed to subscribe. Please verify your connection.");
      setStatus("idle");
    }
  };

  return (
    <section className="py-12 select-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {status === "success" ? (
        // Success State
        <div className="max-w-2xl mx-auto text-center bg-emerald-50 border border-emerald-200 rounded-3xl p-8 sm:p-12 shadow-xs space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Check className="h-6 w-6" />
          </div>
          <h3 
            className="text-2xl font-bold text-slate-800"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            Thank You for Subscribing!
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            You have successfully joined our list. We'll send you updates on new drops and artisan details shortly.
          </p>
        </div>
      ) : layout === "box" ? (
        // Box Card Layout (Gradient/Background Accent Box)
        <div 
          className="relative max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 md:p-16 shadow-lg overflow-hidden border border-slate-200/50 bg-slate-50 flex flex-col items-center text-center space-y-6"
        >
          {/* Subtle Organic Background Accent */}
          <div 
            className="absolute -top-12 -left-12 h-48 w-48 rounded-full opacity-10 filter blur-xl"
            style={{ backgroundColor: "var(--color-secondary, #d97706)" }}
          />
          <div 
            className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full opacity-10 filter blur-xl"
            style={{ backgroundColor: "var(--color-primary, #0f172a)" }}
          />

          <div className="space-y-2 max-w-xl relative z-10">
            <h2 
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text,#1e293b)]"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubscribe} className="w-full max-w-md space-y-3 relative z-10">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                placeholder={placeholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                disabled={status === "submitting"}
                className="block w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 shadow-2xs focus:border-[var(--color-primary,#0f172a)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary,#0f172a)]/20 transition-all duration-200 disabled:opacity-60"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-1.5 justify-center text-xs text-rose-600 font-semibold">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full py-3.5 rounded-2xl text-xs font-extrabold tracking-wide text-white shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-[0.98]"
              style={{ 
                backgroundColor: "var(--color-primary, #0f172a)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
              onMouseLeave={(e) => e.currentTarget.style.filter = "none"}
            >
              {status === "submitting" ? (
                <span>Subscribing...</span>
              ) : (
                <>
                  <span>{buttonText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        // Strip Layout (Thin, Horizontal Bar)
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-200/50 pt-8">
          <div className="text-center md:text-left space-y-1 md:max-w-md">
            <h3 
              className="text-lg font-bold text-[var(--color-text,#1e293b)]"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 leading-snug">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubscribe} className="w-full max-w-md flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                placeholder={placeholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                disabled={status === "submitting"}
                className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-[var(--color-primary,#0f172a)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary,#0f172a)]/20 transition-all duration-200 disabled:opacity-60"
              />
              {/* Error Message */}
              {error && (
                <div className="absolute -bottom-5 left-1.5 flex items-center gap-1 text-[10px] text-rose-600 font-semibold">
                  <AlertCircle className="h-3 w-3" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0 disabled:opacity-60 active:scale-95"
              style={{ 
                backgroundColor: "var(--color-primary, #0f172a)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
              onMouseLeave={(e) => e.currentTarget.style.filter = "none"}
            >
              {status === "submitting" ? (
                <span>Subscribing...</span>
              ) : (
                <span>{buttonText}</span>
              )}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
