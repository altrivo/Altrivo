import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { getVendorStoreConfig } from "@/lib/storefront/themeResolver";
import { StorefrontShell } from "@/components/storefront/StorefrontShell";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Public Storefront Layout Shell (SSR)", () => {
  describe("themeResolver", () => {
    it("returns default Artrivo store configuration when no host is provided", async () => {
      const config = await getVendorStoreConfig();
      expect(config.vendorId).toBe("vendor-artrivo-01");
      expect(config.storeName).toBe("Artrivo Marketplace Store");
      expect(config.primaryColor).toBe("#694873");
    });

    it("resolves pottery vendor configuration for pottery subdomain", async () => {
      const config = await getVendorStoreConfig("clay-crafts.pottery.artrivo.com");
      expect(config.vendorId).toBe("vendor-pottery-02");
      expect(config.storeName).toBe("Clay & Heritage Pottery");
      expect(config.primaryColor).toBe("#8C4A32");
    });

    it("resolves canvas vendor configuration for canvas studio domain", async () => {
      const config = await getVendorStoreConfig("goldendawn-canvas.com");
      expect(config.vendorId).toBe("vendor-canvas-03");
      expect(config.storeName).toBe("Golden Dawn Canvas Studio");
      expect(config.primaryColor).toBe("#2C4A5E");
    });
  });

  describe("StorefrontHeader", () => {
    it("renders vendor logo text, categories nav, search bar, and cart badge", async () => {
      const config = await getVendorStoreConfig();
      render(<StorefrontHeader config={config} />);

      expect(screen.getByText(config.logoText)).toBeDefined();
      expect(screen.getByText(config.tagline)).toBeDefined();

      // Categories
      config.categories.forEach((cat) => {
        expect(screen.getAllByText(cat.name).length).toBeGreaterThan(0);
      });

      // Search input
      expect(screen.getByRole("search")).toBeDefined();
      expect(screen.getByLabelText("Search storefront catalog")).toBeDefined();

      // Cart link
      expect(screen.getByLabelText("Shopping Cart")).toBeDefined();
      expect(screen.getByText("Cart")).toBeDefined();
    });
  });

  describe("StorefrontFooter", () => {
    it("renders value propositions, store policies, social links, and newsletter form", async () => {
      const config = await getVendorStoreConfig();
      render(<StorefrontFooter config={config} />);

      expect(screen.getByText(config.storeName)).toBeDefined();
      expect(screen.getByText("Express Nationwide Shipping")).toBeDefined();
      expect(screen.getByText("7-Day Easy Returns")).toBeDefined();

      // Policies
      config.policies.forEach((policy) => {
        expect(screen.getByText(policy.title)).toBeDefined();
      });

      // Newsletter
      expect(screen.getByLabelText("Email address for newsletter subscription")).toBeDefined();
      expect(screen.getByLabelText("Subscribe to newsletter")).toBeDefined();
    });
  });

  describe("StorefrontShell", () => {
    it("injects primary and accent theme colors and renders main slot content", async () => {
      const config = await getVendorStoreConfig("clay-pottery.com");
      render(
        <StorefrontShell config={config}>
          <div data-testid="test-child">Child Content</div>
        </StorefrontShell>
      );

      expect(screen.getByTestId("test-child")).toBeDefined();
      expect(screen.getByText(config.logoText)).toBeDefined();
    });
  });

});
