import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import type { InventoryItem } from "@/types/inventory";

import { InventoryTable } from "../InventoryTable";

const mockItems: InventoryItem[] = [
  {
    id: "item_1",
    productId: "prod_1",
    isVariant: false,
    name: "Classic Silk Shirt",
    sku: "SKU-SILK-001",
    price: 49.99,
    stock: 20,
    lowStockThreshold: 5,
    version: 1,
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    category: "Clothing",
    status: "published",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item_2",
    productId: "prod_2",
    isVariant: true,
    name: "Leather Boots - Red / 42",
    sku: "SKU-BOOT-002",
    price: 120.0,
    stock: 2,
    lowStockThreshold: 10,
    version: 1,
    thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    category: "Footwear",
    status: "published",
    updatedAt: new Date().toISOString(),
  },
];

global.fetch = jest.fn();

describe("InventoryTable Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders table columns: Image, Name, SKU, Price, Stock, Low Threshold", () => {
    render(<InventoryTable initialItems={mockItems} />);

    expect(screen.getByText("Classic Silk Shirt")).toBeInTheDocument();
    expect(screen.getByText("SKU-SILK-001")).toBeInTheDocument();
    expect(screen.getByText("$49.99")).toBeInTheDocument();
    expect(screen.getByText("Leather Boots - Red / 42")).toBeInTheDocument();
    expect(screen.getByText("SKU-BOOT-002")).toBeInTheDocument();
    expect(screen.getByText("$120.00")).toBeInTheDocument();
  });

  it("opens inline edit popover when cell is clicked", () => {
    render(<InventoryTable initialItems={mockItems} />);

    const priceCell = screen.getByText("$49.99");
    fireEvent.click(priceCell);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Edit Price ($)")).toBeInTheDocument();
  });

  it("supports keyboard arrow navigation between cells", () => {
    render(<InventoryTable initialItems={mockItems} />);

    const table = screen.getByRole("table");

    // Press ArrowDown to select first row
    fireEvent.keyDown(table, { key: "ArrowDown", code: "ArrowDown" });
    // Press Enter to open edit pop-up
    fireEvent.keyDown(table, { key: "Enter", code: "Enter" });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("updates state optimistically and rolls back on API error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ success: false, error: "Network Failure" }),
    });

    render(<InventoryTable initialItems={mockItems} />);

    // Click price cell of item 1
    const priceCell = screen.getByText("$49.99");
    fireEvent.click(priceCell);

    const input = screen.getByPlaceholderText("Enter value...");
    fireEvent.change(input, { target: { value: "59.99" } });

    // Click Save Changes button
    const saveBtn = screen.getByText("Save Changes");
    fireEvent.click(saveBtn);

    // Optimistic UI updates value immediately
    expect(screen.getByText("$59.99")).toBeInTheDocument();

    // After fetch rejects, state rolls back to $49.99 and shows rollback toast
    await waitFor(() => {
      expect(screen.getByText("$49.99")).toBeInTheDocument();
      expect(screen.getByText(/Update Rolled Back/i)).toBeInTheDocument();
    });
  });
});
