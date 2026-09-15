import React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getVendorStoreConfig } from "@/lib/storefront/themeResolver";
import { StorefrontShell } from "@/components/storefront/StorefrontShell";
import { StorefrontBeacon } from "@/components/analytics/StorefrontBeacon";

async function getHost(): Promise<string> {
  try {
    const headerList = await headers();
    return headerList.get("host") || headerList.get("x-forwarded-host") || "";
  } catch {
    return "";
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const host = await getHost();
  const config = await getVendorStoreConfig(host);

  return {
    title: `${config.storeName} — Handcrafted Decor & Art`,
    description: `${config.tagline}. ${config.description}`,
    keywords: [
      config.storeName,
      "Handcrafted Decor",
      "Pakistan Artisan Marketplace",
      "Vases",
      "Canvas Paintings",
      "Custom Crafts",
    ],
    metadataBase: new URL(host ? `https://${host}` : "https://artrivo.com"),
    openGraph: {
      title: `${config.storeName} | Official Vendor Store`,
      description: config.tagline,
      type: "website",
      siteName: config.storeName,
      locale: "en_PK",
    },
    twitter: {
      card: "summary_large_image",
      title: config.storeName,
      description: config.tagline,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
  };
}

export default async function PublicStorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const host = await getHost();
  const config = await getVendorStoreConfig(host);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: config.storeName,
    description: config.tagline,
    url: host ? `https://${host}` : "https://altrivo.com",
    telephone: config.supportPhone,
    priceRange: "$$",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      offerCount: "50+",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StorefrontBeacon vendorId={config.vendorId} storeId={config.storeId} />
      <StorefrontShell config={config}>{children}</StorefrontShell>
    </>
  );
}
