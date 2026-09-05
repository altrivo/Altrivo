"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, Variants } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

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

export default function TestimonialSliderCrossfade({
  title = "What Our Customers Say",
  testimonials = [],
}: TestimonialSliderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isManual, setIsManual] = useState(false);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);
  const interactionTimer = useRef<NodeJS.Timeout | null>(null);

  // Helper: Get name initials for missing avatar placeholders
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleManualAction = (action: () => void) => {
    setIsManual(true);
    action();
    
    // Stop autoplay
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
    if (interactionTimer.current) {
      clearTimeout(interactionTimer.current);
    }
    
    // Resume autoplay after 6s idle
    interactionTimer.current = setTimeout(() => {
      setIsManual(false);
    }, 6000);
  };

  // Start Autoplay (Generous 6s interval)
  useEffect(() => {
    if (isManual || testimonials.length === 0) return;

    autoplayTimer.current = setInterval(() => {
      handleNext();
    }, 6000);

    return () => {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current);
      }
    };
  }, [isManual, testimonials]);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const active = testimonials[activeIndex];

  // Framer Motion Staggered Star Rating Variants
  const starContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.07 }
    }
  };

  const starItemVariants: Variants = {
    hidden: { scale: shouldReduceMotion ? 1 : 0, opacity: 0 },
    show: { 
      scale: 1, 
      opacity: 1, 
      transition: { type: "spring" as const, stiffness: 350, damping: 18 } 
    }
  };

  return (
    <section className="py-16 select-none bg-[var(--color-bg,#ffffff)] text-slate-800 border-b border-slate-100 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Section Header */}
      {title && (
        <div className="text-center">
          <h2 
            className="text-2xl font-black tracking-tight"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {title}
          </h2>
        </div>
      )}

      {/* Main Height-Matched Layout Wrapper */}
      <motion.div
        layout
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative border border-slate-100 bg-slate-50/50 rounded-3xl p-6 sm:p-10 shadow-xs overflow-hidden"
      >
        {/* Large Decorative Quotation Mark in background */}
        <div className="absolute top-6 left-6 text-slate-200/50 pointer-events-none z-0 select-none">
          <Quote className="h-16 w-16 rotate-180 fill-slate-100/40" />
        </div>

        {/* Aria polite announcement region (active only during autoplay) */}
        <div 
          aria-live={isManual ? "off" : "polite"} 
          className="relative z-10 flex flex-col items-center text-center space-y-6"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }} // 300ms crossfade
              className="w-full flex flex-col items-center space-y-5"
            >
              
              {/* 1. Staggered Star Ratings */}
              <motion.div
                variants={starContainerVariants}
                initial="hidden"
                animate="show"
                className="flex gap-1"
              >
                {[...Array(5)].map((_, i) => {
                  const isFilled = i < active.rating;
                  return (
                    <motion.div 
                      key={i} 
                      variants={starItemVariants}
                    >
                      <Star
                        className={`h-4.5 w-4.5 ${
                          isFilled ? "fill-amber-400 text-amber-400" : "text-slate-200"
                        }`}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* 2. Synced Quote Text */}
              <blockquote className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed max-w-2xl">
                "{active.text}"
              </blockquote>

              {/* 3. Synced Avatar Attribution Block */}
              <div className="flex items-center gap-3">
                {/* Image Avatar or Initials placeholder */}
                {active.avatarUrl ? (
                  <img
                    src={active.avatarUrl}
                    alt={active.name}
                    className="h-11 w-11 rounded-full object-cover border border-slate-200 bg-slate-50"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-[var(--color-primary,#694873)] text-white font-black text-xs flex items-center justify-center uppercase border border-slate-200">
                    {getInitials(active.name)}
                  </div>
                )}

                <div className="text-left leading-tight">
                  <cite className="block text-xs font-black text-slate-800 not-italic uppercase tracking-wider">
                    {active.name}
                  </cite>
                  {active.role && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {active.role}
                    </span>
                  )}
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Controls */}
        <div className="absolute inset-y-0 left-3 right-3 flex items-center justify-between pointer-events-none">
          <button
            onClick={() => handleManualAction(handlePrev)}
            className="p-2.5 rounded-full border border-slate-100 bg-white/90 backdrop-blur-xs shadow-xs text-slate-700 hover:bg-white active:scale-90 transition-all duration-150 cursor-pointer pointer-events-auto"
            aria-label="Previous quote"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleManualAction(handleNext)}
            className="p-2.5 rounded-full border border-slate-100 bg-white/90 backdrop-blur-xs shadow-xs text-slate-700 hover:bg-white active:scale-90 transition-all duration-150 cursor-pointer pointer-events-auto"
            aria-label="Next quote"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

      </motion.div>

      {/* Slide Navigation Index Dots */}
      <div className="flex justify-center gap-2">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleManualAction(() => setActiveIndex(idx))}
            className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              activeIndex === idx ? "w-4 bg-slate-900" : "w-1.5 bg-slate-200 hover:bg-slate-350"
            }`}
            aria-label={`Scroll to quote slide index ${idx + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
