import { VendorStoreConfig, StorefrontProduct } from "./themeResolver";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildJsonLdOrganization(config: VendorStoreConfig, baseUrl: string = "https://artrivo.com") {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: config.storeName,
    description: config.tagline,
    url: baseUrl,
    logo: config.logoUrl || `${baseUrl}/images/products/ceramic_vase.jpg`,
    telephone: config.supportPhone || "+92 300 1234567",
    priceRange: "₨₨",
    address: {
      "@type": "PostalAddress",
      addressCountry: "PK",
      addressLocality: "Lahore",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "PKR",
      offerCount: "50+",
    },
  };
}

export function buildJsonLdProduct(
  product: StorefrontProduct,
  config: VendorStoreConfig,
  baseUrl: string = "https://artrivo.com"
) {
  const numericPrice = Number(product.price.replace(/[^0-9]/g, "")) || 5000;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.image.startsWith("http") ? product.image : `${baseUrl}${product.image}`],
    description: `${product.name} — Handcrafted ${product.category} from ${config.storeName}. Verified quality with nationwide COD across Pakistan.`,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: config.storeName,
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/product/${product.id}`,
      priceCurrency: "PKR",
      price: numericPrice,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: config.storeName,
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export function buildJsonLdBreadcrumbs(crumbs: BreadcrumbItem[], baseUrl: string = "https://artrivo.com") {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: crumb.name,
      item: crumb.url.startsWith("http") ? crumb.url : `${baseUrl}${crumb.url}`,
    })),
  };
}
