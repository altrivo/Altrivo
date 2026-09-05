import React from "react";
import { headers } from "next/headers";

import StorefrontRenderer from "@/components/sections/StorefrontRenderer";
import { getVendorStoreConfig, convertConfigToDynamicSchema } from "@/lib/storefront/themeResolver";

async function getHost(): Promise<string> {
  try {
    const headerList = await headers();
    return headerList.get("host") || headerList.get("x-forwarded-host") || "";
  } catch {
    return "";
  }
}

export default async function PublicStorefrontHomePage() {
  const host = await getHost();
  const config = await getVendorStoreConfig(host);
  const dynamicSchema = convertConfigToDynamicSchema(config);

  return (
    <StorefrontRenderer
      config={dynamicSchema}
      products={config.featuredProducts}
      categories={config.categoryTiles}
    />
  );
}
