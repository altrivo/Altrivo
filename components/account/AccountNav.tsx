"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { LayoutDashboard, User, Package, Heart, MapPin, LogOut, Bell } from "lucide-react";

export function AccountNav() {
  const pathname = usePathname();
  const { customer, logout } = useCustomerAuth();

  const links = [
    { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/account/profile", label: "My Profile", icon: User },
    { href: "/account/orders", label: "Orders & Tracking", icon: Package },
    { href: "/account/notifications", label: "Alerts & Preferences", icon: Bell },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account/addresses", label: "Addresses", icon: MapPin },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-4 shadow-sm space-y-4">
      {/* Customer summary */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#5c3d5c]/10">
        <div className="w-10 h-10 rounded-full bg-[#3e2845] text-white flex items-center justify-center font-bold text-sm">
          {customer?.name ? customer.name.charAt(0).toUpperCase() : "C"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-black truncate">{customer?.name || "Customer Account"}</p>
          <p className="text-[11px] text-[#5c3d5c] truncate">{customer?.email || "customer@store.com"}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#3e2845] text-white shadow-xs"
                  : "text-black hover:bg-[#3e2845]/5 hover:text-[#3e2845]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#5c3d5c]"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}

        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-all text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-600" />
          <span>Sign Out</span>
        </button>
      </nav>
    </div>
  );
}
