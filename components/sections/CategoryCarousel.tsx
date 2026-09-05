"use client";

import React from "react";

export interface CategoryItem {
  id: string;
  name: string;
  imageUrl: string;
  icon?: string;
  href?: string;
}

export interface CategoryCarouselProps {
  title?: string;
  categories: CategoryItem[];
  itemShape?: "circle" | "card";
}

export default function CategoryCarousel({
  title = "Shop by Category",
  categories = [],
  itemShape = "circle",
}: CategoryCarouselProps) {
  return (
    <section className="py-12 select-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Title */}
      {title && (
        <div className="border-b border-slate-200/50 pb-4">
          <h2 
            className="text-xl font-bold tracking-tight text-[var(--color-text,#1e293b)] sm:text-2xl"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {title}
          </h2>
        </div>
      )}

      {/* Horizontal Swipeable Container */}
      <div 
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory touch-pan-x"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={cat.href || `#`}
            className="group flex flex-col items-center flex-shrink-0 snap-start text-center focus:outline-hidden"
          >
            {itemShape === "circle" ? (
              // Circle Shape Variant
              <div className="space-y-3 flex flex-col items-center">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-50 transition-all duration-300 group-hover:border-[var(--color-primary,#0f172a)] group-hover:shadow-sm">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {cat.icon && (
                    <span className="absolute bottom-1 right-1 bg-white shadow-2xs rounded-full h-6 w-6 flex items-center justify-center text-xs">
                      {cat.icon}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-[var(--color-text,#1e293b)] group-hover:text-[var(--color-primary,#0f172a)] transition-colors duration-200">
                  {cat.name}
                </span>
              </div>
            ) : (
              // Card Shape Variant (Aspect square thumbnail card)
              <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-slate-200/50 shadow-xs transition-all duration-300 hover:shadow-md">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Frosted / Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                  <span className="text-[11px] font-extrabold text-white text-center line-clamp-1 w-full tracking-wide">
                    {cat.name}
                  </span>
                </div>
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
