import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { CsvImportModal } from "../CsvImportModal";

describe("CsvImportModal Component", () => {
  it("loads sample CSV, displays validation stats, and triggers confirm import", async () => {
    const handleClose = jest.fn();
    const handleConfirm = jest.fn();

    render(
      <CsvImportModal
        open={true}
        onClose={handleClose}
        onConfirmImport={handleConfirm}
      />
    );

    expect(screen.getByText("Import Inventory from CSV")).toBeInTheDocument();

    // Click Load Sample CSV
    const loadSampleBtn = screen.getByText("Load Sample CSV");
    fireEvent.click(loadSampleBtn);

    await waitFor(() => {
      expect(screen.getByText("Total Rows Parsed")).toBeInTheDocument();
      expect(screen.getAllByText("4")[0]).toBeInTheDocument();
    });

    // Confirm import button
    const confirmBtn = screen.getByText("Confirm & Import");
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
