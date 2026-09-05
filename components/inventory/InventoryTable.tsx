"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback } from "react";

import type {
  InventoryItem,
  EditableInventoryField,
  CellPosition,
} from "@/types/inventory";

import { InlineEditPopover } from "./InlineEditPopover";

interface ToastNotification {
  id: string;
  type: "success" | "error";
  message: string;
}

interface InventoryTableProps {
  initialItems: InventoryItem[];
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  onItemsChange?: (items: InventoryItem[]) => void;
}

const EDITABLE_FIELDS: EditableInventoryField[] = [
  "price",
  "stock",
  "lowStockThreshold",
];

export function InventoryTable({
  initialItems,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onItemsChange,
}: InventoryTableProps) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [activeCell, setActiveCell] = useState<CellPosition | null>(null);
  const [editPopover, setEditPopover] = useState<{
    open: boolean;
    item: InventoryItem;
    field: EditableInventoryField;
  } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const tableRef = useRef<HTMLTableElement>(null);

  // Sync state if props update
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const handleCellClick = (rowIndex: number, colKey: EditableInventoryField) => {
    setActiveCell({ rowIndex, colKey });
    const item = items[rowIndex];
    if (item) {
      setEditPopover({ open: true, item, field: colKey });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    // If popover is open, let popover handle keys
    if (editPopover?.open) return;

    if (!activeCell) {
      if (items.length > 0 && (e.key.startsWith("Arrow") || e.key === "Enter")) {
        setActiveCell({ rowIndex: 0, colKey: "price" });
      }
      return;
    }

    const { rowIndex, colKey } = activeCell;
    const colIndex = EDITABLE_FIELDS.indexOf(colKey);

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (rowIndex > 0) {
          setActiveCell({ rowIndex: rowIndex - 1, colKey });
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (rowIndex < items.length - 1) {
          setActiveCell({ rowIndex: rowIndex + 1, colKey });
        }
        break;

      case "ArrowLeft":
        e.preventDefault();
        if (colIndex > 0) {
          setActiveCell({ rowIndex, colKey: EDITABLE_FIELDS[colIndex - 1] });
        }
        break;

      case "ArrowRight":
        e.preventDefault();
        if (colIndex < EDITABLE_FIELDS.length - 1) {
          setActiveCell({ rowIndex, colKey: EDITABLE_FIELDS[colIndex + 1] });
        }
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        if (items[rowIndex]) {
          setEditPopover({
            open: true,
            item: items[rowIndex],
            field: colKey,
          });
        }
        break;

      case "Escape":
        e.preventDefault();
        setActiveCell(null);
        break;

      default:
        // Direct number key pressing opens edit
        if (/^[0-9.]$/.test(e.key) && items[rowIndex]) {
          setEditPopover({
            open: true,
            item: items[rowIndex],
            field: colKey,
          });
        }
        break;
    }
  };

  const handleSaveEdit = async (newValue: number, simulateError?: boolean) => {
    if (!editPopover) return;
    const { item, field } = editPopover;
    const previousValue = item[field];

    // Optimistic UI Update (<1ms visual state transition)
    const updatedItem: InventoryItem = {
      ...item,
      [field]: newValue,
      // Automatically adjust status if stock was changed
      status:
        field === "stock"
          ? newValue === 0
            ? "out-of-stock"
            : item.status === "out-of-stock"
            ? "published"
            : item.status
          : item.status,
      updatedAt: new Date().toISOString(),
    };

    setItems((prev) => {
      const next = prev.map((i) => (i.id === item.id ? updatedItem : i));
      onItemsChange?.(next);
      return next;
    });

    // Close pop-up immediately so vendor experiences zero lag
    setEditPopover(null);
    setIsSaving(true);

    const startTime = performance.now();

    try {
      // Call Products PATCH API
      const res = await fetch(`/api/products/${item.productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(simulateError ? { "x-simulate-error": "true" } : {}),
        },
        body: JSON.stringify({
          id: item.id,
          [field]: newValue,
          simulateError,
        }),
      });

      const data = await res.json();
      const elapsed = Math.round(performance.now() - startTime);

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Server update failed");
      }

      addToast(
        "success",
        `Saved ${item.sku} ${field} to ${
          field === "price" ? `$${newValue.toFixed(2)}` : newValue
        } (${elapsed}ms)`
      );
    } catch (err: unknown) {
      // Optimistic Rollback: restore previous state immediately
      setItems((prev) => {
        const next = prev.map((i) =>
          i.id === item.id ? { ...i, [field]: previousValue } : i
        );
        onItemsChange?.(next);
        return next;
      });

      const errorMessage = err instanceof Error ? err.message : "Error saving edit";
      addToast(
        "error",
        `[Optimistic Rollback] ${item.sku} ${field} restored to ${
          field === "price" ? `$${previousValue.toFixed(2)}` : previousValue
        }. (${errorMessage})`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl border text-sm font-medium transition-all duration-200 animate-in slide-in-from-top-2 ${
              t.type === "error"
                ? "bg-rose-950 text-rose-100 border-rose-800 shadow-rose-950/40"
                : "bg-emerald-950 text-emerald-100 border-emerald-800 shadow-emerald-950/40"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {t.type === "error" ? (
                <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <div className="flex-1">
                <p className="font-bold text-xs uppercase tracking-wider mb-0.5">
                  {t.type === "error" ? "Update Rolled Back" : "Update Saved"}
                </p>
                <p className="text-xs leading-relaxed">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Spreadsheet Table Instructions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono border border-slate-800 shadow-inner">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-indigo-400 font-bold uppercase tracking-wider">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Spreadsheet Shortcuts
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">↑</kbd>{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">↓</kbd>{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">←</kbd>{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">→</kbd> Navigate Cells
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">Enter</kbd> Edit Cell
          </span>
        </div>
        <div className="text-slate-400">
          Click any Price, Stock, or Threshold cell to open instant inline edit.
        </div>
      </div>

      {/* Main Dense Spreadsheet Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <table
          ref={tableRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="w-full text-left text-xs border-collapse focus:outline-none focus:ring-1 focus:ring-indigo-500"
          aria-label="Inventory Table"
        >
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={items.length > 0 && items.every((i) => selectedIds?.has(i.id))}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  aria-label="Select all items"
                />
              </th>
              <th className="py-3 px-3 w-12 text-center">Image</th>
              <th className="py-3 px-4">Item & Variant Name</th>
              <th className="py-3 px-4 w-36">SKU</th>
              <th className="py-3 px-4 w-32 text-right bg-indigo-50/30 dark:bg-indigo-950/20">
                Price ($) ✎
              </th>
              <th className="py-3 px-4 w-32 text-right bg-indigo-50/30 dark:bg-indigo-950/20">
                Stock Qty ✎
              </th>
              <th className="py-3 px-4 w-36 text-right bg-indigo-50/30 dark:bg-indigo-950/20">
                Low Threshold ✎
              </th>
              <th className="py-3 px-4 w-32 text-center">Status</th>
              <th className="py-3 px-3 w-20 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
            {items.map((item, rowIndex) => {
              const isLowStock = item.stock <= item.lowStockThreshold && item.stock > 0;
              const isOutOfStock = item.stock === 0;

              return (
                <tr
                  key={item.id}
                  className={`group transition-colors ${
                    selectedIds?.has(item.id)
                      ? "bg-indigo-50/70 dark:bg-indigo-950/30"
                      : isOutOfStock
                      ? "bg-rose-50/40 dark:bg-rose-950/10 hover:bg-rose-100/50"
                      : isLowStock
                      ? "bg-amber-50/40 dark:bg-amber-950/10 hover:bg-amber-100/50"
                      : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {/* Select Checkbox Column */}
                  <td className="py-2 px-3 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds?.has(item.id) || false}
                      onChange={() => onToggleSelect?.(item.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      aria-label={`Select ${item.name}`}
                    />
                  </td>

                  {/* Image Column */}
                  <td className="py-2 px-3 text-center align-middle">
                    <div className="relative w-9 h-9 mx-auto rounded-md overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      <img
                        src={item.thumbnail || "https://images.unsplash.com/photo-1596568359553-a56de6970068?w=120&auto=format&fit=crop&q=80"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1596568359553-a56de6970068?w=120&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>
                  </td>

                  {/* Item / Variant Name */}
                  <td className="py-2.5 px-4 align-middle">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.category}
                      </span>
                      {item.isVariant && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded font-medium">
                          Variant
                        </span>
                      )}
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400 align-middle">
                    {item.sku}
                  </td>

                  {/* PRICE (Editable Cell 0) */}
                  {(() => {
                    const isFocused =
                      activeCell?.rowIndex === rowIndex &&
                      activeCell?.colKey === "price";
                    return (
                      <td
                        onClick={() => handleCellClick(rowIndex, "price")}
                        className={`py-2.5 px-4 text-right font-mono text-sm font-semibold cursor-pointer align-middle transition-all relative ${
                          isFocused
                            ? "bg-indigo-100/80 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-500 rounded-sm"
                            : "text-slate-900 dark:text-slate-100 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30"
                        }`}
                      >
                        ${item.price.toFixed(2)}
                      </td>
                    );
                  })()}

                  {/* STOCK (Editable Cell 1) */}
                  {(() => {
                    const isFocused =
                      activeCell?.rowIndex === rowIndex &&
                      activeCell?.colKey === "stock";
                    return (
                      <td
                        onClick={() => handleCellClick(rowIndex, "stock")}
                        className={`py-2.5 px-4 text-right font-mono text-sm font-semibold cursor-pointer align-middle transition-all relative ${
                          isFocused
                            ? "bg-indigo-100/80 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-500 rounded-sm"
                            : isOutOfStock
                            ? "text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100/60"
                            : isLowStock
                            ? "text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-100/60"
                            : "text-slate-900 dark:text-slate-100 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30"
                        }`}
                      >
                        {item.stock.toLocaleString()}
                      </td>
                    );
                  })()}

                  {/* LOW-STOCK THRESHOLD (Editable Cell 2) */}
                  {(() => {
                    const isFocused =
                      activeCell?.rowIndex === rowIndex &&
                      activeCell?.colKey === "lowStockThreshold";
                    return (
                      <td
                        onClick={() => handleCellClick(rowIndex, "lowStockThreshold")}
                        className={`py-2.5 px-4 text-right font-mono text-xs cursor-pointer align-middle transition-all relative ${
                          isFocused
                            ? "bg-indigo-100/80 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-500 rounded-sm"
                            : "text-slate-500 dark:text-slate-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30"
                        }`}
                      >
                        {item.lowStockThreshold}
                      </td>
                    );
                  })()}

                  {/* STATUS BADGE */}
                  <td className="py-2.5 px-4 text-center align-middle">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        In Stock
                      </span>
                    )}
                  </td>

                  {/* ACTION */}
                  <td className="py-2.5 px-3 text-center align-middle">
                    <button
                      type="button"
                      onClick={() => handleCellClick(rowIndex, "stock")}
                      className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                      title="Edit Item"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Popover Edit Overlay */}
      {editPopover && (
        <InlineEditPopover
          open={editPopover.open}
          item={editPopover.item}
          field={editPopover.field}
          onSave={handleSaveEdit}
          onCancel={() => setEditPopover(null)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
