import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Truck, RotateCcw, Star, ShoppingBag, ArrowLeft, Tag } from "lucide-react";
import { getVendorStoreConfig } from "@/lib/storefront/themeResolver";
import { mockProducts } from "@/lib/mock-products";
import ProductCard from "@/components/sections/ProductCard";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  const config = await getVendorStoreConfig();
  // Find in mock products by ID or SKU or name slug
  const matched = mockProducts.find(
    (p) =>
      p.id.toLowerCase() === id.toLowerCase() ||
      p.sku.toLowerCase() === id.toLowerCase() ||
      p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === id.toLowerCase()
  ) || mockProducts[0];

  return { product: matched, config };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getProduct(resolvedParams.id);
  if (!data) return { title: "Product Not Found" };

  const { product, config } = data;
  const pageTitle = `${product.name} — ${config.storeName}`;
  const pageDescription = `${product.name} handcrafted by master artisans. Price: ₨ ${product.price}. Verified quality with nationwide Cash on Delivery.`;

  return {
    title: pageTitle,
    description: pageDescription,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const data = await getProduct(resolvedParams.id);

  if (!data || !data.product) {
    notFound();
  }

  const { product, config } = data;
  const related = mockProducts.filter((p) => p.id !== product.id).slice(0, 8);

  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail];
  const comparePrice = product.compareAtPrice || Math.round(product.price * 1.25);
  const discount = Math.round(((comparePrice - product.price) / comparePrice) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/preview/stepcraft-premium" className="hover:text-slate-900 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </Link>
          <span>/</span>
          <span className="text-slate-500">{product.category}</span>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Main PDP Grid */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Gallery (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
              {product.badge && (
                <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-white shadow-md">
                  {product.badge}
                </span>
              )}
              <span className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-md flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {discount}% OFF
              </span>
              <img
                src={images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 flex-shrink-0"
                  >
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>


              <h1 className="text-3xl font-extrabold text-slate-900 font-display">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-black text-slate-800">{product.rating || 4.9}</span>
                <span className="text-xs text-slate-400">({product.reviewsCount || 48} verified reviews)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₨ {product.price.toLocaleString()}
              </span>
              <span className="text-base text-slate-400 line-through font-semibold">
                ₨ {comparePrice.toLocaleString()}
              </span>
              <span className="text-xs font-black text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg">
                Save ₨ {(comparePrice - product.price).toLocaleString()} ({discount}%)
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description || product.summary}
            </p>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <Link
                href={`/preview/stepcraft-premium#product-${product.id}`}
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Cart</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>100% Escrow</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Truck className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>Nationwide COD</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <RotateCcw className="w-4 h-4 text-violet-600 flex-shrink-0" />
                <span>7-Day Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Rows of Recommended Products */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
              Curated Catalog
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Recommended For You</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                price={`₨ ${item.price.toLocaleString()}`}
                originalPrice={item.compareAtPrice ? `₨ ${item.compareAtPrice.toLocaleString()}` : undefined}
                image={item.thumbnail}
                rating={item.rating}
                badge={item.badge}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
