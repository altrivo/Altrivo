"use client";

import React, { useState } from "react";

interface BulkEditModalProps {
  open: boolean;
  mode: "price" | "stock" | "threshold";
  selectedCount: number;
  onClose: () => void;
  onApply: (mode: "price" | "stock" | "threshold", adjustmentType: string, value: number) => void;
}

export function BulkEditModal({
  open,
  mode,
  selectedCount,
  onClose,
  onApply,
}: BulkEditModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<string>(
    mode === "price" ? "set-fixed" : "set-fixed"
  );
  const [value, setValue] = useState<string>("0");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(value);
    if (isNaN(num)) return;
    onApply(mode, adjustmentType, num);
    onClose();
  };

  const getTitle = () => {
    switch (mode) {
      case "price":
        return "Bulk Edit Price";
      case "stock":
        return "Bulk Edit Stock";
      case "threshold":
        return "Bulk Set Low-Stock Threshold";
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Batch Update
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {getTitle()}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            This change will be applied to <strong>{selectedCount} selected items</strong>.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Adjustment Mode:
            </label>
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {mode === "price" && (
                <>
                  <option value="set-fixed">Set specific price ($)</option>
                  <option value="pct-increase">Increase by percentage (+%)</option>
                  <option value="pct-decrease">Decrease by percentage (-%)</option>
                  <option value="add-fixed">Add fixed amount (+$)</option>
                  <option value="sub-fixed">Subtract fixed amount (-$)</option>
                </>
              )}
              {mode === "stock" && (
                <>
                  <option value="set-fixed">Set specific stock quantity</option>
                  <option value="add-stock">Add stock (+ units)</option>
                  <option value="sub-stock">Subtract stock (- units)</option>
                  <option value="set-zero">Mark as Out of Stock (0 units)</option>
                </>
              )}
              {mode === "threshold" && (
                <option value="set-fixed">Set low-stock threshold</option>
              )}
            </select>
          </div>

          {adjustmentType !== "set-zero" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Value:
              </label>
              <input
                type="number"
                step={mode === "price" || adjustmentType.startsWith("pct") ? "0.01" : "1"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full font-mono text-sm p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              Apply to {selectedCount} Items
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
