import React from "react";
import Link from "next/link";
import { Plus, Megaphone, Sparkles, ArrowUpRight } from "lucide-react";
import { KPICardRow } from "@/components/dashboard/KPICardRow";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { QuickActionsWidget } from "@/components/dashboard/QuickActionsWidget";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* 3D Welcome Banner with Equal Purple & Rose Pink Marketplace Styling */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl"
        style={{
          backgroundColor: "#3B2742",
          backgroundImage:
            "linear-gradient(135deg, #2C1C31 0%, #3B2742 45%, #482D4F 100%)",
          boxShadow:
            "0 20px 40px -15px rgba(59,39,66,0.5), 0 4px 10px rgba(0,0,0,0.15)",
        }}
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-accent-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 rounded-full bg-primary-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-accent-200 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Marketplace Vendor Studio V2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
              Welcome back, Artrivo Vendor!
            </h1>
            <p className="text-sm text-accent-100/90 leading-relaxed">
              Your store generated <span className="font-bold text-white">₨ 124,890.00</span> in revenue over the last 7 days with a 98.4% fulfillment rate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/products?action=new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-400 to-accent-500 text-primary-950 font-extrabold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-primary-950" />
              <span>Add Product</span>
            </Link>
            <Link
              href="/campaigns?action=new"
              className="px-4 py-2.5 rounded-xl bg-white/15 border border-white/30 text-white font-semibold text-xs hover:bg-white/25 active:scale-95 transition-all backdrop-blur-md flex items-center gap-2 cursor-pointer"
            >
              <Megaphone className="w-4 h-4 text-accent-200" />
              <span>Launch Campaign</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Row of 4 KPI Cards: Total Sales Today (₨), Orders Today (count), Site Views (count), Conversion Rate (%) */}
      <KPICardRow />

      {/* Below KPIs Row: (a) Recent Orders Table (2/3 width) + (b) Quick Actions Widget (1/3 width) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <RecentOrdersTable />
        </div>
        <div className="lg:col-span-1">
          <QuickActionsWidget />
        </div>
      </div>

      {/* Quick Access Links to all 9 Routes with Single-Click Action */}
      <div className="rounded-2xl bg-card border border-default p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-heading flex items-center gap-2 font-display">
            <Sparkles className="w-4 h-4 text-accent-500" />
            Quick Vendor Modules
          </h2>
          <span className="text-xs text-subtle">9 Navigation Routes</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { title: "Products", href: "/products", count: "142 items" },
            { title: "Orders", href: "/orders", count: "12 pending" },
            { title: "Analytics", href: "/analytics", count: "Realtime" },
            { title: "Campaigns", href: "/campaigns", count: "2 active" },
            { title: "Wallet", href: "/wallet", count: "₨ 245,000 ready" },
            { title: "Domain", href: "/domain", count: "Verified" },
            { title: "Storefront", href: "/storefront", count: "Live V2" },
            { title: "Settings", href: "/settings", count: "Config" },
            { title: "Profile", href: "/profile", count: "Pro Vendor" },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="p-3.5 rounded-xl border border-default bg-muted/40 hover:bg-accent-50/50 hover:border-accent-400 text-left transition-all active:scale-95 group cursor-pointer"
            >
              <div className="font-bold text-xs text-heading group-hover:text-accent-700 flex items-center justify-between">
                <span>{item.title}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-accent-600" />
              </div>
              <span className="text-[10px] text-subtle block mt-0.5">
                {item.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
