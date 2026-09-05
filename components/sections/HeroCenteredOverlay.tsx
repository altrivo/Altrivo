"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export interface HeroCenteredOverlayProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImageUrl: string;
  overlayOpacity?: number; // E.g., 0.4
}

export default function HeroCenteredOverlay({
  title,
  subtitle,
  ctaText = "Explore Collection",
  ctaLink = "#catalog",
  backgroundImageUrl,
  overlayOpacity = 0.4,
}: HeroCenteredOverlayProps) {
  return (
    <section className="relative overflow-hidden select-none w-full h-[70vh] sm:h-[80vh] flex items-center justify-center bg-slate-900 text-white">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 transform hover:scale-102"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />

      {/* Dark overlay with configurable opacity values */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />

      {/* Gradient Vignette for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35 z-0" />

      {/* Content Panel (centered) */}
      <div className="relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-3">
          <h1 
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-slate-200 max-w-lg mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action button triggers */}
        {ctaText && ctaLink && (
          <div className="pt-2">
            <a
              href={ctaLink}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-extrabold tracking-widest uppercase border border-white hover:bg-white hover:text-slate-900 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
