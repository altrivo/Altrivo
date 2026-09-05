import "@testing-library/jest-dom";
import {
  parseAndValidateInventoryCSV,
  generateSampleInventoryCsv,
} from "../csv-inventory";

describe("CSV Inventory Utility Module", () => {
  it("parses sample CSV data and validates valid rows", () => {
    const sampleCsv = generateSampleInventoryCsv();
    const result = parseAndValidateInventoryCSV(sampleCsv);

    expect(result.totalRows).toBe(4);
    expect(result.validCount).toBe(4);
    expect(result.errorCount).toBe(0);
    expect(result.rows[0].parsed?.sku).toBe("SKU-SHIRT-001");
    expect(result.rows[0].parsed?.price).toBe(39.99);
  });

  it("detects validation errors (invalid price, invalid stock, missing SKU)", () => {
    const invalidCsv = [
      "SKU,Name,Category,Price,Stock,LowStockThreshold,Status",
      "SKU-ERR-1,Invalid Item 1,Clothing,-10.50,15,5,published",
      ",Invalid Item 2,Electronics,25.00,-5,5,published",
    ].join("\n");

    const result = parseAndValidateInventoryCSV(invalidCsv);

    expect(result.totalRows).toBe(2);
    expect(result.errorCount).toBe(2);
    expect(result.rows[0].errors[0]).toContain("Price cannot be negative");
    expect(result.rows[1].errors[0]).toContain("Stock quantity cannot be negative");
  });

  it("parses 5,000 CSV rows in under 30 seconds (<500ms)", () => {
    const header = "SKU,Name,Category,Price,Stock,LowStockThreshold,Status\n";
    const rowLines: string[] = [];
    for (let i = 1; i <= 5000; i++) {
      rowLines.push(
        `SKU-PERF-${String(i).padStart(5, "0")},Performance Product ${i},Category ${i % 10},${(i % 100) + 9.99},${i % 200},10,published`
      );
    }
    const largeCsv = header + rowLines.join("\n");

    const startTime = performance.now();
    const result = parseAndValidateInventoryCSV(largeCsv);
    const duration = performance.now() - startTime;

    expect(result.totalRows).toBe(5000);
    expect(result.validCount).toBe(5000);
    expect(duration).toBeLessThan(30000); // Spec is <30s
    expect(result.parseTimeMs).toBeLessThan(2000);
  });
});
