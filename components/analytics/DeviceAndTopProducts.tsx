"use client";

import React from "react";
import { Smartphone, Monitor, Tablet, Clock } from "lucide-react";
import { AnalyticsData } from "@/app/api/analytics/route";

interface DeviceAndTopProductsProps {
  deviceSplit: AnalyticsData["deviceSplit"];
  topProducts: AnalyticsData["topProductsByTime"];
}

export function DeviceAndTopProducts({ deviceSplit, topProducts }: DeviceAndTopProductsProps) {
  // Compute mobile % dynamically from data
  const mobileItem = deviceSplit.find((d) => d.device.toLowerCase().includes("mobile"));
  const mobilePct = mobileItem ? mobileItem.percentage : 0;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Device Split Pie / Donut (5 cols) */}
      <div className="lg:col-span-5 rounded-2xl bg-card border border-default p-5 sm:p-6 shadow-card space-y-5 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-default pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-600 text-white flex items-center justify-center shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-heading font-display leading-tight">
                Device Split Breakdown
              </h3>
              <p className="text-xs text-subtle mt-0.5">
                Mobile vs Desktop vs Tablet visits
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-accent-100 text-accent-900 border border-accent-300">
            {mobilePct}% Mobile
          </span>
        </div>

        {/* Device Breakdown List with Progress Bars */}
        <div className="space-y-4">
          {deviceSplit.map((item) => {
            const Icon = item.device.includes("Mobile")
              ? Smartphone
              : item.device.includes("Desktop")
              ? Monitor
              : Tablet;

            return (
              <div key={item.device} className="p-3.5 rounded-xl border border-default bg-muted/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 font-bold text-heading">
                    <Icon className="w-4 h-4 text-accent-600" />
                    <span>{item.device}</span>
                  </div>

                  <div className="text-right font-extrabold text-heading">
                    {item.percentage}% <span className="text-[10px] text-subtle font-normal">({item.count})</span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    className="h-full rounded-full transition-all duration-normal"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 rounded-xl bg-accent-50/50 border border-accent-200 text-xs text-accent-900 font-medium">
          💡 <strong>Mobile Optimization Alert:</strong> Over {mobilePct}% of your customers browse on Mobile devices. Ensure instant checkout speed.
        </div>
      </div>

      {/* Top 5 Products by Time Spent (7 cols) */}
      <div className="lg:col-span-7 rounded-2xl bg-card border border-default p-5 sm:p-6 shadow-card space-y-5 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-default pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 text-white flex items-center justify-center shadow-md">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-heading font-display leading-tight">
                Top 5 Products by Time Spent
              </h3>
              <p className="text-xs text-subtle mt-0.5">
                Listings where shoppers spend the highest average engagement time
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-primary-100 text-primary-800 border border-primary-200">
            Top Engagement
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-default text-subtle font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Rank & Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Avg Time</th>
                <th className="p-3 text-right">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default font-medium text-heading">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-subtle text-xs">
                    No products added to this store yet.
                  </td>
                </tr>
              ) : (
                topProducts.map((p) => (
                  <tr key={p.rank} className="hover:bg-sidebar-hover transition-colors">
                    <td className="p-3 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-800 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                        #{p.rank}
                      </span>
                      <div>
                        <div className="font-bold text-heading truncate max-w-[200px]">{p.name}</div>
                        <div className="text-[10px] text-subtle font-mono">{p.sku}</div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-subtle">{p.category}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-accent-100 text-accent-800 border border-accent-300">
                        <Clock className="w-3 h-3 text-accent-600" />
                        {p.avgTimeSpent}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-heading">
                      {p.totalViews}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
