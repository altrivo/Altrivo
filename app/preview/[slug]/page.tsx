import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Sparkles, Globe, ArrowLeft } from "lucide-react";
import StorefrontRenderer from "@/components/sections/StorefrontRenderer";
import { getStoreConfigBySlug, convertConfigToDynamicSchema } from "@/lib/storefront/themeResolver";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StorePreviewPage({ params }: PreviewPageProps) {
  const { slug } = await params;
  const config = await getStoreConfigBySlug(slug);

  if (!config) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold">Store Not Found</h1>
        <p className="text-sm text-slate-400 max-w-md">
          Could not find a store with slug <code className="text-emerald-400 font-mono">/{slug}</code>.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/my-stores"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Stores
          </Link>
          <Link
            href="/store-builder"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Create Store
          </Link>
        </div>
      </div>
    );
  }

  const dynamicSchema = convertConfigToDynamicSchema(config);

  return (
    <div className="relative min-h-screen">
      {/* Top Floating Preview Bar for Vendor */}
      <div className="fixed top-0 inset-x-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-emerald-500/30 text-white px-4 py-2 flex items-center justify-between text-xs shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
            Live Store Preview Mode
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-300 font-semibold hidden sm:inline">{config.storeName}</span>
          <span className="text-slate-500 font-mono text-[11px]">({slug})</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/editor/${slug}`}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-semibold transition-all flex items-center gap-1.5 text-[11px]"
          >
            <Pencil className="w-3 h-3 text-emerald-400" />
            <span>Visual Editor</span>
          </Link>

          <Link
            href={`/store-builder/chat?storeId=${config.vendorId}`}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all flex items-center gap-1.5 text-[11px]"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Edit</span>
          </Link>
        </div>
      </div>

      {/* Main Storefront Render Body */}
      <div className="pt-10">
        <StorefrontRenderer
          config={dynamicSchema}
          products={
            (config.featuredProducts && config.featuredProducts.length > 0)
              ? config.featuredProducts
              : (dynamicSchema.products && dynamicSchema.products.length > 0)
              ? dynamicSchema.products
              : (config as any)._dbLayoutConfig?.products || []
          }
          categories={
            (config.categoryTiles && config.categoryTiles.length > 0)
              ? config.categoryTiles
              : dynamicSchema.categories || []
          }
        />
      </div>
    </div>
  );
}
