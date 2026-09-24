"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  User, 
  Search, 
  X, 
  ChevronDown, 
  Package, 
  CheckCircle2, 
  LogOut, 
  ExternalLink, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Truck,
  Home,
  Info,
  Phone
} from "lucide-react";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/storefront/priceUtils";

export interface NavLink {
  name: string;
  href: string;
  pageKey?: string;
  hasDropdown?: boolean;
  dropdownItems?: { name: string; href: string }[];
}

export interface HeaderStandardProps {
  logoText?: string;
  logoUrlLight?: string;
  logoUrlDark?: string;
  navigation?: NavLink[];
  products?: any[];
  cartItemCount?: number;
  deviceMode?: "desktop" | "tablet" | "mobile";
  activePage?: string;
  storeSlug?: string;
  isEditorMode?: boolean;
  onNavigatePage?: (page: string) => void;
  headerConfig?: any;
  theme?: any;
}

export default function HeaderStandard({
  logoText = "Artisanal Store",
  logoUrlLight = "",
  logoUrlDark = "",
  navigation,
  products = [],
  deviceMode = "desktop",
  activePage = "home",
  storeSlug = "",
  isEditorMode = false,
  onNavigatePage,
  headerConfig,
  theme,
}: HeaderStandardProps) {
  const { 
    itemCount, 
    cartTotal, 
    setIsCartOpen, 
    setIsTrackingOpen, 
    addToCart,
    customer,
    setIsCustomerAuthOpen,
    logoutCustomer
  } = useCart();

  const isMobileMode = deviceMode === "mobile";
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Dynamic base route resolution (e.g. /store/[slug] or /preview/[slug] or "")
  const [baseRoute, setBaseRoute] = useState<string>(() => {
    if (storeSlug) return `/store/${storeSlug}`;
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (p.startsWith("/preview/")) {
        const slug = p.split("/")[2] || storeSlug;
        setBaseRoute(slug ? `/preview/${slug}` : "/preview");
      } else if (p.startsWith("/store/")) {
        const slug = p.split("/")[2] || storeSlug;
        setBaseRoute(slug ? `/store/${slug}` : "/store");
      } else if (storeSlug) {
        setBaseRoute(`/store/${storeSlug}`);
      } else {
        setBaseRoute("");
      }
    }
  }, [storeSlug]);

  const primaryLinks: NavLink[] = [
    { name: "Home", href: baseRoute || "/", pageKey: "home" },
    { name: "About", href: `${baseRoute}/about`, pageKey: "about" },
    { name: "Products", href: `${baseRoute}#products`, pageKey: "products" },
    { name: "Contact", href: `${baseRoute}/contact`, pageKey: "contact" },
  ];

  const categoryLinks = (navigation || []).filter(
    (l) => !["home", "about", "products", "contact"].includes(l.name.toLowerCase())
  );

  // Listen to #tracking hash in URL
  useEffect(() => {
    const handleHashCheck = () => {
      if (typeof window !== "undefined" && window.location.hash === "#tracking") {
        setIsTrackingOpen(true);
      }
    };
    handleHashCheck();
    window.addEventListener("hashchange", handleHashCheck);
    return () => window.removeEventListener("hashchange", handleHashCheck);
  }, [setIsTrackingOpen]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Profile Dropdown State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Live Search Filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const matches = products.filter((p: any) =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.tag?.toLowerCase().includes(q) ||
      p.price?.toLowerCase().includes(q)
    );
    setSearchResults(matches.slice(0, 5));
  }, [searchQuery, products]);

  // Click outside listener for search and profile dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--color-bg,#ffffff)]/95 backdrop-blur-md border-b border-slate-200/70 shadow-sm transition-all">
      {/* ------------------------------------------------------------------- */}
      {/* TOP HEADER ROW: [Logo / Store Name] - [Search Bar] - [Cart & Profile] */}
      {/* ------------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-6">
          
          {/* LEFT: Mobile Menu Toggle + Store Logo / Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl border transition-colors bg-slate-100/80 border-slate-200 text-slate-800 cursor-pointer ${
                isMobileMode ? "flex" : "md:hidden flex"
              }`}
              aria-label="Open menu"
            >
              <div className="w-4.5 h-4.5 flex flex-col justify-between items-center py-0.5">
                <span className="block h-[2px] w-4 rounded-full bg-slate-800" />
                <span className="block h-[2px] w-4 rounded-full bg-slate-800" />
                <span className="block h-[2px] w-4 rounded-full bg-slate-800" />
              </div>
            </button>

            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePage?.("home");
              }}
              className="flex items-center gap-2 select-none group"
            >
              <span
                style={{
                  fontFamily: "var(--font-heading, inherit)",
                  color: "var(--color-text, #0f172a)",
                }}
                className="font-extrabold text-sm sm:text-lg lg:text-xl tracking-tight transition-all duration-200 truncate max-w-[140px] sm:max-w-xs group-hover:text-[var(--color-primary,#0f172a)]"
              >
                {logoText}
              </span>
            </a>
          </div>

          {/* MIDDLE: Interactive Search Bar (Desktop / Tablet) */}
          {!isMobileMode && (
            <div ref={searchContainerRef} className="flex-1 max-w-xl relative hidden sm:block">
              <div className="relative flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 py-2 rounded-2xl bg-slate-100/90 border border-slate-200 text-slate-800 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-[#694873] focus:bg-white transition-all"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {isSearchOpen && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-3 z-50 animate-in fade-in-50 zoom-in-95 space-y-2">
                  <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-100 text-[11px]">
                    <span className="font-bold text-slate-500">
                      Search Results ({searchResults.length})
                    </span>
                    <span className="text-[10px] text-slate-400">Press ESC to close</span>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                      {searchResults.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-slate-800 truncate group-hover:text-[#694873]">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-slate-900">
                                  {formatPrice(item.price)}
                                </span>
                                {item.tag && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    {item.tag}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              addToCart({
                                id: item.id,
                                name: item.name,
                                price: formatPrice(item.price),
                                image: item.image,
                              });
                              setIsSearchOpen(false);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#694873] hover:bg-[#5A3D63] text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all active:scale-95 flex-shrink-0 cursor-pointer"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No products matched "<span className="text-slate-600 font-semibold">{searchQuery}</span>"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* RIGHT: [Mobile Search Icon] + [Add to Cart Button] & [Profile Button + Dropdown] */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            
            {/* Mobile Search Toggle Icon */}
            {isMobileMode && (
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isMobileSearchOpen ? "bg-purple-50 border-purple-300 text-[#694873]" : "bg-slate-100 border-slate-200 text-slate-800"
                }`}
                title="Search products"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* 1. Shopping Bag / Cart Drawer Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 transition-all duration-150 active:scale-95 group cursor-pointer"
              aria-label="Open Cart Drawer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-slate-800 group-hover:text-[#694873] transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#694873] text-white font-extrabold text-[9px] flex items-center justify-center shadow-md">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-extrabold text-slate-900 hidden lg:inline">
                {itemCount > 0 ? cartTotal : "Cart"}
              </span>
            </button>

            {/* 2. Customer Auth Button / Profile Dropdown Menu */}
            {!customer ? (
              <button
                onClick={() => {
                  setIsCustomerAuthOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl border border-slate-200 bg-slate-100/90 hover:bg-purple-50 hover:border-purple-300 text-slate-800 hover:text-[#694873] text-xs font-extrabold transition-all active:scale-95 shadow-2xs cursor-pointer"
                title="Customer Sign In & Account"
              >
                <div className="w-4 h-4 rounded-full bg-[#694873] flex items-center justify-center text-white text-[9px]">
                  <User className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="hidden sm:inline">Sign In</span>
              </button>
            ) : (
              <div ref={profileDropdownRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all duration-150 active:scale-95 cursor-pointer ${
                    isProfileOpen
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800"
                  }`}
                  aria-label="Customer Profile"
                >
                  <div className="w-6 h-6 rounded-full bg-[#694873] flex items-center justify-center text-white font-extrabold text-[10px] shadow-xs">
                    {customer.name
                      ? customer.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "CU"}
                  </div>
                  <span className="text-xs font-bold truncate max-w-[100px] hidden sm:inline">
                    {customer.name?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isProfileOpen ? "rotate-180 text-white" : "text-slate-500"
                    }`}
                  />
                </button>

                {/* Profile Dropdown Card */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-3 z-50 animate-in fade-in-50 zoom-in-95 space-y-2.5">
                    {/* Customer Info Card */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#694873] flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                        {customer.name
                          ? customer.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          : "CU"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs text-slate-800 block truncate">
                          {customer.name}
                        </span>
                        <p className="text-[10px] text-slate-400 truncate">
                          {customer.email}
                        </p>
                        {customer.phone && (
                          <p className="text-[10px] text-slate-500 font-mono">
                            {customer.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Menu Options */}
                    <div className="space-y-1 pt-1 border-t border-slate-100 text-xs">
                      {/* My Orders & Tracking */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsTrackingOpen(true);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors font-semibold text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-slate-500" />
                          <span>My Orders &amp; Tracking</span>
                        </div>
                      </button>

                      {/* View Cart Drawer */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsCartOpen(true);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors font-semibold text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShoppingBag className="w-4 h-4 text-slate-500" />
                          <span>Shopping Bag</span>
                        </div>
                        {itemCount > 0 && (
                          <span className="font-extrabold text-[11px] text-[#694873]">
                            {itemCount} items
                          </span>
                        )}
                      </button>

                      {/* WhatsApp Vendor Help */}
                      <a
                        href="https://wa.me/923001234567"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-purple-50/50 text-slate-700 hover:text-[#694873] transition-colors font-semibold"
                      >
                        <div className="flex items-center gap-2.5">
                          <MessageCircle className="w-4 h-4 text-[#694873]" />
                          <span>WhatsApp Support</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>

                    {/* Sign Out Action */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logoutCustomer();
                        }}
                        className="w-full p-2 rounded-xl hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors font-semibold text-xs flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                        <span>Sign Out Account</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Mobile Search Bar Dropdown Row */}
        {isMobileMode && isMobileSearchOpen && (
          <div className="pt-2.5 pb-1 animate-in fade-in-50 slide-in-from-top-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search store products..."
                autoFocus
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Dropdown Search Results */}
            {searchQuery.trim().length > 0 && (
              <div className="mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 space-y-1.5 max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded-md object-cover bg-slate-100 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[11px] text-slate-800 truncate">{item.name}</p>
                          <span className="font-extrabold text-[11px] text-emerald-700">{item.price}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addToCart({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            image: item.image,
                          });
                          setIsMobileSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="px-2 py-1 rounded-md bg-[#694873] text-white font-bold text-[10px] flex items-center gap-1 active:scale-95 cursor-pointer"
                      >
                        <ShoppingBag className="w-2.5 h-2.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-center text-xs text-slate-400">No products found for "{searchQuery}"</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* SUB-HEADER ROW: 4 Core Store Pages (Home, About, Shop, Contact)     */}
      {/* ------------------------------------------------------------------- */}
      {/* ------------------------------------------------------------------- */}
      {/* SUB-HEADER ROW: 4 Core Store Pages (Home, About, Shop, Contact)     */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-slate-900 text-slate-200 border-t border-slate-800/80 px-3 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 sm:gap-10">
          {/* Strictly 4 Core Store Navigation Pages in Center */}
          {primaryLinks.map((link) => {
            const isPageActive = activePage === link.pageKey;
            const activeColor = headerConfig?.activeIndicatorColor || headerConfig?.hoverColor || theme?.colors?.primary || "#B88BC5";
            const hoverColor = headerConfig?.hoverColor || theme?.colors?.primary || "#D4AF37";
            const linkClasses = `relative py-1 px-1 text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer group flex flex-col items-center ${
              isPageActive
                ? "font-extrabold"
                : "text-slate-300 hover:text-white font-semibold"
            }`;

            const activeIndicator = (
              <span
                className={`block h-[2.5px] rounded-full transition-all duration-200 mt-1 ${
                  isPageActive
                    ? "w-full shadow-xs"
                    : "w-0 group-hover:w-full"
                }`}
                style={{
                  backgroundColor: isPageActive ? activeColor : hoverColor,
                }}
              />
            );

            if (isEditorMode) {
              return (
                <button
                  key={link.name}
                  onClick={(e) => {
                    e.preventDefault();
                    if (link.pageKey && onNavigatePage) {
                      onNavigatePage(link.pageKey);
                    }
                  }}
                  className={linkClasses}
                >
                  <span>{link.name}</span>
                  {activeIndicator}
                </button>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => {
                  if (link.pageKey && onNavigatePage) {
                    onNavigatePage(link.pageKey);
                  }
                }}
                className={linkClasses}
              >
                <span>{link.name}</span>
                {activeIndicator}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Drawer (Responsive for Mobile Preview Frame and Real Phone) */}
      {isMobileMenuOpen && (
        <div className={`fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex ${isMobileMode ? "" : "md:hidden"}`}>
          <div className="w-72 max-w-[80vw] bg-white h-full shadow-2xl p-5 flex flex-col justify-between border-r border-slate-200 animate-in slide-in-from-left-4 duration-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-extrabold text-slate-900 text-sm truncate">{logoText}</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation List - 4 Core Pages with Clean Lucide Icons */}
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider px-2">Store Navigation</p>
                <nav className="flex flex-col gap-1.5 pt-1">
                  {primaryLinks.map((link) => {
                    const isPageActive = activePage === link.pageKey;
                    const PageIcon = link.pageKey === "home" ? Home : link.pageKey === "about" ? Info : link.pageKey === "shop" ? ShoppingBag : Phone;
                    const itemClasses = `w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isPageActive
                        ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 font-extrabold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`;

                    const itemContent = (
                      <>
                        <div className="flex items-center gap-2.5">
                          <PageIcon className={`w-4 h-4 ${isPageActive ? "text-emerald-600" : "text-slate-500"}`} />
                          <span>{link.name}</span>
                        </div>
                        {isPageActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      </>
                    );

                    if (isEditorMode) {
                      return (
                        <button
                          key={link.name}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            if (link.pageKey && onNavigatePage) {
                              onNavigatePage(link.pageKey);
                            }
                          }}
                          className={itemClasses}
                        >
                          {itemContent}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          if (link.pageKey && onNavigatePage) {
                            onNavigatePage(link.pageKey);
                          }
                        }}
                        className={itemClasses}
                      >
                        {itemContent}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Track Order */}
              <div className="border-t border-slate-100 pt-3">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsTrackingOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 text-left cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Track My Order</span>
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Open Cart ({itemCount})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

