"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KPICardRow } from "@/components/dashboard/KPICardRow";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { Store, Plus } from "lucide-react";
import { useVendorStore } from "@/context/VendorStoreContext";

export function VendorDashboardContent() {
  const { stores, activeStore, activeStoreId, setActiveStoreId, vendor, hasStore, isLoading } = useVendorStore();

  const vendorName = vendor?.name || "Vendor";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* If new vendor with NO store yet, show Clean Welcoming Store Generation View */}
      {!isLoading && !hasStore && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50/90 via-card to-accent-50/40 p-6 sm:p-10 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-heading tracking-tight">
                  Welcome, {vendorName}!
                </h2>

                <p className="text-sm text-body leading-relaxed">
                  Welcome to Altrivo Vendor Studio! To get started, please generate your first storefront. Once your store is created, your complete vendor dashboard—including product management, catalog inventory, sales analytics, and customer orders—will automatically unlock and activate right here.
                </p>

                <p className="text-xs text-subtle font-medium">
                  Click the button to choose your store name, niche, and layout in less than 2 minutes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <Link
                  href="/store-builder"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-md hover:bg-primary-700 active:scale-[0.98] transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate Your Store</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* If vendor HAS active store, show Active Store Header + Store Switcher + Scoped KPIs + Scoped Orders */}
      {!isLoading && hasStore && activeStore && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary-100 border border-primary-200 text-primary-700 flex items-center justify-center font-bold text-sm shadow-2xs flex-shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-heading">
                  {activeStore.name}
                </h2>
                <p className="text-xs text-subtle mt-0.5">
                  Store ID: <span className="font-mono text-heading">{activeStore.id.substring(0, 8)}</span> • {activeStore.subdomain || activeStore.slug}.altrivo.com
                </p>
              </div>
            </div>
          </div>

          {/* Top Row of 4 KPI Cards strictly scoped to activeStore and vendor */}
          <KPICardRow vendorId={vendor?.id} storeId={activeStore.id} />

          {/* Recent Orders Table strictly scoped to activeStore and vendor */}
          <div className="w-full">
            <RecentOrdersTable vendorId={vendor?.id} storeId={activeStore.id} />
          </div>
        </>
      )}
    </div>
  );
}
