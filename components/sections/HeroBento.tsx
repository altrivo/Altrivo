"use client";

import React from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { ArrowRight, HelpCircle, Shield, Sparkles } from "lucide-react";

export interface BentoCard {
  icon?: string;
  label: string;
  value: string;
  description?: string;
}

export interface HeroBentoProps {
  headline: string;
  subtext?: string;
  ctaText?: string;
  ctaHref?: string;
  cards?: BentoCard[];
  bgColor?: string; // Solid theme color or CSS variable
}

const DEFAULT_CARDS: BentoCard[] = [
  { icon: "Sparkles", label: "Unique Pieces", value: "100%", description: "Fully original clay items made from hand-mixed earth glaze." },
  { icon: "Shield", label: "Heritage Guarantee", value: "Certified", description: "Vetted by local art councils." },
  { icon: "HelpCircle", label: "Support Artists", value: "Direct Pay", description: "100% of profit margins flow back to the maker." },
];

export default function HeroBento({
  headline,
  subtext,
  ctaText = "Browse Pieces",
  ctaHref = "#catalog",
  cards = DEFAULT_CARDS,
  bgColor = "#f8fafc",
}: HeroBentoProps) {
  const shouldReduceMotion = useReducedMotion();

  // Map icon strings to Lucide components
  const renderIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case "sparkles":
        return <Sparkles className="h-5 w-5 text-indigo-500" />;
      case "shield":
        return <Shield className="h-5 w-5 text-emerald-400" />;
      case "helpcircle":
        return <HelpCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-indigo-500" />;
    }
  };

  // Entrance Variants
  const cardContainerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.45,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      className="relative w-full py-16 md:py-24 overflow-hidden select-none border-b border-slate-100"
      style={{ backgroundColor: bgColor }}
    >
      {/* Self-contained CSS Floating Animation Injector */}
      <style>{`
        @keyframes float-bento-1 {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-7px); }
        }
        @keyframes float-bento-2 {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-9px); }
        }
        @keyframes float-bento-3 {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-5px); }
        }
        .bento-float-1 {
          animation: float-bento-1 4.5s ease-in-out infinite alternate;
        }
        .bento-float-2 {
          animation: float-bento-2 5.5s ease-in-out infinite alternate;
        }
        .bento-float-3 {
          animation: float-bento-3 6.5s ease-in-out infinite alternate;
        }
        @media (prefers-reduced-motion: reduce) {
          .bento-float-1, .bento-float-2, .bento-float-3 {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Headline Section */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {headline}
          </h1>

          {subtext && (
            <p className="text-sm sm:text-base text-slate-500 max-w-lg leading-relaxed">
              {subtext}
            </p>
          )}

          {ctaText && ctaHref && (
            <div className="pt-2">
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
        </div>

        {/* Right Bento Grid Container */}
        <motion.div
          variants={cardContainerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-5 grid grid-cols-2 gap-4 w-full"
        >
          {cards.map((card, index) => {
            // Bento sizing configuration (First card spans full width, others stack)
            const isFullWidth = index === 0;
            const floatClass = index === 0 ? "bento-float-1" : index === 1 ? "bento-float-2" : "bento-float-3";

            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className={`bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between ${
                  isFullWidth ? "col-span-2 min-h-[160px]" : "col-span-1 min-h-[140px]"
                } ${shouldReduceMotion ? "" : floatClass}`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    {renderIcon(card.icon)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {card.label}
                  </span>
                </div>
                <div className="mt-4 space-y-1">
                  <span className="block text-2xl font-black text-slate-800 leading-none">
                    {card.value}
                  </span>
                  {card.description && (
                    <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-relaxed">
                      {card.description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
