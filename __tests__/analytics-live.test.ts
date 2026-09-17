import { GET } from "@/app/api/analytics/route";
import { NextRequest } from "next/server";

describe("Live Analytics API Endpoint", () => {
  it("returns strictly real zero counts when a store has no page views", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/analytics?range=7d&storeId=store-nonexistent-0000&vendorId=vendor-empty-0000"
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);

    const data = json.data;
    // Traffic overview
    expect(data.trafficOverview.rawVisits).toBe(0);
    expect(data.trafficOverview.totalVisits).toBe("0");
    expect(data.trafficOverview.rawUnique).toBe(0);
    expect(data.trafficOverview.uniqueVisitors).toBe("0");
    expect(data.trafficOverview.avgSessionDuration).toBe("0m 00s");
    expect(data.trafficOverview.bounceRate).toBe("0%");

    // Funnel
    expect(data.conversionFunnel[0].rawCount).toBe(0);
    expect(data.conversionFunnel[0].percentageOfTotal).toBe(0);
    expect(data.conversionFunnel[3].rawCount).toBe(0);

    // Cities
    data.pakistanCities.forEach((c: any) => {
      expect(c.rawVisitors).toBe(0);
      expect(c.sharePercent).toBe(0);
      expect(c.revenue).toBe("$ 0.00");
    });

    // Traffic Sources
    data.trafficSources.forEach((s: any) => {
      expect(s.percentage).toBe(0);
      expect(s.count).toBe("0");
    });

    // Devices
    data.deviceSplit.forEach((d: any) => {
      expect(d.percentage).toBe(0);
      expect(d.count).toBe("0");
    });
  });

  it("accurately reflects tracked events in live analytics without multipliers", async () => {
    const { POST } = await import("@/app/api/track/route");
    const testStoreId = "store-test-" + Date.now();
    const testVendorId = "vendor-test-uuid-" + Date.now();

    const trackReq = new NextRequest("http://localhost:3000/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        vendorId: testVendorId,
        storeId: testStoreId,
        sessionId: "session-real-1",
        page: `/store/${testStoreId}`,
        city: "Karachi",
        country: "Pakistan",
        device: "mobile",
        referrer: "https://instagram.com/p/123",
      }),
    });
    await POST(trackReq);

    const analyticsReq = new NextRequest(
      `http://localhost:3000/api/analytics?range=7d&storeId=${testStoreId}&vendorId=${testVendorId}`
    );
    const analyticsRes = await GET(analyticsReq);
    const analyticsJson = await analyticsRes.json();
    const data = analyticsJson.data;

    expect(data.trafficOverview.rawVisits).toBe(1);
    expect(data.trafficOverview.totalVisits).toBe("1");
    expect(data.trafficOverview.rawUnique).toBe(1);
    expect(data.conversionFunnel[0].rawCount).toBe(1);

    const karachi = data.pakistanCities.find((c: any) => c.city.toLowerCase().includes("karachi"));
    expect(karachi.rawVisitors).toBe(1);
    expect(karachi.sharePercent).toBe(100);

    const meta = data.trafficSources.find((s: any) => s.source.includes("Meta"));
    expect(meta.percentage).toBe(100);

    const mobile = data.deviceSplit.find((d: any) => d.device.includes("Mobile"));
    expect(mobile.percentage).toBe(100);
  });
});
