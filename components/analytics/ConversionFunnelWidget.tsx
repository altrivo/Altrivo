"use client";

import React from "react";
import { Filter, ArrowDown } from "lucide-react";
import { AnalyticsData } from "@/app/api/analytics/route";

interface ConversionFunnelWidgetProps {
  funnel: AnalyticsData["conversionFunnel"];
}

export function ConversionFunnelWidget({ funnel }: ConversionFunnelWidgetProps) {
  // Compute overall conversion rate dynamically from funnel data
  const firstStage = funnel[0];
  const lastStage = funnel[funnel.length - 1];
  const conversionRate =
    firstStage && lastStage && firstStage.rawCount > 0
      ? ((lastStage.rawCount / firstStage.rawCount) * 100).toFixed(2)
      : (lastStage?.percentageOfTotal ?? 3.84).toFixed(2);

  return (
    <div className="rounded-2xl bg-card border border-default p-5 sm:p-6 shadow-card space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-default pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 text-white flex items-center justify-center shadow-md">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-base text-heading font-display leading-tight">
              Customer Conversion Funnel
            </h2>
            <p className="text-xs text-subtle mt-0.5">
              4-Stage funnel drop-off percentages from initial store visit to completed purchase
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-success-50 text-success-700 border border-success-200">
          {conversionRate}% Overall Conversion Rate
        </span>
      </div>

      {/* 4 Funnel Stages */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {funnel.map((stage, index) => {
          const isFirst = index === 0;
          // Ensure dropped-out count is always a clean integer
          const droppedOut =
            !isFirst && funnel[index - 1]
              ? Math.round(funnel[index - 1].rawCount - stage.rawCount)
              : 0;

          return (
            <React.Fragment key={stage.stage}>
              {/* Funnel Stage Bar */}
              <div className="relative p-4 rounded-2xl border border-default bg-card shadow-xs space-y-2 group hover:border-accent-400 transition-all">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-primary-100 text-primary-800 font-extrabold text-xs flex items-center justify-center shadow-2xs">
                      #{index + 1}
                    </span>
                    <span className="text-heading font-display">{stage.stage}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-subtle font-mono">{stage.count} shoppers</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-accent-100 text-accent-900 border border-accent-300">
                      {stage.percentageOfTotal}%
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full h-3 rounded-full bg-muted overflow-hidden relative">
                  <div
                    style={{ width: `${Math.min(stage.percentageOfTotal, 100)}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-primary-600 via-[#3B2742] to-accent-500 transition-all duration-normal"
                  />
                </div>

                {/* Drop-off Callout Badge — only integers, no decimals */}
                {!isFirst && stage.dropoffPercent !== null && stage.dropoffPercent > 0 && droppedOut > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-subtle pt-1">
                    <span className="text-error-600 font-bold">
                      ⚠️ Stage Drop-off: -{stage.dropoffPercent}%
                    </span>
                    <span>
                      {droppedOut.toLocaleString()} dropped out
                    </span>
                  </div>
                )}
              </div>

              {/* Stage Connector Arrow */}
              {index < funnel.length - 1 && (
                <div className="flex items-center justify-center -my-1 text-subtle">
                  <div className="w-7 h-7 rounded-full bg-muted border border-default flex items-center justify-center shadow-2xs">
                    <ArrowDown className="w-4 h-4 text-primary-600" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
