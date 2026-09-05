"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Megaphone,
  Wallet,
  Globe,
  Store,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bell,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export const VENDOR_NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Stores", href: "/my-stores", icon: Store, badge: "AI" },
  { name: "Products", href: "/products", icon: Package },
  { name: "Orders", href: "/orders", icon: ShoppingCart, badge: "New" },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Campaigns", href: "/campaigns", icon: Megaphone },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Domain", href: "/domain", icon: Globe },
  { name: "Storefront", href: "/storefront", icon: Sparkles },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface VendorSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function VendorSidebar({ collapsed, onToggleCollapse }: VendorSidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Expanded whenever cursor is over the sidebar OR if pinned open manually
  const isExpanded = isHovered || !collapsed;

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative hidden xl:flex flex-col border-r border-white/10 text-white transition-all duration-300 ease-in-out z-sticky select-none cursor-pointer ${
        isExpanded ? "w-sidebar" : "w-sidebar-collapsed"
      }`}
      style={{
        backgroundColor: "#3B2742",
        backgroundImage: "linear-gradient(180deg, #2C1C31 0%, #3B2742 50%, #25162A 100%)",
        boxShadow: "4px 0 25px rgba(0,0,0,0.25)",
      }}
    >
      {/* Brand Header */}
      <div className="h-navbar flex items-center justify-between px-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 overflow-hidden group focus:outline-none cursor-pointer"
        >
          <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-accent-300 via-primary-400 to-accent-500 p-[1px] shadow-[0_4px_12px_rgba(0,0,0,0.3)] group-hover:scale-105 transition-transform duration-fast">
            <div className="w-full h-full rounded-[11px] bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-accent-200 animate-pulse" />
            </div>
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-[11px] pointer-events-none" />
          </div>

          {isExpanded && (
            <div className="flex flex-col transition-opacity duration-normal">
              <span className="font-display font-extrabold text-lg leading-tight text-white tracking-tight">
                Altrivo
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-accent-200/80 uppercase">
                Vendor Studio
              </span>
            </div>
          )}
        </Link>

        {/* Manual Pin / Collapse Toggle Button */}
        {isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            aria-label={collapsed ? "Pin sidebar open" : "Collapse sidebar"}
            className="hidden xl:flex items-center justify-center w-8 h-8 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white shadow-xs active:scale-95 transition-all duration-fast cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-white" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Links List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
        {isExpanded && (
          <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-accent-200/70 uppercase tracking-wider">
            Navigation Menu
          </div>
        )}

        {VENDOR_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isLinkActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              title={!isExpanded ? item.name : undefined}
              className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-fast cursor-pointer ${
                active
                  ? "bg-white text-primary-950 shadow-[0_4px_16px_rgba(0,0,0,0.3)] translate-x-1 font-extrabold"
                  : "text-white/80 hover:text-white hover:bg-white/15 active:scale-[0.98]"
              }`}
            >
              {/* Active Indicator Bar */}
              {active && (
                <div className="absolute left-0 inset-y-2 w-1.5 rounded-r-full bg-accent-500 shadow-sm" />
              )}

              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-transform duration-fast ${
                  active ? "text-primary-950 scale-110" : "text-white/80 group-hover:scale-105"
                }`}
              />

              {isExpanded && (
                <span className="flex-1 truncate tracking-tight">
                  {item.name}
                </span>
              )}

              {isExpanded && item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    active
                      ? "bg-primary-950 text-white"
                      : "bg-white/20 text-white border border-white/30"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Pro Badge */}
      {isExpanded && (
        <div className="p-3 m-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex flex-col gap-1.5 text-white">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success-400"></span>
            </span>
            <span className="text-xs font-bold text-white">
              Pro Vendor Store
            </span>
          </div>
          <p className="text-[11px] text-accent-100/80 leading-tight">
            Storefront SSL & Domain Active.
          </p>
        </div>
      )}
    </aside>
  );
}
