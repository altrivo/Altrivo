"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export interface BrandStoryProps {
  title: string;
  paragraphs: string[];
  imageUrl: string;
  ctaText?: string;
  ctaHref?: string;
  imageAlignment?: "left" | "right";
}

export default function BrandStory({
  title,
  paragraphs = [],
  imageUrl,
  ctaText,
  ctaHref,
  imageAlignment = "left",
}: BrandStoryProps) {
  const isImageLeft = imageAlignment === "left";

  return (
    <section className="py-10 sm:py-16 select-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
        
        {/* Visual Media Column */}
        <div 
          className={`relative w-full max-w-[280px] sm:max-w-sm md:max-w-md mx-auto lg:max-w-none lg:col-span-5 ${
            isImageLeft ? "lg:order-1" : "lg:order-2"
          }`}
        >
          {/* Decorative Offset Backdrop Accent Panel */}
          <div 
            className={`absolute h-full w-full rounded-3xl -translate-x-3 translate-y-3 sm:-translate-x-6 sm:translate-y-6 z-0`}
            style={{ backgroundColor: "var(--color-secondary, #d97706)", opacity: 0.15 }}
          />

          {/* Main Card Image Frame */}
          <div className="relative z-10 aspect-square overflow-hidden rounded-3xl border border-slate-200/50 bg-white p-2 sm:p-2.5 shadow-lg group">
            <img
              src={imageUrl || "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80"}
              alt={title || "Brand Story"}
              className="h-full w-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>

        {/* Narrative Text Column */}
        <div 
          className={`space-y-4 sm:space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start lg:col-span-7 ${
            isImageLeft ? "lg:order-2" : "lg:order-1"
          }`}
        >
          <div className="space-y-1.5 sm:space-y-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400">Our Heritage & Mission</span>
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--color-text,#1e293b)]"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              {title}
            </h2>
          </div>

          {/* Story Paragraphs */}
          <div className="space-y-3 sm:space-y-4 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed">
            {paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* CTA Link Trigger */}
          {ctaText && ctaHref && (
            <div className="pt-2 sm:pt-4 w-full sm:w-auto">
              <a
                href={ctaHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-extrabold tracking-wide text-white shadow-md transition-all duration-300 active:scale-95"
                style={{ 
                  backgroundColor: "var(--color-primary, #0f172a)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.1)";
                  e.currentTarget.style.boxShadow = "0 0 20px var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span>{ctaText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
