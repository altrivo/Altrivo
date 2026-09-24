"use client";

import { Button } from "@/components/shared";

interface OrderHeaderProps {
  totalOrdersCount: number;
  totalRevenue: number;
  pendingDeliveriesCount: number;
  realtimeCount: number;
  activeStatusTab: string;
  onSelectStatusTab: (status: string) => void;
  onExportCSV: () => void;
  onSimulateNewOrder?: () => void;
  onRefresh?: () => void;
  isRealtimeActive?: boolean;
  statusCounts: {
    all: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

export function OrderHeader({
  totalOrdersCount,
  totalRevenue,
  pendingDeliveriesCount,
  realtimeCount,
  activeStatusTab,
  onSelectStatusTab,
  onExportCSV,
  onSimulateNewOrder,
  onRefresh,
  isRealtimeActive,
  statusCounts,
}: OrderHeaderProps) {
  const tabs = [
    { id: "all", label: "All Orders", count: statusCounts.all },
    { id: "processing", label: "Processing", count: statusCounts.processing },
    { id: "pending", label: "Pending", count: statusCounts.pending },
    { id: "shipped", label: "Shipped", count: statusCounts.shipped },
    { id: "delivered", label: "Delivered", count: statusCounts.delivered },
    { id: "cancelled", label: "Cancelled", count: statusCounts.cancelled },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Buttons */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-heading font-display">
            Orders Management
          </h1>
          <p className="mt-1 text-sm font-medium text-body">
            Monitor incoming customer purchases, fulfill shipments, track payments, and export store reports.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">

          <Button
            variant="primary"
            size="md"
            onClick={onExportCSV}
            className="flex items-center gap-2 shadow-md hover:shadow-lg font-bold"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV Report
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Orders */}
        <div className="rounded-2xl border border-default bg-card p-5 shadow-card transition-all duration-normal hover:shadow-card-hover hover:-translate-y-0.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-body font-display">
              Total Orders
            </p>
            <p className="mt-1 text-2xl font-extrabold text-heading font-mono">
              {totalOrdersCount}
            </p>
            <p className="mt-1 text-xs font-semibold text-body">Historical order volume</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 shrink-0">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="rounded-2xl border border-default bg-card p-5 shadow-card transition-all duration-normal hover:shadow-card-hover hover:-translate-y-0.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-body font-display">
              Filtered Revenue
            </p>
            <p className="mt-1 text-2xl font-extrabold text-heading font-mono">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs text-success-700 font-bold">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Active view total</span>
            </div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-success-50 text-success-600 flex items-center justify-center border border-success-100 shrink-0">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 3: Pending Processing */}
        <div className="rounded-2xl border border-default bg-card p-5 shadow-card transition-all duration-normal hover:shadow-card-hover hover:-translate-y-0.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-body font-display">
              Fulfillment Queue
            </p>
            <p className="mt-1 text-2xl font-extrabold text-heading font-mono">
              {pendingDeliveriesCount}
            </p>
            <p className="mt-1 text-xs text-warning-700 font-bold">
              Needs packing & shipping
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-warning-50 text-warning-600 flex items-center justify-center border border-warning-100 shrink-0">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 4: Real-time Badge */}
        <div className="rounded-2xl border border-default bg-card p-5 shadow-card transition-all duration-normal hover:shadow-card-hover hover:-translate-y-0.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-body font-display">
              Real-time Stream
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-2xl font-extrabold text-heading font-mono">
                {realtimeCount}
              </p>
              {realtimeCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-accent-100 px-2 py-0.5 text-xs font-extrabold text-accent-800 border border-accent-200">
                  UNSEEN
                </span>
              )}
            </div>
            <p className="mt-1 text-xs font-semibold text-body">Incoming live orders</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center border border-accent-200 shrink-0">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Segmented Status Tab Selector */}
      <div className="flex items-center gap-1 border-b border-default overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const isActive = activeStatusTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectStatusTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? "border-primary-500 text-primary-700 bg-primary-50/60 rounded-t-lg shadow-xs"
                  : "border-transparent text-body hover:text-heading hover:border-default"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                  isActive
                    ? "bg-primary-500 text-on-primary"
                    : "bg-muted text-heading border border-default"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
