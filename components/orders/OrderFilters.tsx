"use client";

import { OrderFilterState, OrderStatus, PaymentMethod, DeliveryMethod, DateRangeOption } from "@/types/orders";
import { Button } from "@/components/shared";

interface OrderFiltersProps {
  filters: OrderFilterState;
  onFilterChange: (updated: Partial<OrderFilterState>) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
}

export function OrderFilters({
  filters,
  onFilterChange,
  onResetFilters,
  totalFilteredCount,
}: OrderFiltersProps) {
  // Collect active filter descriptors for pills
  const activePills: { key: keyof OrderFilterState; label: string; resetValue: any }[] = [];

  if (filters.searchQuery) {
    activePills.push({ key: "searchQuery", label: `Search: "${filters.searchQuery}"`, resetValue: "" });
  }
  if (filters.deliveryStatus !== "all") {
    activePills.push({ key: "deliveryStatus", label: `Status: ${filters.deliveryStatus}`, resetValue: "all" });
  }
  if (filters.paymentMethod !== "all") {
    activePills.push({ key: "paymentMethod", label: `Payment: ${filters.paymentMethod.replace("_", " ")}`, resetValue: "all" });
  }
  if (filters.deliveryMethod !== "all") {
    activePills.push({ key: "deliveryMethod", label: `Delivery: ${filters.deliveryMethod}`, resetValue: "all" });
  }
  if (filters.dateRange !== "all") {
    activePills.push({ key: "dateRange", label: `Date: ${filters.dateRange.replace(/_/g, " ")}`, resetValue: "all" });
  }

  return (
    <div className="rounded-2xl border border-default bg-card p-5 shadow-card space-y-4">
      {/* Search Bar + Controls Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[280px]">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <svg
              className="h-4 w-4 text-body font-bold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search by order #, customer name, email..."
            className="w-full rounded-xl border border-default bg-input py-2.5 pl-10 pr-10 text-sm font-semibold text-heading placeholder:text-body/70 placeholder:font-normal focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 transition-all shadow-xs"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: "" })}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-heading hover:text-primary-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Clear Action if active pills exist */}
        {activePills.length > 0 && (
          <div className="flex items-center gap-3 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-xs text-error-600 font-bold hover:bg-error-50 border-error-200"
            >
              Reset All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Select Dropdown Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-3 border-t border-default">
        {/* Delivery Status */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-heading mb-1.5 font-display">
            Delivery Status
          </label>
          <select
            value={filters.deliveryStatus}
            onChange={(e) =>
              onFilterChange({ deliveryStatus: e.target.value as OrderStatus | "all" })
            }
            className="w-full rounded-xl border border-default bg-input px-3 py-2 text-sm font-semibold text-heading focus:border-focus focus:outline-none transition-colors shadow-xs"
          >
            <option value="all">All Delivery Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-heading mb-1.5 font-display">
            Payment Method
          </label>
          <select
            value={filters.paymentMethod}
            onChange={(e) =>
              onFilterChange({ paymentMethod: e.target.value as PaymentMethod | "all" })
            }
            className="w-full rounded-xl border border-default bg-input px-3 py-2 text-sm font-semibold text-heading focus:border-focus focus:outline-none transition-colors shadow-xs"
          >
            <option value="all">All Payment Methods</option>
            <option value="credit_card">Credit Card</option>
            <option value="paypal">PayPal</option>
            <option value="stripe">Stripe</option>
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        {/* Delivery Method */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-heading mb-1.5 font-display">
            Delivery Method
          </label>
          <select
            value={filters.deliveryMethod}
            onChange={(e) =>
              onFilterChange({ deliveryMethod: e.target.value as DeliveryMethod | "all" })
            }
            className="w-full rounded-xl border border-default bg-input px-3 py-2 text-sm font-semibold text-heading focus:border-focus focus:outline-none transition-colors shadow-xs"
          >
            <option value="all">All Delivery Methods</option>
            <option value="standard">Standard Shipping</option>
            <option value="express">Express Delivery</option>
            <option value="pickup">Local Pickup</option>
            <option value="international">International</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-heading mb-1.5 font-display">
            Time Period
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) =>
              onFilterChange({ dateRange: e.target.value as DateRangeOption })
            }
            className="w-full rounded-xl border border-default bg-input px-3 py-2 text-sm font-semibold text-heading focus:border-focus focus:outline-none transition-colors shadow-xs"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>
      </div>

      {/* Custom Date Pickers */}
      {filters.dateRange === "custom" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-3 border-t border-default animate-fade-in">
          <div>
            <label className="block text-xs font-bold text-heading mb-1">From Date</label>
            <input
              type="date"
              value={filters.customStartDate || ""}
              onChange={(e) => onFilterChange({ customStartDate: e.target.value })}
              className="w-full rounded-xl border border-default bg-input px-3 py-2 text-sm font-semibold text-heading focus:border-focus focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-heading mb-1">To Date</label>
            <input
              type="date"
              value={filters.customEndDate || ""}
              onChange={(e) => onFilterChange({ customEndDate: e.target.value })}
              className="w-full rounded-xl border border-default bg-input px-3 py-2 text-sm font-semibold text-heading focus:border-focus focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Active Filter Tags Bar */}
      {activePills.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-default">
          <span className="text-xs font-extrabold text-heading">Active:</span>
          {activePills.map((pill) => (
            <span
              key={pill.key}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-extrabold text-primary-900 border border-primary-300 shadow-xs"
            >
              {pill.label}
              <button
                onClick={() => onFilterChange({ [pill.key]: pill.resetValue })}
                className="rounded-full hover:bg-primary-300 p-0.5 text-primary-900 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
