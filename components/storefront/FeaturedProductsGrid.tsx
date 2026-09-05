"use client";

import { Check, ShoppingBag, Star } from "lucide-react";
import React, { useState } from "react";

import { formatCloudinaryUrl } from "@/lib/storefront/imageOptimizer";
import { StorefrontProduct, VendorStoreConfig } from "@/lib/storefront/themeResolver";


interface FeaturedProductsGridProps {
  config: VendorStoreConfig;
}

export function FeaturedProductsGrid({ config }: FeaturedProductsGridProps) {
  const [activeTab, setActiveTab] = useState<"all" | "bestseller" | "featured">("all");
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const filterProducts = (products: StorefrontProduct[]) => {
    if (activeTab === "bestseller") {
      return products.filter((p) => p.isBestSeller || p.badge.toLowerCase().includes("best"));
    }
    if (activeTab === "featured") {
      return products.filter((p) => p.isFeatured || p.badge.toLowerCase().includes("featured"));
    }
    return products;
  };

  const filteredProducts = filterProducts(config.featuredProducts);

  const handleAddToCart = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setAddedIds((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <section id="catalog" aria-label="Featured Products" className="space-y-6 select-none">
      {/* Header Bar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-default pb-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-heading">
            Featured Artisanal Catalog
          </h2>
          <p className="text-xs text-subtle mt-1">
            Handpicked customer favorites ready for express nationwide delivery
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-xl border border-default self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-card text-heading shadow-xs"
                : "text-subtle hover:text-heading"
            }`}
          >
            All Products
          </button>

          <button
            onClick={() => setActiveTab("bestseller")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "bestseller"
                ? "bg-card text-heading shadow-xs"
                : "text-subtle hover:text-heading"
            }`}
          >
            Best Sellers
          </button>

          <button
            onClick={() => setActiveTab("featured")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "featured"
                ? "bg-card text-heading shadow-xs"
                : "text-subtle hover:text-heading"
            }`}
          >
            Featured
          </button>
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((prod) => {
          const optimizedImage = formatCloudinaryUrl(prod.image, { width: 500, height: 500, crop: "fill" });
          const isAdded = addedIds[prod.id];

          return (
            <div
              key={prod.id}
              className="group rounded-2xl bg-card border border-default p-4 shadow-card hover:shadow-card-hover transition-all duration-normal flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Image Container with Badge */}
                <div className="relative h-48 rounded-xl bg-muted border border-default flex items-center justify-center overflow-hidden">
                  <img
                    src={optimizedImage}
                    alt={prod.name}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-normal"
                    loading="lazy"
                  />

                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-accent-500 text-white shadow-2xs z-10">
                    {prod.badge}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-subtle tracking-wider">
                    {prod.category}
                  </span>
                  <h3 className="font-bold text-sm text-heading line-clamp-2 mt-0.5 group-hover:text-primary-700">
                    {prod.name}
                  </h3>
                </div>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-1.5 text-xs text-subtle">
                  <div className="flex items-center text-warning-500">
                    <Star className="w-3.5 h-3.5 fill-warning-400 text-warning-500" />
                    <span className="font-bold text-heading ml-1">{prod.rating}</span>
                  </div>
                  <span>({prod.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Price & Action Button */}
              <div className="pt-3 border-t border-default flex items-center justify-between gap-2">
                <div>
                  <div className="font-extrabold text-base text-heading leading-tight">
                    {prod.price}
                  </div>
                  <div className="text-[10px] text-subtle line-through">
                    {prod.originalPrice}
                  </div>
                </div>

                <button
                  onClick={(e) => handleAddToCart(prod.id, e)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    isAdded
                      ? "bg-success-600 text-white"
                      : "bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:brightness-110 active:scale-95"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
