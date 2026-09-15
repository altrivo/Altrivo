"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Sparkles,
  Zap,
  Tag,
} from "lucide-react";
import { useCart } from "./CartContext";
import { mockProducts } from "@/lib/mock-products";
import ProductCard from "./ProductCard";

export interface ProductDetailModalProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
  allProducts?: any[];
  onSelectProduct?: (product: any) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  allProducts = mockProducts,
  onSelectProduct,
}: ProductDetailModalProps) {
  const { addToCart, setIsCheckoutOpen } = useCart();
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "shipping">("desc");

  // Ensure images array has at least 3-4 images
  const images = React.useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    if (product.thumbnail) return [product.thumbnail];
    return ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80"];
  }, [product]);

  // Reset states when a new product is selected
  useEffect(() => {
    if (product) {
      setActiveImgIndex(0);
      setQuantity(1);
      setIsAdded(false);
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0].title || product.variants[0].id);
      } else {
        setSelectedVariant("Standard");
      }
    }
  }, [product]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const rawPrice =
    typeof product.price === "number"
      ? product.price
      : parseFloat(String(product.price).replace(/[^0-9.]/g, "")) || 6500;

  const rawComparePrice =
    typeof product.compareAtPrice === "number"
      ? product.compareAtPrice
      : typeof product.originalPrice === "number"
      ? product.originalPrice
      : parseFloat(String(product.originalPrice || product.compareAtPrice || "").replace(/[^0-9.]/g, "")) ||
        Math.round(rawPrice * 1.25);

  const discountPercent =
    rawComparePrice > rawPrice
      ? Math.round(((rawComparePrice - rawPrice) / rawComparePrice) * 100)
      : null;

  const handlePrevImage = () => {
    setActiveImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    setIsAdded(true);
    const itemSku = product.sku || product.product_sku || (product.id ? `SKU-${product.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}` : "SKU-ALT-001");
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `${product.id || "p"}_${selectedVariant}`,
        name: `${product.name} (${selectedVariant})`,
        price: `$${rawPrice.toLocaleString()}`,
        originalPrice: `$${rawComparePrice.toLocaleString()}`,
        image: images[activeImgIndex] || product.thumbnail || product.image,
        variant: selectedVariant,
        sku: itemSku,
      });
    }
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    onClose();
    setIsCheckoutOpen(true);
  };

  // Get 8 related / recommended products for the 2 rows
  const relatedProducts = (allProducts || mockProducts)
    .filter((p) => p.id !== product.id)
    .slice(0, 8);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition-all shadow-lg active:scale-95 cursor-pointer"
          aria-label="Close product view"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8 divide-y divide-slate-100">
          
          {/* Top Main Section: Gallery on Left + Info & Purchase on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* LEFT: Multi-Image Interactive Gallery (5 Cols) */}
            <div className="lg:col-span-6 space-y-3">
              {/* Main Image Container with Next/Prev Controls */}
              <div className="relative aspect-square w-full rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden group shadow-inner">
                {product.badge && (
                  <span className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-white shadow-md">
                    {product.badge}
                  </span>
                )}

                {discountPercent && (
                  <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-md flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {discountPercent}% OFF
                  </span>
                )}

                <img
                  src={images[activeImgIndex] || images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                />

                {/* Left / Right Arrow Buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md transition-all active:scale-90 cursor-pointer"
                      title="Previous Image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md transition-all active:scale-90 cursor-pointer"
                      title="Next Image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Counter Pill */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900/75 text-white text-[10px] font-bold">
                  {activeImgIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                        activeImgIndex === idx
                          ? "border-emerald-500 ring-2 ring-emerald-500/30 scale-105"
                          : "border-slate-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product Info, Variants, Quantity & Buy CTAs (7 Cols) */}
            <div className="lg:col-span-6 space-y-5">
              {/* Brand & Category */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {product.brand || "StepCraft Heritage"}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {product.category || "Footwear"}
                  </span>
                  {product.sku && (
                    <span className="text-[10px] font-mono text-slate-400 ml-auto">
                      SKU: {product.sku}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-black text-slate-800">
                    {product.rating || 4.9}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({product.reviewsCount || 48} verified reviews)
                  </span>
                </div>
              </div>

              {/* Price & Savings */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  ${rawPrice.toLocaleString()}
                </span>
                {rawComparePrice > rawPrice && (
                  <span className="text-base text-slate-400 line-through font-semibold">
                    ${rawComparePrice.toLocaleString()}
                  </span>
                )}
                {discountPercent && (
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                    Save ${(rawComparePrice - rawPrice).toLocaleString()} ({discountPercent}%)
                  </span>
                )}
              </div>

              {/* Summary */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.summary || product.description || "Handcrafted with supreme care using premium selected materials, offering timeless style and long-lasting durability."}
              </p>

              {/* Variants Selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center justify-between">
                  <span>Select Option / Size:</span>
                  <span className="text-emerald-600 normal-case font-bold">{selectedVariant}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {(product.variants && product.variants.length > 0
                    ? product.variants.map((v: any) => v.title || v.id)
                    : ["Standard / 41", "Standard / 42", "Standard / 43"]
                  ).map((v: string) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        selectedVariant === v
                          ? "bg-slate-900 text-white border-slate-900 shadow-md scale-102"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector & Stock Info */}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1 shadow-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-extrabold text-sm text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>In Stock (Nationwide Dispatch in 24h)</span>
                </div>
              </div>

              {/* Action CTA Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                    isAdded
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Shopping Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart â€¢ â‚¨ {(rawPrice * quantity).toLocaleString()}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>Instant Buy with Escrow</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-semibold">
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>100% Escrow</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <Truck className="w-4 h-4 text-sky-600 flex-shrink-0" />
                  <span>TCS Express</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <RotateCcw className="w-4 h-4 text-violet-600 flex-shrink-0" />
                  <span>7-Day Return</span>
                </div>
              </div>

            </div>
          </div>

          {/* Middle Section: Tabs (Description / Specifications / Shipping Policy) */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200">
              {[
                { id: "desc", label: "Product Description" },
                { id: "specs", label: "Craftsmanship & Specs" },
                { id: "shipping", label: "Delivery & Returns" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                    activeTab === tab.id
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[80px]">
              {activeTab === "desc" && (
                <p>
                  {product.description ||
                    "Expertly assembled with meticulous attention to detail. Designed to elevate your daily lifestyle with unmatched quality and comfort. Each piece undergoes comprehensive 12-point quality inspection before nationwide dispatch."}
                </p>
              )}
              {activeTab === "specs" && (
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Materials:</strong> 100% genuine top-grain material with reinforced stitching.</li>
                  <li><strong>Hardware:</strong> Solid rust-proof brass hardware and heavy-duty YKK closures.</li>
                  <li><strong>Origin:</strong> Handcrafted by heritage artisans in Pakistan.</li>
                  <li><strong>Care:</strong> Clean with a soft damp cloth and apply conditioner every 6 months.</li>
                </ul>
              )}
              {activeTab === "shipping" && (
                <div className="space-y-2 text-xs">
                  <p>ðŸšš <strong>Nationwide Shipping:</strong> Dispatched via TCS Express Courier with estimated arrival in 2-4 business days.</p>
                  <p>ðŸ›¡ï¸ <strong>A2 Escrow Protection:</strong> Your payment remains securely locked in DigiShop Escrow until you inspect and accept your package.</p>
                  <p>ðŸ”„ <strong>7-Day Returns:</strong> If you are not 100% satisfied, initiate a free exchange or refund within 7 days.</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: 2 Rows of Recommended Products (8 Cards) */}
          <div className="pt-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Recommended For You
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  You May Also Like
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                8 Selected Catalog Items
              </span>
            </div>

            {/* 2 Rows of 4 Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((relProd: any) => (
                <div
                  key={relProd.id}
                  onClick={() => onSelectProduct?.(relProd)}
                  className="cursor-pointer"
                >
                  <ProductCard
                    id={relProd.id}
                    name={relProd.name}
                    price={`$${Number(relProd.price).toLocaleString()}`}
                    originalPrice={relProd.compareAtPrice ? `$${Number(relProd.compareAtPrice).toLocaleString()}` : undefined}
                    image={relProd.thumbnail || relProd.image || relProd.images?.[0]}
                    rating={relProd.rating || 4.9}
                    badge={relProd.badge}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
