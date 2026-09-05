"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { FirstProduct, ProductPrompt } from "@/lib/onboarding";

interface Props {
  productData: FirstProduct;
  productPrompt: ProductPrompt;
  onChange: (data: FirstProduct) => void;
  onFinish: () => void;
  onBack: () => void;
}

const SAMPLE_PRODUCT_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    label: "Watch / Lifestyle",
  },
  {
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    label: "Footwear / Sneakers",
  },
  {
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    label: "Electronics / Headphones",
  },
  {
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    label: "Organic Skincare",
  },
];

export function Step4AddProduct({
  productData,
  productPrompt,
  onChange,
  onFinish,
  onBack,
}: Props) {
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);

  // Auto-generate a title if title is empty based on prompt
  useEffect(() => {
    if (!productData.title && productPrompt.prompt) {
      const words = productPrompt.prompt.split(" ").slice(0, 5).join(" ");
      const autoTitle = words.length > 0 ? words.charAt(0).toUpperCase() + words.slice(1) : "Signature Product";
      onChange({ ...productData, title: autoTitle, description: productPrompt.prompt });
    } else if (!productData.title) {
      onChange({ ...productData, title: "Artisan Genuine Leather Wallet" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productPrompt.prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ ...productData, added: true });
    setShowCelebration(true);
  };

  const handleGoToDashboard = () => {
    onFinish();
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-xs font-semibold text-primary-700 border border-primary-100">
          Step 4 of 4 &bull; First Product
        </div>
        <h1 className="text-3xl font-bold text-heading tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Add your first product
        </h1>
        <p className="text-body text-sm max-w-md mx-auto">
          Create your initial store listing. You can add unlimited products and import inventory later from your dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-default p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1">
                Product Title <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                required
                value={productData.title}
                onChange={(e) => onChange({ ...productData, title: e.target.value })}
                placeholder="e.g. Classic Handmade Leather Wallet"
                className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1">
                  Price ($) <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productData.price}
                  onChange={(e) => onChange({ ...productData, price: e.target.value })}
                  placeholder="49.99"
                  className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1">
                  Initial Stock
                </label>
                <input
                  type="number"
                  min={1}
                  value={productData.stock}
                  onChange={(e) => onChange({ ...productData, stock: Number(e.target.value) })}
                  className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1">
                Product Category
              </label>
              <input
                type="text"
                value={productData.category}
                onChange={(e) => onChange({ ...productData, category: e.target.value })}
                placeholder="e.g. Accessories, Leather Goods"
                className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1">
                Short Description
              </label>
              <textarea
                rows={3}
                value={productData.description}
                onChange={(e) => onChange({ ...productData, description: e.target.value })}
                placeholder="Key features, materials, or benefits..."
                className="w-full p-3 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all resize-none"
              />
            </div>
          </div>

          {/* Right Column: Image Picker */}
          <div className="space-y-4 flex flex-col">
            <label className="block text-xs font-bold uppercase tracking-wider text-heading">
              Product Image Preview
            </label>
            
            <div className="relative h-48 w-full rounded-xl overflow-hidden border border-default bg-muted group">
              {productData.imageUrl ? (
                <Image
                  src={productData.imageUrl}
                  alt="Product preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-subtle">
                  <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">No image selected</span>
                </div>
              )}

              <div className="absolute top-2 right-2 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] text-white font-semibold">
                ${productData.price || "0.00"}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-subtle mb-2">
                Choose a sample product photo or paste image URL:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_PRODUCT_IMAGES.map((img, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => onChange({ ...productData, imageUrl: img.url })}
                    className={`relative h-16 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      productData.imageUrl === img.url
                        ? "border-primary-500 ring-2 ring-primary-500"
                        : "border-default opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img.url} alt={img.label} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-default">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-5 h-12 rounded-xl border border-default bg-card text-heading font-medium text-sm hover:bg-muted transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-8 h-12 rounded-xl bg-success-600 text-white font-bold text-sm shadow-lg hover:bg-success-700 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Publish Product & Activate Store</span>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </form>

      {/* Celebration Modal / Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-card border border-default max-w-md w-full rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-bounceIn relative overflow-hidden">
            {/* Sparkle background element */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-accent-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-success-500 to-emerald-400 text-white shadow-xl ring-8 ring-success-100">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-50 text-success-700 text-xs font-bold uppercase tracking-wider border border-success-200">
                🎉 Store Created Successfully!
              </div>
              <h2 className="text-2xl font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
                Congratulations!
              </h2>
              <p className="text-sm text-body leading-relaxed">
                Your store and first product <span className="font-semibold text-heading">&ldquo;{productData.title}&rdquo;</span> are officially ready!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-page border border-default text-left space-y-2 text-xs">
              <div className="flex justify-between text-subtle">
                <span>Setup Progress:</span>
                <span className="font-bold text-success-600">100% Completed</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-success-500 h-full w-full rounded-full" />
              </div>
              <p className="text-[11px] text-subtle text-center pt-1">
                Head over to your dashboard to complete shipping, custom domain, and payout setup.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoToDashboard}
              className="w-full h-12 rounded-xl bg-primary-500 hover:bg-primary-600 text-on-primary font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Go to Vendor Dashboard</span>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
