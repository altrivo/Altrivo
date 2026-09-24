import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Sparkles, Globe, ArrowLeft } from "lucide-react";
import StorefrontRenderer from "@/components/sections/StorefrontRenderer";
import { getStoreConfigBySlug, convertConfigToDynamicSchema } from "@/lib/storefront/themeResolver";
import { StorefrontBeacon } from "@/components/analytics/StorefrontBeacon";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface PreviewPageProps {
  params: Promise<{ slug: string; tab?: string }>;
}

export default async function StorePreviewPage({ params }: PreviewPageProps) {
  const { slug, tab } = await params;
  const config = await getStoreConfigBySlug(slug);

  if (!config) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold">Store Not Found</h1>
        <p className="text-sm text-slate-400 max-w-md">
          Could not find a store with slug <code className="text-purple-400 font-mono">/{slug}</code>.
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
            className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-xs font-bold text-slate-950 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Create Store
          </Link>
        </div>
      </div>
    );
  }

  const dynamicSchema = convertConfigToDynamicSchema(config);
  const activeTab = (tab || "home").toLowerCase();
  const validTabs = ["home", "about", "shop", "products", "contact"];
  const resolvedTab = (activeTab === "shop" || activeTab === "products")
    ? "products"
    : validTabs.includes(activeTab)
    ? (activeTab as "home" | "about" | "shop" | "products" | "contact")
    : "home";

  return (
    <div className="relative min-h-screen">
      <StorefrontBeacon vendorId={config.vendorId} storeId={config.storeId} />
      {/* Main Storefront Render Body */}
      <div>
        <StorefrontRenderer
          config={dynamicSchema}
          activePage={resolvedTab}
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
