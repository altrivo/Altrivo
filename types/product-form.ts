export type FormTab = "basic" | "pricing" | "variants" | "media" | "seo";

export interface VariantOption {
  id: string;
  name: string; // e.g. "Size", "Color"
  values: string[]; // e.g. ["Small", "Medium", "Large"]
}

export interface ProductVariant {
  id: string;
  optionValues: Record<string, string>; // { Size: "Small", Color: "Red" }
  price: number;
  stock: number;
  sku: string;
  image?: string;
  enabled: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary?: boolean;
}

export interface ProductFormData {
  id?: string;
  // (1) Basic Tab
  title: string;
  description: string;
  category: string;
  tags: string[];
  brand: string;

  // (2) Pricing Tab
  price: number;
  compareAtPrice: number;
  costPerItem: number;
  chargeTax: boolean;
  taxRate: number;

  // (3) Variants Tab
  hasVariants: boolean;
  options: VariantOption[];
  variants: ProductVariant[];

  // (4) Media Tab
  images: ProductImage[];

  // (5) SEO Tab
  metaTitle: string;
  metaDescription: string;
  slug: string;

  // Metadata
  status: "published" | "draft";
}

export interface ProductFormErrors {
  title?: string;
  category?: string;
  price?: string;
  costPerItem?: string;
  slug?: string;
  [key: string]: string | undefined;
}
