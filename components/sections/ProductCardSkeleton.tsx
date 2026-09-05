"use client";

import React from "react";

export interface ProductCardSkeletonProps {
  aspectRatio?: "square" | "portrait";
}

export default function ProductCardSkeleton({
  aspectRatio = "portrait",
}: ProductCardSkeletonProps) {
  const imageAspect = aspectRatio === "square" ? "aspect-square" : "aspect-[3/4]";

  return (
    <div
      className="flex flex-col w-full bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.03)] pointer-events-none select-none"
    >
      {/* 1. Pulsing Image Box */}
      <div className={`w-full ${imageAspect} bg-slate-100 animate-pulse relative`} />

      {/* 2. Pulsing Content details */}
      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        
        <div className="space-y-2">
          {/* Micro Rating Row */}
          <div className="flex gap-1.5 items-center">
            <div className="h-3 w-3 bg-slate-200 rounded-full animate-pulse" />
            <div className="h-2.5 w-6 bg-slate-200 rounded animate-pulse" />
          </div>

          {/* Headline Text Lines */}
          <div className="space-y-1.5 pt-0.5">
            <div className="h-3 w-5/6 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-3/5 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>

        {/* 3. Pricing and button row */}
        <div className="flex items-center justify-between pt-2">
          {/* Price Tag */}
          <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />

          {/* Button Box */}
          <div className="h-9 w-9 bg-slate-200 rounded-xl animate-pulse" />
        </div>

      </div>
    </div>
  );
}
