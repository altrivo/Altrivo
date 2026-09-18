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
import { StorefrontBeacon } from "@/components/analytics/StorefrontBeacon";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductDetailPageProps {
  params: Promise<{ slug: string; productId: string }>;
}

/**
 * Helper to load real store products from the database store record.
 * Prioritizes commerce_config.products, then layout_config.products.
 */
async function getStoreProducts(slug: string): Promise<any[]> {
  try {
    const { fetchProductsFromDatabase } = await import("@/lib/product-db-sync");
    const { getStoreBySlug, getStoreById } = await import("@/lib/store/store-service");
    let store = await getStoreBySlug(slug);
    if (!store) {
      store = await getStoreById(slug);
    }
    if (store) {
      // 1. Check direct database products table first
      const dbProducts = await fetchProductsFromDatabase({ storeId: store.id, vendorId: store.vendor_id });
      if (Array.isArray(dbProducts) && dbProducts.length > 0) {
        return dbProducts;
      }

      const commerceProducts = store.commerce_config?.products;
      const layoutProducts = store.layout_config?.products;
      if (Array.isArray(commerceProducts) && commerceProducts.length > 0) {
        return commerceProducts;
      }
      if (Array.isArray(layoutProducts) && layoutProducts.length > 0) {
        return layoutProducts;
      }
    }
  } catch (err) {
    console.warn("[ProductDetail] Failed to load store products:", err);
  }
  return [];
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug, productId } = await params;

  let config = await getStoreConfigBySlug(slug);
  if (!config) {
    config = await getVendorStoreConfig(slug);
  }

  const dynamicSchema = convertConfigToDynamicSchema(config);

  // Load REAL store products from database first
  const storeProducts = await getStoreProducts(slug);

  // Find product by ID, SKU, or name slug from the REAL store products
  const normalizedId = decodeURIComponent(productId).toLowerCase();

  let product: any = null;

  // 1. Search in real store products (from vendor's saved data)
  if (storeProducts.length > 0) {
    product = storeProducts.find(
      (p: any) =>
        p.id?.toLowerCase() === normalizedId ||
        p.sku?.toLowerCase() === normalizedId ||
        (p.name || p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalizedId
    );
  }

  // 1b. Search in config / dynamicSchema catalog
  if (!product) {
    const configProducts = [
      ...(config.featuredProducts || []),
      ...(dynamicSchema.products || []),
      ...((config as any)._dbLayoutConfig?.products || []),
    ];
    product = configProducts.find(
      (p: any) =>
        p.id?.toLowerCase() === normalizedId ||
        p.sku?.toLowerCase() === normalizedId ||
        (p.name || p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalizedId
    );
  }

  // 2. If not found in store products, try mockProducts as fallback
  if (!product) {
    product = mockProducts.find(
      (p) =>
        p.id.toLowerCase() === normalizedId ||
        p.sku.toLowerCase() === normalizedId ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalizedId
    );
  }

  if (!product) {
    notFound();
  }

  // Normalize product fields for the detail client component
  const normalizedProduct = {
    ...product,
    name: product.name || product.title || "Untitled Product",
    price: typeof product.price === "number"
      ? product.price
      : parseFloat(String(product.price).replace(/[^0-9.]/g, "")) || 0,
    compareAtPrice: product.compareAtPrice
      ? (typeof product.compareAtPrice === "number"
          ? product.compareAtPrice
          : parseFloat(String(product.compareAtPrice).replace(/[^0-9.]/g, "")) || 0)
      : undefined,
    thumbnail: product.thumbnail || product.image || product.images?.[0] || "",
    images: product.images && product.images.length > 0
      ? product.images
      : product.thumbnail
      ? [product.thumbnail]
      : product.image
      ? [product.image]
      : [],
    category: product.category || product.tag || "Catalog",
    description: product.description || product.summary || "",
  };

  // Related products: use store's own products (excluding current), NOT random mock products
  const allRelated = storeProducts.length > 0
    ? storeProducts.filter((p: any) => p.id !== product.id)
    : mockProducts.filter((p) => p.id !== product.id);
  
  // Pick up to 8 related products
  const relatedProducts = allRelated.slice(0, 8).map((p: any) => ({
    ...p,
    name: p.name || p.title || "Untitled Product",
    price: typeof p.price === "number"
      ? p.price
      : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0,
    compareAtPrice: p.compareAtPrice
      ? (typeof p.compareAtPrice === "number"
          ? p.compareAtPrice
          : parseFloat(String(p.compareAtPrice).replace(/[^0-9.]/g, "")) || 0)
      : undefined,
    thumbnail: p.thumbnail || p.image || p.images?.[0] || "",
    images: p.images && p.images.length > 0 ? p.images : p.thumbnail ? [p.thumbnail] : [],
    category: p.category || p.tag || "Catalog",
  }));

  // Determine which products to show in the header search / navigation
  const headerProducts = storeProducts.length > 0 ? storeProducts : [];

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
      <StorefrontBeacon
        vendorId={config.vendorId}
        storeId={config.storeId}
        productContext={{
          productId: normalizedProduct.id,
          productName: normalizedProduct.name,
          category: normalizedProduct.category,
          price:
            typeof normalizedProduct.price === "number"
              ? normalizedProduct.price
              : parseFloat(String(normalizedProduct.price).replace(/[^0-9.]/g, "")) || 0,
        }}
      />
      {/* Main Page Layout */}
      <div
        className="min-h-screen bg-slate-50 text-slate-900"
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
          products={headerProducts}
          storeSlug={slug}
        />

        {/* Interactive Product Details & 2-Row Recommendations */}
        <main className="pb-16">
          <ProductDetailClient
            product={normalizedProduct}
            relatedProducts={relatedProducts}
            storeSlug={slug}
            storeName={config.storeName}
          />
        </main>

        {/* Global Footer */}
        <FooterDetailed
          storeName={config.storeName || "Store"}
          tagline={config.tagline || config.description}
          description={config.description}
          copyrightText={`© ${new Date().getFullYear()} ${config.storeName || "Store"}. All rights reserved.`}
          socialLinks={dynamicSchema.socialLinks || []}
          categories={config.categoryTiles || []}
          supportPhone={config.supportPhone}
          policies={config.policies}
        />

        {/* Global Cart Drawer, Checkout, Auth & Tracking Modals */}
        <StorefrontGlobalModals storeName={config.storeName || "Artisanal Store"} />
      </div>
    </CartProvider>
  );
}

