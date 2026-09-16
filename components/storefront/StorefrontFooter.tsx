"use client";

import {
  Globe,
  Headphones,
  Lock,
  MessageSquare,
  RotateCcw,
  Share2,
  ShieldCheck,
  Store,
  Truck,
  PackageCheck,
  ArrowRight,
  Check,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

import { VendorStoreConfig } from "@/lib/storefront/themeResolver";

interface StorefrontFooterProps {
  config: VendorStoreConfig;
}

export function StorefrontFooter({ config }: StorefrontFooterProps) {
  const [subscribed, setSubscribed] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-default bg-[#1D1221] text-neutral-300 select-none">
      {/* 4 Value Proposition Features Bar */}
      <div className="border-b border-white/10 bg-[#2C1C31]/90 backdrop-blur-xs py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#694873]/50 border border-[#D1B2DB]/30 flex items-center justify-center text-[#D1B2DB] flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Express Nationwide Shipping</h3>
              <p className="text-[11px] text-neutral-400">Delivered within 2-4 business days</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#694873]/50 border border-[#D1B2DB]/30 flex items-center justify-center text-[#D1B2DB] flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">7-Day Easy Returns</h3>
              <p className="text-[11px] text-neutral-400">Hassle-free replacement policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#694873]/50 border border-[#D1B2DB]/30 flex items-center justify-center text-[#D1B2DB] flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">100% Authentic Quality</h3>
              <p className="text-[11px] text-neutral-400">Hand-inspected genuine items</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#694873]/50 border border-[#D1B2DB]/30 flex items-center justify-center text-[#D1B2DB] flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Dedicated WhatsApp Support</h3>
              <p className="text-[11px] text-neutral-400">Instant customer service responses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
        {/* Col 1: Store Story & Brand Info (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#694873] border border-[#D1B2DB]/40 text-white flex items-center justify-center font-black text-sm shadow-md">
              <Store className="w-5 h-5 text-[#D1B2DB]" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg text-white block">
                {config.storeName}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-[#D1B2DB]">
                <ShieldCheck className="w-3 h-3 text-[#D1B2DB]" />
                Verified Storefront
              </span>
            </div>
          </div>

          <p className="text-neutral-400 leading-relaxed max-w-sm text-xs">
            {config.tagline || config.description || "Curating premium authentic collections across Pakistan with verified escrow protection and instant Cash on Delivery."}
          </p>

          {config.supportPhone && (
            <a
              href={`https://wa.me/${config.supportPhone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(config.storeName)},%20I%20have%20an%20inquiry.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#694873]/40 hover:bg-[#694873]/70 border border-[#D1B2DB]/30 text-white text-xs font-bold transition-all active:scale-95 shadow-2xs"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Order Support</span>
            </a>
          )}

          <div className="pt-2 flex items-center gap-2">
            {config.socialLinks.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow us on ${s.name}`}
                className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-[#694873]/50 text-neutral-300 hover:text-white flex items-center justify-center shadow-2xs hover:scale-105 transition-all"
              >
                {s.icon === "instagram" ? (
                  <Globe className="w-4 h-4 text-[#D1B2DB]" />
                ) : s.icon === "facebook" ? (
                  <Share2 className="w-4 h-4 text-[#D1B2DB]" />
                ) : (
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: Categories Links */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-white font-display">
            Quick Categories
          </h3>
          <ul className="space-y-2 text-neutral-400">
            {config.categories.map((cat) => (
              <li key={cat.name}>
                <Link href={cat.href} className="hover:text-white transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Customer Care Policies */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-white font-display">
            Store Policies
          </h3>
          <ul className="space-y-2 text-neutral-400">
            {config.policies.map((p) => (
              <li key={p.title}>
                <Link href={p.href} className="hover:text-white transition-colors">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Newsletter Signup */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-white font-display">
            Exclusive Deals
          </h3>
          <p className="text-neutral-400 leading-relaxed text-xs">
            Subscribe to get exclusive discount codes and new seasonal arrivals.
          </p>

          {!subscribed ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
              }}
              className="space-y-2"
            >
              <input
                type="email"
                aria-label="Email address for newsletter subscription"
                placeholder="Enter your email address..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/10 focus:border-[#D1B2DB] text-xs text-white placeholder:text-neutral-500 outline-none transition-colors"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="w-full py-2.5 rounded-xl bg-[#694873] hover:bg-[#5A3D63] active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Get 10% Discount</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="text-center py-2.5 space-y-1 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-emerald-300">
              <Check className="h-4 w-4 mx-auto text-emerald-400" />
              <p className="text-xs font-bold text-white">Subscribed!</p>
              <p className="text-[10px] text-emerald-200">
                Use code <strong className="font-mono text-white">SAVE10</strong> at checkout.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Copyright & Security Bar */}
      <div className="border-t border-white/10 py-5 px-4 sm:px-6 bg-[#160D1A] text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {currentYear} {config.storeName}. Powered by Altrivo Multi-Vendor Infrastructure.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
              <PackageCheck className="w-3.5 h-3.5" />
              Cash on Delivery (COD)
            </span>
            <span className="inline-flex items-center gap-1 text-[#D1B2DB] font-semibold text-[11px]">
              <Lock className="w-3.5 h-3.5" />
              256-Bit SSL Encrypted
            </span>
            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Escrow Protected
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
