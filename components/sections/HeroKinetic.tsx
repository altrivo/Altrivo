"use client";

import React, { useState, useEffect, useRef } from "react";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface HeroKineticProps {
  variant?: "stagger" | "typewriter";
  headlineParts?: string[]; // e.g. ["Crafting", "the Future of", "Artisan Commerce"]
  rotatingWords?: string[]; // e.g. ["pottery", "carpets", "textiles"]
  subtext?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function HeroKinetic({
  variant = "stagger",
  headlineParts = ["We Empower Local", "Weavers & Workshops to Build", "Global Artisan Brands for"],
  rotatingWords = ["potters", "weavers", "carvers", "designers"],
  subtext = "Direct-to-consumer escrow checkout protects your orders while backing authentic crafting heritage.",
  ctaText = "Explore Studio Drops",
  ctaLink = "#catalog",
}: HeroKineticProps) {
  const shouldReduceMotion = useReducedMotion();

  // 1. Re-trigger gate: entrance animations run exactly once on mount
  const hasAnimatedRef = useRef(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!hasAnimatedRef.current) {
      setShouldAnimate(true);
      hasAnimatedRef.current = true;
    }
  }, []);

  // 2. Rotating word loops with hover & focus pause handlers
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (rotatingWords.length <= 1 || shouldReduceMotion || isPaused) return;

    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [rotatingWords, shouldReduceMotion, isPaused]);

  // 3. Typewriter character speed calibrator
  const headlineFullText = headlineParts.join(" ");
  const [typewriterText, setTypewriterText] = useState("");
  const [isTypewriterDone, setIsTypewriterDone] = useState(false);
  const typewriterDuration = 900; // Total constant typing target (ms)

  useEffect(() => {
    if (variant !== "typewriter" || shouldReduceMotion || !shouldAnimate) {
      setTypewriterText(headlineFullText);
      setIsTypewriterDone(true);
      return;
    }

    const chars = headlineFullText.split("");
    const delay = typewriterDuration / chars.length;
    let idx = 0;

    const timer = setInterval(() => {
      if (idx < chars.length) {
        setTypewriterText((prev) => prev + chars[idx]);
        idx++;
      } else {
        setIsTypewriterDone(true);
        clearInterval(timer);
      }
    }, delay);

    return () => clearInterval(timer);
  }, [headlineFullText, variant, shouldReduceMotion, shouldAnimate]);

  // 4. Determine dynamic width container for width-stable rotating words
  // Hidden absolute stack trick prevents layout shift/reflows by calculating the longest word boundaries
  const longestWord = rotatingWords.reduce((a, b) => (a.length > b.length ? a : b), "");

  // Stagger entry configurations
  const parentVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.075,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" as const },
    },
  };

  // Delayed subtext sequences
  const [showSubtext, setShowSubtext] = useState(false);
  useEffect(() => {
    if (shouldReduceMotion || !shouldAnimate) {
      setShowSubtext(true);
      return;
    }

    const delayTime = variant === "typewriter" ? typewriterDuration + 100 : (headlineParts.length * 75) + 300;
    const t = setTimeout(() => setShowSubtext(true), delayTime);
    return () => clearTimeout(t);
  }, [variant, headlineParts.length, shouldReduceMotion, shouldAnimate]);

  // Accessibility summary phrase
  const activeWord = rotatingWords[activeWordIndex] || "";
  const accessibilityLabel = `${headlineFullText} ${activeWord}. ${subtext}`;

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-label="Welcome banner"
      className="relative w-full py-20 md:py-28 overflow-hidden bg-slate-900 border-b border-slate-900 text-white flex items-center select-none"
    >
      
      {/* Blinking OS cursor animation */}
      <style>{`
        @keyframes caret-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .blinking-caret {
          animation: caret-blink 530ms steps(1) infinite;
        }
      `}</style>

      {/* Background visual graphics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent)] z-0" />

      {/* Main typographic body */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 text-center flex flex-col items-center">
        
        {/* Hidden screen-reader descriptive tags */}
        <div className="sr-only" aria-live="polite">
          {accessibilityLabel}
        </div>

        {/* 1. Kinetic Typography Headline */}
        <h1 
          aria-hidden="true"
          className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight select-text"
          style={{ fontFamily: "var(--font-heading, inherit)" }}
        >
          {variant === "typewriter" ? (
            <div className="inline">
              <span>{typewriterText}</span>
              {!isTypewriterDone && (
                <span className="inline-block blinking-caret ml-0.5 text-amber-400 font-normal">|</span>
              )}
            </div>
          ) : (
            <motion.div
              variants={parentVariants}
              initial="hidden"
              animate={shouldAnimate ? "visible" : "hidden"}
              className="inline-flex flex-wrap justify-center gap-x-2.5 gap-y-1"
            >
              {headlineParts.map((part, idx) => (
                <motion.span key={idx} variants={itemVariants} className="inline-block">
                  {part}
                </motion.span>
              ))}

              {/* Width-stable rotating word segment (Slides vertically) */}
              {rotatingWords.length > 0 && (
                <motion.span 
                  variants={itemVariants}
                  className="relative inline-block text-amber-400 font-black border-b-2 border-amber-400/20 pb-0.5"
                >
                  {/* Invisible clone forces stable dimensions preventing layout shifts */}
                  <span className="invisible h-0 select-none pointer-events-none block font-black">
                    {longestWord}
                  </span>

                  {/* Dynamic sliding absolute active indexes */}
                  <span className="absolute inset-0 overflow-hidden flex items-center justify-center">
                    {shouldReduceMotion ? (
                      <span>{rotatingWords[0]}</span>
                    ) : (
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={activeWordIndex}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.35, ease: "easeInOut" }}
                          className="absolute block truncate"
                        >
                          {activeWord}
                        </motion.span>
                      </AnimatePresence>
                    )}
                  </span>
                </motion.span>
              )}

            </motion.div>
          )}
        </h1>

        {/* 2. Subtext and CTA button sequencing delays */}
        <div
          style={{
            opacity: showSubtext ? 1 : 0,
            transform: showSubtext ? "translateY(0px)" : "translateY(12px)",
            transition: shouldReduceMotion ? "none" : "opacity 500ms ease, transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="mt-6 space-y-8 flex flex-col items-center"
        >
          {subtext && (
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-bold max-w-xl">
              {subtext}
            </p>
          )}

          <div className="pt-2">
            <a
              href={ctaLink}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-950 hover:bg-slate-50 active:scale-95 text-[10px] font-black uppercase tracking-widest transition-all duration-150 border border-white"
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

      </div>

    </section>
  );
}
