/**
 * DigiShop AI — DB-Backed Domain Resolver
 *
 * Replaces the static DOMAINS_TABLE with real Supabase queries.
 * Resolves hostname → store_id for multi-tenant routing.
 */
import { supabaseAdmin } from "@/lib/supabase";

export interface DomainRecord {
  domain: string;
  vendorId: string;
  storeId: string;
  verified: boolean;
  sslStatus: "active" | "pending" | "failed";
  createdAt: string;
}

export const DOMAINS_TABLE: DomainRecord[] = [
  {
    domain: "www.brandxyz.com",
    vendorId: "vendor_brandxyz",
    storeId: "store_brandxyz",
    verified: true,
    sslStatus: "active",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    domain: "artisan-crafts.altrovo.com",
    vendorId: "v-default",
    storeId: "store_default",
    verified: true,
    sslStatus: "active",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    domain: "crafts.digishop.com",
    vendorId: "vendor_crafts",
    storeId: "store_crafts",
    verified: true,
    sslStatus: "active",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    domain: "unverified-store.com",
    vendorId: "vendor_unverified",
    storeId: "store_unverified",
    verified: false,
    sslStatus: "pending",
    createdAt: "2024-01-01T00:00:00Z",
  },
];

// 60-second in-memory cache for domain lookup (<20ms SLA)
const DOMAIN_CACHE: Map<string, { vendorId: string | null; storeId: string | null; expiresAt: number }> = new Map();
const CACHE_TTL_MS = 60 * 1000;

/**
 * Resolve a hostname to a vendor and store by querying the stores table.
 * Checks custom_domain and subdomain columns.
 */
export function resolveDomainToVendor(hostname: string): {
  vendorId: string | null;
  storeId: string | null;
  durationMs: number;
  cached: boolean;
} {
  const start = performance.now();
  const cleanHost = (hostname || "").toLowerCase().trim();

  // Check 60-second in-memory cache
  const cachedEntry = DOMAIN_CACHE.get(cleanHost);
  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return {
      vendorId: cachedEntry.vendorId,
      storeId: cachedEntry.storeId,
      durationMs: Number((performance.now() - start).toFixed(2)),
      cached: true,
    };
  }

  // Check static table first for verified domains
  const tableMatch = DOMAINS_TABLE.find((d) => d.domain === cleanHost);
  if (tableMatch) {
    const result = tableMatch.verified
      ? { vendorId: tableMatch.vendorId, storeId: tableMatch.storeId }
      : { vendorId: null, storeId: null };
    DOMAIN_CACHE.set(cleanHost, { ...result, expiresAt: Date.now() + CACHE_TTL_MS });
    return {
      ...result,
      durationMs: Number((performance.now() - start).toFixed(2)),
      cached: false,
    };
  }

  // For system domains, return a default dev vendor
  if (isSystemDomain(cleanHost)) {
    const result = { vendorId: "v-default", storeId: null };
    DOMAIN_CACHE.set(cleanHost, { ...result, expiresAt: Date.now() + CACHE_TTL_MS });
    return {
      ...result,
      durationMs: Number((performance.now() - start).toFixed(2)),
      cached: false,
    };
  }

  // For non-system domains, we need to do a DB lookup.
  // Since this function is called from middleware (sync context),
  // we do an async lookup and cache the result.
  // The first request might not have the result yet, so we queue it.
  resolveDomainAsync(cleanHost);

  return {
    vendorId: null,
    storeId: null,
    durationMs: Number((performance.now() - start).toFixed(2)),
    cached: false,
  };
}

/**
 * Async domain resolution — queries Supabase for the store.
 * Results are cached for subsequent requests.
 */
async function resolveDomainAsync(hostname: string): Promise<void> {
  const db = supabaseAdmin;
  if (!db) return;

  try {
    // Try custom_domain match first
    let store: { id: string; vendor_id: string } | null = null;

    const { data: customDomainMatch } = await db
      .from("stores")
      .select("id, vendor_id")
      .eq("custom_domain", hostname)
      .eq("is_published", true)
      .maybeSingle();

    store = customDomainMatch;

    // Try subdomain match (e.g., "mystore" from "mystore.digishop.com")
    if (!store) {
      const subdomainPart = hostname.split(".")[0];
      if (subdomainPart && subdomainPart !== "www") {
        const { data: subdomainMatch } = await db
          .from("stores")
          .select("id, vendor_id")
          .eq("subdomain", subdomainPart)
          .eq("is_published", true)
          .maybeSingle();

        store = subdomainMatch;
      }
    }

    // Try slug match
    if (!store) {
      const slugPart = hostname.split(".")[0];
      if (slugPart) {
        const { data: slugMatch } = await db
          .from("stores")
          .select("id, vendor_id")
          .eq("slug", slugPart)
          .eq("is_published", true)
          .maybeSingle();

        store = slugMatch;
      }
    }

    // Cache result
    DOMAIN_CACHE.set(hostname, {
      vendorId: store?.vendor_id || null,
      storeId: store?.id || null,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  } catch (err) {
    console.error("[DomainResolver] DB lookup error:", err);
  }
}

/**
 * Async version for use in server components and API routes.
 */
export async function resolveDomainToVendorAsync(hostname: string): Promise<{
  vendorId: string | null;
  storeId: string | null;
}> {
  const cleanHost = (hostname || "").toLowerCase().trim();

  // Check cache
  const cached = DOMAIN_CACHE.get(cleanHost);
  if (cached && cached.expiresAt > Date.now()) {
    return { vendorId: cached.vendorId, storeId: cached.storeId };
  }

  if (isSystemDomain(cleanHost)) {
    return { vendorId: "v-default", storeId: null };
  }

  const db = supabaseAdmin;
  if (!db) {
    return { vendorId: null, storeId: null };
  }

  try {
    // Try custom_domain
    let store: { id: string; vendor_id: string } | null = null;

    const { data: customMatch } = await db
      .from("stores")
      .select("id, vendor_id")
      .eq("custom_domain", cleanHost)
      .eq("is_published", true)
      .maybeSingle();

    store = customMatch;

    // Try subdomain
    if (!store) {
      const subPart = cleanHost.split(".")[0];
      if (subPart && subPart !== "www") {
        const { data: subMatch } = await db
          .from("stores")
          .select("id, vendor_id")
          .eq("subdomain", subPart)
          .eq("is_published", true)
          .maybeSingle();
        store = subMatch;
      }
    }

    if (store) {
      DOMAIN_CACHE.set(cleanHost, {
        vendorId: store.vendor_id,
        storeId: store.id,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return { vendorId: store.vendor_id, storeId: store.id };
    }
  } catch (err) {
    console.error("[DomainResolver] Async lookup error:", err);
  }

  return { vendorId: null, storeId: null };
}

function isSystemDomain(hostname: string): boolean {
  return (
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    hostname.includes("0.0.0.0") ||
    hostname.includes("run.app") ||
    hostname.includes("google") ||
    hostname === "altrivo-admin.vercel.app" ||
    hostname === "altrivo.com" ||
    hostname === ""
  );
}

export function clearDomainResolverCache(): void {
  DOMAIN_CACHE.clear();
}
