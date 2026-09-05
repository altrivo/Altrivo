import "@testing-library/jest-dom";
import { renderHook, act } from "@testing-library/react";

import { useProductForm, slugify } from "../useProductForm";

describe("useProductForm Hook", () => {
  it("slugify generates clean URL slugs from titles", () => {
    expect(slugify("  Leather Jacket & Coat!! ")).toBe("leather-jacket-coat");
    expect(slugify("Smart Watch Pro (2025 Edition)")).toBe(
      "smart-watch-pro-2025-edition",
    );
  });

  it("initializes with default empty values", () => {
    const { result } = renderHook(() => useProductForm());
    expect(result.current.formData.title).toBe("");
    expect(result.current.formData.status).toBe("draft");
    expect(result.current.activeTab).toBe("basic");
  });

  it("updates fields and auto-generates slug", () => {
    const { result } = renderHook(() => useProductForm());
    act(() => {
      result.current.updateField("title", "Artisan Coffee Mug");
    });
    expect(result.current.formData.title).toBe("Artisan Coffee Mug");
    expect(result.current.formData.slug).toBe("artisan-coffee-mug");
    expect(result.current.isDirty).toBe(true);
  });

  it("calculates profit and profit margin correctly", () => {
    const { result } = renderHook(() =>
      useProductForm({ price: 100, costPerItem: 40 }),
    );
    expect(result.current.profitMetrics.profit).toBe(60);
    expect(result.current.profitMetrics.margin).toBe(60);
  });

  it("generates variant matrix combinations dynamically", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.addOption();
    });

    const optId = result.current.formData.options[0].id;

    act(() => {
      result.current.updateOption(optId, "Size", ["Small", "Large"]);
    });

    expect(result.current.formData.variants.length).toBe(2);
    expect(result.current.formData.variants[0].optionValues["Size"]).toBe(
      "Small",
    );
    expect(result.current.formData.variants[1].optionValues["Size"]).toBe(
      "Large",
    );
  });

  it("validates required fields on publish", () => {
    const { result } = renderHook(() => useProductForm());

    let success = false;
    act(() => {
      success = result.current.saveProduct("published");
    });

    expect(success).toBe(false);
    expect(result.current.errors.title).toBe("Product title is required");
    expect(result.current.errors.category).toBe("Please select a category");
    expect(result.current.activeTab).toBe("basic");
  });

  it("successfully publishes valid product and persists it", () => {
    const { result } = renderHook(() =>
      useProductForm({
        title: "Handmade Ceramic Vase",
        category: "Home & Garden",
        price: 49.99,
        slug: "handmade-ceramic-vase",
      }),
    );

    let success = false;
    act(() => {
      success = result.current.saveProduct("published");
    });

    expect(success).toBe(true);
    expect(result.current.formData.status).toBe("published");
  });
});
