"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface HeroGradientProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  colors?: string[];
}

export default function HeroGradientConic({
  title,
  subtitle,
  ctaText = "Shop Catalog",
  ctaLink = "#catalog",
  colors = ["#a855f7", "#3b82f6", "#ec4899"], // Vibrant default palette
}: HeroGradientProps) {
  const shouldReduceMotion = useReducedMotion();

  // Conic gradients look best when the color sequence wraps back to the first color
  const loopedColors = [...colors, colors[0] || "#a855f7"];
  const conicBackground = `conic-gradient(from 0deg at 50% 50%, ${loopedColors.join(", ")})`;

  // Perceived Luminance Calculator
  const getLuminance = (hex: string) => {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return 0.5;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  const avgLuminance = colors.reduce((acc, c) => acc + getLuminance(c), 0) / colors.length;
  const isDarkBackground = avgLuminance < 0.52;

  return (
    <section className="relative overflow-hidden select-none min-h-[500px] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-black">
      
      {/* 1. Self-contained CSS for Linear Conic Rotation */}
      <style>{`
        @keyframes conic-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-conic-bg {
          animation: conic-spin 36s linear infinite;
        }
      `}</style>

      {/* 2. Rotating Conic Backdrop Container */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900">
        
        {/* Large blur boundary element */}
        <div 
          className="absolute inset-0 filter blur-[80px]"
          style={{ transform: "translate3d(0, 0, 0)" }} // forces hardware acceleration
        >
          
          {/* Rotating gradient element (expanded 140% to cover bounds) */}
          <div
            style={{
              backgroundImage: conicBackground,
              width: "140%",
              height: "140%",
              left: "-20%",
              top: "-20%",
              willChange: "transform",
            }}
            className={`absolute rounded-full opacity-70 ${
              shouldReduceMotion ? "" : "spin-conic-bg"
            }`}
          />
        </div>

        {/* Static soft dark blend layer */}
        <div className="absolute inset-0 bg-slate-950/20" />
      </div>

      {/* 3. Foreground Content Overlay */}
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
              isDarkBackground ? "text-slate-350" : "text-slate-650"
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
