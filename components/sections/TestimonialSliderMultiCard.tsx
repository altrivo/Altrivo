"use client";

import React, { useState, useEffect, useRef } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

export interface TestimonialItem {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatarUrl?: string;
  role?: string;
}

export interface TestimonialSliderProps {
  title?: string;
  testimonials: TestimonialItem[];
}

export default function TestimonialSliderMultiCard({
  title = "What Our Collectors Say",
  testimonials = [],
}: TestimonialSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  // Real-time dot calculations as drag crosses halfway slide boundary points
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || testimonials.length === 0) return;

    const { scrollLeft, clientWidth, scrollWidth } = el;
    
    // Calculate page boundaries
    setCanScrollPrev(scrollLeft > 2);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 2);

    // Active dot updates as scroll passes halfway item marks
    const firstChild = el.children[0] as HTMLElement;
    const itemWidth = firstChild ? firstChild.getBoundingClientRect().width + 24 : clientWidth / 2;
    const index = Math.round(scrollLeft / itemWidth);

    setActiveDot(Math.min(Math.max(index, 0), testimonials.length - 1));
  };

  const handleScrollClick = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;

    const pageWidth = el.clientWidth;
    const overlap = 80;
    const offset = direction === "prev" ? -(pageWidth - overlap) : (pageWidth - overlap);

    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleDotClick = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;

    const items = el.children;
    if (items[index]) {
      items[index].scrollIntoView({ behavior: "smooth", inline: "start" });
    }
  };

  // Setup scroll listener
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", handleScroll, { passive: true });
    // Initialize states
    handleScroll();

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [testimonials]);

  // Initials initials helper
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <section className="py-12 select-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative group/carousel">
      {/* Header Info */}
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

      {/* Swipeable grid cards container with custom basis peeking */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory touch-pan-x"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {testimonials.map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex-shrink-0 basis-[85%] sm:basis-[45%] lg:basis-[31%] snap-start snap-always"
          >
            {/* Fixed-height container to avoid vertical content jumps */}
            <div className="h-[240px] flex flex-col justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-3xl relative overflow-hidden">
              {/* Top Accent Quote Mark */}
              <div className="absolute top-4 right-4 text-slate-100 pointer-events-none">
                <Quote className="h-10 w-10 fill-slate-100/50" />
              </div>

              {/* Ratings and review text */}
              <div className="space-y-4 relative z-10">
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < item.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Line clamp limits height jumping */}
                <p className="text-xs font-bold text-slate-650 leading-relaxed line-clamp-4">
                  "{item.text}"
                </p>
              </div>

              {/* Attribution details */}
              <div className="flex items-center gap-3 relative z-10 pt-2 border-t border-slate-100/80">
                {item.avatarUrl ? (
                  <img
                    src={item.avatarUrl}
                    alt={item.name}
                    className="h-9 w-9 rounded-full object-cover border border-slate-200 bg-white"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-[var(--color-primary,#694873)] text-white font-black text-[10px] flex items-center justify-center uppercase border border-slate-200">
                    {getInitials(item.name)}
                  </div>
                )}
                <div className="leading-tight">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-800">
                    {item.name}
                  </span>
                  {item.role && (
                    <span className="text-[9px] font-bold text-slate-400">
                      {item.role}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Synchronized Index Indicators */}
      <div className="flex justify-center gap-2 pt-2">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              activeDot === idx ? "w-4 bg-slate-900" : "w-1.5 bg-slate-200 hover:bg-slate-350"
            }`}
            aria-label={`Scroll to slide index ${idx + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
