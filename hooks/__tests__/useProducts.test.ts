import "@testing-library/jest-dom";
import { renderHook, act } from "@testing-library/react";

import { saveProductFromForm } from "@/lib/product-storage";
import { useProducts } from "../useProducts";

describe("useProducts Hook", () => {
  it("initializes with default mock products dataset (50 items paginated at 20 per page)", () => {
    const { result } = renderHook(() => useProducts());
    expect(result.current.totalProductsCount).toBeGreaterThanOrEqual(50);
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
    expect(result.current.filteredCount).toBeLessThan(50);
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

  it("preserves product and toggles status correctly when clicking draft", () => {
    const auraStoreId = "c7e48188-7f77-480e-aef3-c6e7e1f32d39";
    act(() => {
      saveProductFromForm(
        {
          id: "prod_aura_test_1",
          title: "Aura Botanical Essential Oil",
          category: "Health & Beauty",
          price: 49.99,
          description: "Organic essential oil",
          tags: ["oil", "wellness"],
          brand: "Aura Wellness",
          status: "draft",
          storeId: auraStoreId,
        },
        "draft",
        auraStoreId,
      );
    });

    const { result } = renderHook(() => useProducts(auraStoreId));
    expect(result.current.products.length).toBe(1);
    expect(result.current.products[0].status).toBe("draft");

    // Click Draft badge to toggle to published
    act(() => {
      result.current.toggleProductStatus("prod_aura_test_1");
    });

    expect(result.current.products.length).toBe(1);
    expect(result.current.products[0].status).toBe("published");

    // Click Published badge to toggle back to draft
    act(() => {
      result.current.toggleProductStatus("prod_aura_test_1");
    });

    expect(result.current.products.length).toBe(1);
    expect(result.current.products[0].status).toBe("draft");
  });

  it("recognizes store products by both UUID and store slug", () => {
    const auraUuid = "c7e48188-7f77-480e-aef3-c6e7e1f32d39";
    const auraSlug = "aura-botanical-wellness";

    act(() => {
      saveProductFromForm(
        {
          id: "prod_aura_slug_test",
          title: "Aura Herbal Tea",
          category: "Groceries",
          price: 19.99,
          storeId: auraSlug,
        },
        "published",
        auraSlug,
      );
    });

    // Querying with UUID finds the slug-saved product
    const { result: uuidResult } = renderHook(() => useProducts(auraUuid));
    expect(uuidResult.current.products.some((p) => p.id === "prod_aura_slug_test")).toBe(true);

    // Querying with slug finds the product
    const { result: slugResult } = renderHook(() => useProducts(auraSlug));
    expect(slugResult.current.products.some((p) => p.id === "prod_aura_slug_test")).toBe(true);
  });
});
