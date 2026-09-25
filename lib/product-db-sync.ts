import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";
import type { Product } from "@/types/product";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Deterministically converts any string ID (like "prod_123" or "watch_1") into a valid UUID.
 * If already a valid UUID, returns it unchanged.
 */
export function toValidUUID(str: string): string {
  if (!str) return crypto.randomUUID();
  if (UUID_REGEX.test(str)) return str.toLowerCase();

  const hash = crypto.createHash("md5").update("altrivo-prod-" + str).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

/**
 * Safely parses any price representation (number, "$23", "23.50") into a clean number.
 */
export function parsePrice(val: unknown): number {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Resolves the vendor_id associated with a store.
 */
export async function resolveStoreVendor(storeId?: string): Promise<string | null> {
  if (!storeId || !supabaseAdmin) return null;

  try {
    const query = UUID_REGEX.test(storeId)
      ? supabaseAdmin.from("stores").select("vendor_id").eq("id", storeId).single()
      : supabaseAdmin.from("stores").select("vendor_id").eq("slug", storeId).single();

    const { data } = await query;
    if (data?.vendor_id) return data.vendor_id;
  } catch {}

  return null;
}

/**
 * Creates or updates a single product in the Supabase `products` and `product_variants` tables.
 */
export async function createOrUpdateProductInDatabase(
  productData: any,
  storeId?: string,
  explicitVendorId?: string
): Promise<{ success: boolean; product?: Product; error?: string }> {
  if (!supabaseAdmin) {
    return { success: false, error: "Supabase admin client not configured" };
  }

  const effectiveStoreId = storeId || productData.storeId || productData.store_id;
  let vendorId = explicitVendorId || productData.vendor_id || productData.vendorId;

  if (!vendorId && effectiveStoreId) {
    vendorId = await resolveStoreVendor(effectiveStoreId);
  }

  // Fallback to default dev vendor if in dev mode
  if (!vendorId || !UUID_REGEX.test(vendorId)) {
    vendorId = "374c6044-19d9-49db-a508-dccf3c1f6f2f"; // Known existing vendor UUID in database
  }

  const prodId = toValidUUID(productData.id || productData.sku || productData.name || productData.title);
  const title = String(productData.title || productData.name || "Product").trim();
  const description = String(productData.description || "").trim();
  const category = String(productData.category || "General").trim();
  const price = parsePrice(productData.price);
  const comparePrice = parsePrice(productData.comparePrice || productData.compareAtPrice || productData.compare_price || 0);
  const cost = parsePrice(productData.cost || productData.costPerItem || 0);
  // Extract cover image URL — handles both string URLs and ProductImage objects {id, url, isPrimary}
  const resolveImageUrl = (images: any): string | null => {
    if (!images) return null;
    if (Array.isArray(images) && images.length > 0) {
      const primary = images.find((img: any) => img?.isPrimary === true);
      const first = images[0];
      const candidate = primary || first;
      if (typeof candidate === "string") return candidate;
      if (candidate && typeof candidate === "object" && candidate.url) return candidate.url;
    }
    return null;
  };
  const imageUrl =
    (typeof productData.image === "string" && productData.image) ||
    (typeof productData.thumbnail === "string" && productData.thumbnail) ||
    (typeof productData.image_url === "string" && productData.image_url) ||
    resolveImageUrl(productData.images) ||
    null;
  const status = productData.status === "draft" ? "draft" : productData.status === "archived" ? "archived" : "published";
  const nowISO = new Date().toISOString();

  // Store tag array to isolate products by store
  const rawTags: string[] = Array.isArray(productData.tags) ? [...productData.tags] : [];
  if (effectiveStoreId && !rawTags.includes(`store:${effectiveStoreId}`)) {
    rawTags.push(`store:${effectiveStoreId}`);
  }

  // ── Collect and normalize all gallery images ────────────────────────────
  const allImageObjects: { url: string; isPrimary?: boolean }[] = [];
  if (Array.isArray(productData.images) && productData.images.length > 0) {
    for (const img of productData.images) {
      if (typeof img === "string" && img) {
        allImageObjects.push({ url: img, isPrimary: false });
      } else if (img && typeof img === "object" && img.url) {
        allImageObjects.push({ url: img.url, isPrimary: img.isPrimary === true });
      }
    }
  }
  // Ensure the cover image is always present in allImageObjects
  if (imageUrl && !allImageObjects.some((i) => i.url === imageUrl)) {
    allImageObjects.unshift({ url: imageUrl, isPrimary: true });
  }

  // Clean string array of image URLs
  const cleanImageUrls: string[] = allImageObjects.length > 0
    ? allImageObjects.map((i) => i.url).filter(Boolean)
    : Array.isArray(productData.images)
      ? productData.images.map((i: any) => (typeof i === "string" ? i : i?.url)).filter(Boolean)
      : imageUrl ? [imageUrl] : [];

  const productPayload = {
    id: prodId,
    vendor_id: vendorId,
    name: title,
    title: title,
    description: description,
    category: category,
    price: price,
    compare_price: comparePrice,
    cost: cost,
    image_url: imageUrl,
    images: cleanImageUrls,
    tags: rawTags,
    status: status,
    updated_at: nowISO,
  };

  const { error: prodErr } = await supabaseAdmin
    .from("products")
    .upsert(productPayload, { onConflict: "id" });

  if (prodErr) {
    console.error(`[product-db-sync] Failed to upsert product ${prodId}:`, prodErr.message);
    return { success: false, error: prodErr.message };
  }

  // ── Save all gallery images into product_media table ──────────────────────
  if (allImageObjects.length > 0) {
    // Delete old media rows for this product first, then re-insert fresh set
    await supabaseAdmin.from("product_media").delete().eq("product_id", prodId);

    // Resolve a valid store UUID for the product_media FK
    let mediaStoreId: string | undefined = undefined;
    if (effectiveStoreId && UUID_REGEX.test(effectiveStoreId)) {
      mediaStoreId = effectiveStoreId;
    } else if (effectiveStoreId) {
      try {
        const { data: storeRow } = await supabaseAdmin
          .from("stores")
          .select("id")
          .eq("slug", effectiveStoreId)
          .single();
        if (storeRow?.id) mediaStoreId = storeRow.id;
      } catch {}
    }

    const mediaRows = allImageObjects.map((img, idx) => ({
      product_id: prodId,
      ...(mediaStoreId ? { store_id: mediaStoreId } : {}),
      type: "image" as const,
      url: img.url,
      alt_text: productData.title || productData.name || "Product image",
      sort_order: img.isPrimary ? 0 : idx + 1,
      created_at: nowISO,
    }));

    await supabaseAdmin.from("product_media").insert(mediaRows);
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Handle variants
  const variants = Array.isArray(productData.variants) && productData.variants.length > 0
    ? productData.variants
    : [
        {
          id: productData.variantId || `${prodId}-primary`,
          sku: productData.sku || ("SKU-" + prodId.slice(0, 8)).toUpperCase(),
          price: price,
          stock: typeof productData.stock === "number" ? productData.stock : 10,
          image_url: imageUrl,
          enabled: status !== "archived",
        },
      ];

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    const variantId = toValidUUID(v.id || `${prodId}-var-${i}`);
    const variantSku = String(v.sku || productData.sku || `SKU-${prodId.slice(0, 8)}-${i + 1}`).toUpperCase();
    const variantPrice = parsePrice(v.price ?? price);
    const variantStock = typeof v.stock === "number" ? v.stock : 10;
    const variantImage = v.image || v.image_url || imageUrl;

    await supabaseAdmin.from("product_variants").upsert(
      {
        id: variantId,
        product_id: prodId,
        sku: variantSku,
        option_values: v.optionValues || v.option_values || {},
        price: variantPrice,
        stock: variantStock,
        image_url: variantImage,
        enabled: v.enabled !== false && status !== "archived",
        updated_at: nowISO,
      },
      { onConflict: "id" }
    );
  }

  // Keep store's commerce_config in sync for backward compatibility if store exists
  if (effectiveStoreId) {
    syncStoreJsonConfig(effectiveStoreId, {
      id: productData.id || prodId,
      name: title,
      title: title,
      sku: productData.sku || variants[0]?.sku,
      price: price,
      stock: typeof productData.stock === "number" ? productData.stock : 10,
      category: category,
      status: status,
      image: imageUrl,
      thumbnail: imageUrl,
      images: cleanImageUrls.length > 0 ? cleanImageUrls : [imageUrl],
      storeId: effectiveStoreId,
      updatedAt: nowISO,
    }).catch((e) => console.warn("[product-db-sync] Background store config sync note:", e));
  }

  const mappedProduct: Product = {
    id: productData.id || prodId,
    storeId: effectiveStoreId,
    name: title,
    sku: productData.sku || variants[0]?.sku || ("SKU-" + prodId.slice(0, 8)).toUpperCase(),
    price: price,
    stock: typeof productData.stock === "number" ? productData.stock : 10,
    category: category,
    brand: productData.brand || "Altrivo Signature",
    status: status as any,
    thumbnail: imageUrl || "",
    image: imageUrl || "",
    images: allImageObjects.length > 0
      ? allImageObjects.map((i) => i.url).filter(Boolean)
      : Array.isArray(productData.images) && productData.images.length > 0
        ? productData.images.map((i: any) => typeof i === "string" ? i : i?.url).filter(Boolean)
        : [imageUrl || ""],
    createdAt: productData.createdAt || nowISO,
    updatedAt: nowISO,
    description: description,
    variantsCount: variants.length,
  };

  return { success: true, product: mappedProduct };
}

/**
 * Deletes a product from the Supabase `products` and `product_variants` tables.
 */
export async function deleteProductFromDatabase(
  productIdOrSku: string,
  storeId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { success: false, error: "Supabase not configured" };
  }

  const prodId = toValidUUID(productIdOrSku);

  // 1. Delete associated variants
  await supabaseAdmin.from("product_variants").delete().eq("product_id", prodId);

  // 2. Delete product record
  const { error } = await supabaseAdmin.from("products").delete().eq("id", prodId);

  if (error) {
    console.error("[product-db-sync] Failed to delete product from database:", error.message);
    return { success: false, error: error.message };
  }

  // Also remove from store's commerce_config if storeId is known
  if (storeId) {
    removeProductFromStoreJsonConfig(storeId, productIdOrSku).catch((e) =>
      console.warn("[product-db-sync] Background remove from store config note:", e)
    );
  }

  return { success: true };
}

/**
 * Synchronizes an array of store products directly into the Supabase `products` and `product_variants` tables.
 */
export async function syncProductsToDatabase(
  vendorId: string,
  storeId: string,
  products: any[]
): Promise<{ success: boolean; syncedCount: number; error?: string }> {
  if (!supabaseAdmin) {
    return { success: false, syncedCount: 0, error: "Supabase admin client not configured" };
  }

  let effectiveVendorId = vendorId;
  if (!effectiveVendorId || !UUID_REGEX.test(effectiveVendorId)) {
    const resolved = await resolveStoreVendor(storeId);
    if (resolved) effectiveVendorId = resolved;
    else effectiveVendorId = "374c6044-19d9-49db-a508-dccf3c1f6f2f";
  }

  if (!Array.isArray(products) || products.length === 0) {
    return { success: true, syncedCount: 0 };
  }

  let syncedCount = 0;

  for (const raw of products) {
    if (!raw) continue;
    const res = await createOrUpdateProductInDatabase(raw, storeId, effectiveVendorId);
    if (res.success) syncedCount++;
  }

  return { success: true, syncedCount };
}

/**
 * Updates a single product's price, stock, or status in Supabase.
 */
export async function updateProductInDatabase(
  productIdOrSku: string,
  updates: {
    price?: number;
    stock?: number;
    lowStockThreshold?: number;
    status?: string;
    name?: string;
    title?: string;
    description?: string;
    category?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { success: false, error: "Supabase not configured" };
  }

  const prodId = toValidUUID(productIdOrSku);
  const nowISO = new Date().toISOString();

  // 1. Update products table
  const prodUpdates: Record<string, any> = { updated_at: nowISO };
  if (typeof updates.price === "number") prodUpdates.price = updates.price;
  if (typeof updates.status === "string") prodUpdates.status = updates.status;
  if (typeof updates.name === "string") {
    prodUpdates.name = updates.name;
    prodUpdates.title = updates.name;
  }
  if (typeof updates.title === "string") {
    prodUpdates.name = updates.title;
    prodUpdates.title = updates.title;
  }
  if (typeof updates.description === "string") prodUpdates.description = updates.description;
  if (typeof updates.category === "string") prodUpdates.category = updates.category;

  if (Object.keys(prodUpdates).length > 1) {
    const { error: pErr } = await supabaseAdmin
      .from("products")
      .update(prodUpdates)
      .eq("id", prodId);

    if (pErr) console.warn("[product-db-sync] Update product error:", pErr.message);
  }

  // 2. Update product_variants table
  const varUpdates: Record<string, any> = { updated_at: nowISO };
  if (typeof updates.price === "number") varUpdates.price = updates.price;
  if (typeof updates.stock === "number") varUpdates.stock = updates.stock;

  if (Object.keys(varUpdates).length > 1) {
    const { error: vErr } = await supabaseAdmin
      .from("product_variants")
      .update(varUpdates)
      .eq("product_id", prodId);

    if (vErr) console.warn("[product-db-sync] Update variant error:", vErr.message);
  }

  return { success: true };
}

/**
 * Fetches products from Supabase `products` and joins `product_variants`.
 */
export async function fetchProductsFromDatabase(options?: {
  vendorId?: string;
  storeId?: string;
  status?: string;
  search?: string;
}): Promise<Product[]> {
  if (!supabaseAdmin) return [];

  let query = supabaseAdmin
    .from("products")
    .select(`
      id,
      vendor_id,
      name,
      title,
      description,
      category,
      price,
      compare_price,
      cost,
      image_url,
      images,
      tags,
      status,
      created_at,
      updated_at,
      product_variants (
        id,
        sku,
        price,
        stock,
        enabled,
        image_url
      ),
      product_media (
        url,
        sort_order,
        type
      )
    `)
    .order("created_at", { ascending: false });

  if (options?.vendorId && UUID_REGEX.test(options.vendorId)) {
    query = query.eq("vendor_id", options.vendorId);
  }

  if (options?.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.warn("[product-db-sync] fetchProducts error:", error?.message);
    return [];
  }

  let mapped = data.map((row: any) => {
    const variants = Array.isArray(row.product_variants) ? row.product_variants : [];
    const primaryVar = variants[0];
    const totalStock = variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
    const sku = primaryVar?.sku || ("SKU-" + row.id.slice(0, 8)).toUpperCase();
    const price = typeof row.price === "number" ? row.price : primaryVar?.price || 0;
    const thumbnail = row.image_url || primaryVar?.image_url || null;

    // Build gallery images from row.images and product_media (sorted by sort_order), falling back to cover image
    const rowImages: string[] = Array.isArray(row.images)
      ? row.images.filter((img: any) => typeof img === "string" && img.length > 0)
      : [];
    const mediaRows: any[] = Array.isArray(row.product_media)
      ? [...row.product_media].sort((a: any, b: any) => (a.sort_order ?? 99) - (b.sort_order ?? 99))
      : [];
    const galleryImages: string[] = mediaRows
      .filter((m: any) => m.type === "image" && m.url)
      .map((m: any) => m.url as string);

    const combinedImages: string[] = [];
    for (const url of [...rowImages, ...galleryImages]) {
      if (url && !combinedImages.includes(url)) {
        combinedImages.push(url);
      }
    }
    // Always ensure the cover image is included
    if (thumbnail && !combinedImages.includes(thumbnail)) {
      combinedImages.unshift(thumbnail);
    }
    const images = combinedImages.length > 0 ? combinedImages : (thumbnail ? [thumbnail] : []);

    // Extract storeId if present in tags: store:<storeId>
    let associatedStoreId = "";
    if (Array.isArray(row.tags)) {
      const storeTag = row.tags.find((t: string) => typeof t === "string" && t.startsWith("store:"));
      if (storeTag) {
        associatedStoreId = storeTag.replace("store:", "");
      }
    }

    return {
      id: row.id,
      storeId: associatedStoreId,
      name: row.title || row.name || "Product",
      sku,
      price,
      stock: variants.length > 0 ? totalStock : 10,
      category: row.category || "General",
      brand: "Altrivo Signature",
      status: row.status || "published",
      thumbnail,
      image: thumbnail,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
      images,
      variantsCount: variants.length,
      description: row.description || "",
      tags: row.tags || [],
    } as Product;
  });

  // Filter by storeId if specified
  if (options?.storeId) {
    const target = options.storeId;
    mapped = mapped.filter((p) => {
      if (!p.storeId) return true; // Include products without strict store tag to prevent hiding
      return p.storeId === target;
    });
  }

  // Filter by search query
  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    mapped = mapped.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  return mapped;
}

/**
 * Helper to keep store commerce_config updated in background.
 */
async function syncStoreJsonConfig(storeId: string, product: any) {
  if (!supabaseAdmin) return;
  try {
    const query = UUID_REGEX.test(storeId)
      ? supabaseAdmin.from("stores").select("id, commerce_config, layout_config").eq("id", storeId).single()
      : supabaseAdmin.from("stores").select("id, commerce_config, layout_config").eq("slug", storeId).single();

    const { data: store } = await query;
    if (!store) return;

    const existingCommerce = Array.isArray(store.commerce_config?.products) ? store.commerce_config.products : [];
    const pIndex = existingCommerce.findIndex((p: any) => p.id === product.id || p.sku === product.sku);

    let nextCommerce: any[];
    if (pIndex !== -1) {
      nextCommerce = [...existingCommerce];
      nextCommerce[pIndex] = { ...nextCommerce[pIndex], ...product };
    } else {
      nextCommerce = [product, ...existingCommerce];
    }

    await supabaseAdmin
      .from("stores")
      .update({
        commerce_config: { ...store.commerce_config, products: nextCommerce },
        updated_at: new Date().toISOString(),
      })
      .eq("id", store.id);
  } catch {}
}

/**
 * Helper to remove product from store commerce_config in background.
 */
async function removeProductFromStoreJsonConfig(storeId: string, productIdOrSku: string) {
  if (!supabaseAdmin) return;
  try {
    const query = UUID_REGEX.test(storeId)
      ? supabaseAdmin.from("stores").select("id, commerce_config, layout_config").eq("id", storeId).single()
      : supabaseAdmin.from("stores").select("id, commerce_config, layout_config").eq("slug", storeId).single();

    const { data: store } = await query;
    if (!store) return;

    const existingCommerce = Array.isArray(store.commerce_config?.products) ? store.commerce_config.products : [];
    const nextCommerce = existingCommerce.filter(
      (p: any) => p.id !== productIdOrSku && p.sku !== productIdOrSku
    );

    await supabaseAdmin
      .from("stores")
      .update({
        commerce_config: { ...store.commerce_config, products: nextCommerce },
        updated_at: new Date().toISOString(),
      })
      .eq("id", store.id);
  } catch {}
}
