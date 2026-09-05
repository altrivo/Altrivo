"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
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

export default function ProductCard3DTilt({
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const { addToCart } = useCart();

  // Detect hover capabilities (touch vs mouse devices)
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

  // Motion values for cursor coordinates
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Physical spring config: stiffness ~150, damping ~15
  const springConfig = { damping: 15, stiffness: 150 };
  
  // Transform percentage coordinates to -8deg to +8deg rotations
  const rotateXVal = useTransform(mouseY, [0, 1], [8, -8]);
  const rotateYVal = useTransform(mouseX, [0, 1], [-8, 8]);

  const rotateX = useSpring(rotateXVal, springConfig);
  const rotateY = useSpring(rotateYVal, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xVal = (e.clientX - rect.left) / rect.width;
    const yVal = (e.clientY - rect.top) / rect.height;
    mouseX.set(xVal);
    mouseY.set(yVal);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const imageAspect = aspectRatio === "square" ? "aspect-square" : "aspect-[3/4]";

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full flex"
      style={{ perspective: "900px" }}
    >
      <motion.div
        style={{
          rotateX: isTouchDevice || shouldReduceMotion ? 0 : rotateX,
          rotateY: isTouchDevice || shouldReduceMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative flex flex-col w-full bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer select-none shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:border-slate-200/60"
      >
        {/* Product Image Wrapper */}
        <div 
          className={`w-full ${imageAspect} bg-slate-50 relative overflow-hidden`}
          style={{ transform: "translateZ(30px)" }} // Pop effect inside 3D space
        >
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
        <div 
          className="p-4 flex-1 flex flex-col justify-between space-y-3"
          style={{ transform: "translateZ(15px)" }}
        >
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

          {/* Pricing & Add to Cart button */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-slate-900">{price}</span>
              {originalPrice && (
                <span className="text-[10px] text-slate-400 line-through font-bold">
                  {originalPrice}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="p-2 rounded-xl border border-slate-100 hover:bg-slate-50 active:scale-90 transition-all duration-150"
              aria-label="Add to cart"
            >
              {isAdded ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <ShoppingBag className="h-4 w-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
