"use client";

import React, { useState } from "react";
import { Star, ShoppingBag, Check } from "lucide-react";
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
  onClick?: () => void;
}

export default function ProductCardZoom({
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
  onClick,
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
      onClick={onClick}
      className="group relative flex flex-col w-full bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer select-none"
    >
      {/* Product Image Wrapper with overflow-hidden */}
      <div className={`w-full ${imageAspect} bg-slate-50 relative overflow-hidden`}>
        {/* Corner Badge */}
        {badge && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
            {badge}
          </span>
        )}

        {/* Zoom Image */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-400 ease-out group-hover:scale-108"
          style={{ willChange: "transform" }}
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

        {/* Pricing & Add to Cart button */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-slate-900">{formatPrice(price)}</span>
            <span className="text-[10px] text-slate-400 line-through font-bold">
              {formatCutPrice(price, originalPrice)}
            </span>
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
    </div>
  );
}
