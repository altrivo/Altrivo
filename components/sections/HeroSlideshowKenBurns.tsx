"use client";

import React, { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface SlideshowImage {
  src: string;
  alt: string;
  focalPoint?: string; // e.g. "30% 50%" for off-center crops
}

export interface HeroSlideshowProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  images: SlideshowImage[];
}

export default function HeroSlideshowKenBurns({
  title,
  subtitle,
  ctaText = "Shop Collection",
  ctaLink = "#catalog",
  images = [],
}: HeroSlideshowProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const durationMs = 6000;

  // 1. Preloading Image Buffer Queue
  useEffect(() => {
    if (images.length <= 1) return;

    const preloadImage = (idx: number) => {
      const targetIndex = (idx + images.length) % images.length;
      if (typeof window !== "undefined") {
        const img = new Image();
        img.src = images[targetIndex].src;
      }
    };

    // Preload next image immediately on mount
    preloadImage(activeIndex + 1);

    // Buffer upcoming image (index + 2) in advance
    preloadImage(activeIndex + 2);
  }, [activeIndex, images]);

  // 2. RequestAnimationFrame Auto-advance Progress Loop with Pause triggers
  useEffect(() => {
    if (images.length <= 1 || shouldReduceMotion) return;

    const handleVisibility = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    let animationId: number;
    let startTime = performance.now();
    let accumulated = 0;

    const tick = (now: number) => {
      if (isPaused) {
        // Adjust start coordinate so progress doesn't jump forward when resuming
        startTime = now - accumulated;
        animationId = requestAnimationFrame(tick);
        return;
      }

      accumulated = now - startTime;
      const pct = Math.min((accumulated / durationMs) * 100, 100);
      setProgress(pct);

      if (accumulated >= durationMs) {
        setActiveIndex((prev) => (prev + 1) % images.length);
        setProgress(0);
        startTime = now;
        accumulated = 0;
      }

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      cancelAnimationFrame(animationId);
    };
  }, [activeIndex, isPaused, images.length, shouldReduceMotion]);

  if (!images || images.length === 0) return null;

  const isSingleImage = images.length === 1;

  // Calculates slow Ken Burns scale & pan transitions per image index
  const getKenBurnsStyle = (idx: number) => {
    if (shouldReduceMotion || isSingleImage) return {};

    const isActive = activeIndex === idx;
    const isEven = idx % 2 === 0;

    // Alternating zoom-in vs zoom-out focal origins
    const transformOrigin = idx % 3 === 0 ? "60% 40%" : idx % 3 === 1 ? "40% 60%" : "50% 50%";

    // Stable randomized translate vectors per index
    const panX = idx % 2 === 0 ? "-1.5%" : "1.5%";
    const panY = idx % 3 === 0 ? "1%" : "-1%";

    return {
      transformOrigin,
      transform: isActive
        ? `scale(${isEven ? 1.08 : 1.0}) translate(${panX}, ${panY})`
        : `scale(${isEven ? 1.0 : 1.08}) translate(0px, 0px)`,
      transition: isActive
        ? "transform 6000ms linear, opacity 1150ms ease-in-out"
        : "opacity 1150ms ease-in-out",
    };
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="relative w-full aspect-[16/9] md:aspect-[21/9] min-h-[460px] bg-slate-950 overflow-hidden flex items-center select-none"
    >
      
      {/* 1. Images stack absolute layers */}
      <div className="absolute inset-0 z-0">
        {images.map((img, idx) => {
          const isActive = activeIndex === idx;
          const isPrev = (activeIndex - 1 + images.length) % images.length === idx;

          return (
            <div
              key={idx}
              style={{
                // Stays visible underneath while the incoming slide fades in over it
                opacity: isActive ? 1 : isPrev ? 1 : 0,
                zIndex: isActive ? 2 : isPrev ? 1 : 0,
                ...getKenBurnsStyle(idx),
              }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={img.src}
                alt={img.alt}
                style={{
                  objectPosition: img.focalPoint || "50% 50%",
                }}
                className="w-full h-full object-cover"
                loading={idx === 0 ? "eager" : "lazy"}
                aria-hidden={isActive ? "false" : "true"}
              />
            </div>
          );
        })}
        {/* Soft atmospheric overlay */}
        <div className="absolute inset-0 bg-slate-950/45 z-10 pointer-events-none" />
      </div>

      {/* 2. Foreground content overlay */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 sm:px-12 w-full text-center md:text-left text-white space-y-6">
        <div className="space-y-3 max-w-xl">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-bold">
              {subtitle}
            </p>
          )}
        </div>

        <div className="pt-1">
          <a
            href={ctaLink}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-950 hover:bg-slate-50 active:scale-95 text-[10px] font-black uppercase tracking-widest transition-all duration-150 border border-white"
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* 3. Progress Tracking Indicators */}
      {!isSingleImage && !shouldReduceMotion && (
        <div className="absolute bottom-6 left-6 right-6 z-30 flex items-center justify-between pointer-events-none">
          {/* Progress dots row */}
          <div className="flex gap-2.5 pointer-events-auto">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveIndex(idx);
                  setProgress(0);
                }}
                className={`h-1.5 rounded-full transition-all duration-350 cursor-pointer ${
                  activeIndex === idx ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Show slide index ${idx + 1}`}
              />
            ))}
          </div>

          {/* Thin progress timer bar */}
          <div className="w-24 h-[2px] bg-white/20 rounded-full overflow-hidden hidden sm:block">
            <div
              style={{
                width: `${progress}%`,
                // Reset instantly on slide change
                transition: progress === 0 ? "none" : "width 60ms linear",
              }}
              className="h-full bg-white origin-left"
            />
          </div>
        </div>
      )}

    </section>
  );
}
