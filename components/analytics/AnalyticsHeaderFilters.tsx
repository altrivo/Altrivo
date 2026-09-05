"use client";

import React, { useState } from "react";
import { Calendar, Download, RefreshCw, X } from "lucide-react";

interface AnalyticsHeaderFiltersProps {
  activeRange?: string;
  currentRange?: string;
  onRangeChange: (range: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export function AnalyticsHeaderFilters({
  activeRange,
  currentRange,
  onRangeChange,
  onRefresh,
  loading = false,
}: AnalyticsHeaderFiltersProps) {
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-07");

  const effectiveRange = activeRange || currentRange || "7d";

  const ranges = [
    { key: "today", label: "Today" },
    { key: "7d", label: "Last 7 Days" },
    { key: "30d", label: "Last 30 Days" },
    { key: "90d", label: "Last 90 Days" },
    { key: "custom", label: "Custom Range" },
  ];

  const handleSelectRange = (key: string) => {
    if (key === "custom") {
      setCustomModalOpen(true);
    } else {
      onRangeChange(key);
    }
  };

  const handleApplyCustomDate = (e: React.FormEvent) => {
    e.preventDefault();
    onRangeChange("custom");
    setCustomModalOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-default pb-5">
      <div>
        <h1 className="text-2xl font-bold font-display text-heading">
          Store Analytics & Intelligence
        </h1>
        <p className="text-xs text-subtle mt-0.5">
          Real-time traffic performance, geographical concentration, and sales funnel analysis
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Date Range Selector Pill */}
        <div className="flex items-center p-1 rounded-xl bg-muted border border-default text-xs font-semibold text-subtle shadow-xs">
          {ranges.map((r) => {
            const isActive = effectiveRange === r.key;
            return (
              <button
                key={r.key}
                onClick={() => handleSelectRange(r.key)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? "bg-card text-heading shadow-xs font-bold"
                    : "hover:text-heading"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Refresh Action Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh analytics data"
            className="p-2 rounded-xl border border-default bg-card hover:bg-sidebar-hover text-subtle hover:text-heading shadow-xs active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary-600" : ""}`} />
          </button>
        )}

        {/* Export Report Action Button */}
        <button
          onClick={() => alert("Exporting PDF & CSV analytics report...")}
          className="px-3.5 py-2 rounded-xl border border-default bg-card hover:bg-sidebar-hover text-heading font-semibold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-subtle" />
          <span className="hidden sm:inline">Export Report</span>
        </button>
      </div>

      {/* Custom Date Modal */}
      {customModalOpen && (
        <div className="fixed inset-0 z-modal bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-default shadow-float p-6 space-y-4 animate-in fade-in zoom-in-95 duration-fast">
            <div className="flex items-center justify-between border-b border-default pb-3">
              <h3 className="font-bold text-sm text-heading font-display flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-600" />
                Select Custom Date Range
              </h3>
              <button
                onClick={() => setCustomModalOpen(false)}
                className="p-1 rounded-lg hover:bg-sidebar-hover text-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyCustomDate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-subtle">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-input px-3 rounded-xl bg-input border border-default text-heading"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-subtle">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-input px-3 rounded-xl bg-input border border-default text-heading"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-default text-subtle font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary-600 text-white font-bold shadow-xs hover:bg-primary-700"
                >
                  Apply Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
