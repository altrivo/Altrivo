"use client";

import React, { useState, useMemo } from "react";
import { 
  Pencil, 
  ShoppingBag, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  ShieldCheck, 
  Award, 
  Truck, 
  RotateCcw, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Star,
  Plus,
  Check
} from "lucide-react";
import { useCart } from "./CartContext";
import { formatPrice, formatCutPrice } from "@/lib/storefront/priceUtils";

// ============================================================================
// 1. ABOUT PAGE VIEW (AI Generated & Curated by Niche)
// ============================================================================
export interface AboutPageProps {
  storeName: string;
  niche?: string;
  config?: {
    hero?: { title: string; subtitle: string; imageUrl?: string };
    story?: { title: string; paragraphs: string[]; imageUrl?: string };
    values?: Array<{ icon: string; title: string; description: string }>;
  };
  isEditorMode?: boolean;
  activeSectionId?: string | null;
  onSelectSection?: (id: string) => void;
}

export function AboutPageView({
  storeName,
  niche = "apparel",
  config,
  isEditorMode,
  activeSectionId,
  onSelectSection,
}: AboutPageProps) {
  const isClothing = niche.includes("cloth") || niche.includes("fashion") || niche.includes("apparel");
  const isWatches = niche.includes("watch") || niche.includes("chrono") || niche.includes("time");

  const defaultHero = {
    title: isClothing
      ? `The Craft of Fine Fashion at ${storeName}`
      : isWatches
      ? `Master Horology & Timeless Elegance at ${storeName}`
      : `Mastering Genuine Leather & Craftsmanship at ${storeName}`,
    subtitle: isClothing
      ? "Born from a passion for hand-spun pure fabrics, bespoke tailoring, and timeless Pakistani couture."
      : isWatches
      ? "Engineered with precision quartz and automatic calibers, designed for collectors with refined tastes."
      : "Every pair is hand-lasted from 100% full-grain calfskin leather by generational Pakistani artisans.",
    imageUrl: isClothing
      ? "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1400&q=80"
      : isWatches
      ? "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80"
      : "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1400&q=80",
  };

  const defaultStory = {
    title: isClothing
      ? "Pure Cotton, Silk & Master Tailoring"
      : isWatches
      ? "Over A Decade of Precision Horology"
      : "36 Hours of Handcrafted Devotion",
    paragraphs: isClothing
      ? [
          `${storeName} was founded with a singular conviction: luxury textiles should carry both authentic Pakistani soul and international finishing standards.`,
          "We source breathable, high-grade Egyptian cotton and hand-embroidered silks. Every seam is reinforced with double-needle stitching to ensure your garment lasts through generations.",
        ]
      : isWatches
      ? [
          `At ${storeName}, a timepiece is more than a tool for tracking minutes—it is an heirloom of personal distinction and engineering mastery.`,
          "Our chronographs feature scratch-resistant sapphire crystals, 316L surgical stainless steel, and hand-stitched Italian leather straps inspected by master watchmakers.",
        ]
      : [
          `At ${storeName}, we reject synthetic shortcuts. Every shoe is cut by hand from natural full-grain hides, hand-dyed with vegetable tannins, and lasted over custom wooden shoe trees.`,
          "Our artisans spend over 36 hours hand-stitching each sole, ensuring ergonomic arch support and timeless distinction.",
        ],
    imageUrl: isClothing
      ? "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"
      : isWatches
      ? "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
      : "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
  };

  const hero = { ...defaultHero, ...config?.hero };
  const story = { ...defaultStory, ...config?.story };

  const values = config?.values || [
    { icon: "award", title: "100% Authentic Materials", description: "Guaranteed genuine natural fabrics and full-grain raw materials." },
    { icon: "shield", title: "Escrow & COD Protected", description: "Pay cash upon delivery with full escrow buyer satisfaction guarantee." },
    { icon: "truck", title: "Nationwide Fast Delivery", description: "Express tracked logistics across all 200+ cities in Pakistan." },
    { icon: "rotate", title: "7-Day Easy Exchange", description: "Hassle-free size replacement and dedicated customer care." },
  ];

  return (
    <div className="space-y-16 py-8 animate-in fade-in duration-300">
      {/* 1. ABOUT HERO BANNER */}
      <div
        onClickCapture={() => onSelectSection?.("about-hero")}
        className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all cursor-pointer ${
          isEditorMode && activeSectionId === "about-hero"
            ? "ring-4 ring-emerald-500 rounded-3xl"
            : isEditorMode
            ? "hover:ring-2 hover:ring-sky-400 rounded-3xl"
            : ""
        }`}
      >
        {isEditorMode && (
          <div className="absolute top-4 left-8 z-30 pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[10px] shadow-lg flex items-center gap-1">
              <Pencil className="w-3 h-3" />
              <span>Editing: About Hero Banner</span>
            </span>
          </div>
        )}

        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[360px] sm:min-h-[440px] flex items-center shadow-2xl">
          <img
            src={hero.imageUrl}
            alt={hero.title}
            className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

          <div className="relative z-10 p-6 sm:p-12 lg:p-16 max-w-2xl space-y-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {hero.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {hero.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 2. BRAND STORY SECTION */}
      <div
        onClickCapture={() => onSelectSection?.("about-story")}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all cursor-pointer ${
          isEditorMode && activeSectionId === "about-story"
            ? "ring-4 ring-emerald-500 rounded-3xl"
            : isEditorMode
            ? "hover:ring-2 hover:ring-sky-400 rounded-3xl"
            : ""
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center bg-slate-50/80 border border-slate-200/80 p-6 sm:p-12 rounded-3xl shadow-xs">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">The Philosophy</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {story.title}
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {story.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] bg-slate-200">
            <img
              src={story.imageUrl}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* 3. CORE VALUES PILLARS */}
      <div
        onClickCapture={() => onSelectSection?.("about-values")}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all cursor-pointer ${
          isEditorMode && activeSectionId === "about-values"
            ? "ring-4 ring-emerald-500 rounded-3xl"
            : isEditorMode
            ? "hover:ring-2 hover:ring-sky-400 rounded-3xl"
            : ""
        }`}
      >
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Our Standards</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Discerning Buyers Choose Us
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((v, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-purple-100 flex items-center justify-center text-emerald-600 font-bold">
                {v.icon === "award" ? <Award className="w-5 h-5" /> : v.icon === "shield" ? <ShieldCheck className="w-5 h-5" /> : v.icon === "truck" ? <Truck className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
              </div>
              <h3 className="font-bold text-sm text-slate-900">{v.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. SHOP PAGE VIEW (Complete Catalog with Filters, Sort & Add to Cart)
// ============================================================================
export interface ShopPageProps {
  storeName: string;
  products: any[];
  categories?: any[];
  config?: {
    hero?: { title: string; subtitle: string; imageUrl?: string };
  };
  isEditorMode?: boolean;
  activeSectionId?: string | null;
  onSelectSection?: (id: string) => void;
}

export function ShopPageView({
  storeName,
  products = [],
  categories = [],
  config,
  isEditorMode,
  activeSectionId,
  onSelectSection,
}: ShopPageProps) {
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "rating">("featured");

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: formatPrice(product.price),
      originalPrice: formatCutPrice(product.price, product.originalPrice),
      image: product.image,
    });
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const hero = {
    title: "Complete Store Catalog",
    subtitle: `Explore the entire collection handcrafted for ${storeName}. Nationwide Cash on Delivery & Escrow.`,
    ...config?.hero,
  };

  // Helper to parse price string to number
  const getNumericPrice = (pStr: any) => {
    if (typeof pStr === "number") return pStr;
    if (!pStr) return 0;
    const clean = String(pStr).replace(/[^0-9.]/g, "");
    return parseFloat(clean) || 0;
  };

  // Dynamic categories from products list + passed categories
  const resolvedCategories = useMemo(() => {
    const cats = new Set<string>();
    // First priority: actual categories present on the store's products
    products.forEach((p) => {
      const c = p.category || p.tag;
      if (c && typeof c === "string" && c.trim() && c.toLowerCase() !== "all") {
        cats.add(c.trim());
      }
    });

    // If products have no categories yet, allow passed categories
    if (cats.size === 0 && categories && categories.length > 0) {
      categories.forEach((cat: any) => {
        const cName = typeof cat === "string" ? cat : cat.title || cat.name;
        if (cName && typeof cName === "string" && cName.trim() && cName.toLowerCase() !== "all") {
          cats.add(cName.trim());
        }
      });
    }

    return Array.from(cats);
  }, [products, categories]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.tag?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.price?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "all") {
      list = list.filter(
        (p) =>
          p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.tag?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (sortBy === "price-low") {
      list.sort((a, b) => getNumericPrice(a.price) - getNumericPrice(b.price));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => getNumericPrice(b.price) - getNumericPrice(a.price));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }

    return list;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-10 py-6 animate-in fade-in duration-300">
      {/* 1. SHOP HERO BANNER */}
      <div
        onClickCapture={() => onSelectSection?.("shop-hero")}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all cursor-pointer ${
          isEditorMode && activeSectionId === "shop-hero"
            ? "ring-4 ring-emerald-500 rounded-3xl"
            : isEditorMode
            ? "hover:ring-2 hover:ring-sky-400 rounded-3xl"
            : ""
        }`}
      >
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>All Products</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{hero.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300">{hero.subtitle}</p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-bold">
            <span className="text-emerald-400 font-extrabold text-base">{products.length}</span>
            <span>Items Available</span>
          </div>
        </div>
      </div>

      {/* 2. FILTERS & SEARCH CONTROLS BAR */}
      <div
        onClickCapture={() => onSelectSection?.("shop-catalog")}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all ${
          isEditorMode && activeSectionId === "shop-catalog"
            ? "ring-4 ring-emerald-500 rounded-2xl"
            : ""
        }`}
      >
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Real-time Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, SKU, or category..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Category Chips & Price Sort Dropdown */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-emerald-500 text-slate-950 shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                All
              </button>
              {resolvedCategories.map((cName: string) => (
                <button
                  key={cName}
                  onClick={() => setSelectedCategory(cName)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory.toLowerCase() === cName.toLowerCase()
                      ? "bg-emerald-500 text-slate-950 shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {cName}
                </button>
              ))}
            </div>

            {/* Price Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PRODUCT GRID */}
        <div className="pt-6">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="group rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {(p.tag || p.category) && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-extrabold text-slate-800 shadow-xs">
                          {p.tag || p.category}
                        </span>
                      )}
                      {p.discount && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-extrabold shadow-xs">
                          {p.discount}
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-1.5">
                      <div className="flex items-center gap-1 text-amber-500 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold text-slate-700 text-[11px]">{p.rating || 4.9}</span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-base text-slate-900">
                          {formatPrice(p.price)}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          {formatCutPrice(p.price, p.originalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      onClick={() => handleAddToCart(p)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer ${
                        addedIds[p.id]
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-900 hover:bg-emerald-500 text-white hover:text-slate-950"
                      }`}
                    >
                      {addedIds[p.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-3xl space-y-3">
              <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {products.length === 0
                  ? "Your store does not have any active products in this section yet."
                  : "No items match your selected filter or search term. Try adjusting your search query."}
              </p>
              {products.length === 0 ? (
                <div className="flex items-center justify-center gap-2 pt-2">
                  {isEditorMode && (
                    <button
                      type="button"
                      onClick={() => onSelectSection?.("shop-catalog")}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Manage Shop Catalog</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. CONTACT PAGE VIEW (AI Generated Details, Location, WhatsApp & Form)
// ============================================================================
export interface ContactPageProps {
  storeName: string;
  niche?: string;
  config?: {
    hero?: { title: string; subtitle: string };
    phone?: string;
    whatsappNumber?: string;
    email?: string;
    address?: string;
    businessHours?: string;
    introText?: string;
  };
  isEditorMode?: boolean;
  activeSectionId?: string | null;
  onSelectSection?: (id: string) => void;
}

export function ContactPageView({
  storeName,
  niche = "apparel",
  config,
  isEditorMode,
  activeSectionId,
  onSelectSection,
}: ContactPageProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  const phone = config?.phone || "+92 300 8472910";
  const whatsappNumber = config?.whatsappNumber || "+92 300 8472910";
  const email = config?.email || `support@${storeName.toLowerCase().replace(/[^a-z0-9]/g, "")}.pk`;
  const address = config?.address || "Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan";
  const businessHours = config?.businessHours || "Mon - Sat: 10:00 AM - 9:00 PM | Sunday: Closed";
  const heroTitle = config?.hero?.title || `Contact ${storeName}`;
  const heroSubtitle =
    config?.hero?.subtitle ||
    "We are here to assist with custom orders, sizing consultations, and order delivery status.";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", phone: "", message: "" });
    }, 4000);
  };

  return (
    <div className="space-y-12 py-8 animate-in fade-in duration-300">
      {/* 1. CONTACT HERO */}
      <div
        onClickCapture={() => onSelectSection?.("contact-hero")}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all cursor-pointer ${
          isEditorMode && activeSectionId === "contact-hero"
            ? "ring-4 ring-emerald-500 rounded-3xl"
            : isEditorMode
            ? "hover:ring-2 hover:ring-sky-400 rounded-3xl"
            : ""
        }`}
      >
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold uppercase tracking-wider">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Customer Support</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {heroTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </div>

      {/* 2. CONTACT DETAILS & INTERACTIVE FORM */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left 2 Cols: Details Cards */}
          <div
            onClickCapture={() => onSelectSection?.("contact-details")}
            className={`lg:col-span-2 space-y-4 transition-all cursor-pointer ${
              isEditorMode && activeSectionId === "contact-details"
                ? "ring-4 ring-emerald-500 rounded-3xl p-1"
                : ""
            }`}
          >
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-white">Direct Vendor Helpdesk</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Prompt replies via Phone, WhatsApp &amp; Email.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Call Us</span>
                    <p className="font-bold text-white text-sm">{phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Email Support</span>
                    <p className="font-bold text-white text-sm break-all">{email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Store Location</span>
                    <p className="font-bold text-white text-xs leading-relaxed">{address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Opening Hours</span>
                    <p className="font-bold text-white text-xs">{businessHours}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right 3 Cols: Message Form */}
          <div
            onClickCapture={() => onSelectSection?.("contact-form")}
            className={`lg:col-span-3 transition-all cursor-pointer ${
              isEditorMode && activeSectionId === "contact-form"
                ? "ring-4 ring-emerald-500 rounded-3xl p-1"
                : ""
            }`}
          >
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Send an Inquiry</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Have a question about sizing, custom inquiries, or bulk orders? Fill in your details below.
                </p>
              </div>

              {isSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-extrabold text-sm text-emerald-950">Inquiry Sent Successfully!</h4>
                  <p className="text-xs text-emerald-800">
                    Thank you for reaching out to {storeName}. Our representative will contact you via WhatsApp or Email within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-700 font-bold">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Tariq Mehmood"
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-700 font-bold">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="tariq@example.com"
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-bold">WhatsApp / Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0300 1234567"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-bold">Message / Questions</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your inquiry or question here..."
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Submit Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
