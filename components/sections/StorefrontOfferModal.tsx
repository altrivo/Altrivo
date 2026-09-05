"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Copy, Check, Gift, ArrowRight } from "lucide-react";

export interface StorefrontOfferModalProps {
  couponCode?: string;
  discountAmount?: string;
  headline?: string;
  subheadline?: string;
  delaySeconds?: number;
}

export default function StorefrontOfferModal({
  couponCode = "WELCOME15",
  discountAmount = "15% OFF",
  headline = "🎉 Exclusive Welcome Voucher",
  subheadline = "Unlock an instant 15% discount on all handcrafted shoes and leather goods today!",
  delaySeconds = 4,
}: StorefrontOfferModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if user already dismissed in this session
    const dismissed = sessionStorage.getItem("storefront_offer_dismissed");
    if (dismissed) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [delaySeconds]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("storefront_offer_dismissed", "true");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-500/30 overflow-hidden text-center space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow blur background */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Close offer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center shadow-lg">
          <Gift className="w-7 h-7" />
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 inline-block">
            Special Limited Offer
          </span>
          <h3 className="text-2xl font-black font-display text-white">{headline}</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
            {subheadline}
          </p>
        </div>

        {/* Voucher Box */}
        <div className="p-3.5 rounded-2xl bg-white/10 border border-dashed border-emerald-400/50 backdrop-blur-md flex items-center justify-between gap-2">
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Promo Coupon:</span>
            <span className="font-mono text-base font-black text-emerald-400 tracking-wider">
              {couponCode}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-950" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Claim CTA */}
        <button
          onClick={handleClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Apply Discount & Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[10px] text-slate-400">
          *Offer valid on orders above ₨ 5,000. 100% Escrow Protected.
        </p>
      </div>
    </div>
  );
}
