"use client";

import React, { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { X, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";

export interface PromoBannerProps {
  campaignId?: string; // Persists dismissal keyed by this campaign identifier
  messages?: string[];  // Rotating promotional headlines
  expiresAt?: string;  // Target countdown expiry timestamp (e.g. "2026-08-20T23:59:59Z")
  variant?: "info" | "sale" | "urgent"; // Maps to colors
  position?: "sticky" | "static"; // Sticky banner stays fixed
  dismissible?: boolean;
  ctaText?: string;
  ctaHref?: string;
}

export default function PromoBanner({
  campaignId = "promo-default-v1",
  messages = ["Last chance! Free Shipping on orders over $50", "Use code INDUS26 for 10% off at checkout", "New master-weave rug collections are live now"],
  expiresAt = "2026-08-31T23:59:59Z",
  variant = "sale",
  position = "static",
  dismissible = true,
  ctaText = "Shop Deal",
  ctaHref = "#catalog",
}: PromoBannerProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const [isDismissed, setIsDismissed] = useState(true); // Default to dismissed to check localStorage on mount
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [pulseCount, setPulseCount] = useState(0);
  const [pulseActive, setPulseActive] = useState(true);

  // Countdown timer state fields
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [prevSeconds, setPrevSeconds] = useState<number | null>(null);
  const [animateSeconds, setAnimateSeconds] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Check local storage for persistent dismissal before displaying
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem(`dismissed_${campaignId}`);
      if (!dismissed) {
        setIsDismissed(false);
      }
    }
  }, [campaignId]);

  // 2. Drive `--banner-height` CSS custom property to push down header layout
  useEffect(() => {
    if (isDismissed) {
      document.documentElement.style.setProperty("--banner-height", "0px");
      return;
    }

    const updateHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight;
        document.documentElement.style.setProperty("--banner-height", `${height}px`);
      }
    };

    updateHeight();
    // Re-calculate on window resize
    window.addEventListener("resize", updateHeight);
    
    return () => {
      window.removeEventListener("resize", updateHeight);
      document.documentElement.style.setProperty("--banner-height", "0px");
    };
  }, [isDismissed]);

  // 3. Multi-message rotation crossfades
  useEffect(() => {
    if (messages.length <= 1 || isDismissed) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [messages, isDismissed]);

  // 4. Urgency pulse limits (2-3 cycles max then stop)
  useEffect(() => {
    if (shouldReduceMotion || isDismissed || variant !== "urgent") {
      setPulseActive(false);
      return;
    }

    const interval = setInterval(() => {
      setPulseCount((prev) => {
        if (prev >= 3) {
          setPulseActive(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [shouldReduceMotion, isDismissed, variant]);

  // 5. Countdown timer loops with single-digit seconds animations
  useEffect(() => {
    if (!expiresAt || isDismissed) return;

    const calculateTime = () => {
      const diff = new Date(expiresAt).getTime() - new Date().getTime();
      if (diff <= 0) {
        setIsExpired(true);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });

      // Animate the seconds digit flip
      if (prevSeconds !== null && prevSeconds !== s && !shouldReduceMotion) {
        setAnimateSeconds(true);
        const t = setTimeout(() => setAnimateSeconds(false), 150);
        return () => clearTimeout(t);
      }
      setPrevSeconds(s);
    };

    calculateTime();
    countdownIntervalRef.current = setInterval(calculateTime, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [expiresAt, isDismissed, prevSeconds, shouldReduceMotion]);

  if (isDismissed) return null;

  // Handle dismissal with persistent storage and layout variables release
  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(`dismissed_${campaignId}`, "true");
  };

  // Maps variant names to semantic tailwind background themes
  const getThemeClass = () => {
    switch (variant) {
      case "urgent":
        return pulseActive
          ? "bg-rose-900 border-rose-950 text-white animate-pulse"
          : "bg-rose-950 border-rose-900 text-rose-50";
      case "info":
        return "bg-indigo-950 border-indigo-900 text-indigo-50";
      case "sale":
      default:
        return "bg-amber-950 border-amber-900 text-amber-50";
    }
  };

  const formattedDeadline = expiresAt
    ? `Promotion ends on ${new Date(expiresAt).toLocaleDateString()}`
    : "Limited time offer";

  return (
    <section
      ref={containerRef}
      role="region"
      aria-label="Promotional announcement"
      style={{
        position: position === "sticky" ? "sticky" : "static",
        top: 0,
        zIndex: 990,
        transition: shouldReduceMotion ? "none" : "max-height 250ms ease-in-out, opacity 250ms ease",
      }}
      className={`w-full select-none border-b text-[10px] sm:text-xs font-bold leading-tight py-2.5 px-4 flex items-center justify-between shadow-xs overflow-hidden ${getThemeClass()}`}
    >
      
      {/* 1. Icon visual cue */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        {variant === "urgent" ? (
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
        ) : (
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
        )}

        {/* 2. Headline messages rotational crossfades */}
        <div className="relative min-w-0 flex-1 h-4 overflow-hidden flex items-center">
          {messages.map((msg, idx) => {
            const isActive = currentMessageIndex === idx;
            return (
              <span
                key={idx}
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "translateY(0)" : "translateY(15px)",
                  transition: shouldReduceMotion ? "none" : "opacity 350ms ease, transform 350ms ease",
                }}
                className={`absolute inset-0 truncate font-black tracking-wide ${
                  isActive ? "pointer-events-auto" : "pointer-events-none"
                }`}
              >
                {msg}
              </span>
            );
          })}
        </div>
      </div>

      {/* 3. Countdown timer details (accessible static aria deadline label) */}
      {expiresAt && !isExpired && (
        <div 
          aria-label={formattedDeadline}
          className="flex items-center gap-1 flex-shrink-0 text-[10px] uppercase font-black bg-white/5 border border-white/10 px-2 py-0.5 rounded-md mx-3 select-none text-slate-300"
        >
          <span>ENDS: </span>
          <span>{timeLeft.days}d</span>
          <span>{timeLeft.hours}h</span>
          <span>{timeLeft.minutes}m</span>
          <span
            style={{
              transform: animateSeconds ? "scale(1.15)" : "scale(1)",
              transition: "transform 120ms ease",
            }}
            className="inline-block origin-center w-5 text-center text-white"
          >
            {timeLeft.seconds}s
          </span>
        </div>
      )}

      {/* 4. Action details */}
      <div className="flex items-center gap-3 shrink-0">
        {ctaHref && (
          <a
            href={ctaHref}
            className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white border-b border-white hover:opacity-90 hover:border-transparent transition-all"
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-3 w-3" />
          </a>
        )}

        {/* Dismiss trigger */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
            aria-label="Dismiss promotion"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

    </section>
  );
}
