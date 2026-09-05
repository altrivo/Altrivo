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

export default function CategoryCarouselDrag({
  title = "Shop by Category",
  categories = [],
  itemShape = "card",
}: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const hasDragged = useRef(false);

  // Detect touch interface
  useEffect(() => {
    const media = window.matchMedia("(hover: hover)");
    setIsTouchDevice(!media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setIsTouchDevice(!e.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

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

  // Desktop Mouse Grab dragging handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    const el = scrollRef.current;
    if (!el) return;

    dragStartX.current = e.clientX;
    dragStartScrollLeft.current = el.scrollLeft;
    hasDragged.current = false;

    // Temporarily disable CSS scroll snapping during drag so movements are smooth
    el.style.scrollSnapType = "none";
    el.style.scrollBehavior = "auto";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartX.current;
      if (Math.abs(deltaX) > 5) {
        hasDragged.current = true;
        setIsDragging(true);
        el.scrollLeft = dragStartScrollLeft.current - deltaX;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      
      // Re-enable CSS scroll snapping on release
      el.style.scrollSnapType = "x mandatory";
      el.style.scrollBehavior = "smooth";

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTileClick = (e: React.MouseEvent) => {
    // Block navigation if user was dragging
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleScrollClick = (direction: "prev" | "next") => {
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

      {/* Swipeable Container with drag grab cursor adapters */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        className={`flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory touch-pan-x select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ scrollSnapType: "x mandatory" }}
      >
        {categories.map((cat, idx) => (
          <div
            key={cat.id || idx}
            className="flex-shrink-0 basis-[45%] sm:basis-[28%] md:basis-[22%] snap-start snap-always"
          >
            <a
              href={cat.href || "#"}
              onClick={handleTileClick}
              className="block w-full group/tile pointer-events-auto"
            >
              <div 
                className={`w-full aspect-[4/5] bg-slate-50 border border-slate-100 overflow-hidden transition-all duration-300 ${
                  itemShape === "circle" ? "rounded-full aspect-square" : "rounded-3xl"
                }`}
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover select-none pointer-events-none group-hover/tile:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="block text-center mt-3 text-xs font-black uppercase tracking-wider text-slate-800 group-hover/tile:text-slate-650">
                {cat.name}
              </span>
            </a>
          </div>
        ))}
      </div>

    </section>
  );
}
