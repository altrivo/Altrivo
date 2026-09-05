"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Wand2,
  Trash2,
  Settings,
  Plus,
  Eye,
  Monitor,
  Smartphone,
  Check,
  MoveUp,
  MoveDown,
  Palette,
  ShoppingBag,
  Heart,
  Tag,
  Pencil,
  Image as ImageIcon,
  RotateCcw,
  Send,
  Loader2,
  CheckCircle2,
  Layers,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Grid,
  BookOpen,
  Star,
  Mail,
  Sliders,
  Box,
  Layout,
  Columns,
  Maximize2,
  Minimize2,
  RefreshCw,
  Zap,
  Upload,
  Edit3,
  X,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import StorefrontRenderer from "@/components/sections/StorefrontRenderer";
import { mockProducts } from "@/lib/mock-products";

// ---------------------------------------------------------------------------
// Multi-Niche AI Asset Library & Curated Presets
// ---------------------------------------------------------------------------
interface NichePreset {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  images: Array<{ label: string; url: string }>;
  products: Array<{
    id: string;
    name: string;
    price: string;
    originalPrice: string;
    discount: string;
    rating: number;
    image: string;
    tag: string;
    inStock: boolean;
  }>;
}

const NICHE_PRESETS: Record<string, NichePreset> = {
  shoes: {
    id: "shoes",
    name: "Luxury Shoes & Footwear",
    emoji: "👞",
    tagline: "Handcrafted from 100% genuine full-grain leather by master Pakistani cobblers.",
    primaryColor: "#171717",
    accentColor: "#D4AF37",
    images: [
      { label: "Classic Black Oxford", url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80" },
      { label: "Tan Brown Brogues", url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80" },
      { label: "Suede Penny Loafers", url: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80" },
      { label: "Minimalist Sneakers", url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80" },
      { label: "Handcrafted Peshawari Chappal", url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80" },
      { label: "Leather Chelsea Boots", url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80" },
    ],
    products: [
      { id: "s1", name: "Royal Oxford Calfskin Shoes", price: "₨ 7,800", originalPrice: "₨ 9,500", discount: "18% OFF", rating: 4.9, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80", tag: "Bestseller", inStock: true },
      { id: "s2", name: "Handcrafted Suede Loafers", price: "₨ 6,400", originalPrice: "₨ 7,800", discount: "18% OFF", rating: 4.8, image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80", tag: "Trending", inStock: true },
      { id: "s3", name: "Peshawari Chappal - Pure Leather", price: "₨ 5,200", originalPrice: "₨ 6,500", discount: "20% OFF", rating: 5.0, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80", tag: "Traditional", inStock: true },
      { id: "s4", name: "Urban Streetwear Sneakers", price: "₨ 8,900", originalPrice: "₨ 11,000", discount: "20% OFF", rating: 4.9, image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80", tag: "Limited Drop", inStock: true },
    ],
  },
  clothing: {
    id: "clothing",
    name: "Shirts & Apparel Fashion",
    emoji: "👕",
    tagline: "Premium Egyptian cotton shirts and bespoke tailored menswear crafted for elegance.",
    primaryColor: "#0F172A",
    accentColor: "#0284C7",
    images: [
      { label: "Crisp White Oxford Shirt", url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80" },
      { label: "Bespoke Linen Casual Shirt", url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80" },
      { label: "Navy Blue Formal Shirt", url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80" },
      { label: "Minimalist Streetwear Hoodie", url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80" },
      { label: "Classic Khaki Kurta", url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80" },
    ],
    products: [
      { id: "c1", name: "Tailored Oxford Formal Shirt", price: "₨ 3,800", originalPrice: "₨ 4,800", discount: "21% OFF", rating: 4.9, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80", tag: "Bestseller", inStock: true },
      { id: "c2", name: "Breathable Pure Linen Shirt", price: "₨ 4,200", originalPrice: "₨ 5,500", discount: "24% OFF", rating: 4.8, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80", tag: "Summer Drop", inStock: true },
      { id: "c3", name: "Royal Navy Executive Shirt", price: "₨ 3,900", originalPrice: "₨ 4,900", discount: "20% OFF", rating: 5.0, image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80", tag: "Formal", inStock: true },
      { id: "c4", name: "Heavyweight Streetwear Tee", price: "₨ 2,400", originalPrice: "₨ 3,200", discount: "25% OFF", rating: 4.9, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80", tag: "Streetwear", inStock: true },
    ],
  },
  watches: {
    id: "watches",
    name: "Luxury Watches & Jewelry",
    emoji: "⌚",
    tagline: "Timeless chronographs and 18K gold handcrafted jewelry with lifetime guarantee.",
    primaryColor: "#0A0A0A",
    accentColor: "#EAB308",
    images: [
      { label: "Automatic Chronograph Watch", url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80" },
      { label: "18K Gold Plated Bracelet", url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80" },
      { label: "Minimalist Leather Watch", url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80" },
    ],
    products: [
      { id: "w1", name: "Aero Chronograph Luxury Watch", price: "₨ 18,500", originalPrice: "₨ 24,000", discount: "23% OFF", rating: 5.0, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80", tag: "VIP Edition", inStock: true },
      { id: "w2", name: "Handcrafted 18K Gold Band", price: "₨ 12,000", originalPrice: "₨ 15,000", discount: "20% OFF", rating: 4.9, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80", tag: "Exclusive", inStock: true },
    ],
  },
  tech: {
    id: "tech",
    name: "Electronics & Smart Gadgets",
    emoji: "📱",
    tagline: "Next-generation smart audio, gaming gear, and tech essentials with 1-year warranty.",
    primaryColor: "#090D16",
    accentColor: "#6366F1",
    images: [
      { label: "Wireless ANC Earbuds", url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80" },
      { label: "Mechanical RGB Keyboard", url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80" },
      { label: "Smart Fitness Watch", url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80" },
    ],
    products: [
      { id: "t1", name: "Pro ANC Wireless Earbuds", price: "₨ 6,999", originalPrice: "₨ 8,999", discount: "22% OFF", rating: 4.8, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80", tag: "Top Rated", inStock: true },
      { id: "t2", name: "Cyber RGB Mechanical Keyboard", price: "₨ 8,500", originalPrice: "₨ 11,000", discount: "23% OFF", rating: 4.9, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80", tag: "Gaming Drop", inStock: true },
    ],
  },
};

// ---------------------------------------------------------------------------
// Visual Component Catalog
// ---------------------------------------------------------------------------
interface VisualComponentBlueprint {
  type: string;
  title: string;
  category: "hero" | "categories" | "products" | "features" | "story" | "reviews" | "newsletter" | "custom";
  badge: string;
  description: string;
  diagram: React.ReactNode;
  defaultProps: any;
}

const VISUAL_COMPONENT_CATALOG: VisualComponentBlueprint[] = [
  {
    type: "HeroSplitImage",
    title: "Split Hero (Image + Text)",
    category: "hero",
    badge: "Most Popular",
    description: "2-column layout with high-impact product photo on right, headline, description, and dual action buttons.",
    diagram: (
      <div className="w-full h-20 bg-slate-950 rounded-lg border border-slate-800 p-2 flex items-center gap-2">
        <div className="flex-1 space-y-1">
          <div className="h-2.5 w-3/4 bg-emerald-500 rounded" />
          <div className="h-1.5 w-full bg-slate-700 rounded" />
          <div className="flex gap-1 pt-1">
            <div className="h-3 w-8 bg-emerald-400 rounded" />
            <div className="h-3 w-8 bg-slate-700 rounded" />
          </div>
        </div>
        <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 text-[9px] text-slate-400">
          Photo
        </div>
      </div>
    ),
    defaultProps: {
      title: "Walk With Royal Distinction",
      subtitle: "100% pure full-grain leather shoes handcrafted in Pakistan with ergonomic comfort.",
      ctaText: "Shop Collection",
      ctaLink: "#catalog",
      secondaryCtaText: "Learn Heritage",
      secondaryCtaLink: "#about",
      imageAlignment: "right",
      imageUrl: NICHE_PRESETS.shoes.images[0].url,
    },
  },
  {
    type: "HeroBento",
    title: "Modern Bento Grid Hero",
    category: "hero",
    badge: "Trending 2026",
    description: "Multi-card bento box showcasing flagship product, discount chip, and live customer reviews.",
    diagram: (
      <div className="w-full h-20 bg-slate-950 rounded-lg border border-slate-800 p-1.5 grid grid-cols-3 gap-1">
        <div className="col-span-2 bg-emerald-950/60 border border-emerald-500/30 rounded p-1 space-y-1">
          <div className="h-2 w-1/2 bg-emerald-400 rounded" />
          <div className="h-1 w-3/4 bg-slate-700 rounded" />
        </div>
        <div className="bg-slate-800 rounded flex items-center justify-center text-[8px] text-slate-400">Tile 2</div>
        <div className="col-span-3 h-4 bg-slate-900 border border-slate-800 rounded flex items-center px-2 text-[7px] text-emerald-400">
          ★ 4.9/5 Rating Banner
        </div>
      </div>
    ),
    defaultProps: {
      headline: "Artisanal Craft Meets Modern Tech",
      subline: "Designed for individuals who refuse ordinary quality.",
      primaryCtaText: "Explore Bento Drop",
      primaryCtaLink: "#catalog",
      secondaryCtaText: "Watch Cobbler Video",
      secondaryCtaLink: "#about",
      badgeText: "Handcrafted Edition",
      accentTag: "100% Full-Grain",
      heroImage: NICHE_PRESETS.shoes.images[1].url,
    },
  },
  {
    type: "PromoBanner",
    title: "Top Promotional Offer Ribbon",
    category: "features",
    badge: "High Conversion",
    description: "Eye-catching top ribbon displaying free shipping threshold, coupon code, and COD guarantee.",
    diagram: (
      <div className="w-full h-12 bg-amber-500/20 border border-amber-500/40 rounded-lg flex items-center justify-center px-2 text-center">
        <span className="text-[9px] font-bold text-amber-300 truncate">🎉 Free Delivery on orders over ₨ 5,000 across Pakistan!</span>
      </div>
    ),
    defaultProps: {
      text: "🎉 Free Express Delivery on orders over ₨ 5,000 across Pakistan! Use code 'ROYAL10' for 10% OFF.",
      layout: "ribbon",
    },
  },
  {
    type: "ProductGridFeatured",
    title: "Featured Products Catalog Grid",
    category: "products",
    badge: "Core Commerce",
    description: "3-column responsive product card grid with quick Add-to-Cart buttons, wishlist hearts, and discount badges.",
    diagram: (
      <div className="w-full h-20 bg-slate-950 rounded-lg border border-slate-800 p-1.5 grid grid-cols-3 gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded p-1 space-y-0.5">
            <div className="h-7 w-full bg-slate-800 rounded" />
            <div className="h-1.5 w-3/4 bg-slate-600 rounded" />
            <div className="h-1.5 w-1/2 bg-emerald-400 rounded" />
          </div>
        ))}
      </div>
    ),
    defaultProps: {
      title: "Featured Masterpieces",
      subtitle: "Discover Pakistan's finest handmade craft with Cash on Delivery.",
      columns: 3,
      limit: 12,
    },
  },
  {
    type: "CategoryCarouselCenterEmphasis",
    title: "Collection Category Carousel",
    category: "categories",
    badge: "Interactive",
    description: "Visual category slider showcasing sub-collections with high-res photos and product counts.",
    diagram: (
      <div className="w-full h-20 bg-slate-950 rounded-lg border border-slate-800 p-1.5 flex items-center gap-1.5 overflow-hidden">
        <div className="w-12 h-14 bg-slate-800 rounded opacity-60 flex-shrink-0" />
        <div className="w-20 h-16 bg-emerald-900/60 border border-emerald-500/50 rounded flex-shrink-0 flex flex-col justify-end p-1">
          <span className="text-[7px] font-bold text-white">Formals</span>
        </div>
        <div className="w-12 h-14 bg-slate-800 rounded opacity-60 flex-shrink-0" />
      </div>
    ),
    defaultProps: {
      title: "Explore Shoe Collections",
      layout: "card",
      categories: [
        { title: "Oxford & Formals", count: "24 items", image: NICHE_PRESETS.shoes.images[0].url },
        { title: "Casual Loafers", count: "18 items", image: NICHE_PRESETS.shoes.images[2].url },
        { title: "Sneakers & Street", count: "32 items", image: NICHE_PRESETS.shoes.images[3].url },
        { title: "Peshawari Chappal", count: "12 items", image: NICHE_PRESETS.shoes.images[4].url },
      ],
    },
  },
  {
    type: "FeatureGrid",
    title: "4-Column Trust Badges & Guarantees",
    category: "features",
    badge: "Trust Booster",
    description: "Highlights Cash on Delivery, TCS Delivery, 100% Escrow Buyer Protection, and 7-Day Exchange.",
    diagram: (
      <div className="w-full h-16 bg-slate-950 rounded-lg border border-slate-800 p-1 grid grid-cols-4 gap-1">
        {["COD", "Escrow", "Exchange", "Pure Leather"].map((t, i) => (
          <div key={i} className="bg-slate-900 rounded flex flex-col items-center justify-center p-1 text-center">
            <span className="text-[7px] font-bold text-emerald-400">{t}</span>
          </div>
        ))}
      </div>
    ),
    defaultProps: {
      columns: 4,
      items: [
        { icon: "truck", title: "Cash on Delivery", description: "Pay at your doorstep anywhere in Pakistan via TCS" },
        { icon: "shield-check", title: "100% Escrow Protection", description: "Guaranteed buyer security on every order" },
        { icon: "rotate-ccw", title: "7-Day Easy Exchange", description: "Hassle-free size replacement with zero hassle" },
        { icon: "award", title: "Pure Full-Grain Leather", description: "Hand-inspected natural leather by master craftsmen" },
      ],
    },
  },
  {
    type: "BrandStory",
    title: "Artisan Brand Story & Heritage",
    category: "story",
    badge: "Brand Vibe",
    description: "Deep narrative section telling the story of craftsmanship, dedication, and handmade pride.",
    diagram: (
      <div className="w-full h-20 bg-slate-950 rounded-lg border border-slate-800 p-2 flex items-center gap-2">
        <div className="w-14 h-14 bg-slate-800 rounded border border-slate-700 flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="h-2 w-3/4 bg-slate-300 rounded" />
          <div className="h-1.5 w-full bg-slate-700 rounded" />
        </div>
      </div>
    ),
    defaultProps: {
      title: "The Legacy of Master Cobblers",
      paragraphs: [
        "Every pair of StepCraft shoes begins with hand-selected hides of top-tier full-grain leather. Our craftsmen spend over 36 hours shaping and stitching each silhouette.",
        "We reject synthetic shortcuts. Every detail is engineered to ensure timeless luxury.",
      ],
      imageUrl: NICHE_PRESETS.shoes.images[5].url,
    },
  },
  {
    type: "TestimonialSlider",
    title: "Verified Customer Reviews Wall",
    category: "reviews",
    badge: "Social Proof",
    description: "Customer testimonials with 5-star ratings, buyer location, and verified badges.",
    diagram: (
      <div className="w-full h-16 bg-slate-950 rounded-lg border border-slate-800 p-2 flex gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex-1 bg-slate-900 border border-slate-800 rounded p-1.5 space-y-1">
            <div className="text-[7px] text-amber-400">★★★★★</div>
            <div className="h-1 w-full bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    ),
    defaultProps: {
      title: "What Pakistani Gentlemen Say",
      layout: "carousel",
      testimonials: [
        { id: "1", name: "Hamza Tariq (Lahore)", text: "Ordered the Black Oxford for my brother's wedding. Unmatched leather quality!", rating: 5, role: "Verified Buyer" },
        { id: "2", name: "Dr. Bilal Khan (Islamabad)", text: "COD was delivered in 2 days. Arch support is so comfortable.", rating: 5, role: "Verified Buyer" },
      ],
    },
  },
  {
    type: "NewsletterSignupProgressive",
    title: "VIP 10% OFF Newsletter Box",
    category: "newsletter",
    badge: "Lead Capture",
    description: "Progressive signup box offering instant discount incentive for new subscribers.",
    diagram: (
      <div className="w-full h-14 bg-gradient-to-r from-emerald-950 to-slate-950 border border-emerald-500/30 rounded-lg p-2 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-[8px] font-bold text-white">Join VIP Club</div>
          <div className="text-[7px] text-slate-400">Get 10% OFF</div>
        </div>
        <div className="h-5 w-16 bg-emerald-500 rounded flex items-center justify-center text-[7px] font-bold text-slate-950">Claim 10%</div>
      </div>
    ),
    defaultProps: {
      title: "Join The StepCraft Inner Circle",
      subtitle: "Get exclusive access to private shoe drops and enjoy instant 10% OFF your first order.",
      buttonText: "Claim 10% Discount",
    },
  },
  {
    type: "CustomComponent",
    title: "Custom Designed Section",
    category: "hero",
    badge: "Custom Studio",
    description: "Fully customizable section with badge, heading, description, dual action buttons, and image position options.",
    diagram: (
      <div className="w-full h-14 bg-gradient-to-r from-slate-900 to-amber-950/40 border border-amber-500/30 rounded-lg p-2 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-[8px] font-bold text-amber-300">✨ Custom Hero/Banner</div>
          <div className="text-[7px] text-slate-400">Dual CTA + Custom Photo</div>
        </div>
        <div className="h-5 w-14 bg-amber-400 rounded flex items-center justify-center text-[7px] font-bold text-slate-950">Explore</div>
      </div>
    ),
    defaultProps: {
      badge: "✨ EXCLUSIVE DROP",
      title: "Limited Edition Handcrafted Collection",
      subtitle: "Engineered with precision and premium craftsmanship for connoisseurs of timeless luxury.",
      ctaText: "Discover Now",
      ctaLink: "/shop",
      secondaryCtaText: "Learn Heritage",
      secondaryCtaLink: "#story",
      imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80",
      imagePosition: "right",
      bgTheme: "slate",
      buttonTheme: "emerald",
    },
  },
];

interface Section {
  id: string;
  type: string;
  props: any;
}

export default function VisualLayoutEditor() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || "stepcraft-premium";
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();

  // Active Store Metadata
  const [storeName, setStoreName] = useState("StepCraft Luxury Footwear");
  const [storeId, setStoreId] = useState<string | null>(null);
  const [activeNiche, setActiveNiche] = useState<string>("shoes");

  // Dynamic Layout Schema
  const [layoutConfig, setLayoutConfig] = useState<{
    storeName?: string;
    categories?: Array<{ name: string; href: string }>;
    products?: any[];
    theme: {
      colors: { primary: string; secondary: string; background: string; text: string };
      typography: { heading: string; body: string };
    };
    sections: Section[];
  }>({
    storeName: "StepCraft Luxury Footwear",
    categories: [
      { name: "Oxford & Formals", href: "#catalog" },
      { name: "Casual Loafers", href: "#catalog" },
      { name: "Sneakers & Street", href: "#catalog" },
      { name: "Peshawari Chappal", href: "#catalog" },
      { name: "Chelsea Boots", href: "#catalog" },
    ],
    theme: {
      colors: {
        primary: "#171717",
        secondary: "#D4AF37",
        background: "#ffffff",
        text: "#0A0A0A",
      },
      typography: {
        heading: "Playfair Display",
        body: "Inter",
      },
    },
    sections: [
      {
        id: "promo-1",
        type: "PromoBanner",
        props: {
          text: "🎉 Free Express Delivery on orders over ₨ 5,000 across Pakistan! Use code 'ROYAL10'.",
          layout: "ribbon",
        },
      },
      {
        id: "hero-1",
        type: "HeroSplitImage",
        props: {
          title: "Walk With Royal Distinction",
          subtitle: "100% pure full-grain calfskin leather shoes. Handcrafted in Pakistan with ergonomic comfort.",
          ctaText: "Shop Collection",
          ctaLink: "#catalog",
          secondaryCtaText: "Explore Heritage",
          secondaryCtaLink: "#about",
          imageAlignment: "right",
          imageUrl: NICHE_PRESETS.shoes.images[0].url,
        },
      },
      {
        id: "features-1",
        type: "FeatureGrid",
        props: {
          columns: 4,
          items: [
            { icon: "truck", title: "Cash on Delivery", description: "Nationwide COD delivery across Pakistan" },
            { icon: "shield-check", title: "A2 Escrow Protection", description: "100% buyer protection guarantee" },
            { icon: "rotate-ccw", title: "7-Day Easy Exchange", description: "Hassle-free size replacement" },
            { icon: "award", title: "Pure Full-Grain Leather", description: "Hand-inspected natural leather" },
          ],
        },
      },
      {
        id: "categories-1",
        type: "CategoryCarouselCenterEmphasis",
        props: {
          title: "Explore Shoe Collections",
          layout: "card",
          categories: [
            { title: "Oxford & Formals", count: "24 items", image: NICHE_PRESETS.shoes.images[0].url },
            { title: "Casual Loafers", count: "18 items", image: NICHE_PRESETS.shoes.images[2].url },
            { title: "Sneakers & Street", count: "32 items", image: NICHE_PRESETS.shoes.images[3].url },
            { title: "Peshawari Chappal", count: "12 items", image: NICHE_PRESETS.shoes.images[4].url },
          ],
        },
      },
      {
        id: "products-1",
        type: "ProductGridFeatured",
        props: {
          title: "Featured Masterpieces",
          subtitle: "Handcrafted 100% genuine calfskin leather footwear.",
          columns: 3,
          limit: 12,
        },
      },
      {
        id: "story-1",
        type: "BrandStory",
        props: {
          title: "The Legacy of Master Cobblers",
          paragraphs: [
            "Every pair of StepCraft shoes begins with hand-selected hides of top-tier full-grain leather. Our craftsmen spend over 36 hours stitching and shaping each silhouette.",
            "We reject synthetic shortcuts. Every detail is engineered to ensure timeless luxury.",
          ],
          imageUrl: NICHE_PRESETS.shoes.images[5].url,
        },
      },
      {
        id: "reviews-1",
        type: "TestimonialSlider",
        props: {
          title: "What Pakistani Gentlemen Say",
          layout: "carousel",
          testimonials: [
            { id: "1", name: "Hamza Tariq (Lahore)", text: "Ordered the Black Oxford for my brother's wedding. Leather quality is unmatched!", rating: 5, role: "Verified Buyer" },
            { id: "2", name: "Dr. Bilal Khan (Islamabad)", text: "COD was delivered in 2 days. Arch support is so comfortable.", rating: 5, role: "Verified Buyer" },
          ],
        },
      },
      {
        id: "newsletter-1",
        type: "NewsletterSignupProgressive",
        props: {
          title: "Join The StepCraft Inner Circle",
          subtitle: "Get exclusive access to private shoe drops and enjoy instant 10% OFF your first order.",
          buttonText: "Claim 10% Discount",
        },
      },
    ],
  });

  // Custom Products list
  const [productsList, setProductsList] = useState(NICHE_PRESETS.shoes.products);
  const [activeSectionId, setActiveSectionId] = useState<string | null>("navbar-header");
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"sections" | "props" | "catalog" | "colors" | "ai_chat">("props");

  // Click-to-edit Selector Mode
  const [isSelectorMode, setIsSelectorMode] = useState(true);

  // Modals
  const [showComponentCatalogModal, setShowComponentCatalogModal] = useState(false);
  const [showImagePickerFor, setShowImagePickerFor] = useState<string | null>(null);

  // Dedicated Product Add / Edit Modal
  const [productModal, setProductModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    index?: number;
    data: {
      id: string;
      name: string;
      price: string;
      originalPrice: string;
      discount: string;
      rating: number;
      image: string;
      tag: string;
      inStock: boolean;
    };
  } | null>(null);

  // Catalog Products Picker Modal (50 Curated Products)
  const [showCatalogPickerModal, setShowCatalogPickerModal] = useState(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
  const [catalogFilterCategory, setCatalogFilterCategory] = useState("all");
  const [skuInput, setSkuInput] = useState("");

  // AI Assistant Chat inside Editor
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ role: "ai" | "user"; text: string }>>([
    {
      role: "ai",
      text: "Salam! Main aapka DigiShop AI Studio Assistant hun. Aap bol kar store ka content, shoes/shirts ki prices, color schemes ya components tabdeel karwa sakte hain.",
    },
  ]);

  // AI Custom Image Generation
  const [aiImagePrompt, setAiImagePrompt] = useState("");
  const [isGeneratingAiImg, setIsGeneratingAiImg] = useState(false);

  const handleGenerateCustomAiImage = async () => {
    if (!aiImagePrompt.trim()) return;
    setIsGeneratingAiImg(true);
    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiImagePrompt,
          niche: activeNiche,
          aspect: activeSection?.props?.imageAspect || "portrait",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          handlePropChange("imageUrl", data.imageUrl);
          handlePropChange("heroImage", data.imageUrl);
          setShowImagePickerFor(null);
          setAiImagePrompt("");
        }
      }
    } catch (err) {
      console.error("AI Image Generation failed", err);
    } finally {
      setIsGeneratingAiImg(false);
    }
  };

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // -------------------------------------------------------------------------
  // File Upload Handler (PC / Local Drive)
  // -------------------------------------------------------------------------
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (targetField === "section") {
          handlePropChange("imageUrl", dataUrl);
          handlePropChange("heroImage", dataUrl);
        } else if (targetField === "product_modal") {
          if (productModal) {
            setProductModal({
              ...productModal,
              data: { ...productModal.data, image: dataUrl },
            });
          }
        } else if (targetField.startsWith("product_")) {
          const pIdx = parseInt(targetField.replace("product_", ""));
          const up = [...productsList];
          if (up[pIdx]) {
            up[pIdx].image = dataUrl;
            setProductsList(up);
          }
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------------------
  // Load Store on Mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    async function loadStore() {
      try {
        const res = await fetch("/api/stores");
        if (res.ok) {
          const { stores } = await res.json();
          const found = stores?.find(
            (s: any) =>
              s.slug?.toLowerCase() === slug ||
              s.subdomain?.toLowerCase() === slug ||
              s.id === slug
          );

          if (found && found.layout_config?.sections?.length > 0) {
            setLayoutConfig({
              ...found.layout_config,
              categories: found.layout_config.categories || [
                { name: "Oxford & Formals", href: "#catalog" },
                { name: "Casual Loafers", href: "#catalog" },
                { name: "Sneakers & Street", href: "#catalog" },
                { name: "Peshawari Chappal", href: "#catalog" },
              ],
            });
            setStoreName(found.name || found.layout_config.storeName || "My Store");
            setStoreId(found.id);
            if (found.niche) setActiveNiche(found.niche);
            if (found.layout_config.products && found.layout_config.products.length > 0) {
              setProductsList(found.layout_config.products);
            } else if (found.commerce_config?.products && found.commerce_config.products.length > 0) {
              setProductsList(found.commerce_config.products);
            }
            if (found.layout_config.sections?.[0]) {
              setActiveSectionId(found.layout_config.sections[0].id);
            }
            return;
          }
        }

        // Check localStorage fallback
        const local = localStorage.getItem("digishop_stores");
        if (local) {
          const parsed = JSON.parse(local);
          const foundLocal = parsed.find(
            (s: any) =>
              s.slug?.toLowerCase() === slug ||
              s.subdomain?.toLowerCase() === slug ||
              s.id === slug
          );
          if (foundLocal && foundLocal.layout_config?.sections?.length > 0) {
            setLayoutConfig({
              ...foundLocal.layout_config,
              categories: foundLocal.layout_config.categories || [
                { name: "Oxford & Formals", href: "#catalog" },
                { name: "Casual Loafers", href: "#catalog" },
                { name: "Sneakers & Street", href: "#catalog" },
                { name: "Peshawari Chappal", href: "#catalog" },
              ],
            });
            setStoreName(foundLocal.name);
            setStoreId(foundLocal.id);
            if (foundLocal.layout_config.products && foundLocal.layout_config.products.length > 0) {
              setProductsList(foundLocal.layout_config.products);
            }
            if (foundLocal.layout_config.sections?.[0]) {
              setActiveSectionId(foundLocal.layout_config.sections[0].id);
            }
          }
        }
      } catch (err) {
        console.warn("[Editor] Load fallback:", err);
      }
    }
    loadStore();
  }, [slug]);

  // -------------------------------------------------------------------------
  // Save Store Layout to Backend & LocalStorage (Persistent)
  // -------------------------------------------------------------------------
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const targetIdentifier = storeId || slug;
      const payloadLayout = {
        ...layoutConfig,
        storeName,
        categories: layoutConfig.categories || [
          { name: "Oxford & Formals", href: "#catalog" },
          { name: "Casual Loafers", href: "#catalog" },
          { name: "Sneakers & Street", href: "#catalog" },
          { name: "Peshawari Chappal", href: "#catalog" },
        ],
        products: productsList,
        sections: layoutConfig.sections.map((s) => {
          if (s.type === "ProductGridFeatured" || s.type.includes("ProductGrid")) {
            return {
              ...s,
              props: {
                ...s.props,
                products: productsList,
              },
            };
          }
          return s;
        }),
      };

      const res = await fetch(`/api/stores/${targetIdentifier}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: storeName,
          layout_config: payloadLayout,
          commerce_config: { products: productsList },
          is_published: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to save (Status ${res.status})`);
      }

      // If id was different from slug, also ensure slug is updated
      if (slug && targetIdentifier !== slug) {
        await fetch(`/api/stores/${slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: storeName,
            layout_config: payloadLayout,
            commerce_config: { products: productsList },
            is_published: true,
          }),
        }).catch(() => {});
      }

      // Sync to localStorage
      try {
        const local = JSON.parse(localStorage.getItem("digishop_stores") || "[]");
        const updated = local.map((s: any) =>
          s.slug === slug || s.id === storeId
            ? { ...s, layout_config: payloadLayout, name: storeName, commerce_config: { products: productsList } }
            : s
        );
        localStorage.setItem("digishop_stores", JSON.stringify(updated));
      } catch {}

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      console.error("Save failed", err);
      alert(`Save failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Switch Niche Industry (Shoes, Shirts/Apparel, Tech, Watches)
  // -------------------------------------------------------------------------
  const handleSwitchNiche = (nicheKey: string) => {
    const preset = NICHE_PRESETS[nicheKey];
    if (!preset) return;

    setActiveNiche(nicheKey);
    setProductsList(preset.products);
    setLayoutConfig((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: {
          ...prev.theme.colors,
          primary: preset.primaryColor,
          secondary: preset.accentColor,
        },
      },
      sections: prev.sections.map((s) => {
        if (s.type.startsWith("Hero")) {
          return {
            ...s,
            props: {
              ...s.props,
              title: `Handcrafted ${preset.name}`,
              subtitle: preset.tagline,
              imageUrl: preset.images[0]?.url || s.props.imageUrl,
            },
          };
        }
        if (s.type.includes("Category")) {
          return {
            ...s,
            props: {
              ...s.props,
              title: `Explore ${preset.name} Collections`,
              categories: preset.images.slice(0, 4).map((img, idx) => ({
                title: img.label,
                count: `${15 + idx * 5} items`,
                image: img.url,
              })),
            },
          };
        }
        return s;
      }),
    }));
  };

  // -------------------------------------------------------------------------
  // Handle Section Property Modification
  // -------------------------------------------------------------------------
  const handlePropChange = (key: string, value: any) => {
    if (!activeSectionId) return;
    setLayoutConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === activeSectionId ? { ...s, props: { ...s.props, [key]: value } } : s
      ),
    }));
  };

  // Reorder & Delete Section
  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layoutConfig.sections.length) return;

    const updated = [...layoutConfig.sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    setLayoutConfig((prev) => ({ ...prev, sections: updated }));
  };

  const deleteSection = (id: string) => {
    const updated = layoutConfig.sections.filter((s) => s.id !== id);
    setLayoutConfig((prev) => ({ ...prev, sections: updated }));
    if (activeSectionId === id && updated.length > 0) {
      setActiveSectionId(updated[0].id);
    }
  };

  const addComponentFromCatalog = (blueprint: VisualComponentBlueprint) => {
    const newId = `${blueprint.type.toLowerCase()}-${Date.now()}`;
    const newSection: Section = {
      id: newId,
      type: blueprint.type,
      props: { ...blueprint.defaultProps },
    };

    setLayoutConfig((prev) => ({ ...prev, sections: [...prev.sections, newSection] }));
    setActiveSectionId(newId);
    setSidebarTab("props");
    setShowComponentCatalogModal(false);
  };

  // Add Product by SKU or ID from the 50 Curated Catalog
  const handleAddProductBySkuOrId = (inputVal: string) => {
    if (!inputVal.trim()) return;
    const query = inputVal.trim().toLowerCase();
    const found = mockProducts.find(
      (p) =>
        p.id.toLowerCase() === query ||
        p.sku.toLowerCase() === query ||
        p.name.toLowerCase().includes(query)
    );
    if (found) {
      const alreadyInList = productsList.some((p) => p.id === found.id);
      if (!alreadyInList) {
        const converted = {
          id: found.id,
          name: found.name,
          price: `₨ ${found.price.toLocaleString()}`,
          originalPrice: found.compareAtPrice ? `₨ ${found.compareAtPrice.toLocaleString()}` : "",
          discount: found.badge || (found.compareAtPrice ? `${Math.round(((found.compareAtPrice - found.price) / found.compareAtPrice) * 100)}% OFF` : ""),
          rating: found.rating || 4.9,
          image: found.thumbnail,
          tag: found.category,
          inStock: true,
        };
        setProductsList([...productsList, converted]);
      }
      setSkuInput("");
    }
  };

  // Toggle Product Inclusion from the 50 Catalog Items
  const handleToggleProductFromCatalog = (catalogItem: any) => {
    const exists = productsList.some((p) => p.id === catalogItem.id);
    if (exists) {
      setProductsList(productsList.filter((p) => p.id !== catalogItem.id));
    } else {
      const converted = {
        id: catalogItem.id,
        name: catalogItem.name,
        price: `₨ ${catalogItem.price.toLocaleString()}`,
        originalPrice: catalogItem.compareAtPrice ? `₨ ${catalogItem.compareAtPrice.toLocaleString()}` : "",
        discount: catalogItem.badge || (catalogItem.compareAtPrice ? `${Math.round(((catalogItem.compareAtPrice - catalogItem.price) / catalogItem.compareAtPrice) * 100)}% OFF` : ""),
        rating: catalogItem.rating || 4.9,
        image: catalogItem.thumbnail,
        tag: catalogItem.category,
        inStock: true,
      };
      setProductsList([...productsList, converted]);
    }
  };

  // Open Product Modal (Add or Edit)
  const openAddProductModal = () => {
    setShowCatalogPickerModal(true);
  };

  const openEditProductModal = (product: any, index: number) => {
    setProductModal({
      isOpen: true,
      mode: "edit",
      index,
      data: { ...product },
    });
  };

  const handleSaveProductModal = () => {
    if (!productModal) return;
    if (productModal.mode === "add") {
      setProductsList([productModal.data, ...productsList]);
    } else if (productModal.mode === "edit" && productModal.index !== undefined) {
      const up = [...productsList];
      up[productModal.index] = productModal.data;
      setProductsList(up);
    }
    setProductModal(null);
  };

  // -------------------------------------------------------------------------
  // Handle AI Chat Commands (Urdu / English)
  // -------------------------------------------------------------------------
  const handleAiCommand = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setAiInput("");
    setIsAiLoading(true);

    try {
      const lower = userMsg.toLowerCase();
      let reply = "Aapki request ke mutabiq store update kar diya gaya hai!";

      if (lower.includes("shirt") || lower.includes("cloth") || lower.includes("kapre")) {
        handleSwitchNiche("clothing");
        reply = "Store ko Shirts & Clothing Fashion collection me convert kar diya hai!";
      } else if (lower.includes("shoe") || lower.includes("joot")) {
        handleSwitchNiche("shoes");
        reply = "Store ko Luxury Shoes & Footwear collection me convert kar diya hai!";
      } else if (lower.includes("gold") || lower.includes("black") || lower.includes("dark")) {
        setLayoutConfig((prev) => ({
          ...prev,
          theme: {
            ...prev.theme,
            colors: { primary: "#171717", secondary: "#D4AF37", background: "#0A0A0A", text: "#FFFFFF" },
          },
        }));
        reply = "Theme ko Royal Black & Gold aesthetic me change kar diya hai!";
      } else if (lower.includes("hero") && (lower.includes("title") || lower.includes("heading"))) {
        const cleanTitle = userMsg.replace(/(change|hero|title|heading|to|kardo|krdo|kr dye|badlo|kar do)/gi, "").trim() || "Handcrafted Pure Leather Footwear";
        setLayoutConfig((prev) => ({
          ...prev,
          sections: prev.sections.map((s) => (s.type.startsWith("Hero") ? { ...s, props: { ...s.props, title: cleanTitle } } : s)),
        }));
        reply = `Hero title update karke "${cleanTitle}" kar diya gaya hai!`;
      } else if (lower.includes("discount") || lower.includes("offer") || lower.includes("banner")) {
        const newBanner: Section = {
          id: `promo-${Date.now()}`,
          type: "PromoBanner",
          props: { text: "🎉 Mega Sale: Flat 20% OFF on all items across Pakistan! Free Delivery over ₨ 5,000.", layout: "ribbon" },
        };
        setLayoutConfig((prev) => ({ ...prev, sections: [newBanner, ...prev.sections.filter((s) => s.type !== "PromoBanner")] }));
        reply = "Top promo banner with 20% discount offer add kar diya gaya hai!";
      } else {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeId: storeId || slug, message: userMsg }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.updatedLayout) setLayoutConfig(data.updatedLayout);
          reply = "AI ne layout update kar diya hai!";
        }
      }

      setAiChatMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch {
      setAiChatMessages((prev) => [...prev, { role: "ai", text: "Store update ho gaya hai!" }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const activeSection = layoutConfig.sections.find((s) => s.id === activeSectionId) || null;
  const currentNichePreset = NICHE_PRESETS[activeNiche] || NICHE_PRESETS.shoes;

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 text-slate-800 font-sans select-none overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER TOOLBAR                                                     */}
      {/* ========================================================================= */}
      <div className="h-14 border-b border-default bg-card shadow-2xs px-4 sm:px-5 flex items-center justify-between flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/my-stores"
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-subtle hover:text-heading border border-default transition-all"
            title="Back to My Stores"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold text-heading truncate max-w-xs">{storeName}</h1>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-mono">
                /{slug}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Visual Layout &amp; AI Studio</p>
          </div>
        </div>

        {/* Viewport Toggles & Actions */}
        <div className="flex items-center gap-2">
          {/* Device Switcher */}
          <div className="hidden sm:flex items-center bg-neutral-100 border border-default rounded-xl p-0.5">
            <button
              onClick={() => setIsMobilePreview(false)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${!isMobilePreview ? "bg-card text-heading shadow-xs font-bold" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
            <button
              onClick={() => setIsMobilePreview(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${isMobilePreview ? "bg-card text-heading shadow-xs font-bold" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
          </div>

          {/* Click-to-Edit Pen Selector Toggle */}
          <button
            onClick={() => setIsSelectorMode(!isSelectorMode)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              isSelectorMode
                ? "bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400 font-extrabold"
                : "bg-neutral-100 hover:bg-neutral-200 text-heading border border-default"
            }`}
            title="Click any section in the preview to select and edit its content in the sidebar"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{isSelectorMode ? "✏️ Selector Active" : "Enable Selector"}</span>
          </button>

          {/* Live Preview Direct Button */}
          <a
            href={`/preview/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-default text-heading font-bold text-xs transition-all flex items-center gap-1.5"
            title="Open Full Live Storefront in New Tab"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">View Live Store</span>
          </a>

          {/* AI Chat Tab Trigger */}
          <button
            onClick={() => setSidebarTab(sidebarTab === "ai_chat" ? "props" : "ai_chat")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${sidebarTab === "ai_chat" ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg" : "bg-neutral-100 hover:bg-neutral-200 text-heading border border-default"}`}
          >
            <Wand2 className="w-3.5 h-3.5 text-violet-400" />
            <span>AI Assistant</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>Saved Live!</span>
              </>
            ) : isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-slate-950" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SPLIT WORKSPACE                                                   */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Left Side: Controller Sidebar (360px) */}
        <div className="w-80 md:w-96 border-r border-default bg-card flex flex-col flex-shrink-0 z-20 shadow-xs">
          {/* Sidebar Tabs */}
          <div className="grid grid-cols-4 p-1.5 bg-neutral-100 border-b border-default text-[11px] font-bold">
            <button
              onClick={() => setSidebarTab("sections")}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${sidebarTab === "sections" ? "bg-card text-heading shadow-xs font-extrabold" : "text-subtle hover:text-heading"}`}
            >
              <Layers className="w-3 h-3 text-emerald-400" /> Sections
            </button>
            <button
              onClick={() => setSidebarTab("props")}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${sidebarTab === "props" ? "bg-card text-heading shadow-xs font-extrabold" : "text-subtle hover:text-heading"}`}
            >
              <Settings className="w-3 h-3 text-emerald-400" /> Props
            </button>
            <button
              onClick={() => setSidebarTab("catalog")}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${sidebarTab === "catalog" ? "bg-card text-heading shadow-xs font-extrabold" : "text-subtle hover:text-heading"}`}
            >
              <ShoppingBag className="w-3 h-3 text-emerald-400" /> Catalog
            </button>
            <button
              onClick={() => setSidebarTab("colors")}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${sidebarTab === "colors" ? "bg-card text-heading shadow-xs font-extrabold" : "text-subtle hover:text-heading"}`}
            >
              <Palette className="w-3 h-3 text-emerald-400" /> Colors
            </button>
          </div>

          {/* TAB 1: SECTIONS LIST & VISUAL ADD */}
          {sidebarTab === "sections" && (
            <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Page Sections ({layoutConfig.sections.length + 1})
                </span>

                <button
                  onClick={() => setShowComponentCatalogModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Component</span>
                </button>
              </div>

              {/* Sections List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {/* Header item in list */}
                <div
                  onClick={() => {
                    setActiveSectionId("navbar-header");
                    setSidebarTab("props");
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    activeSectionId === "navbar-header"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-400"
                      : "bg-neutral-50/90 border-default text-subtle hover:border-neutral-300 hover:bg-neutral-100 hover:text-heading shadow-2xs"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-heading truncate">{storeName}</p>
                    <p className="text-[10px] text-emerald-400 font-mono truncate">Header &amp; Navigation</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">Header</span>
                </div>

                {layoutConfig.sections.map((sect, idx) => {
                  const isActive = activeSectionId === sect.id;
                  return (
                    <div
                      key={sect.id}
                      onClick={() => {
                        setActiveSectionId(sect.id);
                        setSidebarTab("props");
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${isActive ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-400" : "bg-neutral-50/90 border-default text-subtle hover:border-neutral-300 hover:bg-neutral-100 hover:text-heading shadow-2xs"}`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-heading truncate">{sect.props?.title || sect.props?.headline || sect.type}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{sect.type}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveSection(idx, "up"); }}
                          disabled={idx === 0}
                          className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20"
                          title="Move Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveSection(idx, "down"); }}
                          disabled={idx === layoutConfig.sections.length - 1}
                          className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20"
                          title="Move Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSection(sect.id); }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400"
                          title="Delete Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: RICH PROPS FORM (INCLUDING COMPLETE NAVBAR & SECTION CONTROLS) */}
          {sidebarTab === "props" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* If Navbar Header is Active */}
              {activeSectionId === "navbar-header" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Active Element</span>
                      <h3 className="text-sm font-bold text-heading">Header &amp; Navigation Bar</h3>
                    </div>
                    <button
                      onClick={() => setSidebarTab("sections")}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      ← Sections
                    </button>
                  </div>

                  {/* Store Name / Brand Logo Text */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Store Brand Name (Logo Text)</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. StepCraft Luxury Footwear"
                    />
                  </div>

                  {/* Navigation Links Manager */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-400 font-bold">Navbar Links ({layoutConfig.categories?.length || 0})</label>
                      <button
                        onClick={() => {
                          const current = layoutConfig.categories || [];
                          setLayoutConfig({
                            ...layoutConfig,
                            categories: [...current, { name: "New Category", href: "#catalog" }],
                          });
                        }}
                        className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Link
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {(layoutConfig.categories || []).map((link, lIdx) => (
                        <div key={lIdx} className="p-2.5 rounded-lg bg-neutral-50 border border-default shadow-2xs space-y-1.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={link.name}
                              onChange={(e) => {
                                const updated = [...(layoutConfig.categories || [])];
                                updated[lIdx].name = e.target.value;
                                setLayoutConfig({ ...layoutConfig, categories: updated });
                              }}
                              className="flex-1 bg-card p-1.5 rounded text-heading text-xs font-bold border border-slate-800 focus:border-emerald-500"
                              placeholder="Link Title (e.g. Oxford)"
                            />
                            <button
                              onClick={() => {
                                const updated = (layoutConfig.categories || []).filter((_, i) => i !== lIdx);
                                setLayoutConfig({ ...layoutConfig, categories: updated });
                              }}
                              className="p-1 rounded text-slate-500 hover:text-rose-400"
                              title="Delete Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : activeSection ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Active Section</span>
                      <h3 className="text-sm font-bold text-heading">{activeSection.type}</h3>
                    </div>
                    <button
                      onClick={() => setSidebarTab("sections")}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      ← Sections
                    </button>
                  </div>

                  {/* Heading Title */}
                  {/* Badge / Tag (For Custom Components and Heroes) */}
                  {activeSection.props.badge !== undefined && (
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold block">Badge / Tag Text</label>
                      <input
                        type="text"
                        value={activeSection.props.badge || ""}
                        onChange={(e) => handlePropChange("badge", e.target.value)}
                        placeholder="e.g. ✨ NEW DROP or 🔥 EXCLUSIVE"
                        className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* Heading Title */}
                  {(activeSection.props.title !== undefined || activeSection.props.headline !== undefined) && (
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold block">Heading Text</label>
                      <input
                        type="text"
                        value={activeSection.props.title || activeSection.props.headline || ""}
                        onChange={(e) => {
                          if (activeSection.props.headline !== undefined) handlePropChange("headline", e.target.value);
                          else handlePropChange("title", e.target.value);
                        }}
                        className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-emerald-500 font-bold"
                      />
                    </div>
                  )}

                  {/* Subtitle / Description */}
                  {(activeSection.props.subtitle !== undefined || activeSection.props.subline !== undefined) && (
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold block">Subtitle / Description</label>
                      <textarea
                        rows={2}
                        value={activeSection.props.subtitle || activeSection.props.subline || ""}
                        onChange={(e) => {
                          if (activeSection.props.subline !== undefined) handlePropChange("subline", e.target.value);
                          else handlePropChange("subtitle", e.target.value);
                        }}
                        className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                      />
                    </div>
                  )}

                  {/* Banner Message Text */}
                  {activeSection.props.text !== undefined && (
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold block">Banner Message / Text</label>
                      <input
                        type="text"
                        value={activeSection.props.text}
                        onChange={(e) => handlePropChange("text", e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* Action Buttons & Links */}
                  {(activeSection.props.ctaText !== undefined || activeSection.props.primaryCtaText !== undefined || activeSection.props.secondaryCtaText !== undefined) && (
                    <div className="p-3.5 rounded-2xl bg-neutral-50 border border-default shadow-2xs space-y-2.5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Action Buttons &amp; URLs</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-semibold block">Primary Button Text</label>
                          <input
                            type="text"
                            value={activeSection.props.ctaText || activeSection.props.primaryCtaText || ""}
                            onChange={(e) => {
                              if (activeSection.props.primaryCtaText !== undefined) handlePropChange("primaryCtaText", e.target.value);
                              else handlePropChange("ctaText", e.target.value);
                            }}
                            className="w-full p-2 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-semibold block">Primary Target URL</label>
                          <input
                            type="text"
                            value={activeSection.props.ctaLink || activeSection.props.primaryCtaLink || "/shop"}
                            onChange={(e) => {
                              if (activeSection.props.primaryCtaLink !== undefined) handlePropChange("primaryCtaLink", e.target.value);
                              else handlePropChange("ctaLink", e.target.value);
                            }}
                            className="w-full p-2 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                      </div>

                      {(activeSection.props.secondaryCtaText !== undefined || activeSection.type === "CustomComponent") && (
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-semibold block">Secondary Button Text</label>
                            <input
                              type="text"
                              value={activeSection.props.secondaryCtaText || ""}
                              onChange={(e) => handlePropChange("secondaryCtaText", e.target.value)}
                              placeholder="e.g. View Catalog"
                              className="w-full p-2 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-semibold block">Secondary URL</label>
                            <input
                              type="text"
                              value={activeSection.props.secondaryCtaLink || "#story"}
                              onChange={(e) => handlePropChange("secondaryCtaLink", e.target.value)}
                              placeholder="e.g. #story"
                              className="w-full p-2 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-emerald-500 font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Background & Button Styling (For Custom Components) */}
                  {(activeSection.props.bgTheme !== undefined || activeSection.type === "CustomComponent") && (
                    <div className="p-3.5 rounded-2xl bg-neutral-50 border border-default shadow-2xs space-y-2.5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Layout &amp; Color Theme</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-semibold block">Background Theme</label>
                          <select
                            value={activeSection.props.bgTheme || "slate"}
                            onChange={(e) => handlePropChange("bgTheme", e.target.value)}
                            className="w-full p-2 rounded-lg bg-card border border-default text-heading text-xs focus:border-emerald-500"
                          >
                            <option value="slate">Dark Slate</option>
                            <option value="gold">Royal Gold</option>
                            <option value="glass">Glassmorphism</option>
                            <option value="black">Pure Black</option>
                            <option value="minimal">Dashed Minimal</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-semibold block">Button Theme</label>
                          <select
                            value={activeSection.props.buttonTheme || "emerald"}
                            onChange={(e) => handlePropChange("buttonTheme", e.target.value)}
                            className="w-full p-2 rounded-lg bg-card border border-default text-heading text-xs focus:border-emerald-500"
                          >
                            <option value="emerald">Emerald Glow</option>
                            <option value="gold">Royal Gold</option>
                            <option value="white">Monochrome White</option>
                            <option value="outline">Outline Ghost</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image URL + AI Suggestions + PC Upload */}
                  {(activeSection.props.imageUrl !== undefined || activeSection.props.heroImage !== undefined) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-400 font-bold">Image URL</label>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setShowImagePickerFor(activeSection.id)}
                            className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" /> AI Photos
                          </button>
                          <label className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-[10px] font-bold flex items-center gap-1 cursor-pointer">
                            <Upload className="w-3 h-3" /> Upload PC
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, "section")}
                            />
                          </label>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={activeSection.props.imageUrl || activeSection.props.heroImage || ""}
                        onChange={(e) => {
                          if (activeSection.props.heroImage !== undefined) handlePropChange("heroImage", e.target.value);
                          else handlePropChange("imageUrl", e.target.value);
                        }}
                        className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      {(activeSection.props.imageUrl || activeSection.props.heroImage) && (
                        <div className="space-y-2">
                          <div className="h-32 rounded-xl overflow-hidden border border-slate-800 relative bg-slate-950">
                            <img
                              src={activeSection.props.imageUrl || activeSection.props.heroImage}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Image Sizing & Alignment Controls */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 font-bold block">Image Size / Ratio</label>
                              <select
                                value={activeSection.props.imageAspect || "portrait"}
                                onChange={(e) => handlePropChange("imageAspect", e.target.value)}
                                className="w-full p-1.5 rounded-lg bg-card border border-default text-heading text-[11px] font-semibold focus:border-emerald-500"
                              >
                                <option value="portrait">Portrait (4:5 Standard)</option>
                                <option value="square">Square (1:1)</option>
                                <option value="landscape">Landscape (16:9)</option>
                                <option value="tall">Tall Display (3:4)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 font-bold block">Image Position</label>
                              <select
                                value={activeSection.props.imagePosition || activeSection.props.imageAlignment || "right"}
                                onChange={(e) => {
                                  handlePropChange("imagePosition", e.target.value);
                                  handlePropChange("imageAlignment", e.target.value);
                                }}
                                className="w-full p-1.5 rounded-lg bg-card border border-default text-heading text-[11px] font-semibold focus:border-emerald-500"
                              >
                                <option value="right">Right Side</option>
                                <option value="left">Left Side</option>
                                <option value="center">Centered Hero</option>
                                <option value="background">Photo Background Overlay</option>
                                <option value="none">No Image (Text Only)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SPECIAL SECTION: PRODUCT GRID PROPS (50 CATALOG DATABASE ENGINE) */}
                  {(activeSection.type === "ProductGridFeatured" || activeSection.type.includes("ProductGrid")) && (
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white text-xs block">Section Products ({productsList.length})</span>
                          <span className="text-[10px] text-slate-400">Linked to 50 Curated Database Products</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCatalogPickerModal(true)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] flex items-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Pick from Catalog</span>
                        </button>
                      </div>

                      {/* Quick Collection Populator */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold block">Quick Fill by Category:</label>
                        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                          {[
                            { label: "All (50)", cat: "all" },
                            { label: "Footwear", cat: "Footwear" },
                            { label: "Leather", cat: "Leather Goods" },
                            { label: "Apparel", cat: "Apparel" },
                            { label: "Accessories", cat: "Accessories" },
                            { label: "Home Decor", cat: "Home Decor" },
                          ].map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => {
                                const filtered = item.cat === "all"
                                  ? mockProducts
                                  : mockProducts.filter((p) => p.category === item.cat);
                                const converted = filtered.map((found) => ({
                                  id: found.id,
                                  name: found.name,
                                  price: `₨ ${found.price.toLocaleString()}`,
                                  originalPrice: found.compareAtPrice ? `₨ ${found.compareAtPrice.toLocaleString()}` : "",
                                  discount: found.badge || (found.compareAtPrice ? `${Math.round(((found.compareAtPrice - found.price) / found.compareAtPrice) * 100)}% OFF` : ""),
                                  rating: found.rating || 4.9,
                                  image: found.thumbnail,
                                  tag: found.category,
                                  inStock: true,
                                }));
                                setProductsList(converted);
                              }}
                              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-slate-300 text-center font-bold transition-colors cursor-pointer"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Add by SKU or ID Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold block">Add by Product ID / SKU:</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={skuInput}
                            onChange={(e) => setSkuInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddProductBySkuOrId(skuInput);
                              }
                            }}
                            placeholder="e.g. prod_0001 or SKU-SHOE-0001"
                            className="flex-1 p-2 rounded-xl bg-card border border-default text-heading text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddProductBySkuOrId(skuInput)}
                            className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer active:scale-95 transition-all"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Selected Product items list */}
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {productsList.map((prod, pIdx) => (
                          <div key={prod.id} className="p-2.5 rounded-xl bg-neutral-50 border border-default shadow-2xs flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover border border-slate-800 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-bold text-white text-xs truncate">{prod.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-emerald-400 font-bold text-[11px]">{prod.price}</span>
                                  {prod.discount && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 text-[9px] font-bold">
                                      {prod.discount}
                                    </span>
                                  )}
                                  {prod.id && (
                                    <span className="text-slate-500 font-mono text-[9px]">({prod.id})</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setProductsList(productsList.filter((_, i) => i !== pIdx))}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Remove from this section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SPECIAL SECTION: CATEGORY CAROUSEL PROPS (FULL IMAGE & CARD CONTROLS) */}
                  {activeSection.type.includes("Category") && activeSection.props.categories && (
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white text-xs block">Category Cards ({activeSection.props.categories.length})</span>
                          <span className="text-[10px] text-slate-400">Edit titles, photos, and item counts</span>
                        </div>
                        <button
                          onClick={() => {
                            const current = activeSection.props.categories || [];
                            const newCat = {
                              title: `New Collection`,
                              count: `12 items`,
                              image: currentNichePreset.images[0]?.url || "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600",
                              href: "#catalog",
                            };
                            handlePropChange("categories", [...current, newCat]);
                          }}
                          className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow"
                        >
                          <Plus className="w-3 h-3" /> Add Category
                        </button>
                      </div>

                      {/* Card Shape Selector */}
                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold block text-[10px]">Card Shape / Style</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handlePropChange("itemShape", "card")}
                            className={`p-2 rounded-lg border text-center font-bold text-[11px] transition-all ${
                              (activeSection.props.itemShape || "card") === "card"
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            Rounded Card
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePropChange("itemShape", "circle")}
                            className={`p-2 rounded-lg border text-center font-bold text-[11px] transition-all ${
                              activeSection.props.itemShape === "circle"
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            Circular Avatar
                          </button>
                        </div>
                      </div>

                      {/* Category Items List */}
                      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                        {activeSection.props.categories.map((cat: any, cIdx: number) => (
                          <div key={cIdx} className="p-3.5 rounded-xl bg-neutral-50 border border-default shadow-2xs space-y-2">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={cat.image || cat.imageUrl || "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600"}
                                alt={cat.title || cat.name}
                                className="w-12 h-12 rounded-lg object-cover border border-slate-800 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0 space-y-1">
                                <input
                                  type="text"
                                  value={cat.title || cat.name || ""}
                                  onChange={(e) => {
                                    const up = [...activeSection.props.categories];
                                    up[cIdx].title = e.target.value;
                                    up[cIdx].name = e.target.value;
                                    handlePropChange("categories", up);
                                  }}
                                  className="w-full bg-card p-1.5 rounded text-heading text-xs font-bold border border-slate-800 focus:border-emerald-500"
                                  placeholder="Category Name"
                                />
                                <input
                                  type="text"
                                  value={cat.count || ""}
                                  onChange={(e) => {
                                    const up = [...activeSection.props.categories];
                                    up[cIdx].count = e.target.value;
                                    handlePropChange("categories", up);
                                  }}
                                  className="w-full bg-slate-950 p-1 rounded text-slate-400 text-[10px] border border-slate-800"
                                  placeholder="Item count (e.g. 24 items)"
                                />
                              </div>

                              <button
                                onClick={() => {
                                  const up = activeSection.props.categories.filter((_: any, i: number) => i !== cIdx);
                                  handlePropChange("categories", up);
                                }}
                                className="p-1 rounded text-slate-500 hover:text-rose-400"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Category Image Upload & URL */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                              <label className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-bold cursor-pointer text-[10px]">
                                <Upload className="w-3 h-3" /> Upload PC Photo
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const dataUrl = event.target?.result as string;
                                      if (dataUrl) {
                                        const up = [...activeSection.props.categories];
                                        up[cIdx].image = dataUrl;
                                        up[cIdx].imageUrl = dataUrl;
                                        handlePropChange("categories", up);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>

                              <button
                                onClick={() => {
                                  const nextImg = currentNichePreset.images[(cIdx + 1) % currentNichePreset.images.length]?.url;
                                  if (nextImg) {
                                    const up = [...activeSection.props.categories];
                                    up[cIdx].image = nextImg;
                                    up[cIdx].imageUrl = nextImg;
                                    handlePropChange("categories", up);
                                  }
                                }}
                                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold text-[10px]"
                              >
                                <Sparkles className="w-3 h-3" /> AI Suggest Photo
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-10">Select a section or header to edit properties.</p>
              )}
            </div>
          )}

          {/* TAB 3: FULL PRODUCT CATALOG MANAGER */}
          {sidebarTab === "catalog" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <span className="font-bold text-white text-xs block">Store Products Catalog</span>
                  <span className="text-[10px] text-slate-400">{productsList.length} total products</span>
                </div>
                <button
                  onClick={openAddProductModal}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-[11px] flex items-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Product
                </button>
              </div>

              <div className="space-y-3">
                {productsList.map((prod, pIdx) => (
                  <div key={prod.id} className="p-3.5 rounded-xl bg-neutral-50 border border-default shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-3">
                      <img src={prod.image} alt={prod.name} className="w-12 h-12 rounded-lg object-cover border border-slate-800 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-xs truncate">{prod.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-emerald-400 font-bold text-[11px]">{prod.price}</span>
                          {prod.discount && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                              {prod.discount}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditProductModal(prod, pIdx)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Edit in Modal"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => setProductsList(productsList.filter((_, i) => i !== pIdx))}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <label className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-bold cursor-pointer">
                        <Upload className="w-3 h-3" /> Upload PC Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, `product_${pIdx}`)}
                        />
                      </label>
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <ShoppingBag className="w-3 h-3" /> Quick Cart
                      </span>
                      <span className="flex items-center gap-1 text-rose-400 font-bold">
                        <Heart className="w-3 h-3 fill-rose-500" /> Wishlist
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: THEME COLORS & TYPOGRAPHY STYLING SUITE */}
          {sidebarTab === "colors" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-heading">Typography &amp; Theme Styling</h3>
                <p className="text-[10px] text-slate-400">Change fonts, text colors, background colors, and palettes</p>
              </div>

              {/* 1. Quick 1-Click Luxury Theme Palettes */}
              <div className="space-y-2">
                <label className="text-slate-400 font-bold block">1-Click Luxury Theme Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "Royal Black & Gold", primary: "#171717", secondary: "#D4AF37", bg: "#FFFFFF", text: "#0A0A0A" },
                    { name: "Emerald & Gold", primary: "#064E3B", secondary: "#F59E0B", bg: "#FFFFFF", text: "#0F172A" },
                    { name: "Midnight Navy & Sky", primary: "#0F172A", secondary: "#0284C7", bg: "#FFFFFF", text: "#0F172A" },
                    { name: "Imperial Dark Mode", primary: "#171717", secondary: "#D4AF37", bg: "#0A0A0A", text: "#FFFFFF" },
                    { name: "Warm Cream & Leather", primary: "#451A03", secondary: "#D97706", bg: "#FAF7F2", text: "#291809" },
                    { name: "Minimalist Slate", primary: "#334155", secondary: "#3B82F6", bg: "#FFFFFF", text: "#1E293B" },
                  ].map((p, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() =>
                        setLayoutConfig((prev) => ({
                          ...prev,
                          theme: {
                            ...prev.theme,
                            colors: {
                              primary: p.primary,
                              secondary: p.secondary,
                              background: p.bg,
                              text: p.text,
                            },
                          },
                        }))
                      }
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 text-left space-y-1.5 transition-all"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: p.primary }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: p.secondary }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: p.bg }} />
                      </div>
                      <span className="text-[10px] font-bold text-white block truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Typography Font Families */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Heading Font Family</label>
                  <select
                    value={layoutConfig.theme.typography.heading}
                    onChange={(e) =>
                      setLayoutConfig((prev) => ({
                        ...prev,
                        theme: {
                          ...prev.theme,
                          typography: { ...prev.theme.typography, heading: e.target.value },
                        },
                      }))
                    }
                    className="w-full p-2.5 rounded-lg bg-neutral-50 border border-default shadow-2xs text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Playfair Display">🏛️ Playfair Display (Luxury &amp; Heritage)</option>
                    <option value="Plus Jakarta Sans">⚡ Plus Jakarta Sans (Modern &amp; Clean)</option>
                    <option value="Cinzel">👑 Cinzel (Royal Regal)</option>
                    <option value="Inter">💼 Inter (Crisp Minimal)</option>
                    <option value="Poppins">🌟 Poppins (Geometric Bold)</option>
                    <option value="Outfit">✨ Outfit (Urban Fashion)</option>
                    <option value="Montserrat">🎯 Montserrat (Editorial Classic)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Body Text Font</label>
                  <select
                    value={layoutConfig.theme.typography.body}
                    onChange={(e) =>
                      setLayoutConfig((prev) => ({
                        ...prev,
                        theme: {
                          ...prev.theme,
                          typography: { ...prev.theme.typography, body: e.target.value },
                        },
                      }))
                    }
                    className="w-full p-2.5 rounded-lg bg-neutral-50 border border-default shadow-2xs text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Inter">Inter (Ultra Legible)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                  </select>
                </div>
              </div>

              {/* 3. Detailed Color Pickers */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Primary Brand Color (Buttons &amp; Accents)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={layoutConfig.theme.colors.primary}
                      onChange={(e) =>
                        setLayoutConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, colors: { ...prev.theme.colors, primary: e.target.value } },
                        }))
                      }
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={layoutConfig.theme.colors.primary}
                      onChange={(e) =>
                        setLayoutConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, colors: { ...prev.theme.colors, primary: e.target.value } },
                        }))
                      }
                      className="flex-1 p-2 rounded-lg bg-card border border-default text-heading font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Accent Color (Gold &amp; Badges)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={layoutConfig.theme.colors.secondary}
                      onChange={(e) =>
                        setLayoutConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, colors: { ...prev.theme.colors, secondary: e.target.value } },
                        }))
                      }
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={layoutConfig.theme.colors.secondary}
                      onChange={(e) =>
                        setLayoutConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, colors: { ...prev.theme.colors, secondary: e.target.value } },
                        }))
                      }
                      className="flex-1 p-2 rounded-lg bg-card border border-default text-heading font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Store Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={layoutConfig.theme.colors.background}
                      onChange={(e) =>
                        setLayoutConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, colors: { ...prev.theme.colors, background: e.target.value } },
                        }))
                      }
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={layoutConfig.theme.colors.background}
                      onChange={(e) =>
                        setLayoutConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, colors: { ...prev.theme.colors, background: e.target.value } },
                        }))
                      }
                      className="flex-1 p-2 rounded-lg bg-card border border-default text-heading font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Text &amp; Heading Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={layoutConfig.theme.colors.text}
                      onChange={(e) =>
                        setLayoutConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, colors: { ...prev.theme.colors, text: e.target.value } },
                        }))
                      }
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={layoutConfig.theme.colors.text}
                      onChange={(e) =>
                        setLayoutConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, colors: { ...prev.theme.colors, text: e.target.value } },
                        }))
                      }
                      className="flex-1 p-2 rounded-lg bg-card border border-default text-heading font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI CHAT ASSISTANT */}
          {sidebarTab === "ai_chat" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
              <div className="p-3 bg-gradient-to-r from-violet-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-violet-400 animate-pulse" />
                  <span className="text-xs font-bold text-heading">AI Store Assistant</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[9px] font-bold">Live AI</span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                {aiChatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl max-w-[88%] leading-relaxed ${msg.role === "user" ? "ml-auto bg-violet-600 text-white rounded-br-none" : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"}`}
                  >
                    {msg.text}
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-neutral-50 border border-default shadow-2xs text-violet-400 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> AI updating layout...
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-slate-800 bg-slate-900">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAiCommand();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="E.g. Shirts collection bana do, colors black & gold..."
                    className="flex-1 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="submit"
                    disabled={!aiInput.trim() || isAiLoading}
                    className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. RIGHT MAIN VIEWPORT (LIVE STORE RENDER)                                */}
        {/* ========================================================================= */}
        <div className="flex-1 bg-slate-200/70 overflow-y-auto flex items-start justify-center p-4 sm:p-6">
          <div
            className={`transition-all duration-300 w-full ${
              isMobilePreview
                ? "max-w-[385px] border-[8px] border-slate-800 rounded-[36px] shadow-2xl overflow-hidden my-4 bg-white"
                : "max-w-6xl rounded-2xl shadow-2xl overflow-hidden bg-white"
            }`}
          >
            {/* Live Storefront Component Renderer */}
            <StorefrontRenderer
              config={{
                ...layoutConfig,
                storeName,
                categories: layoutConfig.categories || [
                  { name: "Oxford & Formals", href: "#catalog" },
                  { name: "Casual Loafers", href: "#catalog" },
                  { name: "Sneakers & Street", href: "#catalog" },
                  { name: "Peshawari Chappal", href: "#catalog" },
                ],
                socialLinks: [
                  { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
                  { name: "WhatsApp Store", href: "https://wa.me/923001234567", icon: "whatsapp" },
                ],
              } as any}
              products={productsList as any}
              categories={
                layoutConfig.sections.find((s) => s.type.includes("Category"))?.props?.categories || []
              }
              isEditorMode={isSelectorMode}
              activeSectionId={activeSectionId}
              onSelectSection={(secId) => {
                setActiveSectionId(secId);
                setSidebarTab("props");
              }}
              onMoveSection={(secId, dir) => {
                const idx = layoutConfig.sections.findIndex((s) => s.id === secId);
                if (idx !== -1) moveSection(idx, dir);
              }}
              onDeleteSection={(secId) => {
                deleteSection(secId);
              }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 4. 50 CURATED CATALOG PRODUCTS PICKER MODAL                               */}
      {/* ========================================================================= */}
      {showCatalogPickerModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl text-white max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <span>Pick Products from Catalog ({mockProducts.length} Total)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select which products to display in this storefront section.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCatalogPickerModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Filter Bar: Category Tabs + Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
                {[
                  { id: "all", label: "All (50)" },
                  { id: "Footwear", label: "Footwear" },
                  { id: "Leather Goods", label: "Leather" },
                  { id: "Apparel", label: "Apparel" },
                  { id: "Accessories", label: "Accessories" },
                  { id: "Home Decor", label: "Home" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCatalogFilterCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex-shrink-0 ${
                      catalogFilterCategory === tab.id
                        ? "bg-emerald-500 text-slate-950 shadow-md"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="flex-1 w-full relative">
                <input
                  type="text"
                  value={catalogSearchQuery}
                  onChange={(e) => setCatalogSearchQuery(e.target.value)}
                  placeholder="Search products by title, SKU, or tag..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quick Actions Counter */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-bold text-emerald-400">
                {productsList.length} products currently active in this section
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allConverted = mockProducts.map((p) => ({
                      id: p.id,
                      name: p.name,
                      price: `₨ ${p.price.toLocaleString()}`,
                      originalPrice: p.compareAtPrice ? `₨ ${p.compareAtPrice.toLocaleString()}` : "",
                      discount: p.badge || (p.compareAtPrice ? `${Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)}% OFF` : ""),
                      rating: p.rating || 4.9,
                      image: p.thumbnail,
                      tag: p.category,
                      inStock: true,
                    }));
                    setProductsList(allConverted);
                  }}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-bold cursor-pointer"
                >
                  Select All 50
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setProductsList([])}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                >
                  Clear Section
                </button>
              </div>
            </div>

            {/* Catalog 50 Items Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-1 max-h-[55vh]">
              {mockProducts
                .filter((p) => {
                  const matchCat =
                    catalogFilterCategory === "all" || p.category === catalogFilterCategory;
                  const matchQuery =
                    !catalogSearchQuery.trim() ||
                    p.name.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
                    p.sku.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
                    p.category.toLowerCase().includes(catalogSearchQuery.toLowerCase());
                  return matchCat && matchQuery;
                })
                .map((item) => {
                  const isSelected = productsList.some((p) => p.id === item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleProductFromCatalog(item)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                        isSelected
                          ? "bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/50"
                          : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
                        <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-emerald-600/60 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {item.category}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 ml-auto">
                            {item.sku}
                          </span>
                        </div>
                        <p className="font-bold text-white text-xs truncate mt-0.5">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-emerald-400 font-extrabold text-xs">
                            ₨ {item.price.toLocaleString()}
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 text-[9px] font-bold">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Changes take effect in visual canvas immediately.
              </span>
              <button
                type="button"
                onClick={() => setShowCatalogPickerModal(false)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                Apply Selection ({productsList.length} Items)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. VISUAL COMPONENT CATALOG MODAL WITH DIAGRAMS & WIREFRAMES              */}
      {/* ========================================================================= */}
      {showComponentCatalogModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-card border border-default rounded-3xl p-6 space-y-5 shadow-2xl text-heading max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-heading flex items-center gap-2">
                  <Layout className="w-5 h-5 text-emerald-400" />
                  Visual Component Blueprint Catalog
                </h2>
                <p className="text-xs text-slate-400">
                  Select a section component. See exact visual wireframe diagram before adding to your store.
                </p>
              </div>
              <button
                onClick={() => setShowComponentCatalogModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-2"
              >
                ✕ Close
              </button>
            </div>

            {/* Component Cards Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pr-1">
              {VISUAL_COMPONENT_CATALOG.map((item) => (
                <div
                  key={item.type}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/80 transition-all space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        {item.badge}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.type}</span>
                    </div>

                    <h3 className="text-sm font-bold text-heading group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>

                    {/* Visual Diagram */}
                    <div className="pt-2">{item.diagram}</div>
                  </div>

                  <button
                    onClick={() => addComponentFromCatalog(item)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 group-hover:bg-emerald-500 text-slate-200 group-hover:text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Store</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. AI IMAGE SELECTOR MODAL                                                */}
      {/* ========================================================================= */}
      {showImagePickerFor && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-card border border-default rounded-2xl p-6 space-y-4 shadow-2xl text-heading">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">AI High-Res Image Suggestions ({currentNichePreset.name})</h3>
              </div>
              <button
                onClick={() => setShowImagePickerFor(null)}
                className="text-slate-500 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Click any photo to instantly apply, or upload your own photo from your computer.
            </p>

            {/* AI Image Prompt Generator Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-950/60 to-slate-950 border border-violet-500/30 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300">
                <Wand2 className="w-4 h-4 text-violet-400 animate-pulse" />
                <span>AI Photo Generator (Studio Diffusion & DALL-E)</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiImagePrompt}
                  onChange={(e) => setAiImagePrompt(e.target.value)}
                  placeholder="e.g. Handmade Royal Oxford shoes on polished wood..."
                  className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={handleGenerateCustomAiImage}
                  disabled={!aiImagePrompt.trim() || isGeneratingAiImg}
                  className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isGeneratingAiImg ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Upload Box from PC / Drive */}
            <div className="p-3.5 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950/60 text-center space-y-1 transition-all">
              <label className="cursor-pointer block">
                <Upload className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-heading block">📁 Upload Image from PC / Drive</span>
                <span className="text-[10px] text-slate-500 block">Select any JPG, PNG, WEBP file directly from your computer</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleFileUpload(e, "section");
                    setShowImagePickerFor(null);
                  }}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
              {currentNichePreset.images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => {
                    handlePropChange("imageUrl", img.url);
                    handlePropChange("heroImage", img.url);
                    setShowImagePickerFor(null);
                  }}
                  className="group rounded-xl border border-slate-800 overflow-hidden cursor-pointer hover:border-emerald-500 transition-all"
                >
                  <div className="h-28 overflow-hidden relative">
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-2 bg-slate-950">
                    <p className="text-[10px] font-bold text-white truncate">{img.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
