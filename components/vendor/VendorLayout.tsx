"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Wallet, Megaphone } from "@/components/shared/LucideIcons";

interface VendorLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "/demo", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Orders", href: "/orders", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  { label: "Products", href: "/products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { label: "Meta Campaigns", href: "/campaigns", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.684A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.316z" },
  { label: "Email Marketing", href: "/email", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { label: "Wallet & VCC", href: "/wallet", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { label: "Shopping Cart", href: "/cart", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" },
  { label: "Customers", href: "/customers", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { label: "Sales Analytics", href: "/analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { label: "Settings", href: "/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
];

export function VendorLayout({ children }: VendorLayoutProps) {
  const pathname = usePathname();
  const { openDrawer, totalItemCount } = useCart();

  return (
    <div className="min-h-dvh bg-muted flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-16 border-b border-default bg-card px-4 sm:px-6 flex items-center justify-between sticky top-0 z-sticky shadow-xs">
        <Link href="/orders" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary-500 flex items-center justify-center text-on-primary font-bold font-display text-lg shadow-sm">
            A
          </div>
          <span className="font-extrabold text-lg text-heading font-display tracking-tight">
            Altrio <span className="text-xs font-bold text-heading uppercase tracking-wider">Vendor Portal</span>
          </span>
        </Link>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Wallet Link */}
          <Link
            href="/wallet"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success-50 text-xs font-bold text-success-900 border border-success-200 hover:bg-success-100 transition-all"
            title="Vendor Wallet & VCC"
          >
            <Wallet size={16} className="text-success-600" />
            <span>Wallet: $4,250.00</span>
          </Link>

          {/* Quick Campaigns Link */}
          <Link
            href="/campaigns"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 text-xs font-bold text-heading hover:bg-neutral-200 transition-all border border-default"
          >
            <Megaphone size={16} className="text-primary-600" />
            <span>Campaigns</span>
          </Link>

          {/* Cart Drawer Trigger */}
          <button
            onClick={openDrawer}
            className="p-2 rounded-xl bg-primary-50 text-primary-900 font-extrabold flex items-center gap-2 border border-primary-200 hover:bg-primary-100 transition-all shadow-xs"
            title="Open Slide-Out Cart Drawer"
          >
            <ShoppingCart size={18} className="text-primary-600" />
            <span className="text-xs font-mono hidden sm:inline">Cart Drawer</span>
            <span className="h-5 min-w-[20px] rounded-full bg-primary-500 text-on-primary px-1.5 text-[11px] font-mono font-extrabold flex items-center justify-center shadow-xs">
              {totalItemCount}
            </span>
          </button>

          {/* Profile Settings Link */}
          <Link href="/settings" className="flex items-center gap-2.5 pl-2 border-l border-default group">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center font-extrabold text-primary-800 text-xs border border-primary-200 group-hover:bg-primary-200 transition-colors">
              TS
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-heading group-hover:text-primary-600 transition-colors">Tahleel Studio</div>
              <div className="text-xs font-semibold text-body">vendor@altrio.com</div>
            </div>
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-default bg-sidebar p-4 hidden md:block shrink-0">
          <div className="space-y-1">
            <p className="px-3 text-xs font-extrabold uppercase text-heading tracking-wider mb-2">
              Vendor Menu
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "#" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-900 font-extrabold border-l-4 border-primary-500 shadow-xs"
                      : "text-heading hover:bg-neutral-100 hover:text-heading"
                  }`}
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Main Content Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
