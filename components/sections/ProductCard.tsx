"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  storeSlug?: string;
  href?: string;
  onAddToCart?: (id: string) => void;
  onClick?: () => void;
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  rating = 5.0,
  reviewsCount = 0,
  badge,
  image,
  aspectRatio = "portrait",
  storeSlug,
  href,
  onAddToCart,
  onClick,
}: ProductCardProps) {
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (href) {
      router.push(href);
      return;
    }
    if (storeSlug) {
      router.push(`/store/${storeSlug}/product/${id}`);
      return;
    }
    router.push(`/product/${id}`);
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

  const aspectClass = aspectRatio === "square" ? "aspect-square" : "aspect-[4/5]";

  return (
    <div 
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/50 bg-[var(--color-bg,#ffffff)] p-2 sm:p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
    >
      <div className="space-y-2 sm:space-y-3">
        {/* Image Container with Zoom & Badge */}
        <div className={`relative w-full ${aspectClass} overflow-hidden rounded-xl bg-slate-100`}>
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Badge (uses secondary theme color) */}
          {badge && (
            <span 
              className="absolute left-2 top-2 sm:left-2.5 sm:top-2.5 z-10 rounded-full px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide text-[var(--color-bg,#ffffff)] shadow-xs"
              style={{ backgroundColor: "var(--color-secondary, #d97706)" }}
            >
              {badge}
            </span>
          )}

          {/* Quick Add Overlay on Hover (Desktop) */}
          <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full p-2 sm:p-3 transition-transform duration-300 group-hover:translate-y-0 hidden sm:block">
            <button
              onClick={handleAddToCart}
              className={`w-full py-2 sm:py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                isAdded 
                  ? "bg-emerald-500 text-slate-950" 
                  : "bg-[var(--color-primary,#0f172a)] hover:bg-emerald-500 text-white hover:text-slate-950"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Text Info */}
        <div className="space-y-1 px-0.5 sm:px-1">
          <h3 
            className="font-bold text-xs sm:text-sm text-[var(--color-text,#1e293b)] line-clamp-2 leading-snug group-hover:text-[var(--color-primary,#0f172a)] transition-colors duration-200"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500">
            <div className="flex items-center text-amber-500">
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-500" />
              <span className="ml-1 font-bold text-slate-700">{rating.toFixed(1)}</span>
            </div>
            <span className="hidden sm:inline">({reviewsCount} reviews)</span>
          </div>
        </div>
      </div>

      {/* Pricing & Footer Actions */}
      <div className="mt-2 sm:mt-3 border-t border-slate-100 pt-2 sm:pt-3 flex items-center justify-between px-0.5 sm:px-1 gap-1.5">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="text-xs sm:text-base font-extrabold text-[var(--color-text,#1e293b)] leading-tight truncate">
            {formatPrice(price)}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 line-through truncate font-medium">
            {formatCutPrice(price, originalPrice)}
          </span>
        </div>

        {/* Static Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl shadow-xs transition-all duration-200 flex items-center justify-center cursor-pointer flex-shrink-0 active:scale-95 ${
            isAdded 
              ? "bg-emerald-500 text-slate-950" 
              : "bg-[var(--color-primary,#0f172a)] hover:bg-emerald-500 text-white hover:text-slate-950"
          }`}
          aria-label="Add to cart"
        >
          {isAdded ? (
            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          ) : (
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
