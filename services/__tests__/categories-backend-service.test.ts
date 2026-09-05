import "@testing-library/jest-dom";
import { CategoriesBackendService, slugifyCategoryName } from "../categories-backend-service";

describe("CategoriesBackendService (3-Level Tree & Tag GIN Search)", () => {
  it("slugifies category names properly", () => {
    expect(slugifyCategoryName("Women's Handbags & Purses!")).toBe("womens-handbags-purses");
    expect(slugifyCategoryName("  Smart Watches (2026) ")).toBe("smart-watches-2026");
  });

  it("builds 3-level nested category tree structure", async () => {
    const tree = await CategoriesBackendService.getCategories("vendor_dev_123", "tree");
    expect(tree.length).toBeGreaterThan(0);

    const apparelNode = tree.find((c) => c.slug === "apparel-fashion");
    expect(apparelNode).toBeDefined();
    expect(apparelNode?.depth).toBe(1);

    const womenNode = apparelNode?.children?.find((c) => c.slug === "womens-clothing");
    expect(womenNode).toBeDefined();
    expect(womenNode?.depth).toBe(2);

    const dressesNode = womenNode?.children?.find((c) => c.slug === "summer-dresses");
    expect(dressesNode).toBeDefined();
    expect(dressesNode?.depth).toBe(3);
  });

  it("rejects 4th level nesting attempts with 3-level depth constraint error", async () => {
    // Attempting to add child under Level 3 category 'cat_dresses'
    await expect(
      CategoriesBackendService.createCategory({
        vendorId: "vendor_dev_123",
        name: "Maxi Summer Dresses",
        parentId: "cat_dresses",
      })
    ).rejects.toThrow("Maximum category nesting depth of 3 levels exceeded.");
  });

  it("enforces vendor slug uniqueness automatically", async () => {
    const cat1 = await CategoriesBackendService.createCategory({
      vendorId: "vendor_slug_test",
      name: "Luxury Accessories",
    });
    expect(cat1.slug).toBe("luxury-accessories");

    // Creating another category with same name for same vendor auto-appends suffix
    const cat2 = await CategoriesBackendService.createCategory({
      vendorId: "vendor_slug_test",
      name: "Luxury Accessories",
    });
    expect(cat2.slug).toBe("luxury-accessories-1");
  });

  it("performs fast tag array search in <100ms SLA", async () => {
    const startTime = performance.now();
    const results = await CategoriesBackendService.searchTags("leather", "vendor_dev_123");
    const duration = performance.now() - startTime;

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].tag).toBe("leather");
    expect(duration).toBeLessThan(100); // <100ms requirement
  });
});
