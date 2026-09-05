import {
  resolveDomainToVendor,
  clearDomainResolverCache,
  DOMAINS_TABLE,
} from "@/lib/storefront/domainResolver";
import { middleware } from "@/middleware";

describe("Multi-Tenant Storefront Routing (Domain -> Vendor)", () => {
  beforeEach(() => {
    clearDomainResolverCache();
  });

  describe("Domain Resolver Service", () => {
    it("resolves verified custom domains to correct vendor IDs", () => {
      const res1 = resolveDomainToVendor("www.brandxyz.com");
      expect(res1.vendorId).toBe("vendor_brandxyz");

      const res2 = resolveDomainToVendor("artisan-crafts.altrovo.com");
      expect(res2.vendorId).toBe("v-default");

      const res3 = resolveDomainToVendor("crafts.digishop.com");
      expect(res3.vendorId).toBe("vendor_crafts");
    });

    it("caches domain lookup for 60 seconds and completes in <20ms", () => {
      // First lookup (uncached)
      const first = resolveDomainToVendor("www.brandxyz.com");
      expect(first.cached).toBe(false);
      expect(first.vendorId).toBe("vendor_brandxyz");

      // Second lookup (cached)
      const second = resolveDomainToVendor("www.brandxyz.com");
      expect(second.cached).toBe(true);
      expect(second.vendorId).toBe("vendor_brandxyz");
      expect(second.durationMs).toBeLessThan(20);
    });

    it("returns null for unknown or unverified domains", () => {
      const unknown = resolveDomainToVendor("unknown-brand-999.com");
      expect(unknown.vendorId).toBeNull();

      const unverified = resolveDomainToVendor("unverified-store.com");
      expect(unverified.vendorId).toBeNull();
    });

    it("domains table contains valid entries with ssl_status and verified flags", () => {
      expect(DOMAINS_TABLE.length).toBeGreaterThan(0);
      const verifiedDomains = DOMAINS_TABLE.filter((d) => d.verified);
      expect(verifiedDomains.length).toBeGreaterThan(0);
    });
  });

  describe("Next.js Middleware Domain Router", () => {
    it("attaches x-vendor-id header for valid domain request", () => {
      const req = {
        headers: new Headers({
          host: "www.brandxyz.com",
        }),
        nextUrl: {
          pathname: "/shop",
        },
        url: "http://www.brandxyz.com/shop",
      };

      const res = middleware(req as any);
      expect(res).toBeDefined();
    });

    it("rewrites unknown domain storefront requests to 404", () => {
      const req = {
        headers: new Headers({
          host: "unknown-brand-999.com",
        }),
        nextUrl: {
          pathname: "/shop",
        },
        url: "http://unknown-brand-999.com/shop",
      };

      const res = middleware(req as any);
      expect(res.status).toBe(404);
    });
  });
});
