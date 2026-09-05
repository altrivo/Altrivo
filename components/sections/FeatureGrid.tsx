"use client";

import React, { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface FeatureItem {
  icon?: string;
  title: string;
  description: string;
  href?: string;
}

export interface FeatureGridProps {
  layout?: "features" | "steps";
  features?: FeatureItem[];
  featuredIndex?: number; // Index to emphasize (gives col-span-2 layout)
}

const DEFAULT_FEATURES: FeatureItem[] = [
  { icon: "shield", title: "Secure Escrow Protection", description: "100% buyer protection. Funds are held securely in escrow until order receipt is verified by courier beacon." },
  { icon: "truck", title: "Cash on Delivery", description: "Nationwide express delivery with convenient cash checkout option right at your doorstep." },
  { icon: "exchange", title: "Hassle-Free Returns", description: "Enjoy premium confidence with a simplified 7-day return and instant wallet refund program." },
];

export default function FeatureGrid({
  layout = "features",
  features = DEFAULT_FEATURES,
  featuredIndex = -1,
}: FeatureGridProps) {
  const shouldReduceMotion = useReducedMotion();
  const [visibleIndices, setVisibleIndices] = useState<Record<number, boolean>>({});
  const gridRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to stagger columns by row intersections
  useEffect(() => {
    if (typeof window === "undefined") return;

    const cards = gridRef.current?.querySelectorAll(".feature-card-item");
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            
            // Row-aware delay offset calculation
            const row = Math.floor(index / 3);
            const col = index % 3;
            const delay = shouldReduceMotion ? 0 : row * 80 + col * 35;

            setTimeout(() => {
              setVisibleIndices((prev) => ({ ...prev, [index]: true }));
            }, delay);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [features, shouldReduceMotion]);

  // Icon drawing path renderer helpers
  const renderCustomIcon = (iconName: string = "") => {
    const cls = "h-6 w-6 stroke-[1.75] transition-all duration-300";

    switch (iconName.toLowerCase()) {
      case "shield":
        return (
          <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path className="svg-path-draw" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        );
      case "truck":
        return (
          <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path className="svg-path-draw" d="M14 18H6a2 2 0 01-2-2V8a2 2 0 012-2h8l6 3v7a2 2 0 01-2 2h-2m-8 0a2 2 0 11-4 0m10 0a2 2 0 11-4 0" />
          </svg>
        );
      case "exchange":
        return (
          <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path className="svg-path-draw" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6H19M4 9h5" />
          </svg>
        );
      default:
        return (
          <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path className="svg-path-draw" d="M12 3v1m0 16v1m9-9h-1M4 12H3" />
          </svg>
        );
    }
  };

  const isStepLayout = layout === "steps";

  return (
    <section className="py-16 select-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100">
      
      {/* Dynamic line animation styles */}
      <style>{`
        .svg-path-draw {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          transition: stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .card-visible .svg-path-draw {
          stroke-dashoffset: 0;
        }
        /* Icon rotate/bounce hover states */
        .feature-card-hover:hover .feature-icon-wrapper {
          transform: scale(1.1) rotate(6deg);
          color: var(--color-primary, #694873);
          background-color: #f5f3f7;
        }
        /* Timeline dots fill transitions */
        .step-dot-fill {
          transition: background-color 600ms ease, transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      {/* Grid container (equal heights via items stretch) */}
      <div 
        ref={gridRef}
        className={`grid gap-3 sm:gap-6 items-stretch relative ${
          features.length === 4
            ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
            : features.length === 3
            ? "grid-cols-1 sm:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {/* Step connection line in background */}
        {isStepLayout && (
          <div className="absolute top-[32px] left-[5%] right-[5%] h-[2px] bg-slate-150 z-0 hidden md:block" />
        )}

        {features.map((item, idx) => {
          const isVisible = !!visibleIndices[idx];
          const isFeatured = featuredIndex === idx;
          const isClickable = !!item.href;

          return (
            <div
              key={idx}
              data-index={idx}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0px)" : "translateY(18px)",
                transition: shouldReduceMotion ? "none" : "opacity 500ms ease, transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              className={`feature-card-item flex flex-col justify-between items-start p-3.5 sm:p-5 bg-slate-50/40 border rounded-2xl transition-all duration-300 relative z-10 ${
                isVisible ? "card-visible" : ""
              } ${
                isFeatured
                  ? "border-[var(--color-primary,#0f172a)] bg-[var(--color-bg,#ffffff)]"
                  : "border-slate-200/60"
              } ${
                isClickable
                  ? "hover:border-slate-400 hover:shadow-md cursor-pointer"
                  : "feature-card-hover"
              }`}
            >
              
              {/* Top Row: Icon drawing or numbered timeline pop-dots */}
              <div className="flex items-center justify-between w-full mb-2.5 sm:mb-4">
                {isStepLayout ? (
                  <div
                    style={{
                      transform: isVisible ? "scale(1)" : "scale(0.8)",
                    }}
                    className={`step-dot-fill h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 text-[10px] font-black flex items-center justify-center ${
                      isVisible
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-450"
                    }`}
                  >
                    {idx + 1}
                  </div>
                ) : (
                  <div className="feature-icon-wrapper p-2 sm:p-2.5 rounded-xl text-slate-700 bg-slate-100/80 transition-all duration-250 flex items-center justify-center shrink-0">
                    {renderCustomIcon(item.icon)}
                  </div>
                )}

                {/* Featured Badge */}
                {isFeatured && (
                  <span className="text-[8px] font-black uppercase tracking-widest bg-[var(--color-primary,#0f172a)] text-white px-2 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
              </div>

              {/* Title & Description section (Clamped description heights) */}
              <div className="space-y-1 sm:space-y-1.5 flex-grow w-full">
                <h3
                  className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-900 leading-tight"
                  style={{ fontFamily: "var(--font-heading, inherit)" }}
                >
                  {item.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">
                  {item.description}
                </p>
              </div>

              {/* Footer details (Links/CTA if clickable) */}
              {isClickable && (
                <div className="pt-4 mt-auto">
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-900 hover:gap-2.5 transition-all duration-150"
                  >
                    <span>Learn Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </section>
  );
}
