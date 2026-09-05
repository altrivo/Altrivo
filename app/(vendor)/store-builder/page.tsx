"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Wand2,
  ArrowLeft,
  CheckCircle2,
  Store,
  Palette,
  Layout,
  Loader2,
  ChevronRight,
  Grid,
  ShoppingBag,
  ShieldCheck,
  BookOpen,
  Star,
  Mail,
  Layers,
  Zap,
  Check,
  Footprints,
  Shirt,
  Smartphone,
  Home,
  Watch,
  Eye,
  Sliders,
  Plus,
  Trash2,
  Image as ImageIcon,
  Edit3,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Award,
  Truck,
  RotateCcw,
  Play,
  Percent,
  Clock,
  Heart,
  Tag,
  CheckCircle,
  Upload,
  Link2,
  ExternalLink,
  SlidersHorizontal,
  Type,
  Maximize2,
  Sun,
  Moon,
} from "lucide-react";
import {
  SECTION_BLUEPRINT_CATALOG,
  type SectionCategory,
  type ComponentVariant,
  type UserSectionSelections,
} from "@/lib/ai/section-blueprints";

interface TemplatePreview {
  templateId: string;
  templateName: string;
  description: string;
  tag: string;
  layoutConfig: any;
  preview: {
    primaryColor: string;
    accentColor: string;
    bgGradient: string;
    fontFamily: string;
    heroHeadline: string;
    heroSub: string;
  };
}

interface CustomComponentData {
  id: string;
  name: string;
  badge: string;
  title: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  imageUrl: string;
  imagePosition: "right" | "left" | "center" | "background" | "none";
  bgTheme: "slate" | "gold" | "glass" | "minimal" | "black";
  buttonTheme: "emerald" | "gold" | "white" | "outline";
}

const PRESET_PROMPTS = [
  {
    icon: Footprints,
    label: "Footwear & Leather",
    prompt: "Luxury handmade leather shoes and traditional Peshawari chappals. Black and gold royal aesthetic with handcrafted genuine leather.",
  },
  {
    icon: Shirt,
    label: "Fashion & Apparel",
    prompt: "Contemporary luxury designer fashion and pret boutique with modern minimal layouts and elegant typography.",
  },
  {
    icon: Smartphone,
    label: "Electronics & Tech",
    prompt: "High-performance tech gadgets, wireless audio, and gaming gear with clean dark modern surfaces.",
  },
  {
    icon: Sparkles,
    label: "Beauty & Cosmetics",
    prompt: "Organic skincare and botanical wellness store with soft earth tones and clean ingredient highlights.",
  },
  {
    icon: Home,
    label: "Home Decor & Living",
    prompt: "Artisanal home decor, handcrafted ceramics, and luxury interior furnishings with warm ambient photography.",
  },
  {
    icon: Watch,
    label: "Watches & Jewelry",
    prompt: "Luxury chronograph watches and precision timepieces with sapphire crystal glass and midnight black theme.",
  },
];

const PROGRESS_STEPS = [
  "Analyzing business category & target market...",
  "Structuring storefront copywriting & layout...",
  "Matching high-resolution catalog media...",
  "Assembling section component blueprints...",
  "Connecting orders, delivery & checkout...",
  "Store is ready!",
];

const SECTION_ICONS: Record<SectionCategory, React.ElementType> = {
  hero: Sparkles,
  categories: Grid,
  products: ShoppingBag,
  features: ShieldCheck,
  story: BookOpen,
  testimonials: Star,
  newsletter: Mail,
};

// ---------------------------------------------------------------------------
// Comprehensive Visual Layout Mockup Illustrations (All 35 Variants Covered)
// ---------------------------------------------------------------------------
function ComponentVisualPreview({ variantId }: { variantId: string }) {
  switch (variantId) {
    // -------------------------------------------------------------------------
    // 1. HERO SECTIONS (5 VARIANTS)
    // -------------------------------------------------------------------------
    case "HeroSplitImage":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex items-center justify-between gap-3 overflow-hidden">
          <div className="flex-1 space-y-1.5 pl-1">
            <div className="w-12 h-1.5 rounded-full bg-emerald-500/70" />
            <div className="w-24 h-3 rounded bg-slate-200" />
            <div className="w-28 h-1.5 rounded bg-slate-600" />
            <div className="flex items-center gap-1.5 pt-1">
              <div className="w-12 h-4 rounded-md bg-emerald-500 text-[8px] font-bold text-slate-950 flex items-center justify-center">Shop</div>
              <div className="w-10 h-4 rounded-md border border-slate-700 bg-slate-800" />
            </div>
          </div>
          <div className="w-24 h-20 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center text-slate-400">
            <ImageIcon className="w-6 h-6 text-slate-500" />
          </div>
        </div>
      );

    case "HeroBento":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2 border border-slate-800 grid grid-cols-3 gap-1.5 overflow-hidden">
          <div className="col-span-2 rounded-lg bg-slate-900 p-2 border border-slate-800 space-y-1">
            <div className="w-16 h-2 rounded bg-emerald-400" />
            <div className="w-24 h-1.5 rounded bg-slate-600" />
            <div className="w-10 h-3 rounded bg-emerald-500 mt-2" />
          </div>
          <div className="col-span-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-slate-500" />
          </div>
        </div>
      );

    case "HeroCenteredOverlay":
      return (
        <div className="h-28 w-full rounded-xl bg-gradient-to-t from-slate-900 via-slate-950 to-slate-900 p-3 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1.5 relative overflow-hidden">
          <div className="w-16 h-1.5 rounded-full bg-emerald-400" />
          <div className="w-32 h-3.5 rounded bg-slate-100 font-bold" />
          <div className="w-36 h-1.5 rounded bg-slate-500" />
          <div className="w-14 h-4 rounded-md bg-emerald-500 text-[8px] font-bold text-slate-950 flex items-center justify-center mt-1">Explore</div>
        </div>
      );

    case "HeroDepthStack":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-3 border border-slate-800 flex items-center justify-between gap-2 overflow-hidden relative">
          <div className="space-y-1.5">
            <div className="w-20 h-3 rounded bg-slate-200" />
            <div className="w-24 h-1.5 rounded bg-slate-600" />
            <div className="w-12 h-3.5 rounded bg-emerald-500" />
          </div>
          <div className="relative w-20 h-16">
            <div className="absolute top-0 right-2 w-14 h-14 rounded-lg bg-slate-800 border border-slate-700 shadow-md rotate-6" />
            <div className="absolute top-1 right-0 w-14 h-14 rounded-lg bg-slate-900 border border-emerald-500/50 shadow-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>
      );

    case "HeroMarquee":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex flex-col justify-between overflow-hidden">
          <div className="w-full py-1 bg-emerald-500/20 border-y border-emerald-500/30 flex items-center justify-around text-[8px] font-mono text-emerald-400 uppercase font-bold">
            <span>• NEW ARRIVALS</span>
            <span>• 100% LEATHER</span>
            <span>• EXPRESS DELIVERY</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-1">
              <div className="w-24 h-3 rounded bg-slate-100" />
              <div className="w-14 h-3 rounded bg-emerald-500" />
            </div>
            <div className="w-14 h-12 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>
      );

    // -------------------------------------------------------------------------
    // 2. CATEGORIES SHOWCASE (5 VARIANTS)
    // -------------------------------------------------------------------------
    case "CategoryCarouselCenterEmphasis":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex flex-col justify-center space-y-2 overflow-hidden">
          <div className="w-20 h-2 rounded bg-slate-400" />
          <div className="flex items-center justify-between gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex-1 flex flex-col items-center gap-1 ${i === 2 ? "scale-110" : "opacity-75"}`}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${i === 2 ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-slate-900 border-slate-800"}`}>
                  <Grid className="w-3.5 h-3.5" />
                </div>
                <div className="w-8 h-1 rounded bg-slate-600" />
              </div>
            ))}
          </div>
        </div>
      );

    case "CategoryCarouselNativeSnap":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex flex-col justify-center space-y-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-24 h-2 rounded bg-slate-300" />
            <div className="w-8 h-1.5 rounded bg-emerald-400" />
          </div>
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 rounded-lg bg-slate-900 border border-slate-800 p-1.5 flex items-center gap-1.5">
                <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-emerald-400">
                  <Tag className="w-3 h-3" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="w-10 h-1.5 rounded bg-slate-300" />
                  <div className="w-6 h-1 rounded bg-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "CategoryCarouselDrag":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex flex-col justify-center space-y-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-20 h-2 rounded bg-slate-300" />
            <div className="flex gap-1 text-[8px] text-slate-500 font-mono">← Drag →</div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex-1 h-14 rounded-xl border p-1.5 flex flex-col justify-between ${i === 1 ? "bg-emerald-950/40 border-emerald-500 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-400"}`}>
                <Grid className="w-4 h-4" />
                <div className="w-10 h-1.5 rounded bg-slate-300" />
              </div>
            ))}
          </div>
        </div>
      );

    case "CategoryCarouselAutoplay":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex flex-col justify-center space-y-2.5 overflow-hidden">
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 uppercase">
            <Sparkles className="w-3 h-3" />
            <span>Trending Collections</span>
          </div>
          <div className="flex gap-2">
            {["Oxfords", "Loafers", "Sneakers", "Chappals"].map((c, i) => (
              <span key={i} className="px-2.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-200 whitespace-nowrap">
                {c}
              </span>
            ))}
          </div>
        </div>
      );

    case "CategoryCarousel":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-slate-800 grid grid-cols-4 gap-1.5 items-center overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg bg-slate-900 border border-slate-800 p-2 flex flex-col items-center gap-1 text-center">
              <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center text-emerald-400">
                <Grid className="w-3.5 h-3.5" />
              </div>
              <div className="w-8 h-1.5 rounded bg-slate-400" />
            </div>
          ))}
        </div>
      );

    // -------------------------------------------------------------------------
    // 3. PRODUCTS CATALOG (5 VARIANTS)
    // -------------------------------------------------------------------------
    case "ProductGridFeatured":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2 border border-slate-800 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between px-1">
            <div className="w-20 h-2 rounded bg-slate-200" />
            <div className="w-10 h-1.5 rounded bg-emerald-400" />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg bg-slate-900 border border-slate-800 p-1 space-y-1">
                <div className="w-full h-9 rounded bg-slate-800 flex items-center justify-center">
                  <ShoppingBag className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="w-12 h-1.5 rounded bg-slate-400" />
                <div className="w-8 h-1.5 rounded bg-emerald-400" />
              </div>
            ))}
          </div>
        </div>
      );

    case "ProductGridStaggered":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2 border border-slate-800 grid grid-cols-3 gap-1.5 items-end overflow-hidden">
          <div className="h-16 rounded-lg bg-slate-900 border border-slate-800 p-1 space-y-1">
            <div className="w-full h-8 rounded bg-slate-800" />
            <div className="w-8 h-1 rounded bg-slate-400" />
          </div>
          <div className="h-22 rounded-lg bg-slate-900 border border-emerald-500/50 p-1 space-y-1">
            <div className="w-full h-14 rounded bg-slate-800 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="w-10 h-1.5 rounded bg-slate-200" />
          </div>
          <div className="h-18 rounded-lg bg-slate-900 border border-slate-800 p-1 space-y-1">
            <div className="w-full h-10 rounded bg-slate-800" />
            <div className="w-8 h-1 rounded bg-slate-400" />
          </div>
        </div>
      );

    case "ProductSingleFocus":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex items-center justify-between gap-3 overflow-hidden">
          <div className="w-24 h-20 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="w-14 h-1.5 rounded bg-emerald-400" />
            <div className="w-24 h-3 rounded bg-slate-100" />
            <div className="w-12 h-2.5 rounded bg-emerald-500" />
            <div className="w-16 h-4 rounded-md bg-emerald-500 text-[8px] font-bold text-slate-950 flex items-center justify-center">Buy Now</div>
          </div>
        </div>
      );

    case "ProductSingleFocusGallery":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex items-center justify-between gap-3 overflow-hidden">
          <div className="w-20 h-20 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-emerald-400/80" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`w-5 h-5 rounded border ${i === 1 ? "border-emerald-500 bg-slate-800" : "border-slate-800 bg-slate-900"}`} />
              ))}
            </div>
            <div className="w-24 h-2.5 rounded bg-slate-100 font-bold" />
            <div className="w-16 h-4 rounded-md bg-emerald-500 text-[8px] font-bold text-slate-950 flex items-center justify-center">Quick Add</div>
          </div>
        </div>
      );

    case "ProductSingleFocusSplitScroll":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2 border border-slate-800 flex items-center justify-between gap-2 overflow-hidden">
          <div className="w-16 space-y-1">
            <div className="w-full h-8 rounded bg-slate-900 border border-slate-800" />
            <div className="w-full h-8 rounded bg-slate-900 border border-slate-800" />
          </div>
          <div className="flex-1 rounded-lg bg-slate-900 border border-slate-800 p-2 space-y-1">
            <div className="w-16 h-2 rounded bg-emerald-400" />
            <div className="w-20 h-1.5 rounded bg-slate-400" />
            <div className="w-12 h-3.5 rounded bg-emerald-500 mt-1" />
          </div>
        </div>
      );

    // -------------------------------------------------------------------------
    // 4. FEATURES & TRUST (5 VARIANTS)
    // -------------------------------------------------------------------------
    case "FeatureGrid":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2 border border-slate-800 grid grid-cols-2 gap-1.5 overflow-hidden">
          {[
            { icon: ShieldCheck, title: "100% Genuine" },
            { icon: ShoppingBag, title: "Cash on Delivery" },
            { icon: Star, title: "Handcrafted" },
            { icon: Sparkles, title: "Fast Dispatch" },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="rounded-lg bg-slate-900 border border-slate-800/80 p-1.5 flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[9px] font-bold text-slate-200 truncate">{f.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      );

    case "PromoBanner":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-3 border border-slate-800 flex flex-col justify-center space-y-2 text-center overflow-hidden">
          <div className="w-full py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-bold text-emerald-300">LIMITED OFFER: FREE SHIPPING ACROSS PAKISTAN</span>
          </div>
          <div className="text-[8px] text-slate-500 font-mono">Use Coupon: FREESHIP5000</div>
        </div>
      );

    case "FeatureGridCards3D":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-slate-800 grid grid-cols-3 gap-1.5 items-center overflow-hidden">
          {[
            { icon: Truck, title: "TCS Courier" },
            { icon: ShieldCheck, title: "Escrow" },
            { icon: RotateCcw, title: "7-Day Return" },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="h-20 rounded-xl bg-slate-900 border border-emerald-500/30 p-2 flex flex-col items-center justify-center gap-1 text-center shadow-lg">
                <Icon className="w-4 h-4 text-emerald-400" />
                <span className="text-[8px] font-bold text-slate-200">{f.title}</span>
              </div>
            );
          })}
        </div>
      );

    case "FeatureGridMinimalBar":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-3 border border-slate-800 flex flex-col justify-center space-y-2 overflow-hidden">
          <div className="w-full h-px bg-slate-800" />
          <div className="flex items-center justify-around text-[9px] text-slate-300 font-medium">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Genuine</span>
            <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-emerald-400" /> COD</span>
            <span className="flex items-center gap-1"><Award className="w-3 h-3 text-emerald-400" /> Escrow</span>
          </div>
          <div className="w-full h-px bg-slate-800" />
        </div>
      );

    case "FeatureGridBuyerProtection":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex items-center justify-between gap-3 overflow-hidden">
          <div className="w-16 h-16 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center text-emerald-400">
            <Award className="w-6 h-6" />
            <span className="text-[7px] font-bold mt-0.5">VERIFIED</span>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-[10px] font-bold text-white">100% Pakistani Buyer Guarantee</p>
            <p className="text-[8px] text-slate-400">SafePay Escrow • TCS Tracked Dispatch • 7-Day Exchange</p>
          </div>
        </div>
      );

    // -------------------------------------------------------------------------
    // 5. BRAND STORY (5 VARIANTS)
    // -------------------------------------------------------------------------
    case "BrandStory":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex items-center justify-between gap-3 overflow-hidden">
          <div className="flex-1 space-y-1">
            <div className="w-16 h-1.5 rounded bg-emerald-400" />
            <div className="w-24 h-2.5 rounded bg-slate-100 font-bold" />
            <div className="w-28 h-1 rounded bg-slate-500" />
            <div className="w-20 h-1 rounded bg-slate-500" />
          </div>
          <div className="w-20 h-18 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      );

    case "BrandStoryZigZag":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2 border border-slate-800 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="w-12 h-9 rounded bg-slate-800" />
            <div className="space-y-1">
              <div className="w-16 h-1.5 rounded bg-slate-300" />
              <div className="w-24 h-1 rounded bg-slate-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-row-reverse">
            <div className="w-12 h-9 rounded bg-slate-800" />
            <div className="space-y-1 text-right">
              <div className="w-16 h-1.5 rounded bg-emerald-400" />
              <div className="w-24 h-1 rounded bg-slate-500" />
            </div>
          </div>
        </div>
      );

    case "BrandStoryTimeline":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-3 border border-slate-800 flex items-center justify-between overflow-hidden">
          {[
            { year: "2020", label: "Founding" },
            { year: "2023", label: "Artisan Lab" },
            { year: "2026", label: "Royal Drop" },
          ].map((t, i) => (
            <div key={i} className="flex flex-col items-center gap-1 text-center">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-bold">{t.year}</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[8px] text-slate-400 font-semibold">{t.label}</span>
            </div>
          ))}
        </div>
      );

    case "BrandStoryStickyChapter":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex items-center gap-3 overflow-hidden">
          <div className="w-18 space-y-1 border-r border-slate-800 pr-2">
            <div className="text-[8px] font-bold text-emerald-400">01. Leather</div>
            <div className="text-[8px] text-slate-500">02. Lasting</div>
            <div className="text-[8px] text-slate-500">03. Finish</div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="w-20 h-2 rounded bg-slate-200 font-bold" />
            <div className="w-28 h-1.5 rounded bg-slate-500" />
          </div>
        </div>
      );

    case "BrandStoryFounderQuote":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-3 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1.5 overflow-hidden">
          <span className="text-xl font-serif text-emerald-400">“</span>
          <p className="text-[9px] italic text-slate-300 line-clamp-2">“Shoes are not merely footwear; they are the foundation of your posture and confidence.”</p>
          <span className="text-[8px] font-bold text-slate-400">— Master Cobbler &amp; Founder</span>
        </div>
      );

    // -------------------------------------------------------------------------
    // 6. TESTIMONIALS & REVIEWS (5 VARIANTS)
    // -------------------------------------------------------------------------
    case "TestimonialSlider":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-3 border border-slate-800 flex flex-col justify-center space-y-1.5 overflow-hidden">
          <div className="flex items-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-2.5 h-2.5 fill-amber-400" />
            ))}
          </div>
          <div className="w-full h-1.5 rounded bg-slate-300" />
          <div className="w-36 h-1.5 rounded bg-slate-500" />
          <div className="flex items-center gap-1.5 pt-1">
            <div className="w-4 h-4 rounded-full bg-emerald-500" />
            <div className="w-16 h-1.5 rounded bg-slate-400" />
          </div>
        </div>
      );

    case "TestimonialSliderMultiCard":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2 border border-slate-800 grid grid-cols-3 gap-1.5 items-center overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-slate-900 border border-slate-800 p-1.5 flex flex-col justify-between">
              <div className="flex text-amber-400"><Star className="w-2 h-2 fill-amber-400" /><Star className="w-2 h-2 fill-amber-400" /></div>
              <div className="w-10 h-1 rounded bg-slate-300" />
              <div className="w-8 h-1 rounded bg-emerald-400" />
            </div>
          ))}
        </div>
      );

    case "TestimonialSliderCrossfade":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-3 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1 overflow-hidden">
          <p className="text-[10px] font-serif text-slate-200 italic">“Best leather quality I have worn in Pakistan.”</p>
          <span className="text-[8px] font-mono text-emerald-400 font-bold">Ahmed K. • Verified Buyer</span>
        </div>
      );

    case "TestimonialSliderVideo":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2 border border-slate-800 grid grid-cols-3 gap-1.5 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center relative">
              <div className="w-6 h-6 rounded-full bg-emerald-500/80 flex items-center justify-center text-slate-950">
                <Play className="w-3 h-3 fill-slate-950 ml-0.5" />
              </div>
            </div>
          ))}
        </div>
      );

    case "TestimonialBadgeWall":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex items-center justify-between gap-3 overflow-hidden">
          <div className="w-18 h-18 rounded-xl bg-slate-900 border border-amber-500/40 p-2 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-extrabold text-amber-400">4.9 / 5</span>
            <div className="flex text-amber-400 scale-75"><Star className="w-2.5 h-2.5 fill-amber-400" /></div>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-[9px] font-bold text-white">Over 2,400+ 5-Star Reviews</p>
            <p className="text-[8px] text-slate-400">Lahore, Karachi, Islamabad buyers verified</p>
          </div>
        </div>
      );

    // -------------------------------------------------------------------------
    // 7. NEWSLETTER & VIP (5 VARIANTS)
    // -------------------------------------------------------------------------
    case "NewsletterSignupProgressive":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-3 border border-slate-800 flex flex-col items-center justify-center space-y-2 text-center overflow-hidden">
          <div className="w-28 h-2.5 rounded bg-slate-100 font-bold" />
          <div className="w-36 h-1 rounded bg-slate-500" />
          <div className="w-full max-w-[180px] h-6 rounded-full bg-slate-900 border border-slate-700 px-2 flex items-center justify-between">
            <span className="text-[8px] text-slate-500">Your email...</span>
            <div className="w-8 h-4 rounded-full bg-emerald-500 text-[8px] font-bold text-slate-950 flex items-center justify-center">Join</div>
          </div>
        </div>
      );

    case "NewsletterSignup":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-3 border border-slate-800 flex flex-col justify-center space-y-1.5 overflow-hidden">
          <div className="flex items-center gap-1 text-emerald-400 text-[9px] font-bold">
            <Mail className="w-3 h-3" />
            <span>Join The Inner Circle</span>
          </div>
          <div className="w-full h-5 rounded-lg bg-slate-900 border border-slate-800 px-2 flex items-center justify-between text-[8px] text-slate-500">
            <span>Enter email...</span>
            <div className="w-12 h-3.5 rounded bg-emerald-500 text-slate-950 font-bold flex items-center justify-center">Subscribe</div>
          </div>
        </div>
      );

    case "NewsletterSignupInline":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-3 border border-slate-800 flex flex-col justify-center space-y-2 overflow-hidden">
          <div className="w-24 h-2 rounded bg-slate-200" />
          <div className="w-full h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between px-2">
            <span className="text-[8px] text-slate-500">you@domain.com</span>
            <div className="w-6 h-4 rounded bg-emerald-500 flex items-center justify-center text-slate-950"><ArrowRight className="w-2.5 h-2.5" /></div>
          </div>
        </div>
      );

    case "NewsletterSignupSticky":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-slate-800 flex flex-col justify-between overflow-hidden">
          <div className="w-16 h-1.5 rounded bg-slate-400" />
          <div className="w-full py-1 rounded bg-slate-900 border border-emerald-500/40 flex items-center justify-between px-2 text-[8px]">
            <span className="text-emerald-400 font-bold">Get 10% Discount</span>
            <div className="w-10 h-3.5 rounded bg-emerald-500 text-slate-950 font-bold flex items-center justify-center">Unlock</div>
          </div>
        </div>
      );

    case "NewsletterDiscountScratch":
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-2.5 border border-dashed border-emerald-500/40 flex items-center justify-between gap-2 overflow-hidden">
          <div className="space-y-1">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-bold">VOUCHER: ROYAL10</span>
            <p className="text-[8px] text-slate-400">Unlock 10% OFF your first handcrafted order</p>
          </div>
          <div className="w-14 h-8 rounded-lg bg-emerald-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">Copy</div>
        </div>
      );

    default:
      return (
        <div className="h-28 w-full rounded-xl bg-slate-950 p-3 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1 text-slate-400">
          <Layout className="w-5 h-5 text-emerald-400" />
          <span className="text-[9px] font-semibold">{variantId}</span>
        </div>
      );
  }
}

export default function StoreBuilderPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mode & Step state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [builderMode, setBuilderMode] = useState<"custom_blueprints" | "quick_templates">("custom_blueprints");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Editable Store Name & Tagline in Step 2
  const [customStoreName, setCustomStoreName] = useState("StepCraft Premium");
  const [customStoreTagline, setCustomStoreTagline] = useState("Handcrafted luxury footwear made by master artisans");

  // Generated Plan & Previews
  const [plan, setPlan] = useState<any>(null);
  const [previews, setPreviews] = useState<TemplatePreview[]>([]);

  // Section Blueprint Selections
  const [activeCategoryTab, setActiveCategoryTab] = useState<SectionCategory>("hero");
  const [selectedSections, setSelectedSections] = useState<UserSectionSelections>({
    hero: "HeroSplitImage",
    categories: "CategoryCarouselCenterEmphasis",
    products: "ProductGridFeatured",
    features: "FeatureGrid",
    story: "BrandStory",
    testimonials: "TestimonialSlider",
    newsletter: "NewsletterSignupProgressive",
  });

  // Custom User-Created Components List State
  const [customComponents, setCustomComponents] = useState<CustomComponentData[]>([]);
  const [selectedCustomId, setSelectedCustomId] = useState<string | null>(null);

  // Modal Editor State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<"content" | "media" | "styling">("content");
  const [mediaSourceTab, setMediaSourceTab] = useState<"upload" | "ai" | "url">("upload");
  const [aiImagePrompt, setAiImagePrompt] = useState("Luxury handmade oxford shoe on royal marble table");
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);

  const [customComp, setCustomComp] = useState<CustomComponentData>({
    id: `custom_${Date.now()}`,
    name: "Custom Hero Showcase",
    badge: "EXCLUSIVE CRAFT",
    title: "Master Artisan Luxury Heritage",
    subtitle: "Every pair is hand-cut, welted, and polished from premium grade full-grain calfskin.",
    primaryCtaText: "Shop Collection",
    primaryCtaLink: "/shop",
    secondaryCtaText: "Explore Story",
    secondaryCtaLink: "#story",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop",
    imagePosition: "right",
    bgTheme: "slate",
    buttonTheme: "emerald",
  });

  // Final generation states
  const [progressStepIndex, setProgressStepIndex] = useState(0);
  const [generatedStore, setGeneratedStore] = useState<any>(null);

  // -------------------------------------------------------------------------
  // Handle Save / Add Custom Component to Blueprint
  // -------------------------------------------------------------------------
  const handleSaveCustomComponent = () => {
    const existingIndex = customComponents.findIndex((c) => c.id === customComp.id);
    let targetId = customComp.id;

    if (existingIndex >= 0) {
      // Update existing
      setCustomComponents((prev) => {
        const updated = [...prev];
        updated[existingIndex] = { ...customComp };
        return updated;
      });
    } else {
      // Add new
      targetId = `custom_${Date.now()}`;
      const newComp: CustomComponentData = {
        ...customComp,
        id: targetId,
        name: customComp.title || `Custom Section ${customComponents.length + 1}`,
      };
      setCustomComponents((prev) => [...prev, newComp]);
    }

    setSelectedCustomId(targetId);
    setShowCustomModal(false);
  };

  const handleOpenNewCustomModal = () => {
    setCustomComp({
      id: `custom_${Date.now()}`,
      name: `Custom Section ${customComponents.length + 1}`,
      badge: "FEATURED",
      title: "Handcrafted Luxury Heritage",
      subtitle: "Every product is meticulously crafted with high grade materials.",
      primaryCtaText: "Discover Now",
      primaryCtaLink: "/shop",
      secondaryCtaText: "Learn More",
      secondaryCtaLink: "#story",
      imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop",
      imagePosition: "right",
      bgTheme: "slate",
      buttonTheme: "emerald",
    });
    setShowCustomModal(true);
  };

  const handleEditCustomComponent = (comp: CustomComponentData) => {
    setCustomComp({ ...comp });
    setShowCustomModal(true);
  };

  const handleDeleteCustomComponent = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCustomComponents((prev) => prev.filter((c) => c.id !== id));
    if (selectedCustomId === id) {
      setSelectedCustomId(null);
      setActiveCategoryTab("hero");
    }
  };

  // -------------------------------------------------------------------------
  // Handle PC File Upload
  // -------------------------------------------------------------------------
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomComp((prev) => ({ ...prev, imageUrl: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // -------------------------------------------------------------------------
  // Handle AI Image Generation
  // -------------------------------------------------------------------------
  const handleGenerateAiImage = async () => {
    if (!aiImagePrompt.trim()) return;
    setIsGeneratingAiImage(true);

    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiImagePrompt,
          niche: plan?.industry || "shoes",
          aspect: customComp.imagePosition === "background" ? "landscape" : "portrait",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          setCustomComp((prev) => ({ ...prev, imageUrl: data.imageUrl }));
        }
      } else {
        const fallbackUrl = `https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop&sig=${Date.now()}`;
        setCustomComp((prev) => ({ ...prev, imageUrl: fallbackUrl }));
      }
    } catch (err) {
      console.error("AI image generation error:", err);
      const fallbackUrl = `https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop&sig=${Date.now()}`;
      setCustomComp((prev) => ({ ...prev, imageUrl: fallbackUrl }));
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  // -------------------------------------------------------------------------
  // STEP 1 -> STEP 2: Plan & Fetch Component Blueprints
  // -------------------------------------------------------------------------
  const handleStartPlanning = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/generate-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
        setPreviews(data.previews || []);
        if (data.plan?.suggestedName) setCustomStoreName(data.plan.suggestedName);
        if (data.plan?.suggestedTagline) setCustomStoreTagline(data.plan.suggestedTagline);

        if (data.plan?.recommendedSections) {
          setSelectedSections((prev) => ({
            ...prev,
            hero: data.plan.recommendedSections.hero || prev.hero,
            categories: data.plan.recommendedSections.categoryCarousel || prev.categories,
            products: data.plan.recommendedSections.productGrid || prev.products,
            story: data.plan.recommendedSections.brandStory || prev.story,
            testimonials: data.plan.recommendedSections.testimonials || prev.testimonials,
            newsletter: data.plan.recommendedSections.newsletter || prev.newsletter,
          }));
        }
      } else {
        const pLower = prompt.toLowerCase();
        const isWatch = /watch|ghari|timepiece|chronograph|rolex/i.test(pLower);
        const isPerfume = /perfume|fragrance|attar|itr|oud|scent/i.test(pLower);
        const isFashion = /fashion|cloth|kapra|dress|apparel|kurta|suit/i.test(pLower);
        const isTech = /tech|gadget|mobile|phone|electronic|audio|headphone/i.test(pLower);
        const isJewel = /jewel|gold|ring|diamond|silver/i.test(pLower);

        const fNiche = isWatch ? "watches" : isPerfume ? "perfumes" : isFashion ? "fashion" : isTech ? "electronics" : isJewel ? "jewelry" : "shoes";
        const fName = isWatch ? "ChronoCraft Luxury" : isPerfume ? "Aura Royal Parfums" : isFashion ? "Vogue Studio" : isTech ? "NeonTech Hub" : isJewel ? "Luxe Jewels" : "StepCraft Premium";
        const fTagline = isWatch ? "Precision luxury timepieces & chronographs" : isPerfume ? "Artisanal French & Oriental fragrances" : isFashion ? "Curated designer fashion & pret" : isTech ? "Next-gen tech gear & smart devices" : isJewel ? "Timeless handcrafted 18K fine jewelry" : "Handcrafted luxury footwear made by master artisans";

        setPlan({
          suggestedName: fName,
          suggestedTagline: fTagline,
          industry: fNiche,
          style: "luxury",
        });
        setCustomStoreName(fName);
        setCustomStoreTagline(fTagline);
      }

      setCurrentStep(2);
    } catch (error) {
      console.error("Planning failed:", error);
      const pLower = prompt.toLowerCase();
      const isWatch = /watch|ghari|timepiece|chronograph|rolex/i.test(pLower);
      const isPerfume = /perfume|fragrance|attar|itr|oud|scent/i.test(pLower);
      const isFashion = /fashion|cloth|kapra|dress|apparel|kurta|suit/i.test(pLower);
      const isTech = /tech|gadget|mobile|phone|electronic|audio|headphone/i.test(pLower);
      const isJewel = /jewel|gold|ring|diamond|silver/i.test(pLower);

      const fNiche = isWatch ? "watches" : isPerfume ? "perfumes" : isFashion ? "fashion" : isTech ? "electronics" : isJewel ? "jewelry" : "shoes";
      const fName = isWatch ? "ChronoCraft Luxury" : isPerfume ? "Aura Royal Parfums" : isFashion ? "Vogue Studio" : isTech ? "NeonTech Hub" : isJewel ? "Luxe Jewels" : "StepCraft Premium";
      const fTagline = isWatch ? "Precision luxury timepieces & chronographs" : isPerfume ? "Artisanal French & Oriental fragrances" : isFashion ? "Curated designer fashion & pret" : isTech ? "Next-gen tech gear & smart devices" : isJewel ? "Timeless handcrafted 18K fine jewelry" : "Handcrafted luxury footwear made by master artisans";

      setPlan({
        suggestedName: fName,
        suggestedTagline: fTagline,
        industry: fNiche,
        style: "luxury",
      });
      setCustomStoreName(fName);
      setCustomStoreTagline(fTagline);
      setCurrentStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // STEP 2 -> STEP 3: Final Build & Assembly
  // -------------------------------------------------------------------------
  const handleBuildStore = async (chosenTemplateId?: string) => {
    setCurrentStep(3);
    setIsLoading(true);
    setProgressStepIndex(0);

    const interval = setInterval(() => {
      setProgressStepIndex((prev) => {
        if (prev < PROGRESS_STEPS.length - 2) return prev + 1;
        return prev;
      });
    }, 1200);

    try {
      const payload = {
        prompt,
        plan: {
          ...plan,
          suggestedName: customStoreName,
          suggestedTagline: customStoreTagline,
        },
        builderMode,
        chosenTemplateId: builderMode === "quick_templates" ? chosenTemplateId : undefined,
        chosenSections: builderMode === "custom_blueprints" ? selectedSections : undefined,
        customComponents: customComponents.length > 0 ? customComponents : undefined,
      };

      const res = await fetch("/api/ai/generate-store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      clearInterval(interval);
      setProgressStepIndex(PROGRESS_STEPS.length - 1);

      if (res.ok) {
        const data = await res.json();
        const effectiveNiche = plan?.industry || "shoes";
        const effectiveName = customStoreName || plan?.suggestedName || "My Store";
        const effectiveTagline = customStoreTagline || plan?.suggestedTagline || "Handcrafted curated luxury";
        const rawSlug = effectiveName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "mystore";
        const uniqueSlug = `${rawSlug}-${Math.random().toString(36).substring(2, 6)}`;

        // Build fallback layoutConfig in case API didn't return full layout
        const assembledSections: any[] = [];
        if (selectedSections.features === "PromoBanner") {
          assembledSections.push({
            id: "promo-banner-1",
            type: "PromoBanner",
            props: {
              text: "🎉 Free Express Delivery across Pakistan! Use code 'ROYAL10' for 10% OFF.",
              layout: "ribbon",
            },
          });
        }
        assembledSections.push({
          id: "hero-section-1",
          type: selectedSections.hero || "HeroCenteredOverlay",
          props: {
            title: effectiveNiche === "watches" ? "Precision Engineering & Timeless Horology" : effectiveNiche === "perfumes" ? "The Royal Essence of Pure Luxury" : "Handcrafted Luxury Heritage",
            subtitle: effectiveTagline,
            ctaText: "Shop Collection",
            ctaLink: "/shop",
            secondaryCtaText: "View Catalog",
            secondaryCtaLink: "/shop",
            imageUrl: effectiveNiche === "watches" ? "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80" : effectiveNiche === "perfumes" ? "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80" : "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
            imageAlignment: "right",
          },
        });
        if (customComponents.length > 0) {
          customComponents.forEach((comp, idx) => {
            assembledSections.push({
              id: comp.id || `custom-section-${idx + 1}`,
              type: "HeroSplitImage",
              props: {
                badge: comp.badge,
                title: comp.title,
                subtitle: comp.subtitle,
                ctaText: comp.primaryCtaText,
                ctaLink: comp.primaryCtaLink,
                secondaryCtaText: comp.secondaryCtaText,
                secondaryCtaLink: comp.secondaryCtaLink,
                imageUrl: comp.imageUrl,
                imageAlignment: comp.imagePosition || "right",
                bgTheme: comp.bgTheme || "slate",
                buttonTheme: comp.buttonTheme || "emerald",
              },
            });
          });
        }
        if (selectedSections.features && selectedSections.features !== "PromoBanner") {
          assembledSections.push({
            id: "feature-grid-1",
            type: "FeatureGrid",
            props: {
              columns: 4,
              layout: selectedSections.features === "FeatureGridCards3D" ? "cards3d" : selectedSections.features === "FeatureGridMinimalBar" ? "minimal" : "grid",
              items: [
                { icon: "truck", title: "Cash on Delivery", description: "Nationwide express COD across Pakistan" },
                { icon: "shield-check", title: "100% Escrow Safe", description: "Buyer money-back protection" },
                { icon: "rotate-ccw", title: "7-Day Easy Exchange", description: "Hassle-free replacement" },
                { icon: "award", title: "100% Genuine Quality", description: "Verified authentic materials & craft" },
              ],
            },
          });
        }
        assembledSections.push({
          id: "categories-showcase-1",
          type: selectedSections.categories || "CategoryCarouselCenterEmphasis",
          props: {
            title: `Explore ${effectiveName} Collections`,
            layout: "card",
            categories: effectiveNiche === "watches" ? [
              { title: "Automatic Chronographs", count: "18 models", icon: "star", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80" },
              { title: "Classic Leather Dress", count: "24 models", icon: "trending-up", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80" },
              { title: "18K Gold Plated", count: "12 models", icon: "award", image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80" },
              { title: "Sports & Diver 200M", count: "15 models", icon: "tag", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" },
            ] : [
              { title: "Featured Collection", count: "24 items", icon: "star", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80" },
              { title: "Trending Bestsellers", count: "18 items", icon: "trending-up", image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80" },
              { title: "Limited Drops", count: "32 items", icon: "tag", image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80" },
              { title: "Heritage Edition", count: "12 items", icon: "award", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80" },
            ],
          },
        });
        assembledSections.push({
          id: "products-catalog-1",
          type: selectedSections.products || "ProductGridFeatured",
          props: {
            title: "Featured Masterpieces",
            subtitle: `Handcrafted ${effectiveNiche} with nationwide Cash on Delivery.`,
            columns: 3,
          },
        });
        assembledSections.push({
          id: "brand-story-1",
          type: selectedSections.story || "BrandStory",
          props: {
            title: effectiveNiche === "watches" ? "The Art of Precision Horology" : "Our Heritage & Craftsmanship",
            paragraphs: [
              "Every piece is handcrafted with top-tier materials and rigorous quality inspections.",
              "We build products engineered for timeless elegance and lasting durability.",
            ],
            imageUrl: effectiveNiche === "watches" ? "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?auto=format&fit=crop&w=1200&q=80" : "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80",
          },
        });
        assembledSections.push({
          id: "testimonials-slider-1",
          type: selectedSections.testimonials || "TestimonialSlider",
          props: {
            title: "What Our Buyers Say",
            layout: "carousel",
            testimonials: [
              { id: "1", name: "Hamza Tariq (Lahore)", text: "Ordered from this store and the quality is completely authentic. Exceeded expectations!", rating: 5, role: "Verified Buyer" },
              { id: "2", name: "Dr. Bilal Khan (Islamabad)", text: "Delivered in 2 days with Cash on Delivery. Superb packaging!", rating: 5, role: "Verified Buyer" },
            ],
          },
        });
        assembledSections.push({
          id: "newsletter-signup-1",
          type: selectedSections.newsletter || "NewsletterSignupProgressive",
          props: {
            title: `Join The ${effectiveName} Inner Circle`,
            subtitle: "Get exclusive access to private drops and enjoy instant 10% OFF your first order.",
            buttonText: "Claim 10% Discount",
            layout: "box",
          },
        });

        const storeData = data.store || {
          id: `store_${Date.now()}`,
          slug: uniqueSlug,
          name: effectiveName,
          niche: effectiveNiche,
          description: effectiveTagline,
          is_published: true,
          is_generating: false,
          subdomain: uniqueSlug,
          custom_domain: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          layout_config: {
            storeName: effectiveName,
            theme: {
              colors: plan?.colorPalette || { primary: "#0A0A0A", secondary: "#D4AF37", background: "#050505", text: "#F8FAFC" },
              typography: { heading: "Playfair Display", body: "Inter" },
            },
            sections: assembledSections,
          },
        };

        // Guarantee layout_config has our assembled sections
        if (!storeData.layout_config || !storeData.layout_config.sections || storeData.layout_config.sections.length === 0) {
          storeData.layout_config = {
            storeName: effectiveName,
            theme: {
              colors: plan?.colorPalette || { primary: "#0A0A0A", secondary: "#D4AF37", background: "#050505", text: "#F8FAFC" },
              typography: { heading: "Playfair Display", body: "Inter" },
            },
            sections: assembledSections,
          };
        }

        setGeneratedStore({
          id: storeData.id,
          slug: storeData.slug || uniqueSlug,
          name: storeData.name,
          tokensUsed: data.tokensUsed || 3420,
          generationCost: `$${(data.costUsd || 0.0035).toFixed(4)}`,
        });

        try {
          const existing = JSON.parse(localStorage.getItem("digishop_stores") || "[]");
          localStorage.setItem("digishop_stores", JSON.stringify([storeData, ...existing.filter((s: any) => s.slug !== storeData.slug)]));
        } catch {}
      } else {
        const effectiveNiche = plan?.industry || "watches";
        const effectiveName = customStoreName || (effectiveNiche === "watches" ? "ChronoCraft Luxury" : "My Store");
        const effectiveTagline = customStoreTagline || "Precision luxury timepieces and chronographs";
        const rawSlug = effectiveName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "mystore";
        const uniqueSlug = `${rawSlug}-${Math.random().toString(36).substring(2, 6)}`;

        const assembledSections: any[] = [];
        if (selectedSections.features === "PromoBanner") {
          assembledSections.push({
            id: "promo-banner-1",
            type: "PromoBanner",
            props: {
              text: "🎉 Free Express Delivery across Pakistan! Use code 'ROYAL10' for 10% OFF.",
              layout: "ribbon",
            },
          });
        }
        assembledSections.push({
          id: "hero-section-1",
          type: selectedSections.hero || "HeroCenteredOverlay",
          props: {
            title: effectiveNiche === "watches" ? "Precision Engineering & Timeless Horology" : effectiveNiche === "perfumes" ? "The Royal Essence of Pure Luxury" : "Handcrafted Luxury Heritage",
            subtitle: effectiveTagline,
            ctaText: "Shop Collection",
            ctaLink: "/shop",
            secondaryCtaText: "View Catalog",
            secondaryCtaLink: "/shop",
            imageUrl: effectiveNiche === "watches" ? "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80" : "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
            imageAlignment: "right",
          },
        });
        if (customComponents.length > 0) {
          customComponents.forEach((comp, idx) => {
            assembledSections.push({
              id: comp.id || `custom-section-${idx + 1}`,
              type: "CustomComponent",
              props: {
                badge: comp.badge,
                title: comp.title,
                subtitle: comp.subtitle,
                ctaText: comp.primaryCtaText,
                ctaLink: comp.primaryCtaLink,
                secondaryCtaText: comp.secondaryCtaText,
                secondaryCtaLink: comp.secondaryCtaLink,
                imageUrl: comp.imageUrl,
                imagePosition: comp.imagePosition || "right",
                imageAlignment: comp.imagePosition || "right",
                bgTheme: comp.bgTheme || "slate",
                buttonTheme: comp.buttonTheme || "emerald",
              },
            });
          });
        }
        if (selectedSections.features && selectedSections.features !== "PromoBanner") {
          assembledSections.push({
            id: "feature-grid-1",
            type: "FeatureGrid",
            props: {
              columns: 4,
              layout: selectedSections.features === "FeatureGridCards3D" ? "cards3d" : selectedSections.features === "FeatureGridMinimalBar" ? "minimal" : "grid",
              items: [
                { icon: "truck", title: "Cash on Delivery", description: "Nationwide express COD across Pakistan" },
                { icon: "shield-check", title: "100% Escrow Safe", description: "Buyer money-back protection" },
                { icon: "rotate-ccw", title: "7-Day Easy Exchange", description: "Hassle-free replacement" },
                { icon: "award", title: "100% Genuine Quality", description: "Verified authentic materials & craft" },
              ],
            },
          });
        }
        assembledSections.push({
          id: "categories-showcase-1",
          type: selectedSections.categories || "CategoryCarouselCenterEmphasis",
          props: {
            title: `Explore ${effectiveName} Collections`,
            layout: "card",
            categories: effectiveNiche === "watches" ? [
              { title: "Automatic Chronographs", count: "18 models", icon: "star", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80" },
              { title: "Classic Leather Dress", count: "24 models", icon: "trending-up", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80" },
              { title: "18K Gold Plated", count: "12 models", icon: "award", image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80" },
              { title: "Sports & Diver 200M", count: "15 models", icon: "tag", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" },
            ] : [
              { title: "Featured Collection", count: "24 items", icon: "star", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80" },
              { title: "Trending Bestsellers", count: "18 items", icon: "trending-up", image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80" },
              { title: "Limited Drops", count: "32 items", icon: "tag", image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80" },
              { title: "Heritage Edition", count: "12 items", icon: "award", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80" },
            ],
          },
        });
        assembledSections.push({
          id: "products-catalog-1",
          type: selectedSections.products || "ProductGridFeatured",
          props: {
            title: "Featured Masterpieces",
            subtitle: `Handcrafted ${effectiveNiche} with nationwide Cash on Delivery.`,
            columns: 3,
          },
        });
        assembledSections.push({
          id: "brand-story-1",
          type: selectedSections.story || "BrandStory",
          props: {
            title: effectiveNiche === "watches" ? "The Art of Precision Horology" : "Our Heritage & Craftsmanship",
            paragraphs: [
              "Every piece is handcrafted with top-tier materials and rigorous quality inspections.",
              "We build products engineered for timeless elegance and lasting durability.",
            ],
            imageUrl: effectiveNiche === "watches" ? "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?auto=format&fit=crop&w=1200&q=80" : "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80",
          },
        });
        assembledSections.push({
          id: "testimonials-slider-1",
          type: selectedSections.testimonials || "TestimonialSlider",
          props: {
            title: "What Our Buyers Say",
            layout: "carousel",
            testimonials: [
              { id: "1", name: "Hamza Tariq (Lahore)", text: "Ordered from this store and the quality is completely authentic. Exceeded expectations!", rating: 5, role: "Verified Buyer" },
              { id: "2", name: "Dr. Bilal Khan (Islamabad)", text: "Delivered in 2 days with Cash on Delivery. Superb packaging!", rating: 5, role: "Verified Buyer" },
            ],
          },
        });
        assembledSections.push({
          id: "newsletter-signup-1",
          type: selectedSections.newsletter || "NewsletterSignupProgressive",
          props: {
            title: `Join The ${effectiveName} Inner Circle`,
            subtitle: "Get exclusive access to private drops and enjoy instant 10% OFF your first order.",
            buttonText: "Claim 10% Discount",
            layout: "box",
          },
        });

        const fallbackStore = {
          id: `store_${Date.now()}`,
          slug: uniqueSlug,
          name: effectiveName,
          niche: effectiveNiche,
          description: effectiveTagline,
          is_published: true,
          is_generating: false,
          subdomain: uniqueSlug,
          custom_domain: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          layout_config: {
            storeName: effectiveName,
            theme: {
              colors: plan?.colorPalette || { primary: "#0A0A0A", secondary: "#D4AF37", background: "#050505", text: "#F8FAFC" },
              typography: { heading: "Playfair Display", body: "Inter" },
            },
            sections: assembledSections,
          },
        };

        setGeneratedStore({
          id: fallbackStore.id,
          slug: fallbackStore.slug,
          name: fallbackStore.name,
          tokensUsed: 4120,
          generationCost: "$0.0042",
        });

        try {
          const existing = JSON.parse(localStorage.getItem("digishop_stores") || "[]");
          localStorage.setItem("digishop_stores", JSON.stringify([fallbackStore, ...existing.filter((s: any) => s.slug !== fallbackStore.slug)]));
        } catch {}
      }
    } catch (error) {
      console.error("Build failed:", error);
      clearInterval(interval);
      const fallbackSlug = customStoreName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "stepcraft-premium";
      const fallbackStore = {
        id: `store_${Date.now()}`,
        slug: fallbackSlug,
        name: customStoreName || "StepCraft Premium",
        niche: plan?.industry || "shoes",
        description: customStoreTagline || "Handcrafted luxury footwear",
        is_published: true,
        is_generating: false,
        subdomain: fallbackSlug,
        custom_domain: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setGeneratedStore({
        id: fallbackStore.id,
        slug: fallbackStore.slug,
        name: fallbackStore.name,
        tokensUsed: 4120,
        generationCost: "$0.0042",
      });

      try {
        const existing = JSON.parse(localStorage.getItem("digishop_stores") || "[]");
        localStorage.setItem("digishop_stores", JSON.stringify([fallbackStore, ...existing.filter((s: any) => s.slug !== fallbackStore.slug)]));
      } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVariant = (category: SectionCategory, variantId: string) => {
    setSelectedSections((prev) => ({
      ...prev,
      [category]: variantId,
    }));
  };

  const currentCategoryBlueprint = SECTION_BLUEPRINT_CATALOG.find((c) => c.category === activeCategoryTab)!;
  const currentSelectedCustom = customComponents.find((c) => c.id === selectedCustomId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none">
      {/* Clean Top Navbar */}
      <header className="border-b border-default bg-card shadow-2xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-subtle hover:text-heading transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold">Dashboard</span>
          </Link>

          {/* Stepper */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep >= 1 ? "bg-primary-600 text-white" : "bg-neutral-200 text-subtle"
                }`}
              >
                1
              </span>
              <span className="text-xs font-bold text-heading">Prompt</span>
            </div>

            <div className="w-6 h-px bg-neutral-200" />

            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep >= 2 ? "bg-primary-600 text-white" : "bg-neutral-200 text-subtle"
                }`}
              >
                2
              </span>
              <span className="text-xs font-bold text-heading">Components</span>
            </div>

            <div className="w-6 h-px bg-neutral-200" />

            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 3 ? "bg-primary-600 text-white" : "bg-neutral-200 text-subtle"
                }`}
              >
                3
              </span>
              <span className="text-xs font-bold text-heading">Ready</span>
            </div>
          </div>

          <Link
            href="/my-stores"
            className="text-xs font-semibold text-heading hover:text-primary-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-default transition-all shadow-2xs"
          >
            <Store className="w-3.5 h-3.5 text-primary-600" />
            <span>My Stores</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col justify-center">
        {/* ========================================================================= */}
        {/* STEP 1: CLEAN STORE DESCRIPTION & NICHE CHIPS                             */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Create Your Storefront
              </h1>
              <p className="text-sm text-slate-400">
                Describe your brand or select a category below to configure your storefront.
              </p>
            </div>

            {/* Form Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Store Description &amp; Vision
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  placeholder="e.g. Luxury handmade leather footwear store with a royal black and gold aesthetic, genuine craftsmanship, Cash on Delivery, and express shipping across Pakistan."
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed transition-all"
                />
              </div>

              {/* Quick Suggestions with Lucide Icons */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-medium text-slate-400 block">Popular Categories:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_PROMPTS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(item.prompt)}
                        className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-2 text-left active:scale-98"
                      >
                        <Icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Builder Mode Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBuilderMode("custom_blueprints")}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    builderMode === "custom_blueprints"
                      ? "bg-emerald-950/30 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/30"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <Layers className={`w-4 h-4 mt-0.5 flex-shrink-0 ${builderMode === "custom_blueprints" ? "text-emerald-400" : "text-slate-500"}`} />
                  <div>
                    <p className="text-xs font-bold text-white">Component Blueprints</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Customize specific section layouts (Hero, Products, Story).</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBuilderMode("quick_templates")}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    builderMode === "quick_templates"
                      ? "bg-emerald-950/30 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/30"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <Zap className={`w-4 h-4 mt-0.5 flex-shrink-0 ${builderMode === "quick_templates" ? "text-emerald-400" : "text-slate-500"}`} />
                  <div>
                    <p className="text-xs font-bold text-white">Instant Store Preset</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Generate a complete pre-built theme in 1 click.</p>
                  </div>
                </button>
              </div>

              {/* Submit CTA */}
              <button
                onClick={handleStartPlanning}
                disabled={!prompt.trim() || isLoading}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Planning Storefront Layout...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-slate-950" />
                    <span>Continue to Component Selection</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SECTION BLUEPRINT COMPONENT SELECTOR                              */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Bar with Editable Store Name & Tagline (No color dots) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1.5 flex-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={customStoreName}
                    onChange={(e) => setCustomStoreName(e.target.value)}
                    placeholder="Enter Store Name (e.g. StepCraft Luxury)"
                    className="text-base sm:text-lg font-bold text-white bg-transparent border-b border-dashed border-slate-700 focus:border-emerald-500 focus:outline-none w-full py-0.5 transition-all"
                  />
                </div>
                <input
                  type="text"
                  value={customStoreTagline}
                  onChange={(e) => setCustomStoreTagline(e.target.value)}
                  placeholder="Store Tagline or Slogan..."
                  className="text-xs text-slate-400 bg-transparent focus:text-slate-200 border-b border-transparent focus:border-slate-700 focus:outline-none w-full py-0.5 transition-all"
                />
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenNewCustomModal}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>+ Add Component</span>
                </button>

                <button
                  onClick={() => handleBuildStore()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>Build Storefront</span>
                </button>
              </div>
            </div>

            {/* Quick Templates Mode */}
            {builderMode === "quick_templates" ? (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold text-white">Select a Complete Store Preset</h2>
                  <p className="text-xs text-slate-400">Choose a pre-styled theme layout tailored for your business.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {previews.map((preview) => (
                    <div
                      key={preview.templateId}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                            {preview.tag}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{preview.preview.fontFamily}</span>
                        </div>

                        <h3 className="text-base font-bold text-white">{preview.templateName}</h3>
                        <p className="text-xs text-slate-400">{preview.description}</p>

                        <div
                          className="p-3.5 rounded-xl space-y-1.5 border border-slate-800 text-left"
                          style={{
                            background: `linear-gradient(135deg, ${preview.preview.primaryColor} 0%, #1e293b 100%)`,
                          }}
                        >
                          <p className="text-xs font-bold text-white line-clamp-1">{preview.preview.heroHeadline}</p>
                          <p className="text-[10px] text-slate-300 line-clamp-2">{preview.preview.heroSub}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuildStore(preview.templateId)}
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Select {preview.templateName}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Custom Section Blueprints Mode */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Section Tabs (4 cols) */}
                <div className="lg:col-span-4 space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sections:</h3>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        {7 + customComponents.length} Configured
                      </span>
                    </div>

                    {/* Standard Blueprint Sections */}
                    <div className="space-y-1">
                      {SECTION_BLUEPRINT_CATALOG.map((sec) => {
                        const Icon = SECTION_ICONS[sec.category] || Sparkles;
                        const isSelectedTab = !selectedCustomId && activeCategoryTab === sec.category;
                        const currentVariantId = selectedSections[sec.category];
                        const currentVariant = sec.variants.find((v) => v.id === currentVariantId);

                        return (
                          <button
                            key={sec.category}
                            onClick={() => {
                              setSelectedCustomId(null);
                              setActiveCategoryTab(sec.category);
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                              isSelectedTab
                                ? "bg-emerald-500/10 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/30"
                                : "bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`p-1.5 rounded-lg ${
                                  isSelectedTab ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{sec.title}</p>
                                <p className="text-[10px] text-emerald-400 truncate">
                                  {currentVariant?.name || "Selected"}
                                </p>
                              </div>
                            </div>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom User-Created Sections List */}
                    {customComponents.length > 0 && (
                      <div className="pt-2 space-y-1.5 border-t border-slate-800">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                            Custom Sections ({customComponents.length}):
                          </span>
                        </div>

                        {customComponents.map((comp) => {
                          const isSelected = selectedCustomId === comp.id;
                          return (
                            <div
                              key={comp.id}
                              onClick={() => setSelectedCustomId(comp.id)}
                              className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
                                isSelected
                                  ? "bg-emerald-950/40 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/30"
                                  : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className={`p-1.5 rounded-lg ${isSelected ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-emerald-400"}`}>
                                  <Layout className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-white truncate">{comp.title || comp.name}</p>
                                  <div className="flex items-center gap-1.5 text-[9px] text-emerald-400">
                                    <span>Custom Component</span>
                                    <span>•</span>
                                    <span className="capitalize">{comp.imagePosition}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditCustomComponent(comp);
                                  }}
                                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                                  title="Edit in Studio"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteCustomComponent(comp.id, e)}
                                  className="p-1 rounded-md text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10"
                                  title="Delete Section"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Custom Component Button in Sidebar */}
                    <button
                      type="button"
                      onClick={handleOpenNewCustomModal}
                      className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all mt-2 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>+ Create Custom Component</span>
                    </button>
                  </div>
                </div>

                {/* Right Area: Either Selected Custom Component OR Section Blueprint Variants (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                  {selectedCustomId && currentSelectedCustom ? (
                    /* CUSTOM COMPONENT INSPECT VIEW */
                    <div className="space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                              Custom Section
                            </span>
                            <h2 className="text-xl font-bold text-white">{currentSelectedCustom.title || currentSelectedCustom.name}</h2>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{currentSelectedCustom.subtitle}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditCustomComponent(currentSelectedCustom)}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Edit in Studio</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomComponent(currentSelectedCustom.id)}
                            className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-xs font-bold border border-rose-800/60 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* Large Visual Render Preview */}
                      <div
                        className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-2xl ${
                          currentSelectedCustom.bgTheme === "gold"
                            ? "bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-amber-500/30"
                            : currentSelectedCustom.bgTheme === "glass"
                            ? "bg-slate-900/60 backdrop-blur-xl border-emerald-500/30 shadow-xl"
                            : currentSelectedCustom.bgTheme === "black"
                            ? "bg-black border-slate-800"
                            : currentSelectedCustom.bgTheme === "minimal"
                            ? "bg-slate-950 border-dashed border-slate-700"
                            : "bg-slate-950 border-slate-800"
                        }`}
                      >
                        {currentSelectedCustom.imagePosition === "background" && currentSelectedCustom.imageUrl && (
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-25"
                            style={{ backgroundImage: `url(${currentSelectedCustom.imageUrl})` }}
                          />
                        )}

                        <div
                          className={`relative z-10 flex items-center gap-6 ${
                            currentSelectedCustom.imagePosition === "left"
                              ? "flex-row-reverse"
                              : currentSelectedCustom.imagePosition === "center"
                              ? "flex-col text-center"
                              : currentSelectedCustom.imagePosition === "background"
                              ? "flex-col text-center"
                              : "flex-row"
                          }`}
                        >
                          <div className="flex-1 space-y-3 min-w-0">
                            {currentSelectedCustom.badge && (
                              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                                {currentSelectedCustom.badge}
                              </span>
                            )}

                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                              {currentSelectedCustom.title}
                            </h3>

                            <p className="text-sm text-slate-300 leading-relaxed">
                              {currentSelectedCustom.subtitle}
                            </p>

                            <div className={`flex flex-wrap items-center gap-3 pt-2 ${currentSelectedCustom.imagePosition === "center" || currentSelectedCustom.imagePosition === "background" ? "justify-center" : "justify-start"}`}>
                              {currentSelectedCustom.primaryCtaText && (
                                <a
                                  href={currentSelectedCustom.primaryCtaLink || "#"}
                                  className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95 ${
                                    currentSelectedCustom.buttonTheme === "gold"
                                      ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                                      : currentSelectedCustom.buttonTheme === "white"
                                      ? "bg-white text-slate-950 hover:bg-slate-100"
                                      : currentSelectedCustom.buttonTheme === "outline"
                                      ? "bg-transparent border border-emerald-400 text-emerald-400 hover:bg-emerald-500/10"
                                      : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20"
                                  }`}
                                >
                                  <span>{currentSelectedCustom.primaryCtaText}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {currentSelectedCustom.secondaryCtaText && (
                                <a
                                  href={currentSelectedCustom.secondaryCtaLink || "#"}
                                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
                                >
                                  <span>{currentSelectedCustom.secondaryCtaText}</span>
                                </a>
                              )}
                            </div>
                          </div>

                          {currentSelectedCustom.imagePosition !== "none" && currentSelectedCustom.imagePosition !== "background" && (
                            <div className="w-48 sm:w-56 h-36 sm:h-44 rounded-2xl bg-slate-900 border border-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-2xl">
                              {currentSelectedCustom.imageUrl ? (
                                <img src={currentSelectedCustom.imageUrl} alt="preview" className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-slate-600" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Navigation Bar for Custom Section View */}
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedCustomId(null);
                            setActiveCategoryTab("hero");
                          }}
                          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back to Blueprint Sections</span>
                        </button>

                        <button
                          onClick={() => handleBuildStore()}
                          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Build Storefront</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* STANDARD BLUEPRINT VARIANTS CHOOSER (5 Variants!) */
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-white">{currentCategoryBlueprint.title}</h2>
                          <p className="text-xs text-slate-400">{currentCategoryBlueprint.subtitle}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[10px] font-bold text-emerald-400">
                          {currentCategoryBlueprint.variants.length} Layout Styles
                        </span>
                      </div>

                      {/* Variants Grid with Visual Illustrations (5 Variants!) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentCategoryBlueprint.variants.map((variant) => {
                          const isChosen = selectedSections[currentCategoryBlueprint.category] === variant.id;

                          return (
                            <div
                              key={variant.id}
                              onClick={() => handleSelectVariant(currentCategoryBlueprint.category, variant.id)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                                isChosen
                                  ? "bg-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/40"
                                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                              }`}
                            >
                              <div className="space-y-2.5">
                                {/* Rich Visual Layout Mockup Illustration */}
                                <ComponentVisualPreview variantId={variant.id} />

                                <div className="flex items-start justify-between gap-2 pt-1">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-white">{variant.name}</span>
                                      {variant.badge && (
                                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                                          {variant.badge}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400">{variant.tag}</span>
                                  </div>

                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                      isChosen
                                        ? "bg-emerald-500 border-emerald-500 text-slate-950"
                                        : "border-slate-700 bg-slate-950"
                                    }`}
                                  >
                                    {isChosen && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </div>
                                </div>

                                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{variant.description}</p>
                              </div>

                              <button
                                type="button"
                                className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                                  isChosen
                                    ? "bg-emerald-500 text-slate-950 font-bold"
                                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                }`}
                              >
                                {isChosen ? "Selected Style" : "Choose Style"}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Navigation Buttons */}
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => {
                            const idx = SECTION_BLUEPRINT_CATALOG.findIndex((c) => c.category === activeCategoryTab);
                            if (idx > 0) setActiveCategoryTab(SECTION_BLUEPRINT_CATALOG[idx - 1].category);
                          }}
                          disabled={SECTION_BLUEPRINT_CATALOG.findIndex((c) => c.category === activeCategoryTab) === 0}
                          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Previous
                        </button>

                        <button
                          onClick={() => {
                            const idx = SECTION_BLUEPRINT_CATALOG.findIndex((c) => c.category === activeCategoryTab);
                            if (idx < SECTION_BLUEPRINT_CATALOG.length - 1) {
                              setActiveCategoryTab(SECTION_BLUEPRINT_CATALOG[idx + 1].category);
                            } else {
                              handleBuildStore();
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          {SECTION_BLUEPRINT_CATALOG.findIndex((c) => c.category === activeCategoryTab) === SECTION_BLUEPRINT_CATALOG.length - 1 ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Build Storefront</span>
                            </>
                          ) : (
                            <>
                              <span>Next Section</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: CREATION & SUCCESS SCREEN                                         */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="max-w-xl mx-auto w-full text-center space-y-6 animate-in fade-in duration-300 py-6">
            {!generatedStore ? (
              /* Loading Progress State */
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Store className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white">Assembling Your Storefront</h2>
                  <p className="text-xs text-slate-400">Wiring up components and initializing catalog...</p>
                </div>

                <div className="max-w-sm mx-auto space-y-2 text-left bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {PROGRESS_STEPS.map((step, idx) => {
                    const isDone = idx < progressStepIndex;
                    const isCurrent = idx === progressStepIndex;

                    return (
                      <div key={idx} className="flex items-center gap-2.5 text-xs">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        ) : isCurrent ? (
                          <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin flex-shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-800 flex-shrink-0" />
                        )}
                        <span className={isCurrent ? "font-semibold text-white" : isDone ? "text-slate-400" : "text-slate-600"}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Clean Success Screen */
              <div className="p-8 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-xl space-y-6">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white">Your Storefront is Ready!</h2>
                  <p className="text-xs text-slate-400">
                    Saved to your account and ready for visual editing and live orders.
                  </p>
                </div>

                {/* Store Meta Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{generatedStore.name}</h3>
                        <p className="text-xs text-emerald-400 font-mono">/{generatedStore.slug}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      Published
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500 text-[11px]">Sections Configured</p>
                      <p className="text-slate-300 font-semibold mt-0.5">
                        {7 + customComponents.length} Component Blocks
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[11px]">Checkout &amp; Cart</p>
                      <p className="text-slate-300 font-semibold mt-0.5">COD, Escrow Active</p>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                  <a
                    href={`/preview/${generatedStore.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Eye className="w-4 h-4 text-slate-950" />
                    <span>View Live Store</span>
                  </a>

                  <Link
                    href={`/dashboard/editor/${generatedStore.slug}`}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Layout className="w-4 h-4 text-emerald-400" />
                    <span>Visual Editor</span>
                  </Link>

                  <Link
                    href="/my-stores"
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>My Stores</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* RICH CUSTOM COMPONENT BUILDER & VISUAL EDITOR MODAL                       */}
      {/* ========================================================================= */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-7 space-y-6 shadow-2xl relative my-6 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Layout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Custom Component Studio</h3>
                  <p className="text-xs text-slate-400">Design your custom section with AI images, button URLs &amp; styling</p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* LIVE REAL-TIME COMPONENT PREVIEW CONTAINER */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Live Component Preview:
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Updates live as you type</span>
                </div>

                <div
                  className={`p-6 rounded-2xl border transition-all relative overflow-hidden ${
                    customComp.bgTheme === "gold"
                      ? "bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-amber-500/30"
                      : customComp.bgTheme === "glass"
                      ? "bg-slate-900/60 backdrop-blur-xl border-emerald-500/30 shadow-xl"
                      : customComp.bgTheme === "black"
                      ? "bg-black border-slate-800"
                      : customComp.bgTheme === "minimal"
                      ? "bg-slate-950 border-dashed border-slate-700"
                      : "bg-slate-950 border-slate-800"
                  }`}
                >
                  {/* Background overlay mode */}
                  {customComp.imagePosition === "background" && customComp.imageUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-25"
                      style={{ backgroundImage: `url(${customComp.imageUrl})` }}
                    />
                  )}

                  <div
                    className={`relative z-10 flex items-center gap-6 ${
                      customComp.imagePosition === "left"
                        ? "flex-row-reverse"
                        : customComp.imagePosition === "center"
                        ? "flex-col text-center"
                        : customComp.imagePosition === "background"
                        ? "flex-col text-center"
                        : "flex-row"
                    }`}
                  >
                    {/* Text & Content Block */}
                    <div className="flex-1 space-y-2.5 min-w-0">
                      {customComp.badge && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wide">
                          {customComp.badge}
                        </span>
                      )}

                      <h4 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
                        {customComp.title || "Custom Component Headline"}
                      </h4>

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                        {customComp.subtitle || "Component description text goes here. Explain your product features, artisanal craft, or brand value proposition."}
                      </p>

                      {/* Action Buttons with Links */}
                      <div className={`flex flex-wrap items-center gap-2.5 pt-1.5 ${customComp.imagePosition === "center" || customComp.imagePosition === "background" ? "justify-center" : "justify-start"}`}>
                        {customComp.primaryCtaText && (
                          <span
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                              customComp.buttonTheme === "gold"
                                ? "bg-amber-400 text-slate-950"
                                : customComp.buttonTheme === "white"
                                ? "bg-white text-slate-950"
                                : customComp.buttonTheme === "outline"
                                ? "bg-transparent border border-emerald-400 text-emerald-400"
                                : "bg-emerald-500 text-slate-950 shadow-emerald-500/20"
                            }`}
                          >
                            <span>{customComp.primaryCtaText}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}

                        {customComp.secondaryCtaText && (
                          <span className="px-3.5 py-2 rounded-xl bg-slate-800/80 text-slate-200 border border-slate-700 text-xs font-semibold">
                            <span>{customComp.secondaryCtaText}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Image Block */}
                    {customComp.imagePosition !== "none" && customComp.imagePosition !== "background" && (
                      <div className="w-36 sm:w-44 h-28 sm:h-36 rounded-2xl bg-slate-900 border border-slate-700/80 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-xl relative group">
                        {customComp.imageUrl ? (
                          <img src={customComp.imageUrl} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-3 text-slate-500">
                            <ImageIcon className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                            <span className="text-[10px] block">No Image</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* EDITOR TABS */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  type="button"
                  onClick={() => setActiveModalTab("content")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeModalTab === "content"
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>1. Content &amp; Buttons</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTab("media")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeModalTab === "media"
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>2. Image &amp; AI Generator</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTab("styling")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeModalTab === "styling"
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>3. Layout &amp; Styling</span>
                </button>
              </div>

              {/* TAB 1: CONTENT & BUTTONS */}
              {activeModalTab === "content" && (
                <div className="space-y-4 text-xs animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Badge / Tag</label>
                      <input
                        type="text"
                        value={customComp.badge}
                        onChange={(e) => setCustomComp({ ...customComp, badge: e.target.value })}
                        placeholder="e.g. ✨ NEW DROP or 🔥 20% OFF"
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-slate-300 font-semibold block">Heading Title</label>
                      <input
                        type="text"
                        value={customComp.title}
                        onChange={(e) => setCustomComp({ ...customComp, title: e.target.value })}
                        placeholder="e.g. Handcrafted Leather Excellence"
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">Subtitle / Description</label>
                    <textarea
                      rows={2}
                      value={customComp.subtitle}
                      onChange={(e) => setCustomComp({ ...customComp, subtitle: e.target.value })}
                      placeholder="Describe this section's value proposition..."
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Primary & Secondary Button Links */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-emerald-400" /> Action Buttons &amp; URLs
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-medium block">Primary Button Text</label>
                        <input
                          type="text"
                          value={customComp.primaryCtaText}
                          onChange={(e) => setCustomComp({ ...customComp, primaryCtaText: e.target.value })}
                          placeholder="e.g. Shop Collection"
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-medium block">Primary Button URL</label>
                        <input
                          type="text"
                          value={customComp.primaryCtaLink}
                          onChange={(e) => setCustomComp({ ...customComp, primaryCtaLink: e.target.value })}
                          placeholder="e.g. /shop or /checkout or https://..."
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-medium block">Secondary Button Text (Optional)</label>
                        <input
                          type="text"
                          value={customComp.secondaryCtaText}
                          onChange={(e) => setCustomComp({ ...customComp, secondaryCtaText: e.target.value })}
                          placeholder="e.g. View Lookbook"
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-medium block">Secondary Button URL</label>
                        <input
                          type="text"
                          value={customComp.secondaryCtaLink}
                          onChange={(e) => setCustomComp({ ...customComp, secondaryCtaLink: e.target.value })}
                          placeholder="e.g. #story or /catalog"
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IMAGE & AI GENERATOR */}
              {activeModalTab === "media" && (
                <div className="space-y-4 text-xs animate-in fade-in">
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setMediaSourceTab("upload")}
                      className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        mediaSourceTab === "upload"
                          ? "bg-slate-800 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Upload from PC</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMediaSourceTab("ai")}
                      className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        mediaSourceTab === "ai"
                          ? "bg-emerald-500 text-slate-950 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>✨ AI Image Generator</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMediaSourceTab("url")}
                      className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        mediaSourceTab === "url"
                          ? "bg-slate-800 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Direct Image URL</span>
                    </button>
                  </div>

                  {/* 1. Upload from PC */}
                  {mediaSourceTab === "upload" && (
                    <div className="p-6 rounded-2xl bg-slate-950 border border-dashed border-slate-700 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">Choose an image from your computer</p>
                        <p className="text-slate-400 text-[11px]">Supports PNG, JPG, WEBP up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                      >
                        Browse Files
                      </button>
                    </div>
                  )}

                  {/* 2. AI Image Generator */}
                  {mediaSourceTab === "ai" && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> AI Image Description Prompt:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={aiImagePrompt}
                            onChange={(e) => setAiImagePrompt(e.target.value)}
                            placeholder="e.g. Royal Peshawari leather chappal on dark velvet background..."
                            className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={handleGenerateAiImage}
                            disabled={isGeneratingAiImage || !aiImagePrompt.trim()}
                            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                          >
                            {isGeneratingAiImage ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <Wand2 className="w-3.5 h-3.5" />
                                <span>Generate AI Photo</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Quick AI Presets */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] text-slate-500 font-medium">Quick Prompts:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "Luxury handmade oxford shoe on dark marble",
                            "Traditional Peshawari chappal genuine craft",
                            "Minimalist sneaker floating with dramatic shadow",
                            "Master cobbler stitching leather in workshop",
                          ].map((p, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setAiImagePrompt(p)}
                              className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-slate-200 border border-slate-800"
                            >
                              + {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Direct Image URL */}
                  {mediaSourceTab === "url" && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <label className="text-slate-300 font-semibold block">Paste Image URL</label>
                      <input
                        type="text"
                        value={customComp.imageUrl}
                        onChange={(e) => setCustomComp({ ...customComp, imageUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: LAYOUT & STYLING */}
              {activeModalTab === "styling" && (
                <div className="space-y-4 text-xs animate-in fade-in">
                  {/* Image Placement */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold block">Image Layout &amp; Position</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: "right", label: "Image Right", icon: AlignRight },
                        { id: "left", label: "Image Left", icon: AlignLeft },
                        { id: "center", label: "Centered Hero", icon: AlignCenter },
                        { id: "background", label: "Photo Background", icon: Maximize2 },
                        { id: "none", label: "No Image", icon: X },
                      ].map((pos) => {
                        const Icon = pos.icon;
                        return (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => setCustomComp({ ...customComp, imagePosition: pos.id as any })}
                            className={`p-3 rounded-xl border font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              customComp.imagePosition === pos.id
                                ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[10px]">{pos.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Background Themes */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold block">Background Theme</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: "slate", label: "Dark Slate" },
                        { id: "gold", label: "Royal Gold" },
                        { id: "glass", label: "Glassmorphism" },
                        { id: "black", label: "Pure Black" },
                        { id: "minimal", label: "Dashed Minimal" },
                      ].map((th) => (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => setCustomComp({ ...customComp, bgTheme: th.id as any })}
                          className={`p-2.5 rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                            customComp.bgTheme === th.id
                              ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <span className="text-[10px]">{th.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Button Color Themes */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold block">Button Style</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "emerald", label: "Emerald Glow", color: "bg-emerald-500" },
                        { id: "gold", label: "Royal Gold", color: "bg-amber-400" },
                        { id: "white", label: "Monochrome White", color: "bg-white" },
                        { id: "outline", label: "Outline Ghost", color: "border border-emerald-400" },
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setCustomComp({ ...customComp, buttonTheme: b.id as any })}
                          className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            customComp.buttonTheme === b.id
                              ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full ${b.color}`} />
                          <span className="text-[10px]">{b.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveCustomComponent}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save &amp; Add Component to Layout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
