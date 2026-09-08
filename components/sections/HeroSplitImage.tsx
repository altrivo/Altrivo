"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export interface HeroSplitImageProps {
  title?: string;
  subtitle?: string;
  headline?: string;
  subline?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl?: string;
  heroImage?: string;
  imageAlignment?: "left" | "right" | "center" | "background" | "none";
  imagePosition?: "left" | "right" | "center" | "background" | "none";
  imageAspect?: "portrait" | "square" | "landscape" | "tall" | "wide";
  storeSlug?: string;
}

const aspectClasses: Record<string, string> = {
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  landscape: "aspect-[16/9]",
  tall: "aspect-[3/4]",
  wide: "aspect-[21/9]",
};

export default function HeroSplitImage({
  title,
  subtitle,
  headline,
  subline,
  ctaText = "Shop Collection",
  ctaLink = "#catalog",
  secondaryCtaText,
  secondaryCtaLink,
  imageUrl,
  heroImage,
  imageAlignment,
  imagePosition,
  imageAspect = "square",
}: HeroSplitImageProps) {
  const displayTitle = title || headline || "Exclusive Collection";
  const displaySubtitle = subtitle || subline;
  const effectiveImg = imageUrl || heroImage;
  const position = (imagePosition || imageAlignment || "right").toLowerCase();
  const currentAspect = aspectClasses[imageAspect] || "aspect-square";

  // 1. Position: NONE (Text Only Showcase)
  if (position === "none" || !effectiveImg) {
    return (
      <section className="relative overflow-hidden select-none py-14 sm:py-20 lg:py-28 bg-[var(--color-bg,#ffffff)] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6 max-w-3xl mx-auto">
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[var(--color-text,#1e293b)] leading-[1.1]"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {displayTitle}
          </h1>
          {displaySubtitle && (
            <p className="text-base sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              {displaySubtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {ctaText && ctaLink && (
              <a
                href={ctaLink}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-xs font-extrabold tracking-widest uppercase text-white shadow-lg transition-all duration-300 active:scale-95 cursor-pointer"
                style={{ backgroundColor: "var(--color-primary, #0f172a)" }}
              >
                <span>{ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            )}
            {secondaryCtaText && (
              <a
                href={secondaryCtaLink || "#about"}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all"
              >
                <span>{secondaryCtaText}</span>
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // 2. Position: BACKGROUND (Full Photo Hero Overlay)
  if (position === "background") {
    return (
      <section className="relative overflow-hidden select-none min-h-[520px] sm:min-h-[600px] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img
            src={effectiveImg}
            alt={displayTitle}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/65 to-slate-950/40 backdrop-blur-[1px]" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6 text-white">

          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] drop-shadow-md text-white"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {displayTitle}
          </h1>

          {displaySubtitle && (
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-medium">
              {displaySubtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {ctaText && ctaLink && (
              <a
                href={ctaLink}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-xs font-extrabold tracking-widest uppercase bg-white text-slate-950 hover:bg-slate-100 shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <span>{ctaText}</span>
                <ArrowRight className="h-4 w-4 text-slate-950" />
              </a>
            )}
            {secondaryCtaText && (
              <a
                href={secondaryCtaLink || "#about"}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/25 transition-all"
              >
                <span>{secondaryCtaText}</span>
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // 3. Position: CENTER (Centered Text with Centered Hero Image below)
  if (position === "center") {
    return (
      <section className="relative overflow-hidden select-none py-12 sm:py-18 lg:py-24 bg-[var(--color-bg,#ffffff)] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 text-center">
          {/* Top Centered Text Block */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[var(--color-text,#1e293b)] leading-[1.1]"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              {displayTitle}
            </h1>
            {displaySubtitle && (
              <p className="text-xs sm:text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                {displaySubtitle}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {ctaText && ctaLink && (
                <a
                  href={ctaLink}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-2xl text-xs font-extrabold tracking-widest uppercase text-white shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: "var(--color-primary, #0f172a)" }}
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
              {secondaryCtaText && (
                <a
                  href={secondaryCtaLink || "#about"}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <span>{secondaryCtaText}</span>
                </a>
              )}
            </div>
          </div>

          {/* Centered Image Showcase Container */}
          <div className="relative max-w-4xl mx-auto">
            <div
              className="absolute inset-0 rounded-3xl translate-y-3 sm:translate-y-5 z-0 blur-md opacity-25"
              style={{ backgroundColor: "var(--color-secondary, #d97706)" }}
            />
            <div className={`relative z-10 w-full ${currentAspect} overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50 p-2 sm:p-3 shadow-xl group`}>
              <img
                src={effectiveImg}
                alt={displayTitle}
                className="h-full w-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 4. Default: Split Columns (Right or Left Position)
  const isImageRight = position !== "left";

  return (
    <section className="relative overflow-hidden select-none py-10 sm:py-16 lg:py-24 bg-[var(--color-bg,#ffffff)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
        {/* Text Column */}
        <div
          className={`space-y-4 sm:space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start lg:col-span-7 ${
            isImageRight ? "lg:order-1" : "lg:order-2"
          }`}
        >
          <div className="space-y-2 sm:space-y-3">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[var(--color-text,#1e293b)] leading-[1.1]"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              {displayTitle}
            </h1>
            {displaySubtitle && (
              <p className="text-xs sm:text-base md:text-lg text-slate-500 max-w-lg leading-relaxed mx-auto lg:mx-0">
                {displaySubtitle}
              </p>
            )}
          </div>

          {/* Action Call to Action Button */}
          <div className="pt-2 w-full sm:w-auto flex flex-wrap items-center justify-center lg:justify-start gap-3">
            {ctaText && ctaLink && (
              <a
                href={ctaLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-xs font-extrabold tracking-widest uppercase text-white shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
                style={{ backgroundColor: "var(--color-primary, #0f172a)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.1)";
                  e.currentTarget.style.boxShadow = "0 0 25px var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span>{ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            )}

            {secondaryCtaText && (
              <a
                href={secondaryCtaLink || "#about"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <span>{secondaryCtaText}</span>
              </a>
            )}
          </div>
        </div>

        {/* Media Image Column */}
        <div
          className={`relative w-full max-w-[340px] sm:max-w-md md:max-w-lg mx-auto lg:max-w-none lg:col-span-5 ${
            isImageRight ? "lg:order-2" : "lg:order-1"
          }`}
        >
          {/* Asymmetric offset backdrop decoration block */}
          <div
            className="absolute inset-0 rounded-3xl translate-x-3 -translate-y-3 sm:translate-x-6 sm:-translate-y-6 z-0"
            style={{ backgroundColor: "var(--color-secondary, #d97706)", opacity: 0.15 }}
          />

          <div className={`relative z-10 ${currentAspect} overflow-hidden rounded-3xl border border-slate-200/50 bg-slate-50 p-2 sm:p-2.5 shadow-xl group`}>
            <img
              src={effectiveImg}
              alt={displayTitle}
              className="h-full w-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
