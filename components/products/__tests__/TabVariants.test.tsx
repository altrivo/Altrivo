import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";

import type { ProductFormData } from "@/types/product-form";

import { TabVariants } from "../tabs/TabVariants";

describe("TabVariants Component (Combinatorics & Bulk Actions)", () => {
  const mockFormData: ProductFormData = {
    title: "Test Product",
    description: "",
    category: "Electronics",
    tags: [],
    brand: "",
    price: 100,
    compareAtPrice: 0,
    costPerItem: 50,
    chargeTax: true,
    taxRate: 10,
    hasVariants: true,
    options: [
      { id: "opt_1", name: "Size", values: ["Small", "Large"] },
      { id: "opt_2", name: "Color", values: ["Red", "Blue"] },
    ],
    variants: [
      { id: "v1", optionValues: { Size: "Small", Color: "Red" }, price: 100, stock: 10, sku: "SKU-S-RED", enabled: true },
      { id: "v2", optionValues: { Size: "Small", Color: "Blue" }, price: 100, stock: 10, sku: "SKU-S-BLUE", enabled: true },
      { id: "v3", optionValues: { Size: "Large", Color: "Red" }, price: 100, stock: 10, sku: "SKU-L-RED", enabled: true },
      { id: "v4", optionValues: { Size: "Large", Color: "Blue" }, price: 100, stock: 10, sku: "SKU-L-BLUE", enabled: true },
    ],
    images: [],
    metaTitle: "",
    metaDescription: "",
    slug: "test-product",
    status: "draft",
  };

  it("renders 4 generated variant matrix combinations", () => {
    const handleUpdate = jest.fn();
    render(
      <TabVariants
        formData={mockFormData}
        updateField={handleUpdate}
        addOption={jest.fn()}
        removeOption={jest.fn()}
        updateOption={jest.fn()}
        updateVariantRow={jest.fn()}
      />,
    );

    expect(screen.getByText("Size: Small / Color: Red")).toBeInTheDocument();
    expect(screen.getByText("Size: Large / Color: Blue")).toBeInTheDocument();
  });

  it("calls bulkSetVariantPrices on clicking Apply Price", () => {
    const handleBulkPrice = jest.fn();
    render(
      <TabVariants
        formData={mockFormData}
        updateField={jest.fn()}
        addOption={jest.fn()}
        removeOption={jest.fn()}
        updateOption={jest.fn()}
        updateVariantRow={jest.fn()}
        bulkSetVariantPrices={handleBulkPrice}
      />,
    );

    const priceInput = screen.getByPlaceholderText("e.g. 49.99");
    fireEvent.change(priceInput, { target: { value: "49.99" } });

    const applyPriceBtn = screen.getByText("Apply Price");
    fireEvent.click(applyPriceBtn);

    expect(handleBulkPrice).toHaveBeenCalledWith(49.99);
  });

  it("calls bulkSetVariantStocks on clicking Apply Stock", () => {
    const handleBulkStock = jest.fn();
    render(
      <TabVariants
        formData={mockFormData}
        updateField={jest.fn()}
        addOption={jest.fn()}
        removeOption={jest.fn()}
        updateOption={jest.fn()}
        updateVariantRow={jest.fn()}
        bulkSetVariantStocks={handleBulkStock}
      />,
    );

    const stockInput = screen.getByPlaceholderText("e.g. 50");
    fireEvent.change(stockInput, { target: { value: "50" } });

    const applyStockBtn = screen.getByText("Apply Stock");
    fireEvent.click(applyStockBtn);

    expect(handleBulkStock).toHaveBeenCalledWith(50);
  });
});
