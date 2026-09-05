import "@testing-library/jest-dom";
import { parseAndValidateProductCSV, escapeCsvValue } from "../csv-product-parser";

describe("Product CSV Parser & Validator", () => {
  it("escapes special CSV values correctly", () => {
    expect(escapeCsvValue("Simple String")).toBe("Simple String");
    expect(escapeCsvValue('String with "quotes" and, commas')).toBe('"String with ""quotes"" and, commas"');
    expect(escapeCsvValue(["tag1", "tag2"])).toBe("tag1;tag2");
  });

  it("parses valid product rows and constructs CreateProductInput payloads", () => {
    const csvData = [
      "Title,SKU,Category,Price,Stock,Status,Tags",
      "Handcrafted Leather Wallet,SKU-WLT-001,Accessories,49.99,50,published,leather;accessories",
      "Ceramic Pour Over Dripper,SKU-DRIP-002,Kitchen,32.50,15,draft,ceramic;coffee",
    ].join("\n");

    const result = parseAndValidateProductCSV(csvData);

    expect(result.totalRows).toBe(2);
    expect(result.validCount).toBe(2);
    expect(result.errorCount).toBe(0);
    expect(result.rows[0].productInput?.title).toBe("Handcrafted Leather Wallet");
    expect(result.rows[0].productInput?.price).toBe(49.99);
  });

  it("detects validation errors (missing title, invalid price, invalid stock)", () => {
    const invalidCsv = [
      "Title,SKU,Price,Stock",
      ",SKU-ERR-1,25.00,10", // Missing title
      "Invalid Price Item,SKU-ERR-2,-15.00,10", // Negative price
      "Invalid Stock Item,SKU-ERR-3,25.00,-5", // Negative stock
    ].join("\n");

    const result = parseAndValidateProductCSV(invalidCsv);

    expect(result.totalRows).toBe(3);
    expect(result.errorCount).toBe(3);
    expect(result.rows[0].errors[0]).toContain("Missing required field 'title'");
    expect(result.rows[1].errors[0]).toContain("'price' cannot be negative");
    expect(result.rows[2].errors[0]).toContain("'stock' quantity cannot be negative");
  });

  it("parses 5,000 product rows in under 30 seconds (<500ms SLA)", () => {
    const header = "Title,SKU,Category,Price,Stock,Status,Tags\n";
    const lines: string[] = [];
    for (let i = 1; i <= 5000; i++) {
      lines.push(`Product Title ${i},SKU-IMPORT-${String(i).padStart(5, "0")},Category ${i % 5},${(i % 100) + 10.99},${i % 150},published,tag1;tag2`);
    }
    const largeCsv = header + lines.join("\n");

    const startTime = performance.now();
    const result = parseAndValidateProductCSV(largeCsv);
    const duration = performance.now() - startTime;

    expect(result.totalRows).toBe(5000);
    expect(result.validCount).toBe(5000);
    expect(duration).toBeLessThan(30000); // <30s SLA
    expect(result.parseTimeMs).toBeLessThan(2000);
  });
});
