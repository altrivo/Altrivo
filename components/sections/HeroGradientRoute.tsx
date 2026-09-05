"use client";

import React, { useState, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface HeroGradientProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  colors?: string[];
}

const PALETTES = {
  sunset: ["#ea580c", "#db2777", "#4f46e5"], // Sunset Orange & Purple
  indigo: ["#1e1b4b", "#311042", "#0f172a"], // Midnight Indigo & Slate
  forest: ["#065f46", "#047857", "#111827"], // Forest Emerald & Grey
};

type PaletteKey = keyof typeof PALETTES;

export default function HeroGradientRoute({
  title,
  subtitle,
  ctaText = "Browse Drops",
  ctaLink = "#catalog",
  colors,
}: HeroGradientProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeKey, setActiveKey] = useState<PaletteKey>("sunset");
  const [localColors, setLocalColors] = useState<string[]>(PALETTES.sunset);

  // If parent passes colors, override default active palette
  useEffect(() => {
    if (colors && colors.length > 0) {
      setLocalColors(colors);
    }
  }, [colors]);

  const handlePaletteShift = (key: PaletteKey) => {
    setActiveKey(key);
    setLocalColors(PALETTES[key]);
  };

  // Perceived Luminance Calculator
  const getLuminance = (hex: string) => {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return 0.5;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  const avgLuminance = localColors.reduce((acc, c) => acc + getLuminance(c), 0) / localColors.length;
  const isDarkBackground = avgLuminance < 0.52;

  // Build inline CSS variables mapping
  const gradientVariables = {
    "--gradient-color-1": localColors[0] || "#ea580c",
    "--gradient-color-2": localColors[1] || localColors[0] || "#db2777",
    "--gradient-color-3": localColors[2] || localColors[0] || "#4f46e5",
  } as React.CSSProperties;

  return (
    <section 
      style={gradientVariables}
      className="relative overflow-hidden select-none min-h-[550px] flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-slate-950"
    >
      
      {/* 1. Self-contained CSS for crossfading custom properties and ambient drift */}
      <style>{`
        @keyframes float-grad-1 {
          0% { transform: translate(0px, 0px); }
          50% { transform: translate(30px, -40px); }
          100% { transform: translate(-10px, 20px); }
        }
        @keyframes float-grad-2 {
          0% { transform: translate(0px, 0px); }
          50% { transform: translate(-40px, 30px); }
          100% { transform: translate(20px, -10px); }
        }
        .anim-float-1 {
          animation: float-grad-1 20s ease-in-out infinite alternate;
        }
        .anim-float-2 {
          animation: float-grad-2 25s ease-in-out infinite alternate;
        }
        
        .transition-color-blob {
          transition: background-color 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      {/* 2. Gradient backdrop layer referencing CSS custom properties */}
      <div 
        style={{
          backgroundColor: "var(--gradient-color-3)",
          transition: "background-color 700ms ease",
        }}
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute inset-0 filter blur-[90px] opacity-75">
          {/* Blob 1 */}
          <div
            style={{
              backgroundColor: "var(--gradient-color-1)",
              width: "45vw",
              height: "45vw",
              maxWidth: "350px",
              maxHeight: "350px",
            }}
            className={`absolute top-[10%] left-[20%] rounded-full transition-color-blob ${
              shouldReduceMotion ? "" : "anim-float-1"
            }`}
          />

          {/* Blob 2 */}
          <div
            style={{
              backgroundColor: "var(--gradient-color-2)",
              width: "50vw",
              height: "50vw",
              maxWidth: "380px",
              maxHeight: "380px",
            }}
            className={`absolute bottom-[10%] right-[25%] rounded-full transition-color-blob ${
              shouldReduceMotion ? "" : "anim-float-2"
            }`}
          />
        </div>

        {/* Soft frosted grain filter overlay */}
        <div className="absolute inset-0 bg-black/[0.04] backdrop-blur-[2px]" />
      </div>

      {/* 3. Interactive Palette Swapping Toggles */}
      <div className="absolute top-6 z-20 flex gap-2">
        {(Object.keys(PALETTES) as PaletteKey[]).map((key) => {
          const isSelected = activeKey === key;
          return (
            <button
              key={key}
              onClick={() => handlePaletteShift(key)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer border ${
                isSelected
                  ? "bg-white border-white text-slate-950 shadow-md"
                  : "bg-black/35 border-white/10 text-white hover:bg-black/50"
              }`}
            >
              {key} Theme
            </button>
          );
        })}
      </div>

      {/* 4. Foreground Content Overlay (Contrast-controlled) */}
      <div 
        className={`relative z-10 text-center space-y-6 max-w-2xl transition-colors duration-300 ${
          isDarkBackground ? "text-white" : "text-slate-900"
        }`}
      >
        <div className="space-y-3">
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className={`text-xs sm:text-sm font-bold leading-relaxed max-w-lg mx-auto ${
              isDarkBackground ? "text-slate-300" : "text-slate-650"
            }`}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="pt-2">
          <a
            href={ctaLink}
            className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-150 active:scale-95 border ${
              isDarkBackground 
                ? "bg-white text-slate-950 border-white hover:bg-slate-50" 
                : "bg-slate-950 text-white border-slate-950 hover:bg-slate-900"
            }`}
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

    </section>
  );
}
