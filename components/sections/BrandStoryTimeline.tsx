"use client";

import React, { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export interface BrandStoryProps {
  title: string;
  paragraphs: string[];
  imageUrl: string;
  ctaText?: string;
  ctaHref?: string;
}

interface Milestone {
  year: string;
  title: string;
  description: string;
  ratio: number; // position percentage along the vertical timeline (0 to 1)
}

const MILESTONES: Milestone[] = [
  {
    year: "2012",
    title: "The First Kiln",
    description: "Altrivo was founded in a small rural village near Multan, Pakistan, with a single wood-fired kiln and two veteran artisans.",
    ratio: 0.05,
  },
  {
    year: "2016",
    title: "Preserving Heritage",
    description: "Expanded our collaborations to over 15 artisan families, cataloging and preserving multigenerational pottery patterns.",
    ratio: 0.35,
  },
  {
    year: "2020",
    title: "Global Showcases",
    description: "Hosted our first global gallery exhibition in London, introducing local Pakistani earthen glaze textures to international designers.",
    ratio: 0.68,
  },
  {
    year: "2026",
    title: "Modern Design Hub",
    description: "Launched our visual visual storefront builders, connecting collectors directly to custom village workshop drops.",
    ratio: 0.95,
  },
];

export default function BrandStoryTimeline({
  title,
  paragraphs = [],
  imageUrl,
}: BrandStoryProps) {
  const shouldReduceMotion = useReducedMotion();
  const timelineRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSignature, setShowSignature] = useState(false);

  // Intersection observer to trigger founder signature draw
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowSignature(true);
          if (quoteRef.current) observer.unobserve(quoteRef.current);
        }
      },
      { threshold: 0.2 }
    );

    if (quoteRef.current) {
      observer.observe(quoteRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Calculate scroll depth progress relative to the timeline bounds
  useEffect(() => {
    if (shouldReduceMotion) {
      setScrollProgress(1.0); // full fill immediately for reduced motion
      return;
    }

    const handleScroll = () => {
      const el = timelineRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Progress maps to viewport center crossing the timeline height bounds
      const centerTrigger = viewportHeight / 2;
      const progress = (centerTrigger - rect.top) / rect.height;

      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial calculate
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [shouldReduceMotion]);

  return (
    <section className="py-16 bg-white text-slate-800 border-b border-slate-100 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Self-contained CSS for signature SVG paths draw-ins */}
      <style>{`
        @keyframes sig-draw {
          to { stroke-dashoffset: 0; }
        }
        .signature-draw-path {
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: sig-draw 1.2s ease-in-out forwards;
        }
      `}</style>

      {/* Title */}
      <div className="text-center space-y-3">
        <h2 
          className="text-3xl font-black tracking-tight"
          style={{ fontFamily: "var(--font-heading, inherit)" }}
        >
          {title}
        </h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          Artisan Milestones & Chronology
        </p>
      </div>

      {/* Bounding container with 2 columns: Timeline on left, image/stats on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Scroll-Linked Timeline Progress Line */}
        <div ref={timelineRef} className="lg:col-span-7 relative pl-8 border-l-2 border-slate-100 py-4">
          
          {/* Active Filling Progress Line (linked directly to center viewport scroll) */}
          <div
            className="absolute left-[-2px] top-0 bg-[var(--color-primary,#694873)] w-[2px] origin-top transition-transform duration-100 ease-out"
            style={{ height: "100%", transform: `scaleY(${scrollProgress})` }}
          />

          <div className="space-y-12">
            {MILESTONES.map((stone, idx) => {
              const isReached = scrollProgress >= stone.ratio;

              return (
                <div key={idx} className="relative space-y-1.5">
                  {/* Milestone dot marker (spring scale-pop 1 -> 1.15 when reached) */}
                  <span
                    className={`absolute left-[-42px] top-1.5 h-4.5 w-4.5 rounded-full border-2 bg-white flex items-center justify-center transition-all duration-350 ${
                      isReached
                        ? "border-[var(--color-primary,#694873)] scale-110 shadow-xs"
                        : "border-slate-200 scale-95"
                    }`}
                    style={{
                      // springy overshoot transition curve
                      transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    }}
                  >
                    <span
                      className={`h-2 w-2 rounded-full transition-transform duration-200 ${
                        isReached ? "bg-[var(--color-primary,#694873)] scale-100" : "bg-transparent scale-0"
                      }`}
                    />
                  </span>

                  {/* Year Tag */}
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-colors duration-250 ${
                    isReached ? "bg-[var(--color-primary,#694873)] text-white" : "bg-slate-105 text-slate-400"
                  }`}>
                    {stone.year}
                  </span>

                  {/* Narrative details */}
                  <h3 className={`text-xs font-black uppercase tracking-wider transition-colors duration-250 ${
                    isReached ? "text-slate-800" : "text-slate-400"
                  }`}>
                    {stone.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                    {stone.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Hero image & Founder quote with signature draw-in */}
        <div className="lg:col-span-5 space-y-8 sticky top-24">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-slate-100 shadow-md bg-slate-50">
            <img
              src={imageUrl}
              alt="Artisan multi kiln"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Founder pull-quote signature box */}
          <div
            ref={quoteRef}
            className="border border-slate-100 bg-slate-50/50 rounded-2xl p-6 space-y-4 relative overflow-hidden"
          >
            <Quote className="h-6 w-6 text-slate-200 fill-slate-100/50 rotate-180" />
            <blockquote className="text-xs font-bold text-slate-650 leading-relaxed italic">
              "We don't merely manufacture pottery tiles or tabletop lamp collections; we preserve multi-generational village family handcrafts. Every line in our clay glazes tells an Indus valley story."
            </blockquote>
            
            {/* Signature Draw-in block */}
            <div className="flex flex-col items-end pt-2 border-t border-slate-100">
              <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">
                Malaika Noor
              </span>
              <span className="block text-[8px] text-slate-400">
                Altrivo Chief Craftsman
              </span>
              
              {/* hand-drawn cursive style signature SVG */}
              <div className="h-10 w-28 mt-1.5 opacity-70">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 120 40"
                  fill="none"
                  stroke="var(--color-primary, #694873)"
                  strokeWidth={2}
                  strokeLinecap="round"
                >
                  <path
                    d="M10 25 C30 10, 40 35, 55 15 C70 5, 80 35, 95 20 C105 10, 110 30, 115 15"
                    className={showSignature && !shouldReduceMotion ? "signature-draw-path" : ""}
                    style={{
                      strokeDasharray: 120,
                      strokeDashoffset: showSignature ? 0 : 120,
                    }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
