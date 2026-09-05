"use client";

import React from "react";

interface SparklineProps {
  data: number[];
  trend: "up" | "down";
  height?: number;
  width?: number;
}

export function Sparkline({ data, trend, height = 48, width = 120 }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 4;
  const usableHeight = height - padding * 2;
  const usableWidth = width;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * usableWidth;
    const y = height - padding - ((val - min) / range) * usableHeight;
    return { x, y };
  });

  // Construct smooth SVG path
  const pathD = points.reduce((acc, point, idx) => {
    return idx === 0 ? `M ${point.x},${point.y}` : `${acc} L ${point.x},${point.y}`;
  }, "");

  // Closed area path for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  const strokeColor = trend === "up" ? "#10B981" : "#EF4444";
  const gradientId = `sparkline-grad-${trend}-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={strokeColor}
            stopOpacity={trend === "up" ? 0.35 : 0.25}
          />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>

      {/* Area Fill */}
      <path d={areaD} fill={`url(#${gradientId})`} />

      {/* Smooth Line */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Highlight End Dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="3.5"
        fill={strokeColor}
        className="animate-pulse"
      />
    </svg>
  );
}
