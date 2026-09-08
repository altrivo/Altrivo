"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
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
  Zap,
  Tag,
  ArrowLeft,
  Heart,
  Share2,
} from "lucide-react";
import { useCart } from "@/components/sections/CartContext";
import ProductCard from "@/components/sections/ProductCard";
import type { Product } from "@/types/product";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  storeSlug: string;
  storeName: string;
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  storeSlug,
  storeName,
}: ProductDetailClientProps) {
  const {
    addToCart,
    customer,
    setIsCheckoutOpen,
    setIsCustomerAuthOpen,
    setIsCheckoutGate,
  } = useCart();
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>(
    product.variants && product.variants.length > 0
      ? product.variants[0].title
      : "Standard"
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "shipping">("desc");

  // Multi-image gallery list
  const galleryImages = React.useMemo(() => {
    if (product.images && product.images.length > 0) return product.images;
    if (product.thumbnail) return [product.thumbnail];
    return ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80"];
  }, [product]);

  const rawPrice = product.price || 7800;
  const rawComparePrice = product.compareAtPrice || Math.round(rawPrice * 1.25);
  const discountPercent =
    rawComparePrice > rawPrice
      ? Math.round(((rawComparePrice - rawPrice) / rawComparePrice) * 100)
      : null;

  const handlePrevImage = () => {
    setActiveImgIdx((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImgIdx((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    setIsAdded(true);
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `${product.id}_${selectedVariant}`,
        name: `${product.name} (${selectedVariant})`,
        price: `$${rawPrice.toLocaleString()}`,
        originalPrice: `$${rawComparePrice.toLocaleString()}`,
        image: galleryImages[activeImgIdx] || product.thumbnail,
      });
    }
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (!customer) {
      setIsCheckoutGate(true);
      setIsCustomerAuthOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 select-none">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link
          href={`/store/${storeSlug}`}
          className="hover:text-slate-900 transition-colors flex items-center gap-1 font-bold text-purple-600"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </Link>
        <span>/</span>
        <span className="text-slate-500">{product.category || "Catalog"}</span>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">{product.name}</span>
      </nav>

      {/* Main Product Layout Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT: Multi-Image Interactive Gallery (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden group shadow-inner">
            {product.badge && (
              <span className="absolute top-4 left-4 z-10 px-3.5 py-1 rounded-full text-xs font-black bg-slate-900 text-white shadow-md">
                {product.badge}
              </span>
            )}

            {discountPercent && (
              <span className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-md flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {discountPercent}% OFF
              </span>
            )}

            <img
              src={galleryImages[activeImgIdx] || galleryImages[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            />

            {/* Left / Right Navigation Controls */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-lg transition-all active:scale-90 cursor-pointer"
                  title="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-lg transition-all active:scale-90 cursor-pointer"
                  title="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Photo Counter Pill */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/75 text-white text-xs font-bold backdrop-blur-xs">
              {activeImgIdx + 1} / {galleryImages.length}
            </div>
          </div>

          {/* Thumbnails Row */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {galleryImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    activeImgIdx === idx
                      ? "border-[#694873] ring-2 ring-purple-500/30 scale-105"
                      : "border-slate-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Product Details, Pricing, Variants & CTAs (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                {product.brand || storeName || "StepCraft Heritage"}
              </span>
              <span className="text-xs font-bold text-slate-500">{product.category || "Footwear"}</span>
              {product.sku && (
                <span className="text-xs font-mono text-slate-400 ml-auto">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-black text-slate-800">{product.rating || 4.9}</span>
              <span className="text-xs text-slate-400">
                ({product.reviewsCount || 48} verified customer reviews)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              ${rawPrice.toLocaleString()}
            </span>
            {rawComparePrice > rawPrice && (
              <span className="text-lg text-slate-400 line-through font-semibold">
                ${rawComparePrice.toLocaleString()}
              </span>
            )}
            {discountPercent && (
              <span className="text-xs font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-lg">
                Save ${(rawComparePrice - rawPrice).toLocaleString()} ({discountPercent}%)
              </span>
            )}
          </div>

          {/* Product Summary */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.summary || product.description || "Handcrafted with supreme care using premium selected materials, offering timeless style and long-lasting durability."}
          </p>

          {/* Variants Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center justify-between">
              <span>Select Option / Size:</span>
              <span className="text-purple-600 normal-case font-bold">{selectedVariant}</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {(product.variants && product.variants.length > 0
                ? product.variants.map((v) => v.title || v.id)
                : ["Standard / 41", "Standard / 42", "Standard / 43"]
              ).map((v: string) => (
                <button
                  key={v}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
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

          {/* Quantity Selector & Stock Availability */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1 shadow-xs">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-extrabold text-sm text-slate-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
              <span>In Stock (Nationwide Dispatch in 24h via TCS)</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                isAdded
                  ? "bg-[#694873] text-white"
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
                  <span>Add to Cart • ${(rawPrice * quantity).toLocaleString()}</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 hover:from-purple-800 hover:to-purple-900 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Instant Buy with Escrow</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>100% Escrow</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Truck className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>TCS Express</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <RotateCcw className="w-4 h-4 text-violet-600 flex-shrink-0" />
              <span>7-Day Return</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Section (Description / Craftsmanship Specs / Shipping & Escrow) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-200">
          {[
            { id: "desc", label: "Product Description" },
            { id: "specs", label: "Craftsmanship & Specs" },
            { id: "shipping", label: "Delivery & Returns" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#694873] text-purple-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[90px]">
          {activeTab === "desc" && (
            <p>
              {product.description ||
                "Expertly assembled with meticulous attention to detail. Designed to elevate your daily lifestyle with unmatched quality and comfort. Each piece undergoes comprehensive 12-point quality inspection before nationwide dispatch."}
            </p>
          )}
          {activeTab === "specs" && (
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Materials:</strong> 100% genuine top-grain material with reinforced stitching.</li>
              <li><strong>Hardware:</strong> Solid rust-proof brass hardware and heavy-duty closures.</li>
              <li><strong>Origin:</strong> Handcrafted by heritage artisans in Pakistan.</li>
              <li><strong>Care:</strong> Clean with a soft damp cloth and apply leather conditioner every 6 months.</li>
            </ul>
          )}
          {activeTab === "shipping" && (
            <div className="space-y-2">
              <p>🚚 <strong>Nationwide Express Shipping:</strong> Dispatched via TCS Express Courier with estimated arrival in 2-4 business days.</p>
              <p>🛡️ <strong>A2 Escrow Buyer Protection:</strong> Your payment remains securely locked in DigiShop Escrow until you inspect and accept your parcel.</p>
              <p>🔄 <strong>7-Day Returns:</strong> If you are not 100% satisfied, initiate a free exchange or refund within 7 days.</p>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: 2 Rows of Random Recommended Products (8 Cards) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
              Curated Recommendations
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              You May Also Like
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
            8 Products Selected from Catalog
          </span>
        </div>

        {/* 2 Rows (4 Cards Per Row) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {relatedProducts.map((relProd) => (
            <Link
              key={relProd.id}
              href={`/store/${storeSlug}/product/${relProd.id}`}
              className="block group"
            >
              <ProductCard
                id={relProd.id}
                name={relProd.name}
                price={`$${relProd.price.toLocaleString()}`}
                originalPrice={
                  relProd.compareAtPrice ? `$${relProd.compareAtPrice.toLocaleString()}` : undefined
                }
                image={relProd.thumbnail}
                rating={relProd.rating || 4.9}
                reviewsCount={relProd.reviewsCount || 30}
                badge={relProd.badge}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
