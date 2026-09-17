import type { InventoryItem } from "@/types/inventory";

import {
  getStoredProducts,
  getStoredProductFormData,
  getCategoryDefaultImage,
  isValidImageUrl,
  safeLocalStorageSet,
} from "./product-storage";

const INVENTORY_STORAGE_KEY = "artrivo_vendor_inventory";

export function generateMockInventory(customProducts?: any[], storeId?: string): InventoryItem[] {
  const products = customProducts || (typeof window !== "undefined" ? getStoredProducts(storeId) : []);
  const items: InventoryItem[] = [];

  products.slice(0, 200).forEach((product) => {
    if (!product) return;

    const defaultThreshold = 10;
    const storedForm = typeof window !== "undefined" ? getStoredProductFormData(product.id, storeId) : null;
    const cleanThumb = isValidImageUrl(product.thumbnail || product.image)
      ? (product.thumbnail || product.image)
      : getCategoryDefaultImage(product.category, product.name || product.title);

    if (storedForm?.variants && storedForm.variants.length > 0) {
      storedForm.variants.forEach((v) => {
        const optionLabel = Object.entries(v.optionValues)
          .map(([k, val]) => `${k}: ${val}`)
          .join(", ");

        items.push({
          id: v.id,
          productId: product.id,
          variantId: v.id,
          isVariant: true,
          parentName: product.name || product.title,
          variantTitle: optionLabel || v.sku,
          name: `${product.name || product.title} (${optionLabel || v.sku})`,
          sku: v.sku || product.sku,
          price: Number(v.price) || product.price,
          stock: Number(v.stock) || 0,
          lowStockThreshold: defaultThreshold,
          version: 1,
          thumbnail: cleanThumb,
          category: product.category || "General",
          status: v.stock === 0 ? "out-of-stock" : product.status || "published",
          updatedAt: product.updatedAt || product.updated_at || new Date().toISOString(),
        });
      });
    } else {
      const priceNum =
        typeof product.price === "number"
          ? product.price
          : parseFloat(String(product.price).replace(/[^0-9.]/g, "")) || 0;
      const stockNum = typeof product.stock === "number" ? product.stock : 10;

      items.push({
        id: product.id,
        productId: product.id,
        isVariant: false,
        name: product.name || product.title || "Product",
        sku: product.sku || ("SKU-" + String(product.id).slice(0, 8)).toUpperCase(),
        price: priceNum,
        stock: stockNum,
        lowStockThreshold: defaultThreshold,
        version: 1,
        thumbnail: cleanThumb,
        category: product.category || "General",
        status: stockNum === 0 ? "out-of-stock" : (product.status || "published"),
        updatedAt: product.updatedAt || product.updated_at || new Date().toISOString(),
      });
    }
  });

  return items;
}

export function getStoredInventory(storeId?: string): InventoryItem[] {
  if (typeof window === "undefined") {
    return generateMockInventory(undefined, storeId);
  }

  const generated = generateMockInventory(undefined, storeId);
  safeLocalStorageSet(INVENTORY_STORAGE_KEY, JSON.stringify(generated));
  return generated;
}

export function saveStoredInventory(items: InventoryItem[]): void {
  if (typeof window === "undefined") return;
  safeLocalStorageSet(INVENTORY_STORAGE_KEY, JSON.stringify(items));
}

export const initialInventoryData: InventoryItem[] = generateMockInventory();
