"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, Variants } from "framer-motion";
import { ArrowRight, Star, ShieldCheck, Heart } from "lucide-react";

export interface HeroDepthStackProps {
  headline: string;
  subtext?: string;
  ctaText?: string;
  ctaHref?: string;
  layers?: React.ReactNode[];
  bgColor?: string; // Solid theme color or CSS variable
}

export default function HeroDepthStack({
  headline,
  subtext,
  ctaText = "Shop Deck",
  ctaHref = "#catalog",
  layers,
  bgColor = "#fcfcfc",
}: HeroDepthStackProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect hover capabilities
  useEffect(() => {
    const media = window.matchMedia("(hover: hover)");
    setIsTouchDevice(!media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setIsTouchDevice(!e.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Mouse tilt tracking springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || isTouchDevice || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xVal = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2); // -1 to 1
    const yVal = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2); // -1 to 1
    mouseX.set(xVal);
    mouseY.set(yVal);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Entrance variants for the card deck elements
  const getCardVariants = (targetRotate: number, targetX: number, targetY: number): Variants => {
    return {
      hidden: { 
        opacity: 0, 
        rotate: 0, 
        x: 0, 
        y: 0 
      },
      visible: {
        opacity: 1,
        rotate: targetRotate,
        x: targetX,
        y: targetY,
        transition: {
          duration: 0.6,
          ease: [0.175, 0.885, 0.32, 1.1], // Slight bounce back
        },
      },
    };
  };

  // Default mock cards if layers prop is empty
  const defaultLayers = [
    // Layer 1 (Back)
    <div key="card-1" className="w-full h-full bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Heritage Spec</span>
        <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-black text-slate-700">100% Pure Sourced Clay</h4>
        <p className="text-[10px] text-slate-400">Hand-mined directly from local river beds.</p>
      </div>
    </div>,

    // Layer 2 (Middle)
    <div key="card-2" className="w-full h-full bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between text-white shadow-md">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Glazing Certificate</span>
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-black text-slate-200">Lead-Free Gloss Varnish</h4>
        <p className="text-[10px] text-slate-400">Certified food-safe and dishwasher-compatible.</p>
      </div>
    </div>,

    // Layer 3 (Front)
    <div key="card-3" className="w-full h-full bg-amber-50 border border-amber-200 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Quality score</span>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-black text-slate-800">5.0 Star Rating</h4>
        <p className="text-[10px] text-slate-500">Based on 140+ individual verified vendor reviews.</p>
      </div>
    </div>,
  ];

  const cardsToRender = layers || defaultLayers;

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full py-16 md:py-24 overflow-hidden select-none border-b border-slate-100"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* Left Headline Info */}
        <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {headline}
          </h1>

          {subtext && (
            <p className="text-sm sm:text-base text-slate-500 max-w-lg leading-relaxed">
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

        {/* Right Stacked Card Deck */}
        <div className="w-full flex items-center justify-center min-h-[340px] relative">
          <div className="w-[300px] h-[200px] relative">
            {cardsToRender.map((layerContent, index) => {
              // Rotation and layout placement logic per depth level
              let rotateAngle = 0;
              let xOffset = 0;
              let yOffset = 0;

              if (index === 0) {
                // Back card
                rotateAngle = -6;
                xOffset = -15;
                yOffset = -15;
              } else if (index === 1) {
                // Middle card
                rotateAngle = 4;
                xOffset = 10;
                yOffset = 5;
              } else {
                // Front card
                rotateAngle = -2;
                xOffset = 5;
                yOffset = 25;
              }

              // Transform multipliers for mouse spring tilt (deeper moves less)
              const depthFactor = (index + 1) * 0.15; // 0.15, 0.3, 0.45
              const isStatic = shouldReduceMotion || isTouchDevice;

              const translateX = useTransform(springX, [-1, 1], [-12 * depthFactor, 12 * depthFactor]);
              const translateY = useTransform(springY, [-1, 1], [-12 * depthFactor, 12 * depthFactor]);
              const rotateSpring = useTransform(springX, [-1, 1], [rotateAngle - 2, rotateAngle + 2]);

              return (
                <motion.div
                  key={index}
                  variants={getCardVariants(rotateAngle, xOffset, yOffset)}
                  initial="hidden"
                  animate="visible"
                  style={{
                    x: isStatic ? xOffset : translateX,
                    y: isStatic ? yOffset : translateY,
                    rotate: isStatic ? rotateAngle : rotateSpring,
                    zIndex: index * 10,
                  }}
                  className="absolute inset-0 w-full h-full pointer-events-none select-none origin-center"
                >
                  {layerContent}
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
