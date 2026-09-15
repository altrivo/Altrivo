"use client";

import React, { useState, useEffect } from "react";
import { Zap, Clock, ShieldCheck, ShoppingBag, Star, ArrowRight } from "lucide-react";
import { useCart } from "./CartContext";
import { formatPrice, formatCutPrice } from "@/lib/storefront/priceUtils";

export interface ProductSaleHighlightProps {
  title?: string;
  subtitle?: string;
  productId?: string;
  productName?: string;
  price?: string;
  originalPrice?: string;
  discountBadge?: string;
  image?: string;
  endsInHours?: number;
  onOpenProduct?: (product: any) => void;
}

export default function ProductSaleHighlight({
  title = "⚡ Flash Deal of the Day",
  subtitle = "Limited Time Offer — Exclusive Handcrafted Release with Escrow Protection",
  productId = "prod_0001",
  productName = "Royal Oxford Calfskin Shoes",
  price = "$78",
  originalPrice = "$95",
  discountBadge = "18% OFF",
  image = "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80",
  endsInHours = 12,
  onOpenProduct,
}: ProductSaleHighlightProps) {
  const { addToCart, setIsCheckoutOpen } = useCart();
  const [timeLeft, setTimeLeft] = useState({
    hours: endsInHours,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleQuickBuy = () => {
    addToCart({
      id: productId,
      name: productName,
      price,
      originalPrice,
      image,
    });
    setIsCheckoutOpen(true);
  };

  return (
    <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-emerald-500/20">
        
        {/* Glow Blurs */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Offer Content & Countdown (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black">
              <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              <span>{title}</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display leading-tight">
                {productName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Countdown Box */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Deal Expires In:
              </span>
              <div className="flex items-center gap-3 font-mono">
                {[
                  { label: "Hours", val: String(timeLeft.hours).padStart(2, "0") },
                  { label: "Mins", val: String(timeLeft.minutes).padStart(2, "0") },
                  { label: "Secs", val: String(timeLeft.seconds).padStart(2, "0") },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center min-w-[65px]"
                  >
                    <div className="text-2xl sm:text-3xl font-black text-white">{item.val}</div>
                    <div className="text-[9px] uppercase font-bold text-slate-300">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Row */}
            <div className="flex items-baseline gap-4 pt-2">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400">{formatPrice(price)}</span>
              <span className="text-lg text-slate-400 line-through font-semibold">
                {formatCutPrice(price, originalPrice)}
              </span>
              <span className="px-3 py-1 rounded-xl bg-rose-500 text-white font-black text-xs shadow-md">
                {discountBadge}
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleQuickBuy}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-300 hover:to-teal-400 text-white font-black text-xs shadow-lg hover:shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Claim Deal & Checkout Now</span>
              </button>

              <button
                onClick={() =>
                  onOpenProduct?.({
                    id: productId,
                    name: productName,
                    price,
                    originalPrice,
                    image,
                    badge: discountBadge,
                  })
                }
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>View Full Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Featured Product Image & Badges (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/20 bg-slate-800 shadow-2xl group">
              <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-md">
                Top Rated Choice
              </span>
              <img
                src={image}
                alt={productName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-6 text-white">
                <div className="flex items-center gap-1 text-amber-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                  <span className="text-xs font-black text-white ml-1">4.9 / 5.0</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Cash on Delivery • 7-Day Easy Returns</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
