"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CategoryItem {
  id?: string;
  name?: string;
  title?: string;
  imageUrl?: string;
  image?: string;
  img?: string;
  icon?: string;
  href?: string;
  count?: string;
}

export interface CategoryCarouselProps {
  title?: string;
  categories: CategoryItem[];
  itemShape?: "circle" | "card";
  layout?: "circle" | "card";
}

export default function CategoryCarouselNativeSnap({
  title = "Shop by Category",
  categories = [],
  itemShape = "card",
  layout,
}: CategoryCarouselProps) {
  const effectiveShape = itemShape || (layout as any) || "card";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Recompute edge states & progress indicators
  const updateScrollStates = () => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, clientWidth, scrollWidth } = el;
    setCanScrollPrev(scrollLeft > 2);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 2);

    // Progress percentage
    const maxScroll = scrollWidth - clientWidth;
    setScrollProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0);
  };

  // Debounced scroll listener (50ms check window)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let debounceTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(updateScrollStates, 50);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    // Initial evaluation
    updateScrollStates();

    return () => {
      el.removeEventListener("scroll", handleScroll);
      clearTimeout(debounceTimeout);
    };
  }, [categories]);

  // Navigate by full pages minus small overlap offset
  const handleScrollClick = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;

    const pageWidth = el.clientWidth;
    const overlap = 80; // keep partial peeking content visible
    const offset = direction === "prev" ? -(pageWidth - overlap) : (pageWidth - overlap);

    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Click index dots to scroll snap target into view
  const handleDotClick = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;

    const items = el.children;
    if (items[index]) {
      items[index].scrollIntoView({ behavior: "smooth", inline: "start" });
    }
  };

  return (
    <section className="py-12 select-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative group/carousel">
      {/* Self-contained CSS hover injector */}
      <style>{`
        @media (hover: hover) {
          .hover-lift:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.08);
          }
        }
      `}</style>

      {/* Header with control arrows */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 
          className="text-xl font-black tracking-tight text-slate-800 sm:text-2xl"
          style={{ fontFamily: "var(--font-heading, inherit)" }}
        >
          {title}
        </h2>

        {/* Edge-aware action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleScrollClick("prev")}
            disabled={!canScrollPrev}
            className={`p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs transition-all duration-200 active:scale-90 ${
              canScrollPrev 
                ? "text-slate-800 hover:bg-slate-50 cursor-pointer" 
                : "text-slate-300 opacity-40 cursor-not-allowed"
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleScrollClick("next")}
            disabled={!canScrollNext}
            className={`p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs transition-all duration-200 active:scale-90 ${
              canScrollNext 
                ? "text-slate-800 hover:bg-slate-50 cursor-pointer" 
                : "text-slate-300 opacity-40 cursor-not-allowed"
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Swipeable Container with peeks */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory touch-pan-x"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {categories.map((cat: any, idx: number) => {
          const key = cat.id || cat.title || cat.name || `cat-snap-${idx}`;
          const label = cat.name || cat.title || cat.label || `Category ${idx + 1}`;
          const imgSrc =
            cat.imageUrl ||
            cat.image ||
            cat.img ||
            "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80";

          return (
            <div
              key={key}
              className="flex-shrink-0 basis-[45%] sm:basis-[28%] md:basis-[22%] snap-start snap-always"
            >
              <a
                href={cat.href || "#catalog"}
                className="block w-full group/tile"
              >
                <div 
                  className={`w-full aspect-[4/5] bg-slate-50 border border-slate-100 overflow-hidden transition-all duration-300 hover-lift ${
                    effectiveShape === "circle" ? "rounded-full aspect-square" : "rounded-3xl"
                  }`}
                >
                  <img
                    src={imgSrc}
                    alt={label}
                    className="w-full h-full object-cover select-none pointer-events-none group-hover/tile:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <span className="block text-center mt-3 text-xs font-black uppercase tracking-wider text-slate-800 group-hover/tile:text-slate-650">
                  {label}
                </span>
                {cat.count && (
                  <span className="block text-center text-[11px] text-slate-400 font-medium mt-0.5">
                    {cat.count}
                  </span>
                )}
              </a>
            </div>
          );
        })}
      </div>

      {/* Synchronized progress indicators */}
      <div className="flex flex-col items-center gap-3 pt-2">
        {/* Progress Bar line indicator */}
        <div className="w-32 h-[3px] bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* Index Dots indicators */}
        <div className="flex gap-2">
          {categories.map((_, idx) => {
            // Highlight closest dot
            const segment = 1 / Math.max(categories.length - 1, 1);
            const activeIdx = Math.round(scrollProgress / segment);
            const isActive = activeIdx === idx;

            return (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  isActive ? "w-4 bg-slate-900" : "w-1.5 bg-slate-200 hover:bg-slate-350"
                }`}
                aria-label={`Scroll to category index ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

    </section>
  );
}
