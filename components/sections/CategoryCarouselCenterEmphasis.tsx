"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CategoryItem {
  id: string;
  name: string;
  imageUrl: string;
  icon?: string;
  href?: string;
}

export interface CategoryCarouselProps {
  title?: string;
  categories: CategoryItem[];
  itemShape?: "circle" | "card";
}

export default function CategoryCarouselCenterEmphasis({
  title = "Shop by Category",
  categories = [],
  itemShape = "card",
}: CategoryCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [centeredId, setCenteredId] = useState<string | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  // IntersectionObserver around horizontal center margin bounds
  useEffect(() => {
    const root = containerRef.current;
    if (!root || categories.length === 0) return;

    // Narrow horizontal root margin targeting center 10% segment
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            setCenteredId(id);
          }
        });
      },
      {
        root: root,
        rootMargin: "0px -45% 0px -45%",
        threshold: 0,
      }
    );

    // Observe each category tile
    Object.keys(itemRefs.current).forEach((key) => {
      const node = itemRefs.current[key];
      if (node) observer.observe(node);
    });

    return () => {
      observer.disconnect();
    };
  }, [categories]);

  // Update arrow states
  const updateScrollStates = () => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, clientWidth, scrollWidth } = el;
    setCanScrollPrev(scrollLeft > 2);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 2);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollStates, { passive: true });
    updateScrollStates();
    return () => el.removeEventListener("scroll", updateScrollStates);
  }, [categories]);

  const handleScrollClick = (direction: "prev" | "next") => {
    const el = containerRef.current;
    if (!el) return;

    const pageWidth = el.clientWidth;
    const overlap = 80;
    const offset = direction === "prev" ? -(pageWidth - overlap) : (pageWidth - overlap);

    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className="py-12 select-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative">
      
      {/* Header controls */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 
          className="text-xl font-black tracking-tight text-slate-800 sm:text-2xl"
          style={{ fontFamily: "var(--font-heading, inherit)" }}
        >
          {title}
        </h2>

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

      {/* Swipeable Snap container with centered observing */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory touch-pan-x"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {/* Empty padding blocks at the ends ensure edge elements can center-align */}
        <div className="flex-shrink-0 basis-[30%] sm:basis-[38%] md:basis-[42%]" />

        {categories.map((cat: any, idx) => {
          const isCentered = centeredId === (cat.id || String(idx));
          const imgSrc = cat.imageUrl || cat.image || cat.img || "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80";
          const label = cat.name || cat.title || cat.label || `Collection ${idx + 1}`;
          const count = cat.count || cat.itemCount || "";

          return (
            <div
              key={cat.id || idx}
              ref={(el) => {
                const k = cat.id || String(idx);
                itemRefs.current[k] = el;
              }}
              data-id={cat.id || String(idx)}
              className="flex-shrink-0 basis-[44%] sm:basis-[26%] md:basis-[20%] snap-center snap-always flex flex-col items-center"
              style={{
                transform: isCentered ? "scale(1.05)" : "scale(0.96)",
                opacity: isCentered ? 1.0 : 0.85,
                transition: "transform 200ms ease-out, opacity 200ms ease-out",
                willChange: "transform, opacity",
              }}
            >
              <a
                href={cat.href || "#catalog"}
                className="block w-full group/tile text-center"
              >
                <div 
                  className={`w-full aspect-[4/5] bg-slate-100 border border-slate-200/80 overflow-hidden shadow-md transition-transform duration-300 group-hover/tile:scale-102 ${
                    itemShape === "circle" ? "rounded-full aspect-square" : "rounded-2xl sm:rounded-3xl"
                  }`}
                >
                  <img
                    src={imgSrc}
                    alt={label}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    loading="lazy"
                  />
                </div>
                <span className="block mt-2.5 text-xs font-extrabold uppercase tracking-wide text-[var(--color-text,#0f172a)] group-hover/tile:text-[var(--color-primary,#0f172a)] transition-colors truncate">
                  {label}
                </span>
                {count && (
                  <span className="block text-[11px] text-slate-400 font-medium mt-0.5">
                    {count}
                  </span>
                )}
              </a>
            </div>
          );
        })}

        <div className="flex-shrink-0 basis-[30%] sm:basis-[38%] md:basis-[42%]" />
      </div>

    </section>
  );
}
