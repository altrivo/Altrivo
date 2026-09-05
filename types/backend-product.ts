export type BackendProductStatus = "published" | "draft" | "out-of-stock" | "archived";

export interface ProductVariantRecord {
  id: string;
  product_id: string;
  sku: string;
  option_values: Record<string, string>;
  price: number;
  stock: number;
  image_url?: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductRecord {
  id: string;
  vendor_id: string;
  title: string;
  description?: string;
  category_id?: string;
  tags?: string[];
  price: number;
  compare_price?: number;
  cost?: number;
  seo_slug: string;
  seo_title?: string;
  seo_description?: string;
  status: BackendProductStatus;
  created_at: string;
  updated_at: string;
  variants?: ProductVariantRecord[];
}

export interface CreateProductInput {
  vendor_id?: string;
  title: string;
  description?: string;
  category_id?: string;
  tags?: string[];
  price: number;
  compare_price?: number;
  cost?: number;
  seo_slug?: string;
  seo_title?: string;
  seo_description?: string;
  status?: BackendProductStatus;
  variants?: Array<Omit<ProductVariantRecord, "id" | "product_id" | "created_at" | "updated_at">>;
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  category_id?: string;
  tags?: string[];
  price?: number;
  compare_price?: number;
  cost?: number;
  seo_slug?: string;
  seo_title?: string;
  seo_description?: string;
  status?: BackendProductStatus;
  variants?: Array<Partial<ProductVariantRecord>>;
}
