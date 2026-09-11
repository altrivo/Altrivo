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

export default function CategoryCarouselAutoplay({
  title = "Shop by Category",
  categories = [],
  itemShape = "card",
  layout,
}: CategoryCarouselProps) {
  const effectiveShape = itemShape || (layout as any) || "card";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);
  const interactionTimer = useRef<NodeJS.Timeout | null>(null);

  // Setup loop
  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el || categories.length === 0) return;

      const firstItem = el.children[0] as HTMLElement;
      const itemWidth = firstItem ? firstItem.getBoundingClientRect().width + 24 : el.clientWidth / 4; // width + gap

      // Wrap back to beginning if reaching end bounds
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: itemWidth, behavior: "smooth" });
      }
    }, 3500); // Scroll 1 tile every 3.5 seconds
  };

  const stopAutoplay = () => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
  };

  // Immediate halt on client touch, scroll, or cursor clicks
  const handleUserInteraction = () => {
    stopAutoplay();

    if (interactionTimer.current) {
      clearTimeout(interactionTimer.current);
    }

    // Idle cooldown of 5s before resuming autoplay loops
    interactionTimer.current = setTimeout(() => {
      startAutoplay();
    }, 5000);
  };

  useEffect(() => {
    startAutoplay();
    return () => {
      stopAutoplay();
      if (interactionTimer.current) clearTimeout(interactionTimer.current);
    };
  }, [categories]);

  const updateScrollStates = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, clientWidth, scrollWidth } = el;
    setCanScrollPrev(scrollLeft > 2);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 2);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollStates, { passive: true });
    updateScrollStates();
    return () => el.removeEventListener("scroll", updateScrollStates);
  }, [categories]);

  const handleScrollClick = (direction: "prev" | "next") => {
    handleUserInteraction();
    const el = scrollRef.current;
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

      {/* Container tracking all pointer and scroll actions to freeze active scrolls */}
      <div
        ref={scrollRef}
        onScroll={handleUserInteraction}
        onMouseDown={handleUserInteraction}
        onTouchStart={handleUserInteraction}
        className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory touch-pan-x"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {categories.map((cat: any, idx: number) => {
          const key = cat.id || cat.title || cat.name || `cat-auto-${idx}`;
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

    </section>
  );
}
