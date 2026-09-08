"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  Eye,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import { Sparkline } from "./Sparkline";
import { KPICardSkeleton } from "./KPICardSkeleton";
import { KPIMetric } from "@/app/api/kpi/route";

interface KPIDataResponse {
  success: boolean;
  range: string;
  updatedAt: string;
  data: Record<string, KPIMetric>;
}

export function KPICardRow({ vendorId, storeId }: { vendorId?: string; storeId?: string } = {}) {
  const [range, setRange] = useState<string>("7d");
  const [loading, setLoading] = useState<boolean>(true);
  const [kpiData, setKpiData] = useState<Record<string, KPIMetric> | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchKPIData = async (selectedRange: string) => {
    try {
      setLoading(true);
      let url = `/api/kpi?range=${selectedRange}`;
      if (vendorId) url += `&vendorId=${encodeURIComponent(vendorId)}`;
      if (storeId) url += `&storeId=${encodeURIComponent(storeId)}`;

      const res = await fetch(url);
      if (res.ok) {
        const json: KPIDataResponse = await res.json();
        if (json.success) {
          setKpiData(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch KPI data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKPIData(range);
  }, [range, storeId, vendorId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchKPIData(range);
  };

  // Card icons mapping
  const cardConfig = [
    {
      key: "sales",
      title: "Total Sales Today (₨)",
      icon: DollarSign,
      iconBg: "bg-primary-50 text-primary-600 border border-primary-200",
    },
    {
      key: "orders",
      title: "Orders Today (count)",
      icon: ShoppingCart,
      iconBg: "bg-accent-50 text-accent-600 border border-accent-200",
    },
    {
      key: "views",
      title: "Site Views (count)",
      icon: Eye,
      iconBg: "bg-info-50 text-info-600 border border-info-200",
    },
    {
      key: "conversion",
      title: "Conversion Rate (%)",
      icon: TrendingUp,
      iconBg: "bg-warning-50 text-warning-600 border border-warning-200",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Range Switcher & Refresh Button */}
      <div className="flex items-center justify-end gap-2">
        {/* Time range selector */}
        <div className="flex items-center p-1 rounded-xl bg-muted border border-default text-xs font-semibold text-subtle">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                range === r
                  ? "bg-card text-heading shadow-xs font-bold"
                  : "hover:text-heading"
              }`}
            >
              {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          aria-label="Refresh KPI metrics"
          className="p-2 rounded-xl border border-default bg-card hover:bg-sidebar-hover text-subtle hover:text-heading shadow-xs active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin text-primary-600" : ""}`}
          />
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading || !kpiData ? (
          <>
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </>
        ) : (
          cardConfig.map((config) => {
            const metric = kpiData[config.key];
            if (!metric) return null;

            const Icon = config.icon;
            const isUp = metric.trend === "up";

            return (
              <div
                key={`${config.key}-${range}`}
                className="group rounded-2xl bg-card border border-default p-5 shadow-card hover:shadow-card-hover transition-all duration-normal relative overflow-hidden flex flex-col justify-between space-y-3 animate-in fade-in zoom-in-95 duration-fast"
              >
                {/* Top Row: Title & Icon */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-subtle uppercase tracking-wider line-clamp-1">
                    {config.title}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${config.iconBg}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Main Value & Percentage Change vs Previous 7 Days */}
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-display font-extrabold text-heading tracking-tight">
                    {metric.formattedValue}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-extrabold border ${
                        isUp
                          ? "bg-success-50 text-success-700 border-success-200"
                          : "bg-error-50 text-error-700 border-error-200"
                      }`}
                    >
                      {isUp ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-success-600" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-error-600" />
                      )}
                      {isUp ? `+${metric.changePercent}%` : `${metric.changePercent}%`}
                    </span>

                    <span className="text-[11px] text-subtle font-medium">
                      vs prev 7 days
                    </span>
                  </div>
                </div>

                {/* 7-Day Sparkline Trend Chart */}
                <div className="pt-2 border-t border-default/60">
                  <div className="flex items-center justify-between text-[10px] text-subtle mb-1 font-semibold">
                    <span>7-Day Trend</span>
                    <span>{metric.dates[metric.dates.length - 1]}</span>
                  </div>
                  <Sparkline data={metric.sparkline} trend={metric.trend} height={44} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
