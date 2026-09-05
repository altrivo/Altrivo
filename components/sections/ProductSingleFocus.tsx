"use client";

import React, { useState } from "react";
import { Star, ShoppingBag, Check } from "lucide-react";
import { useCart } from "./CartContext";

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

export default function ProductSingleFocus({
  id,
  name,
  price,
  description,
  imageUrl,
  badgeText = "Editor's Choice",
  options = [],
  onAddToCart,
}: ProductSingleFocusProps) {
  // Setup state for chosen options (e.g., { Size: "M", Color: "Gold" })
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
  const { addToCart } = useCart();

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdded(true);
    
    // Construct variant string from selected options
    const variantString = Object.entries(selectedOptions)
      .map(([key, val]) => `${key}: ${val}`)
      .join(" / ");

    addToCart({
      id: `${id}${variantString ? `-${variantString}` : ""}`,
      name,
      price,
      image: imageUrl,
      variant: variantString || undefined,
    });

    if (onAddToCart) {
      onAddToCart(id, selectedOptions);
    }
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <section className="py-16 select-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* Left Side: Editorial Image Block */}
        <div className="relative group overflow-hidden rounded-3xl border border-slate-200/50 bg-slate-50 p-4 shadow-md max-w-lg mx-auto lg:max-w-none w-full">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {badgeText && (
              <span 
                className="absolute left-4 top-4 z-10 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm"
                style={{ backgroundColor: "var(--color-secondary, #d97706)" }}
              >
                {badgeText}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Product Details & Purchase Panel */}
        <div className="space-y-6 lg:max-w-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Featured Showcase</span>
            </div>
            <h2 
              className="text-3xl font-extrabold tracking-tight text-[var(--color-text,#1e293b)] sm:text-4xl"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              {name}
            </h2>
            <div className="text-2xl font-black text-[var(--color-primary,#0f172a)] mt-1">
              {price}
            </div>
          </div>

          {/* Description */}
          <p className="text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
            {description}
          </p>

          {/* Dynamic Variant Options Selectors */}
          {options.length > 0 && (
            <div className="space-y-4 border-t border-slate-100 pt-4">
              {options.map((opt) => (
                <div key={opt.name} className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Select {opt.name}: <span className="text-[var(--color-primary,#0f172a)] font-extrabold">{selectedOptions[opt.name]}</span>
                  </span>
                  
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val) => {
                      const isSelected = selectedOptions[opt.name] === val;
                      return (
                        <button
                          key={val}
                          onClick={() => handleOptionSelect(opt.name, val)}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border duration-200 cursor-pointer ${
                            isSelected
                              ? "border-[var(--color-primary,#0f172a)] bg-[var(--color-primary,#0f172a)] text-white shadow-xs"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
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

          {/* Action Button Section */}
          <div className="border-t border-slate-100 pt-6">
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-2xl text-sm font-extrabold tracking-wide shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-white active:scale-[0.98] ${
                isAdded 
                  ? "bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                  : "bg-[var(--color-primary,#0f172a)] hover:brightness-110 hover:shadow-[0_0_20px_var(--color-primary)]"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Successfully Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Secure Checkout / Add to Cart</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
