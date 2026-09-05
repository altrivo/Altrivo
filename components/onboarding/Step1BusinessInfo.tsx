"use client";

import React, { useState } from "react";
import { BusinessInfo } from "@/lib/onboarding";

interface Props {
  data: BusinessInfo;
  onChange: (data: BusinessInfo) => void;
  onNext: () => void;
}

const CATEGORIES = [
  { id: "Fashion & Apparel", label: "Fashion & Apparel", icon: "👕" },
  { id: "Beauty & Personal Care", label: "Beauty & Personal Care", icon: "✨" },
  { id: "Electronics & Gadgets", label: "Electronics & Gadgets", icon: "⚡" },
  { id: "Home & Living", label: "Home & Living", icon: "🏠" },
  { id: "Food & Beverage", label: "Food & Beverage", icon: "☕" },
  { id: "Handcrafted Goods", label: "Handcrafted Goods", icon: "🎨" },
];

const REGIONS = [
  { id: "Pakistan", label: "Pakistan (Domestic)" },
  { id: "GCC & Middle East", label: "Middle East / GCC" },
  { id: "North America", label: "North America (US & Canada)" },
  { id: "Europe", label: "Europe & UK" },
  { id: "Global", label: "Global / Worldwide" },
];

const CATALOG_SIZES = [
  { id: "1-10", label: "1 - 10 products", sub: "Small curated boutique" },
  { id: "10-50", label: "10 - 50 products", sub: "Growing brand catalog" },
  { id: "50-200", label: "50 - 200 products", sub: "Medium enterprise scale" },
  { id: "200+", label: "200+ products", sub: "Large inventory store" },
];

export function Step1BusinessInfo({ data, onChange, onNext }: Props) {
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.storeName.trim()) {
      setError("Please enter your store or business name");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-xs font-semibold text-primary-700 border border-primary-100">
          Step 1 of 4 &bull; Store Foundation
        </div>
        <h1 className="text-3xl font-bold text-heading tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Tell us about your business
        </h1>
        <p className="text-body text-sm max-w-md mx-auto">
          We&apos;ll tailor your AI assistant, store design, and features based on your market and catalog size.
        </p>
      </div>

      <div className="space-y-6 bg-card border border-default p-6 md:p-8 rounded-2xl shadow-sm">
        {/* Store Name Input */}
        <div>
          <label className="block text-sm font-semibold text-heading mb-1.5">
            Business or Store Name <span className="text-error-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.storeName}
              onChange={(e) => {
                onChange({ ...data, storeName: e.target.value });
                if (error) setError("");
              }}
              placeholder="e.g. Apex Artisans, Velvet & Co."
              className={`w-full h-12 px-4 rounded-xl border bg-input text-heading placeholder:text-subtle text-sm focus:outline-none transition-all ${
                error
                  ? "border-error-500 ring-2 ring-error-500/10"
                  : "border-default focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
              }`}
            />
            {data.storeName && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-success-500">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
          {error && <p className="mt-1.5 text-xs text-error-500 flex items-center gap-1">{error}</p>}
        </div>

        {/* Business Category */}
        <div>
          <label className="block text-sm font-semibold text-heading mb-2">
            Primary Industry / Category
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {CATEGORIES.map((cat) => {
              const isSelected = data.category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => onChange({ ...data, category: cat.id })}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all text-sm font-medium ${
                    isSelected
                      ? "border-primary-500 bg-primary-50 text-primary-900 shadow-sm ring-1 ring-primary-500"
                      : "border-default bg-page hover:border-strong text-body"
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Region */}
        <div>
          <label className="block text-sm font-semibold text-heading mb-1.5">
            Target Region / Main Customer Base
          </label>
          <select
            value={data.targetRegion}
            onChange={(e) => onChange({ ...data, targetRegion: e.target.value })}
            className="w-full h-12 px-4 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all cursor-pointer"
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Catalog Scale */}
        <div>
          <label className="block text-sm font-semibold text-heading mb-2">
            Expected Product Catalog Scale
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATALOG_SIZES.map((size) => {
              const isSelected = data.expectedProducts === size.id;
              return (
                <button
                  type="button"
                  key={size.id}
                  onClick={() => onChange({ ...data, expectedProducts: size.id })}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-primary-500 bg-primary-50/70 text-primary-950 shadow-sm ring-1 ring-primary-500"
                      : "border-default bg-page hover:border-strong text-body"
                  }`}
                >
                  <div className="font-semibold text-sm text-heading">{size.label}</div>
                  <div className="text-xs text-subtle mt-0.5">{size.sub}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="flex items-center gap-2 px-8 h-12 rounded-xl bg-primary-500 text-on-primary font-semibold text-sm shadow-md hover:bg-primary-600 active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>Continue to Products</span>
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </form>
  );
}
