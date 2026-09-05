import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";

import { CategoryTiles } from "@/components/storefront/CategoryTiles";
import { FeaturedProductsGrid } from "@/components/storefront/FeaturedProductsGrid";
import { HeroBanner } from "@/components/storefront/HeroBanner";
import { NewsletterSection } from "@/components/storefront/NewsletterSection";
import { TrustPanelRow } from "@/components/storefront/TrustPanelRow";
import { formatCloudinaryUrl, generateImageSrcSet } from "@/lib/storefront/imageOptimizer";
import { getVendorStoreConfig } from "@/lib/storefront/themeResolver";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Storefront Homepage Sections & Utilities", () => {
  describe("imageOptimizer", () => {
    it("formats Cloudinary URL with crop, width, height, format, and quality parameters", () => {
      const original = "https://res.cloudinary.com/demo/image/upload/v12345/sample.jpg";
      const formatted = formatCloudinaryUrl(original, { width: 400, height: 400, crop: "fill" });
      expect(formatted).toContain("w_400");
      expect(formatted).toContain("h_400");
      expect(formatted).toContain("c_fill");
      expect(formatted).toContain("f_auto");
      expect(formatted).toContain("q_auto");
    });

    it("generates valid srcSet for Cloudinary URLs", () => {
      const original = "https://res.cloudinary.com/demo/image/upload/v12345/sample.jpg";
      const srcset = generateImageSrcSet(original, [320, 640]);
      expect(srcset).toContain("w_320");
      expect(srcset).toContain("320w");
      expect(srcset).toContain("w_640");
      expect(srcset).toContain("640w");
    });

    it("returns original URL for non-Cloudinary images", () => {
      const localUrl = "/images/products/ceramic_vase.jpg";
      expect(formatCloudinaryUrl(localUrl)).toBe(localUrl);
    });
  });

  describe("HeroBanner", () => {
    it("renders vendor hero headline, subheadline, badge, and CTA buttons", async () => {
      const config = await getVendorStoreConfig();
      render(<HeroBanner config={config} />);

      expect(screen.getByText(config.hero.headline)).toBeDefined();
      expect(screen.getByText(config.hero.subheadline)).toBeDefined();
      expect(screen.getByText(config.hero.badge)).toBeDefined();
      expect(screen.getByText(config.hero.ctaText)).toBeDefined();
      if (config.hero.secondaryCtaText) {
        expect(screen.getByText(config.hero.secondaryCtaText)).toBeDefined();
      }
    });
  });

  describe("FeaturedProductsGrid", () => {
    it("renders product catalog grid and handles tab selection & add to cart", async () => {
      const config = await getVendorStoreConfig();
      render(<FeaturedProductsGrid config={config} />);

      expect(screen.getByText("Featured Artisanal Catalog")).toBeDefined();
      config.featuredProducts.forEach((prod) => {
        expect(screen.getByText(prod.name)).toBeDefined();
        expect(screen.getByText(prod.price)).toBeDefined();
      });

      // Click Add to Cart
      const cartBtns = screen.getAllByText("Add to Cart");
      expect(cartBtns.length).toBeGreaterThan(0);
      fireEvent.click(cartBtns[0]);
      expect(screen.getByText("Added!")).toBeDefined();
    });
  });

  describe("CategoryTiles", () => {
    it("renders all vendor categories with counts and icons", async () => {
      const config = await getVendorStoreConfig();
      render(<CategoryTiles config={config} />);

      config.categoryTiles.forEach((cat) => {
        expect(screen.getByText(cat.title)).toBeDefined();
        expect(screen.getByText(cat.count)).toBeDefined();
      });
    });
  });

  describe("NewsletterSection", () => {
    it("renders subscription form and handles form submission", async () => {
      const config = await getVendorStoreConfig();
      render(<NewsletterSection config={config} />);

      expect(screen.getByText(config.newsletter.headline)).toBeDefined();
      expect(screen.getByText(config.newsletter.discountText)).toBeDefined();

      const emailInput = screen.getByLabelText("Email address for exclusive drops and discounts");
      const submitBtn = screen.getByText("Subscribe Now");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitBtn);

      expect(screen.getByText("Thank you for subscribing! Your discount code has been emailed.")).toBeDefined();
    });
  });

  describe("TrustPanelRow", () => {
    it("renders all vendor trust feature guarantees", async () => {
      const config = await getVendorStoreConfig();
      render(<TrustPanelRow config={config} />);

      config.trustFeatures.forEach((feat) => {
        expect(screen.getByText(feat.title)).toBeDefined();
        expect(screen.getByText(feat.description)).toBeDefined();
      });
    });
  });
});
