"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import ProductCardElevate from "./ProductCardElevate";
import ProductCardZoom from "./ProductCardZoom";
import ProductCard3DTilt from "./ProductCard3DTilt";
import ProductCardFlip from "./ProductCardFlip";
import ProductCardSlideActions from "./ProductCardSlideActions";
import ProductCardMagnetic from "./ProductCardMagnetic";

export interface StaggeredProduct {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
  image: string;
  onClick?: () => void;
}

export interface ProductGridStaggeredProps {
  title: string;
  subtitle?: string;
  products: StaggeredProduct[];
  cardType?: "elevate" | "zoom" | "tilt" | "flip" | "slide" | "magnetic";
  storeSlug?: string;
  limit?: number;
}

export default function ProductGridStaggered({
  title,
  subtitle,
  products = [],
  cardType = "zoom",
  storeSlug,
  limit = 12,
}: ProductGridStaggeredProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasIntersected, setHasIntersected] = useState(true);

  useEffect(() => {
    if (shouldReduceMotion) {
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasIntersected(true);
          if (containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        }
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [shouldReduceMotion]);

  const visibleProducts = products.slice(0, limit);

  // Resolve card element based on type
  const renderCard = (product: StaggeredProduct) => {
    const handleCardClick = () => {
      if (product.onClick) {
        product.onClick();
        return;
      }
      if (storeSlug) {
        router.push(`/preview/${storeSlug}/product/${product.id}`);
        return;
      }
      router.push(`/product/${product.id}`);
    };

    const cardProps = {
      ...product,
      aspectRatio: "portrait" as const,
      onClick: handleCardClick,
    };
    
    switch (cardType) {
      case "elevate":
        return <ProductCardElevate {...cardProps} />;
      case "tilt":
        return <ProductCard3DTilt {...cardProps} />;
      case "flip":
        return <ProductCardFlip {...cardProps} />;
      case "slide":
        return <ProductCardSlideActions {...cardProps} />;
      case "magnetic":
        return <ProductCardMagnetic {...cardProps} />;
      case "zoom":
      default:
        return <ProductCardZoom {...cardProps} />;
    }
  };

  return (
    <section 
      ref={containerRef}
      className="w-full py-12 sm:py-16 bg-[var(--color-bg,#ffffff)] text-[var(--color-text,#1e293b)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-100"
    >
      {/* Header Info */}
      <div className="text-center space-y-3 mb-10">
        <h2 
          className="text-2xl sm:text-3xl font-black tracking-tight"
          style={{ fontFamily: "var(--font-heading, inherit)" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Grid container */}
      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {visibleProducts.map((product, index) => {
            const staggerDelay = hasIntersected ? Math.min(index * 50, 400) : 0;

            return (
              <div
                key={product.id}
                style={{
                  opacity: 1,
                  transform: "translateY(0)",
                  transition: shouldReduceMotion 
                    ? "opacity 200ms ease-out"
                    : `opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) ${staggerDelay}ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) ${staggerDelay}ms`,
                  willChange: "transform, opacity",
                }}
                className="flex w-full"
              >
                {renderCard(product)}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-sm text-slate-400">No products available in this collection.</p>
        </div>
      )}
    </section>
  );
}
