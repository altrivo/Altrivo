"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";

export interface BrandStoryProps {
  title: string;
  paragraphs: string[];
  imageUrl: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function BrandStoryStickyChapter({
  title = "Our Artisan Chronicle",
  paragraphs = [],
  imageUrl,
}: BrandStoryProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeChapter, setActiveChapter] = useState(0);

  const chapterRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  // Intersection observer to track which chapter is currently active
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px", // focus range centered in viewport
      threshold: 0.1,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = chapterRefs.findIndex((ref) => ref.current === entry.target);
          if (index !== -1) {
            setActiveChapter(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    chapterRefs.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const navItems = ["Origins", "Philosophy", "Future"];

  // Paragraph progressive reveal stagger variants
  const containerVariants: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.15 } // 150ms stagger
    }
  };

  const paragraphVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const handleNavClick = (idx: number) => {
    setActiveChapter(idx);
    chapterRefs[idx].current?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <section className="py-16 bg-white text-slate-800 border-b border-slate-100 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Title block */}
      <div className="text-center">
        <h2 
          className="text-3xl font-black tracking-tight"
          style={{ fontFamily: "var(--font-heading, inherit)" }}
        >
          {title}
        </h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">
          Vertical scrollytelling chronicles
        </p>
      </div>

      {/* 1. Sticky Nav Tracker (underline translates smoothly based on activeChapter) */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 py-3 flex justify-center">
        <nav className="relative flex w-full max-w-sm bg-slate-50 border border-slate-150 rounded-xl p-1 overflow-hidden">
          
          {/* Underline slider */}
          <div
            className="absolute top-1 bottom-1 left-0 bg-white border border-slate-200/50 rounded-lg shadow-xs transition-transform duration-250 ease-out"
            style={{
              width: "33.33%",
              transform: `translateX(${activeChapter * 100}%)`,
            }}
          />

          {navItems.map((item, idx) => (
            <button
              key={item}
              onClick={() => handleNavClick(idx)}
              className={`relative z-10 w-1/3 text-center py-1.5 text-[9px] font-black uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                activeChapter === idx ? "text-slate-900" : "text-slate-400 hover:text-slate-650"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* 2. Main content block layout (2 columns grid) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative">
        
        {/* Left media layout column */}
        <div className="md:col-span-5 md:sticky md:top-24 space-y-6">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-slate-150 shadow-md bg-slate-50 relative">
            <img
              src={imageUrl || "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80"}
              alt={title || "Artisan Workshop"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 text-white space-y-1">
              <span className="block text-[8px] font-black uppercase tracking-widest text-slate-350">
                Chapter Spotlight
              </span>
              <span className="block text-sm font-black uppercase tracking-wider">
                {navItems[activeChapter]}
              </span>
            </div>
          </div>
        </div>

        {/* Right narrative content (3 distinct chronological chapters) */}
        <div className="md:col-span-7 space-y-24 pb-16">
          
          {/* Chapter 1 */}
          <div ref={chapterRefs[0]} className="space-y-4 pt-4 scroll-mt-28">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary,#694873)]">
              Chapter I: Roots & Foundations
            </span>
            <h3 
              className="text-lg font-black text-slate-800"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              The Indus valley heritage
            </h3>
            
            {/* Progressive paragraphs reveal (scroll-triggered stagger) */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-4 text-xs leading-relaxed text-slate-550"
            >
              <motion.p variants={paragraphVariants}>
                Altrivo was born from a desire to safeguard the fast-disappearing traditional arts of the Indus River basin. Centuries-old terracotta styles and indigo dye formulations were fading as global commercialization prioritized speed.
              </motion.p>
              <motion.p variants={paragraphVariants}>
                We set out to build a platform that pairs village craftsmen with modern architectural designers, proving that historical craft integrity can flourish in high-end spaces.
              </motion.p>
            </motion.div>
          </div>

          {/* Chapter 2 */}
          <div ref={chapterRefs[1]} className="space-y-4 scroll-mt-28">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary,#694873)]">
              Chapter II: Pure Materials
            </span>
            <h3 
              className="text-lg font-black text-slate-800"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              Sustainable kiln practices
            </h3>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-4 text-xs leading-relaxed text-slate-550"
            >
              <motion.p variants={paragraphVariants}>
                Every lump of clay we spin is locally excavated from natural riverbeds. Our glazes use organic vegetable pulps and lead-free copper ore oxides, keeping production safe for both the craftsmen and the environment.
              </motion.p>
              <motion.p variants={paragraphVariants}>
                Our wood-fueled firing chambers run on wood remnants sourced from community agricultural farms, keeping resource consumption zero-impact.
              </motion.p>
            </motion.div>
          </div>

          {/* Chapter 3 */}
          <div ref={chapterRefs[2]} className="space-y-4 scroll-mt-28">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary,#694873)]">
              Chapter III: Future Scales
            </span>
            <h3 
              className="text-lg font-black text-slate-800"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              Generational continuity
            </h3>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-4 text-xs leading-relaxed text-slate-550"
            >
              <motion.p variants={paragraphVariants}>
                Altrivo funds three training workshops in Punjab, helping younger generations learn heritage weaving and carving secrets from elder masters.
              </motion.p>
              <motion.p variants={paragraphVariants}>
                By paying fair wages and providing sustainable toolkits, we transform these ancient arts from fading relics into proud, prosperous livelihoods.
              </motion.p>
            </motion.div>
          </div>

        </div>

      </div>

    </section>
  );
}
