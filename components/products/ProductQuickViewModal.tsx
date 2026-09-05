"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Button, Badge } from "@/components/shared";
import { getStoredProductFormData } from "@/lib/product-storage";
import type { Product } from "@/types/product";
import type { ProductFormData, ProductVariant } from "@/types/product-form";

interface ProductQuickViewModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onDuplicate?: (id: string) => void;
}

const shoeFallbackGallery = [
  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1596568359553-a56de6970068?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1581101767113-1677fc2beaa8?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800&auto=format&fit=crop&q=80",
];

function getCategoryFallbackImage(category = "", title = ""): string {
  const combined = (category + " " + title).toLowerCase();
  if (
    combined.includes("shoe") ||
    combined.includes("court") ||
    combined.includes("heel") ||
    combined.includes("pump") ||
    combined.includes("footwear")
  ) {
    return shoeFallbackGallery[0];
  }
  if (
    combined.includes("bag") ||
    combined.includes("handbag") ||
    combined.includes("purse")
  ) {
    return "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80";
  }
  if (combined.includes("watch")) {
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
  }
  if (
    combined.includes("clothing") ||
    combined.includes("dress") ||
    combined.includes("apparel")
  ) {
    return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80";
  }
  return shoeFallbackGallery[0];
}

export function ProductQuickViewModal({
  product,
  open,
  onClose,
  onDuplicate,
}: ProductQuickViewModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (product && open) {
      const stored = getStoredProductFormData(product.id);
      setFormData(stored);
      setActiveImageIndex(0);
      if (stored?.variants && stored.variants.length > 0) {
        setSelectedVariant(stored.variants[0]);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [product, open]);

  if (!open || !product) return null;

  const defaultFallback = getCategoryFallbackImage(product.category, product.name);

  // Helper: only keep persistent URLs (data: or https:), not blob: which expire on refresh
  const isValidUrl = (url: string | null | undefined) =>
    url && !url.startsWith("blob:") && !url.includes("pollinations.ai") &&
    (url.startsWith("data:") || url.startsWith("https://") || url.startsWith("http://"));

  // Single Source of Truth for Media: Prioritize form state images, then product record images
  const formImages = (formData?.images?.map((img) => img.url) || []).filter(isValidUrl) as string[];
  const recordImages = (product.images || [product.thumbnail]).filter(isValidUrl) as string[];

  const rawList = formImages.length > 0 ? formImages : recordImages;
  const imageList: string[] = rawList.length > 0 ? rawList : [defaultFallback];

  const activeImageUrl = imageList[Math.min(activeImageIndex, imageList.length - 1)] || defaultFallback;

  const currentPrice = selectedVariant ? selectedVariant.price : (formData?.price ?? product.price);
  const compareAtPrice = formData?.compareAtPrice || 0;
  const hasDiscount = compareAtPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)
    : 0;

  const totalStock = selectedVariant ? selectedVariant.stock : (formData?.variants?.length ? formData.variants.reduce((acc, v) => acc + (v.stock || 0), 0) : product.stock);

  const handleEdit = () => {
    onClose();
    router.push(`/products/${product.id}/edit`);
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(product.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6 bg-overlay backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl border border-default bg-card shadow-modal overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-default px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <Badge
              variant={product.status === "published" ? "success" : product.status === "draft" ? "gray" : "warning"}
              size="sm"
            >
              {product.status === "published" ? "Published" : product.status === "draft" ? "Draft" : "Out of Stock"}
            </Badge>
            <span className="text-xs text-subtle font-mono">
              SKU: {product.sku}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              ✏️ Edit Product
            </Button>
            <button
              onClick={onClose}
              className="text-subtle hover:text-heading p-2 rounded-lg hover:bg-muted transition-colors text-lg"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Multi-Image Gallery Showcase */}
            <div className="md:col-span-6 space-y-4">
              {/* Main Hero Image Canvas */}
              <div className="relative aspect-square w-full rounded-2xl border border-default bg-muted/40 overflow-hidden shadow-sm group">
                <img
                  src={activeImageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultFallback;
                  }}
                />

                {/* Counter & Status Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/70 text-white backdrop-blur-sm shadow">
                    Photo {activeImageIndex + 1} of {imageList.length}
                  </span>
                  {activeImageIndex === 0 && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-600 text-white shadow">
                      Primary Cover
                    </span>
                  )}
                </div>

                {/* Prev / Next Navigation Arrows */}
                {imageList.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? imageList.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow"
                      aria-label="Previous image"
                    >
                      ←
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === imageList.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow"
                      aria-label="Next image"
                    >
                      →
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Bar (All uploaded images) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-heading uppercase tracking-wider">
                    Product Gallery ({imageList.length} photos)
                  </span>
                  {imageList.length > 1 && (
                    <span className="text-[11px] text-subtle">
                      Click thumbnail to swap preview
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {imageList.map((url, idx) => {
                    const isActive = idx === activeImageIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative h-16 w-16 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${
                          isActive
                            ? "border-primary-500 ring-2 ring-primary-500/20 scale-105 shadow-md"
                            : "border-default opacity-70 hover:opacity-100 hover:border-primary-300"
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              shoeFallbackGallery[idx % shoeFallbackGallery.length];
                          }}
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-primary-500/10" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Product Metadata, Specs & Variants */}
            <div className="md:col-span-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Title & Category */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">
                    {formData?.category || product.category}
                  </span>
                  <h2 className="text-2xl font-bold text-heading mt-1 leading-tight">
                    {product.name}
                  </h2>
                  {formData?.brand && (
                    <p className="text-xs text-subtle mt-1 font-medium">
                      By <span className="text-heading font-semibold">{formData.brand}</span>
                    </p>
                  )}
                </div>

                {/* Price & Savings Display */}
                <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-muted/40 border border-default">
                  <span className="text-3xl font-extrabold text-heading">
                    ${currentPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-subtle line-through">
                        ${compareAtPrice.toFixed(2)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-success-100 text-success-700">
                        Save {discountPercent}%
                      </span>
                    </>
                  )}
                </div>

                {/* Stock & SKU Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-default bg-card">
                    <span className="text-[11px] text-subtle uppercase font-semibold block">
                      Inventory Stock
                    </span>
                    <span className={`text-base font-bold mt-0.5 block ${totalStock === 0 ? "text-error-500" : totalStock < 10 ? "text-warning-600" : "text-heading"}`}>
                      {totalStock} units available
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-default bg-card">
                    <span className="text-[11px] text-subtle uppercase font-semibold block">
                      SKU Code
                    </span>
                    <code className="text-xs font-mono font-bold text-heading mt-1 block">
                      {selectedVariant?.sku || product.sku}
                    </code>
                  </div>
                </div>

                {/* Variants Selection Section */}
                {formData?.variants && formData.variants.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-heading uppercase tracking-wider flex items-center gap-1.5">
                        <span>🔀</span> Product Variants ({formData.variants.length})
                      </span>
                      <span className="text-[11px] text-subtle">
                        Select a variant to preview SKU & price
                      </span>
                    </div>

                    {/* Variant Cards Pill Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {formData.variants.map((v) => {
                        const isSelected = selectedVariant?.id === v.id;
                        const label = Object.entries(v.optionValues)
                          .map(([k, val]) => `${k}: ${val}`)
                          .join(", ");
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariant(v)}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "border-primary-500 bg-primary-50/60 shadow-sm"
                                : "border-default bg-card hover:border-primary-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-heading truncate">
                                {label || v.sku}
                              </span>
                              <span className="text-xs font-extrabold text-primary-600">
                                ${v.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[11px] text-subtle">
                              <span>Stock: {v.stock}</span>
                              <span className="font-mono text-[10px]">{v.sku}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-bold text-heading uppercase tracking-wider">
                    Description
                  </span>
                  <p className="text-xs text-body leading-relaxed bg-card p-3 rounded-xl border border-default max-h-32 overflow-y-auto">
                    {formData?.description || product.description || "No description provided."}
                  </p>
                </div>

                {/* Tags */}
                {formData?.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-muted text-subtle border border-default"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-default">
                <Button variant="primary" size="md" className="flex-1" onClick={handleEdit}>
                  ✏️ Edit Full Product
                </Button>
                {onDuplicate && (
                  <Button variant="ghost" size="md" onClick={handleDuplicate}>
                    📋 Duplicate
                  </Button>
                )}
                <Button variant="ghost" size="md" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
