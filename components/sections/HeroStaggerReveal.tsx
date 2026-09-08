"use client";

import React from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface HeroStaggerRevealProps {
  eyebrow?: string;
  headline: string;
  subtext?: string;
  ctaText?: string;
  ctaHref?: string;
  visualSlot?: React.ReactNode;
  bgColor?: string; // Solid theme color or CSS variable
}

export default function HeroStaggerReveal({
  eyebrow = "Curated Selection",
  headline,
  subtext,
  ctaText = "Shop Releases",
  ctaHref = "#catalog",
  visualSlot,
  bgColor = "#ffffff",
}: HeroStaggerRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  // Entrance variants using transform + opacity only
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1, // 100ms stagger between elements
      },
    },
  };

  const eyebrowVariants: Variants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -25 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const headlineVariants: Variants = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.92 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  const subtextVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const ctaVariants: Variants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const visualVariants: Variants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -35 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section
      className="relative w-full py-16 md:py-24 overflow-hidden select-none border-b border-slate-100"
      style={{ backgroundColor: bgColor }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
      >
        
        {/* Left Side: Staggered Content Elements */}
        <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
          {eyebrow && (
            <motion.span
              variants={eyebrowVariants}
              className="inline-block px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider"
            >
              {eyebrow}
            </motion.span>
          )}

          <motion.h1
            variants={headlineVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {headline}
          </motion.h1>

          {subtext && (
            <motion.p
              variants={subtextVariants}
              className="text-sm sm:text-base text-slate-500 max-w-lg leading-relaxed"
            >
              {subtext}
            </motion.p>
          )}

          {ctaText && ctaHref && (
            <motion.div variants={ctaVariants} className="pt-2">
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
            </motion.div>
          )}
        </div>

        {/* Right Side: Staggered Visual Slot */}
        <motion.div
          variants={visualVariants}
          className="w-full flex items-center justify-center"
        >
          <div className="w-full max-w-md bg-slate-50 rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            {visualSlot ? (
              visualSlot
            ) : (
              // Default Visual Slot rendering (details list card)
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Benefits</span>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="text-emerald-400 font-bold">✔</span>
                    <p className="text-xs text-slate-600 font-medium">Authenticity card included with every piece.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-emerald-400 font-bold">✔</span>
                    <p className="text-xs text-slate-600 font-medium">Safe packing & insurance coverage against breakages.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-emerald-400 font-bold">✔</span>
                    <p className="text-xs text-slate-600 font-medium">Support community workshops directly with every purchase.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
