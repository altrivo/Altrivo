/**
 * DigiShop AI — Store Context Resolution
 * 
 * Resolves the current store context from the request.
 * This is the "Tenant Security Formula" from the blueprint:
 *   WHO → ROLE → WHICH STORE → OWNERSHIP → ACTION → DATA → RLS
 */
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StoreContext {
  storeId: string;
  store: {
    id: string;
    vendor_id: string;
    name: string;
    slug: string;
    is_published: boolean;
    custom_domain: string | null;
    subdomain: string | null;
    commerce_config: Record<string, any>;
  };
}

// 60-second in-memory cache for store lookups
const storeCache = new Map<string, { store: StoreContext["store"]; expiresAt: number }>();
const CACHE_TTL_MS = 60_000;

// ─── Primary Resolution ─────────────────────────────────────────────────────

/**
 * Resolve store context from the incoming request.
 * Priority order:
 * 1. x-store-id header (set by middleware)
 * 2. Store ID from route params
 * 3. Domain/subdomain resolution
 * 4. Default fallback for development
 */
export async function resolveStoreFromRequest(
  req: NextRequest,
  routeStoreId?: string
): Promise<StoreContext | null> {
  // 1. Try x-store-id header (set by middleware after domain resolution)
  const headerStoreId = req.headers.get("x-store-id");
  if (headerStoreId) {
    return getStoreById(headerStoreId);
  }

  // 2. Try route param
  if (routeStoreId) {
    return getStoreById(routeStoreId);
  }

  // 3. Try domain/subdomain resolution from hostname
  const hostname = req.headers.get("host") || "";
  const storeFromDomain = await resolveStoreFromDomain(hostname);
  if (storeFromDomain) {
    return storeFromDomain;
  }

  // 4. Development fallback
  if (isDevEnvironment(hostname)) {
    return getFirstAvailableStore();
  }

  return null;
}

/**
 * Resolve store from hostname by querying the stores table.
 * Checks custom_domain first, then subdomain.
 */
export async function resolveStoreFromDomain(hostname: string): Promise<StoreContext | null> {
  const cleanHost = hostname.toLowerCase().trim();

  // Skip system domains
  if (isDevEnvironment(cleanHost)) {
    return null;
  }

  // Check cache first
  const cached = storeCache.get(`domain:${cleanHost}`);
  if (cached && cached.expiresAt > Date.now()) {
    return { storeId: cached.store.id, store: cached.store };
  }

  const db = supabaseAdmin;
  if (!db) return null;

  try {
    // Try custom_domain match
    let { data: store } = await db
      .from("stores")
      .select("id, vendor_id, name, slug, is_published, custom_domain, subdomain, commerce_config")
      .eq("custom_domain", cleanHost)
      .eq("is_published", true)
      .maybeSingle();

    // Try subdomain match (e.g., "mystore" from "mystore.digishop.com")
    if (!store) {
      const subdomainPart = cleanHost.split(".")[0];
      if (subdomainPart && subdomainPart !== "www") {
        const { data } = await db
          .from("stores")
          .select("id, vendor_id, name, slug, is_published, custom_domain, subdomain, commerce_config")
          .eq("subdomain", subdomainPart)
          .eq("is_published", true)
          .maybeSingle();
        store = data;
      }
    }

    // Try slug match
    if (!store) {
      const slugPart = cleanHost.split(".")[0];
      if (slugPart) {
        const { data } = await db
          .from("stores")
          .select("id, vendor_id, name, slug, is_published, custom_domain, subdomain, commerce_config")
          .eq("slug", slugPart)
          .eq("is_published", true)
          .maybeSingle();
        store = data;
      }
    }

    if (!store) return null;

    // Cache the result
    storeCache.set(`domain:${cleanHost}`, {
      store,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return { storeId: store.id, store };
  } catch {
    return null;
  }
}

// ─── Store Lookup Helpers ────────────────────────────────────────────────────

/**
 * Get a store by its UUID.
 */
export async function getStoreById(storeId: string): Promise<StoreContext | null> {
  // Check cache
  const cached = storeCache.get(`id:${storeId}`);
  if (cached && cached.expiresAt > Date.now()) {
    return { storeId: cached.store.id, store: cached.store };
  }

  const db = supabaseAdmin;
  if (!db) return null;

  try {
    const { data: store, error } = await db
      .from("stores")
      .select("id, vendor_id, name, slug, is_published, custom_domain, subdomain, commerce_config")
      .eq("id", storeId)
      .maybeSingle();

    if (error || !store) return null;

    storeCache.set(`id:${storeId}`, {
      store,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return { storeId: store.id, store };
  } catch {
    return null;
  }
}

/**
 * Get the first available store (development fallback only).
 */
async function getFirstAvailableStore(): Promise<StoreContext | null> {
  const db = supabaseAdmin;
  if (!db) return null;

  try {
    const { data: store } = await db
      .from("stores")
      .select("id, vendor_id, name, slug, is_published, custom_domain, subdomain, commerce_config")
      .limit(1)
      .maybeSingle();

    if (!store) return null;
    return { storeId: store.id, store };
  } catch {
    return null;
  }
}

/**
 * Validate that a vendor owns a specific store.
 */
export async function validateStoreOwnership(
  vendorId: string,
  storeId: string
): Promise<boolean> {
  const db = supabaseAdmin;
  if (!db) return false;

  try {
    const { data } = await db
      .from("stores")
      .select("id")
      .eq("id", storeId)
      .eq("vendor_id", vendorId)
      .maybeSingle();

    return !!data;
  } catch {
    return false;
  }
}

/**
 * Validate that a customer belongs to a specific store.
 */
export async function validateCustomerStoreAccess(
  authUserId: string,
  storeId: string
): Promise<boolean> {
  const db = supabaseAdmin;
  if (!db) return false;

  try {
    const { data } = await db
      .from("store_customers")
      .select("id")
      .eq("auth_user_id", authUserId)
      .eq("store_id", storeId)
      .maybeSingle();

    return !!data;
  } catch {
    return false;
  }
}

/**
 * Clear the store context cache (for testing or after store updates).
 */
export function clearStoreCache(): void {
  storeCache.clear();
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function isDevEnvironment(hostname: string): boolean {
  return (
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    hostname.includes("0.0.0.0") ||
    hostname === ""
  );
}
