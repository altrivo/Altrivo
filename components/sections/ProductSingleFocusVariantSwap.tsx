"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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

export default function ProductSingleFocusVariantSwap({
  id,
  name,
  price,
  description,
  imageUrl,
  badgeText = "Variant Swatches",
  options = [],
  onAddToCart,
}: ProductSingleFocusProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeImage, setActiveImage] = useState(imageUrl);
  const [activePrice, setActivePrice] = useState(price);
  const [activeStock, setActiveStock] = useState("In Stock (14 left)");
  const [isPending, startTransition] = useTransition();

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

  // Swatch click triggers immediate state update
  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));

    // Simulating synced image, pricing, and stock label micro-updates
    startTransition(() => {
      if (optionName.toLowerCase() === "color" || optionName.toLowerCase() === "size") {
        if (value.toLowerCase().includes("gold") || value.toLowerCase().includes("large")) {
          setActiveImage("https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600");
          setActivePrice("₨ 38,000");
          setActiveStock("Low Stock (3 items left)");
        } else if (value.toLowerCase().includes("blue") || value.toLowerCase().includes("medium")) {
          setActiveImage("https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600");
          setActivePrice("₨ 34,500");
          setActiveStock("In Stock (9 items left)");
        } else {
          setActiveImage(imageUrl);
          setActivePrice(price);
          setActiveStock("In Stock (22 items left)");
        }
      }
    });
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Crossfading image viewer (~200ms) */}
        <div className="md:col-span-6">
          <div className="w-full aspect-[4/5] bg-slate-50 border border-slate-200/60 rounded-3xl overflow-hidden relative">
            {badgeText && (
              <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                {badgeText}
              </span>
            )}
            {shouldReduceMotion ? (
              <img
                src={activeImage}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }} // exactly 200ms crossfade
                  src={activeImage}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right Side: Product Details & swatches */}
        <div className="md:col-span-6 space-y-6">
          
          {/* Micro text updates (Price and Stock) fade out/in over ~150ms */}
          <div className="space-y-3">
            <h1 
              className="text-3xl font-black tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              {name}
            </h1>

            {shouldReduceMotion ? (
              <div className="space-y-1">
                <span className="text-xl font-black text-[var(--color-primary,#694873)] block">{activePrice}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeStock}</span>
              </div>
            ) : (
              <motion.div
                key={`${activePrice}-${activeStock}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, ease: "easeInOut" }} // exactly 150ms fade
                className="space-y-1"
              >
                <span className="text-xl font-black text-[var(--color-primary,#694873)] block">
                  {activePrice}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {activeStock}
                </span>
              </motion.div>
            )}
          </div>

          <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
            {description}
          </p>

          {/* Options swatches (immediate border/ring changes) */}
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
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-75 active:scale-95 border ${
                            isActive
                              ? "bg-slate-900 border-slate-900 text-white shadow-xs ring-2 ring-slate-950 ring-offset-2"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
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

          {/* Add to Cart Button */}
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
        </div>

      </div>
    </section>
  );
}
