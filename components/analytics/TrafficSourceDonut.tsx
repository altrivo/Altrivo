"use client";

import React from "react";
import { Share2 } from "lucide-react";
import { AnalyticsData } from "@/app/api/analytics/route";

interface TrafficSourceDonutProps {
  sources: AnalyticsData["trafficSources"];
}

export function TrafficSourceDonut({ sources }: TrafficSourceDonutProps) {
  // Calculate SVG Donut chart segments
  let cumulativeAngle = 0;
  const radius = 40;
  const strokeWidth = 14;
  const center = 50;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="rounded-2xl bg-card border border-default p-5 sm:p-6 shadow-card space-y-5 flex flex-col justify-between">
      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-default pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-white flex items-center justify-center shadow-md">
            <Share2 className="w-5 h-5 text-accent-100" />
          </div>
          <div>
            <h2 className="font-bold text-base text-heading font-display leading-tight">
              Traffic Source Distribution
            </h2>
            <p className="text-xs text-subtle mt-0.5">
              Meta Ads, WhatsApp, Organic & Direct traffic channels
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-primary-100 text-primary-800 border border-primary-200">
          4 Channels
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        {/* SVG Donut Graphic */}
        <div className="relative flex items-center justify-center p-2">
          <svg viewBox="0 0 100 100" className="w-44 h-44 transform -rotate-90">
            {sources.map((src) => {
              const dasharray = (src.percentage / 100) * circumference;
              const strokeDashoffset = -cumulativeAngle;
              cumulativeAngle += dasharray;

              return (
                <circle
                  key={src.source}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={src.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dasharray} ${circumference - dasharray}`}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-normal hover:opacity-90 cursor-pointer"
                />
              );
            })}
          </svg>

          {/* Center Donut Label */}
          {(() => {
            const top = sources.find((s) => s.percentage > 0) || sources[0];
            const hasTraffic = top && top.percentage > 0;
            return (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                <span className="text-[10px] font-bold text-subtle uppercase">Top Channel</span>
                <span className="text-xs font-extrabold text-heading truncate max-w-[100px]">
                  {hasTraffic ? top.source.split(" ")[0] : "Direct"}
                </span>
                <span className="text-xs font-bold text-accent-600">
                  {hasTraffic ? `${top.percentage}%` : "0%"}
                </span>
              </div>
            );
          })()}
        </div>

        {/* Channel Breakdown Legend */}
        <div className="space-y-3">
          {sources.map((src) => (
            <div
              key={src.source}
              className="p-3 rounded-xl border border-default bg-muted/30 hover:bg-sidebar-hover transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 shadow-2xs"
                  style={{ backgroundColor: src.color }}
                />
                <span className="font-bold text-heading">{src.source}</span>
              </div>

              <div className="text-right">
                <div className="font-extrabold text-heading">{src.percentage}%</div>
                <div className="text-[10px] text-subtle">{src.count} visits</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
