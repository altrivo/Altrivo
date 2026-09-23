"use client";

import {
  Heart,
  Menu,
  PhoneCall,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";

import { VendorStoreConfig } from "@/lib/storefront/themeResolver";



interface StorefrontHeaderProps {
  config: VendorStoreConfig;
}

function SearchForm({ searchQuery, setSearchQuery, handleSearchSubmit }: {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
}) {
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const q = searchParams?.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams, setSearchQuery]);

  return (
    <form
      role="search"
      onSubmit={handleSearchSubmit}
      className="hidden md:flex items-center flex-1 max-w-lg relative"
    >
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none" />
      <input
        type="text"
        id="storefront-search-input"
        aria-label="Search storefront catalog"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search products..."
        className="w-full h-input pl-10 pr-24 rounded-xl bg-input border border-default text-xs text-heading placeholder:text-subtle shadow-xs focus:outline-none focus:border-focus focus:ring-2 focus:ring-primary-500/20 transition-all"
      />
      <button
        type="submit"
        aria-label="Submit Search"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold text-xs shadow-xs hover:brightness-110 active:scale-95 transition-all"
      >
        Search
      </button>
    </form>
  );
}

export function StorefrontHeader({ config }: StorefrontHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = 3;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-sticky bg-card/95 backdrop-blur-xl border-b border-default shadow-xs transition-all">
      {/* Top Banner Bar */}
      <div
        className="text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-between"
        style={{
          backgroundColor: "#3B2742",
          backgroundImage: "linear-gradient(90deg, #2C1C31 0%, #3B2742 50%, #482D4F 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <span className="hidden sm:flex items-center gap-1.5 text-accent-200">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-300" />
            Verified Official Merchant Store
          </span>

          <p className="text-[11px] sm:text-xs mx-auto sm:mx-0 font-medium">
            🎉 Free Shipping across Pakistan on orders over <strong>{config.freeShippingThreshold || "₨ 5,000"}</strong>!
          </p>

          <a
            href={config.socialLinks.find((s) => s.icon === "whatsapp")?.href || "https://wa.me/923001234567"}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 text-accent-200 hover:text-white transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Vendor Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 via-primary-500 to-primary-800 p-[1px] shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[11px] bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-accent-200" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl leading-tight text-heading tracking-tight">
              {config.logoText}
            </span>
            <span className="text-[10px] font-semibold text-subtle truncate max-w-[180px]">
              {config.tagline}
            </span>
          </div>
        </Link>

        {/* Global Product Search Bar wrapped in Suspense */}
        <Suspense fallback={
          <div className="hidden md:flex items-center flex-1 max-w-lg h-input rounded-xl bg-input border border-default" />
        }>
          <SearchForm
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchSubmit={handleSearchSubmit}
          />
        </Suspense>

        {/* Right Customer Action Links: Wishlist & Cart */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Wishlist"
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl border border-default bg-card hover:bg-sidebar-hover text-heading shadow-xs active:scale-95 transition-all"
          >
            <Heart className="w-5 h-5 text-subtle hover:text-accent-600 transition-colors" />
          </Link>

          <Link
            href="/cart"
            aria-label="Shopping Cart"
            className="relative flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-accent-300 bg-accent-50 hover:bg-accent-100 text-accent-900 font-extrabold text-xs shadow-xs active:scale-95 transition-all"
          >
            <ShoppingCart className="w-5 h-5 text-accent-700" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 text-white text-[10px] font-extrabold px-1 shadow-sm animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-default bg-card text-heading shadow-xs"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Categories Navigation Bar (SSR links) */}
      <nav aria-label="Product categories" className="hidden md:block border-t border-default bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-6 overflow-x-auto scrollbar-none py-2 text-xs font-bold text-subtle">
          {config.categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="hover:text-primary-700 hover:underline transition-colors whitespace-nowrap py-1"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-default bg-card p-4 space-y-4 animate-in slide-in-from-top-2 duration-fast">
          <form role="search" onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
            <input
              type="text"
              aria-label="Mobile search storefront catalog"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full h-input pl-10 pr-4 rounded-xl bg-input border border-default text-xs text-heading"
            />
          </form>

          <div className="space-y-1 divide-y divide-default">
            {config.categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 text-xs font-bold text-heading hover:text-primary-600"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

