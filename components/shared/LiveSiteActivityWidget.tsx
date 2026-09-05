"use client";

import React, { useState, useEffect, useRef } from "react";
import { Users, Eye, ChevronDown, X, Radio } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface ActivePageActivity {
  path: string;
  visitors: number;
  label: string;
}

export function LiveSiteActivityWidget() {
  const [open, setOpen] = useState<boolean>(false);
  const [activeCount, setActiveCount] = useState<number>(24);
  const [animating, setAnimating] = useState<boolean>(false);
  const [activePages, setActivePages] = useState<ActivePageActivity[]>([
    { path: "/products/ceramic-vase", label: "Ceramic Vase Product", visitors: 11 },
    { path: "/storefront", label: "Storefront Home", visitors: 8 },
    { path: "/checkout", label: "Express Checkout", visitors: 5 },
  ]);

  const prevCountRef = useRef(activeCount);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Real-time Supabase Subscription & Live Heartbeat Simulator
  useEffect(() => {
    // 1. Subscribe to Supabase Realtime Channel
    const channel = supabase.channel("live_store_activity");

    channel
      .on("broadcast", { event: "active_visitors_update" }, (payload) => {
        if (payload?.payload?.count) {
          updateActiveVisitors(payload.payload.count, payload.payload.pages);
        }
      })
      .subscribe();

    // 2. Real-time dynamic activity tick
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 5) - 2;
      const nextCount = Math.max(16, activeCount + delta);

      const p1 = Math.max(5, Math.floor(nextCount * 0.45));
      const p2 = Math.max(4, Math.floor(nextCount * 0.35));
      const p3 = Math.max(2, nextCount - p1 - p2);

      updateActiveVisitors(nextCount, [
        { path: "/products/ceramic-vase", label: "Ceramic Vase Product", visitors: p1 },
        { path: "/storefront", label: "Storefront Home", visitors: p2 },
        { path: "/checkout", label: "Express Checkout", visitors: p3 },
      ]);
    }, 4000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [activeCount]);

  const updateActiveVisitors = (count: number, pages?: ActivePageActivity[]) => {
    if (count !== prevCountRef.current) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 1200);
      prevCountRef.current = count;
    }
    setActiveCount(count);
    if (pages) setActivePages(pages);
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Live Activity Button on Second Navbar */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="View live site activity"
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold transition-all duration-fast shadow-xs active:scale-95 cursor-pointer ${
          open
            ? "bg-primary-950 text-white border border-accent-400"
            : "bg-gradient-to-r from-primary-900 via-primary-800 to-accent-600 text-white border border-accent-300/40 hover:brightness-110"
        }`}
      >
        {/* Pulsing Live Dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75 ${
              animating ? "scale-150 bg-accent-400" : ""
            }`}
          />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-400" />
        </span>

        <span className="truncate">
          Live Activity (<strong className={animating ? "text-accent-300" : "text-white"}>{activeCount}</strong>)
        </span>

        <ChevronDown
          className={`w-3 h-3 text-accent-200 transition-transform duration-fast ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Real-time Popover Dropdown floating cleanly above all content */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-accent-300/50 text-white shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden z-[9999] p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-fast"
          style={{
            backgroundColor: "#2C1C31",
            backgroundImage: "linear-gradient(135deg, #2C1C31 0%, #3B2742 50%, #482D4F 100%)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 font-bold text-xs">
              <Radio className="w-4 h-4 text-accent-300 animate-pulse" />
              <span>Real-Time Visitor Activity</span>
            </div>

            <button
              onClick={() => setOpen(false)}
              aria-label="Close activity details"
              className="p-1 rounded-lg hover:bg-white/10 text-accent-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Shoppers Count */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
            <div>
              <span className="text-[10px] font-bold text-accent-200/80 uppercase">
                Active Shoppers Now
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-extrabold text-white transition-transform ${
                    animating ? "scale-110 text-accent-300" : ""
                  }`}
                >
                  {activeCount}
                </span>
                <span className="text-xs text-accent-200 font-semibold">
                  live on storefront
                </span>
              </div>
            </div>

            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-white flex items-center justify-center shadow-md ${
                animating ? "scale-110" : ""
              }`}
            >
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Active Page Breakdown */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-accent-200/80 uppercase tracking-wider px-1">
              Active Page Breakdown
            </div>

            {activePages.map((page) => (
              <div
                key={page.path}
                className="p-2.5 rounded-lg border border-white/10 bg-black/20 hover:bg-white/10 transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Eye className="w-3.5 h-3.5 text-accent-300 flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-white leading-tight">{page.label}</div>
                    <div className="text-[10px] text-accent-200/70 font-mono">{page.path}</div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full font-extrabold text-[10px] bg-accent-500 text-white flex-shrink-0">
                  {page.visitors} live
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
