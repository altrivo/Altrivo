"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { KPICardRow } from "@/components/dashboard/KPICardRow";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { Store, Sparkles, Plus, ArrowRight, ShieldCheck } from "lucide-react";

interface VendorMeData {
  authenticated: boolean;
  vendor: {
    id: string;
    name: string;
    email: string;
    phone: string;
    business_name?: string;
  } | null;
  stores: Array<{
    id: string;
    name: string;
    slug: string;
    subdomain: string;
  }>;
  hasStore: boolean;
  storesCount: number;
}

export function VendorDashboardContent() {
  const [data, setData] = useState<VendorMeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVendorInfo() {
      try {
        const res = await fetch("/api/auth/vendor/me");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch vendor info:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVendorInfo();
  }, []);

  const vendorName = data?.vendor?.name || "Vendor";
  const hasStore = Boolean(data?.hasStore);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* If new vendor with NO store yet, show Dedicated New Vendor View */}
      {!loading && !hasStore && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50/90 via-card to-accent-50/40 p-6 sm:p-10 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-50 text-success-700 text-xs font-bold border border-success-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-success-600" />
                  <span>Vendor Account Verified in Database</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-heading tracking-tight">
                  Welcome, {vendorName}!
                </h2>

                <p className="text-sm text-body leading-relaxed">
                  Aapka vendor account database mein kamyabi se register ho chuka hai. Kyun ke aap new user hain, abhi aapka koi store nahi bana hai. Sab se pehle apna store generate karein. Store banne ke baad aapke store ke tamam products, analytics, aur customer orders yahan aapke dashboard par show hon ge.
                </p>

                <div className="text-xs text-subtle space-y-0.5 pt-1">
                  <div><span className="font-semibold text-heading">Email:</span> {data?.vendor?.email}</div>
                  {data?.vendor?.phone && (
                    <div><span className="font-semibold text-heading">Phone:</span> {data?.vendor?.phone}</div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <Link
                  href="/store-builder"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-md hover:bg-primary-700 active:scale-[0.98] transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Generate Your Store</span>
                </Link>

                <Link
                  href="/onboarding"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-default bg-card hover:bg-sidebar-hover text-heading font-semibold text-xs shadow-2xs active:scale-[0.98] transition-all shrink-0"
                >
                  <span>Setup Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 text-subtle" />
                </Link>
              </div>
            </div>
          </div>

          {/* 3-Step Guided Roadmap */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-success-200 bg-success-50/40 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-success-700">Step 1</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-success-100 font-bold text-success-800">Completed</span>
              </div>
              <h3 className="text-sm font-bold text-heading">Vendor Registration</h3>
              <p className="text-xs text-body">
                Aapka vendor profile database mein verify aur save ho chuka hai.
              </p>
            </div>

            <div className="rounded-xl border border-primary-300 bg-primary-50/50 p-5 space-y-2 shadow-xs ring-1 ring-primary-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-700">Step 2</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-primary-600 font-bold text-white">Action Required</span>
              </div>
              <h3 className="text-sm font-bold text-heading">Generate Your Store</h3>
              <p className="text-xs text-body">
                Apna custom store name, niche aur layout select kar ke store launch karein.
              </p>
              <Link
                href="/store-builder"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-800 pt-1"
              >
                <span>Store generate karein</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="rounded-xl border border-default bg-card/60 p-5 space-y-2 opacity-75">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-subtle">Step 3</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-100 font-bold text-subtle">Pending</span>
              </div>
              <h3 className="text-sm font-bold text-heading">Products & Orders</h3>
              <p className="text-xs text-body">
                Store generate hone ke baad aapke store ke products aur customer orders dashboard par activate hon ge.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* If vendor HAS created store, show Store Status Header + Real KPIs + Recent Orders */}
      {!loading && hasStore && data?.stores?.[0] && (
        <>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 border border-primary-200 text-primary-700 flex items-center justify-center font-bold text-sm shadow-2xs">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-heading">
                    {data.stores[0].name}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success-700 bg-success-50 px-2 py-0.5 rounded-md border border-success-200">
                    <ShieldCheck className="w-3 h-3 text-success-600" />
                    Active Store
                  </span>
                </div>
                <p className="text-xs text-subtle">
                  Store ID: <span className="font-mono">{data.stores[0].id.substring(0, 8)}</span> • {data.stores[0].subdomain}.altrivo.com
                </p>
              </div>
            </div>

            <Link
              href={`/preview/${data.stores[0].slug}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-default bg-card hover:bg-sidebar-hover text-xs font-semibold text-heading shadow-2xs transition-all"
            >
              <span>View Live Storefront</span>
              <ArrowRight className="w-3.5 h-3.5 text-subtle" />
            </Link>
          </div>

          {/* Top Row of 4 KPI Cards strictly for this vendor */}
          <KPICardRow vendorId={data?.vendor?.id} />

          {/* Recent Orders Table strictly for this vendor */}
          <div className="w-full">
            <RecentOrdersTable vendorId={data?.vendor?.id} />
          </div>
        </>
      )}
    </div>
  );
}
