"use client";

import React from "react";
import { Eye, Users, Clock, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Sparkline } from "../dashboard/Sparkline";
import { AnalyticsData } from "@/app/api/analytics/route";

interface TrafficOverviewCardsProps {
  overview: AnalyticsData["trafficOverview"];
  isLive?: boolean;
  loading?: boolean;
}

export function TrafficOverviewCards({ overview, isLive, loading }: TrafficOverviewCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-card border border-default shadow-card space-y-3 animate-pulse">
            <div className="h-4 w-24 skeleton-bone" />
            <div className="h-8 w-32 skeleton-bone" />
            <div className="h-4 w-20 skeleton-bone" />
          </div>
        ))}
      </div>
    );
  }

  // Use real sparklines if provided, else fallback static data
  const sparklineVisits  = (overview.sparklineVisits  && overview.sparklineVisits.length  > 0)
    ? overview.sparklineVisits
    : [12000, 14500, 16000, 15200, 17800, 19100, 21500];

  const sparklineUnique  = (overview.sparklineUnique  && overview.sparklineUnique.length  > 0)
    ? overview.sparklineUnique
    : [8500, 9200, 10100, 9800, 11200, 12000, 13400];

  const cards = [
    {
      title: "Total Visits",
      value: overview.totalVisits,
      change: overview.visitsChange,
      icon: Eye,
      trend: "up" as const,
      sparkline: sparklineVisits,
      iconBg: "bg-primary-50 text-primary-600 border border-primary-200",
    },
    {
      title: "Unique Visitors",
      value: overview.uniqueVisitors,
      change: overview.uniqueChange,
      icon: Users,
      trend: "up" as const,
      sparkline: sparklineUnique,
      iconBg: "bg-accent-50 text-accent-600 border border-accent-200",
    },
    {
      title: "Avg Session Duration",
      value: overview.avgSessionDuration,
      change: overview.durationChange,
      icon: Clock,
      trend: "up" as const,
      sparkline: [2.8, 3.0, 3.1, 3.2, 3.4, 3.5, parseFloat(overview.avgSessionDuration) || 3.7],
      iconBg: "bg-info-50 text-info-600 border border-info-200",
    },
    {
      title: "Bounce Rate",
      value: overview.bounceRate,
      change: overview.bounceChange,
      icon: Activity,
      trend: overview.bounceChange < 0 ? ("up" as const) : ("down" as const),
      sparkline: [38.2, 37.0, 36.1, 35.4, 34.2, 33.0, parseFloat(overview.bounceRate) || 32.4],
      iconBg: "bg-warning-50 text-warning-600 border border-warning-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card) => {
          const Icon  = card.icon;
          const isUp  = card.change >= 0;

          return (
            <div
              key={card.title}
              className="rounded-2xl bg-card border border-default p-5 shadow-card hover:shadow-card-hover transition-all duration-normal flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-subtle uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-display font-extrabold text-heading tracking-tight">
                  {card.value}
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
                    {isUp ? `+${card.change}%` : `${card.change}%`}
                  </span>
                  <span className="text-[11px] text-subtle font-medium">vs prev period</span>
                </div>
              </div>

              <div className="pt-2 border-t border-default/60">
                <Sparkline data={card.sparkline} trend={card.trend} height={36} />
              </div>
            </div>
          );
        })}
      </div>
  );
}
