"use client";

import React, { useState } from "react";
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
  galleryImages?: string[]; // Swappable image rail
}

const DEFAULT_GALLERY = [
  "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600",
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600",
  "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600",
];

export default function ProductSingleFocusGallery({
  id,
  name,
  price,
  description,
  imageUrl,
  badgeText = "Gallery Rails",
  options = [],
  onAddToCart,
  galleryImages,
}: ProductSingleFocusProps) {
  const shouldReduceMotion = useReducedMotion();
  const images = galleryImages || [imageUrl, DEFAULT_GALLERY[1], DEFAULT_GALLERY[2]];

  const [activeImage, setActiveImage] = useState(images[0]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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
      {/* Dynamic Preload adjacent image layer on hover */}
      {hoveredIndex !== null && images[hoveredIndex] && (
        <div className="hidden">
          <img src={images[hoveredIndex]} alt="Preloaded details" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Thumbnail Rail + Crossfading main viewer */}
        <div className="md:col-span-6 flex flex-col sm:flex-row-reverse gap-4">
          
          {/* Main Viewer - Aspect ratio locked aspect-[4/5] */}
          <div className="flex-1 aspect-[4/5] bg-slate-50 border border-slate-200/60 rounded-3xl overflow-hidden relative">
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
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  src={activeImage}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            )}
          </div>

          {/* Left/Bottom Thumbnail Rail */}
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-x-visible gap-3 sm:w-20 py-2 sm:py-0 scrollbar-none justify-center">
            {images.map((img, idx) => {
              const isActive = activeImage === img;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`w-14 h-18 sm:w-20 sm:h-24 flex-shrink-0 bg-slate-50 border rounded-xl overflow-hidden transition-all duration-200 select-none ${
                    isActive 
                      ? "border-slate-900 scale-95" 
                      : "border-slate-200/80 hover:border-slate-400 hover:scale-98"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${name} gallery view ${idx + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Product Description */}
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

          {/* Options / Swatches selectors */}
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

          {/* Add to Cart CTA */}
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
