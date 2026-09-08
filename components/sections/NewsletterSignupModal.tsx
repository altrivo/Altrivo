"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Mail, Check, AlertCircle, Loader2 } from "lucide-react";

export interface NewsletterSignupProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  onSubscribe?: (email: string) => Promise<boolean>;
}

export default function NewsletterSignupModal({
  title = "Unlock Private Collection Access",
  subtitle = "Subscribe now to receive exclusive discounts, seasonal launch previews, and invitations to collector events.",
  placeholder = "Enter your email address",
  buttonText = "Verify Subscription",
  onSubscribe,
}: NewsletterSignupProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  // Listeners for Scroll Depth (50%) and Exit-Intent (mouseleave clientY < 0)
  useEffect(() => {
    // Read localStorage key
    const isDismissed = localStorage.getItem("altrivo_newsletter_dismissed");
    if (isDismissed === "true") return;

    const triggerOpen = () => {
      setIsOpen(true);
      // Remove listeners once modal opens
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 0) {
        triggerOpen();
      }
    };

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      
      const scrollPercentage = (window.scrollY / docHeight) * 100;
      if (scrollPercentage >= 50) {
        triggerOpen();
      }
    };

    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Keyboard dismiss triggers (Escape key)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem("altrivo_newsletter_dismissed", "true");
  };

  const validateEmail = (val: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (success) {
        setStatus("success");
        // Dismiss after 2s on success
        setTimeout(() => {
          handleDismiss();
        }, 2200);
      } else {
        setError("Submitting failed. Please try again.");
        setStatus("idle");
      }
    } catch (err) {
      setError("Server connection failed.");
      setStatus("idle");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          
          {/* 1. Backdrop overlay (fades in ~200ms) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
          />

          {/* 2. Modal content box (scales up 0.95 -> 1, fades in ~250ms with a slight delay) */}
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 overflow-hidden flex flex-col justify-between"
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors duration-150 active:scale-90"
              aria-label="Close dialog"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {status !== "success" ? (
              // ==================== FORM PANEL ====================
              <div className="space-y-6">
                <div className="flex justify-center pt-2">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-full text-slate-800">
                    <Mail className="h-6 w-6" />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h3 
                    className="text-xl font-black tracking-tight text-slate-800"
                    style={{ fontFamily: "var(--font-heading, inherit)" }}
                  >
                    {title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    {subtitle}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder={placeholder}
                      disabled={status === "submitting"}
                      className={`w-full px-4 py-3.5 text-xs font-bold bg-slate-50 border rounded-xl outline-hidden focus:bg-white focus:ring-2 focus:ring-slate-950/15 focus:border-slate-800 transition-all duration-150 ${
                        error ? "border-red-500 focus:border-red-500" : "border-slate-200"
                      }`}
                    />
                    
                    {error && (
                      <div 
                        aria-live="assertive"
                        className="flex items-center gap-1 text-[10px] text-red-500 font-bold pt-1"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full py-4 rounded-xl bg-slate-950 text-white hover:bg-slate-900 active:scale-98 text-[10px] font-black uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    {status === "submitting" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <span>{buttonText}</span>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              // ==================== SUCCESS PANEL ====================
              <div 
                aria-live="polite"
                className="flex flex-col items-center text-center space-y-4 py-8"
              >
                <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                  <Check className="h-7 w-7" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">
                    Welcome to the Circle!
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                    Your collection verification code has been dispatched. Opening access gates now.
                  </p>
                </div>
              </div>
            )}

            {/* Test toggle button to dismiss in development */}
            <div className="text-center pt-4">
              <button 
                onClick={handleDismiss} 
                className="text-[9px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
              >
                Never show again
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
