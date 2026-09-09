import type { InventoryItem } from "@/types/inventory";

import { getStoredProducts, getStoredProductFormData, getCategoryDefaultImage, isValidImageUrl } from "./product-storage";

const INVENTORY_STORAGE_KEY = "artrivo_vendor_inventory";

export function generateMockInventory(): InventoryItem[] {
  const products = typeof window !== "undefined" ? getStoredProducts() : [];
  const items: InventoryItem[] = [];

  products.slice(0, 200).forEach((product, idx) => {
    const defaultThreshold = 10 + (idx % 3) * 5;
    const storedForm = typeof window !== "undefined" ? getStoredProductFormData(product.id) : null;
    const cleanThumb = isValidImageUrl(product.thumbnail)
      ? product.thumbnail
      : getCategoryDefaultImage(product.category, product.name);

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
          parentName: product.name,
          variantTitle: optionLabel || v.sku,
          name: `${product.name} (${optionLabel || v.sku})`,
          sku: v.sku || product.sku,
          price: Number(v.price) || product.price,
          stock: Number(v.stock) || 0,
          lowStockThreshold: defaultThreshold,
          version: 1,
          thumbnail: cleanThumb,
          category: product.category,
          status: v.stock === 0 ? "out-of-stock" : product.status,
          updatedAt: product.updatedAt,
        });
      });
    } else if (idx % 3 === 0 && !storedForm) {
      const colors = ["Black", "White", "Navy", "Emerald"];
      const sizes = ["S", "M", "L", "XL"];

      colors.slice(0, 2 + (idx % 3)).forEach((color) => {
        sizes.slice(0, 2 + (idx % 2)).forEach((size) => {
          const vId = `var_${product.id}_${color.toLowerCase()}_${size.toLowerCase()}`;
          const varSku = `${product.sku}-${color.slice(0, 1)}${size}`;
          const priceModifier = size === "XL" ? 5 : 0;
          const stockVal = (product.stock + idx * 3) % 120;

          items.push({
            id: vId,
            productId: product.id,
            variantId: vId,
            isVariant: true,
            parentName: product.name,
            variantTitle: `${color} / ${size}`,
            name: `${product.name} - ${color} / ${size}`,
            sku: varSku,
            price: Math.round((product.price + priceModifier) * 100) / 100,
            stock: stockVal,
            lowStockThreshold: defaultThreshold,
            version: 1,
            thumbnail: cleanThumb,
            category: product.category,
            status: stockVal === 0 ? "out-of-stock" : product.status,
            updatedAt: product.updatedAt,
          });
        });
      });
    } else {
      items.push({
        id: product.id,
        productId: product.id,
        isVariant: false,
        name: product.name,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        lowStockThreshold: defaultThreshold,
        version: 1,
        thumbnail: cleanThumb,
        category: product.category,
        status: product.status,
        updatedAt: product.updatedAt,
      });
    }
  });

  return items;
}

export function getStoredInventory(): InventoryItem[] {
  if (typeof window === "undefined") {
    return generateMockInventory();
  }

  const generated = generateMockInventory();
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(generated));
  } catch (e) {
    console.error("Error saving inventory storage:", e);
  }
  return generated;
}

export function saveStoredInventory(items: InventoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Error saving inventory storage:", e);
  }
}

export const initialInventoryData: InventoryItem[] = generateMockInventory();
