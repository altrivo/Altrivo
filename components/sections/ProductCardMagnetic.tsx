"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { Star, ShoppingBag, Check } from "lucide-react";
import { useCart } from "./CartContext";

export interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
  image: string;
  aspectRatio?: "square" | "portrait";
  onAddToCart?: (id: string) => void;
}

export default function ProductCardMagnetic({
  id,
  name,
  price,
  originalPrice,
  rating = 5.0,
  reviewsCount = 0,
  badge,
  image,
  aspectRatio = "portrait",
  onAddToCart,
}: ProductCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const buttonWrapperRef = useRef<HTMLDivElement>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const { addToCart } = useCart();

  // Detect touch inputs
  useEffect(() => {
    const media = window.matchMedia("(hover: hover)");
    setIsTouchDevice(!media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setIsTouchDevice(!e.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdded(true);
    addToCart({
      id,
      name,
      price,
      originalPrice,
      image,
    });
    if (onAddToCart) {
      onAddToCart(id);
    }
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // Motion values for button coordinates
  const buttonX = useMotionValue(0);
  const buttonY = useMotionValue(0);

  const springX = useSpring(buttonX, { stiffness: 220, damping: 16 });
  const springY = useSpring(buttonY, { stiffness: 220, damping: 16 });

  const handleButtonMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || shouldReduceMotion || !buttonWrapperRef.current) return;
    const rect = buttonWrapperRef.current.getBoundingClientRect();
    
    // Calculate distance from button center coordinates
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = e.clientX - centerX;
    const offsetY = e.clientY - centerY;

    // Pull intensity is 30% of cursor offset
    const pullX = offsetX * 0.3;
    const pullY = offsetY * 0.3;

    // Cap pull at max 9px translation bounds
    const maxPull = 9;
    const distance = Math.sqrt(pullX * pullX + pullY * pullY);
    if (distance > maxPull) {
      const angle = Math.atan2(pullY, pullX);
      buttonX.set(Math.cos(angle) * maxPull);
      buttonY.set(Math.sin(angle) * maxPull);
    } else {
      buttonX.set(pullX);
      buttonY.set(pullY);
    }
  };

  const handleButtonMouseLeave = () => {
    buttonX.set(0);
    buttonY.set(0);
  };

  const imageAspect = aspectRatio === "square" ? "aspect-square" : "aspect-[3/4]";

  return (
    <div
      className="group relative flex flex-col w-full bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer select-none shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:border-slate-200/80"
    >
      {/* Product Image Wrapper */}
      <div className={`w-full ${imageAspect} bg-slate-50 relative overflow-hidden`}>
        {/* Corner Badge */}
        {badge && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
            {badge}
          </span>
        )}

        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover select-none pointer-events-none"
          loading="lazy"
        />
      </div>

      {/* Product Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            <span className="text-[10px] font-black">{rating.toFixed(1)}</span>
            {reviewsCount > 0 && (
              <span className="text-[10px] text-slate-400 font-bold">({reviewsCount})</span>
            )}
          </div>

          <h3 className="text-xs font-black text-slate-800 line-clamp-2 leading-snug">
            {name}
          </h3>
        </div>

        {/* Pricing & Magnetic Add to Cart button */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-slate-900">{price}</span>
            {originalPrice && (
              <span className="text-[10px] text-slate-400 line-through font-bold">
                {originalPrice}
              </span>
            )}
          </div>

          {/* Magnetic Wrapper Zone (adds 30px active padding coordinate zone) */}
          <div
            ref={buttonWrapperRef}
            onMouseMove={handleButtonMouseMove}
            onMouseLeave={handleButtonMouseLeave}
            className="p-3 -m-3 flex items-center justify-center relative z-20"
          >
            <motion.button
              onClick={handleAddToCart}
              style={{
                x: isTouchDevice || shouldReduceMotion ? 0 : springX,
                y: isTouchDevice || shouldReduceMotion ? 0 : springY,
              }}
              className="p-2.5 rounded-xl bg-slate-950 text-white hover:bg-slate-900 shadow-sm active:scale-90 transition-transform duration-100 ease-out"
              aria-label="Add to cart"
            >
              {isAdded ? (
                <Check className="h-4 w-4 text-emerald-400 font-black" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
