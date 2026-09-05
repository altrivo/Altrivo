"use client";

import React, { useState, useEffect, useRef } from "react";

import type { InventoryItem, EditableInventoryField } from "@/types/inventory";

interface InlineEditPopoverProps {
  open: boolean;
  item: InventoryItem;
  field: EditableInventoryField;
  onSave: (newValue: number, simulateError?: boolean) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function InlineEditPopover({
  open,
  item,
  field,
  onSave,
  onCancel,
  isSaving = false,
}: InlineEditPopoverProps) {
  const [val, setVal] = useState<string>("");
  const [simulateError, setSimulateError] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setVal(String(item[field]));
      setSimulateError(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 30);
    }
  }, [open, item, field]);

  if (!open) return null;

  const getFieldTitle = () => {
    switch (field) {
      case "price":
        return "Edit Price ($)";
      case "stock":
        return "Edit Stock (Units)";
      case "lowStockThreshold":
        return "Low-Stock Threshold";
      default:
        return "Edit Value";
    }
  };

  const handleQuickAdjust = (deltaOrVal: number, isAbsolute = false) => {
    const current = parseFloat(val) || 0;
    let nextVal: number;

    if (isAbsolute) {
      nextVal = deltaOrVal;
    } else if (field === "price") {
      nextVal = Math.max(0, Math.round((current + deltaOrVal) * 100) / 100);
    } else {
      nextVal = Math.max(0, current + deltaOrVal);
    }

    setVal(String(nextVal));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) {
      return;
    }
    onSave(num, simulateError);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="popover-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Inline Edit
            </span>
            <h3 id="popover-title" className="text-base font-bold text-slate-900 dark:text-white">
              {getFieldTitle()}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
            aria-label="Close pop-up"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="py-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
            <span className="ml-2 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              {item.sku}
            </span>
          </div>

          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            New {field === "price" ? "Price ($)" : field === "stock" ? "Stock Quantity" : "Threshold"}
          </label>
          <div className="relative">
            {field === "price" && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                $
              </span>
            )}
            <input
              ref={inputRef}
              type="number"
              step={field === "price" ? "0.01" : "1"}
              min="0"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className={`w-full font-mono font-medium rounded-lg border border-slate-300 dark:border-slate-700 py-2 ${
                field === "price" ? "pl-7 pr-3" : "px-3"
              } text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              placeholder="Enter value..."
            />
          </div>

          {/* Quick presets */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Quick:</span>
            {field === "stock" && (
              <>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(5)}
                  className="px-2 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(10)}
                  className="px-2 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(-5)}
                  className="px-2 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(0, true)}
                  className="px-2 py-1 text-xs font-medium rounded bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-400 transition-colors"
                >
                  Out of Stock (0)
                </button>
              </>
            )}
            {field === "price" && (
              <>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(5)}
                  className="px-2 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  +$5
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(-5)}
                  className="px-2 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  -$5
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(val) || 0;
                    setVal(String(Math.max(0, Math.round((current * 1.1) * 100) / 100)));
                  }}
                  className="px-2 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  +10%
                </button>
              </>
            )}
            {field === "lowStockThreshold" && (
              <>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(5, true)}
                  className="px-2 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  5
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(10, true)}
                  className="px-2 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  10
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(20, true)}
                  className="px-2 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  20
                </button>
              </>
            )}
          </div>

          {/* Test Option for Optimistic Rollback */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <label className="flex items-center space-x-2 text-xs text-amber-700 dark:text-amber-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={simulateError}
                onChange={(e) => setSimulateError(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Simulate Server Error (Test Rollback)</span>
            </label>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded font-mono text-[10px]">Enter</kbd> save · <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded font-mono text-[10px]">Esc</kbd> cancel
          </span>
          <div className="flex items-center space-x-2 ml-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSaving}
              className="px-4 py-1.5 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
