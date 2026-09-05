"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Mail, Check, AlertCircle, Loader2 } from "lucide-react";

export interface NewsletterSignupProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  onSubscribe?: (email: string, details?: { name: string; preferences: string[] }) => Promise<boolean>;
}

export default function NewsletterSignupProgressive({
  title = "Customize Your Collection Feeds",
  subtitle = "Enter your email to unlock preference options and customize your private sales alerts.",
  placeholder = "Enter your email address",
  buttonText = "Verify Preferences",
  onSubscribe,
}: NewsletterSignupProps) {
  const shouldReduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const validateEmail = (val: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(val);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (error) setError("");

    // Dynamically reveal secondary preference fields when email format matches valid structures
    if (validateEmail(val)) {
      setShowPreferences(true);
    } else {
      setShowPreferences(false);
    }
  };

  const handlePreferenceToggle = (pref: string) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !validateEmail(email)) {
      setError("Please enter a valid email address first.");
      return;
    }

    setStatus("submitting");

    try {
      let success = true;
      if (onSubscribe) {
        success = await onSubscribe(email, { name, preferences });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (success) {
        setStatus("success");
      } else {
        setError("Something went wrong. Please try again.");
        setStatus("idle");
      }
    } catch (err) {
      setError("Server connection failed.");
      setStatus("idle");
    }
  };

  return (
    <section className="py-12 bg-white text-slate-900 border-b border-slate-100 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <motion.div
        layout
        transition={{ duration: 0.28, ease: "easeInOut" }}
        className="border border-slate-100 bg-slate-50/50 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {status !== "success" ? (
            
            // ==================== FORM PANEL ====================
            <motion.div
              key="progressive-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
                
                {/* Email field (Always visible) */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Step 1: Your Email
                  </span>
                  <input
                    type="text"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder={placeholder}
                    disabled={status === "submitting"}
                    className={`w-full px-4 py-3.5 text-xs font-bold bg-white border rounded-xl outline-hidden focus:ring-2 focus:ring-slate-950/15 focus:border-slate-800 transition-all duration-150 ${
                      error ? "border-red-500 focus:border-red-500" : "border-slate-200"
                    }`}
                  />
                </div>

                {/* Staged Progressive Disclosure panel (reveals via height + opacity slide-downs) */}
                <div 
                  style={{
                    maxHeight: showPreferences ? "400px" : "0px",
                    opacity: showPreferences ? 1 : 0,
                    transition: shouldReduceMotion 
                      ? "opacity 200ms ease-out" 
                      : "max-height 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 250ms ease-out",
                    overflow: "hidden",
                  }}
                  className="space-y-4"
                >
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Step 2: Collector Details
                    </span>

                    {/* Name input */}
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name (Optional)"
                        disabled={status === "submitting"}
                        className="w-full px-4 py-3.5 text-xs font-bold bg-white border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-slate-950/15 focus:border-slate-800 transition-all duration-150"
                      />
                    </div>

                    {/* Preference tags */}
                    <div className="space-y-2">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Drop Interests
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {["Art & Paintings", "Clay Crafts", "Home Lighting", "Leatherbound Items"].map((pref) => {
                          const isSelected = preferences.includes(pref);
                          return (
                            <button
                              key={pref}
                              type="button"
                              onClick={() => handlePreferenceToggle(pref)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-150 active:scale-95 ${
                                isSelected
                                  ? "bg-slate-900 text-white"
                                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {pref}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error warning */}
                {error && (
                  <div 
                    aria-live="assertive"
                    className="flex items-center gap-1 text-[10px] text-red-500 font-bold"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* CTA buttons */}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-4 rounded-xl bg-slate-950 text-white hover:bg-slate-900 active:scale-98 text-[10px] font-black uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-2"
                >
                  {status === "submitting" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <span>{showPreferences ? buttonText : "Begin Signup"}</span>
                  )}
                </button>

              </form>
            </motion.div>
          ) : (
            
            // ==================== SUCCESS PANEL ====================
            <motion.div
              key="progressive-success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-live="polite"
              className="flex flex-col items-center text-center space-y-4 py-6"
            >
              <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs animate-bounce">
                <Check className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  Preferences Locked!
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                  We've saved your interest configuration. Custom feeds will match your layout options shortly.
                </p>
              </div>
            </motion.div>

          )}
        </AnimatePresence>
      </motion.div>

    </section>
  );
}
