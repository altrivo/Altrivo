"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, Check, AlertTriangle } from "lucide-react";

import type { InventoryItem } from "@/types/inventory";
import {
  parseAndValidateInventoryCSV,
  generateSampleInventoryCsv,
  type CsvParseResult,
} from "@/utils/csv-inventory";

interface CsvImportModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmImport: (validItems: InventoryItem[]) => void;
}

export function CsvImportModal({ open, onClose, onConfirmImport }: CsvImportModalProps) {
  const [csvText, setCsvText] = useState<string>("");
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "errors" | "valid">("all");
  const [skipInvalid, setSkipInvalid] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      const res = parseAndValidateInventoryCSV(text);
      setParseResult(res);
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    const sample = generateSampleInventoryCsv();
    setCsvText(sample);
    const res = parseAndValidateInventoryCSV(sample);
    setParseResult(res);
  };

  const handleParseText = () => {
    if (!csvText.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      const res = parseAndValidateInventoryCSV(csvText);
      setParseResult(res);
      setIsProcessing(false);
    }, 20);
  };

  const handleRowEdit = (rowIndex: number, field: string, val: string) => {
    if (!parseResult) return;

    const updatedRows = parseResult.rows.map((row) => {
      if (row.rowIndex !== rowIndex) return row;

      const newRaw = { ...row.raw, [field]: val };
      // Re-validate single row text representation
      const lineText = `${newRaw.sku},${newRaw.name},${newRaw.category},${newRaw.price},${newRaw.stock},${newRaw.threshold},${newRaw.status}`;
      const headerText = "SKU,Name,Category,Price,Stock,LowStockThreshold,Status";
      const singleRes = parseAndValidateInventoryCSV(`${headerText}\n${lineText}`);

      if (singleRes.rows.length > 0) {
        return {
          ...singleRes.rows[0],
          rowIndex,
        };
      }
      return row;
    });

    const validCount = updatedRows.filter((r) => r.isValid).length;
    const errorCount = updatedRows.length - validCount;

    setParseResult({
      ...parseResult,
      rows: updatedRows,
      validCount,
      errorCount,
    });
  };

  const handleConfirm = () => {
    if (!parseResult) return;

    const rowsToImport = skipInvalid
      ? parseResult.rows.filter((r) => r.isValid)
      : parseResult.rows;

    const items: InventoryItem[] = rowsToImport
      .map((r) => r.parsed)
      .filter((p): p is InventoryItem => Boolean(p));

    onConfirmImport(items);
    onClose();
  };

  const filteredRows = (parseResult?.rows || []).filter((r) => {
    if (filterMode === "errors") return !r.isValid;
    if (filterMode === "valid") return r.isValid;
    return true;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Bulk Data Import
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Import Inventory from CSV
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Upload or Paste CSV */}
          {!parseResult && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <svg
                  className="w-12 h-12 mx-auto text-indigo-500 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Click to upload CSV file or drag and drop
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports up to 5,000 rows (SKU, Name, Price, Stock, LowStockThreshold, Status)
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    Select File
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Load Sample CSV
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Or Paste Raw CSV Data:
                </label>
                <textarea
                  rows={5}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="SKU,Name,Category,Price,Stock,LowStockThreshold,Status..."
                  className="w-full font-mono text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleParseText}
                  disabled={!csvText.trim() || isProcessing}
                  className="mt-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 disabled:opacity-50"
                >
                  {isProcessing ? "Validating CSV..." : "Parse & Preview CSV"}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Validation Preview Table */}
          {parseResult && (
            <div className="space-y-4">
              {/* Performance & Validation Header */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Rows Parsed</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {parseResult.totalRows.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">Parsed in {parseResult.parseTimeMs}ms</div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
                    Valid Rows
                  </div>
                  <div className="text-xl font-bold text-emerald-800 dark:text-emerald-300 font-mono mt-0.5">
                    {parseResult.validCount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-600">Ready for import</div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                  <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase">
                    Validation Errors
                  </div>
                  <div className="text-xl font-bold text-rose-800 dark:text-rose-300 font-mono mt-0.5">
                    {parseResult.errorCount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-rose-600">Requires correction</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                  <button
                    type="button"
                    onClick={() => setParseResult(null)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-semibold inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Re-upload / Change File</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFilterMode("all")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      filterMode === "all"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    All Rows ({parseResult.totalRows})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode("errors")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      filterMode === "errors"
                        ? "bg-white dark:bg-slate-900 text-rose-600 shadow-sm"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Errors Only ({parseResult.errorCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode("valid")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      filterMode === "valid"
                        ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Valid Only ({parseResult.validCount})
                  </button>
                </div>

                <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={skipInvalid}
                    onChange={(e) => setSkipInvalid(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Skip invalid rows during import</span>
                </label>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 font-semibold text-slate-600 dark:text-slate-300">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2.5 px-3 w-12 text-center">Row</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3 text-right">Price ($)</th>
                      <th className="py-2.5 px-3 text-right">Stock</th>
                      <th className="py-2.5 px-3">Validation Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                    {filteredRows.slice(0, 100).map((r) => (
                      <tr
                        key={r.rowIndex}
                        className={
                          !r.isValid
                            ? "bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/50"
                            : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        }
                      >
                        <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-400">
                          #{r.rowIndex}
                        </td>
                        <td className="py-2 px-3">
                          {r.isValid ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <Check size={12} className="mr-1" />
                              <span>Valid</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                              <AlertTriangle size={12} className="mr-1" />
                              <span>Error</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono">
                          <input
                            type="text"
                            value={r.raw.sku}
                            onChange={(e) => handleRowEdit(r.rowIndex, "sku", e.target.value)}
                            className="w-28 px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono bg-transparent focus:bg-white dark:focus:bg-slate-800"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={r.raw.name}
                            onChange={(e) => handleRowEdit(r.rowIndex, "name", e.target.value)}
                            className="w-48 px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-xs bg-transparent focus:bg-white dark:focus:bg-slate-800"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="text"
                            value={r.raw.price}
                            onChange={(e) => handleRowEdit(r.rowIndex, "price", e.target.value)}
                            className="w-20 px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-xs text-right font-mono bg-transparent focus:bg-white dark:focus:bg-slate-800"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="text"
                            value={r.raw.stock}
                            onChange={(e) => handleRowEdit(r.rowIndex, "stock", e.target.value)}
                            className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-xs text-right font-mono bg-transparent focus:bg-white dark:focus:bg-slate-800"
                          />
                        </td>
                        <td className="py-2 px-3">
                          {r.errors.length > 0 ? (
                            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                              {r.errors.join("; ")}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">No issues</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRows.length > 100 && (
                  <div className="p-2 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800">
                    Showing first 100 preview rows (Total: {filteredRows.length.toLocaleString()})
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="text-xs text-slate-500">
            {parseResult ? (
              <span>
                Ready to import{" "}
                <strong className="text-slate-900 dark:text-white font-mono">
                  {(skipInvalid ? parseResult.validCount : parseResult.totalRows).toLocaleString()}
                </strong>{" "}
                rows
              </span>
            ) : (
              "Upload a file or load sample CSV to begin validation"
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!parseResult || (skipInvalid && parseResult.validCount === 0)}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all shadow-sm"
            >
              Confirm &amp; Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
