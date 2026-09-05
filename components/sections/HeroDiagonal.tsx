"use client";

import React from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface HeroDiagonalProps {
  headline: string;
  subtext?: string;
  ctaText?: string;
  ctaHref?: string;
  primaryColor?: string; // Default "#14213d"
  secondaryColor?: string; // Default "#1D9E75"
  visualSlot?: React.ReactNode;
}

export default function HeroDiagonal({
  headline,
  subtext,
  ctaText = "Shop Catalog",
  ctaHref = "#catalog",
  primaryColor = "#0f172a",
  secondaryColor = "#d97706",
  visualSlot,
}: HeroDiagonalProps) {
  const shouldReduceMotion = useReducedMotion();

  // Sliding entrance for clip-path boundary
  const borderVariants: Variants = {
    hidden: { x: shouldReduceMotion ? 0 : "-100%" },
    visible: {
      x: 0,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1], // Decelerating easeOutExpo
      },
    },
  };

  // Text contents fade-up variant
  const contentVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: shouldReduceMotion ? 0 : 0.5,
        duration: 0.45,
        ease: "easeOut",
      },
    },
  };

  return (
    <section 
      className="relative w-full min-h-[70vh] sm:min-h-[80vh] flex flex-col md:flex-row items-stretch select-none overflow-hidden border-b border-slate-100 bg-slate-900"
    >
      {/* 1. Mobile Layout: Stacked colors (without clip-path polygon) */}
      <div className="flex flex-col w-full md:hidden">
        {/* Top/Primary Text Pane */}
        <div 
          className="p-8 py-16 flex flex-col items-center justify-center text-center text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <h1 className="text-3xl font-black tracking-tight leading-tight">{headline}</h1>
          {subtext && <p className="mt-4 text-xs text-slate-200 max-w-sm">{subtext}</p>}
          {ctaText && ctaHref && (
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 mt-6 px-7 py-3 rounded-xl text-[10px] font-extrabold tracking-widest uppercase border border-white text-white active:scale-95 transition-all duration-300 hover:bg-white hover:text-slate-950"
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* Bottom/Secondary Visual Pane */}
        <div 
          className="p-8 py-12 flex items-center justify-center"
          style={{ backgroundColor: secondaryColor }}
        >
          <div className="w-full max-w-sm bg-white/95 rounded-2xl p-5 shadow-md">
            {visualSlot ? (
              visualSlot
            ) : (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Deal</span>
                <h3 className="text-base font-black text-slate-800">Flat 20% Discount</h3>
                <p className="text-xs text-slate-500">Applied automatically at checkout for all premium ceramic collections.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Desktop Layout: Sliding clip-path diagonal divide */}
      <div className="hidden md:flex w-full h-[650px] relative">
        {/* Right Base Layer Pane (Secondary Color) */}
        <div 
          className="absolute inset-0 w-full h-full z-0 flex items-center justify-end pr-20 lg:pr-32"
          style={{ backgroundColor: secondaryColor }}
        >
          <div className="w-full max-w-sm lg:max-w-md bg-white rounded-3xl p-6 shadow-xl border border-slate-200/50">
            {visualSlot ? (
              visualSlot
            ) : (
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seasonal Promo</span>
                <h3 className="text-xl font-black text-slate-800">Buy 2 Get 1 Free</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Mix and match pottery classes or select physical home accessories. Valid through August.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-700">
                  <span>Code: SECONDFREE</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md">Coupon</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Left Sliding Layer Pane (Primary Color with skew clip-path) */}
        <motion.div
          variants={borderVariants}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 w-[58%] lg:w-[55%] h-full z-10 flex items-center pl-12 lg:pl-24 pr-8 text-white shadow-2xl"
          style={{ 
            backgroundColor: primaryColor,
            clipPath: "polygon(0 0, 100% 0, 84% 100%, 0 100%)",
          }}
        >
          {/* Staggered text contents inside primary clip */}
          <motion.div
            variants={contentVariants}
            className="max-w-md space-y-6"
          >
            <h1 
              className="text-4xl lg:text-5xl font-black tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              {headline}
            </h1>

            {subtext && (
              <p className="text-xs lg:text-sm text-slate-300 leading-relaxed">
                {subtext}
              </p>
            )}

            {ctaText && ctaHref && (
              <div className="pt-2">
                <a
                  href={ctaHref}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-extrabold tracking-widest uppercase border border-white text-white active:scale-95 transition-all duration-300 hover:bg-white hover:text-slate-900 cursor-pointer"
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

    </section>
  );
}
