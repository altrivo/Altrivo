"use client";

import {
  Check,
  PackageX,
  RotateCcw,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";

import { CatalogFilterParams, filterAndSortCatalog } from "@/lib/storefront/catalogService";
import { formatCloudinaryUrl } from "@/lib/storefront/imageOptimizer";


interface CatalogViewProps {
  initialCategorySlug?: string;
  initialQuery?: string;
  title?: string;
  subtitle?: string;
}

export function CatalogView({
  initialCategorySlug,
  initialQuery,
  title,
  subtitle,
}: CatalogViewProps) {
  const [maxPrice, setMaxPrice] = useState<number>(40000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [bestSellersOnly, setBestSellersOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<CatalogFilterParams["sortBy"]>("featured");
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  const materialsList = ["Ceramic", "Canvas Oil", "Wood", "Leather", "Terracotta", "Wool"];

  const toggleMaterial = (mat: string) => {
    if (selectedMaterials.includes(mat)) {
      setSelectedMaterials(selectedMaterials.filter((m) => m !== mat));
    } else {
      setSelectedMaterials([...selectedMaterials, mat]);
    }
  };

  const handleClearFilters = () => {
    setMaxPrice(40000);
    setInStockOnly(false);
    setBestSellersOnly(false);
    setMinRating(0);
    setSelectedMaterials([]);
    setSortBy("featured");
  };

  const hasActiveFilters =
    maxPrice < 40000 ||
    inStockOnly ||
    bestSellersOnly ||
    minRating > 0 ||
    selectedMaterials.length > 0;

  const products = useMemo(() => {
    return filterAndSortCatalog({
      categorySlug: initialCategorySlug,
      searchQuery: initialQuery,
      maxPrice: maxPrice,
      inStockOnly,
      bestSellersOnly,
      minRating: minRating > 0 ? minRating : undefined,
      materials: selectedMaterials,
      sortBy,
    });
  }, [
    initialCategorySlug,
    initialQuery,
    maxPrice,
    inStockOnly,
    bestSellersOnly,
    minRating,
    selectedMaterials,
    sortBy,
  ]);

  const handleAddToCart = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setAddedIds((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Page Header Title & Subtitle */}
      {(title || subtitle) && (
        <div className="border-b border-default pb-4">
          {title && (
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-heading tracking-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-subtle mt-1">{subtitle}</p>
          )}
        </div>
      )}

      {/* Main Grid: Filters Sidebar (3 cols) + Product Grid (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters (Desktop + Mobile Drawer) */}
        <aside
          className={`lg:col-span-3 space-y-6 bg-card border border-default p-5 rounded-2xl shadow-xs ${
            mobileFilterOpen ? "block fixed inset-4 z-modal bg-card overflow-y-auto" : "hidden lg:block"
          }`}
        >
          <div className="flex items-center justify-between border-b border-default pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary-600" />
              <h2 className="font-extrabold text-sm text-heading">Filter Catalog</h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-bold text-primary-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="lg:hidden text-subtle hover:text-heading"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Price Range Slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="price-range-input" className="font-bold text-heading">Max Price</label>
              <span className="font-extrabold text-primary-700">₨ {maxPrice.toLocaleString()}</span>
            </div>
            <input
              id="price-range-input"
              type="range"
              min={3000}
              max={40000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary-600 cursor-pointer h-1.5 bg-muted rounded-lg"
            />
            <div className="flex items-center justify-between text-[10px] text-subtle font-medium">
              <span>₨ 3,000</span>
              <span>₨ 40,000</span>
            </div>
          </div>

          {/* 2. Stock & Status Variants */}
          <div className="space-y-2.5 border-t border-default pt-4">
            <h3 className="font-bold text-xs text-heading">Availability & Status</h3>
            <label className="flex items-center gap-2.5 text-xs text-body cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded accent-primary-600 w-4 h-4"
              />
              <span>In Stock Only</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-body cursor-pointer">
              <input
                type="checkbox"
                checked={bestSellersOnly}
                onChange={(e) => setBestSellersOnly(e.target.checked)}
                className="rounded accent-primary-600 w-4 h-4"
              />
              <span>Best Sellers Only</span>
            </label>
          </div>

          {/* 3. Minimum Rating Filter */}
          <div className="space-y-2.5 border-t border-default pt-4">
            <h3 className="font-bold text-xs text-heading">Customer Rating</h3>
            {[4.9, 4.8, 4.5].map((rating) => (
              <label key={rating} className="flex items-center gap-2 text-xs text-body cursor-pointer">
                <input
                  type="radio"
                  name="rating-filter"
                  checked={minRating === rating}
                  onChange={() => setMinRating(minRating === rating ? 0 : rating)}
                  className="accent-primary-600 w-4 h-4"
                />
                <div className="flex items-center text-warning-500">
                  <Star className="w-3.5 h-3.5 fill-warning-400 text-warning-500" />
                  <span className="font-bold text-heading ml-1">{rating}+ Stars</span>
                </div>
              </label>
            ))}
          </div>

          {/* 4. Material / Style Checkboxes */}
          <div className="space-y-2.5 border-t border-default pt-4">
            <h3 className="font-bold text-xs text-heading">Material & Style</h3>
            {materialsList.map((mat) => (
              <label key={mat} className="flex items-center gap-2.5 text-xs text-body cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMaterials.includes(mat)}
                  onChange={() => toggleMaterial(mat)}
                  className="rounded accent-primary-600 w-4 h-4"
                />
                <span>{mat}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* Right Main Catalog Content (9 cols) */}
        <main className="lg:col-span-9 space-y-6">
          {/* Controls Bar: Mobile filter button, results count, sort dropdown */}
          <div className="flex items-center justify-between gap-4 bg-card border border-default p-3.5 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden px-3 py-1.5 rounded-xl border border-default bg-card text-heading font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-primary-600" />
                <span>Filters</span>
              </button>

              <span className="text-xs font-bold text-heading">
                Showing <span className="text-primary-700">{products.length}</span> Products
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="catalog-sort-select" className="text-xs font-semibold text-subtle hidden sm:inline">Sort by:</label>
              <select
                id="catalog-sort-select"
                aria-label="Sort catalog products"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as CatalogFilterParams["sortBy"])}
                className="h-9 px-3 rounded-xl bg-input border border-default text-xs font-bold text-heading focus:outline-none focus:border-focus"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-subtle font-medium text-[11px]">Active Filters:</span>
              {maxPrice < 40000 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-800 border border-primary-200 text-[11px] font-bold">
                  Under ₨ {maxPrice.toLocaleString()}
                  <button onClick={() => setMaxPrice(40000)}><X className="w-3 h-3 hover:text-error-600" /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-800 border border-primary-200 text-[11px] font-bold">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3 hover:text-error-600" /></button>
                </span>
              )}
              {bestSellersOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-800 border border-primary-200 text-[11px] font-bold">
                  Best Sellers Only
                  <button onClick={() => setBestSellersOnly(false)}><X className="w-3 h-3 hover:text-error-600" /></button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-800 border border-primary-200 text-[11px] font-bold">
                  {minRating}+ Stars
                  <button onClick={() => setMinRating(0)}><X className="w-3 h-3 hover:text-error-600" /></button>
                </span>
              )}
              {selectedMaterials.map((mat) => (
                <span key={mat} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-800 border border-primary-200 text-[11px] font-bold">
                  {mat}
                  <button onClick={() => toggleMaterial(mat)}><X className="w-3 h-3 hover:text-error-600" /></button>
                </span>
              ))}
            </div>
          )}

          {/* Product Grid or Clear Empty State */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => {
                const optimizedImage = formatCloudinaryUrl(prod.image, { width: 500, height: 500, crop: "fill" });
                const isAdded = addedIds[prod.id];

                return (
                  <div
                    key={prod.id}
                    className="group rounded-2xl bg-card border border-default p-4 shadow-card hover:shadow-card-hover transition-all duration-normal flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
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

                      <div className="flex items-center gap-1.5 text-xs text-subtle">
                        <div className="flex items-center text-warning-500">
                          <Star className="w-3.5 h-3.5 fill-warning-400 text-warning-500" />
                          <span className="font-bold text-heading ml-1">{prod.rating}</span>
                        </div>
                        <span>({prod.reviewsCount} reviews)</span>
                      </div>
                    </div>

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
          ) : (
            <div className="rounded-2xl border border-default bg-card p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-subtle">
                <PackageX className="w-8 h-8 text-subtle" />
              </div>

              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-bold text-lg text-heading">No Products Found</h3>
                <p className="text-xs text-subtle leading-relaxed">
                  We couldn&apos;t find any items matching your active filter choices. Try broadening your price range or resetting filters.
                </p>
              </div>

              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 rounded-xl bg-primary-600 text-white font-extrabold text-xs shadow-xs hover:bg-primary-700 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
