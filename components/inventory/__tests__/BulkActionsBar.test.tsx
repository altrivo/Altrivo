import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";

import { BulkActionsBar } from "../BulkActionsBar";

describe("BulkActionsBar Component", () => {
  it("renders selected items counter and triggers bulk edit actions", () => {
    const handleOpenPrice = jest.fn();
    const handleOpenStock = jest.fn();
    const handleExport = jest.fn();

    render(
      <BulkActionsBar
        selectedCount={5}
        totalFilteredCount={150}
        onSelectAllFiltered={jest.fn()}
        onClearSelection={jest.fn()}
        onOpenBulkPrice={handleOpenPrice}
        onOpenBulkStock={handleOpenStock}
        onOpenBulkThreshold={jest.fn()}
        onBulkStatusChange={jest.fn()}
        onBulkExport={handleExport}
        onBulkDelete={jest.fn()}
      />
    );

    expect(screen.getByText("5 items selected")).toBeInTheDocument();

    const bulkPriceBtn = screen.getByText("Bulk Edit Price");
    fireEvent.click(bulkPriceBtn);
    expect(handleOpenPrice).toHaveBeenCalledTimes(1);

    const bulkStockBtn = screen.getByText("Bulk Edit Stock");
    fireEvent.click(bulkStockBtn);
    expect(handleOpenStock).toHaveBeenCalledTimes(1);
  });
});
