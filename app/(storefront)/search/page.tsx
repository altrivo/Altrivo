import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Search as SearchIcon } from "lucide-react";

import { CatalogView } from "@/components/storefront/CatalogView";
import { getVendorStoreConfig } from "@/lib/storefront/themeResolver";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const config = await getVendorStoreConfig();
  const queryText = q ? `"${q.trim()}"` : "All Products";

  return {
    title: `Search results for ${queryText} | ${config.storeName}`,
    description: `Find handcrafted artisanal items matching ${queryText} on ${config.storeName}. Escrow protected shipping across Pakistan.`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function StorefrontSearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const searchQuery = q?.trim() || "";

  return (
    <div className="space-y-8 select-none">
      {/* Search Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-subtle">
        <Link href="/shop" className="hover:text-primary-700 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted" />
        <span className="text-heading font-bold">Search Catalog</span>
      </nav>

      {/* Search Query Header */}
      <div className="flex items-center gap-3 bg-card border border-default p-6 rounded-2xl shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center border border-primary-200 shadow-2xs">
          <SearchIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold text-heading">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Explore Catalog Search"}
          </h1>
          <p className="text-xs text-subtle mt-0.5">
            {searchQuery
              ? `Filter and sort catalog items matching "${searchQuery}"`
              : "Search across all handcrafted items, categories, and materials"}
          </p>
        </div>
      </div>

      {/* Catalog Grid View with Sidebar Filters */}
      <CatalogView
        initialQuery={searchQuery}
      />
    </div>
  );
}
