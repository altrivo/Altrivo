"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export interface HeroMarqueeProps {
  headline: string;
  subtext?: string;
  ctaText?: string;
  ctaHref?: string;
  marqueeItems?: string[]; // Scrolling words/phrases
  bgColor?: string; // Solid theme color or CSS variable
}

const DEFAULT_ITEMS = [
  "100% Hand-Fired Clay",
  "Free Nationwide Delivery",
  "Heritage Vetted Potters",
  "Lead-Free Glazing",
  "Custom Commissions Open",
  "Artisan Vouched",
];

export default function HeroMarquee({
  headline,
  subtext,
  ctaText = "Shop Store",
  ctaHref = "#catalog",
  marqueeItems = DEFAULT_ITEMS,
  bgColor = "#ffffff",
}: HeroMarqueeProps) {

  // Safeguard: Make sure we have items
  const itemsList = marqueeItems.length > 0 ? marqueeItems : DEFAULT_ITEMS;

  return (
    <section
      className="relative w-full pt-16 pb-12 overflow-hidden select-none border-b border-slate-100 flex flex-col items-center justify-between"
      style={{ backgroundColor: bgColor }}
    >
      {/* Self-contained CSS Marquee keyframes injector */}
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-inner-scroll {
          display: flex;
          width: max-content;
          animation: marquee-scroll 24s linear infinite;
        }
        .marquee-inner-scroll:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-inner-scroll {
            animation: none !important;
            transform: none !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* Main Copy Section (Top) */}
      <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-6 mb-12">
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight"
          style={{ fontFamily: "var(--font-heading, inherit)" }}
        >
          {headline}
        </h1>

        {subtext && (
          <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
            {subtext}
          </p>
        )}

        {ctaText && ctaHref && (
          <div className="pt-2">
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-extrabold tracking-widest uppercase text-white shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
              style={{ backgroundColor: "var(--color-primary, #0f172a)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "none";
              }}
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>

      {/* Horizontal Scrolling Marquee Band (Bottom) */}
      <div className="w-full border-t border-b border-slate-100 bg-slate-50/50 py-4 overflow-hidden relative">
        <div className="marquee-inner-scroll gap-12">
          {/* Render list first time */}
          {itemsList.map((item, idx) => (
            <div
              key={`first-${idx}`}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 select-none whitespace-nowrap"
            >
              <span>{item}</span>
              <span className="text-slate-200 ml-12">•</span>
            </div>
          ))}

          {/* Render list second time for seamless duplicate loops */}
          {itemsList.map((item, idx) => (
            <div
              key={`second-${idx}`}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 select-none whitespace-nowrap"
            >
              <span>{item}</span>
              <span className="text-slate-200 ml-12">•</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
