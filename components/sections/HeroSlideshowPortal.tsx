"use client";

import React, { useState, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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

export default function HeroSlideshowPortal({
  items = [],
}: HeroSlideshowProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

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
    <section className="py-16 select-none bg-slate-50 text-slate-800 border-b border-slate-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Thumbnail previews and text info */}
        <div className="lg:col-span-6 space-y-8 flex flex-col justify-center order-2 lg:order-1">
          
          <div className="space-y-4 text-center lg:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Artisan Story Catalog
            </span>
            <h2
              className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-slate-900"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              {current.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed max-w-lg mx-auto lg:mx-0">
              {current.description}
            </p>
            <div className="pt-2">
              <a
                href={current.ctaLink || "#"}
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-900 hover:gap-2.5 transition-all duration-150"
              >
                <span>{current.ctaText || "Read Chronology"}</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          {/* Interactive thumb swapper strip */}
          <div className="flex gap-4 justify-center lg:justify-start">
            {items.map((item, idx) => {
              const isSelected = activeIndex === idx;

              return (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative w-20 aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-[var(--color-primary,#694873)] scale-105 shadow-md"
                      : "border-slate-200 hover:border-slate-400 scale-95"
                  }`}
                  aria-label={`Select story index ${idx + 1}`}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-black/25 transition-opacity ${
                    isSelected ? "opacity-0" : "opacity-40"
                  }`} />
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Side: Circle-Masked Portal Viewport (crossfades absolutely) */}
        <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
          <div className="relative w-full max-w-[400px] aspect-[4/5] rounded-[200px] overflow-hidden border-4 border-white shadow-2xl bg-slate-100 z-10">
            {items.map((item, idx) => {
              const isActive = activeIndex === idx;
              const isPrev = (activeIndex - 1 + items.length) % items.length === idx;

              return (
                <div
                  key={idx}
                  style={{
                    opacity: isActive ? 1 : isPrev ? 1 : 0,
                    zIndex: isActive ? 2 : isPrev ? 1 : 0,
                    transition: shouldReduceMotion ? "none" : "opacity 1000ms ease-in-out",
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
          </div>
        </div>

      </div>
    </section>
  );
}
