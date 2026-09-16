import { resolveDomainToVendor } from "./domainResolver";
import { formatPrice, formatCutPrice } from "./priceUtils";

export interface HeroConfig {
  badge: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  imageUrl: string;
  videoUrl?: string;
}

export interface StorefrontProduct {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  rating: number;
  reviewsCount: number;
  category: string;
  inStock: boolean;
  badge: string;
  image: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
}

export interface CategoryTile {
  title: string;
  count: string;
  icon: string;
  href: string;
  image?: string;
}

export interface NewsletterConfig {
  headline: string;
  subheadline: string;
  discountText: string;
}

export interface TrustFeature {
  title: string;
  description: string;
  icon: "truck" | "rotate-ccw" | "shield-check" | "lock" | "headphones" | "award";
}

export interface VendorStoreConfig {
  vendorId: string;
  storeId?: string;
  storeName: string;
  subdomain: string;
  domain?: string;
  logoText: string;
  logoUrl?: string;
  tagline: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  supportPhone?: string;
  freeShippingThreshold?: string;
  categories: { name: string; href: string }[];
  socialLinks: { name: string; href: string; icon: string }[];
  policies: { title: string; href: string }[];
  hero: HeroConfig;
  featuredProducts: StorefrontProduct[];
  categoryTiles: CategoryTile[];
  newsletter: NewsletterConfig;
  trustFeatures: TrustFeature[];
}

const DEFAULT_VENDOR_CONFIG: VendorStoreConfig = {
  vendorId: "vendor-artrivo-01",
  storeName: "Artrivo Marketplace Store",
  subdomain: "artrivo",
  logoText: "Artrivo Store",
  tagline: "Handcrafted Luxury Home Decor & Artisanal Collectibles",
  description: "Curating premium handcrafted items across Pakistan with verified escrow protection and instant home delivery.",
  primaryColor: "#694873",
  accentColor: "#F2DDE1",
  supportPhone: "+92 300 1234567",
  freeShippingThreshold: "$50",
  categories: [
    { name: "All Products", href: "/shop" },
    { name: "Ceramics & Decor", href: "/category/decor" },
    { name: "Canvas Art", href: "/category/art" },
    { name: "Lighting", href: "/category/lighting" },
    { name: "Home Textiles", href: "/category/textiles" },
    { name: "Stationery", href: "/category/stationery" },
  ],
  socialLinks: [
    { name: "Instagram", href: "https://instagram.com/artrivo.store", icon: "instagram" },
    { name: "WhatsApp Store", href: "https://wa.me/923001234567", icon: "whatsapp" },
    { name: "Facebook", href: "https://facebook.com/artrivo.store", icon: "facebook" },
    { name: "Pinterest", href: "https://pinterest.com/artrivo.store", icon: "pinterest" },
  ],
  policies: [
    { title: "Privacy Policy", href: "/shop/policies/privacy" },
    { title: "Terms of Service", href: "/shop/policies/terms" },
    { title: "Refund & Returns", href: "/shop/policies/refund" },
    { title: "Shipping & Delivery", href: "/shop/policies/shipping" },
  ],
  hero: {
    badge: "Summer 2026 Collection Live",
    headline: "Handcrafted Luxury Home Decor & Artisanal Collectibles",
    subheadline: "Discover unique ceramic art, abstract canvas paintings, and handcrafted wooden lighting made by master artisans across Pakistan.",
    ctaText: "Explore Collection",
    ctaHref: "#catalog",
    secondaryCtaText: "View Cart (3 items)",
    secondaryCtaHref: "/shop/cart",
    imageUrl: "/images/products/ceramic_vase.jpg",
  },
  featuredProducts: [
    {
      id: "prod-1",
      name: "Ceramic Minimalist Vase (Handcrafted)",
      price: "$89",
      originalPrice: "$110",
      rating: 4.9,
      reviewsCount: 42,
      category: "Decor",
      inStock: true,
      badge: "Best Seller",
      image: "/images/products/ceramic_vase.jpg",
      isBestSeller: true,
      isFeatured: true,
    },
    {
      id: "prod-2",
      name: "Abstract Canvas Painting 'Golden Dawn'",
      price: "$340",
      originalPrice: "$400",
      rating: 5.0,
      reviewsCount: 28,
      category: "Art",
      inStock: true,
      badge: "Featured",
      image: "/images/products/abstract_canvas.jpg",
      isFeatured: true,
    },
    {
      id: "prod-3",
      name: "Nordic Wooden Desk Lamp",
      price: "$125",
      originalPrice: "$150",
      rating: 4.8,
      reviewsCount: 19,
      category: "Lighting",
      inStock: true,
      badge: "Low Stock",
      image: "/images/products/wooden_lamp.jpg",
      isBestSeller: true,
    },
    {
      id: "prod-4",
      name: "Handcrafted Genuine Leather Journal",
      price: "$48",
      originalPrice: "$60",
      rating: 4.9,
      reviewsCount: 64,
      category: "Stationery",
      inStock: true,
      badge: "New",
      image: "/images/products/leather_journal.jpg",
      isFeatured: true,
    },
  ],
  categoryTiles: [
    { title: "Ceramics & Decor", count: "42 items", icon: "🏺", href: "/category/decor", image: "/images/products/ceramic_vase.jpg" },
    { title: "Canvas Paintings", count: "28 items", icon: "🎨", href: "/category/art", image: "/images/products/abstract_canvas.jpg" },
    { title: "Artisan Lighting", count: "16 items", icon: "💡", href: "/category/lighting", image: "/images/products/wooden_lamp.jpg" },
    { title: "Home Textiles", count: "34 items", icon: "🧶", href: "/category/textiles", image: "/images/products/leather_journal.jpg" },
  ],
  newsletter: {
    headline: "Stay Updated with Seasonal Drops",
    subheadline: "Subscribe to receive private discount codes, artisan behind-the-scenes stories, and priority access to new releases.",
    discountText: "🎉 Get 10% OFF your first order upon subscribing!",
  },
  trustFeatures: [
    { title: "Escrow Secured Checkout", description: "100% buyer protection until delivery confirmation", icon: "lock" },
    { title: "Cash on Delivery", description: "Nationwide COD option available across Pakistan", icon: "truck" },
    { title: "Fast 2-4 Days Express", description: "TCS & Courier priority express dispatch", icon: "rotate-ccw" },
    { title: "Verified Quality Guarantee", description: "Directly hand-inspected by master artisans", icon: "shield-check" },
  ],
};

const POTTERY_VENDOR_CONFIG: VendorStoreConfig = {
  ...DEFAULT_VENDOR_CONFIG,
  vendorId: "vendor-pottery-02",
  storeName: "Clay & Heritage Pottery",
  subdomain: "pottery",
  logoText: "Clay & Heritage",
  tagline: "Traditional Handcrafted Ceramics & Terracotta Works",
  primaryColor: "#8C4A32",
  accentColor: "#F5EBE6",
  hero: {
    ...DEFAULT_VENDOR_CONFIG.hero,
    headline: "Traditional Terracotta & Hand-Thrown Clay Ceramics",
    subheadline: "Authenic handmade pottery fired in traditional kilns by heritage master craftsmen.",
    imageUrl: "/images/products/ceramic_vase.jpg",
  },
};

const CANVAS_VENDOR_CONFIG: VendorStoreConfig = {
  ...DEFAULT_VENDOR_CONFIG,
  vendorId: "vendor-canvas-03",
  storeName: "Golden Dawn Canvas Studio",
  subdomain: "canvas",
  logoText: "Golden Dawn Studio",
  tagline: "Contemporary Oil & Acrylic Original Canvas Art",
  primaryColor: "#2C4A5E",
  accentColor: "#E4EEF5",
  hero: {
    ...DEFAULT_VENDOR_CONFIG.hero,
    headline: "Original Oil & Gold Leaf Abstract Canvas Masterpieces",
    subheadline: "Bespoke fine art paintings designed to transform modern living spaces.",
    imageUrl: "/images/products/abstract_canvas.jpg",
  },
};

// In-memory store config cache (60s TTL) for DB-resolved stores
const STORE_CONFIG_CACHE: Record<string, { config: VendorStoreConfig; expiry: number }> = {};
const STORE_CACHE_TTL = 60_000; // 60 seconds

export async function getVendorStoreConfig(domainOrSubdomain?: string): Promise<VendorStoreConfig> {
  if (!domainOrSubdomain) {
    return DEFAULT_VENDOR_CONFIG;
  }

  const host = domainOrSubdomain.toLowerCase();

  // Check in-memory cache first
  const cached = STORE_CONFIG_CACHE[host];
  if (cached && Date.now() < cached.expiry) {
    return cached.config;
  }

  // Try to resolve from Supabase stores table (AI-generated stores)
  try {
    const dbConfig = await resolveStoreFromDatabase(host);
    if (dbConfig) {
      STORE_CONFIG_CACHE[host] = { config: dbConfig, expiry: Date.now() + STORE_CACHE_TTL };
      return dbConfig;
    }
  } catch (err) {
    // Database not available or table doesn't exist yet — fall through to presets
    console.warn("[themeResolver] DB lookup failed, using preset:", (err as Error).message);
  }

  // Fall through to hardcoded presets for development/demo
  const { vendorId } = resolveDomainToVendor(host);

  if (vendorId === "vendor_brandxyz" || host.includes("canvas") || host.includes("art-studio")) {
    return CANVAS_VENDOR_CONFIG;
  }

  if (vendorId === "vendor_crafts" || host.includes("pottery") || host.includes("clay")) {
    return POTTERY_VENDOR_CONFIG;
  }

  return DEFAULT_VENDOR_CONFIG;
}

/**
 * Resolve a hostname or slug to a VendorStoreConfig.
 * Checks store-service (in-memory & Supabase), subdomain, custom_domain, and slug matches.
 */
export async function getStoreConfigBySlug(slug: string): Promise<VendorStoreConfig | null> {
  try {
    const { getStoreBySlug } = await import("@/lib/store/store-service");
    const store = await getStoreBySlug(slug);
    if (store && store.layout_config) {
      return convertDbStoreToConfig(store);
    }
  } catch (err) {
    console.warn("[themeResolver] Failed to resolve store by slug:", err);
  }
  return null;
}

/**
 * Resolve a store ID to a VendorStoreConfig.
 */
export async function getStoreConfigById(id: string): Promise<VendorStoreConfig | null> {
  try {
    const { getStoreById } = await import("@/lib/store/store-service");
    const store = await getStoreById(id);
    if (store && store.layout_config) {
      return convertDbStoreToConfig(store);
    }
  } catch (err) {
    console.warn("[themeResolver] Failed to resolve store by id:", err);
  }
  return null;
}

/**
 * Resolve a hostname to a VendorStoreConfig from store-service / Supabase stores.
 * Checks subdomain, custom_domain, and slug matches for both drafts and published stores.
 */
async function resolveStoreFromDatabase(host: string): Promise<VendorStoreConfig | null> {
  try {
    const { getStoreByDomain, getStoreBySubdomain, getStoreBySlug, getVendorStores } = await import("@/lib/store/store-service");

    // Extract potential subdomain (e.g. "stepcraft-shoes" from "stepcraft-shoes.digishop.ai" or "stepcraft-shoes.localhost:3000")
    const subdomainMatch = host.match(/^([a-z0-9-]+)\./);
    const potentialSubdomain = subdomainMatch ? subdomainMatch[1] : null;

    // 1. Try exact custom domain match
    const domainStore = await getStoreByDomain(host);
    if (domainStore?.layout_config) {
      return convertDbStoreToConfig(domainStore);
    }

    // 2. Try subdomain match
    if (potentialSubdomain && potentialSubdomain !== "localhost" && potentialSubdomain !== "www") {
      const subdomainStore = await getStoreBySubdomain(potentialSubdomain);
      if (subdomainStore?.layout_config) {
        return convertDbStoreToConfig(subdomainStore);
      }

      // Try slug match
      const slugStore = await getStoreBySlug(potentialSubdomain);
      if (slugStore?.layout_config) {
        return convertDbStoreToConfig(slugStore);
      }
    }

    // 3. In dev mode on localhost: if vendor has created a store, return their latest store
    if (host.includes("localhost") || host === "") {
      const allStores = await getVendorStores();
      if (allStores.length > 0 && allStores[0].layout_config) {
        return convertDbStoreToConfig(allStores[0]);
      }
    }
  } catch (err) {
    console.warn("[themeResolver] resolveStoreFromDatabase error:", err);
  }

  return null;
}

/**
 * Convert a database store row into the VendorStoreConfig format
 * that the StorefrontRenderer expects, preserving the full dynamic layout_config.
 */
function convertDbStoreToConfig(store: any): VendorStoreConfig & { _dbLayoutConfig?: any } {
  const layout = store.layout_config || {};
  const seo = store.seo_config || {};
  const commerce = store.commerce_config || {};

  // Extract hero props if present
  const heroSection = layout.sections?.find((s: any) => s.type?.startsWith("Hero")) || layout.sections?.[0];

  let rawProducts =
    layout.products && Array.isArray(layout.products) && layout.products.length > 0
      ? layout.products
      : commerce.products && Array.isArray(commerce.products) && commerce.products.length > 0
      ? commerce.products
      : [];

  // Fallback 1: Extract from sections if store-level products are empty
  if (rawProducts.length === 0 && layout.sections && Array.isArray(layout.sections)) {
    for (const s of layout.sections) {
      if (Array.isArray(s.props?.products) && s.props.products.length > 0) {
        rawProducts = s.props.products;
        break;
      }
    }
  }

  // Fallback 2: Intelligent niche-based catalog so no shop page is ever empty
  if (rawProducts.length === 0) {
    const combinedStr = `${store.name || ""} ${store.slug || ""} ${layout.niche || ""} ${store.description || ""}`.toLowerCase();
    if (combinedStr.includes("watch") || combinedStr.includes("chrono") || combinedStr.includes("time")) {
      rawProducts = [
        {
          id: "prod-watch-1",
          sku: "WAT-01",
          name: "Automatic Chronograph Luxury Watch",
          title: "Automatic Chronograph Luxury Watch",
          tag: "Chronographs",
          category: "Chronographs",
          price: 195,
          originalPrice: 240,
          rating: 4.9,
          reviewsCount: 38,
          inStock: true,
          badge: "Best Seller",
          image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
          thumbnail: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
          description: "Engineered with scratch-resistant sapphire crystal and precision automatic chronograph movement.",
        },
        {
          id: "prod-watch-2",
          sku: "WAT-02",
          name: "Heritage Skeleton Automatic Gold Watch",
          title: "Heritage Skeleton Automatic Gold Watch",
          tag: "Automatic",
          category: "Automatic",
          price: 280,
          originalPrice: 350,
          rating: 5.0,
          reviewsCount: 52,
          inStock: true,
          badge: "Featured",
          image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
          thumbnail: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
          description: "Intricately exposed mechanical caliber with 24-jewel automatic movement and 18k gold accents.",
        },
        {
          id: "prod-watch-3",
          sku: "WAT-03",
          name: "Minimalist Obsidian Black Dial Watch",
          title: "Minimalist Obsidian Black Dial Watch",
          tag: "Minimalist",
          category: "Minimalist",
          price: 145,
          originalPrice: 180,
          rating: 4.8,
          reviewsCount: 29,
          inStock: true,
          badge: "New",
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
          thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
          description: "Sleek matte obsidian dial with surgical-grade 316L stainless steel case and genuine leather strap.",
        },
        {
          id: "prod-watch-4",
          sku: "WAT-04",
          name: "Royal Navy Blue Chrono Timepiece",
          title: "Royal Navy Blue Chrono Timepiece",
          tag: "Chronographs",
          category: "Chronographs",
          price: 165,
          originalPrice: 210,
          rating: 4.9,
          reviewsCount: 44,
          inStock: true,
          badge: "Trending",
          image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
          thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
          description: "Deep ocean blue sunburst dial with dual sub-dials and tachymeter bezel for high precision timing.",
        },
      ];
    } else if (combinedStr.includes("cloth") || combinedStr.includes("apparel") || combinedStr.includes("fashion")) {
      rawProducts = [
        {
          id: "prod-apparel-1",
          sku: "APP-01",
          name: "Hand-Embroidered Velvet Kurti",
          title: "Hand-Embroidered Velvet Kurti",
          tag: "Pret",
          category: "Pret",
          price: 95,
          originalPrice: 120,
          rating: 4.9,
          reviewsCount: 26,
          inStock: true,
          badge: "Best Seller",
          image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
          thumbnail: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
          description: "Pure silk-velvet kurti featuring intricate gold zari needlework and tailored contemporary silhouette.",
        },
        {
          id: "prod-apparel-2",
          sku: "APP-02",
          name: "Premium Egyptian Cotton Shalwar Kameez",
          title: "Premium Egyptian Cotton Shalwar Kameez",
          tag: "Men Couture",
          category: "Men Couture",
          price: 85,
          originalPrice: 110,
          rating: 4.8,
          reviewsCount: 31,
          inStock: true,
          badge: "New",
          image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
          thumbnail: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
          description: "Breathable ultra-fine Egyptian cotton with contrast collar stitching and mother-of-pearl buttons.",
        },
      ];
    } else if (combinedStr.includes("shoe") || combinedStr.includes("leather") || combinedStr.includes("footwear")) {
      rawProducts = [
        {
          id: "prod-shoe-1",
          sku: "SHO-01",
          name: "Royal Oxford Calfskin Shoes",
          title: "Royal Oxford Calfskin Shoes",
          tag: "Formal",
          category: "Formal",
          price: 135,
          originalPrice: 170,
          rating: 5.0,
          reviewsCount: 41,
          inStock: true,
          badge: "Best Seller",
          image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
          thumbnail: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
          description: "Hand-lasted 100% genuine full-grain calfskin leather oxford shoes with Blake stitched soles.",
        },
        {
          id: "prod-shoe-2",
          sku: "SHO-02",
          name: "Peshawari Chappal - Pure Leather",
          title: "Peshawari Chappal - Pure Leather",
          tag: "Traditional",
          category: "Traditional",
          price: 65,
          originalPrice: 85,
          rating: 4.9,
          reviewsCount: 58,
          inStock: true,
          badge: "Authentic",
          image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
          thumbnail: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
          description: "Heritage hand-cut cowhide leather with tyre tread durable soles and traditional buckle closure.",
        },
      ];
    } else {
      rawProducts = DEFAULT_VENDOR_CONFIG.featuredProducts;
    }
  }

  const effectiveProducts = rawProducts.map((p: any) => ({
    ...p,
    price: formatPrice(p.price),
    originalPrice: formatCutPrice(p.price, p.originalPrice),
  }));

  // Ensure sections with products also format prices to $
  if (layout.sections && Array.isArray(layout.sections)) {
    layout.sections = layout.sections.map((s: any) => {
      if (s.props?.products && Array.isArray(s.props.products)) {
        return {
          ...s,
          props: {
            ...s.props,
            products: s.props.products.map((p: any) => ({
              ...p,
              price: formatPrice(p.price),
              originalPrice: formatCutPrice(p.price, p.originalPrice),
            })),
          },
        };
      }
      return s;
    });
  }

  const categorySection = layout.sections?.find((s: any) => s.type?.includes("Category"));
  const effectiveCategories = categorySection?.props?.categories || layout.categories || [];

  return {
    vendorId: store.vendor_id,
    storeId: store.id || undefined,
    storeName: store.name || layout.storeName || "My Store",
    subdomain: store.subdomain || store.slug,
    domain: store.custom_domain || undefined,
    logoText: store.name || layout.storeName || "My Store",
    logoUrl: store.logo_url || undefined,
    tagline: store.description || seo.description || "",
    description: seo.description || store.description || "",
    primaryColor: layout.theme?.colors?.primary || "#171717",
    accentColor: layout.theme?.colors?.secondary || "#D4AF37",
    supportPhone: undefined,
    freeShippingThreshold: commerce.freeShippingThreshold ? `$${commerce.freeShippingThreshold}` : "$50",
    categories: layout.categories || [{ name: "All Products", href: "/shop" }],
    socialLinks: layout.socialLinks || [
      { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
      { name: "WhatsApp Store", href: "https://wa.me/923001234567", icon: "whatsapp" },
    ],
    policies: [
      { title: "Privacy Policy", href: "/shop/policies/privacy" },
      { title: "Terms of Service", href: "/shop/policies/terms" },
      { title: "Refund & Returns", href: "/shop/policies/refund" },
      { title: "Shipping & Delivery", href: "/shop/policies/shipping" },
    ],
    hero: {
      badge: "",
      headline: heroSection?.props?.title || store.name,
      subheadline: heroSection?.props?.subtitle || store.description || "",
      ctaText: heroSection?.props?.ctaText || "Shop Now",
      ctaHref: heroSection?.props?.ctaLink || "/shop",
      imageUrl: heroSection?.props?.imageUrl || "/images/products/ceramic_vase.jpg",
    },
    featuredProducts: effectiveProducts,
    categoryTiles: effectiveCategories,
    newsletter: {
      headline: "Stay Updated",
      subheadline: "Subscribe for exclusive offers and new arrivals.",
      discountText: "🎉 Get 10% OFF your first order!",
    },
    trustFeatures: [
      { title: "Escrow Secured Checkout", description: "100% buyer protection until delivery", icon: "lock" },
      { title: "Cash on Delivery", description: "COD available across Pakistan", icon: "truck" },
      { title: "Fast Express Delivery", description: "2-4 days express dispatch", icon: "rotate-ccw" },
      { title: "Quality Guarantee", description: "Hand-inspected quality assurance", icon: "shield-check" },
    ],
    _dbLayoutConfig: {
      ...layout,
      storeId: store.id,
      vendorId: store.vendor_id,
      slug: store.slug,
      storeName: store.name || layout.storeName,
      products: effectiveProducts,
    },
  };
}

export function convertConfigToDynamicSchema(config: VendorStoreConfig & { _dbLayoutConfig?: any }) {
  // If this config came from the database and already has a full layout_config,
  // return it directly — the StorefrontRenderer can consume it as-is.
  if (config._dbLayoutConfig?.sections?.length > 0) {
    return {
      ...config._dbLayoutConfig,
      storeId: config._dbLayoutConfig.storeId || config.subdomain || config.storeName,
      vendorId: config.vendorId || config._dbLayoutConfig.vendorId,
      slug: config.subdomain || config._dbLayoutConfig.slug,
      storeName: config.storeName || config._dbLayoutConfig.storeName,
      tagline: config.tagline || config._dbLayoutConfig.tagline,
      description: config.description || config._dbLayoutConfig.description,
      supportPhone: config.supportPhone || config._dbLayoutConfig.supportPhone,
      policies: config.policies || config._dbLayoutConfig.policies,
      products: (config.featuredProducts && config.featuredProducts.length > 0)
        ? config.featuredProducts
        : config._dbLayoutConfig.products,
    };
  }

  return {
    storeId: (config as any)._dbLayoutConfig?.storeId || config.subdomain || config.storeName,
    vendorId: config.vendorId,
    slug: config.subdomain,
    storeName: config.storeName,
    tagline: config.tagline,
    description: config.description,
    supportPhone: config.supportPhone,
    policies: config.policies,
    categories: config.categories,
    socialLinks: config.socialLinks,
    pages: (config as any)._dbLayoutConfig?.pages,
    theme: {
      colors: {
        primary: config.primaryColor,
        secondary: config.accentColor,
        background: "#ffffff",
        text: "#1e293b",
      },
      typography: {
        heading: "Plus Jakarta Sans",
        body: "Inter",
      },
    },
    sections: [
      {
        id: "hero-split-1",
        type: "HeroSplitImage" as const,
        props: {
          title: config.hero.headline,
          subtitle: config.hero.subheadline,
          ctaText: config.hero.ctaText,
          ctaLink: config.hero.ctaHref,
          imageUrl: config.hero.imageUrl,
          imageAlignment: "right" as const,
        },
      },
      {
        id: "promo-banner-1",
        type: "PromoBanner" as const,
        props: {
          text: config.newsletter.discountText || "Exclusive drop live!",
          layout: "ribbon" as const,
        },
      },
      {
        id: "category-carousel-1",
        type: "CategoryCarousel" as const,
        props: {
          title: "Explore Collections",
          layout: "card" as const,
        },
      },
      {
        id: "product-grid-1",
        type: "ProductGridFeatured" as const,
        props: {
          title: "Featured Masterpieces",
          columns: 3 as const,
        },
      },
      {
        id: "newsletter-signup-1",
        type: "NewsletterSignup" as const,
        props: {
          title: config.newsletter.headline,
          subtitle: config.newsletter.subheadline,
          buttonText: "Subscribe",
          layout: "box" as const,
        },
      },
      {
        id: "feature-grid-1",
        type: "FeatureGrid" as const,
        props: {
          columns: 3 as const,
          items: config.trustFeatures.map((f) => ({
            icon: f.icon,
            title: f.title,
            description: f.description,
          })),
        },
      },
    ],
  };
}


