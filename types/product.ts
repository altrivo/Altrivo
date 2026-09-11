export type ProductStatus = "published" | "draft" | "out-of-stock";

export interface ProductVariantItem {
  id: string;
  sku?: string;
  title: string;
  optionValues?: Record<string, string>;
  price?: number;
  stock?: number;
  image?: string;
}

export interface Product {
  id: string;
  storeId?: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  category: string;
  brand?: string;
  status: ProductStatus;
  thumbnail: string;
  image?: string;
  createdAt?: string;
  updatedAt: string;
  images?: string[];
  variantsCount?: number;
  variants?: ProductVariantItem[];
  summary?: string;
  description?: string;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
  tags?: string[];
}

export type ProductSortField =
  | "name"
  | "price"
  | "stock"
  | "updatedAt"
  | "category";
export type SortDirection = "asc" | "desc";

export interface ProductFilters {
  search: string;
  category: string;
  status: string;
  sortField: ProductSortField;
  sortDirection: SortDirection;
}
