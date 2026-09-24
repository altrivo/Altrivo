"use client";

import React from "react";
import ProductCard, { ProductCardProps } from "./ProductCard";
import { useCart } from "./CartContext";

export interface ProductGridFeaturedProps {
  title: string;
  subtitle?: string;
  limit?: number;
  columns?: 3 | 4;
  products: ProductCardProps[];
  storeSlug?: string;
}

export default function ProductGridFeatured({
  title,
  subtitle,
  limit = 4,
  columns = 4,
  products = [],
  storeSlug,
}: ProductGridFeaturedProps) {
  // Slice products based on limit
  const visibleProducts = products.slice(0, limit);

  // Set grid columns based on props
  const gridColClass = columns === 3 
    ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3" 
    : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <section className="py-8 sm:py-12 select-none space-y-6 sm:space-y-8 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center sm:text-left border-b border-slate-200/50 pb-3 sm:pb-4 space-y-1">
        <h2 
          className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-[var(--color-text,#1e293b)]"
          style={{ fontFamily: "var(--font-heading, inherit)" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg">
            {subtitle}
          </p>
        )}
      </div>

      {/* Grid Layout */}
      {visibleProducts.length > 0 ? (
        <div className={`grid gap-3 sm:gap-6 ${gridColClass}`}>
          {visibleProducts.map((product, pIdx) => (
            <ProductCard
              key={product.id || product.name || `prod-feat-${pIdx}`}
              {...product}
              storeSlug={storeSlug}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-1.5">
          <p className="text-sm font-semibold text-slate-700">No products added yet</p>
          <p className="text-xs text-slate-400 max-w-sm">Products added to this store will appear here.</p>
        </div>
      )}
    </section>
  );
}
