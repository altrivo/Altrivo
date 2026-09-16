"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import {
  MessageSquare,
  ShieldCheck,
  Globe,
  Share2,
  ChevronUp,
  ChevronDown,
  Check,
  AlertCircle,
  Loader2,
  Truck,
  RotateCcw,
  Lock,
  Headphones,
  Store,
  ArrowRight,
  ExternalLink,
  CreditCard,
  PackageCheck,
} from "lucide-react";

export interface FooterLink {
  name: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterDetailedProps {
  storeName?: string;
  tagline?: string;
  description?: string;
  copyrightText?: string;
  sections?: FooterSection[];
  socialLinks?: { name: string; href: string; icon: string }[];
  categories?: { name?: string; title?: string; href?: string }[];
  supportPhone?: string;
  supportEmail?: string;
  policies?: { title: string; href: string }[];
}

export default function FooterDetailed({
  storeName = "Artisanal Store",
  tagline,
  description,
  copyrightText,
  sections,
  socialLinks,
  categories,
  supportPhone = "+92 300 1234567",
  supportEmail = "support@altrivo.com",
  policies,
}: FooterDetailedProps) {
  const shouldReduceMotion = useReducedMotion();
  const [openColumns, setOpenColumns] = useState<Record<string, boolean>>({});
  const [showBackToTop, setShowBackToTop] = useState(false);

  // States for Language/Currency Upward Dropdown selectors
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState("English (PKR)");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Newsletter Form states
  const [email, setEmail] = useState("");
  const [newsError, setNewsError] = useState("");
  const [newsStatus, setNewsStatus] = useState<"idle" | "submitting" | "success">("idle");

  // Format effective display tagline/description
  const effectiveTagline =
    tagline ||
    description ||
    `Curating premium authentic collections across Pakistan with verified escrow protection and instant Cash on Delivery.`;

  // Dynamic quick categories
  const dynamicCategories: FooterLink[] =
    categories && categories.length > 0
      ? categories.slice(0, 5).map((c) => ({
          name: c.name || c.title || "Category",
          href: c.href || "#catalog",
        }))
      : [
          { name: "New Arrivals", href: "#catalog" },
          { name: "Featured Catalog", href: "#catalog" },
          { name: "Best Sellers", href: "#catalog" },
          { name: "Special Offers", href: "#promotions" },
        ];

  // Dynamic customer service policies
  const dynamicPolicies: FooterLink[] =
    policies && policies.length > 0
      ? policies.map((p) => ({ name: p.title, href: p.href }))
      : [
          { name: "Track My Order", href: "#track-order" },
          { name: "Shipping & Delivery Times", href: "#shipping" },
          { name: "7-Day Return Policy", href: "#returns" },
          { name: "Cash on Delivery FAQs", href: "#cod-policy" },
        ];

  // Default directory sections if none passed
  const effectiveSections: FooterSection[] =
    sections && sections.length > 0
      ? sections
      : [
          {
            title: "Explore Store",
            links: dynamicCategories,
          },
          {
            title: "Customer Care",
            links: dynamicPolicies,
          },
          {
            title: "Trust & Policies",
            links: [
              { name: "Escrow Buyer Protection", href: "#escrow" },
              { name: "Authenticity Guarantee", href: "#guarantee" },
              { name: "Privacy Policy", href: "#privacy" },
              { name: "Terms of Service", href: "#terms" },
            ],
          },
        ];

  // Default social links
  const effectiveSocials =
    socialLinks && socialLinks.length > 0
      ? socialLinks
      : [
          { name: "WhatsApp Direct", href: `https://wa.me/${supportPhone.replace(/[^0-9]/g, "")}`, icon: "whatsapp" },
          { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
          { name: "Facebook", href: "https://facebook.com", icon: "facebook" },
        ];

  // Monitor vertical scroll depth to trigger Back-to-Top button
  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 1.2;
      setShowBackToTop(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Custom eased smooth scroll to top
  const scrollToTop = () => {
    if (shouldReduceMotion) {
      window.scrollTo({ top: 0 });
      return;
    }

    const start = window.scrollY;
    const startTime = performance.now();
    const duration = 500;

    const step = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, start * (1 - easeOut));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const handleDropdownEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setIsDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  };

  // Newsletter submit handler
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsError("");

    if (!email) {
      setNewsError("Email is required.");
      return;
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setNewsError("Please enter a valid email.");
      return;
    }

    setNewsStatus("submitting");
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setNewsStatus("success");
    } catch {
      setNewsError("Failed to register. Try again.");
      setNewsStatus("idle");
    }
  };

  const toggleColumn = (title: string) => {
    setOpenColumns((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const renderSocialIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "instagram":
        return <Globe className="h-4 w-4" />;
      case "facebook":
        return <Share2 className="h-4 w-4" />;
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <footer className="select-none bg-[#1D1221] text-neutral-300 border-t border-white/10 relative overflow-hidden">
      {/* Dynamic Link Underline CSS */}
      <style>{`
        .altrivo-footer-link {
          position: relative;
          transition: color 150ms ease;
        }
        .altrivo-footer-link::after {
          content: '';
          position: absolute;
          width: 0%;
          height: 1.5px;
          bottom: -2px;
          left: 0;
          background-color: #D1B2DB;
          transition: width 200ms ease;
        }
        .altrivo-footer-link:hover::after {
          width: 100%;
        }
      `}</style>

      {/* 1. Value Proposition Features & Trust Strip */}
      <div className="border-b border-white/10 bg-[#2C1C31]/90 backdrop-blur-xs py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#694873]/50 border border-[#D1B2DB]/30 flex items-center justify-center text-[#D1B2DB] flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Express Nationwide Delivery</h4>
              <p className="text-[11px] text-neutral-400">Safe delivery across Pakistan</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#694873]/50 border border-[#D1B2DB]/30 flex items-center justify-center text-[#D1B2DB] flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">7-Day Easy Returns</h4>
              <p className="text-[11px] text-neutral-400">Hassle-free replacement policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#694873]/50 border border-[#D1B2DB]/30 flex items-center justify-center text-[#D1B2DB] flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">100% Authentic Quality</h4>
              <p className="text-[11px] text-neutral-400">Hand-inspected genuine items</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#694873]/50 border border-[#D1B2DB]/30 flex items-center justify-center text-[#D1B2DB] flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Cash on Delivery &amp; Escrow</h4>
              <p className="text-[11px] text-neutral-400">Pay safely upon home receipt</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Directory & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          {/* Brand Identity Column (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#694873] border border-[#D1B2DB]/40 text-white flex items-center justify-center font-black text-sm shadow-md">
                <Store className="w-5 h-5 text-[#D1B2DB]" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white block">
                  {storeName}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-[#D1B2DB]">
                  <ShieldCheck className="w-3 h-3 text-[#D1B2DB]" />
                  Verified Storefront
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              {effectiveTagline}
            </p>

            {/* Direct WhatsApp Order / Contact Button */}
            {supportPhone && (
              <a
                href={`https://wa.me/${supportPhone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(storeName)},%20I%20have%20an%20inquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#694873]/40 hover:bg-[#694873]/70 border border-[#D1B2DB]/30 text-white text-xs font-bold transition-all active:scale-95 shadow-2xs"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Order Support</span>
              </a>
            )}

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              {effectiveSocials.map((soc) => (
                <a
                  key={soc.name}
                  href={soc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={soc.name}
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-[#694873]/50 text-neutral-300 hover:text-white flex items-center justify-center transition-all hover:scale-105 shadow-2xs cursor-pointer"
                  title={soc.name}
                >
                  {renderSocialIcon(soc.icon)}
                </a>
              ))}
            </div>
          </div>

          {/* Links Directory Columns (5 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:col-span-5 gap-6 sm:gap-4">
            {effectiveSections.map((sect, idx) => {
              const isColOpen = !!openColumns[sect.title];
              const panelId = `footer-column-${idx}`;

              return (
                <div key={sect.title} className="border-b border-white/10 sm:border-b-0 pb-3 sm:pb-0">
                  <button
                    onClick={() => toggleColumn(sect.title)}
                    className="w-full flex items-center justify-between sm:pointer-events-none text-left focus:outline-none cursor-pointer sm:cursor-default"
                    aria-expanded={isColOpen}
                    aria-controls={panelId}
                  >
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-white py-1 sm:py-0">
                      {sect.title}
                    </h4>
                    <ChevronDown
                      style={{
                        transform: isColOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: shouldReduceMotion ? "none" : "transform 200ms ease",
                      }}
                      className="h-4 w-4 text-neutral-400 sm:hidden"
                    />
                  </button>

                  <div
                    id={panelId}
                    style={{
                      maxHeight: isColOpen ? "220px" : "0px",
                      opacity: isColOpen ? 1 : 0,
                      transition: shouldReduceMotion
                        ? "none"
                        : "max-height 250ms ease-in-out, opacity 250ms ease",
                    }}
                    className="overflow-hidden sm:max-h-none sm:opacity-100 mt-2 sm:mt-3 space-y-2 text-xs"
                  >
                    <ul className="space-y-2.5">
                      {sect.links.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            className="inline-block text-neutral-400 hover:text-white altrivo-footer-link"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VIP Newsletter Subscription (3 cols) */}
          <div className="md:col-span-3 space-y-3.5">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                Exclusive Deals &amp; Drops
              </h4>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                Receive secret discounts, priority catalog restocks, and private sale codes.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
              {newsStatus !== "success" ? (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (newsError) setNewsError("");
                      }}
                      placeholder="Enter your email address..."
                      disabled={newsStatus === "submitting"}
                      className="w-full px-3.5 py-2.5 text-xs bg-white/10 border border-white/10 focus:border-[#D1B2DB] rounded-xl text-white placeholder:text-neutral-500 outline-none transition-colors"
                    />
                    {newsError && (
                      <span className="text-[10px] text-red-400 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{newsError}</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={newsStatus === "submitting"}
                    className="w-full py-2.5 rounded-xl bg-[#694873] hover:bg-[#5A3D63] active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {newsStatus === "submitting" ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <span>Get 10% Discount</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-3 space-y-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-emerald-300">
                  <Check className="h-5 w-5 mx-auto text-emerald-400" />
                  <p className="text-xs font-bold text-white">You're on the VIP list!</p>
                  <p className="text-[10px] text-emerald-200">
                    Use code <strong className="font-mono text-white">SAVE10</strong> at checkout for 10% off.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Bottom Legal & Payment Badges Strip */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-neutral-400">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span>
              {copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
            </span>
            <span className="hidden sm:inline opacity-40">|</span>
            <span className="text-neutral-500">
              Powered by <strong className="text-neutral-300">Altrivo Infrastructure</strong>
            </span>
          </div>

          {/* Payment & Security Assurance Icons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300 text-[10px] font-semibold">
              <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
              Cash on Delivery (COD)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300 text-[10px] font-semibold">
              <Lock className="w-3.5 h-3.5 text-[#D1B2DB]" />
              256-Bit SSL Encrypted
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300 text-[10px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Buyer Escrow Protected
            </span>

            {/* Back to Top Smooth Scroll Button */}
            <button
              onClick={scrollToTop}
              style={{
                opacity: showBackToTop ? 1 : 0,
                transform: showBackToTop ? "scale(1)" : "scale(0.85)",
                pointerEvents: showBackToTop ? "auto" : "none",
                transition: shouldReduceMotion ? "none" : "opacity 200ms ease, transform 200ms ease",
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white active:scale-90 cursor-pointer shadow-md ml-2"
              aria-label="Scroll to top"
              title="Back to Top"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
