import "@testing-library/jest-dom";
import { ProductsBackendService } from "../products-backend-service";

describe("ProductsBackendService (Supabase Data Layer & RLS)", () => {
  it("fetches products with sub-200ms latency and enforces vendor isolation", async () => {
    const startTime = performance.now();
    const result = await ProductsBackendService.getProducts({
      vendor_id: "vendor_dev_123",
      limit: 10,
    });
    const duration = performance.now() - startTime;

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((p) => p.vendor_id === "vendor_dev_123")).toBe(true);
    expect(duration).toBeLessThan(200); // P95 <200ms requirement
  });

  it("performs full Product + Variant CRUD operations", async () => {
    // 1. Create Product
    const newProduct = await ProductsBackendService.createProduct({
      vendor_id: "vendor_test_999",
      title: "Handmade Bamboo Lamp",
      description: "Eco-friendly bamboo nightstand lamp.",
      category_id: "Home & Garden",
      price: 59.99,
      status: "published",
      variants: [
        {
          sku: "SKU-LAMP-BAMBOO-01",
          option_values: { Finish: "Natural" },
          price: 59.99,
          stock: 40,
          enabled: true,
        },
      ],
    });

    expect(newProduct.id).toBeDefined();
    expect(newProduct.seo_slug).toBe("handmade-bamboo-lamp");
    expect(newProduct.variants?.length).toBe(1);

    // 2. Read Single Product by ID (with RLS vendor match)
    const fetched = await ProductsBackendService.getProductById(newProduct.id, "vendor_test_999");
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe("Handmade Bamboo Lamp");

    // 3. Read Product with wrong vendor (RLS isolation check)
    const unauthorizedFetch = await ProductsBackendService.getProductById(newProduct.id, "wrong_vendor");
    expect(unauthorizedFetch).toBeNull();

    // 4. Update Product
    const updated = await ProductsBackendService.updateProduct(
      newProduct.id,
      { price: 69.99, status: "published" },
      "vendor_test_999"
    );
    expect(updated?.price).toBe(69.99);

    // 5. Delete Product
    const deleted = await ProductsBackendService.deleteProduct(newProduct.id, "vendor_test_999");
    expect(deleted).toBe(true);

    const reFetch = await ProductsBackendService.getProductById(newProduct.id, "vendor_test_999");
    expect(reFetch).toBeNull();
  });
});
