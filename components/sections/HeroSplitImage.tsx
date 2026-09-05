"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export interface HeroSplitImageProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl: string;
  imageAlignment?: "left" | "right";
}

export default function HeroSplitImage({
  title,
  subtitle,
  ctaText = "Shop Collection",
  ctaLink = "#catalog",
  imageUrl,
  imageAlignment = "right",
}: HeroSplitImageProps) {
  const isImageRight = imageAlignment === "right";

  return (
    <section className="relative overflow-hidden select-none py-10 sm:py-16 lg:py-24 bg-[var(--color-bg,#ffffff)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
        
        {/* Text Area Column */}
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
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-base md:text-lg text-slate-500 max-w-lg leading-relaxed mx-auto lg:mx-0">
                {subtitle}
              </p>
            )}
          </div>

          {/* Action Call to Action Button */}
          {ctaText && ctaLink && (
            <div className="pt-2 w-full sm:w-auto">
              <a
                href={ctaLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-xs font-extrabold tracking-widest uppercase text-white shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
                style={{ 
                  backgroundColor: "var(--color-primary, #0f172a)",
                }}
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
            </div>
          )}
        </div>

        {/* Media Image Column */}
        <div 
          className={`relative w-full max-w-[280px] sm:max-w-sm md:max-w-md mx-auto lg:max-w-none lg:col-span-5 ${
            isImageRight ? "lg:order-2" : "lg:order-1"
          }`}
        >
          {/* Asymmetric offset backdrop decoration block */}
          <div 
            className="absolute inset-0 rounded-3xl translate-x-3 -translate-y-3 sm:translate-x-6 sm:-translate-y-6 z-0"
            style={{ backgroundColor: "var(--color-secondary, #d97706)", opacity: 0.15 }}
          />

          <div className="relative z-10 aspect-square overflow-hidden rounded-3xl border border-slate-200/50 bg-slate-50 p-2 sm:p-2.5 shadow-xl group">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
              loading="eager"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
