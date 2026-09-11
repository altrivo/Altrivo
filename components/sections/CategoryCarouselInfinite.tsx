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

export default function CategoryCarouselInfinite({
  title = "Shop by Category",
  categories = [],
  itemShape = "card",
  layout,
}: CategoryCarouselProps) {
  const effectiveShape = itemShape || (layout as any) || "card";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(true);
  const [canScrollNext, setCanScrollNext] = useState(true);

  // Generate dynamic clones (3 tiles from start and end)
  const clonesCount = 3;
  const clonedStart = categories.slice(-clonesCount);
  const clonedEnd = categories.slice(0, clonesCount);
  const totalList = [...clonedStart, ...categories, ...clonedEnd];

  const isInitiated = useRef(false);

  // Initial jump to actual starting item index (skipping prepend clones)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || categories.length === 0) return;

    // Wait until items are rendered and jump to index 3
    const startItem = el.children[clonesCount] as HTMLElement;
    if (startItem) {
      el.style.scrollBehavior = "auto";
      el.scrollLeft = startItem.offsetLeft - 24; // offset account for gap
      isInitiated.current = true;
    }
  }, [categories]);

  // Silent boundary jumps triggered on scroll boundary crossing
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || !isInitiated.current || categories.length === 0) return;

    const { scrollLeft, scrollWidth } = el;
    const itemWidth = scrollWidth / totalList.length;

    // Define boundary indices (where clones begin/end)
    const leftLimit = itemWidth * clonesCount - 40;
    const rightLimit = scrollWidth - el.clientWidth - itemWidth * clonesCount + 40;

    if (scrollLeft < leftLimit) {
      // Silent forward jump
      el.style.scrollSnapType = "none";
      el.style.scrollBehavior = "auto";
      el.scrollLeft = scrollLeft + itemWidth * categories.length;
      el.style.scrollSnapType = "x mandatory";
      el.style.scrollBehavior = "smooth";
    } else if (scrollLeft > rightLimit) {
      // Silent backward jump
      el.style.scrollSnapType = "none";
      el.style.scrollBehavior = "auto";
      el.scrollLeft = scrollLeft - itemWidth * categories.length;
      el.style.scrollSnapType = "x mandatory";
      el.style.scrollBehavior = "smooth";
    }
  };

  const handleScrollClick = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;

    const pageWidth = el.clientWidth;
    const overlap = 80;
    const offset = direction === "prev" ? -(pageWidth - overlap) : (pageWidth - overlap);

    el.style.scrollBehavior = "smooth";
    el.scrollBy({ left: offset });
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
            className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs transition-all duration-200 active:scale-90 text-slate-800 hover:bg-slate-50 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleScrollClick("next")}
            disabled={!canScrollNext}
            className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs transition-all duration-200 active:scale-90 text-slate-800 hover:bg-slate-50 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Swipeable Snap container with scroll jump triggers */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory touch-pan-x"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {totalList.map((cat: any, idx: number) => {
          // Detect if this specific item is a clone
          const isClone = idx < clonesCount || idx >= totalList.length - clonesCount;
          const key = `${cat.id || cat.title || cat.name || 'cat-inf'}-${idx}`;
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
                  className={`w-full aspect-[4/5] bg-slate-50 border border-slate-100 overflow-hidden transition-all duration-300 ${
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
                  {label} {isClone && <span className="text-[8px] text-slate-300 font-bold">(Clone)</span>}
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

    </section>
  );
}
