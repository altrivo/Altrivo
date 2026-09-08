"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BillingHistoryTable } from "@/components/billing/BillingHistoryTable";
import { FAQAccordion } from "@/components/billing/FAQAccordion";
import { PlanCards } from "@/components/billing/PlanCards";
import { WalletTopUpModal } from "@/components/billing/WalletTopUpModal";
import { ArrowRight } from "lucide-react";
import {
  BillingState,
  getBillingState,
  saveBillingState,
  InvoiceItem,
} from "@/lib/settings";

export default function BillingPage() {
  const [billingState, setBillingState] = useState<BillingState | null>(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  useEffect(() => {
    setBillingState(getBillingState());
  }, []);

  if (!billingState) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-page">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const updateBillingState = (updater: (prev: BillingState) => BillingState) => {
    setBillingState((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      saveBillingState(next);
      return next;
    });
  };

  const handleTopUpSuccess = (amount: number, gateway: string) => {
    updateBillingState((prev) => {
      const newInvoice: InvoiceItem = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `TOP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        description: `Wallet Top-Up (${gateway})`,
        amount: amount,
        paymentMethod: gateway,
        status: "Paid",
        downloadUrl: "#",
      };

      return {
        ...prev,
        walletBalance: prev.walletBalance + amount,
        invoices: [newInvoice, ...prev.invoices],
      };
    });
  };

  return (
    <div className="min-h-dvh bg-page text-body flex">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex w-64 border-r border-default bg-sidebar flex-col justify-between p-4 sticky top-0 h-dvh">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1">
            <div className="h-9 w-9 rounded-xl bg-primary-500 text-on-primary font-black flex items-center justify-center text-lg shadow-md">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-heading text-base tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                Altrivo Vendor
              </span>
              <span className="text-[10px] text-subtle font-medium uppercase tracking-wider">
                Store Console
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-text hover:bg-sidebar-hover text-sm font-medium transition-colors"
            >
              <svg className="w-5 h-5 text-subtle" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l1.293 1.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/billing"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-50 text-primary-700 font-semibold text-sm border-l-4 border-primary-500"
            >
              <svg className="w-5 h-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 5H4V6h12v3zm-3 7H7a1 1 0 110-2h6a1 1 0 110 2z" clipRule="evenodd" />
              </svg>
              <span>Plans &amp; Billing</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-text hover:bg-sidebar-hover text-sm font-medium transition-colors"
            >
              <svg className="w-5 h-5 text-subtle" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span>Profile Settings</span>
            </Link>
          </nav>
        </div>

        {/* Wallet Balance Widget */}
        <div className="p-4 rounded-2xl bg-card border border-default space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-subtle">
            Vendor Wallet Balance
          </span>
          <div className="text-xl font-extrabold text-heading font-mono" style={{ fontFamily: "var(--font-display)" }}>
            ${billingState.walletBalance.toFixed(2)}
          </div>
          <button
            type="button"
            onClick={() => setShowTopUpModal(true)}
            className="w-full py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-on-primary text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            + Top Up Wallet
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-default bg-card px-4 md:px-8 flex items-center justify-between sticky top-0 z-sticky">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
              Plans &amp; Vendor Wallet Billing
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowTopUpModal(true)}
              className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-on-primary text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              + Top Up Wallet
            </button>
          </div>
        </header>

        {/* Page Container */}
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10">
          {/* Wallet Balance Hero Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 p-6 md:p-8 text-white shadow-xl border border-primary-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/30 text-accent-200 border border-primary-400/30 text-xs font-bold">
                <span>Active Plan: Growth ($79/mo)</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                Vendor Ad &amp; Logistics Wallet
              </h2>
              <p className="text-primary-200 text-xs md:text-sm max-w-md">
                Use your wallet balance to run target promotion campaigns, print automated courier shipping labels, and manage store domain renewals.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 min-w-[220px] text-right space-y-2">
              <span className="text-xs text-primary-200 uppercase font-semibold tracking-wider block">
                Available Wallet Funds
              </span>
              <div className="text-3xl md:text-4xl font-extrabold text-white font-mono">
                ${billingState.walletBalance.toFixed(2)}
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(true)}
                  className="px-4 py-2 rounded-xl bg-accent-200 hover:bg-white text-primary-950 text-xs font-bold shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Top Up Funds</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 3 Plan Cards (Starter / Growth / Scale) */}
          <PlanCards
            currentPlanId={billingState.currentPlanId}
            billingCycle={billingState.billingCycle}
            onSelectPlan={(planId, cycle) =>
              updateBillingState((prev) => ({
                ...prev,
                currentPlanId: planId,
                billingCycle: cycle,
              }))
            }
          />

          {/* FAQ Accordion & Enterprise Contact Link */}
          <FAQAccordion />

          {/* Billing History Table */}
          <BillingHistoryTable invoices={billingState.invoices} />
        </div>
      </main>

      {/* Wallet Top-Up Modal */}
      <WalletTopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onTopUpSuccess={handleTopUpSuccess}
      />
    </div>
  );
}
