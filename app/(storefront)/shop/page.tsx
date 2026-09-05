import React from "react";
import { headers } from "next/headers";

import { CategoryTiles } from "@/components/storefront/CategoryTiles";
import { FeaturedProductsGrid } from "@/components/storefront/FeaturedProductsGrid";
import { HeroBanner } from "@/components/storefront/HeroBanner";
import { NewsletterSection } from "@/components/storefront/NewsletterSection";
import { TrustPanelRow } from "@/components/storefront/TrustPanelRow";
import { getVendorStoreConfig } from "@/lib/storefront/themeResolver";

async function getHost(): Promise<string> {
  try {
    const headerList = await headers();
    return headerList.get("host") || headerList.get("x-forwarded-host") || "";
  } catch {
    return "";
  }
}

export default async function PublicStorefrontShopPage() {
  const host = await getHost();
  const config = await getVendorStoreConfig(host);

  return (
    <div className="space-y-12">
      {/* Section 1: Hero Banner */}
      <HeroBanner config={config} />

      {/* Section 2: Category Tiles */}
      <CategoryTiles config={config} />

      {/* Section 3: Featured Products Grid */}
      <FeaturedProductsGrid config={config} />

      {/* Section 4: Trust Panel Row */}
      <TrustPanelRow config={config} />

      {/* Section 5: Newsletter Signup */}
      <NewsletterSection config={config} />
    </div>
  );
}
