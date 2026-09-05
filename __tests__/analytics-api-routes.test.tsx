import { GET as getSummary } from "@/app/api/analytics/summary/route";
import { GET as getTraffic } from "@/app/api/analytics/traffic/route";
import { GET as getGeo } from "@/app/api/analytics/geo/route";
import { GET as getFunnel } from "@/app/api/analytics/funnel/route";
import { GET as getDevices } from "@/app/api/analytics/devices/route";

describe("Analytics Dedicated 5 API Routes with JWT & Vendor Isolation", () => {
  const validHeaders = new Headers({
    authorization: "Bearer vendor-jwt-token-123",
  });

  const invalidHeaders = new Headers({
    authorization: "Bearer invalid-vendor-token-xyz",
  });

  const missingHeaders = new Headers();

  describe("1. /api/analytics/summary", () => {
    it("returns 200 OK with KPI cards JSON when authorized", async () => {
      const req = {
        url: "http://localhost:3000/api/analytics/summary?range=7d",
        headers: validHeaders,
      };

      const res = await getSummary(req as any);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.totalVisits).toBeDefined();
      expect(json.data.uniqueVisitors).toBeDefined();
      expect(json.data.bounceRate).toBe("32.4%");
      expect(json.responseTimeMs).toBeLessThan(500);
    });

    it("returns 401 Unauthorized when header is missing or invalid", async () => {
      const reqMissing = { url: "http://localhost:3000/api/analytics/summary", headers: missingHeaders };
      const resMissing = await getSummary(reqMissing as any);
      expect(resMissing.status).toBe(401);

      const reqInvalid = { url: "http://localhost:3000/api/analytics/summary", headers: invalidHeaders };
      const resInvalid = await getSummary(reqInvalid as any);
      expect(resInvalid.status).toBe(401);
    });
  });

  describe("2. /api/analytics/traffic", () => {
    it("returns 200 OK with daily traffic and source attribution when authorized", async () => {
      const req = {
        url: "http://localhost:3000/api/analytics/traffic?range=7d",
        headers: validHeaders,
      };

      const res = await getTraffic(req as any);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.dailySummary.length).toBeGreaterThan(0);
      expect(json.data.trafficSources.length).toBeGreaterThan(0);
      expect(json.responseTimeMs).toBeLessThan(500);
    });

    it("returns 401 Unauthorized when header is missing", async () => {
      const req = { url: "http://localhost:3000/api/analytics/traffic", headers: missingHeaders };
      const res = await getTraffic(req as any);
      expect(res.status).toBe(401);
    });
  });

  describe("3. /api/analytics/geo", () => {
    it("returns 200 OK with Pakistan city heatmap data when authorized", async () => {
      const req = {
        url: "http://localhost:3000/api/analytics/geo?range=7d",
        headers: validHeaders,
      };

      const res = await getGeo(req as any);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      const karachi = json.data.pakistanCities.find((c: any) => c.city === "Karachi");
      expect(karachi).toBeDefined();
      expect(karachi.revenue).toContain("₨");
      expect(json.responseTimeMs).toBeLessThan(500);
    });

    it("returns 401 Unauthorized when header is missing", async () => {
      const req = { url: "http://localhost:3000/api/analytics/geo", headers: missingHeaders };
      const res = await getGeo(req as any);
      expect(res.status).toBe(401);
    });
  });

  describe("4. /api/analytics/funnel", () => {
    it("returns 200 OK with conversion funnel stages and drop-offs when authorized", async () => {
      const req = {
        url: "http://localhost:3000/api/analytics/funnel?range=7d",
        headers: validHeaders,
      };

      const res = await getFunnel(req as any);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.conversionFunnel.length).toBe(4);
      expect(json.data.overallConversionRate).toBe("3.84%");
      expect(json.responseTimeMs).toBeLessThan(500);
    });

    it("returns 401 Unauthorized when header is missing", async () => {
      const req = { url: "http://localhost:3000/api/analytics/funnel", headers: missingHeaders };
      const res = await getFunnel(req as any);
      expect(res.status).toBe(401);
    });
  });

  describe("5. /api/analytics/devices", () => {
    it("returns 200 OK with device split and top products when authorized", async () => {
      const req = {
        url: "http://localhost:3000/api/analytics/devices?range=30d",
        headers: validHeaders,
      };

      const res = await getDevices(req as any);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.deviceSplit.length).toBe(3);
      expect(json.data.topProductsByTime.length).toBe(5);
      expect(json.responseTimeMs).toBeLessThan(500);
    });

    it("returns 401 Unauthorized when header is missing", async () => {
      const req = { url: "http://localhost:3000/api/analytics/devices", headers: missingHeaders };
      const res = await getDevices(req as any);
      expect(res.status).toBe(401);
    });
  });
});
