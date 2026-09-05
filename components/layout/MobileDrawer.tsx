"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Sparkles, LogOut } from "lucide-react";
import { VENDOR_NAV_ITEMS } from "./VendorSidebar";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();

  // Close drawer when pathname changes
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Lock scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="xl:hidden fixed inset-0 z-modal flex">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-overlay/60 backdrop-blur-sm animate-in fade-in duration-normal"
      />

      {/* Drawer Panel */}
      <div
        className="relative flex-1 max-w-xs w-full bg-card border-r border-default h-full flex flex-col z-modal shadow-modal animate-in slide-in-from-left duration-normal"
      >
        {/* Drawer Header */}
        <div className="h-navbar flex items-center justify-between px-4 border-b border-default bg-card-tint">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-accent-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-heading leading-tight">
                Altrivo Vendor
              </span>
              <span className="text-[10px] font-semibold text-subtle uppercase">
                Studio Menu
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close navigation drawer"
            className="w-8 h-8 rounded-lg border border-default flex items-center justify-center text-subtle hover:text-heading hover:bg-sidebar-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-subtle uppercase tracking-wider">
            Vendor Navigation
          </div>

          {VENDOR_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                  active
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-heading"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    active ? "text-white" : "text-sidebar-icon"
                  }`}
                />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-primary-100 text-primary-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-default bg-muted/20">
          <button
            onClick={() => {
              onClose();
              alert("Signed out");
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-error-200 bg-error-50/50 text-xs font-semibold text-error-600 hover:bg-error-100 transition-colors"
          >
            <LogOut className="w-4 h-4 text-error-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
