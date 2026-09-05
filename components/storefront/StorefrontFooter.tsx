"use client";

import {
  Globe,
  Headphones,
  Lock,
  MessageSquare,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";
import React from "react";

import { VendorStoreConfig } from "@/lib/storefront/themeResolver";



interface StorefrontFooterProps {
  config: VendorStoreConfig;
}

export function StorefrontFooter({ config }: StorefrontFooterProps) {
  return (
    <footer className="border-t border-default bg-gradient-to-b from-card to-muted/40 text-body mt-12 select-none">
      {/* 4 Value Proposition Features Bar */}
      <div className="border-b border-default bg-primary-900 text-white py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-accent-300">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Express Nationwide Shipping</h3>
              <p className="text-[11px] text-accent-100/80">Delivered within 2-4 business days</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-accent-300">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">7-Day Easy Returns</h3>
              <p className="text-[11px] text-accent-100/80">Hassle-free replacement policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-accent-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">100% Authentic Quality</h3>
              <p className="text-[11px] text-accent-100/80">Crafted by master artisans</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-accent-300">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Dedicated WhatsApp Support</h3>
              <p className="text-[11px] text-accent-100/80">Instant customer service responses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
        {/* Col 1: Store Story & Brand Info (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <Sparkles className="w-4 h-4 text-accent-200" />
            </div>
            <span className="font-display font-extrabold text-lg text-heading">
              {config.storeName}
            </span>
          </div>

          <p className="text-subtle leading-relaxed max-w-sm">
            {config.tagline}. Curating premium handcrafted items across Pakistan with verified escrow protection and instant home delivery.
          </p>

          <div className="pt-2 flex items-center gap-3">
            {config.socialLinks.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow us on ${s.name}`}
                className="w-9 h-9 rounded-xl border border-default bg-card hover:bg-sidebar-hover text-heading flex items-center justify-center shadow-2xs hover:scale-105 transition-all"
              >
                {s.icon === "instagram" ? (
                  <Globe className="w-4 h-4 text-accent-600" />
                ) : s.icon === "facebook" ? (
                  <Share2 className="w-4 h-4 text-primary-600" />
                ) : (
                  <MessageSquare className="w-4 h-4 text-success-600" />
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: Categories Links */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-heading font-display">
            Quick Categories
          </h3>
          <ul className="space-y-2 text-subtle">
            {config.categories.map((cat) => (
              <li key={cat.name}>
                <Link href={cat.href} className="hover:text-primary-700 transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Customer Care Policies */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-heading font-display">
            Store Policies
          </h3>
          <ul className="space-y-2 text-subtle">
            {config.policies.map((p) => (
              <li key={p.title}>
                <Link href={p.href} className="hover:text-primary-700 transition-colors">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Newsletter Signup */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-heading font-display">
            Stay Updated
          </h3>
          <p className="text-subtle leading-relaxed">
            Subscribe to get exclusive discount codes and new seasonal arrivals.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed!"); }} className="space-y-2">
            <input
              type="email"
              aria-label="Email address for newsletter subscription"
              placeholder="Enter your email address..."
              required
              className="w-full h-input px-3.5 rounded-xl bg-input border border-default text-xs text-heading placeholder:text-subtle"
            />
            <button
              type="submit"
              aria-label="Subscribe to newsletter"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-extrabold text-xs shadow-xs hover:brightness-110 active:scale-95 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Copyright & Security Bar */}
      <div className="border-t border-default py-4 px-4 sm:px-6 bg-card text-center sm:text-left text-xs text-subtle">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 {config.storeName}. Powered by Altrivo Multi-Vendor Infrastructure.</p>
          <div className="flex items-center gap-2 text-success-700 font-semibold">
            <Lock className="w-3.5 h-3.5 text-success-600" />
            256-Bit SSL Encrypted & Escrow Protected
          </div>
        </div>
      </div>
    </footer>
  );
}
