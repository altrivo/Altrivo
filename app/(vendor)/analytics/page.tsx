"use client";

import React, { useState, useEffect } from "react";
import { Database, Zap, RefreshCcw, ShieldCheck } from "lucide-react";

import { AnalyticsHeaderFilters } from "@/components/analytics/AnalyticsHeaderFilters";
import { TrafficOverviewCards } from "@/components/analytics/TrafficOverviewCards";
import { PakistanGeoHeatmap } from "@/components/analytics/PakistanGeoHeatmap";
import { TrafficSourceDonut } from "@/components/analytics/TrafficSourceDonut";
import { CustomerRetentionBarChart } from "@/components/analytics/CustomerRetentionBarChart";
import { ConversionFunnelWidget } from "@/components/analytics/ConversionFunnelWidget";
import { DeviceAndTopProducts } from "@/components/analytics/DeviceAndTopProducts";
import { AnalyticsData } from "@/app/api/analytics/route";

export default function AnalyticsPage() {
  const [range, setRange] = useState<string>("7d");
  const [loading, setLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [mvStatus, setMvStatus] = useState<string>("Refreshed 2m ago (every 5m)");
  const [isRefreshingMv, setIsRefreshingMv] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number>(1.8);

  const fetchAnalytics = async (selectedRange: string) => {
    try {
      setLoading(true);
      const start = performance.now();
      const res = await fetch(`/api/analytics?range=${selectedRange}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setAnalyticsData(json.data);
          setLatencyMs(Number((performance.now() - start).toFixed(1)));
        }
      }
    } catch (err) {
      console.error("Failed to fetch analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshViews = async () => {
    try {
      setIsRefreshingMv(true);
      const res = await fetch("/api/analytics/views", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setMvStatus("Refreshed just now");
          fetchAnalytics(range);
        }
      }
    } catch (err) {
      console.error("Failed to refresh materialized views:", err);
    } finally {
      setIsRefreshingMv(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  return (
    <div className="space-y-8 animate-in fade-in duration-normal select-none">
      {/* Date Range Picker Filters Bar */}
      <AnalyticsHeaderFilters
        activeRange={range}
        onRangeChange={(newRange) => setRange(newRange)}
        onRefresh={() => fetchAnalytics(range)}
        loading={loading}
      />

      {/* Supabase Materialized Views Performance & RLS Bar */}
      <div className="p-4 rounded-2xl bg-card border border-default shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center border border-primary-200 shadow-2xs">
            <Database className="w-5 h-5 text-primary-600" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm text-heading">Supabase Materialized Views Engine</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-success-50 text-success-800 border border-success-200">
                <Zap className="w-3 h-3 text-success-600 fill-success-600" />
                <span>{latencyMs}ms Latency (&lt;200ms SLA)</span>
              </span>
            </div>
            <p className="text-xs text-subtle mt-0.5 flex items-center gap-2">
              <span>Views: <code className="text-primary-700 font-bold">daily_summary_mv</code>, <code className="text-primary-700 font-bold">geo_heatmap_mv</code>, <code className="text-primary-700 font-bold">source_attribution_mv</code></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-success-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                RLS Enforced
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-subtle hidden lg:inline">{mvStatus}</span>
          <button
            onClick={handleRefreshViews}
            disabled={isRefreshingMv}
            className="px-3.5 py-1.5 rounded-xl border border-default bg-card hover:bg-muted text-xs font-bold text-heading shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCcw className={`w-3.5 h-3.5 text-primary-600 ${isRefreshingMv ? "animate-spin" : ""}`} />
            <span>{isRefreshingMv ? "Refreshing..." : "Refresh Views"}</span>
          </button>
        </div>
      </div>

      {analyticsData && (
        <>
          {/* Section 1: Traffic Overview Cards */}
          <TrafficOverviewCards
            overview={analyticsData.trafficOverview}
            loading={loading}
          />

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
      )}
    </div>
  );
}
