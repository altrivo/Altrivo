"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Check, AlertCircle, Loader2 } from "lucide-react";

export interface NewsletterSignupProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  onSubscribe?: (email: string) => Promise<boolean>;
}

export default function NewsletterSignupSticky({
  title = "Unlock 10% Off Your First Artisan Purchase",
  subtitle = "Subscribe to our newsletters and drops alert.",
  placeholder = "Your email address",
  buttonText = "Verify Code",
  onSubscribe,
}: NewsletterSignupProps) {
  const [showBar, setShowBar] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  // Scroll threshold trigger (scrollY >= 400px)
  useEffect(() => {
    const dismissed = localStorage.getItem("altrivo_newsletter_sticky_dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY >= 400) {
        setShowBar(true);
      } else {
        setShowBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDismiss = () => {
    setShowBar(false);
    setIsDismissed(true);
    localStorage.setItem("altrivo_newsletter_sticky_dismissed", "true");
  };

  const validateEmail = (val: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid format.");
      return;
    }

    setStatus("submitting");

    try {
      let success = true;
      if (onSubscribe) {
        success = await onSubscribe(email);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (success) {
        setStatus("success");
        setTimeout(() => {
          handleDismiss();
        }, 2200);
      } else {
        setError("Error occurred.");
        setStatus("idle");
      }
    } catch (err) {
      setError("Server failed.");
      setStatus("idle");
    }
  };

  // Do not render anything if user manually dismissed the bar
  if (isDismissed) return null;

  return (
    <div
      style={{ willChange: "transform" }}
      className={`fixed bottom-0 left-0 w-full z-[999] bg-slate-950 text-white border-t border-white/10 shadow-2xl p-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 transition-transform duration-300 ease-out ${
        showBar ? "translate-y-0" : "translate-y-full"
      }`}
    >
      
      {/* Description info */}
      <div className="flex items-center gap-3 max-w-xl text-center md:text-left">
        <div className="hidden sm:flex p-2 rounded-xl bg-white/5 border border-white/10 text-white">
          <Mail className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">
            {title}
          </h4>
          <span className="text-[10px] text-slate-400 font-bold">
            {subtitle}
          </span>
        </div>
      </div>

      {/* Mini email input form */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1 md:flex-initial">
          <div className="relative">
            <input
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder={placeholder}
              disabled={status === "submitting" || status === "success"}
              className={`px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold outline-hidden focus:bg-white/10 focus:border-white/20 transition-all duration-150 ${
                error ? "border-red-500" : ""
              }`}
            />
            {error && (
              <span 
                aria-live="assertive"
                className="absolute -top-6 left-0 text-[9px] text-red-400 font-black uppercase tracking-wider flex items-center gap-1 bg-slate-950 px-1"
              >
                <AlertCircle className="h-3 w-3" />
                <span>{error}</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "submitting" || status === "success"}
            className="py-2.5 px-5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 active:scale-95 text-[10px] font-black uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-1.5"
          >
            {status === "submitting" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-950" />
            ) : status === "success" ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Saved</span>
              </>
            ) : (
              <span>{buttonText}</span>
            )}
          </button>
        </form>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors duration-150 active:scale-90"
          aria-label="Dismiss footer alert"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
}
