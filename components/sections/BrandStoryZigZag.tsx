"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface BrandStoryRow {
  title: string;
  paragraphs: string[];
  imageUrl: string;
  imageAlignment: "left" | "right";
}

export interface BrandStoryProps {
  title: string;
  paragraphs: string[];
  imageUrl: string;
  ctaText?: string;
  ctaHref?: string;
  imageAlignment?: "left" | "right";
  rows?: BrandStoryRow[]; // Optional multi-row override
}

// Ease-out Count-up Component using requestAnimationFrame
interface CountUpProps {
  value: number;
  suffix?: string;
  duration?: number;
}

export function CountUp({ value, suffix = "", duration = 1400 }: CountUpProps) {
  const [count, setCount] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true);
          
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Cubic decel ease-out: f(x) = 1 - (1 - x)^3
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * value));
            
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value, hasTriggered, shouldReduceMotion, duration]);

  // Format with comma separators at every frame step
  const formatNum = (val: number) => {
    return val.toLocaleString();
  };

  return <span ref={elementRef}>{formatNum(count)}{suffix}</span>;
}

export default function BrandStoryZigZag({
  title,
  paragraphs = [],
  imageUrl,
  ctaText,
  ctaHref,
  imageAlignment = "left",
  rows,
}: BrandStoryProps) {
  const shouldReduceMotion = useReducedMotion();

  // Alternate rows builder (uses inputs or mocks alternate rows)
  const defaultRows: BrandStoryRow[] = rows || [
    {
      title,
      paragraphs,
      imageUrl,
      imageAlignment: imageAlignment,
    },
    {
      title: "Preserving Ancient Kiln Sourcing",
      paragraphs: [
        "Altrivo works closely with veteran pottery weavers across ancient clay-rich Indus riverbed channels.",
        "We prioritize local materials to ensure sustainable eco-friendly practices that protect the earth and return value directly to our village craftsmen."
      ],
      imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500",
      imageAlignment: imageAlignment === "left" ? "right" : "left",
    }
  ];

  // Motion variants for text reveals (slides in from left or right 24px)
  const textVariants = (align: "left" | "right"): Variants => ({
    hidden: { opacity: 0, x: align === "left" ? -24 : 24 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.45, ease: "easeOut" }
    }
  });

  // Motion variants for visuals (scales and fades in with 100ms delay)
  const visualVariants: Variants = {
    hidden: { opacity: 0, scale: 0.96 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.45, delay: 0.1, ease: "easeOut" }
    }
  };

  return (
    <section className="py-16 bg-[var(--color-bg,#ffffff)] text-slate-800 border-b border-slate-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 overflow-hidden">
      
      {/* 1. ZigZag rows reveals */}
      {defaultRows.map((row, idx) => {
        const isImgLeft = row.imageAlignment === "left";

        return (
          <motion.div
            key={idx}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }} // triggers once on 30% intersection
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
          >
            
            {/* Visual Media Column */}
            <motion.div
              variants={shouldReduceMotion ? {} : visualVariants}
              className={`relative w-full max-w-md mx-auto lg:max-w-none lg:col-span-5 ${
                isImgLeft ? "lg:order-1" : "lg:order-2"
              }`}
            >
              {/* Decorative Offset Backdrop Accent Panel */}
              <div 
                className={`absolute h-full w-full rounded-3xl z-0 ${
                  isImgLeft ? "-translate-x-4 translate-y-4" : "translate-x-4 translate-y-4"
                }`}
                style={{ backgroundColor: "var(--color-secondary, #694873)" }}
              />
              
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-100 shadow-md z-10 bg-slate-50">
                <img
                  src={row.imageUrl}
                  alt={row.title}
                  className="w-full h-full object-cover select-none"
                  loading="lazy"
                />
              </div>
            </motion.div>

            {/* Text description Column */}
            <motion.div
              variants={shouldReduceMotion ? {} : textVariants(isImgLeft ? "right" : "left")}
              className={`lg:col-span-7 space-y-6 text-center lg:text-left ${
                isImgLeft ? "lg:order-2" : "lg:order-1"
              }`}
            >
              <h3 
                className="text-2xl sm:text-3xl font-black tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-heading, inherit)" }}
              >
                {row.title}
              </h3>
              
              <div className="space-y-4 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {row.paragraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {idx === defaultRows.length - 1 && ctaText && (
                <div className="pt-2">
                  <a
                    href={ctaHref || "#"}
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider hover:gap-2.5 transition-all duration-150"
                    style={{ color: "var(--color-primary, #0f172a)" }}
                  >
                    <span>{ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              )}
            </motion.div>

          </motion.div>
        );
      })}

      {/* 2. Count-up Stats Dashboard Section */}
      <div className="border-t border-slate-100 pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div className="space-y-1">
          <h4 className="text-3xl font-black text-slate-800">
            <CountUp value={14} suffix="+" />
          </h4>
          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Years in Business
          </span>
        </div>
        <div className="space-y-1">
          <h4 className="text-3xl font-black text-slate-800">
            <CountUp value={1250} suffix="k" />
          </h4>
          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Collectors Served
          </span>
        </div>
        <div className="space-y-1">
          <h4 className="text-3xl font-black text-slate-800">
            <CountUp value={45} suffix="+" />
          </h4>
          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Artisan Villages
          </span>
        </div>
        <div className="space-y-1">
          <h4 className="text-3xl font-black text-slate-800">
            <CountUp value={100} suffix="%" />
          </h4>
          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Pakistan Sourced
          </span>
        </div>
      </div>

    </section>
  );
}
