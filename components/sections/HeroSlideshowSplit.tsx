"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export interface SlideshowItem {
  src: string;
  alt: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface HeroSlideshowProps {
  items: SlideshowItem[];
}

export default function HeroSlideshowSplit({
  items = [],
}: HeroSlideshowProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // Preload upcoming slides
  useEffect(() => {
    if (items.length <= 1) return;

    const img1 = new Image();
    img1.src = items[(activeIndex + 1) % items.length].src;

    const img2 = new Image();
    img2.src = items[(activeIndex + 2) % items.length].src;
  }, [activeIndex, items]);

  if (!items || items.length === 0) return null;

  const current = items[activeIndex];

  return (
    <section className="py-16 select-none bg-slate-900 text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-900 my-6 rounded-3xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Image Crossfade panel */}
        <div className="lg:col-span-6 relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-slate-950">
          {items.map((item, idx) => {
            const isActive = activeIndex === idx;
            const isPrev = (activeIndex - 1 + items.length) % items.length === idx;

            return (
              <div
                key={idx}
                style={{
                  opacity: isActive ? 1 : isPrev ? 1 : 0,
                  zIndex: isActive ? 2 : isPrev ? 1 : 0,
                  transition: shouldReduceMotion ? "none" : "opacity 900ms ease-in-out",
                }}
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              </div>
            );
          })}
          
          {/* Soft overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 pointer-events-none" />

          {/* Navigation Overlay Buttons */}
          <div className="absolute bottom-4 right-4 z-30 flex gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-black/60 border border-white/10 text-white hover:bg-black active:scale-90 transition-all duration-150 cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-black/60 border border-white/10 text-white hover:bg-black active:scale-90 transition-all duration-150 cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Text details panel (animates on index changes) */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-center min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 text-center lg:text-left"
            >
              <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-300">
                Collection {activeIndex + 1} of {items.length}
              </span>

              <h2
                className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white"
                style={{ fontFamily: "var(--font-heading, inherit)" }}
              >
                {current.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 font-bold leading-relaxed max-w-lg mx-auto lg:mx-0">
                {current.description}
              </p>

              <div className="pt-2">
                <a
                  href={current.ctaLink || "#"}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-950 hover:bg-slate-50 active:scale-95 text-[10px] font-black uppercase tracking-widest transition-all duration-150 border border-white"
                >
                  <span>{current.ctaText || "Explore"}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
