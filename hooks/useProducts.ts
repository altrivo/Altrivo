"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useVendorStore } from "@/context/VendorStoreContext";

import {
  getStoredProducts,
  saveStoredProducts,
  safeLocalStorageSet,
  getStorageKey,
  resolveStoreId,
  getCategoryDefaultImage,
  generateUniqueSku,
  isValidImageUrl,
  PRODUCTS_UPDATED_EVENT,
  toStorefrontProduct,
} from "@/lib/product-storage";
import type {
  Product,
  ProductFilters,
  ProductSortField,
  ProductStatus,
} from "@/types/product";

const PAGE_SIZE = 20;

export function useProducts(explicitStoreId?: string) {
  const { activeStoreId, activeStore } = useVendorStore();
  const effectiveStoreId = resolveStoreId(
    explicitStoreId || activeStoreId || activeStore?.id || undefined,
  );

  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "",
    status: "",
    sortField: "updatedAt",
    sortDirection: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);

  // Sync state with local storage on mount, fetch backend products, and sync on update events
  useEffect(() => {
    // 1. Initial immediate load from localStorage strictly scoped to this store
    const initialLocal = getStoredProducts(effectiveStoreId);
    setProducts(initialLocal.filter((p) => !p.storeId || !effectiveStoreId || p.storeId === effectiveStoreId));
    setSelectedIds(new Set());
    setCurrentPage(1);

    // 2. Fetch from backend store API to sync real-time database state
    const targetLookup = effectiveStoreId || activeStore?.slug || activeStore?.id;
    if (targetLookup) {
      fetch(`/api/stores/${targetLookup}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const store = data?.store;
          if (store) {
            const commerceProds = Array.isArray(store.commerce_config?.products) ? store.commerce_config.products : [];
            const layoutProds = Array.isArray(store.layout_config?.products) ? store.layout_config.products : [];

            // Combine products: commerce_config is the authoritative catalog (includes drafts & published)
            const productMap = new Map<string, any>();
            commerceProds.forEach((p: any) => {
              if (p && (p.id || p.sku)) productMap.set(p.id || p.sku, p);
            });
            layoutProds.forEach((p: any) => {
              if (p && (p.id || p.sku) && !productMap.has(p.id || p.sku)) {
                productMap.set(p.id || p.sku, p);
              }
            });
            const dbProducts = Array.from(productMap.values());

            if (Array.isArray(dbProducts)) {
              const resolveProductDate = (p: any) => {
                if (p.updatedAt && !isNaN(new Date(p.updatedAt).getTime())) return new Date(p.updatedAt).toISOString();
                if (p.updated_at && !isNaN(new Date(p.updated_at).getTime())) return new Date(p.updated_at).toISOString();
                if (p.createdAt && !isNaN(new Date(p.createdAt).getTime())) return new Date(p.createdAt).toISOString();
                if (p.created_at && !isNaN(new Date(p.created_at).getTime())) return new Date(p.created_at).toISOString();

                // If product ID contains creation timestamp (e.g. prod_1788944746539_vzn2), use it as upload date
                const match = typeof p.id === "string" ? p.id.match(/prod_(\d{10,15})/) : null;
                if (match) {
                  const ts = parseInt(match[1]);
                  const d = new Date(ts);
                  if (!isNaN(d.getTime())) return d.toISOString();
                }

                return new Date().toISOString();
              };

              const converted: Product[] = dbProducts.map((p: any) => {
                let userFormImg: string | undefined = undefined;
                if (typeof window !== "undefined" && p.id) {
                  try {
                    const rawForm = localStorage.getItem(`artrivo_vendor_product_form_${p.id}`);
                    if (rawForm) {
                      const parsedForm = JSON.parse(rawForm);
                      const primary = parsedForm.images?.find((img: any) => img.isPrimary)?.url;
                      const first = parsedForm.images?.[0]?.url;
                      if (isValidImageUrl(primary)) userFormImg = primary;
                      else if (isValidImageUrl(first)) userFormImg = first;
                    }
                  } catch {}
                }

                const cleanImg =
                  userFormImg ||
                  (isValidImageUrl(p.thumbnail) && p.thumbnail) ||
                  (isValidImageUrl(p.image) && p.image) ||
                  (Array.isArray(p.images) && p.images.find((img: string) => isValidImageUrl(img))) ||
                  getCategoryDefaultImage(p.category, p.name);
                const priceNum = typeof p.price === "number" ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0;
                const candidateImages =
                  Array.isArray(p.images) && p.images.length > 0
                    ? p.images.filter((img: string) => isValidImageUrl(img))
                    : [cleanImg];
                if (cleanImg && !candidateImages.includes(cleanImg)) {
                  candidateImages.unshift(cleanImg);
                }

                const itemUpdatedDate = resolveProductDate(p);

                return {
                  id: p.id,
                  storeId: effectiveStoreId || store.id,
                  name: p.name || p.title || "Untitled Product",
                  sku: p.sku || generateUniqueSku(p.name, p.category),
                  price: priceNum,
                  stock: p.stock !== undefined ? Number(p.stock) : 10,
                  category: p.category || p.tag || "Electronics",
                  brand: p.brand || "Altrivo Signature",
                  status: (p.status === "draft" ? "draft" : p.status === "out-of-stock" ? "out-of-stock" : "published") as ProductStatus,
                  thumbnail: cleanImg,
                  image: cleanImg,
                  images: candidateImages,
                  createdAt: p.createdAt || p.created_at || itemUpdatedDate,
                  updatedAt: itemUpdatedDate,
                  variantsCount: p.variantsCount || 0,
                  description: p.description || "",
                };
              });

              // Authoritative source of truth: the store's database products
              setProducts(converted);

              // Sync localStorage to match the authoritative database state for this store
              if (typeof window !== "undefined" && effectiveStoreId) {
                const key = getStorageKey(effectiveStoreId);
                safeLocalStorageSet(key, JSON.stringify(converted));
              }
            }
          }
        })
        .catch((err) => console.warn("[useProducts] Store DB sync note:", err));
    }

    const syncProducts = () => {
      const prods = getStoredProducts(effectiveStoreId);
      setProducts(effectiveStoreId ? prods.filter((p) => !p.storeId || p.storeId === effectiveStoreId) : prods);
    };

    window.addEventListener(PRODUCTS_UPDATED_EVENT, syncProducts);
    window.addEventListener("storage", syncProducts);
    return () => {
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, syncProducts);
      window.removeEventListener("storage", syncProducts);
    };
  }, [effectiveStoreId, activeStore?.slug, activeStore?.id]);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  );

  const filtered = useMemo(() => {
    let result = products;

    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q),
      );
    }

    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
    }

    if (filters.status) {
      result = result.filter((p) => p.status === filters.status);
    }

    result = [...result].sort((a, b) => {
      const field = filters.sortField;
      const dir = filters.sortDirection === "asc" ? 1 : -1;

      if (field === "name" || field === "category") {
        return a[field].localeCompare(b[field]) * dir;
      }
      if (field === "price" || field === "stock") {
        return (a[field] - b[field]) * dir;
      }
      if (field === "updatedAt") {
        return (
          (new Date(a.updatedAt).getTime() -
            new Date(b.updatedAt).getTime()) *
          dir
        );
      }
      return 0;
    });

    return result;
  }, [products, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  const updateFilter = useCallback(
    (key: keyof ProductFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
      setSelectedIds(new Set());
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      category: "",
      status: "",
      sortField: "updatedAt",
      sortDirection: "desc",
    });
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, []);

  const setSort = useCallback(
    (field: ProductSortField) => {
      setFilters((prev) => ({
        ...prev,
        sortField: field,
        sortDirection:
          prev.sortField === field && prev.sortDirection === "asc"
            ? "desc"
            : "asc",
      }));
    },
    [],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const pageIds = paginated.map((p) => p.id);
      const allSelected = pageIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(pageIds);
    });
  }, [paginated]);

  const selectAllFiltered = useCallback(() => {
    const allFilteredIds = filtered.map((p) => p.id);
    setSelectedIds(new Set(allFilteredIds));
  }, [filtered]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const deleteProduct = useCallback(
    (id: string) => {
      setProducts((prev) => {
        const next = prev.filter((p) => p.id !== id);
        saveStoredProducts(next, effectiveStoreId);
        return next;
      });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [effectiveStoreId],
  );

  const duplicateProduct = useCallback(
    (id: string) => {
      setProducts((prev) => {
        const index = prev.findIndex((p) => p.id === id);
        if (index === -1) return prev;
        const original = prev[index];
        const copy: Product = {
          ...original,
          id: `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: `${original.name} (Copy)`,
          sku: `${original.sku}-COPY`,
          storeId: effectiveStoreId || original.storeId,
          updatedAt: new Date().toISOString(),
        };
        const updated = [...prev];
        updated.splice(index + 1, 0, copy);
        saveStoredProducts(updated, effectiveStoreId);
        return updated;
      });
    },
    [effectiveStoreId],
  );

  const bulkDelete = useCallback(() => {
    setProducts((prev) => {
      const next = prev.filter((p) => !selectedIds.has(p.id));
      saveStoredProducts(next, effectiveStoreId);
      return next;
    });
    setSelectedIds(new Set());
  }, [selectedIds, effectiveStoreId]);

  const bulkChangeCategory = useCallback(
    (category: string) => {
      setProducts((prev) => {
        const next = prev.map((p) =>
          selectedIds.has(p.id) ? { ...p, category } : p,
        );
        saveStoredProducts(next, effectiveStoreId);
        return next;
      });
      setSelectedIds(new Set());
    },
    [selectedIds, effectiveStoreId],
  );

  const bulkChangeStatus = useCallback(
    (status: ProductStatus) => {
      const nowISO = new Date().toISOString();
      let nextProducts: Product[] = [];
      setProducts((prev) => {
        nextProducts = prev.map((p) =>
          selectedIds.has(p.id)
            ? {
                ...p,
                status,
                updatedAt: nowISO,
                stock:
                  status === "out-of-stock" ? 0 : p.stock === 0 ? 10 : p.stock,
              }
            : p,
        );
        return nextProducts;
      });
      setSelectedIds(new Set());

      saveStoredProducts(nextProducts, effectiveStoreId);

      const storeLookup = effectiveStoreId || activeStore?.slug || activeStore?.id;
      if (storeLookup) {
        const storefrontAll = nextProducts.map((p) => toStorefrontProduct(p));
        const publishedStorefront = nextProducts
          .filter((p) => p.status === "published")
          .map((p) => toStorefrontProduct(p));

        fetch(`/api/stores/${storeLookup}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commerce_config: { products: storefrontAll },
            layout_config: { products: publishedStorefront },
          }),
        }).catch((err) => console.warn("[useProducts] DB sync error:", err));
      }
    },
    [selectedIds, effectiveStoreId, activeStore?.slug, activeStore?.id],
  );

  const toggleProductStatus = useCallback(
    (id: string) => {
      let targetProduct: Product | undefined;
      const nowISO = new Date().toISOString();
      let nextProducts: Product[] = [];

      setProducts((prev) => {
        nextProducts = prev.map((p) => {
          if (p.id === id) {
            const nextStatus: ProductStatus = p.status === "published" ? "draft" : "published";
            targetProduct = { ...p, status: nextStatus, updatedAt: nowISO };
            return targetProduct;
          }
          return p;
        });
        return nextProducts;
      });

      // Persist to local storage immediately
      saveStoredProducts(nextProducts, effectiveStoreId);

      // Authoritative real-time sync with backend store
      const storeLookup = effectiveStoreId || activeStore?.slug || activeStore?.id;
      if (storeLookup && targetProduct) {
        const storefrontAll = nextProducts.map((p) => toStorefrontProduct(p));
        const publishedStorefront = nextProducts
          .filter((p) => p.status === "published")
          .map((p) => toStorefrontProduct(p));

        fetch(`/api/stores/${storeLookup}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commerce_config: { products: storefrontAll },
            layout_config: { products: publishedStorefront },
          }),
        }).catch((err) => console.warn("[useProducts] DB sync error:", err));
      }
    },
    [effectiveStoreId, activeStore?.slug, activeStore?.id],
  );

  const hasActiveFilters = Boolean(
    filters.search || filters.category || filters.status,
  );

  return {
    activeStore,
    effectiveStoreId,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    setSort,
    products: paginated,
    filteredCount: filtered.length,
    totalProductsCount: products.length,
    totalPages,
    currentPage: safePage,
    setCurrentPage,
    pageSize: PAGE_SIZE,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    selectAllFiltered,
    clearSelection,
    deleteProduct,
    duplicateProduct,
    bulkDelete,
    bulkChangeCategory,
    bulkChangeStatus,
    toggleProductStatus,
    categories,
  };
}
