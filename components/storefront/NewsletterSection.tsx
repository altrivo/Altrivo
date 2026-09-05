"use client";

import { CheckCircle2, Mail, Sparkles } from "lucide-react";
import React, { useState } from "react";

import { VendorStoreConfig } from "@/lib/storefront/themeResolver";


interface NewsletterSectionProps {
  config: VendorStoreConfig;
}

export function NewsletterSection({ config }: NewsletterSectionProps) {
  const { newsletter } = config;
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section aria-label="Newsletter Signup" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-950 to-[#2C1C31] p-8 sm:p-12 text-white shadow-xl">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-accent-400/15 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 rounded-full bg-primary-400/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-accent-200 text-xs font-extrabold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-accent-300" />
          <span>{newsletter.discountText}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight leading-tight">
          {newsletter.headline}
        </h2>

        <p className="text-xs sm:text-sm text-accent-100/90 leading-relaxed">
          {newsletter.subheadline}
        </p>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-success-600/30 border border-success-400/40 text-success-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-in fade-in duration-fast">
            <CheckCircle2 className="w-5 h-5 text-success-300" />
            <span>Thank you for subscribing! Your discount code has been emailed.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="relative w-full flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-200/70 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address for exclusive drops and discounts"
                placeholder="Enter your email address..."
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/10 border border-white/20 text-xs sm:text-sm text-white placeholder:text-accent-100/60 focus:outline-none focus:ring-2 focus:ring-accent-400/40 focus:bg-white/15 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 h-12 rounded-xl bg-gradient-to-r from-accent-400 to-accent-500 text-primary-950 font-extrabold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              Subscribe Now
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
