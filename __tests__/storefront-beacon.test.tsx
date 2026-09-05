import React from "react";
import { render, act } from "@testing-library/react";
import { StorefrontBeacon } from "@/components/analytics/StorefrontBeacon";
import { POST, GET } from "@/app/api/track/route";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/shop",
}));

describe("Storefront Beacon & /api/track Ingestion API", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    sessionStorage.clear();
    delete (window as any).navigator.doNotTrack;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("StorefrontBeacon Component & DNT Compliance", () => {
    it("bypasses tracking completely when Do Not Track (DNT) is enabled ('1')", () => {
      Object.defineProperty(window.navigator, "doNotTrack", {
        value: "1",
        configurable: true,
      });

      const sendBeaconMock = jest.fn();
      Object.defineProperty(window.navigator, "sendBeacon", {
        value: sendBeaconMock,
        configurable: true,
      });

      render(<StorefrontBeacon vendorId="v-test" />);

      act(() => {
        jest.runAllTimers();
      });

      expect(sendBeaconMock).not.toHaveBeenCalled();
    });

    it("generates session ID and triggers sendBeacon when DNT is disabled", () => {
      Object.defineProperty(window.navigator, "doNotTrack", {
        value: "0",
        configurable: true,
      });

      const sendBeaconMock = jest.fn();
      Object.defineProperty(window.navigator, "sendBeacon", {
        value: sendBeaconMock,
        configurable: true,
      });

      render(<StorefrontBeacon vendorId="v-test" />);

      act(() => {
        jest.runAllTimers();
      });

      expect(sendBeaconMock).toHaveBeenCalledTimes(1);
      expect(sendBeaconMock.mock.calls[0][0]).toBe("/api/track");

      const savedSession = sessionStorage.getItem("artrivo_session_id");
      expect(savedSession).toContain("sess_");
    });
  });

  describe("/api/track Ingestion Endpoint", () => {
    it("GET /api/track returns service health status", async () => {
      const res = await GET();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.status).toBe("healthy");
    });

    it("POST /api/track ingests page view event and resolves GeoIP city/country", async () => {
      const mockHeaders = new Headers({
        "content-type": "application/json",
        "x-vercel-ip-city": "Lahore",
        "x-vercel-ip-country": "Pakistan",
      });

      const payload = {
        vendorId: "v-test",
        sessionId: "sess_12345",
        page: "/category/decor",
        referrer: "https://instagram.com",
        device: "mobile",
        timestamp: "2026-08-10T12:00:00Z",
      };

      const req = {
        headers: mockHeaders,
        text: async () => JSON.stringify(payload),
      };

      const res = await POST(req as any);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.tracked).toBe(true);
      expect(json.event.city).toBe("Lahore");
      expect(json.event.country).toBe("Pakistan");
      expect(json.event.device).toBe("mobile");
    });
  });
});
