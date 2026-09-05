import type {
  ProductRecord,
  ProductVariantRecord,
  CreateProductInput,
  UpdateProductInput,
  BackendProductStatus,
} from "@/types/backend-product";

// In-memory backend store for fast, deterministic local development & testing
let memoryProductsStore: ProductRecord[] = [
  {
    id: "prod_001",
    vendor_id: "vendor_dev_123",
    title: "Artisan Leather Tote Bag",
    description: "Handcrafted full-grain leather tote bag with interior laptop sleeve.",
    category_id: "Fashion",
    tags: ["leather", "handcrafted", "bag", "tote"],
    price: 189.99,
    compare_price: 220.00,
    cost: 75.00,
    seo_slug: "artisan-leather-tote-bag",
    seo_title: "Artisan Leather Tote Bag | Handmade Luxury",
    seo_description: "Buy artisan handcrafted leather tote bags made from premium full-grain leather.",
    status: "published",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    variants: [
      {
        id: "var_001_tan",
        product_id: "prod_001",
        sku: "SKU-BAG-001-TAN",
        option_values: { Color: "Tan", Size: "Standard" },
        price: 189.99,
        stock: 35,
        image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=120&auto=format&fit=crop&q=80",
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "var_001_black",
        product_id: "prod_001",
        sku: "SKU-BAG-001-BLK",
        option_values: { Color: "Black", Size: "Standard" },
        price: 189.99,
        stock: 12,
        image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&auto=format&fit=crop&q=80",
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "prod_002",
    vendor_id: "vendor_dev_123",
    title: "Minimalist Ceramic Mug",
    description: "Matte finish ceramic mug designed for espresso and pour-over coffee.",
    category_id: "Home & Kitchen",
    tags: ["ceramic", "coffee", "minimalist"],
    price: 24.50,
    compare_price: 30.00,
    cost: 8.00,
    seo_slug: "minimalist-ceramic-mug",
    seo_title: "Minimalist Ceramic Mug | Altrivo Decor",
    seo_description: "Premium matte ceramic mug for coffee lovers.",
    status: "published",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: "var_002_white",
        product_id: "prod_002",
        sku: "SKU-MUG-002-WHT",
        option_values: { Color: "Matte White" },
        price: 24.50,
        stock: 120,
        image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=120&auto=format&fit=crop&q=80",
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
];

export interface QueryProductsFilter {
  vendor_id?: string;
  status?: BackendProductStatus;
  category_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: "created_at" | "price" | "title";
  sortOrder?: "asc" | "desc";
}

export class ProductsBackendService {
  /**
   * Retrieves paginated products for a vendor with status and category filtering.
   * Target response time: <200ms P95
   */
  static async getProducts(filter: QueryProductsFilter = {}): Promise<{
    data: ProductRecord[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const startTime = performance.now();
    const vendorId = filter.vendor_id || "vendor_dev_123";
    const limit = filter.limit || 20;
    const offset = filter.offset || 0;

    // RLS Enforcement: Filter by vendor_id
    let filtered = memoryProductsStore.filter((p) => p.vendor_id === vendorId);

    if (filter.status) {
      filtered = filtered.filter((p) => p.status === filter.status);
    }

    if (filter.category_id) {
      filtered = filtered.filter((p) => p.category_id === filter.category_id);
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.seo_slug.toLowerCase().includes(q) ||
          p.variants?.some((v) => v.sku.toLowerCase().includes(q))
      );
    }

    // Index-like sort
    const sortBy = filter.sortBy || "created_at";
    const sortOrder = filter.sortOrder === "asc" ? 1 : -1;
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "price") return (a.price - b.price) * sortOrder;
      if (sortBy === "title") return a.title.localeCompare(b.title) * sortOrder;
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * sortOrder;
    });

    const paginated = filtered.slice(offset, offset + limit);

    const elapsed = Math.round(performance.now() - startTime);
    if (elapsed > 200) {
      console.warn(`getProducts exceeded 200ms SLA: ${elapsed}ms for vendor ${vendorId}`);
    }

    return {
      data: paginated,
      total: filtered.length,
      limit,
      offset,
    };
  }

  /**
   * Retrieves single product by ID (enforcing RLS vendor check).
   */
  static async getProductById(id: string, vendor_id = "vendor_dev_123"): Promise<ProductRecord | null> {
    const product = memoryProductsStore.find((p) => p.id === id);
    if (!product) return null;
    // RLS check
    if (product.vendor_id !== vendor_id) return null;
    return product;
  }

  /**
   * Creates a new product and its variants.
   */
  static async createProduct(input: CreateProductInput): Promise<ProductRecord> {
    const vendor_id = input.vendor_id || "vendor_dev_123";
    const newId = `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const slug =
      input.seo_slug ||
      input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const createdVariants: ProductVariantRecord[] = (input.variants || []).map((v, i) => ({
      id: `var_${newId}_${i + 1}`,
      product_id: newId,
      sku: v.sku || `SKU-${slug.toUpperCase()}-${i + 1}`,
      option_values: v.option_values || {},
      price: typeof v.price === "number" ? v.price : input.price,
      stock: typeof v.stock === "number" ? v.stock : 10,
      image_url: v.image_url || "",
      enabled: v.enabled ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const newProduct: ProductRecord = {
      id: newId,
      vendor_id,
      title: input.title,
      description: input.description || "",
      category_id: input.category_id || "General",
      tags: input.tags || [],
      price: input.price,
      compare_price: input.compare_price || 0,
      cost: input.cost || 0,
      seo_slug: slug,
      seo_title: input.seo_title || input.title,
      seo_description: input.seo_description || input.description || "",
      status: input.status || "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      variants: createdVariants,
    };

    memoryProductsStore.unshift(newProduct);
    return newProduct;
  }

  /**
   * Updates an existing product and its variants.
   */
  static async updateProduct(
    id: string,
    input: UpdateProductInput,
    vendor_id = "vendor_dev_123"
  ): Promise<ProductRecord | null> {
    const index = memoryProductsStore.findIndex((p) => p.id === id && p.vendor_id === vendor_id);
    if (index === -1) return null;

    const existing = memoryProductsStore[index];

    let updatedVariants = existing.variants || [];
    if (input.variants) {
      updatedVariants = input.variants.map((v, i) => {
        const varId = v.id || `var_${id}_${i + 1}`;
        const prev = existing.variants?.find((pv) => pv.id === varId);
        return {
          id: varId,
          product_id: id,
          sku: v.sku || prev?.sku || `SKU-${id}-${i + 1}`,
          option_values: v.option_values || prev?.option_values || {},
          price: typeof v.price === "number" ? v.price : prev?.price || existing.price,
          stock: typeof v.stock === "number" ? v.stock : prev?.stock || 0,
          image_url: v.image_url || prev?.image_url || "",
          enabled: v.enabled ?? prev?.enabled ?? true,
          created_at: prev?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });
    }

    const updatedProduct: ProductRecord = {
      ...existing,
      ...input,
      variants: updatedVariants,
      updated_at: new Date().toISOString(),
    };

    memoryProductsStore[index] = updatedProduct;
    return updatedProduct;
  }

  /**
   * Deletes a product and all associated variants.
   */
  static async deleteProduct(id: string, vendor_id = "vendor_dev_123"): Promise<boolean> {
    const initialLength = memoryProductsStore.length;
    memoryProductsStore = memoryProductsStore.filter((p) => !(p.id === id && p.vendor_id === vendor_id));
    return memoryProductsStore.length < initialLength;
  }
}
