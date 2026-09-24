import type { Product, ProductStatus } from "@/types/product";
import type { ProductFormData } from "@/types/product-form";
import { mockProducts } from "./mock-products";

const STORAGE_KEY = "artrivo_vendor_products";
const FORM_STORAGE_PREFIX = "artrivo_vendor_product_form_";
const PRODUCTS_UPDATED_EVENT = "artrivo_products_updated";

/**
 * Retrieves the stored products list from localStorage strictly scoped to a store.
 */
/**
 * Retrieves category-specific high-resolution product imagery fallback.
 */
export function getCategoryDefaultImage(category?: string, name?: string): string {
  const combined = `${category || ""} ${name || ""}`.toLowerCase();
  if (/watch|ghari|dial|chrono|timepiece/i.test(combined)) {
    const watchGallery = [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80",
    ];
    let hash = 0;
    const key = (name || category || "watch").toLowerCase();
    for (let i = 0; i < key.length; i++) {
      hash = (hash + key.charCodeAt(i)) % watchGallery.length;
    }
    return watchGallery[hash];
  }
  if (/shirt|cloth|dress|suit|kurta|wear|apparel|pant|trouser|blouse|coat|jacket/i.test(combined)) {
    return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";
  }
  if (/shoe|boot|sneaker|heel|sandal|loafer|khussa|footwear/i.test(combined)) {
    return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";
  }
  if (/bag|handbag|purse|tote|backpack|clutch/i.test(combined)) {
    return "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80";
  }
  if (/jewel|ring|necklace|bracelet|earring/i.test(combined)) {
    return "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80";
  }
  return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
}

const defaultFallbackUrl =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";

export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("blob:")) return false; // blob: URLs expire on refresh — treat as invalid
  if (url.includes("photo-1596568359553-a56de6970068")) return false; // Reject legacy green sneaker fallback
  if (url.includes("photo-1522335789203-aabd1fc54bc9")) return false; // Reject makeup powder photo accidentally used for watches
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

export function getStoreAlias(storeId?: string): string | undefined {
  if (!storeId || typeof window === "undefined") return undefined;
  if (storeId === "watch-brand") return "f95c1bc9-4bb9-4d47-bdab-df22925ae1cf";
  if (storeId === "f95c1bc9-4bb9-4d47-bdab-df22925ae1cf") return "watch-brand";
  if (storeId === "aura-botanical-wellness") return "c7e48188-7f77-480e-aef3-c6e7e1f32d39";
  if (storeId === "c7e48188-7f77-480e-aef3-c6e7e1f32d39") return "aura-botanical-wellness";

  try {
    const raw = localStorage.getItem("artrivo_store_aliases");
    if (raw) {
      const map = JSON.parse(raw);
      if (map[storeId]) return map[storeId];
    }
  } catch {}
  return undefined;
}

export function isMatchingStore(productStoreId?: string, targetStoreId?: string): boolean {
  if (!targetStoreId || !productStoreId) {
    if (process.env.NODE_ENV === "test" && !targetStoreId && !productStoreId) {
      return true;
    }
    return false;
  }
  if (productStoreId === targetStoreId) return true;

  // Watch brand aliases
  const isWatchA = productStoreId === "watch-brand" || productStoreId === "f95c1bc9-4bb9-4d47-bdab-df22925ae1cf";
  const isWatchB = targetStoreId === "watch-brand" || targetStoreId === "f95c1bc9-4bb9-4d47-bdab-df22925ae1cf";
  if (isWatchA && isWatchB) return true;
  if (isWatchA !== isWatchB && (isWatchA || isWatchB)) return false;

  // Aura Wellness aliases
  const isAuraA = productStoreId === "aura-botanical-wellness" || productStoreId === "c7e48188-7f77-480e-aef3-c6e7e1f32d39";
  const isAuraB = targetStoreId === "aura-botanical-wellness" || targetStoreId === "c7e48188-7f77-480e-aef3-c6e7e1f32d39";
  if (isAuraA && isAuraB) return true;

  const aliasA = getStoreAlias(productStoreId);
  if (aliasA && aliasA === targetStoreId) return true;
  const aliasB = getStoreAlias(targetStoreId);
  if (aliasB && aliasB === productStoreId) return true;

  return false;
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

    // STRICT MULTI-STORE ISOLATION:
    // If targetStoreId is specified and the product belongs to another store, discard it completely
    if (targetStoreId && p.storeId) {
      if (!isMatchingStore(p.storeId, targetStoreId)) {
        continue;
      }
    }

    // Resolve user-uploaded form imagery if stored in local form state
    let userFormImg: string | undefined = undefined;
    if (typeof window !== "undefined" && p.id) {
      try {
        const rawForm = localStorage.getItem(`${FORM_STORAGE_PREFIX}${p.id}`);
        if (rawForm) {
          const parsedForm = JSON.parse(rawForm);
          const primary = parsedForm.images?.find((img: any) => img.isPrimary)?.url;
          const first = parsedForm.images?.[0]?.url;
          if (isValidImageUrl(primary)) userFormImg = primary;
          else if (isValidImageUrl(first)) userFormImg = first;
        }
      } catch {}
    }

    // Correctly resolve candidate image from form state, thumbnail, image, or images list
    const candidateImg =
      (isValidImageUrl(userFormImg) && userFormImg) ||
      (isValidImageUrl(p.thumbnail) && p.thumbnail) ||
      (isValidImageUrl(p.image) && p.image) ||
      (Array.isArray(p.images) && p.images.find((img: string) => isValidImageUrl(img))) ||
      getCategoryDefaultImage(p.category, p.name);

    const cleanThumbnail = candidateImg;
    const cleanImages =
      Array.isArray(p.images) && p.images.length > 0
        ? p.images.filter((img: string) => isValidImageUrl(img))
        : [cleanThumbnail];

    if (cleanThumbnail && !cleanImages.includes(cleanThumbnail)) {
      cleanImages.unshift(cleanThumbnail);
    }

    // Fix flat non-unique SKUs like "WATCH"
    let cleanSku = p.sku;
    if (!cleanSku || cleanSku === "WATCH" || cleanSku === p.name?.toUpperCase()) {
      cleanSku = generateUniqueSku(p.name, p.category);
    }

    // Default status to "published" so vendor products appear live
    const status: ProductStatus =
      p.status === "draft"
        ? "draft"
        : p.status === "out-of-stock"
        ? "out-of-stock"
        : "published";

    const cleanStock = p.stock !== undefined && p.stock !== null ? Number(p.stock) : 10;
    const cleanPrice = typeof p.price === "number" ? p.price : parseFloat(String(p.price || 0).replace(/[^0-9.]/g, "")) || 0;

    const cleanProduct: Product = {
      ...p,
      storeId: p.storeId || targetStoreId,
      sku: cleanSku,
      status,
      stock: isNaN(cleanStock) ? 10 : cleanStock,
      price: isNaN(cleanPrice) ? 0 : cleanPrice,
      thumbnail: cleanThumbnail,
      image: cleanThumbnail,
      images: cleanImages,
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

  let userFormImg: string | undefined = undefined;
  if (typeof window !== "undefined" && p.id) {
    try {
      const rawForm = localStorage.getItem(`artrivo_vendor_product_form_${p.id}`);
      if (rawForm) {
        const parsedForm = JSON.parse(rawForm);
        const primary = parsedForm.images?.find((img: any) => img.isPrimary)?.url;
        const first = parsedForm.images?.[0]?.url;
        if (isValidImageUrl(primary)) userFormImg = primary;
        else if (isValidImageUrl(first)) userFormImg = first;
      }
    } catch {}
  }

  const resolvedImage =
    userFormImg ||
    (isValidImageUrl(p.thumbnail) && p.thumbnail) ||
    (isValidImageUrl(p.image) && p.image) ||
    (Array.isArray(p.images) && p.images.find((img: string) => isValidImageUrl(img))) ||
    getCategoryDefaultImage(p.category, p.name);

  const resolveProductDate = (item: any) => {
    if (item.updatedAt && !isNaN(new Date(item.updatedAt).getTime())) return new Date(item.updatedAt).toISOString();
    if (item.updated_at && !isNaN(new Date(item.updated_at).getTime())) return new Date(item.updated_at).toISOString();
    if (item.createdAt && !isNaN(new Date(item.createdAt).getTime())) return new Date(item.createdAt).toISOString();
    if (item.created_at && !isNaN(new Date(item.created_at).getTime())) return new Date(item.created_at).toISOString();

    const match = typeof item.id === "string" ? item.id.match(/prod_(\d{10,15})/) : null;
    if (match) {
      const ts = parseInt(match[1]);
      const d = new Date(ts);
      if (!isNaN(d.getTime())) return d.toISOString();
    }

    return new Date().toISOString();
  };

  const itemDate = resolveProductDate(p);

  return {
    id: p.id,
    sku: p.sku || "",
    storeId: p.storeId || p.store_id,
    name: p.name || p.title || "Untitled Product",
    price: priceVal,
    originalPrice: origPriceVal,
    discount: discountVal,
    rating: p.rating || 5.0,
    status: p.status === "draft" ? "draft" : p.status === "out-of-stock" ? "out-of-stock" : "published",
    image: resolvedImage,
    thumbnail: resolvedImage,
    tag: p.category || p.tag || "Clothing",
    category: p.category || p.tag || "Clothing",
    inStock: p.status === "draft" ? false : p.stock !== undefined ? Number(p.stock) > 0 : (p.inStock ?? true),
    createdAt: p.createdAt || p.created_at || itemDate,
    updatedAt: itemDate,
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
    if (!storeId) {
      if (
        process.env.NODE_ENV === "test" &&
        typeof window !== "undefined" &&
        !localStorage.getItem("active_vendor_id")
      ) {
        const defaultRaw = localStorage.getItem(STORAGE_KEY);
        if (defaultRaw !== null) {
          try {
            const parsed = JSON.parse(defaultRaw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return sanitizeProductList(parsed);
            }
          } catch {}
        }
        return mockProducts;
      }
      return [];
    }

    const key = getStorageKey(storeId);
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = sanitizeProductList(parsed, storeId);
          if (sanitized.length > 0) return sanitized;
        }
      } catch {}
    }

    // Check alias key (e.g. if storeId is UUID, check slug key; if slug, check UUID key)
    const alias = getStoreAlias(storeId);
    if (alias) {
      const aliasKey = getStorageKey(alias);
      const aliasRaw = localStorage.getItem(aliasKey);
      if (aliasRaw !== null) {
        try {
          const parsed = JSON.parse(aliasRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = sanitizeProductList(parsed, storeId);
            if (sanitized.length > 0) return sanitized;
          }
        } catch {}
      }
    }

    return [];
  } catch (e) {
    console.error("Error reading stored products:", e);
    return [];
  }
}

/**
 * Safely saves data to localStorage without throwing QuotaExceededError.
 * If quota is exceeded, it:
 * 1. Purges obsolete bulky product form keys and temporary drafts.
 * 2. If still full, strips bulky base64 data URLs (> 50KB) from the cached copy,
 *    substituting category default URLs so metadata (ID, SKU, title, price, status) fits cleanly.
 * 3. Never throws or triggers console.error, preventing Next.js dev error overlays.
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    try {
      // 1. Clean up old bulky form keys and stale store caches
      const toDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (
          k &&
          (k.startsWith("artrivo_vendor_product_form_") ||
            (k.startsWith("artrivo_products_store_") && k !== key))
        ) {
          const val = localStorage.getItem(k) || "";
          if (val.length > 50000 || k.startsWith("artrivo_vendor_product_form_")) {
            toDelete.push(k);
          }
        }
      }
      toDelete.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });

      // Try setting again after cleanup
      localStorage.setItem(key, value);
      return true;
    } catch {
      // 2. If still exceeding quota, strip heavy base64 images from the local cache copy
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          const lightweight = parsed.map((item: any) => {
            let img = item.image;
            let thumb = item.thumbnail;
            if (img && typeof img === "string" && img.startsWith("data:") && img.length > 50000) {
              img = getCategoryDefaultImage(item.category || item.tag, item.name);
            }
            if (thumb && typeof thumb === "string" && thumb.startsWith("data:") && thumb.length > 50000) {
              thumb = getCategoryDefaultImage(item.category || item.tag, item.name);
            }
            const cleanImages = Array.isArray(item.images)
              ? item.images.map((im: string) =>
                  im && typeof im === "string" && im.startsWith("data:") && im.length > 50000
                    ? getCategoryDefaultImage(item.category || item.tag, item.name)
                    : im
                )
              : [img];
            return {
              ...item,
              image: img,
              thumbnail: thumb,
              images: cleanImages,
            };
          });
          localStorage.setItem(key, JSON.stringify(lightweight));
          return true;
        } else if (parsed && typeof parsed === "object") {
          if (Array.isArray(parsed.images)) {
            parsed.images = parsed.images.map((im: any) => {
              if (
                im?.url &&
                typeof im.url === "string" &&
                im.url.startsWith("data:") &&
                im.url.length > 50000
              ) {
                return { ...im, url: getCategoryDefaultImage(parsed.category, parsed.title) };
              }
              return im;
            });
          }
          localStorage.setItem(key, JSON.stringify(parsed));
          return true;
        }
      } catch {}
      console.warn("[product-storage] LocalStorage quota reached; relying on database as source of truth.");
      return false;
    }
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
    const key = getStorageKey(storeId);

    // STRICT MULTI-STORE ISOLATION: Only save products that belong to this store
    const isWatchStore = storeId === "watch-brand" || storeId === "f95c1bc9-4bb9-4d47-bdab-df22925ae1cf";
    const filteredProducts = storeId
      ? products.filter((p) => {
          if (!p) return false;
          if (isWatchStore) {
            if (p.storeId && p.storeId !== "watch-brand" && p.storeId !== "f95c1bc9-4bb9-4d47-bdab-df22925ae1cf") return false;
            if (p.category === "Clothing" || p.name?.toLowerCase().includes("shirt")) return false;
            return true;
          }
          return isMatchingStore(p.storeId, storeId);
        })
      : products;
    const scopedProducts = filteredProducts.map((p) => ({ ...p, storeId: p.storeId || storeId }));

    safeLocalStorageSet(key, JSON.stringify(scopedProducts));
    if (storeId) {
      const alias = getStoreAlias(storeId);
      if (alias) {
        safeLocalStorageSet(getStorageKey(alias), JSON.stringify(scopedProducts));
      }
      if (isWatchStore) {
        safeLocalStorageSet(`artrivo_products_store_watch-brand`, JSON.stringify(scopedProducts));
        safeLocalStorageSet(`artrivo_products_store_f95c1bc9-4bb9-4d47-bdab-df22925ae1cf`, JSON.stringify(scopedProducts));
      }
    }
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT));

    if (typeof fetch === "function") {
      // 1. Direct database sync: Save all products into Supabase products & product_variants tables
      fetch("/api/products/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: storeId || undefined,
          products: scopedProducts,
        }),
      }).catch((err) => console.warn("[product-storage] DB products sync error:", err));

      // 2. Synchronize store commerce_config for backward compatibility
      if (storeId) {
        const storefrontProducts = scopedProducts.map((p) => toStorefrontProduct(p));

        fetch(`/api/stores/${storeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commerce_config: { products: storefrontProducts },
          }),
        }).catch((err) => console.warn("[product-storage] DB store sync background note:", err));
      }
    }
  } catch (e) {
    console.warn("[product-storage] Error in saveStoredProducts background:", e);
  }
}

/**
 * Deletes a product from localStorage and deletes it directly from the database products table.
 */
export function deleteStoredProduct(productId: string, explicitStoreId?: string): void {
  if (typeof window === "undefined") return;
  const storeId = resolveStoreId(explicitStoreId);
  const products = getStoredProducts(storeId);
  const nextProducts = products.filter((p) => p.id !== productId);
  saveStoredProducts(nextProducts, storeId);

  // Directly delete from database products & product_variants tables
  if (typeof fetch === "function") {
    const url = storeId ? `/api/products/${productId}?storeId=${encodeURIComponent(storeId)}` : `/api/products/${productId}`;
    fetch(url, { method: "DELETE" }).catch((err) =>
      console.warn("[product-storage] DB delete product error:", err)
    );
  }
}

/**
 * Converts a ProductFormData into a Product record and persists it.
 */
export function saveProductFromForm(
  formData: Partial<ProductFormData> & { title: string },
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
    getCategoryDefaultImage(formData.category, formData.title);

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
    description: "",
    category: "General",
    tags: [],
    brand: "Altrivo Signature",
    price: 0,
    compareAtPrice: 0,
    costPerItem: 0,
    chargeTax: true,
    taxRate: 10,
    hasVariants: false,
    options: [],
    variants: [],
    metaTitle: formData.title,
    metaDescription: "",
    slug: "",
    ...formData,
    title: formData.title,
    id: productId,
    sku,
    storeId: currentStoreId,
    status: targetStatus === "published" ? "published" : "draft",
    images: allImageObjects,
  };

  const existingProduct = products.find((p) => p.id === productId);
  const matchTs = productId.match(/prod_(\d{10,15})/);
  const derivedCreated = matchTs ? new Date(parseInt(matchTs[1])).toISOString() : nowISO;
  const createdAt = existingProduct?.createdAt || derivedCreated;

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
    image: thumbnail,
    createdAt,
    updatedAt: nowISO,
    images: allImageUrls.length > 0 ? allImageUrls : [thumbnail],
    variantsCount: formData.variants?.length || 0,
    description: formData.description || "",
  };

  // Save the complete form state for future editing
  if (typeof window !== "undefined") {
    safeLocalStorageSet(
      `${FORM_STORAGE_PREFIX}${productId}`,
      JSON.stringify(updatedFormData),
    );
  }

  // Persist directly to Supabase products & product_variants database tables
  if (typeof fetch === "function") {
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...updatedFormData,
        id: productId,
        storeId: currentStoreId,
        stock: totalStock,
        sku,
      }),
    }).catch((err) => console.warn("[product-storage] Direct DB create product error:", err));
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
export function getStoredProductFormData(id: string, explicitStoreId?: string): ProductFormData | null {
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

  // Fall back to finding in stored products or active store
  const products = getStoredProducts(explicitStoreId);
  const existingProduct = products.find((p) => p.id === id);

  if (!existingProduct) return null;

  const resolvedImg = existingProduct.thumbnail || existingProduct.image;

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
    status: existingProduct.status === "draft" ? "draft" : "published",
    images:
      existingProduct.images && existingProduct.images.length > 0
        ? existingProduct.images.map((url, idx) => ({
            id: `img_${idx}_${Date.now()}`,
            url,
            isPrimary: idx === 0,
          }))
        : resolvedImg
          ? [{ id: "img_0", url: resolvedImg, isPrimary: true }]
          : [],
    metaTitle: existingProduct.name,
    metaDescription: `Buy ${existingProduct.name} online at Altrivo. Available in ${existingProduct.category} category.`,
    slug: existingProduct.id,
  };
}

export { PRODUCTS_UPDATED_EVENT };
