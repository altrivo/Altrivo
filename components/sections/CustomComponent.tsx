"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Image as ImageIcon } from "lucide-react";

export interface CustomComponentProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl?: string;
  heroImage?: string;
  imagePosition?: "right" | "left" | "center" | "background" | "none";
  imageAlignment?: "right" | "left" | "center" | "background" | "none";
  imageAspect?: "portrait" | "square" | "landscape" | "tall" | "wide";
  bgTheme?: "slate" | "gold" | "glass" | "black" | "minimal" | "white" | "light";
  backgroundColor?: string;
  buttonTheme?: "purple" | "emerald" | "gold" | "white" | "outline";
}

const aspectClasses: Record<string, string> = {
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  landscape: "aspect-[16/9]",
  tall: "aspect-[3/4]",
  wide: "aspect-[21/9]",
};

export default function CustomComponent({
  badge,
  title = "Custom Section Title",
  subtitle,
  ctaText,
  ctaLink = "#products",
  secondaryCtaText,
  secondaryCtaLink = "#story",
  imageUrl,
  heroImage,
  imagePosition = "right",
  imageAlignment,
  imageAspect = "landscape",
  bgTheme = "slate",
  backgroundColor,
  buttonTheme = "purple",
}: CustomComponentProps) {
  const effectivePosition = imageAlignment || imagePosition || "right";
  const effectiveImg = imageUrl || heroImage;
  const currentAspect = aspectClasses[imageAspect] || "aspect-[16/9]";

  // Theme style classes
  const themeClasses =
    {
      gold: "bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border-y border-amber-500/30 text-amber-50",
      glass: "bg-slate-900/70 backdrop-blur-xl border-y border-emerald-500/30 text-slate-100",
      black: "bg-black border-y border-slate-800 text-white",
      minimal: "bg-slate-950 border-y border-dashed border-slate-800 text-slate-200",
      white: "bg-white border-y border-slate-200 text-slate-900",
      light: "bg-slate-50 border-y border-slate-200 text-slate-800",
      slate: "bg-slate-950 border-y border-slate-800 text-slate-100",
    }[bgTheme] || "bg-slate-950 border-y border-slate-800 text-slate-100";

  // Button theme classes
  const primaryBtnClasses =
    {
      gold: "bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-500/20",
      white: "bg-white text-slate-950 hover:bg-slate-100 shadow-white/10",
      outline: "bg-transparent border border-emerald-400 text-emerald-400 hover:bg-emerald-500/10",
      purple: "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20",
      emerald: "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20",
    }[buttonTheme] || "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20";

  const isLightMode = bgTheme === "white" || bgTheme === "light" || (backgroundColor && (backgroundColor.toLowerCase() === "#ffffff" || backgroundColor.toLowerCase() === "#fff" || backgroundColor.toLowerCase() === "white"));

  return (
    <section
      className={`py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden transition-all ${isLightMode ? "text-slate-900" : ""} ${themeClasses}`}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      {/* Background Photo Overlay Mode */}
      {effectivePosition === "background" && effectiveImg && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url(${effectiveImg})` }}
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
          <div className={`flex-1 space-y-4 max-w-2xl min-w-0 ${effectivePosition === "center" || effectivePosition === "background" ? "mx-auto" : ""}`}>
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
                    href={ctaLink || "#products"}
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
            <div className={`flex-1 w-full ${effectivePosition === "center" ? "max-w-3xl mx-auto" : "max-w-lg lg:max-w-none"} flex items-center justify-center`}>
              <div className={`w-full ${currentAspect} rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl relative group`}>
                {effectiveImg ? (
                  <img
                    src={effectiveImg}
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
