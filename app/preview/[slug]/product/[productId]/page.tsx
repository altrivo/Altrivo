import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Sparkles, ArrowLeft } from "lucide-react";
import { getStoreConfigBySlug, convertConfigToDynamicSchema, getVendorStoreConfig } from "@/lib/storefront/themeResolver";
import { mockProducts } from "@/lib/mock-products";
import { CartProvider } from "@/components/sections/CartContext";
import HeaderStandard from "@/components/sections/HeaderStandard";
import FooterDetailed from "@/components/sections/FooterDetailed";
import StorefrontGlobalModals from "@/components/sections/StorefrontGlobalModals";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductDetailPageProps {
  params: Promise<{ slug: string; productId: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug, productId } = await params;

  let config = await getStoreConfigBySlug(slug);
  if (!config) {
    config = await getVendorStoreConfig(slug);
  }

  const dynamicSchema = convertConfigToDynamicSchema(config);

  // Find product from 50 catalog items by ID, SKU, or slug
  const normalizedId = productId.toLowerCase();
  const product =
    mockProducts.find(
      (p) =>
        p.id.toLowerCase() === normalizedId ||
        p.sku.toLowerCase() === normalizedId ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalizedId
    ) ||
    mockProducts.find((p) => p.id === "prod_0001") ||
    mockProducts[0];

  if (!product) {
    notFound();
  }

  // Pick 8 random related products from catalog
  const relatedProducts = mockProducts
    .filter((p) => p.id !== product.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 8);

  const theme = dynamicSchema.theme || {
    colors: {
      primary: config.primaryColor || "#0f172a",
      secondary: config.accentColor || "#d97706",
      background: "#ffffff",
      text: "#1e293b",
    },
    typography: {
      heading: "inherit",
      body: "inherit",
    },
  };

  return (
    <CartProvider storeId={slug}>
      {/* Top Floating Preview Bar for Vendor */}
      <div className="fixed top-0 inset-x-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-emerald-500/30 text-white px-4 py-2 flex items-center justify-between text-xs shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
            Live Product Page Preview
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-300 font-semibold hidden sm:inline">{config.storeName}</span>
          <span className="text-slate-500 font-mono text-[11px]">({slug})</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/preview/${slug}`}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-semibold transition-all flex items-center gap-1.5 text-[11px]"
          >
            <ArrowLeft className="w-3 h-3 text-emerald-400" />
            <span>Storefront Home</span>
          </Link>
          <Link
            href={`/dashboard/editor/${slug}`}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-semibold transition-all flex items-center gap-1.5 text-[11px]"
          >
            <Pencil className="w-3 h-3 text-emerald-400" />
            <span>Visual Editor</span>
          </Link>
        </div>
      </div>

      {/* Main Page Layout */}
      <div
        className="pt-10 min-h-screen bg-slate-50 text-slate-900"
        style={{
          "--color-primary": theme.colors.primary,
          "--color-secondary": theme.colors.secondary,
          "--color-bg": theme.colors.background,
          "--color-text": theme.colors.text,
          "--font-heading": theme.typography.heading,
          "--font-body": theme.typography.body,
        } as React.CSSProperties}
      >
        {/* Top Header / Navigation */}
        <HeaderStandard
          logoText={config.storeName || "Artisanal Store"}
          navigation={dynamicSchema.categories || config.categoryTiles?.map((c) => ({ name: c.title, href: c.href })) || []}
          products={mockProducts}
        />

        {/* Interactive Product Details & 2-Row Recommendations */}
        <main className="pb-16">
          <ProductDetailClient
            product={product}
            relatedProducts={relatedProducts}
            storeSlug={slug}
            storeName={config.storeName}
          />
        </main>

        {/* Global Footer */}
        <FooterDetailed
          copyrightText={`© 2026 ${config.storeName || "Artisanal Store"}. All rights reserved.`}
          socialLinks={dynamicSchema.socialLinks || []}
        />

        {/* Global Cart Drawer, Checkout, Auth & Tracking Modals */}
        <StorefrontGlobalModals storeName={config.storeName || "Artisanal Store"} />
      </div>
    </CartProvider>
  );
}
