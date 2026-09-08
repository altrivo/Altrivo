"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Check, Eye } from "lucide-react";
import { useCart } from "./CartContext";
import { formatPrice, formatCutPrice } from "@/lib/storefront/priceUtils";

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

export default function ProductCardFlip({
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const { addToCart } = useCart();

  // Detect hover capabilities
  useEffect(() => {
    const media = window.matchMedia("(hover: hover)");
    setIsTouchDevice(!media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setIsTouchDevice(!e.matches);
    };
    media.addEventListener("change", listener);
    return () => {
      media.removeEventListener("change", listener);
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    hoverTimeout.current = setTimeout(() => {
      setIsFlipped(true);
    }, 150); // 150ms delay to avoid accidental triggers
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setIsFlipped(false); // No delay on exit
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isTouchDevice) {
      e.preventDefault();
      setIsFlipped(!isFlipped); // Tap to flip
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdded(true);
    addToCart({
      id,
      name,
      price: formatPrice(price),
      originalPrice: formatCutPrice(price, originalPrice),
      image,
    });
    if (onAddToCart) {
      onAddToCart(id);
    }
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const imageAspect = aspectRatio === "square" ? "aspect-square" : "aspect-[3/4]";

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      className="w-full relative select-none cursor-pointer"
      style={{ perspective: "1000px" }}
    >
      {/* Self-contained CSS backface injector */}
      <style>{`
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>

      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        
        {/* ==================== 1. FRONT FACE ==================== */}
        <div 
          className={`w-full bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.05)] backface-hidden z-10 flex flex-col justify-between`}
        >
          {/* Image Pane */}
          <div className={`w-full ${imageAspect} bg-slate-50 relative overflow-hidden`}>
            {badge && (
              <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider">
                {badge}
              </span>
            )}
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Details Pane */}
          <div className="p-4 flex flex-col space-y-2">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span className="text-[10px] font-black">{rating.toFixed(1)}</span>
            </div>
            <h3 className="text-xs font-black text-slate-800 line-clamp-1 leading-snug">
              {name}
            </h3>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-slate-900">{formatPrice(price)}</span>
              <span className="text-[10px] text-slate-400 line-through font-bold">
                {formatCutPrice(price, originalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* ==================== 2. BACK FACE ==================== */}
        <div
          className={`absolute inset-0 w-full h-full bg-slate-950 border border-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between backface-hidden shadow-lg z-0`}
          style={{ transform: "rotateY(180deg)" }}
        >
          {/* Top Description info */}
          <div className="space-y-3 pt-2">
            <span className="inline-block px-2 py-0.5 rounded bg-white/10 text-white text-[8px] font-bold uppercase tracking-widest">
              Quick Details
            </span>
            <h4 className="text-xs font-black line-clamp-2 leading-snug">{name}</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-4">
              Premium artisanal handmade pottery crafted with local earth glazes. Certified and inspected for delivery safety.
            </p>
          </div>

          {/* Bottom CTA Actions */}
          <div className="space-y-2 pb-1">
            <div className="flex justify-between items-baseline text-xs font-black border-b border-white/15 pb-2">
              <span className="text-slate-400">Total Price</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm text-amber-400">{formatPrice(price)}</span>
                <span className="text-[10px] text-slate-400 line-through">
                  {formatCutPrice(price, originalPrice)}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-slate-950 text-[10px] font-extrabold uppercase tracking-widest transition-all duration-150"
            >
              {isAdded ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Add To Cart</span>
                </>
              )}
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
