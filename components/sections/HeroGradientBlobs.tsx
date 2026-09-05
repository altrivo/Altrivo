"use client";

import React, { useState, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface HeroGradientProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  colors?: string[]; // Prop-driven hex colors array
}

export default function HeroGradientBlobs({
  title,
  subtitle,
  ctaText = "Explore Studio",
  ctaLink = "#catalog",
  colors = ["#0f172a", "#1e1b4b", "#311042"], // Default rich dark palette
}: HeroGradientProps) {
  const shouldReduceMotion = useReducedMotion();
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Check pointer capability to skip mouse drift on mobile/touch screens
  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    setIsMobile(media.matches);

    if (media.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 18; // Max 18px offset
      const y = (e.clientY / window.innerHeight - 0.5) * 18;
      setMouseOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Perceived Luminance Calculator to toggle text/button colors dynamically
  const getLuminance = (hex: string) => {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return 0.5; // default fallback
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  const avgLuminance = colors.reduce((acc, c) => acc + getLuminance(c), 0) / colors.length;
  const isDarkBackground = avgLuminance < 0.52;

  // Cycle passed colors across 3 absolute blobs
  const blobColors = [
    colors[0] || "#0f172a",
    colors[1] || colors[0] || "#1e1b4b",
    colors[2] || colors[0] || "#311042",
  ];

  return (
    <section className="relative overflow-hidden select-none min-h-[500px] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-slate-900">
      
      {/* 1. Self-contained CSS for unsynced drifting keyframe animation paths */}
      <style>{`
        @keyframes blob-drift-1 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, -60px) scale(1.1); }
          100% { transform: translate(-20px, 30px) scale(0.95); }
        }
        @keyframes blob-drift-2 {
          0% { transform: translate(0px, 0px) scale(1.05); }
          50% { transform: translate(-50px, 40px) scale(0.9); }
          100% { transform: translate(30px, -20px) scale(1.12); }
        }
        @keyframes blob-drift-3 {
          0% { transform: translate(0px, 0px) scale(0.95); }
          50% { transform: translate(30px, 50px) scale(1.1); }
          100% { transform: translate(-40px, -30px) scale(1); }
        }
        .anim-blob-1 {
          animation: blob-drift-1 18s ease-in-out infinite alternate;
        }
        .anim-blob-2 {
          animation: blob-drift-2 24s ease-in-out infinite alternate;
        }
        .anim-blob-3 {
          animation: blob-drift-3 28s ease-in-out infinite alternate;
        }
      `}</style>

      {/* 2. Background Blob Layer */}
      <div 
        style={{
          // Set container base background to first color to keep color continuity
          backgroundColor: colors[0],
        }}
        className="absolute inset-0 z-0 overflow-hidden"
      >
        
        {/* Blob Wrapper holding mouse-drift offsets */}
        <div
          style={{
            transform: !shouldReduceMotion ? `translate(${mouseOffset.x}px, ${mouseOffset.y}px)` : "none",
            transition: "transform 150ms ease-out",
            filter: isMobile ? "blur(60px)" : "blur(90px)", // lighter filter on mobile GPUs
            willChange: "transform",
          }}
          className="absolute inset-0"
        >
          {/* Blob 1 */}
          <div
            style={{ backgroundColor: blobColors[0] }}
            className={`absolute top-[10%] left-[15%] w-[45vw] h-[45vw] max-w-[360px] max-h-[360px] rounded-full opacity-65 ${
              shouldReduceMotion ? "" : "anim-blob-1"
            }`}
          />

          {/* Blob 2 */}
          <div
            style={{ backgroundColor: blobColors[1] }}
            className={`absolute bottom-[15%] right-[20%] w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] rounded-full opacity-60 ${
              shouldReduceMotion ? "" : "anim-blob-2"
            }`}
          />

          {/* Blob 3 (Rendered on desktop only to optimize mobile GPU cycles) */}
          {!isMobile && (
            <div
              style={{ backgroundColor: blobColors[2] }}
              className={`absolute top-[30%] right-[35%] w-[38vw] h-[38vw] max-w-[320px] max-h-[320px] rounded-full opacity-55 ${
                shouldReduceMotion ? "" : "anim-blob-3"
              }`}
            />
          )}
        </div>

        {/* Soft frosted grain card overlay */}
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[1px]" />
      </div>

      {/* 3. Foreground Text Content Overlay (Contrast-controlled) */}
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
