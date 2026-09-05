"use client";

import React, { useState } from "react";
import { ProductPrompt } from "@/lib/onboarding";

interface Props {
  data: ProductPrompt;
  onChange: (data: ProductPrompt) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const EXAMPLE_PROMPTS = [
  {
    category: "Fashion & Leather",
    title: "Handcrafted Leather Goods",
    prompt: "Handmade full-grain leather wallets, minimalist belts, and durable travel duffels crafted by local artisans.",
    icon: "👜",
  },
  {
    category: "Beauty & Wellness",
    title: "Organic Skincare Oils",
    prompt: "Cruelty-free organic serum, rosewater face mist, and botanical essential oils packaged in eco-friendly glass bottles.",
    icon: "🌿",
  },
  {
    category: "Tech & Accessories",
    title: "Mechanical Keyboards & Desk Setup",
    prompt: "Custom hot-swappable mechanical keyboards, PBT keycap sets, and ergonomic felt desk pads for tech enthusiasts.",
    icon: "⌨️",
  },
  {
    category: "Food & Gourmet",
    title: "Artisanal Single-Origin Coffee",
    prompt: "Freshly roasted single-origin Arabica coffee beans, cold brew concentrates, and manual pour-over brewing gear.",
    icon: "☕",
  },
  {
    category: "Home & Decor",
    title: "Minimalist Ceramic & Home Decor",
    prompt: "Hand-thrown ceramic tableware, sculptural soy candles, and minimalist Nordic interior vases.",
    icon: "🏺",
  },
  {
    category: "Apparel & Streetwear",
    title: "Sustainable Streetwear Apparel",
    prompt: "Heavyweight organic cotton hoodies, graphic tees, and unisex relaxed-fit streetwear styled with clean typography.",
    icon: "👕",
  },
];

export function Step2ProductPrompt({ data, onChange, onNext, onBack, onSkip }: Props) {
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number | null>(null);

  const handleSelectExample = (promptText: string, index: number) => {
    setSelectedPromptIndex(index);
    onChange({ prompt: promptText, skipped: false });
  };

  const handleTextChange = (text: string) => {
    setSelectedPromptIndex(null);
    onChange({ prompt: text, skipped: false });
  };

  const handleContinue = () => {
    if (!data.prompt.trim()) {
      onSkip();
    } else {
      onNext();
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-xs font-semibold text-primary-700 border border-primary-100">
          Step 2 of 4 &bull; Product Catalog Concept
        </div>
        <h1 className="text-3xl font-bold text-heading tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          What do you sell?
        </h1>
        <p className="text-body text-sm max-w-md mx-auto">
          Describe your main product lineup or pick an example prompt. Our AI will automatically generate catalog ideas, tags, and theme suggestions.
        </p>
      </div>

      <div className="space-y-6 bg-card border border-default p-6 md:p-8 rounded-2xl shadow-sm">
        {/* Main Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-heading flex items-center gap-2">
              <span>Product Line Description</span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-accent-100 text-accent-800">
                AI Powered
              </span>
            </label>
            <span className="text-xs text-subtle">{data.prompt.length} / 500 chars</span>
          </div>

          <textarea
            value={data.prompt}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Describe your products in plain language (e.g., 'I sell handcrafted leather goods and wallets made from sustainable materials...')"
            className="w-full p-4 rounded-xl border border-default bg-input text-heading placeholder:text-subtle text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all resize-none leading-relaxed"
          />

          {data.prompt.trim().length > 10 && (
            <div className="mt-2.5 p-3 rounded-xl bg-success-50 border border-success-200 flex items-center gap-2 text-xs text-success-700 animate-fadeIn">
              <svg className="w-4 h-4 shrink-0 text-success-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>AI prompt detected! We will pre-configure your first product based on this description.</span>
            </div>
          )}
        </div>

        {/* Example Prompts Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-subtle">
              Or pick an example prompt below
            </label>
            <span className="text-xs text-primary-600 font-medium">Click to select</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXAMPLE_PROMPTS.map((item, idx) => {
              const isSelected = selectedPromptIndex === idx || data.prompt === item.prompt;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectExample(item.prompt, idx)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative group cursor-pointer ${
                    isSelected
                      ? "border-primary-500 bg-primary-50/80 ring-1 ring-primary-500 text-primary-950 shadow-sm"
                      : "border-default bg-page hover:border-primary-300 hover:bg-neutral-50 text-body"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-muted text-subtle">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-semibold text-heading group-hover:text-primary-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs text-subtle line-clamp-2 leading-relaxed">
                    &ldquo;{item.prompt}&rdquo;
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="px-5 h-12 rounded-xl text-subtle hover:text-heading font-medium text-sm transition-colors cursor-pointer"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="flex items-center gap-2 px-8 h-12 rounded-xl bg-primary-500 text-on-primary font-semibold text-sm shadow-md hover:bg-primary-600 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Continue to Themes</span>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
