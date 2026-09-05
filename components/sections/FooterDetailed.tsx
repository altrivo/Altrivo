"use client";

import React, { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { MessageSquare, ShieldCheck, Globe, Share2, ChevronUp, ChevronDown, Check, AlertCircle, Loader2 } from "lucide-react";

export interface FooterLink {
  name: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterDetailedProps {
  copyrightText?: string;
  sections?: FooterSection[];
  socialLinks?: { name: string; href: string; icon: string }[];
}

const DEFAULT_SECTIONS: FooterSection[] = [
  {
    title: "Catalog",
    links: [
      { name: "New Arrivals", href: "#catalog" },
      { name: "Best Sellers", href: "#catalog" },
      { name: "Special Offers", href: "#promotions" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Contact Us", href: "#support" },
      { name: "Shipping Rates", href: "#shipping" },
      { name: "Quality Policy", href: "#quality" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "Our Story", href: "#story" },
      { name: "Artisans Network", href: "#artisans" },
      { name: "Careers", href: "#careers" },
    ],
  },
];

const DEFAULT_SOCIALS = [
  { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { name: "WhatsApp", href: "https://whatsapp.com", icon: "whatsapp" },
  { name: "Facebook", href: "https://facebook.com", icon: "facebook" },
];

export default function FooterDetailed({
  copyrightText = "© 2026 Altrivo Storefront. All rights reserved.",
  sections = DEFAULT_SECTIONS,
  socialLinks = DEFAULT_SOCIALS,
}: FooterDetailedProps) {
  const shouldReduceMotion = useReducedMotion();
  const [openColumns, setOpenColumns] = useState<Record<string, boolean>>({});
  const [showBackToTop, setShowBackToTop] = useState(false);

  // States for Language/Currency Upward Dropdown selectors
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState("English (US)");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Compact Newsletter Form states
  const [email, setEmail] = useState("");
  const [newsError, setNewsError] = useState("");
  const [newsStatus, setNewsStatus] = useState<"idle" | "submitting" | "success">("idle");

  // 1. Monitor vertical scroll depth to trigger Back-to-Top button (1.5 viewports threshold)
  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 1.5;
      setShowBackToTop(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Custom eased smooth scroll to top (capped max duration 650ms for long pages)
  const scrollToTop = () => {
    if (shouldReduceMotion) {
      window.scrollTo({ top: 0 });
      return;
    }

    const start = window.scrollY;
    const startTime = performance.now();
    const duration = 650; // max duration in ms

    const step = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic decel formula: 1 - (1 - x)^3
      const easeOut = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, start * (1 - easeOut));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  // 3. Dropdown mouse-leave delays (same mega menu close protection)
  const handleDropdownEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setIsDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  };

  // Compact newsletter submit handler
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsError("");

    if (!email) {
      setNewsError("Email required.");
      return;
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setNewsError("Invalid format.");
      return;
    }

    setNewsStatus("submitting");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setNewsStatus("success");
    } catch {
      setNewsError("Failed to register.");
      setNewsStatus("idle");
    }
  };

  // Mobile column accordion click toggler (multiple sections allowed open)
  const toggleColumn = (title: string) => {
    setOpenColumns((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Social icon mapping
  const renderSocialIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "instagram":
        return <Globe className="h-4.5 w-4.5" />;
      case "facebook":
        return <Share2 className="h-4.5 w-4.5" />;
      case "whatsapp":
        return <MessageSquare className="h-4.5 w-4.5" />;
      default:
        return <ShieldCheck className="h-4.5 w-4.5" />;
    }
  };

  return (
    <footer 
      className="select-none bg-slate-950 text-slate-400 border-t border-slate-900 relative"
      style={{ backgroundColor: "var(--color-primary, #0f172a)" }}
    >
      
      {/* Link hover animation class utilities */}
      <style>{`
        .footer-link-underline {
          background-image: linear-gradient(currentColor, currentColor);
          background-size: 0% 1px;
          background-repeat: no-repeat;
          background-position: left bottom;
          transition: background-size 150ms ease-out;
        }
        .footer-link-underline:hover {
          background-size: 100% 1px;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
        
        {/* Top Grid Area (Staggered entrance layouts) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Brand Info & Social details */}
          <div className="md:col-span-4 space-y-4">
            <span 
              className="text-lg font-black tracking-tight text-white block"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              Altrivo Studio
            </span>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Connecting collectors directly to master Pakistani craft workshops. Fair wages, sustainable kiln sourcing, and heritage preservation.
            </p>
            
            {/* Social Icons (Scale + Brand color transitions) */}
            <div className="flex gap-2.5 pt-2">
              {socialLinks.map((soc) => (
                <a
                  key={soc.name}
                  href={soc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8.5 w-8.5 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 hover:scale-110 transition-all duration-150"
                  aria-label={soc.name}
                >
                  {renderSocialIcon(soc.icon)}
                </a>
              ))}
            </div>
          </div>

          {/* Links Directory Columns (Accordion collapses on mobile, side-by-side on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:col-span-5 gap-6 sm:gap-4">
            {sections.map((sect, idx) => {
              const isColOpen = !!openColumns[sect.title];
              const panelId = `footer-column-${idx}`;

              return (
                <div key={sect.title} className="border-b border-white/5 sm:border-b-0 pb-3 sm:pb-0">
                  {/* Column Header (tap target for mobile accordion) */}
                  <button
                    onClick={() => toggleColumn(sect.title)}
                    className="w-full flex items-center justify-between sm:pointer-events-none text-left focus:outline-hidden cursor-pointer sm:cursor-default"
                    aria-expanded={isColOpen}
                    aria-controls={panelId}
                  >
                    <h4 
                      className="text-xs font-black uppercase tracking-widest text-slate-200 py-1.5 sm:py-0"
                      style={{ fontFamily: "var(--font-heading, inherit)" }}
                    >
                      {sect.title}
                    </h4>
                    {/* Mobile Chevron toggle indicator */}
                    <ChevronDown
                      style={{
                        transform: isColOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: shouldReduceMotion ? "none" : "transform 200ms ease",
                      }}
                      className="h-4 w-4 text-slate-400 sm:hidden"
                    />
                  </button>

                  {/* Accordin collapsing layout list wrapper */}
                  <div
                    id={panelId}
                    style={{
                      maxHeight: isColOpen ? "180px" : "0px",
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
                            className="inline-block py-0.5 text-slate-450 hover:text-white footer-link-underline"
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

          {/* Compact Newsletter embed */}
          <div className="md:col-span-3 space-y-3">
            <h4 
              className="text-xs font-black uppercase tracking-widest text-slate-200"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              Artisan Drops
            </h4>
            
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
              {newsStatus !== "success" ? (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (newsError) setNewsError("");
                      }}
                      placeholder="Your email address"
                      disabled={newsStatus === "submitting"}
                      className="w-full px-3 py-2 text-[10px] font-bold bg-white/5 border border-white/10 rounded-xl text-white outline-hidden focus:bg-white/10 transition-colors"
                    />
                    {newsError && (
                      <span className="absolute -top-5 left-0 text-[8px] text-red-400 font-black uppercase tracking-wider flex items-center gap-0.5 bg-slate-950 px-1">
                        <AlertCircle className="h-2.5 w-2.5" />
                        <span>{newsError}</span>
                      </span>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={newsStatus === "submitting"}
                    className="w-full py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 active:scale-95 text-[9px] font-black uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-1"
                  >
                    {newsStatus === "submitting" ? (
                      <Loader2 className="h-3 w-3 animate-spin text-slate-950" />
                    ) : (
                      <span>Join List</span>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-2 space-y-1 text-emerald-400">
                  <Check className="h-5 w-5 mx-auto animate-bounce" />
                  <span className="block text-[9px] font-black uppercase tracking-widest">
                    Code Dispatched
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Line Area (Copyright, Language Dropdown & Back-to-Top Button) */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] text-slate-500">
          
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <span>{copyrightText}</span>
            <div className="flex gap-4">
              <a href="#privacy" className="hover:text-slate-350 footer-link-underline">Privacy Policy</a>
              <a href="#terms" className="hover:text-slate-350 footer-link-underline">Terms of Service</a>
            </div>
          </div>

          {/* Selector & Scroll trigger elements */}
          <div className="flex items-center gap-4">
            
            {/* 1. Language selector upward opening dropdown (getBoundingClientRect boundary tracking) */}
            <div 
              ref={dropdownRef}
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
              className="relative"
            >
              <button
                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                aria-label="Language Selector Menu"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{activeLanguage}</span>
                <ChevronUp className="h-3 w-3 text-slate-400" />
              </button>

              {/* Upward expanding menu list */}
              <div
                style={{
                  opacity: isDropdownOpen ? 1 : 0,
                  transform: isDropdownOpen ? "translateY(0px)" : "translateY(8px)",
                  pointerEvents: isDropdownOpen ? "auto" : "none",
                  transition: shouldReduceMotion ? "none" : "opacity 180ms ease, transform 180ms ease",
                }}
                className="absolute bottom-[calc(100%+8px)] right-0 w-36 bg-slate-900 border border-white/10 rounded-2xl shadow-xl p-1.5 z-50 overflow-hidden"
              >
                {["English (US)", "اردو (PK)", "Deutsch (DE)"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setActiveLanguage(lang);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Custom Back-to-Top Button (Fades & Scales on scroll threshold limits) */}
            <button
              onClick={scrollToTop}
              style={{
                opacity: showBackToTop ? 1 : 0,
                transform: showBackToTop ? "scale(1)" : "scale(0.85)",
                pointerEvents: showBackToTop ? "auto" : "none",
                transition: shouldReduceMotion ? "none" : "opacity 200ms ease, transform 200ms ease",
              }}
              className="p-2 rounded-xl bg-white text-slate-950 hover:bg-slate-50 border border-white active:scale-90 cursor-pointer shadow-md"
              aria-label="Scroll to top"
            >
              <ChevronUp className="h-4.5 w-4.5" />
            </button>

          </div>

        </div>

      </div>

      {/* Mobile-only condensed sticky footer legal bar */}
      <div className="sm:hidden sticky bottom-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-t border-white/5 px-4 py-2 text-[9px] text-slate-500 text-center shadow-lg">
        <span>Protected Escrow Checkout | Secure Shopping</span>
      </div>

    </footer>
  );
}
