import "@testing-library/jest-dom";
import { renderHook, act } from "@testing-library/react";

import { saveProductFromForm } from "@/lib/product-storage";
import { useProducts } from "../useProducts";

describe("useProducts Hook", () => {
  it("initializes with default mock products dataset (5240 items paginated at 20 per page)", () => {
    const { result } = renderHook(() => useProducts());
    expect(result.current.totalProductsCount).toBeGreaterThanOrEqual(5240);
    expect(result.current.products.length).toBe(20);
    expect(result.current.currentPage).toBe(1);
  });

  it("includes newly saved products at the top of the products list", () => {
    act(() => {
      saveProductFromForm(
        {
          title: "Unique Custom Artwork Lamp",
          category: "Home & Garden",
          price: 149.99,
          description: "Handcrafted lamp",
          tags: ["art", "lamp"],
          brand: "Artisan",
          compareAtPrice: 199.99,
          costPerItem: 50,
          chargeTax: true,
          taxRate: 10,
          hasVariants: false,
          options: [],
          variants: [],
          images: [],
          metaTitle: "Lamp",
          metaDescription: "Lamp",
          slug: "unique-custom-artwork-lamp",
          status: "published",
        },
        "published",
      );
    });

    const { result } = renderHook(() => useProducts());
    expect(result.current.products[0].name).toBe("Unique Custom Artwork Lamp");
  });

  it("filters products by search term", () => {
    const { result } = renderHook(() => useProducts());
    act(() => {
      result.current.updateFilter("search", "prod_0001");
    });
    expect(result.current.filteredCount).toBeLessThan(5240);
  });

  it("filters products by category", () => {
    const { result } = renderHook(() => useProducts());
    const targetCategory = result.current.categories[0];
    act(() => {
      result.current.updateFilter("category", targetCategory);
    });
    expect(
      result.current.products.every((p) => p.category === targetCategory),
    ).toBe(true);
  });

  it("filters products by status", () => {
    const { result } = renderHook(() => useProducts());
    act(() => {
      result.current.updateFilter("status", "published");
    });
    expect(
      result.current.products.every((p) => p.status === "published"),
    ).toBe(true);
  });

  it("handles bulk selection and bulk status change", () => {
    const { result } = renderHook(() => useProducts());

    // Select all on current page
    act(() => {
      result.current.toggleSelectAll();
    });
    expect(result.current.selectedIds.size).toBe(20);

    // Change status of selected items to draft
    act(() => {
      result.current.bulkChangeStatus("draft");
    });
    expect(result.current.selectedIds.size).toBe(0);
  });

  it("handles bulk delete", () => {
    const { result } = renderHook(() => useProducts());
    const initialCount = result.current.totalProductsCount;

    act(() => {
      result.current.toggleSelectAll();
    });
    expect(result.current.selectedIds.size).toBe(20);

    act(() => {
      result.current.bulkDelete();
    });
    expect(result.current.totalProductsCount).toBe(initialCount - 20);
  });
});
