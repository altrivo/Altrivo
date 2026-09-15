"use client";

import React, { useState, useEffect } from "react";

import { AnalyticsHeaderFilters } from "@/components/analytics/AnalyticsHeaderFilters";
import { TrafficOverviewCards } from "@/components/analytics/TrafficOverviewCards";
import { PakistanGeoHeatmap } from "@/components/analytics/PakistanGeoHeatmap";
import { TrafficSourceDonut } from "@/components/analytics/TrafficSourceDonut";
import { CustomerRetentionBarChart } from "@/components/analytics/CustomerRetentionBarChart";
import { ConversionFunnelWidget } from "@/components/analytics/ConversionFunnelWidget";
import { DeviceAndTopProducts } from "@/components/analytics/DeviceAndTopProducts";
import { AnalyticsData } from "@/app/api/analytics/route";
import { useVendorStore } from "@/context/VendorStoreContext";
import Link from "next/link";
import { ShoppingCart, DollarSign, TrendingUp, Package, Sparkles } from "lucide-react";

export default function AnalyticsPage() {
  const { activeStoreId, stores, isLoading: isStoreLoading } = useVendorStore();
  const [range, setRange] = useState<string>("7d");
  const [loading, setLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const fetchAnalytics = async (selectedRange: string) => {
    if (!isStoreLoading && stores.length === 0 && !activeStoreId) {
      setLoading(false);
      setAnalyticsData(null);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({ range: selectedRange });
      if (activeStoreId) {
        params.set("storeId", activeStoreId);
      }
      const res = await fetch(`/api/analytics?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setAnalyticsData(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range, activeStoreId, isStoreLoading, stores.length]);

  return (
    <div className="space-y-8 animate-in fade-in duration-normal select-none">
      {/* Date Range Picker Filters Bar */}
      <AnalyticsHeaderFilters
        activeRange={range}
        onRangeChange={(newRange) => setRange(newRange)}
        onRefresh={() => fetchAnalytics(range)}
        loading={loading}
      />

      {/* When vendor has NO stores yet */}
      {!isStoreLoading && stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 bg-card rounded-3xl border border-default p-8 shadow-card text-center max-w-2xl mx-auto my-4">
          <div className="p-6 rounded-2xl bg-primary-50 border border-primary-200">
            <TrendingUp className="w-12 h-12 text-primary-600" />
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-black text-heading font-display">No Storefront Found</h2>
            <p className="text-xs text-subtle leading-relaxed">
              You haven&apos;t created any stores yet. To start viewing real-time traffic, visitor intelligence, and sales conversion analytics, please generate your first store.
            </p>
          </div>
          <Link
            href="/store-builder"
            className="px-6 py-3 rounded-xl bg-[#694873] hover:bg-[#5A3D63] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Your First Store</span>
          </Link>
        </div>
      ) : (
        analyticsData && (
          <>
            {/* Section 1: Traffic Overview Cards */}
            <TrafficOverviewCards
              overview={analyticsData.trafficOverview}
              isLive={analyticsData.isLive}
              loading={loading}
            />

            {/* Section 1b: Order Summary Strip (Real Orders Revenue) */}
            {analyticsData.orderSummary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Orders",
                    value: analyticsData.orderSummary.totalOrders.toLocaleString(),
                    icon: ShoppingCart,
                    color: "bg-primary-100 text-primary-700",
                  },
                  {
                    label: "Gross Revenue",
                    value: analyticsData.orderSummary.grossRevenue,
                    icon: DollarSign,
                    color: "bg-primary-50 text-primary-800 border border-primary-200",
                  },
                  {
                    label: "Avg Order Value",
                    value: analyticsData.orderSummary.aov,
                    icon: TrendingUp,
                    color: "bg-accent-100 text-accent-700",
                  },
                  {
                    label: "Conversion Rate",
                    value: analyticsData.orderSummary.conversionRate,
                    icon: Package,
                    color: "bg-primary-50 text-primary-700",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-card border border-default p-4 shadow-card flex items-center gap-3"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-subtle font-semibold uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className="text-sm font-extrabold text-heading mt-0.5">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Section 2: Geographical Heatmap of Pakistan */}
            <PakistanGeoHeatmap cities={analyticsData.pakistanCities} />

            {/* Section 3 & 4: Traffic Sources Donut + New vs Returning Customer Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <TrafficSourceDonut sources={analyticsData.trafficSources} />
              <CustomerRetentionBarChart data={analyticsData.newVsReturning} />
            </div>

            {/* Section 5: Conversion Funnel (Visited → Viewed Product → Added Cart → Purchased) */}
            <ConversionFunnelWidget funnel={analyticsData.conversionFunnel} />

            {/* Section 6: Device Split Pie (Mobile vs Desktop) + Top 5 Products by Time Spent */}
            <DeviceAndTopProducts
              deviceSplit={analyticsData.deviceSplit}
              topProducts={analyticsData.topProductsByTime}
            />
          </>
        )
      )}
    </div>
  );
}
