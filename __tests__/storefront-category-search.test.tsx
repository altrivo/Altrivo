import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";

import { CatalogView } from "@/components/storefront/CatalogView";
import { getCategoryBySlug, filterAndSortCatalog } from "@/lib/storefront/catalogService";
import { generateMetadata as generateCategoryMetadata } from "@/app/(storefront)/category/[slug]/page";
import { generateMetadata as generateSearchMetadata } from "@/app/(storefront)/search/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  notFound: jest.fn(),
}));

describe("Storefront Category Landing & Search Results", () => {
  describe("catalogService", () => {
    it("returns category metadata by slug", () => {
      const decor = getCategoryBySlug("decor");
      expect(decor).not.toBeNull();
      expect(decor?.name).toBe("Ceramics & Decor");

      const art = getCategoryBySlug("art");
      expect(art?.name).toBe("Canvas Art");

      const invalid = getCategoryBySlug("non-existent");
      expect(invalid).toBeNull();
    });

    it("filters catalog products by category slug", () => {
      const decorProducts = filterAndSortCatalog({ categorySlug: "decor" });
      expect(decorProducts.length).toBeGreaterThan(0);
      decorProducts.forEach((p) => expect(p.category).toBe("decor"));
    });

    it("filters catalog products by search query", () => {
      const vaseProducts = filterAndSortCatalog({ searchQuery: "vase" });
      expect(vaseProducts.length).toBeGreaterThan(0);
      vaseProducts.forEach((p) => {
        expect(p.name.toLowerCase()).toContain("vase");
      });
    });

    it("filters catalog products by price range and sorting", () => {
      const cheapProducts = filterAndSortCatalog({ maxPrice: 10000, sortBy: "price-asc" });
      expect(cheapProducts.length).toBeGreaterThan(0);
      for (let i = 0; i < cheapProducts.length - 1; i++) {
        expect(cheapProducts[i].numericPrice).toBeLessThanOrEqual(cheapProducts[i + 1].numericPrice);
      }
    });
  });

  describe("CatalogView Component", () => {
    it("renders filter sidebar, price range slider, sort dropdown, and products grid", () => {
      render(<CatalogView initialCategorySlug="decor" title="Ceramics & Decor" subtitle="Subtext" />);

      expect(screen.getByText("Ceramics & Decor")).toBeDefined();
      expect(screen.getByText("Filter Catalog")).toBeDefined();
      expect(screen.getByLabelText("Max Price")).toBeDefined();

      // Check price range slider
      const slider = screen.getByLabelText("Max Price");
      fireEvent.change(slider, { target: { value: "10000" } });
      expect(screen.getByText("Under ₨ 10,000")).toBeDefined();
    });

    it("renders clear empty state when no products match filters", () => {
      render(<CatalogView initialCategorySlug="decor" />);

      const slider = screen.getByLabelText("Max Price");
      fireEvent.change(slider, { target: { value: "3000" } });

      expect(screen.getByText("No Products Found")).toBeDefined();
      expect(screen.getByText("Reset All Filters")).toBeDefined();
    });
  });

  describe("SEO Metadata Generation", () => {
    it("generates unique per-category metadata for valid category slug", async () => {
      const metadata = await generateCategoryMetadata({ params: Promise.resolve({ slug: "decor" }) });
      expect(metadata.title).toContain("Handcrafted Ceramics & Home Decor");
      expect(metadata.description).toContain("ceramic vases");
    });

    it("generates unique search metadata for search query", async () => {
      const metadata = await generateSearchMetadata({ searchParams: Promise.resolve({ q: "vase" }) });
      expect(metadata.title).toContain('"vase"');
    });
  });
});
