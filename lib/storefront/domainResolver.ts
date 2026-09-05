export interface DomainRecord {
  domain: string;
  vendorId: string;
  verified: boolean;
  sslStatus: "active" | "pending" | "failed";
  createdAt: string;
}

// 60-second in-memory cache for domain lookup (<20ms SLA)
const DOMAIN_CACHE: Map<string, { vendorId: string | null; expiresAt: number }> = new Map();
const CACHE_TTL_MS = 60 * 1000;

export const DOMAINS_TABLE: DomainRecord[] = [
  {
    domain: "localhost:3000",
    vendorId: "v-default",
    verified: true,
    sslStatus: "active",
    createdAt: "2026-08-01T00:00:00Z",
  },
  {
    domain: "artisan-crafts.altrovo.com",
    vendorId: "v-default",
    verified: true,
    sslStatus: "active",
    createdAt: "2026-08-01T00:00:00Z",
  },
  {
    domain: "www.brandxyz.com",
    vendorId: "vendor_brandxyz",
    verified: true,
    sslStatus: "active",
    createdAt: "2026-08-02T00:00:00Z",
  },
  {
    domain: "brandxyz.digishop.com",
    vendorId: "vendor_brandxyz",
    verified: true,
    sslStatus: "active",
    createdAt: "2026-08-02T00:00:00Z",
  },
  {
    domain: "crafts.digishop.com",
    vendorId: "vendor_crafts",
    verified: true,
    sslStatus: "active",
    createdAt: "2026-08-03T00:00:00Z",
  },
  {
    domain: "unverified-store.com",
    vendorId: "vendor_unverified",
    verified: false,
    sslStatus: "pending",
    createdAt: "2026-08-04T00:00:00Z",
  },
];

export function resolveDomainToVendor(hostname: string): {
  vendorId: string | null;
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
      durationMs: Number((performance.now() - start).toFixed(2)),
      cached: true,
    };
  }

  // Fallback to primary domains table lookup (enforcing verified === true)
  const match = DOMAINS_TABLE.find(
    (d) => d.domain.toLowerCase() === cleanHost && d.verified
  );

  const vendorId = match ? match.vendorId : cleanHost.includes("localhost") || cleanHost === "" ? "v-default" : null;

  // Cache lookup result for 60 seconds
  DOMAIN_CACHE.set(cleanHost, {
    vendorId,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return {
    vendorId,
    durationMs: Number((performance.now() - start).toFixed(2)),
    cached: false,
  };
}

export function clearDomainResolverCache(): void {
  DOMAIN_CACHE.clear();
}
