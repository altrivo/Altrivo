"use client";

import React, { useState } from "react";
import { MapPin, Building2 } from "lucide-react";
import { AnalyticsData } from "@/app/api/analytics/route";

interface PakistanGeoHeatmapProps {
  cities: AnalyticsData["pakistanCities"];
}

export function PakistanGeoHeatmap({ cities }: PakistanGeoHeatmapProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>("Karachi");

  const activeCityData = cities.find((c) => c.city === selectedCity) || cities[0];

  return (
    <div className="rounded-2xl bg-card border border-default p-5 sm:p-6 shadow-card space-y-5">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-default pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-600 text-white flex items-center justify-center shadow-md">
            <MapPin className="w-5 h-5 text-accent-100" />
          </div>
          <div>
            <h2 className="font-bold text-base text-heading font-display leading-tight flex items-center gap-2">
              Geographical Visitor Heatmap — Pakistan
            </h2>
            <p className="text-xs text-subtle mt-0.5">
              City-level visitor concentration, traffic share %, and sales revenue
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-accent-100 text-accent-900 border border-accent-300">
          6 Major Urban Hubs
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Interactive Vector Heatmap Map Container (7 cols) */}
        <div className="lg:col-span-7 relative min-h-[320px] rounded-2xl bg-gradient-to-br from-primary-950 via-[#3B2742] to-[#25162A] border border-primary-800/40 p-6 flex items-center justify-center overflow-hidden shadow-inner">
          {/* Subtle Map Ambient Glows */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-500/20 via-transparent to-transparent pointer-events-none" />

          {/* Pakistan Map Outline Graphic */}
          <div className="relative w-full h-[280px] max-w-md mx-auto">
            {/* Outline SVG of Pakistan region */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-primary-700/40 fill-current"
            >
              <path d="M 25 20 Q 40 10 70 25 Q 85 45 75 70 Q 55 95 30 85 Q 15 65 25 20 Z" />
            </svg>

            {/* City Heat Markers */}
            {cities.map((c) => {
              const isSelected = selectedCity === c.city;
              return (
                <div
                  key={c.city}
                  onClick={() => setSelectedCity(c.city)}
                  style={{ left: `${c.coordinates.x}%`, top: `${c.coordinates.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                >
                  {/* Heat Ripple Ring */}
                  <span
                    className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                      isSelected ? "bg-accent-400" : "bg-primary-400"
                    }`}
                    style={{
                      width: `${Math.max(c.sharePercent * 0.8, 14)}px`,
                      height: `${Math.max(c.sharePercent * 0.8, 14)}px`,
                    }}
                  />

                  {/* City Marker Node */}
                  <div
                    className={`relative rounded-full border-2 transition-all duration-fast flex items-center justify-center shadow-lg ${
                      isSelected
                        ? "bg-accent-500 border-white text-white scale-125 z-20"
                        : "bg-primary-600 border-accent-300/60 text-white hover:scale-110 z-10"
                    }`}
                    style={{
                      width: `${Math.max(c.sharePercent * 0.8, 14)}px`,
                      height: `${Math.max(c.sharePercent * 0.8, 14)}px`,
                    }}
                  >
                    <span className="text-[9px] font-extrabold">{c.sharePercent.toFixed(0)}%</span>
                  </div>

                  {/* Tooltip Label */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-extrabold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-md">
                    {c.city} • {c.sharePercent}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: City Concentration Ranking & Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active City Highlight Card */}
          {activeCityData && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-accent-50 to-primary-50 border border-accent-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-primary-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-accent-600" />
                  {activeCityData.city}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-accent-500 text-white">
                  Ranked #{cities.findIndex((c) => c.city === activeCityData.city) + 1}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-subtle font-medium">Visitors:</span>
                  <div className="font-extrabold text-heading text-sm">{activeCityData.visitors}</div>
                </div>
                <div>
                  <span className="text-subtle font-medium">Sales Revenue:</span>
                  <div className="font-extrabold text-primary-700 text-sm">{activeCityData.revenue}</div>
                </div>
              </div>
            </div>
          )}

          {/* City Concentration List */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {cities.map((c) => {
              const isSelected = selectedCity === c.city;
              return (
                <div
                  key={c.city}
                  onClick={() => setSelectedCity(c.city)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-primary-900 text-white border-primary-700 shadow-md"
                      : "bg-muted/30 hover:bg-sidebar-hover border-default text-heading"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        isSelected ? "bg-accent-400 animate-pulse" : "bg-primary-500"
                      }`}
                    />
                    <div className="truncate text-xs font-bold">{c.city}</div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-subtle">{c.visitors}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-primary-100 text-primary-800"
                      }`}
                    >
                      {c.sharePercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
