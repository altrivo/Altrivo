"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Image as ImageIcon } from "lucide-react";

export interface CustomComponentProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl?: string;
  imagePosition?: "right" | "left" | "center" | "background" | "none";
  imageAlignment?: "right" | "left" | "center" | "background" | "none";
  bgTheme?: "slate" | "gold" | "glass" | "black" | "minimal";
  buttonTheme?: "emerald" | "gold" | "white" | "outline";
}

export default function CustomComponent({
  badge,
  title = "Custom Section Title",
  subtitle,
  ctaText,
  ctaLink = "/shop",
  secondaryCtaText,
  secondaryCtaLink = "#story",
  imageUrl,
  imagePosition = "right",
  imageAlignment,
  bgTheme = "slate",
  buttonTheme = "emerald",
}: CustomComponentProps) {
  const effectivePosition = imageAlignment || imagePosition || "right";

  // Theme style classes
  const themeClasses = {
    gold: "bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border-y border-amber-500/30 text-amber-50",
    glass: "bg-slate-900/70 backdrop-blur-xl border-y border-emerald-500/30 text-slate-100",
    black: "bg-black border-y border-slate-800 text-white",
    minimal: "bg-slate-950 border-y border-dashed border-slate-800 text-slate-200",
    slate: "bg-slate-950 border-y border-slate-800 text-slate-100",
  }[bgTheme] || "bg-slate-950 border-y border-slate-800 text-slate-100";

  // Button theme classes
  const primaryBtnClasses = {
    gold: "bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-500/20",
    white: "bg-white text-slate-950 hover:bg-slate-100 shadow-white/10",
    outline: "bg-transparent border border-emerald-400 text-emerald-400 hover:bg-emerald-500/10",
    emerald: "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20",
  }[buttonTheme] || "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20";

  return (
    <section className={`py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden transition-all ${themeClasses}`}>
      {/* Background Photo Overlay Mode */}
      {effectivePosition === "background" && imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        <div
          className={`flex items-center gap-8 sm:gap-12 ${
            effectivePosition === "left"
              ? "flex-col-reverse lg:flex-row-reverse"
              : effectivePosition === "center"
              ? "flex-col text-center"
              : effectivePosition === "background"
              ? "flex-col text-center"
              : "flex-col lg:flex-row"
          }`}
        >
          {/* Text & Content Block */}
          <div className="flex-1 space-y-4 max-w-2xl min-w-0">
            {badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3 h-3" />
                <span>{badge}</span>
              </span>
            )}

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {title}
            </h2>

            {subtitle && (
              <p className="text-base sm:text-lg opacity-85 leading-relaxed font-normal">
                {subtitle}
              </p>
            )}

            {/* Action Buttons */}
            {(ctaText || secondaryCtaText) && (
              <div
                className={`flex flex-wrap items-center gap-3.5 pt-3 ${
                  effectivePosition === "center" || effectivePosition === "background"
                    ? "justify-center"
                    : "justify-start"
                }`}
              >
                {ctaText && (
                  <Link
                    href={ctaLink || "/shop"}
                    className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-all active:scale-95 ${primaryBtnClasses}`}
                  >
                    <span>{ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                {secondaryCtaText && (
                  <Link
                    href={secondaryCtaLink || "#story"}
                    className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold transition-all"
                  >
                    <span>{secondaryCtaText}</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Standalone Image Block */}
          {effectivePosition !== "none" && effectivePosition !== "background" && (
            <div className="flex-1 w-full max-w-lg lg:max-w-none flex items-center justify-center">
              <div className="w-full aspect-[4/3] rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl relative group">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={title || "Custom Component Image"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                    <ImageIcon className="w-12 h-12 text-slate-700" />
                    <span className="text-xs font-semibold">Custom Component Photo</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
