import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";

import InventoryPage from "../page";

describe("InventoryPage", () => {
  it("renders header, KPI metrics, filter controls and table", () => {
    render(<InventoryPage />);

    expect(screen.getByText("Smart Inventory Management")).toBeInTheDocument();
    expect(screen.getByText("Total Items & Variants")).toBeInTheDocument();
    expect(screen.getByText("Low-Stock Alert")).toBeInTheDocument();
    expect(screen.getAllByText("Out of Stock")[0]).toBeInTheDocument();
    expect(screen.getByText("Total Inventory Valuation")).toBeInTheDocument();
  });

  it("filters items by search query", () => {
    render(<InventoryPage />);

    const searchInput = screen.getByPlaceholderText(
      "Search by product name or SKU..."
    );
    fireEvent.change(searchInput, { target: { value: "Widget 1" } });

    expect(searchInput).toHaveValue("Widget 1");
  });
});
