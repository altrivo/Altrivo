"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useVendorStore } from "@/context/VendorStoreContext";

import {
  getStoredProducts,
  saveStoredProducts,
  resolveStoreId,
  PRODUCTS_UPDATED_EVENT,
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

  // Sync state with local storage on mount, on update events, and when active store changes
  useEffect(() => {
    setProducts(getStoredProducts(effectiveStoreId));
    setSelectedIds(new Set());
    setCurrentPage(1);

    const syncProducts = () => {
      setProducts(getStoredProducts(effectiveStoreId));
    };

    window.addEventListener(PRODUCTS_UPDATED_EVENT, syncProducts);
    window.addEventListener("storage", syncProducts);
    return () => {
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, syncProducts);
      window.removeEventListener("storage", syncProducts);
    };
  }, [effectiveStoreId]);

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
      setProducts((prev) => {
        const next = prev.map((p) =>
          selectedIds.has(p.id)
            ? {
                ...p,
                status,
                stock:
                  status === "out-of-stock" ? 0 : p.stock === 0 ? 10 : p.stock,
              }
            : p,
        );
        saveStoredProducts(next, effectiveStoreId);
        return next;
      });
      setSelectedIds(new Set());
    },
    [selectedIds, effectiveStoreId],
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
    categories,
  };
}
