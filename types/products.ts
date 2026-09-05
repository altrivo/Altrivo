export type MediaType = "image" | "video";

export interface ProductMedia {
  id: string;
  type: MediaType;
  url: string;
  thumbnail: string;
  alt: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "24x36 / Oak Frame"
  size?: string;
  color?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  image?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  description: string;
  specs: ProductSpec[];
  media: ProductMedia[];
  variants: ProductVariant[];
  reviews: ProductReview[];
  vendorName: string;
  vendorPhone: string;
  vendorEmail: string;
  vendorLocation: string;
  shippingInfo: string;
  returnPolicy: string;
  relatedProducts: {
    id: string;
    title: string;
    category: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
  }[];
}
