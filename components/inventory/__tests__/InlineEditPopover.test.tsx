import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";

import type { InventoryItem } from "@/types/inventory";

import { InlineEditPopover } from "../InlineEditPopover";

const mockItem: InventoryItem = {
  id: "prod_0001",
  productId: "prod_0001",
  isVariant: false,
  name: "Test Leather Bag",
  sku: "SKU-BAG-001",
  price: 99.99,
  stock: 25,
  lowStockThreshold: 10,
  version: 1,
  thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  category: "Beauty",
  status: "published",
  updatedAt: new Date().toISOString(),
};

describe("InlineEditPopover Component", () => {
  it("renders with field value and handles keyboard shortcuts", () => {
    const handleSave = jest.fn();
    const handleCancel = jest.fn();

    render(
      <InlineEditPopover
        open={true}
        item={mockItem}
        field="price"
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );

    expect(screen.getByText("Edit Price ($)")).toBeInTheDocument();
    expect(screen.getByText("Test Leather Bag")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Enter value...");
    expect(input).toHaveValue(99.99);

    // Test Esc key triggers onCancel
    fireEvent.keyDown(input, { key: "Escape", code: "Escape" });
    expect(handleCancel).toHaveBeenCalledTimes(1);

    // Change input and press Enter to save
    fireEvent.change(input, { target: { value: "129.99" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(handleSave).toHaveBeenCalledWith(129.99, false);
  });

  it("handles quick adjustment preset buttons", () => {
    const handleSave = jest.fn();
    const handleCancel = jest.fn();

    render(
      <InlineEditPopover
        open={true}
        item={mockItem}
        field="stock"
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );

    expect(screen.getByText("Edit Stock (Units)")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("Enter value...");
    expect(input).toHaveValue(25);

    // Click +10 quick button
    const plusTenBtn = screen.getByText("+10");
    fireEvent.click(plusTenBtn);
    expect(input).toHaveValue(35);

    // Click Out of Stock (0)
    const zeroBtn = screen.getByText("Out of Stock (0)");
    fireEvent.click(zeroBtn);
    expect(input).toHaveValue(0);
  });
});
