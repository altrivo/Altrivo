"use client";

import React, { useState } from "react";
import { Star, ShoppingBag, Check, Eye } from "lucide-react";
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

export default function ProductCardSlideActions({
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
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

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
      <div className="p-4 pb-16 flex-1 flex flex-col justify-between space-y-2">
        {/* Spacer at bottom accommodates the slide-up panel space */}
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

        {/* Pricing */}
        <div className="flex items-baseline gap-1.5 pt-1">
          <span className="text-sm font-black text-slate-900">{price}</span>
          {originalPrice && (
            <span className="text-[10px] text-slate-400 line-through font-bold">
              {originalPrice}
            </span>
          )}
        </div>
      </div>

      {/* Slide-up Quick Actions Panel (positioned on Card overflow-hidden) */}
      <div
        className="absolute bottom-0 left-0 w-full h-12 bg-slate-950 text-white flex items-center justify-between px-4 z-20 transition-transform duration-250 ease-out translate-y-0 opacity-90 md:translate-y-full md:opacity-100 md:group-hover:translate-y-0"
        style={{ willChange: "transform" }}
      >
        <span className="text-[10px] font-black tracking-widest uppercase">Quick Add</span>
        <button
          onClick={handleAddToCart}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-950 text-[9px] font-black uppercase tracking-wider transition-all duration-150 active:scale-95"
        >
          {isAdded ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Add</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
