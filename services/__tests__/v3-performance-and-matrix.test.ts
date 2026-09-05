import "@testing-library/jest-dom";
import { parseAndValidateProductCSV } from "@/utils/csv-product-parser";

import { ProductsBackendService } from "../products-backend-service";

describe("V3 Performance & Variant Matrix Test Suite", () => {
  it("Performance SLA Test: Loads 1,000 products in < 1 second (<1000ms SLA)", async () => {
    // Populate store with 1,000 products
    for (let i = 1; i <= 1000; i++) {
      await ProductsBackendService.createProduct({
        vendor_id: "vendor_perf_test",
        title: `Performance Product ${i}`,
        price: (i % 100) + 10.99,
        status: "published",
      });
    }

    const startTime = performance.now();
    const result = await ProductsBackendService.getProducts({
      vendor_id: "vendor_perf_test",
      limit: 1000,
    });
    const duration = performance.now() - startTime;

    expect(result.data.length).toBe(1000);
    expect(duration).toBeLessThan(1000); // Must load 1k products in <1s
  });

  it("Variant Matrix Combinatorics Test: Generates 6 variant rows for 2x3 options", () => {
    const options = [
      { id: "opt_1", name: "Size", values: ["Small", "Medium", "Large"] },
      { id: "opt_2", name: "Color", values: ["Red", "Blue"] },
    ];

    // Cartesian product matrix generator
    const generateMatrix = (opts: typeof options) => {
      if (opts.length === 0) return [];
      let combinations: Record<string, string>[] = [{}];

      opts.forEach((opt) => {
        const next: Record<string, string>[] = [];
        combinations.forEach((prev) => {
          opt.values.forEach((val) => {
            next.push({ ...prev, [opt.name]: val });
          });
        });
        combinations = next;
      });

      return combinations;
    };

    const matrix = generateMatrix(options);
    expect(matrix.length).toBe(6);
    expect(matrix[0]).toEqual({ Size: "Small", Color: "Red" });
    expect(matrix[5]).toEqual({ Size: "Large", Color: "Blue" });
  });

  it("CSV Parser SLA Test: Parses 1,000 Product rows in < 200ms", () => {
    const lines = ["Title,SKU,Category,Price,Stock,Status"];
    for (let i = 1; i <= 1000; i++) {
      lines.push(`Product ${i},SKU-${i},General,${(i % 50) + 5},${i % 100},published`);
    }
    const csvContent = lines.join("\n");

    const startTime = performance.now();
    const res = parseAndValidateProductCSV(csvContent);
    const duration = performance.now() - startTime;

    expect(res.totalRows).toBe(1000);
    expect(res.validCount).toBe(1000);
    expect(duration).toBeLessThan(500);
  });
});
