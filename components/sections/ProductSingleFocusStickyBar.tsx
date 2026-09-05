"use client";

import React, { useState, useEffect, useRef } from "react";
import { Star, ShoppingBag, Check } from "lucide-react";

export interface ProductSingleFocusProps {
  id: string;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  badgeText?: string;
  options?: { name: string; values: string[] }[];
  onAddToCart?: (id: string, selectedOptions: Record<string, string>) => void;
}

export default function ProductSingleFocusStickyBar({
  id,
  name,
  price,
  description,
  imageUrl,
  badgeText = "Sticky CTA Showcase",
  options = [],
  onAddToCart,
}: ProductSingleFocusProps) {
  const [showStickyBar, setShowStickyBar] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isAdded, setIsAdded] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    options.forEach((opt) => {
      if (opt.values && opt.values.length > 0) {
        initial[opt.name] = opt.values[0];
      }
    });
    return initial;
  });

  // Intersection observer tracking original CTA scroll bounds
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar only when original cta sentinel is scrolled past top
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdded(true);
    if (onAddToCart) {
      onAddToCart(id, selectedOptions);
    }
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <section className="relative w-full py-12 bg-white text-slate-900 border-b border-slate-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. Main PDP Spotlight details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        
        {/* Left Image Column */}
        <div className="md:col-span-6">
          <div className="w-full aspect-[4/5] bg-slate-50 border border-slate-200/60 rounded-3xl overflow-hidden relative">
            {badgeText && (
              <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                {badgeText}
              </span>
            )}
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </div>

        {/* Right Details Column */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-3">
            <h1 
              className="text-3xl font-black tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              {name}
            </h1>
            <span className="text-xl font-black text-[var(--color-primary,#694873)] block">
              {price}
            </span>
          </div>

          <p className="text-sm text-slate-500 leading-relaxed">
            {description}
          </p>

          {/* Options swatches */}
          {options.length > 0 && (
            <div className="space-y-6 pt-4 border-t border-slate-100">
              {options.map((opt) => (
                <div key={opt.name} className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Select {opt.name}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val) => {
                      const isActive = selectedOptions[opt.name] === val;
                      return (
                        <button
                          key={val}
                          onClick={() => handleOptionSelect(opt.name, val)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 ${
                            isActive
                              ? "bg-slate-900 text-white"
                              : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add to Cart Original Trigger */}
          <div className="pt-4">
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-extrabold tracking-widest uppercase text-white shadow-md active:scale-95 transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: "var(--color-primary, #0f172a)" }}
            >
              {isAdded ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Added To Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add To Checkout</span>
                </>
              )}
            </button>
          </div>

          {/* Sentinel element placed right after the original CTA */}
          <div ref={sentinelRef} className="h-1 w-full" />
        </div>

      </div>

      {/* 2. Floating Sticky "Add to Cart" header bar (slides down from top, height 70px) */}
      <div
        className={`fixed top-0 left-0 w-full z-[999] bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-md transition-transform duration-250 ease-out flex items-center justify-between p-3 px-6 md:px-12 ${
          showStickyBar ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ willChange: "transform" }}
      >
        {/* Product mini thumbnail & title */}
        <div className="flex items-center gap-3.5 max-w-lg">
          <img
            src={imageUrl}
            alt={name}
            className="w-10 h-12 rounded-lg object-cover bg-slate-50 border border-slate-150"
          />
          <div className="hidden sm:block">
            <h4 className="text-xs font-black text-slate-800 line-clamp-1 leading-snug">{name}</h4>
            <span className="text-[10px] font-black text-[var(--color-primary,#694873)]">{price}</span>
          </div>
        </div>

        {/* Small Cart checkout button */}
        <button
          onClick={handleAddToCart}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow transition-all duration-150 active:scale-95 hover:brightness-105"
          style={{ backgroundColor: "var(--color-primary, #0f172a)" }}
        >
          {isAdded ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Buy Now</span>
            </>
          )}
        </button>
      </div>

    </section>
  );
}
