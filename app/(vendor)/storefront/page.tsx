"use client";

import { ExternalLink, Layout, Palette, Sparkles, Store, Wand2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

import { StorefrontPreviewModal } from "@/components/storefront/StorefrontPreviewModal";

export default function StorefrontPage() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-heading">
            Storefront Builder &amp; Customizer
          </h1>
          <p className="text-xs text-subtle mt-1">
            Customize your 3D storefront theme, homepage banners, logo, and featured collections.
          </p>
        </div>

        <button
          onClick={() => setIsPreviewOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs shadow-md hover:bg-primary-700 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Preview Live Storefront</span>
        </button>
      </div>

      {/* AI Store Builder CTA */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950 via-teal-900 to-purple-950 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-emerald-800">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span>AI Store Generation Engine</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
            Create Your Store with AI
          </h2>

          <p className="text-xs text-emerald-100/90 leading-relaxed">
            Describe your business in one sentence and let AI build a complete, publishable store — hero, products, categories, SEO, and more — in under 30 seconds.
          </p>
        </div>

        <Link
          href="/store-builder"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-purple-950 font-extrabold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-purple-950" />
          <span>Build My Store</span>
        </Link>
      </div>

      {/* AI Theme Rebranding Studio Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary-950 via-primary-900 to-[#3B2742] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-primary-800">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-accent-200 text-xs font-bold">
            <Wand2 className="w-3.5 h-3.5 text-accent-300" />
            <span>AI Powered Theme Customizer</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
            AI Theme Rebranding Studio
          </h2>

          <p className="text-xs text-accent-100/90 leading-relaxed">
            Type style prompts like &quot;modern minimal&quot; or &quot;luxurious gold accents&quot; to generate side-by-side live previews in &lt;3s.
          </p>
        </div>

        <Link
          href="/storefront/theme"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-accent-400 to-accent-500 text-primary-950 font-extrabold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-primary-950" />
          <span>Open AI Theme Studio</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/my-stores" className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-emerald-800/60 shadow-card hover:border-[#694873]/80 space-y-3 transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Store className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-heading">My Created Stores</h3>
          <p className="text-xs text-subtle">View all generated stores, edit with AI or Visual Editor.</p>
        </Link>

        <Link href="/storefront/theme" className="p-5 rounded-2xl bg-card border border-default shadow-card hover:border-primary-400 space-y-3 transition-all">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-heading">3D Theme Palette</h3>
          <p className="text-xs text-subtle">Primary #694873 Purple with Rose Accent #F2DDE1.</p>
        </Link>

        <div className="p-5 rounded-2xl bg-card border border-default shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
            <Layout className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-heading">Homepage Sections</h3>
          <p className="text-xs text-subtle">Hero Carousel, Featured Art, Customer Reviews.</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-default shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-info-50 text-info-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-heading">SEO &amp; Metadata</h3>
          <p className="text-xs text-subtle">OpenGraph images, Google search indexing enabled.</p>
        </div>
      </div>

      {/* Storefront Preview Modal */}
      <StorefrontPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
