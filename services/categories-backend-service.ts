import type {
  CategoryNode,
  CreateCategoryInput,
  UpdateCategoryInput,
  TagSearchResult,
} from "@/types/category";

// In-memory categories database store with 3-level tree structure
let categoriesStore: CategoryNode[] = [
  {
    id: "cat_apparel",
    vendorId: "vendor_dev_123",
    name: "Apparel & Fashion",
    parentId: null,
    slug: "apparel-fashion",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&auto=format&fit=crop&q=80",
    sortOrder: 1,
    depth: 1,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cat_women",
    vendorId: "vendor_dev_123",
    name: "Women's Clothing",
    parentId: "cat_apparel",
    slug: "womens-clothing",
    imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=120&auto=format&fit=crop&q=80",
    sortOrder: 1,
    depth: 2,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cat_dresses",
    vendorId: "vendor_dev_123",
    name: "Summer Dresses",
    parentId: "cat_women",
    slug: "summer-dresses",
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=120&auto=format&fit=crop&q=80",
    sortOrder: 1,
    depth: 3,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cat_electronics",
    vendorId: "vendor_dev_123",
    name: "Electronics & Gadgets",
    parentId: null,
    slug: "electronics-gadgets",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80",
    sortOrder: 2,
    depth: 1,
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Product tags dataset for fast GIN index search simulation
const productTagsStore: { vendorId: string; tags: string[] }[] = [
  { vendorId: "vendor_dev_123", tags: ["leather", "handcrafted", "bag", "tote", "luxury"] },
  { vendorId: "vendor_dev_123", tags: ["ceramic", "coffee", "minimalist", "mug", "kitchen"] },
  { vendorId: "vendor_dev_123", tags: ["leather", "belt", "accessories", "fashion"] },
  { vendorId: "vendor_dev_123", tags: ["electronics", "audio", "wireless", "headphones"] },
];

export function slugifyCategoryName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export class CategoriesBackendService {
  /**
   * Computes category depth level (1, 2, or 3).
   */
  private static calculateCategoryDepth(parentId: string | null | undefined, vendorId: string): number {
    if (!parentId) return 1;

    const parent = categoriesStore.find((c) => c.id === parentId && c.vendorId === vendorId);
    if (!parent) return 1;

    return parent.depth + 1;
  }

  /**
   * Generates a vendor-unique slug.
   */
  private static ensureUniqueVendorSlug(baseSlug: string, vendorId: string, currentCategoryId?: string): string {
    let slug = baseSlug;
    let counter = 1;

    while (
      categoriesStore.some(
        (c) => c.vendorId === vendorId && c.slug === slug && c.id !== currentCategoryId
      )
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Builds nested category tree from flat nodes list.
   */
  private static buildCategoryTree(nodes: CategoryNode[]): CategoryNode[] {
    const nodeMap = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    // Initialize nodes with empty children array
    nodes.forEach((node) => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // Link parent-child relationships
    nodeMap.forEach((node) => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        const parent = nodeMap.get(node.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort roots & children by sortOrder
    const sortNodes = (items: CategoryNode[]) => {
      items.sort((a, b) => a.sortOrder - b.sortOrder);
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          sortNodes(item.children);
        }
      });
    };

    sortNodes(roots);
    return roots;
  }

  /**
   * Retrieves all categories for a vendor as a tree or flat array.
   */
  static async getCategories(
    vendorId = "vendor_dev_123",
    format: "tree" | "flat" = "tree"
  ): Promise<CategoryNode[]> {
    const list = categoriesStore.filter((c) => c.vendorId === vendorId);

    if (format === "flat") {
      return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return this.buildCategoryTree(list);
  }

  /**
   * Retrieves single category by ID.
   */
  static async getCategoryById(id: string, vendorId = "vendor_dev_123"): Promise<CategoryNode | null> {
    const category = categoriesStore.find((c) => c.id === id && c.vendorId === vendorId);
    return category ? { ...category } : null;
  }

  /**
   * Creates a new category with automatic slug generation & max 3-level depth validation.
   */
  static async createCategory(input: CreateCategoryInput): Promise<CategoryNode> {
    const vendorId = input.vendorId || "vendor_dev_123";
    const parentId = input.parentId || null;

    // Depth Validation: Enforce max 3-level nesting
    const depth = this.calculateCategoryDepth(parentId, vendorId);
    if (depth > 3) {
      throw new Error("Maximum category nesting depth of 3 levels exceeded.");
    }

    // Automatic slug generation & vendor uniqueness check
    const rawSlug = input.slug ? slugifyCategoryName(input.slug) : slugifyCategoryName(input.name);
    const uniqueSlug = this.ensureUniqueVendorSlug(rawSlug, vendorId);

    const newId = `cat_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newCategory: CategoryNode = {
      id: newId,
      vendorId,
      name: input.name,
      parentId,
      slug: uniqueSlug,
      imageUrl: input.imageUrl || "",
      sortOrder: typeof input.sortOrder === "number" ? input.sortOrder : categoriesStore.length + 1,
      depth,
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    categoriesStore.push(newCategory);
    return newCategory;
  }

  /**
   * Updates an existing category.
   */
  static async updateCategory(
    id: string,
    input: UpdateCategoryInput,
    vendorId = "vendor_dev_123"
  ): Promise<CategoryNode | null> {
    const index = categoriesStore.findIndex((c) => c.id === id && c.vendorId === vendorId);
    if (index === -1) return null;

    const existing = categoriesStore[index];
    const newParentId = input.parentId !== undefined ? input.parentId : existing.parentId;

    // Recalculate & validate depth
    const newDepth = this.calculateCategoryDepth(newParentId, vendorId);
    if (newDepth > 3) {
      throw new Error("Maximum category nesting depth of 3 levels exceeded.");
    }

    // Slug check
    let newSlug = existing.slug;
    if (input.slug) {
      newSlug = this.ensureUniqueVendorSlug(slugifyCategoryName(input.slug), vendorId, id);
    } else if (input.name && input.name !== existing.name) {
      newSlug = this.ensureUniqueVendorSlug(slugifyCategoryName(input.name), vendorId, id);
    }

    const updated: CategoryNode = {
      ...existing,
      name: input.name || existing.name,
      parentId: newParentId,
      slug: newSlug,
      imageUrl: input.imageUrl !== undefined ? input.imageUrl : existing.imageUrl,
      sortOrder: typeof input.sortOrder === "number" ? input.sortOrder : existing.sortOrder,
      depth: newDepth,
      updatedAt: new Date().toISOString(),
    };

    categoriesStore[index] = updated;
    return updated;
  }

  /**
   * Deletes a category.
   */
  static async deleteCategory(id: string, vendorId = "vendor_dev_123"): Promise<boolean> {
    const initialLen = categoriesStore.length;
    // Re-assign orphaned children parentId to null
    categoriesStore.forEach((c) => {
      if (c.parentId === id) c.parentId = null;
    });

    categoriesStore = categoriesStore.filter((c) => !(c.id === id && c.vendorId === vendorId));
    return categoriesStore.length < initialLen;
  }

  /**
   * Fast GIN-indexed tag array search (<100ms SLA).
   */
  static async searchTags(query: string, vendorId = "vendor_dev_123"): Promise<TagSearchResult[]> {
    const startTime = performance.now();
    const q = query.toLowerCase().trim();

    const tagCounts = new Map<string, number>();

    productTagsStore
      .filter((item) => item.vendorId === vendorId)
      .flatMap((item) => item.tags)
      .forEach((tag) => {
        if (!q || tag.toLowerCase().includes(q)) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      });

    const results: TagSearchResult[] = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    const elapsed = Math.round(performance.now() - startTime);
    if (elapsed > 100) {
      console.warn(`searchTags exceeded 100ms SLA: ${elapsed}ms for vendor ${vendorId}`);
    }

    return results;
  }
}
