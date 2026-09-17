"use client";

import { useState, useMemo, useCallback, useEffect } from "react";

import { BulkActionsBar } from "@/components/inventory/BulkActionsBar";
import { BulkEditModal } from "@/components/inventory/BulkEditModal";
import { CsvImportModal } from "@/components/inventory/CsvImportModal";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { getStoredInventory, generateMockInventory, initialInventoryData } from "@/lib/mock-inventory";
import { PRODUCTS_UPDATED_EVENT } from "@/lib/product-storage";
import { useVendorStore } from "@/context/VendorStoreContext";
import type { InventoryItem } from "@/types/inventory";
import type { ProductStatus } from "@/types/product";
import { exportInventoryToCSV } from "@/utils/csv-inventory";

interface NotificationBanner {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export default function InventoryPage() {
  const { activeStoreId, activeStore } = useVendorStore();
  const effectiveStoreId = activeStoreId || activeStore?.id || undefined;

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sync state with stored inventory on mount and database updates
  useEffect(() => {
    setItems(getStoredInventory(effectiveStoreId));

    const syncInventory = () => {
      setItems(getStoredInventory(effectiveStoreId));
    };

    window.addEventListener(PRODUCTS_UPDATED_EVENT, syncInventory);
    window.addEventListener("storage", syncInventory);

    // Fetch database products from store endpoint
    const lookup = effectiveStoreId || activeStore?.slug || activeStore?.id;
    if (lookup && typeof fetch === "function") {
      fetch(`/api/stores/${lookup}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const store = data?.store;
          if (store) {
            const commerceProds = Array.isArray(store.commerce_config?.products)
              ? store.commerce_config.products
              : [];
            const layoutProds = Array.isArray(store.layout_config?.products)
              ? store.layout_config.products
              : [];
            const pMap = new Map<string, any>();
            commerceProds.forEach((p: any) => {
              if (p && (p.id || p.sku || p.name || p.title)) pMap.set(p.id || p.sku || p.name || p.title, p);
            });
            layoutProds.forEach((p: any) => {
              const k = p?.id || p?.sku || p?.name || p?.title;
              if (p && k && !pMap.has(k)) pMap.set(k, p);
            });
            const dbProducts = Array.from(pMap.values());
            if (dbProducts.length > 0) {
              const mapped = generateMockInventory(dbProducts, effectiveStoreId);
              setItems(mapped);
            }
          }
        })
        .catch((e) => console.warn("[Inventory] Store fetch note:", e));
    }

    return () => {
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, syncInventory);
      window.removeEventListener("storage", syncInventory);
    };
  }, [effectiveStoreId, activeStore?.slug, activeStore?.id]);

  // Modals state
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [bulkEditModal, setBulkEditModal] = useState<{
    open: boolean;
    mode: "price" | "stock" | "threshold";
  } | null>(null);

  // Notification banners
  const [notifications, setNotifications] = useState<NotificationBanner[]>([]);

  const addNotification = useCallback((type: "success" | "error" | "info", message: string) => {
    const id = `notif_${Date.now()}_${Math.random()}`;
    setNotifications((prev) => [...prev.slice(-3), { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category))).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search term
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchSku = item.sku.toLowerCase().includes(q);
        if (!matchName && !matchSku) return false;
      }

      // Status filter
      if (statusFilter === "low-stock") {
        if (!(item.stock <= item.lowStockThreshold && item.stock > 0)) return false;
      } else if (statusFilter === "out-of-stock") {
        if (item.stock !== 0) return false;
      } else if (statusFilter === "in-stock") {
        if (item.stock <= item.lowStockThreshold) return false;
      }

      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [items, search, statusFilter, categoryFilter]);

  // Statistics
  const totalCount = items.length;
  const lowStockCount = items.filter(
    (i) => i.stock <= i.lowStockThreshold && i.stock > 0
  ).length;
  const outOfStockCount = items.filter((i) => i.stock === 0).length;
  const totalValuation = items.reduce(
    (acc, i) => acc + i.price * i.stock,
    0
  );

  // Selection handlers
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAllOnPage = useCallback(() => {
    setSelectedIds((prev) => {
      const pageIds = filteredItems.map((i) => i.id);
      const allSelected = pageIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(pageIds);
    });
  }, [filteredItems]);

  const handleSelectAllFiltered = useCallback(() => {
    setSelectedIds(new Set(filteredItems.map((i) => i.id)));
  }, [filteredItems]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Bulk Operations
  const handleBulkEditApply = async (
    mode: "price" | "stock" | "threshold",
    adjustmentType: string,
    val: number
  ) => {
    const idsArray = Array.from(selectedIds);
    if (idsArray.length === 0) return;

    const previousItems = [...items];

    // Compute updated items optimistically
    const nextItems = items.map((item) => {
      if (!selectedIds.has(item.id)) return item;

      let newPrice = item.price;
      let newStock = item.stock;
      let newThreshold = item.lowStockThreshold;

      if (mode === "price") {
        if (adjustmentType === "set-fixed") newPrice = val;
        else if (adjustmentType === "pct-increase") newPrice = item.price * (1 + val / 100);
        else if (adjustmentType === "pct-decrease") newPrice = Math.max(0, item.price * (1 - val / 100));
        else if (adjustmentType === "add-fixed") newPrice = item.price + val;
        else if (adjustmentType === "sub-fixed") newPrice = Math.max(0, item.price - val);
        newPrice = Math.round(newPrice * 100) / 100;
      } else if (mode === "stock") {
        if (adjustmentType === "set-fixed") newStock = val;
        else if (adjustmentType === "add-stock") newStock = item.stock + val;
        else if (adjustmentType === "sub-stock") newStock = Math.max(0, item.stock - val);
        else if (adjustmentType === "set-zero") newStock = 0;
        newStock = Math.max(0, Math.round(newStock));
      } else if (mode === "threshold") {
        newThreshold = Math.max(0, Math.round(val));
      }

      const newStatus: ProductStatus =
        newStock === 0 ? "out-of-stock" : item.status === "out-of-stock" ? "published" : item.status;

      return {
        ...item,
        price: newPrice,
        stock: newStock,
        lowStockThreshold: newThreshold,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
    });

    setItems(nextItems);

    try {
      const res = await fetch("/api/inventory/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-edit",
          itemIds: idsArray,
          updates: { mode, adjustmentType, val },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Bulk update failed");

      addNotification(
        "success",
        `Updated ${idsArray.length.toLocaleString()} items (${mode} adjusted successfully).`
      );
    } catch (err: unknown) {
      setItems(previousItems); // Rollback
      const msg = err instanceof Error ? err.message : "Error executing bulk edit";
      addNotification("error", `[Rollback] Failed bulk update: ${msg}`);
    }
  };

  const handleBulkStatusChange = async (status: ProductStatus) => {
    const idsArray = Array.from(selectedIds);
    if (idsArray.length === 0) return;

    const previousItems = [...items];
    const nextItems = items.map((i) =>
      selectedIds.has(i.id)
        ? {
            ...i,
            status,
            stock: status === "out-of-stock" ? 0 : i.stock === 0 ? 10 : i.stock,
            updatedAt: new Date().toISOString(),
          }
        : i
    );

    setItems(nextItems);

    try {
      const res = await fetch("/api/inventory/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-edit",
          itemIds: idsArray,
          updates: { status },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Bulk status change failed");

      addNotification("success", `Marked ${idsArray.length} items as '${status}'.`);
    } catch (err: unknown) {
      setItems(previousItems);
      const msg = err instanceof Error ? err.message : "Status update error";
      addNotification("error", `[Rollback] Failed to change status: ${msg}`);
    }
  };

  const handleBulkDelete = async () => {
    const idsArray = Array.from(selectedIds);
    if (idsArray.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${idsArray.length} selected items?`)) return;

    const previousItems = [...items];
    const nextItems = items.filter((i) => !selectedIds.has(i.id));

    setItems(nextItems);
    setSelectedIds(new Set());

    try {
      const res = await fetch("/api/inventory/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-delete",
          itemIds: idsArray,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Bulk delete failed");

      addNotification("success", `Deleted ${idsArray.length} items from inventory.`);
    } catch (err: unknown) {
      setItems(previousItems);
      const msg = err instanceof Error ? err.message : "Delete error";
      addNotification("error", `[Rollback] Failed bulk delete: ${msg}`);
    }
  };

  const handleBulkExportSelected = () => {
    const selectedItems = items.filter((i) => selectedIds.has(i.id));
    if (selectedItems.length === 0) return;
    exportInventoryToCSV(selectedItems, `selected_inventory_${selectedItems.length}_items.csv`);
    addNotification("success", `Exported ${selectedItems.length} selected items to CSV.`);
  };

  const handleExportFiltered = () => {
    exportInventoryToCSV(filteredItems, `inventory_export_${filteredItems.length}_items.csv`);
    addNotification("success", `Exported all ${filteredItems.length.toLocaleString()} filtered items to CSV.`);
  };

  const handleConfirmImport = async (validItems: InventoryItem[]) => {
    if (validItems.length === 0) return;

    // Merge imported items with existing catalog
    const nextItems = [...validItems, ...items];
    setItems(nextItems);

    try {
      const res = await fetch("/api/inventory/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-import",
          items: validItems,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Bulk import failed");

      addNotification(
        "success",
        `Successfully imported ${validItems.length.toLocaleString()} inventory items!`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Import error";
      addNotification("error", `Import server sync notice: ${msg}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Banner Notifications */}
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-sm animate-in slide-in-from-top-1 ${
                n.type === "error"
                  ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-900"
                  : n.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900"
                  : "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-900"
              }`}
            >
              <span>{n.message}</span>
              <button
                type="button"
                onClick={() => setNotifications((prev) => prev.filter((x) => x.id !== n.id))}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white ml-4 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Smart Inventory Management
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Optimistic UI (&lt;500ms updates)
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Dense spreadsheet view for rapid stock, price, and threshold adjustments with CSV Import/Export &amp; Batch Actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* CSV Import Button */}
            <button
              type="button"
              onClick={() => setCsvImportOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import from CSV
            </button>

            {/* CSV Export Button */}
            <button
              type="button"
              onClick={handleExportFiltered}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to CSV ({filteredItems.length.toLocaleString()})
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Items &amp; Variants
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {totalCount.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Showing {filteredItems.length.toLocaleString()} matching filters
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 shadow-sm">
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span>Low-Stock Alert</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-300 font-mono">
              {lowStockCount.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">
              Stock ≤ low-stock threshold
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 shadow-sm">
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center justify-between">
              <span>Out of Stock</span>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-700 dark:text-rose-300 font-mono">
              {outOfStockCount.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-rose-600/80 dark:text-rose-400/80">
              Requires urgent restock
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Inventory Valuation
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ${totalValuation.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Price × Stock Qty
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="low-stock">Low Stock (≤ Threshold)</option>
              <option value="out-of-stock">Out of Stock (0)</option>
              <option value="in-stock">In Stock (&gt; Threshold)</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {(search || statusFilter !== "all" || categoryFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="px-2.5 py-2 text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Floating Bulk Actions Bar (Appears when items are selected) */}
        <BulkActionsBar
          selectedCount={selectedIds.size}
          totalFilteredCount={filteredItems.length}
          onSelectAllFiltered={handleSelectAllFiltered}
          onClearSelection={handleClearSelection}
          onOpenBulkPrice={() => setBulkEditModal({ open: true, mode: "price" })}
          onOpenBulkStock={() => setBulkEditModal({ open: true, mode: "stock" })}
          onOpenBulkThreshold={() => setBulkEditModal({ open: true, mode: "threshold" })}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkExport={handleBulkExportSelected}
          onBulkDelete={handleBulkDelete}
        />

        {/* Dense Spreadsheet Table */}
        <InventoryTable
          initialItems={filteredItems}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAllOnPage}
          onItemsChange={(updated) => setItems(updated)}
        />
      </div>

      {/* CSV Import Modal */}
      <CsvImportModal
        open={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onConfirmImport={handleConfirmImport}
      />

      {/* Bulk Edit Modal */}
      {bulkEditModal && (
        <BulkEditModal
          open={bulkEditModal.open}
          mode={bulkEditModal.mode}
          selectedCount={selectedIds.size}
          onClose={() => setBulkEditModal(null)}
          onApply={handleBulkEditApply}
        />
      )}
    </div>
  );
}
