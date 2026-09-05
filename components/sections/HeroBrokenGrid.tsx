"use client";

import React from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface HeroBrokenGridProps {
  eyebrow?: string;
  headline: string;
  subtext?: string;
  ctaText?: string;
  ctaHref?: string;
  bgColor?: string; // Theme-driven solid color or CSS variable
  visualSlot?: React.ReactNode;
}

export default function HeroBrokenGrid({
  eyebrow = "Limited Release",
  headline,
  subtext,
  ctaText = "Shop Release",
  ctaHref = "#catalog",
  bgColor = "#fafafa",
  visualSlot,
}: HeroBrokenGridProps) {
  const shouldReduceMotion = useReducedMotion();

  // Entrance variants
  const textVariants: Variants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const visualVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: shouldReduceMotion ? 0 : 0.25,
        duration: 0.55,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      className="relative w-full py-16 md:py-28 overflow-hidden select-none border-b border-slate-100"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-4 items-center relative">
        
        {/* Left Off-Grid Overlapping Text Block */}
        <motion.div
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="md:col-span-7 md:pr-4 z-20 flex flex-col items-center md:items-start text-center md:text-left relative md:-mr-12"
        >
          {eyebrow && (
            <span className="inline-block px-3 py-1 mb-4 rounded-full bg-slate-200/60 text-slate-800 text-xs font-bold uppercase tracking-wider">
              {eyebrow}
            </span>
          )}

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {headline}
          </h1>

          {subtext && (
            <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed">
              {subtext}
            </p>
          )}

          {ctaText && ctaHref && (
            <div className="mt-6">
              <a
                href={ctaHref}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-extrabold tracking-widest uppercase text-white shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
                style={{ backgroundColor: "var(--color-primary, #0f172a)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "none";
                }}
              >
                <span>{ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          )}
        </motion.div>

        {/* Right Offset Visual Slot Block */}
        <motion.div
          variants={visualVariants}
          initial="hidden"
          animate="visible"
          className="md:col-span-5 w-full flex justify-center z-10 md:pt-16"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md">
            {visualSlot ? (
              visualSlot
            ) : (
              // Default Visual Slot rendering (stat/card cluster)
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Artist</span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">Featured</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-800">Malaika Khalid</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Heritage clay thrower specialising in double-walled earth pots and terracotta finishes.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Heritage</span>
                    <span className="text-sm font-black text-slate-700">12 Years</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Origin</span>
                    <span className="text-sm font-black text-slate-700">Multan, PK</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
