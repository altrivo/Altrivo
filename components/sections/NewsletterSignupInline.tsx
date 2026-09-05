"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Mail, AlertCircle, Loader2 } from "lucide-react";

export interface NewsletterSignupProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  onSubscribe?: (email: string) => Promise<boolean>;
}

export default function NewsletterSignupInline({
  title = "Subscribe to our Newsletter",
  subtitle = "Stay updated with seasonal drops, private collection discount codes, and artisan stories.",
  placeholder = " ", // Empty placeholder space is necessary for CSS peer-placeholder-shown triggers
  buttonText = "Subscribe",
  onSubscribe,
}: NewsletterSignupProps) {
  const shouldReduceMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [buttonWidth, setButtonWidth] = useState<number | undefined>(undefined);
  const [triggerShake, setTriggerShake] = useState(false);

  // Measure and lock button min-width before submission swap to avoid jump shifts
  useEffect(() => {
    if (buttonRef.current && !buttonWidth) {
      setButtonWidth(buttonRef.current.getBoundingClientRect().width);
    }
  }, [buttonWidth]);

  const validateEmail = (val: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(val);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear errors immediately when user starts editing
    if (error) {
      setError("");
      setTriggerShake(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTriggerShake(false);

    if (!email) {
      setError("Please enter your email address.");
      setTriggerShake(true);
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email (e.g. name@domain.com).");
      setTriggerShake(true);
      return;
    }

    setStatus("submitting");

    try {
      let success = true;
      if (onSubscribe) {
        success = await onSubscribe(email);
      } else {
        // Mock submission delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (success) {
        setStatus("success");
      } else {
        setError("Something went wrong. Please try again.");
        setStatus("idle");
      }
    } catch (err) {
      setError("Server connection failed. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <section className="py-12 bg-white text-slate-900 border-b border-slate-100 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Self-contained CSS helper for Horizontal Shake and SVG Draw animations */}
      <style>{`
        @keyframes horiz-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .error-shake {
          animation: horiz-shake 300ms ease-in-out;
        }
        @keyframes draw-path {
          to { stroke-dashoffset: 0; }
        }
        .svg-checkmark-draw {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: draw-path 450ms ease-out forwards;
        }
      `}</style>

      {/* Main Container featuring Morph heights */}
      <motion.div
        layout
        transition={{ duration: 0.28, ease: "easeInOut" }}
        className="border border-slate-100 bg-slate-50/50 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {status !== "success" ? (
            
            // ==================== 1. FORM STATE ====================
            <motion.div
              key="signup-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center sm:text-left">
                <h3 
                  className="text-lg font-black tracking-tight"
                  style={{ fontFamily: "var(--font-heading, inherit)" }}
                >
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                    {subtitle}
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  
                  {/* Floating Label Input Box */}
                  <div className="relative flex-1">
                    <input
                      id="email-input"
                      type="text"
                      value={email}
                      onChange={handleInputChange}
                      placeholder={placeholder}
                      disabled={status === "submitting"}
                      className={`peer w-full px-4 pt-5 pb-1 text-xs font-bold bg-white border rounded-xl outline-hidden transition-all duration-150 focus:ring-2 focus:ring-slate-950/15 ${
                        error
                          ? `border-red-500 bg-red-50/10 focus:border-red-500 ${
                              triggerShake && !shouldReduceMotion ? "error-shake" : ""
                            }`
                          : "border-slate-200 focus:border-slate-800"
                      }`}
                    />
                    
                    {/* Floating Label (translateY + font-size transitions synced to focus) */}
                    <label
                      htmlFor="email-input"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wider text-slate-400 pointer-events-none transition-all duration-150 ease-out origin-left scale-100 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-[-50%] peer-focus:scale-75 peer-focus:translate-y-[-135%] peer-focus:text-slate-850 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:translate-y-[-135%] peer-[:not(:placeholder-shown)]:text-slate-850"
                    >
                      Email Address
                    </label>
                  </div>

                  {/* Submit button (width locked during submissions) */}
                  <button
                    ref={buttonRef}
                    type="submit"
                    disabled={status === "submitting"}
                    style={{ minWidth: buttonWidth ? `${buttonWidth}px` : "auto" }}
                    className="py-3.5 px-6 rounded-xl bg-slate-950 text-white hover:bg-slate-900 active:scale-95 text-[10px] font-extrabold uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    {status === "submitting" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <span>{buttonText}</span>
                    )}
                  </button>

                </div>

                {/* Inline Validation Error Message (assertive live announcement) */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      aria-live="assertive"
                      className="flex items-center gap-1.5 text-[10px] text-red-500 font-bold"
                    >
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          ) : (
            
            // ==================== 2. SUCCESS STATE ====================
            <motion.div
              key="signup-success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              aria-live="polite"
              className="flex flex-col items-center text-center space-y-4 py-4"
            >
              {/* celebratory SVG checkmark draw-in */}
              <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-xs">
                <svg
                  className="h-6 w-6 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                    className={shouldReduceMotion ? "" : "svg-checkmark-draw"}
                  />
                </svg>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  Subscription Verified!
                </h4>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Thank you for subscribing. You've been added to our artisan newsletter lists successfully.
                </p>
              </div>
            </motion.div>

          )}
        </AnimatePresence>
      </motion.div>

    </section>
  );
}
