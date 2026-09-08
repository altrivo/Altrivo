"use client";

import React, { useState } from "react";
import { Check, Circle, AlertTriangle } from "lucide-react";

import type { ProductStatus } from "@/types/product";

interface BulkActionsBarProps {
  selectedCount: number;
  totalFilteredCount: number;
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
  onOpenBulkPrice: () => void;
  onOpenBulkStock: () => void;
  onOpenBulkThreshold: () => void;
  onBulkStatusChange: (status: ProductStatus) => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
}

export function BulkActionsBar({
  selectedCount,
  totalFilteredCount,
  onSelectAllFiltered,
  onClearSelection,
  onOpenBulkPrice,
  onOpenBulkStock,
  onOpenBulkThreshold,
  onBulkStatusChange,
  onBulkExport,
  onBulkDelete,
}: BulkActionsBarProps) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
      {/* Left: Selection Counter & Selection Helpers */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {selectedCount.toLocaleString()} item{selectedCount > 1 ? "s" : ""} selected
        </span>

        {selectedCount < totalFilteredCount && (
          <button
            type="button"
            onClick={onSelectAllFiltered}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
          >
            Select all {totalFilteredCount.toLocaleString()} filtered items
          </button>
        )}

        <button
          type="button"
          onClick={onClearSelection}
          className="text-xs text-slate-400 hover:text-white"
        >
          Clear Selection
        </button>
      </div>

      {/* Right: Bulk Operations */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Bulk Price */}
        <button
          type="button"
          onClick={onOpenBulkPrice}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Bulk Edit Price
        </button>

        {/* Bulk Stock */}
        <button
          type="button"
          onClick={onOpenBulkStock}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Bulk Edit Stock
        </button>

        {/* Bulk Threshold */}
        <button
          type="button"
          onClick={onOpenBulkThreshold}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors hidden sm:flex items-center gap-1"
        >
          Threshold
        </button>

        {/* Bulk Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setStatusMenuOpen(!statusMenuOpen)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
          >
            <span>Change Status</span>
            <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {statusMenuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-20">
              <button
                type="button"
                onClick={() => {
                  onBulkStatusChange("published");
                  setStatusMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-emerald-400 hover:bg-slate-700 flex items-center gap-2"
              >
                <Check size={14} />
                <span>Mark Published</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onBulkStatusChange("draft");
                  setStatusMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 flex items-center gap-2"
              >
                <Circle size={8} className="fill-slate-400 text-slate-400" />
                <span>Mark Draft</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onBulkStatusChange("out-of-stock");
                  setStatusMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-slate-700 flex items-center gap-2"
              >
                <AlertTriangle size={14} />
                <span>Disable / Out of Stock</span>
              </button>
            </div>
          )}
        </div>

        {/* Bulk Export */}
        <button
          type="button"
          onClick={onBulkExport}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>

        {/* Bulk Delete */}
        <button
          type="button"
          onClick={onBulkDelete}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-colors flex items-center gap-1"
        >
          Delete ({selectedCount})
        </button>
      </div>
    </div>
  );
}
