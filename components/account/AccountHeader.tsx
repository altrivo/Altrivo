"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

export function AccountHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { totalItemCount, openDrawer } = useCart();
  const { customer } = useCustomerAuth();

  return (
    <header className="bg-white border-b border-[#5c3d5c]/20 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-[#5c3d5c] hover:text-[#3e2845] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </Link>
          <span className="text-[#5c3d5c]/30">|</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#3e2845] text-white flex items-center justify-center font-bold text-xs">
              D
            </div>
            <span className="text-xs font-bold text-black font-display tracking-tight">
              Customer Account
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openDrawer}
            className="relative p-2 rounded-xl text-black hover:bg-[#3e2845]/5 transition-colors cursor-pointer"
            aria-label="View Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5 text-[#3e2845]" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#3e2845] text-white text-[10px] font-bold flex items-center justify-center">
                {totalItemCount}
              </span>
            )}
          </button>

          {customer ? (
            <Link
              href="/account"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#5c3d5c]/20 text-xs font-semibold text-black hover:bg-[#3e2845]/5"
            >
              <User className="w-3.5 h-3.5 text-[#5c3d5c]" />
              <span className="truncate max-w-[120px]">{customer.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-[#3e2845] text-white text-xs font-bold hover:bg-[#4b3254]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
