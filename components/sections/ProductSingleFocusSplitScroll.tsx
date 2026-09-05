"use client";

import React, { useState } from "react";
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

export default function ProductSingleFocusSplitScroll({
  id,
  name,
  price,
  description,
  imageUrl,
  badgeText = "Split Scroll Showcase",
  options = [],
  onAddToCart,
}: ProductSingleFocusProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    options.forEach((opt) => {
      if (opt.values && opt.values.length > 0) {
        initial[opt.name] = opt.values[0];
      }
    });
    return initial;
  });

  const [isAdded, setIsAdded] = useState(false);

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
      {/* 2-Column Split Scroll Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        
        {/* Left Sticky Gallery Column (height capped to viewport, internal scrolling allowed) */}
        <div 
          className="md:col-span-6 md:sticky md:top-24 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-none"
        >
          <div className="w-full aspect-[4/5] bg-slate-50 border border-slate-200/60 rounded-3xl overflow-hidden relative">
            {badgeText && (
              <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                {badgeText}
              </span>
            )}
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="eager"
            />
          </div>
        </div>

        {/* Right Scrollable Details Column */}
        <div className="md:col-span-6 space-y-8 pr-4">
          <div className="space-y-3">
            <h1 
              className="text-3xl lg:text-4xl font-black tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              {name}
            </h1>
            <span className="text-2xl font-black text-[var(--color-primary,#694873)] block">
              {price}
            </span>
          </div>

          <div className="border-t border-b border-slate-100 py-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Description</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Options / Swatches selectors */}
          {options.length > 0 && (
            <div className="space-y-6">
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
                              ? "bg-slate-900 text-white shadow-xs"
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

          {/* Add to Cart button */}
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

          {/* Scrolling details section (Specs list to demonstrate split-scroll) */}
          <div className="pt-6 border-t border-slate-100 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Product Specifications</h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-bold">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="block text-[9px] text-slate-400 uppercase font-black">Material</span>
                <span className="text-slate-700">100% Sourced Riverbed Clay</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="block text-[9px] text-slate-400 uppercase font-black">Glaze finish</span>
                <span className="text-slate-700">Double-Wall Silica Glaze</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="block text-[9px] text-slate-400 uppercase font-black">Pottery technique</span>
                <span className="text-slate-700">Wheel-Thrown Kiln-Fired</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="block text-[9px] text-slate-400 uppercase font-black">Safety grade</span>
                <span className="text-slate-700">Food Safe & Non-Toxic</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
