import { StorefrontProduct } from "./themeResolver";

export interface CategoryInfo {
  slug: string;
  name: string;
  description: string;
  icon: string;
  bannerImage: string;
  metaTitle: string;
  metaDescription: string;
}

export interface CatalogFilterParams {
  categorySlug?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  bestSellersOnly?: boolean;
  minRating?: number;
  materials?: string[];
  sortBy?: "featured" | "price-asc" | "price-desc" | "rating-desc" | "popular";
}

export const CATEGORIES_MAP: Record<string, CategoryInfo> = {
  decor: {
    slug: "decor",
    name: "Ceramics & Decor",
    description: "Hand-thrown pottery, sculptural ceramic vases, and luxury home decor accents.",
    icon: "🏺",
    bannerImage: "/images/products/ceramic_vase.jpg",
    metaTitle: "Handcrafted Ceramics & Home Decor Vases — Official Store",
    metaDescription: "Explore unique handcrafted ceramic vases, terracotta works, and luxury home decor crafted by master artisans across Pakistan.",
  },
  art: {
    slug: "art",
    name: "Canvas Art",
    description: "Original oil, acrylic, and gold leaf abstract canvas paintings.",
    icon: "🎨",
    bannerImage: "/images/products/abstract_canvas.jpg",
    metaTitle: "Original Abstract Canvas Art & Oil Paintings — Gallery Collection",
    metaDescription: "Discover bespoke oil paintings and gold leaf abstract canvas wall art framed to elevate modern interiors.",
  },
  lighting: {
    slug: "lighting",
    name: "Artisan Lighting",
    description: "Nordic handcrafted wooden lamps, ambient warm lighting, and desk lamps.",
    icon: "💡",
    bannerImage: "/images/products/wooden_lamp.jpg",
    metaTitle: "Nordic Wooden Desk Lamps & Handcrafted Lighting — Artisanal Store",
    metaDescription: "Shop handcrafted wooden lamps and warm architectural desk lighting made from premium oak and walnut.",
  },
  textiles: {
    slug: "textiles",
    name: "Home Textiles",
    description: "Hand-woven throws, embroidered cushion covers, and artisan fabrics.",
    icon: "🧶",
    bannerImage: "/images/products/leather_journal.jpg",
    metaTitle: "Hand-Woven Home Textiles & Artisan Cushion Covers — Store",
    metaDescription: "Elevate your living space with hand-knitted textiles, organic cotton throws, and traditional embroidered covers.",
  },
  stationery: {
    slug: "stationery",
    name: "Leather & Stationery",
    description: "Handcrafted genuine leather journals, brass pens, and paper crafts.",
    icon: "📓",
    bannerImage: "/images/products/leather_journal.jpg",
    metaTitle: "Handcrafted Leather Journals & Luxury Stationery — Crafts Collection",
    metaDescription: "Genuine leather bound journals, parchment notebooks, and artisanal stationery gifts.",
  },
};

export const MASTER_PRODUCTS: (StorefrontProduct & { material?: string; numericPrice: number })[] = [
  {
    id: "prod-1",
    name: "Ceramic Minimalist Vase (Handcrafted)",
    price: "₨ 8,900",
    numericPrice: 8900,
    originalPrice: "₨ 11,000",
    rating: 4.9,
    reviewsCount: 42,
    category: "decor",
    inStock: true,
    badge: "Best Seller",
    image: "/images/products/ceramic_vase.jpg",
    isBestSeller: true,
    isFeatured: true,
    material: "Ceramic",
  },
  {
    id: "prod-2",
    name: "Abstract Canvas Painting 'Golden Dawn'",
    price: "₨ 34,000",
    numericPrice: 34000,
    originalPrice: "₨ 40,000",
    rating: 5.0,
    reviewsCount: 28,
    category: "art",
    inStock: true,
    badge: "Featured",
    image: "/images/products/abstract_canvas.jpg",
    isFeatured: true,
    material: "Canvas Oil",
  },
  {
    id: "prod-3",
    name: "Nordic Wooden Desk Lamp",
    price: "₨ 12,500",
    numericPrice: 12500,
    originalPrice: "₨ 15,000",
    rating: 4.8,
    reviewsCount: 19,
    category: "lighting",
    inStock: true,
    badge: "Low Stock",
    image: "/images/products/wooden_lamp.jpg",
    isBestSeller: true,
    material: "Wood",
  },
  {
    id: "prod-4",
    name: "Handcrafted Genuine Leather Journal",
    price: "₨ 4,800",
    numericPrice: 4800,
    originalPrice: "₨ 6,000",
    rating: 4.9,
    reviewsCount: 64,
    category: "stationery",
    inStock: true,
    badge: "New",
    image: "/images/products/leather_journal.jpg",
    isFeatured: true,
    material: "Leather",
  },
  {
    id: "prod-5",
    name: "Terracotta Hand-Thrown Planter Pot",
    price: "₨ 6,200",
    numericPrice: 6200,
    originalPrice: "₨ 7,500",
    rating: 4.7,
    reviewsCount: 15,
    category: "decor",
    inStock: true,
    badge: "Pottery",
    image: "/images/products/ceramic_vase.jpg",
    isBestSeller: false,
    isFeatured: true,
    material: "Terracotta",
  },
  {
    id: "prod-6",
    name: "Modernist Minimal Acrylic Wall Canvas",
    price: "₨ 22,000",
    numericPrice: 22000,
    originalPrice: "₨ 26,000",
    rating: 4.9,
    reviewsCount: 31,
    category: "art",
    inStock: true,
    badge: "New Arrival",
    image: "/images/products/abstract_canvas.jpg",
    isFeatured: false,
    material: "Canvas Oil",
  },
  {
    id: "prod-7",
    name: "Architectural Oak LED Ambient Light",
    price: "₨ 18,900",
    numericPrice: 18900,
    originalPrice: "₨ 21,000",
    rating: 5.0,
    reviewsCount: 12,
    category: "lighting",
    inStock: true,
    badge: "Premium",
    image: "/images/products/wooden_lamp.jpg",
    isBestSeller: true,
    material: "Wood",
  },
  {
    id: "prod-8",
    name: "Hand-Woven Pure Wool Throw Blanket",
    price: "₨ 14,500",
    numericPrice: 14500,
    originalPrice: "₨ 17,000",
    rating: 4.8,
    reviewsCount: 22,
    category: "textiles",
    inStock: true,
    badge: "Best Seller",
    image: "/images/products/leather_journal.jpg",
    isBestSeller: true,
    material: "Wool",
  },
];

export function getCategoryBySlug(slug: string): CategoryInfo | null {
  const normalized = slug?.toLowerCase();
  return CATEGORIES_MAP[normalized] || null;
}

export function filterAndSortCatalog(params: CatalogFilterParams) {
  let products = [...MASTER_PRODUCTS];

  // Category filter
  if (params.categorySlug) {
    const slug = params.categorySlug.toLowerCase();
    products = products.filter((p) => p.category === slug);
  }

  // Search Query filter
  if (params.searchQuery && params.searchQuery.trim()) {
    const q = params.searchQuery.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.badge.toLowerCase().includes(q) ||
        (p.material && p.material.toLowerCase().includes(q))
    );
  }

  // Price filtering
  if (typeof params.minPrice === "number") {
    products = products.filter((p) => p.numericPrice >= params.minPrice!);
  }
  if (typeof params.maxPrice === "number") {
    products = products.filter((p) => p.numericPrice <= params.maxPrice!);
  }

  // In Stock only
  if (params.inStockOnly) {
    products = products.filter((p) => p.inStock);
  }

  // Best Sellers only
  if (params.bestSellersOnly) {
    products = products.filter((p) => p.isBestSeller || p.badge.toLowerCase().includes("best"));
  }

  // Minimum rating
  if (typeof params.minRating === "number") {
    products = products.filter((p) => p.rating >= params.minRating!);
  }

  // Materials filter
  if (params.materials && params.materials.length > 0) {
    products = products.filter((p) => p.material && params.materials!.includes(p.material));
  }

  // Sorting
  const sortBy = params.sortBy || "featured";
  if (sortBy === "price-asc") {
    products.sort((a, b) => a.numericPrice - b.numericPrice);
  } else if (sortBy === "price-desc") {
    products.sort((a, b) => b.numericPrice - a.numericPrice);
  } else if (sortBy === "rating-desc") {
    products.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
  } else if (sortBy === "popular") {
    products.sort((a, b) => b.reviewsCount - a.reviewsCount);
  }

  return products;
}
