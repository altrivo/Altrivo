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

  if (!vendorId || !UUID_REGEX.test(vendorId)) {
    return { success: false, syncedCount: 0, error: `Invalid vendor UUID: ${vendorId}` };
  }

  if (!Array.isArray(products) || products.length === 0) {
    return { success: true, syncedCount: 0 };
  }

  let syncedCount = 0;

  for (const raw of products) {
    if (!raw) continue;

    const prodId = toValidUUID(raw.id || raw.sku || raw.name || raw.title);
    const title = String(raw.title || raw.name || "Product").trim();
    const description = String(raw.description || "").trim();
    const category = String(raw.category || "General").trim();
    const price = parsePrice(raw.price);
    const comparePrice = parsePrice(raw.comparePrice || raw.compare_price || 0);
    const cost = parsePrice(raw.cost || raw.costPerItem || 0);
    const imageUrl = raw.image || raw.thumbnail || raw.image_url || null;
    const status = raw.status === "draft" ? "draft" : raw.status === "archived" ? "archived" : "published";
    const nowISO = new Date().toISOString();

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
      status: status,
      updated_at: nowISO,
    };

    const { error: prodErr } = await supabaseAdmin
      .from("products")
      .upsert(productPayload, { onConflict: "id" });

    if (prodErr) {
      console.warn(`[product-db-sync] Failed to upsert product ${prodId}:`, prodErr.message);
      continue;
    }

    // Now upsert variant for stock & SKU tracking
    const variantId = toValidUUID((raw.id || raw.sku || prodId) + "-primary-variant");
    const sku = String(raw.sku || ("SKU-" + prodId.slice(0, 8)).toUpperCase());
    const stock = typeof raw.stock === "number" ? raw.stock : 10;

    const variantPayload = {
      id: variantId,
      product_id: prodId,
      sku: sku,
      price: price,
      stock: stock,
      image_url: imageUrl,
      enabled: status !== "archived",
      updated_at: nowISO,
    };

    const { error: varErr } = await supabaseAdmin
      .from("product_variants")
      .upsert(variantPayload, { onConflict: "id" });

    if (varErr) {
      console.warn(`[product-db-sync] Failed to upsert variant ${variantId}:`, varErr.message);
    }

    syncedCount++;
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
export async function fetchProductsFromDatabase(vendorId?: string): Promise<Product[]> {
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
      status,
      created_at,
      updated_at,
      product_variants (
        id,
        sku,
        price,
        stock,
        enabled
      )
    `)
    .order("created_at", { ascending: false });

  if (vendorId && UUID_REGEX.test(vendorId)) {
    query = query.eq("vendor_id", vendorId);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.warn("[product-db-sync] fetchProducts error:", error?.message);
    return [];
  }

  return data.map((row: any) => {
    const variants = Array.isArray(row.product_variants) ? row.product_variants : [];
    const primaryVar = variants[0];
    const totalStock = variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
    const sku = primaryVar?.sku || ("SKU-" + row.id.slice(0, 8)).toUpperCase();
    const price = typeof row.price === "number" ? row.price : primaryVar?.price || 0;
    const thumbnail = row.image_url || null;

    return {
      id: row.id,
      storeId: "",
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
      images: thumbnail ? [thumbnail] : [],
      variantsCount: variants.length,
      description: row.description || "",
    } as Product;
  });
}
