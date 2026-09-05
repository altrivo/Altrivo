import React from "react";

export function KPICardSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-default p-5 shadow-card space-y-4 animate-pulse">
      {/* Header title skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-28 skeleton-bone" />
        <div className="w-10 h-10 rounded-xl skeleton-bone" />
      </div>

      {/* Main value skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-36 skeleton-bone" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded-full skeleton-bone" />
          <div className="h-3 w-24 skeleton-bone" />
        </div>
      </div>

      {/* Sparkline chart skeleton */}
      <div className="h-10 w-full rounded-lg skeleton-bone opacity-60" />
    </div>
  );
}
