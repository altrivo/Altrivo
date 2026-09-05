"use client";

import React, { useState, useEffect, useRef } from "react";
import { useReducedMotion, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface HeroRevealProps {
  eyebrow?: string;
  headline?: string;
  subtext?: string;
  ctaText?: string;
  ctaLink?: string;
  visualSlot?: React.ReactNode;
}

export default function HeroReveal({
  eyebrow = "Limited Edition Drops",
  headline = "Preserving Ancient Kiln Pottery from the Indus Basin",
  subtext = "Every piece is hand-spun by master clay artisans using centuries-old glazing formulas, backed by secure escrow delivery checkouts.",
  ctaText = "Shop Collection",
  ctaLink = "#catalog",
  visualSlot,
}: HeroRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const [startReveal, setStartReveal] = useState(false);
  const hasAnimatedRef = useRef(false);

  // 1. Trigger reveal exactly once on initial mount after page settles
  useEffect(() => {
    if (!hasAnimatedRef.current) {
      const t = setTimeout(() => {
        setStartReveal(true);
        hasAnimatedRef.current = true;
      }, 120);
      return () => clearTimeout(t);
    } else {
      setStartReveal(true);
    }
  }, []);

  // 2. Identify active present items to calculate delays dynamically without empty gaps
  const itemsList = [
    { id: "eyebrow", node: eyebrow ? <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{eyebrow}</span> : null },
    { id: "headline", node: headline ? <h1 className="text-3xl sm:text-4xl lg:text-5.5xl font-black tracking-tight text-slate-900 leading-tight" style={{ fontFamily: "var(--font-heading, inherit)" }}>{headline}</h1> : null },
    { id: "subtext", node: subtext ? <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed max-w-xl">{subtext}</p> : null },
    { id: "cta", node: ctaText ? (
      <div className="pt-2">
        <a
          href={ctaLink}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-950 text-white hover:bg-slate-900 active:scale-95 text-[10px] font-black uppercase tracking-widest transition-all duration-150 border border-slate-950"
        >
          <span>{ctaText}</span>
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    ) : null }
  ].filter(item => item.node !== null);

  // Uniform reveal motion values: opacity 0->1, translateY 16px->0 over 380ms
  const getRevealTransition = (idx: number) => {
    if (shouldReduceMotion) return { duration: 0 };
    return {
      duration: 0.38,
      ease: "easeOut" as const,
      delay: idx * 0.15,
    };
  };

  // Visual slot starts overlapping the last ~35% of text block animation sequence
  const getVisualTransition = () => {
    if (shouldReduceMotion) return { duration: 0 };
    const overlapIndex = Math.max(0, itemsList.length - 1.25);
    return {
      duration: 0.45,
      ease: "easeOut" as const,
      delay: overlapIndex * 0.15,
    };
  };

  const defaultVisualSlot = (
    <div className="relative aspect-video lg:aspect-square w-full max-w-[420px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 flex items-center justify-center">
      <img
        src="https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800"
        alt="Pottery kiln visual mockup"
        className="w-full h-full object-cover"
        loading="eager"
      />
    </div>
  );

  return (
    <section className="py-16 md:py-24 bg-white border-b border-slate-100 flex items-center select-none w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text reveal content (no conditional mounts to prevent CLS) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            {itemsList.map((item, idx) => {
              const active = startReveal;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                  animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                  transition={getRevealTransition(idx)}
                  className="w-full flex flex-col items-center lg:items-start"
                >
                  {item.node}
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Visual Slot reveal overlaps */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <motion.div
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
              animate={startReveal ? { opacity: 1, scale: 1 } : { opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
              transition={getVisualTransition()}
              className="w-full flex justify-center"
            >
              {visualSlot || defaultVisualSlot}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
