import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Sparkles } from "lucide-react";

import { CatalogView } from "@/components/storefront/CatalogView";
import { getCategoryBySlug } from "@/lib/storefront/catalogService";
import { getVendorStoreConfig } from "@/lib/storefront/themeResolver";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  const config = await getVendorStoreConfig();

  if (!category) {
    return {
      title: `Category Not Found — ${config.storeName}`,
    };
  }

  return {
    title: `${category.metaTitle} | ${config.storeName}`,
    description: category.metaDescription,
    keywords: [category.name, config.storeName, "Handcrafted Decor", "Artisan Crafts Pakistan"],
    openGraph: {
      title: `${category.name} Collection | ${config.storeName}`,
      description: category.metaDescription,
      type: "website",
      siteName: config.storeName,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function StorefrontCategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8 select-none">
      {/* Category Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-subtle">
        <Link href="/shop" className="hover:text-primary-700 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted" />
        <span className="text-heading font-bold">{category.name}</span>
      </nav>

      {/* Category Header Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-950 via-primary-900 to-[#3B2742] p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-accent-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-accent-300" />
              <span>Official Category Showcase</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
              {category.icon} {category.name}
            </h1>

            <p className="text-xs sm:text-sm text-accent-100/90 leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Catalog Grid View with Sidebar Filters */}
      <CatalogView
        initialCategorySlug={category.slug}
      />
    </div>
  );
}
