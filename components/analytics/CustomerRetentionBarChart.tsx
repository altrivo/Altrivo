"use client";

import React from "react";
import { Users, UserCheck, UserPlus } from "lucide-react";
import { AnalyticsData } from "@/app/api/analytics/route";

interface CustomerRetentionBarChartProps {
  data: AnalyticsData["newVsReturning"];
}

export function CustomerRetentionBarChart({ data }: CustomerRetentionBarChartProps) {
  const maxVal = Math.max(
    ...data.flatMap((d) => [d.newCustomers, d.returningCustomers])
  );

  return (
    <div className="rounded-2xl bg-card border border-default p-5 sm:p-6 shadow-card space-y-5 flex flex-col justify-between">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-default pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 text-white flex items-center justify-center shadow-md">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-heading font-display leading-tight">
              New vs. Returning Customer Cohorts
            </h2>
            <p className="text-xs text-subtle mt-0.5">
              Daily customer acquisition vs repeat buyer breakdown
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-accent-700">
            <span className="w-3 h-3 rounded-md bg-accent-500" />
            New Buyers
          </span>
          <span className="flex items-center gap-1.5 text-primary-800">
            <span className="w-3 h-3 rounded-md bg-primary-600" />
            Returning
          </span>
        </div>
      </div>

      {/* Bar Chart Bars Container */}
      <div className="pt-4 flex items-end justify-between gap-2 sm:gap-4 h-52 px-2 border-b border-default">
        {data.map((item) => {
          const newHeight = (item.newCustomers / maxVal) * 100;
          const retHeight = (item.returningCustomers / maxVal) * 100;

          return (
            <div key={item.period} className="flex-1 flex flex-col items-center gap-2 group">
              {/* Dual Bar Pair */}
              <div className="w-full flex items-end justify-center gap-1.5 h-40">
                {/* New Customers Bar (Rose Pink) */}
                <div
                  style={{ height: `${newHeight}%` }}
                  className="w-full max-w-[20px] rounded-t-lg bg-gradient-to-t from-accent-600 to-accent-400 shadow-xs group-hover:brightness-110 transition-all duration-normal relative"
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-extrabold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    New: {item.newCustomers}
                  </div>
                </div>

                {/* Returning Customers Bar (Deep Purple) */}
                <div
                  style={{ height: `${retHeight}%` }}
                  className="w-full max-w-[20px] rounded-t-lg bg-gradient-to-t from-primary-800 to-primary-600 shadow-xs group-hover:brightness-110 transition-all duration-normal relative"
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-extrabold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    Ret: {item.returningCustomers}
                  </div>
                </div>
              </div>

              {/* Day Label */}
              <span className="text-[11px] font-bold text-subtle group-hover:text-heading transition-colors">
                {item.period}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between text-xs text-subtle pt-1 font-medium">
        <span className="flex items-center gap-1">
          <UserPlus className="w-3.5 h-3.5 text-accent-600" />
          Average 610 new buyers/day
        </span>
        <span className="flex items-center gap-1 font-bold text-primary-700">
          <UserCheck className="w-3.5 h-3.5 text-primary-600" />
          41.8% Retention Rate
        </span>
      </div>
    </div>
  );
}
