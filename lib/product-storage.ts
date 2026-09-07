import { mockProducts } from "@/lib/mock-products";
import type { Product, ProductStatus } from "@/types/product";
import type { ProductFormData } from "@/types/product-form";

const STORAGE_KEY = "artrivo_vendor_products";
const FORM_STORAGE_PREFIX = "artrivo_vendor_product_form_";
const PRODUCTS_UPDATED_EVENT = "artrivo_products_updated";

/**
 * Retrieves the stored products list from localStorage.
 * Falls back to mockProducts if storage is empty or unavailable.
 */
const defaultFallbackUrl =
  "https://images.unsplash.com/photo-1596568359553-a56de6970068?w=800&auto=format&fit=crop&q=80";

function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.includes("pollinations.ai")) return false;
  if (url.startsWith("blob:")) return false; // blob: URLs expire on refresh — treat as invalid
  return url.startsWith("data:") || url.startsWith("https://") || url.startsWith("http://");
}

function getStorageKey(): string {
  if (typeof window === "undefined") return STORAGE_KEY;
  try {
    const vendorId = localStorage.getItem("active_vendor_id");
    if (vendorId) {
      return `artrivo_vendor_products_${vendorId}`;
    }
  } catch {}
  return STORAGE_KEY;
}

export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const key = getStorageKey();
    const vendorId = localStorage.getItem("active_vendor_id");
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (vendorId) {
        return [];
      }
      localStorage.setItem(key, JSON.stringify(mockProducts));
      return mockProducts;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      if (parsed.length > 0) {
        return parsed.map((p: Product) => {
          const cleanThumbnail = isValidImageUrl(p.thumbnail)
            ? p.thumbnail
            : defaultFallbackUrl;
          const cleanImages =
            p.images && p.images.length > 0
              ? p.images
                  .filter((img) => isValidImageUrl(img))
                  .map((img) => img)
              : [cleanThumbnail];

          return {
            ...p,
            thumbnail: cleanThumbnail,
            images: cleanImages.length > 0 ? cleanImages : [cleanThumbnail],
          };
        });
      }
      return [];
    }
    return vendorId ? [] : mockProducts;
  } catch (e) {
    console.error("Error reading stored products:", e);
    return [];
  }
}

/**
 * Saves a list of products to localStorage and notifies listeners.
 */
export function saveStoredProducts(products: Product[]): void {
  if (typeof window === "undefined") return;

  try {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT));
  } catch (e) {
    console.error("Error saving stored products:", e);
  }
}

/**
 * Converts a ProductFormData into a Product record and persists it.
 */
export function saveProductFromForm(
  formData: ProductFormData,
  targetStatus: ProductStatus = "published",
): Product {
  const products = getStoredProducts();
  const nowISO = new Date().toISOString();
  const productId = formData.id || `prod_${Date.now()}`;

  const allImageObjects = formData.images || [];
  const primaryImgUrl = allImageObjects.find((img) => img.isPrimary)?.url;
  const firstImgUrl = allImageObjects[0]?.url;
  const thumbnail =
    primaryImgUrl ||
    firstImgUrl ||
    "https://images.unsplash.com/photo-1596568359553-a56de6970068?w=800&auto=format&fit=crop&q=80";

  const allImageUrls = allImageObjects.map((img) => img.url).filter(Boolean);
  if (thumbnail && !allImageUrls.includes(thumbnail)) {
    allImageUrls.unshift(thumbnail);
  }

  let totalStock = 10;
  if (formData.hasVariants && formData.variants && formData.variants.length > 0) {
    totalStock = formData.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }

  const firstSku = formData.variants?.[0]?.sku;
  const sku =
    firstSku ||
    (formData.slug ? formData.slug.toUpperCase() : `SKU-${Date.now().toString().slice(-6)}`);

  const updatedFormData: ProductFormData = {
    ...formData,
    id: productId,
    status: targetStatus === "published" ? "published" : "draft",
    images: allImageObjects,
  };

  const productRecord: Product = {
    id: productId,
    name: formData.title || "Untitled Product",
    sku,
    price: Number(formData.price) || 0,
    stock: totalStock,
    category: formData.category || "Uncategorized",
    status: targetStatus,
    thumbnail,
    updatedAt: nowISO,
    images: allImageUrls.length > 0 ? allImageUrls : [thumbnail],
    variantsCount: formData.variants?.length || 0,
    description: formData.description || "",
  };

  // Save the complete form state for future editing
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        `${FORM_STORAGE_PREFIX}${productId}`,
        JSON.stringify(updatedFormData),
      );
    } catch (e) {
      console.error("Error saving product form data:", e);
    }
  }

  const existingIndex = products.findIndex((p) => p.id === productId);
  let newProductsList: Product[];

  if (existingIndex !== -1) {
    // Update existing product in place
    newProductsList = [...products];
    newProductsList[existingIndex] = productRecord;
  } else {
    // Unshift new product to the front of list so it appears first
    newProductsList = [productRecord, ...products];
  }

  saveStoredProducts(newProductsList);
  return productRecord;
}

/**
 * Retrieves ProductFormData for edit mode.
 * Checks localStorage first, then falls back to constructing from mockProducts.
 */
export function getStoredProductFormData(id: string): ProductFormData | null {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(`${FORM_STORAGE_PREFIX}${id}`);
      if (raw) {
        const parsed: ProductFormData = JSON.parse(raw);
        // Sanitize images — remove expired blob: URLs and invalid entries
        if (parsed.images && parsed.images.length > 0) {
          parsed.images = parsed.images.filter((img) => isValidImageUrl(img.url));
          // Ensure at least one primary image if any remain
          if (parsed.images.length > 0 && !parsed.images.some((img) => img.isPrimary)) {
            parsed.images[0].isPrimary = true;
          }
        }
        return parsed;
      }
    } catch (e) {
      console.error("Error reading product form data:", e);
    }
  }

  // Fall back to finding in stored products or mockProducts
  const products = getStoredProducts();
  const existingProduct = products.find((p) => p.id === id);

  if (!existingProduct) return null;

  return {
    id: existingProduct.id,
    title: existingProduct.name,
    description: `High-quality ${existingProduct.name} crafted for premium performance. Ideal for daily use in ${existingProduct.category}.`,
    category: existingProduct.category,
    brand: "Altrivo Signature",
    tags: [existingProduct.category.toLowerCase(), "featured", "vendor"],
    price: existingProduct.price,
    compareAtPrice: Math.round(existingProduct.price * 1.25 * 100) / 100,
    costPerItem: Math.round(existingProduct.price * 0.5 * 100) / 100,
    chargeTax: true,
    taxRate: 10,
    hasVariants: false,
    options: [],
    variants: [],
    status: existingProduct.status === "published" ? "published" : "draft",
    images:
      existingProduct.images && existingProduct.images.length > 0
        ? existingProduct.images.map((url, idx) => ({
            id: `img_${idx}_${Date.now()}`,
            url,
            isPrimary: idx === 0,
          }))
        : existingProduct.thumbnail
          ? [{ id: "img_0", url: existingProduct.thumbnail, isPrimary: true }]
          : [],
    metaTitle: existingProduct.name,
    metaDescription: `Buy ${existingProduct.name} online at Altrivo. Available in ${existingProduct.category} category.`,
    slug: existingProduct.id,
  };
}

export { PRODUCTS_UPDATED_EVENT };
