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

/**
 * Generates a clean, unique, professional retail SKU identifier (e.g. BDY-8392, WAT-4721).
 */
export function generateUniqueSku(title?: string, category?: string): string {
  let prefix = "";
  if (title && title.trim()) {
    const clean = title.trim().replace(/[^a-zA-Z]/g, "").toUpperCase();
    if (clean.length >= 3) {
      prefix = clean.substring(0, 3);
    } else if (clean.length > 0) {
      prefix = clean.padEnd(3, "X");
    }
  }
  if (!prefix && category && category.trim()) {
    const cleanCat = category.trim().replace(/[^a-zA-Z]/g, "").toUpperCase();
    prefix = cleanCat.substring(0, 3).padEnd(3, "X");
  }
  if (!prefix || prefix === "WAT") {
    // If prefix is simple or empty, provide a clean retail prefix like BDY or WAT
    prefix = prefix || "BDY";
  }

  // 4 random digits (1000 - 9999)
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}

export function resolveStoreId(explicitStoreId?: string): string | undefined {
  if (
    explicitStoreId &&
    explicitStoreId !== "undefined" &&
    explicitStoreId !== "null" &&
    explicitStoreId.trim() !== ""
  ) {
    return explicitStoreId.trim();
  }
  if (typeof window === "undefined") return undefined;
  try {
    const fromStorage = localStorage.getItem("active_store_id");
    if (
      fromStorage &&
      fromStorage !== "undefined" &&
      fromStorage !== "null" &&
      fromStorage.trim() !== ""
    ) {
      return fromStorage.trim();
    }
    if (typeof document !== "undefined") {
      const fromCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("active_store_id="))
        ?.split("=")[1];
      if (
        fromCookie &&
        fromCookie !== "undefined" &&
        fromCookie !== "null" &&
        fromCookie.trim() !== ""
      ) {
        return decodeURIComponent(fromCookie.trim());
      }
    }
  } catch {}
  return undefined;
}

export function getStorageKey(explicitStoreId?: string): string {
  const storeId = resolveStoreId(explicitStoreId);
  if (storeId) {
    return `artrivo_products_store_${storeId}`;
  }
  if (typeof window !== "undefined") {
    try {
      const vendorId = localStorage.getItem("active_vendor_id");
      if (vendorId && vendorId !== "undefined" && vendorId !== "null") {
        return `artrivo_vendor_products_${vendorId}`;
      }
    } catch {}
  }
  return STORAGE_KEY;
}

function sanitizeProductList(parsed: any[], targetStoreId?: string): Product[] {
  if (!Array.isArray(parsed)) return [];

  // Deduplicate products that were accidentally created as clones (same name, same timestamp window)
  const seenNames = new Map<string, Product>();
  const results: Product[] = [];

  for (const p of parsed) {
    if (!p || typeof p !== "object") continue;

    const cleanThumbnail = isValidImageUrl(p.thumbnail)
      ? p.thumbnail
      : defaultFallbackUrl;
    const cleanImages =
      p.images && p.images.length > 0
        ? p.images.filter((img: string) => isValidImageUrl(img))
        : [cleanThumbnail];

    // Fix flat non-unique SKUs like "WATCH"
    let cleanSku = p.sku;
    if (!cleanSku || cleanSku === "WATCH" || cleanSku === p.name?.toUpperCase()) {
      cleanSku = generateUniqueSku(p.name, p.category);
    }

    const cleanProduct: Product = {
      ...p,
      storeId: p.storeId || targetStoreId,
      sku: cleanSku,
      thumbnail: cleanThumbnail,
      images: cleanImages.length > 0 ? cleanImages : [cleanThumbnail],
    };

    // If there is an exact name collision (like the 3 watch duplicates), keep only the one with price > 0
    const key = (p.name || "").trim().toLowerCase();
    if (seenNames.has(key)) {
      const existing = seenNames.get(key)!;
      // Prefer the version with price or higher stock
      if ((cleanProduct.price || 0) > (existing.price || 0)) {
        seenNames.set(key, cleanProduct);
        const idx = results.findIndex((r) => r.id === existing.id);
        if (idx !== -1) results[idx] = cleanProduct;
      }
    } else {
      seenNames.set(key, cleanProduct);
      results.push(cleanProduct);
    }
  }

  return results;
}

export function toStorefrontProduct(p: any): any {
  if (!p) return null;
  const numPrice = typeof p.price === "number" ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0;
  // Always format as USD ($)
  const priceVal = typeof p.price === "string" && p.price.startsWith("$")
    ? p.price
    : `$${numPrice.toLocaleString()}`;
  const origPriceVal = p.compareAtPrice
    ? `$${Number(p.compareAtPrice).toLocaleString()}`
    : p.originalPrice
    ? (typeof p.originalPrice === "string" && p.originalPrice.startsWith("$")
        ? p.originalPrice
        : `$${parseFloat(String(p.originalPrice).replace(/[^0-9.]/g, "")) || ""}`)
    : "";
  const discountVal =
    p.badge ||
    p.discount ||
    (p.compareAtPrice && numPrice && p.compareAtPrice > numPrice
      ? `${Math.round(((p.compareAtPrice - numPrice) / p.compareAtPrice) * 100)}% OFF`
      : "");

  return {
    id: p.id,
    sku: p.sku || "",
    name: p.name || p.title || "Untitled Product",
    price: priceVal,
    originalPrice: origPriceVal,
    discount: discountVal,
    rating: p.rating || 5.0,
    image: p.thumbnail || p.image || defaultFallbackUrl,
    thumbnail: p.thumbnail || p.image || defaultFallbackUrl,
    tag: p.category || p.tag || "Clothing",
    category: p.category || p.tag || "Clothing",
    inStock: p.stock !== undefined ? Number(p.stock) > 0 : (p.inStock ?? true),
  };
}

/**
 * Retrieves stored products STRICTLY scoped to the given storeId.
 * Does NOT scan other stores' keys — prevents cross-store product leaking.
 */
export function getStoredProducts(explicitStoreId?: string): Product[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storeId = resolveStoreId(explicitStoreId);
    
    // 1. Direct key attempt — strictly for this store only
    if (storeId) {
      const key = getStorageKey(storeId);
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return sanitizeProductList(parsed, storeId);
          }
        } catch {}
      }
    }

    // 2. Active store ID attempt ONLY if no explicit storeId was provided
    if (!explicitStoreId) {
      const activeStoreId = localStorage.getItem("active_store_id");
      if (activeStoreId && activeStoreId !== storeId) {
        const activeKey = getStorageKey(activeStoreId);
        const rawActive = localStorage.getItem(activeKey);
        if (rawActive !== null) {
          try {
            const parsed = JSON.parse(rawActive);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return sanitizeProductList(parsed, activeStoreId);
            }
          } catch {}
        }
      }
    }

    // No fallback scan — strictly return empty if no products found for this store
    return [];
  } catch (e) {
    console.error("Error reading stored products:", e);
    return [];
  }
}

/**
 * Saves a list of products to localStorage and notifies listeners,
 * and automatically synchronizes to the Supabase database for this store.
 */
export function saveStoredProducts(products: Product[], explicitStoreId?: string): void {
  if (typeof window === "undefined") return;

  try {
    const storeId = resolveStoreId(explicitStoreId);
    if (!storeId) return;

    const key = getStorageKey(storeId);
    // Ensure all products carry this store's ID
    const scopedProducts = products.map((p) => ({ ...p, storeId }));

    localStorage.setItem(key, JSON.stringify(scopedProducts));
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT));

    // Synchronize to the backend / database for this store
    const storefrontProducts = scopedProducts.map((p) => toStorefrontProduct(p));

    fetch(`/api/stores/${storeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commerce_config: { products: storefrontProducts },
        layout_config: { products: storefrontProducts },
      }),
    }).catch((err) => console.warn("[product-storage] DB sync background note:", err));
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
  explicitStoreId?: string,
): Product {
  const currentStoreId =
    explicitStoreId ||
    formData.storeId ||
    (typeof window !== "undefined" ? localStorage.getItem("active_store_id") : null) ||
    undefined;

  const products = getStoredProducts(currentStoreId);
  const nowISO = new Date().toISOString();
  // Ensure product ID is preserved or generated once
  const productId = formData.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

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
    (formData.sku && formData.sku !== "WATCH" && formData.sku.length > 2
      ? formData.sku.toUpperCase()
      : generateUniqueSku(formData.title, formData.category));

  const updatedFormData: ProductFormData = {
    ...formData,
    id: productId,
    sku,
    storeId: currentStoreId,
    status: targetStatus === "published" ? "published" : "draft",
    images: allImageObjects,
  };

  const productRecord: Product = {
    id: productId,
    storeId: currentStoreId,
    name: formData.title || "Untitled Product",
    sku,
    price: Number(formData.price) || 0,
    stock: totalStock,
    category: formData.category || "Uncategorized",
    brand: formData.brand || "Altrivo Signature",
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

  saveStoredProducts(newProductsList, currentStoreId);
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
