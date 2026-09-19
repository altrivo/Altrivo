"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Tablet,
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
  Home,
  Info,
  Phone,
  AtSign,
  Target,
} from "lucide-react";
import StorefrontRenderer from "@/components/sections/StorefrontRenderer";
import {
  getStoredProducts,
  toStorefrontProduct,
  isValidImageUrl,
  getCategoryDefaultImage,
  safeLocalStorageSet,
} from "@/lib/product-storage";

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
    products: [],
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
    products: [],
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
      { label: "Minimalist Leather Watch", url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80" },
    ],
    products: [],
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
    products: [],
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
      <div className="w-full h-20 bg-slate-100 rounded-xl border border-slate-200 p-2 flex items-center gap-2">
        <div className="flex-1 space-y-1">
          <div className="h-2.5 w-3/4 bg-slate-700 rounded" />
          <div className="h-1.5 w-full bg-slate-300 rounded" />
          <div className="flex gap-1 pt-1">
            <div className="h-3 w-8 bg-slate-700 rounded" />
            <div className="h-3 w-8 bg-slate-300 rounded" />
          </div>
        </div>
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-slate-200 text-[9px] text-slate-500 font-bold shadow-2xs">
          Photo
        </div>
      </div>
    ),
    defaultProps: {
      title: "Handcrafted Luxury & Bespoke Distinction",
      subtitle: "Curated premium materials and master craftsmanship tailored for refined tastes.",
      ctaText: "Shop Collection",
      ctaLink: "#catalog",
      secondaryCtaText: "Learn Heritage",
      secondaryCtaLink: "#about",
      imageAlignment: "right",
      imageAspect: "square",
      imagePosition: "right",
      imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    type: "HeroBento",
    title: "Modern Bento Grid Hero",
    category: "hero",
    badge: "Trending 2026",
    description: "Multi-card bento box showcasing flagship product, discount chip, and live customer reviews.",
    diagram: (
      <div className="w-full h-20 bg-slate-100 rounded-xl border border-slate-200 p-1.5 grid grid-cols-3 gap-1">
        <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-1 space-y-1">
          <div className="h-2 w-1/2 bg-[#5A3D63] rounded" />
          <div className="h-1 w-3/4 bg-slate-300 rounded" />
        </div>
        <div className="bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[8px] text-slate-500 font-semibold shadow-2xs">Tile 2</div>
        <div className="col-span-3 h-4 bg-white border border-slate-200 rounded-lg flex items-center px-2 text-[7px] text-purple-700 font-bold shadow-2xs">
          ★ 4.9/5 Rating Banner
        </div>
      </div>
    ),
    defaultProps: {
      headline: "Artisanal Craft Meets Modern Tech",
      subline: "Designed for individuals who refuse ordinary quality.",
      primaryCtaText: "Explore Bento Drop",
      primaryCtaLink: "#catalog",
      secondaryCtaText: "Watch Video",
      secondaryCtaLink: "#about",
      badgeText: "Handcrafted Edition",
      accentTag: "100% Premium",
      heroImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    type: "PromoBanner",
    title: "Top Promotional Offer Ribbon",
    category: "features",
    badge: "High Conversion",
    description: "Eye-catching top ribbon displaying free shipping threshold, coupon code, and COD guarantee.",
    diagram: (
      <div className="w-full h-12 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center px-2 text-center shadow-2xs">
        <span className="text-[9px] font-bold text-amber-800 truncate">🎉 Free Delivery on orders over ₨ 5,000 across Pakistan!</span>
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
      <div className="w-full h-20 bg-slate-100 rounded-xl border border-slate-200 p-1.5 grid grid-cols-3 gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-1 space-y-0.5 shadow-2xs">
            <div className="h-7 w-full bg-slate-200 rounded" />
            <div className="h-1.5 w-3/4 bg-slate-300 rounded" />
            <div className="h-1.5 w-1/2 bg-slate-700 rounded" />
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
      <div className="w-full h-20 bg-slate-100 rounded-xl border border-slate-200 p-1.5 flex items-center gap-1.5 overflow-hidden">
        <div className="w-12 h-14 bg-slate-200 rounded-lg opacity-60 flex-shrink-0" />
        <div className="w-20 h-16 bg-purple-100 border border-purple-300 rounded-lg flex-shrink-0 flex flex-col justify-end p-1 shadow-2xs">
          <span className="text-[7px] font-bold text-purple-800">Featured</span>
        </div>
        <div className="w-12 h-14 bg-slate-200 rounded-lg opacity-60 flex-shrink-0" />
      </div>
    ),
    defaultProps: {
      title: "Explore Collections",
      layout: "card",
      categories: [
        { title: "Exclusive Edition", count: "24 items", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600" },
        { title: "Casual Pret", count: "18 items", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600" },
        { title: "Seasonal Drops", count: "32 items", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600" },
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
      <div className="w-full h-16 bg-slate-100 rounded-xl border border-slate-200 p-1 grid grid-cols-4 gap-1">
        {["COD", "Escrow", "Exchange", "100% Pure"].map((t, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg flex flex-col items-center justify-center p-1 text-center shadow-2xs">
            <span className="text-[7px] font-bold text-purple-700">{t}</span>
          </div>
        ))}
      </div>
    ),
    defaultProps: {
      columns: 4,
      items: [
        { icon: "truck", title: "Cash on Delivery", description: "Pay at your doorstep anywhere in Pakistan via TCS" },
        { icon: "shield-check", title: "100% Escrow Protection", description: "Guaranteed buyer security on every order" },
        { icon: "rotate-ccw", title: "7-Day Easy Exchange", description: "Hassle-free replacement with zero hassle" },
        { icon: "award", title: "Certified Authentic", description: "Hand-inspected natural materials by master craftsmen" },
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
      <div className="w-full h-20 bg-slate-100 rounded-xl border border-slate-200 p-2 flex items-center gap-2">
        <div className="w-14 h-14 bg-slate-200 rounded-lg border border-slate-300 flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="h-2 w-3/4 bg-slate-700 rounded" />
          <div className="h-1.5 w-full bg-slate-300 rounded" />
        </div>
      </div>
    ),
    defaultProps: {
      title: "The Art of Bespoke Craftsmanship",
      paragraphs: [
        "Every piece is shaped by hand with meticulous care and dedication. Our artisans spend hours perfecting every line, seam, and detail.",
        "We reject synthetic shortcuts. Every detail is engineered to ensure timeless elegance.",
      ],
      imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    type: "TestimonialSlider",
    title: "Verified Customer Reviews Wall",
    category: "reviews",
    badge: "Social Proof",
    description: "Customer testimonials with 5-star ratings, buyer location, and verified badges.",
    diagram: (
      <div className="w-full h-16 bg-slate-100 rounded-xl border border-slate-200 p-2 flex gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex-1 bg-white border border-slate-200 rounded-lg p-1.5 space-y-1 shadow-2xs">
            <div className="text-[7px] text-amber-500 font-bold">★★★★★</div>
            <div className="h-1 w-full bg-slate-300 rounded" />
          </div>
        ))}
      </div>
    ),
    defaultProps: {
      title: "What Our Buyers Say",
      layout: "carousel",
      testimonials: [
        { id: "1", name: "Hamza Tariq (Lahore)", text: "Ordered for my brother's wedding. Quality and finish is unmatched!", rating: 5, role: "Verified Buyer" },
        { id: "2", name: "Dr. Bilal Khan (Islamabad)", text: "COD was delivered in 2 days. Fit and comfort is remarkable.", rating: 5, role: "Verified Buyer" },
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
      <div className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center justify-between shadow-2xs">
        <div className="space-y-0.5">
          <div className="text-[8px] font-bold text-slate-900">Join VIP Club</div>
          <div className="text-[7px] text-slate-500">Get 10% OFF</div>
        </div>
        <div className="h-5 w-16 bg-[#5A3D63] rounded-lg flex items-center justify-center text-[7px] font-bold text-white shadow-xs">Claim 10%</div>
      </div>
    ),
    defaultProps: {
      title: "Join The VIP Inner Circle",
      subtitle: "Get exclusive access to private drops and enjoy instant 10% OFF your first order.",
      buttonText: "Claim 10% Discount",
    },
  },
  {
    type: "CustomComponent",
    title: "Custom Designed Section",
    category: "hero",
    badge: "Custom Studio",
    description: "Fully customizable section with badge, heading, description, dual action buttons, and image position/ratio options.",
    diagram: (
      <div className="w-full h-14 bg-slate-100 border border-slate-200 rounded-xl p-2 flex items-center justify-between shadow-2xs">
        <div className="space-y-0.5">
          <div className="text-[8px] font-bold text-slate-800">✨ Custom Hero / Spotlight</div>
          <div className="text-[7px] text-slate-500">Dual CTA + Custom Photo</div>
        </div>
        <div className="h-5 w-14 bg-slate-900 rounded-lg flex items-center justify-center text-[7px] font-bold text-white shadow-xs">Explore</div>
      </div>
    ),
    defaultProps: {
      title: "Limited Edition Handcrafted Collection",
      subtitle: "Engineered with precision and premium craftsmanship for connoisseurs of timeless luxury.",
      ctaText: "Discover Now",
      ctaLink: "/shop",
      secondaryCtaText: "Learn Heritage",
      secondaryCtaLink: "#story",
      imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
      imagePosition: "right",
      imageAspect: "landscape",
      bgTheme: "slate",
      buttonTheme: "purple",
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
    pages?: any;
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
    ],
  });

  // Custom Products list - strictly empty by default until vendor adds products
  const [productsList, setProductsList] = useState<any[]>([]);
  // Real Store Catalog Products strictly scoped to this store ID & slug
  const [storeCatalogProducts, setStoreCatalogProducts] = useState<any[]>([]);

  // Strictly isolate and sanitize products for the active store & niche
  const sanitizedCatalog = useMemo(() => {
    return storeCatalogProducts.filter((p) => {
      if (!p) return false;
      if (p.storeId && storeId && p.storeId !== storeId && p.storeId !== slug) return false;
      const sName = `${storeName || ""} ${slug || ""}`.toLowerCase();
      const pName = (p.name || "").toLowerCase();
      const pCat = (p.category || p.tag || "").toLowerCase();
      if (
        activeNiche === "watches" ||
        sName.includes("watch") ||
        sName.includes("chrono") ||
        sName.includes("time")
      ) {
        if (pCat === "clothing" || pCat === "apparel" || pName.includes("shirt") || p.id === "prod_1788857708721_8y74") {
          return false;
        }
      }
      if (
        activeNiche === "clothing" ||
        sName.includes("cloth") ||
        sName.includes("apparel") ||
        sName.includes("fashion")
      ) {
        if (pCat === "electronics" || pName.includes("watch") || p.id?.includes("watch")) {
          return false;
        }
      }
      return true;
    });
  }, [storeCatalogProducts, storeId, slug, activeNiche, storeName]);
  const [skuFeedback, setSkuFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>("navbar-header");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activePage, setActivePage] = useState<"home" | "about" | "shop" | "contact">("home");
  const [sidebarWidth, setSidebarWidth] = useState<number>(380);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState<boolean>(false);

  // Drag-to-resize listener for sidebar & canvas width
  useEffect(() => {
    if (!isDraggingSidebar) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Clamp between 270px and 580px
      const newWidth = Math.min(Math.max(e.clientX - 64, 270), 580);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDraggingSidebar(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingSidebar]);

  // Page props change helper
  const handlePagePropChange = (
    page: "about" | "shop" | "contact",
    sectionKey: string,
    field: string,
    value: any
  ) => {
    setLayoutConfig((prev) => {
      const pages = prev.pages || {};
      const pageData = (pages as any)[page] || {};
      if (sectionKey) {
        const secData = pageData[sectionKey] || {};
        return {
          ...prev,
          pages: {
            ...pages,
            [page]: {
              ...pageData,
              [sectionKey]: {
                ...secData,
                [field]: value,
              },
            },
          },
        };
      } else {
        return {
          ...prev,
          pages: {
            ...pages,
            [page]: {
              ...pageData,
              [field]: value,
            },
          },
        };
      }
    });
  };

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
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [aiChatMessages, setAiChatMessages] = useState<
    Array<{
      role: "ai" | "user";
      text: string;
      summary?: string;
      time?: string;
    }>
  >([
    {
      role: "ai",
      text: "Hello! I am your Altrivo Assistant. Tell me what changes you would like to make to your store — such as updating hero titles, changing theme colors, adding promotional banners, or customizing layout sections.",
      time: "Just now",
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

  // AI Component Generator inside Component Catalog Modal
  const [aiComponentPrompt, setAiComponentPrompt] = useState("");
  const [isGeneratingComponent, setIsGeneratingComponent] = useState(false);

  const handleGenerateAiComponent = async () => {
    if (!aiComponentPrompt.trim()) return;
    setIsGeneratingComponent(true);
    try {
      const preset = currentNichePreset || NICHE_PRESETS.clothing;
      let generatedImg = preset.images[0]?.url || "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80";

      // Attempt AI image generation specifically tailored to this prompt and niche
      try {
        const imgRes = await fetch("/api/ai/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `${aiComponentPrompt}, ${preset.name} commercial studio photography`,
            niche: activeNiche,
            aspect: "landscape",
          }),
        });
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          if (imgData.imageUrl) generatedImg = imgData.imageUrl;
        }
      } catch (imgErr) {
        console.warn("[Editor] AI Image sub-fetch:", imgErr);
      }

      const newId = `custom-ai-${Date.now()}`;
      const words = aiComponentPrompt.trim().split(" ");
      const cleanTitle = words
        .slice(0, 6)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

      const newSection: Section = {
        id: newId,
        type: "CustomComponent",
        props: {
          title: cleanTitle || "Exclusive AI Spotlight",
          subtitle: `Custom tailored for ${storeName}. ${aiComponentPrompt}`,
          ctaText: "Explore Now",
          ctaLink: "#catalog",
          secondaryCtaText: "Learn Heritage",
          secondaryCtaLink: "#about",
          imageUrl: generatedImg,
          heroImage: generatedImg,
          imagePosition: "right",
          imageAspect: "landscape",
          bgTheme: "slate",
          buttonTheme: "purple",
        },
      };

      setLayoutConfig((prev) => ({
        ...prev,
        sections: [...prev.sections, newSection],
      }));
      setActiveSectionId(newId);
      setSidebarTab("props");
      setShowComponentCatalogModal(false);
      setAiComponentPrompt("");
    } catch (err) {
      console.error("[Editor] Failed to generate AI component:", err);
    } finally {
      setIsGeneratingComponent(false);
    }
  };

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [draftSuccess, setDraftSuccess] = useState(false);

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
        let storeData: any = null;

        // 1. Direct fetch by slug or ID from backend
        try {
          const directRes = await fetch(`/api/stores/${slug}`);
          if (directRes.ok) {
            const directJson = await directRes.json();
            if (directJson.store) {
              storeData = directJson.store;
            }
          }
        } catch {}

        // 2. Fallback to stores list if direct fetch did not return
        if (!storeData) {
          const res = await fetch("/api/stores");
          if (res.ok) {
            const { stores } = await res.json();
            storeData = stores?.find(
              (s: any) =>
                s.slug?.toLowerCase() === slug ||
                s.subdomain?.toLowerCase() === slug ||
                s.id === slug
            );
          }
        }

        if (!storeData) {
          const local = localStorage.getItem("digishop_stores");
          if (local) {
            try {
              const parsed = JSON.parse(local);
              storeData = parsed.find(
                (s: any) =>
                  s.slug?.toLowerCase() === slug ||
                  s.subdomain?.toLowerCase() === slug ||
                  s.id === slug
              );
            } catch {}
          }
        }

        if (storeData) {
          const sName = `${storeData.name || ""} ${storeData.slug || slug || ""}`.toLowerCase();
          let detectedNiche = "shoes";
          if (
            sName.includes("cloth") ||
            sName.includes("shirt") ||
            sName.includes("fashion") ||
            sName.includes("apparel") ||
            sName.includes("wear") ||
            sName.includes("garment") ||
            storeData.niche === "clothing" ||
            storeData.niche === "fashion"
          ) {
            detectedNiche = "clothing";
          } else if (
            sName.includes("watch") ||
            sName.includes("time") ||
            sName.includes("chrono") ||
            sName.includes("horolog") ||
            sName.includes("jewelry") ||
            storeData.niche === "watches"
          ) {
            detectedNiche = "watches";
          } else if (
            sName.includes("tech") ||
            sName.includes("gadget") ||
            sName.includes("phone") ||
            sName.includes("electron") ||
            storeData.niche === "tech"
          ) {
            detectedNiche = "tech";
          } else if (storeData.niche && NICHE_PRESETS[storeData.niche]) {
            detectedNiche = storeData.niche;
          }
          setActiveNiche(detectedNiche);

          const defaultCategoriesByNiche: Record<string, any[]> = {
            clothing: [
              { name: "Formal Oxford Shirts", href: "#catalog" },
              { name: "Linen Casual Wear", href: "#catalog" },
              { name: "Streetwear & Hoodies", href: "#catalog" },
              { name: "Traditional Kurtas", href: "#catalog" },
            ],
            watches: [
              { name: "Automatic Chronographs", href: "#catalog" },
              { name: "Skeleton Mechanical", href: "#catalog" },
              { name: "Luxury Dress Watches", href: "#catalog" },
              { name: "Diver Timepieces", href: "#catalog" },
            ],
            tech: [
              { name: "Wireless Audio", href: "#catalog" },
              { name: "Smart Wearables", href: "#catalog" },
              { name: "Mechanical Keyboards", href: "#catalog" },
              { name: "Gaming Gear", href: "#catalog" },
            ],
            shoes: [
              { name: "Oxford & Formals", href: "#catalog" },
              { name: "Casual Loafers", href: "#catalog" },
              { name: "Sneakers & Street", href: "#catalog" },
              { name: "Peshawari Chappal", href: "#catalog" },
            ],
          };
          const fallbackCats = defaultCategoriesByNiche[detectedNiche] || defaultCategoriesByNiche.shoes;

          // -----------------------------------------------------------------
          // Load Real Store Products strictly scoped to this store ID & slug
          // -----------------------------------------------------------------
          const backendCommerceProducts = Array.isArray(storeData.commerce_config?.products)
            ? storeData.commerce_config.products
            : [];
          const backendLayoutProducts = Array.isArray(storeData.layout_config?.products)
            ? storeData.layout_config.products
            : [];

          // Primary source of truth: the store's verified database products (commerce_config holds all items including drafts)
          const allCatalogMap = new Map<string, any>();
          backendCommerceProducts.forEach((p: any) => {
            if (p && (p.id || p.sku)) allCatalogMap.set(p.id || p.sku, p);
          });
          backendLayoutProducts.forEach((p: any) => {
            if (p && (p.id || p.sku) && !allCatalogMap.has(p.id || p.sku)) {
              allCatalogMap.set(p.id || p.sku, p);
            }
          });
          const localCatalog = getStoredProducts(storeData.id);
          localCatalog.forEach((p: any) => {
            if (p && (p.id || p.sku) && !allCatalogMap.has(p.id || p.sku)) {
              allCatalogMap.set(p.id || p.sku, p);
            }
          });
          const canonicalProducts = allCatalogMap.size > 0 ? Array.from(allCatalogMap.values()) : localCatalog;

          // Strictly filter products to only those that belong to this store
          const productMap = new Map<string, any>();
          canonicalProducts.forEach((rawP: any) => {
            if (!rawP) return;
            // Reject any product belonging to another store
            if (rawP.storeId && storeData.id && rawP.storeId !== storeData.id && rawP.storeId !== storeData.slug) {
              return;
            }
            // Strict isolation: if store is watch-brand, reject any apparel product
            if (
              (storeData.slug === "watch-brand" || sName.includes("watch")) &&
              ((rawP.name || "").toLowerCase().includes("shirt") || rawP.id === "prod_1788857708721_8y74" || (rawP.category || "").toLowerCase() === "clothing")
            ) {
              return;
            }
            const converted = toStorefrontProduct(rawP);
            if (converted && converted.id) {
              const key = (converted.sku || converted.id).toLowerCase();
              if (!productMap.has(key)) {
                productMap.set(key, converted);
              }
            }
          });

          const mergedStoreCatalog = Array.from(productMap.values());
          setStoreCatalogProducts(mergedStoreCatalog);

          // Overwrite local storage for this store to eliminate any stale foreign products
          if (typeof window !== "undefined") {
            try {
              if (storeData.id) {
                safeLocalStorageSet(`artrivo_products_store_${storeData.id}`, JSON.stringify(mergedStoreCatalog));
              }
              if (storeData.slug) {
                safeLocalStorageSet(`artrivo_products_store_${storeData.slug}`, JSON.stringify(mergedStoreCatalog));
              }
              const localDigi = localStorage.getItem("digishop_stores");
              if (localDigi) {
                const parsedStores = JSON.parse(localDigi);
                if (Array.isArray(parsedStores)) {
                  const updated = parsedStores.map((s: any) => {
                    if (s.id === storeData.id || s.slug === storeData.slug) {
                      return {
                        ...s,
                        layout_config: {
                          ...s.layout_config,
                          products: mergedStoreCatalog,
                        },
                        commerce_config: {
                          ...s.commerce_config,
                          products: mergedStoreCatalog,
                        },
                      };
                    }
                    return s;
                  });
                  safeLocalStorageSet("digishop_stores", JSON.stringify(updated));
                }
              }
            } catch {}
          }

          // Dynamically derive real categories from store products
          const productCategories = Array.from(
            new Set(mergedStoreCatalog.map((p) => p.category || p.tag).filter(Boolean))
          );
          const realCategoryNav = productCategories.length > 0
            ? productCategories.map((c) => ({ name: c, href: "#catalog" }))
            : fallbackCats;

          const publishedCatalog = mergedStoreCatalog.filter((p) => p.status === "published");

          const cleanSections = (storeData.layout_config?.sections || []).map((sec: any) => {
            if (sec.props && Array.isArray(sec.props.products)) {
              const mapped = sec.props.products.map((p: any) => {
                const match = mergedStoreCatalog.find(
                  (cp) => cp.id === p.id || (cp.sku && cp.sku === p.sku)
                );
                return match
                  ? { ...p, ...match, image: match.image, thumbnail: match.thumbnail }
                  : toStorefrontProduct(p);
              });
              // STRICT STOREFRONT ISOLATION: Draft products must NEVER appear in live storefront sections
              const publishedOnly = mapped.filter((p: any) => p && p.status === "published");
              return {
                ...sec,
                props: {
                  ...sec.props,
                  products: publishedOnly,
                },
              };
            }
            return sec;
          });

          if (storeData.layout_config?.sections?.length > 0) {
            setLayoutConfig({
              ...storeData.layout_config,
              sections: cleanSections,
              categories: storeData.layout_config.categories || realCategoryNav,
              products: publishedCatalog,
            });
            setStoreName(storeData.name || storeData.layout_config.storeName || "My Store");
            setStoreId(storeData.id);
            
            // Only published products auto-populate productsList on the live canvas! Draft products stay in catalog
            if (publishedCatalog.length > 0) {
              setProductsList(publishedCatalog);
            } else {
              setProductsList([]);
            }
            if (storeData.layout_config.sections?.[0]) {
              setActiveSectionId(storeData.layout_config.sections[0].id);
            }
            return;
          } else {
            setStoreName(storeData.name || "My Store");
            setStoreId(storeData.id);
            if (publishedCatalog.length > 0) {
              setProductsList(publishedCatalog);
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
  // -------------------------------------------------------------------------
  // Save Store Layout to Backend & LocalStorage (Live or Draft)
  // -------------------------------------------------------------------------
  const handleSave = async (publish: boolean = true) => {
    if (publish) {
      setIsSaving(true);
    } else {
      setIsDraftSaving(true);
    }

    try {
      const defaultCategoriesByNiche: Record<string, any[]> = {
        clothing: [
          { name: "Formal Oxford Shirts", href: "#catalog" },
          { name: "Linen Casual Wear", href: "#catalog" },
          { name: "Streetwear & Hoodies", href: "#catalog" },
          { name: "Traditional Kurtas", href: "#catalog" },
        ],
        watches: [
          { name: "Automatic Chronographs", href: "#catalog" },
          { name: "Skeleton Mechanical", href: "#catalog" },
          { name: "Luxury Dress Watches", href: "#catalog" },
          { name: "Diver Timepieces", href: "#catalog" },
        ],
        tech: [
          { name: "Wireless Audio", href: "#catalog" },
          { name: "Smart Wearables", href: "#catalog" },
          { name: "Mechanical Keyboards", href: "#catalog" },
          { name: "Gaming Gear", href: "#catalog" },
        ],
        shoes: [
          { name: "Oxford & Formals", href: "#catalog" },
          { name: "Casual Loafers", href: "#catalog" },
          { name: "Sneakers & Street", href: "#catalog" },
          { name: "Peshawari Chappal", href: "#catalog" },
        ],
      };
      const fallbackCats = defaultCategoriesByNiche[activeNiche] || defaultCategoriesByNiche.shoes;
      const targetIdentifier = storeId || slug;

      // Ensure productsList only contains published products for storefront layout
      const publishedStorefront = productsList.filter((p) => p.status === "published");

      // Maintain the full store catalog (published + drafts) in commerce_config so drafts are not wiped
      const fullCatalog = (sanitizedCatalog.length > 0 ? sanitizedCatalog : storeCatalogProducts).map((p) => toStorefrontProduct(p));

      const payloadLayout = {
        ...layoutConfig,
        storeName,
        categories: layoutConfig.categories || fallbackCats,
        products: publishedStorefront,
        sections: layoutConfig.sections.map((s) => {
          if (s.type === "ProductGridFeatured" || s.type.includes("ProductGrid")) {
            return {
              ...s,
              props: {
                ...s.props,
                products: publishedStorefront,
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
          commerce_config: { products: fullCatalog.length > 0 ? fullCatalog : publishedStorefront },
          is_published: publish,
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
            commerce_config: { products: fullCatalog.length > 0 ? fullCatalog : publishedStorefront },
            is_published: publish,
          }),
        }).catch(() => {});
      }

      // Sync to localStorage
      try {
        const local = JSON.parse(localStorage.getItem("digishop_stores") || "[]");
        const updated = local.map((s: any) =>
          s.slug === slug || s.id === storeId
            ? { ...s, layout_config: payloadLayout, name: storeName, commerce_config: { products: fullCatalog.length > 0 ? fullCatalog : publishedStorefront }, is_published: publish }
            : s
        );
        safeLocalStorageSet("digishop_stores", JSON.stringify(updated));
      } catch {}

      if (publish) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        setDraftSuccess(true);
        setTimeout(() => setDraftSuccess(false), 2500);
      }
    } catch (err: any) {
      console.error("Save failed", err);
      alert(`Save failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
      setIsDraftSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Switch Niche Industry (Shoes, Shirts/Apparel, Tech, Watches)
  // -------------------------------------------------------------------------
  const handleSwitchNiche = (nicheKey: string) => {
    const preset = NICHE_PRESETS[nicheKey];
    if (!preset) return;

    setActiveNiche(nicheKey);
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
    const preset = currentNichePreset || NICHE_PRESETS[activeNiche] || NICHE_PRESETS.clothing;
    const dynamicProps = { ...blueprint.defaultProps };

    if (activeNiche === "clothing" || activeNiche === "fashion") {
      if (blueprint.type === "HeroSplitImage") {
        dynamicProps.title = "Bespoke Elegance & Modern Tailoring";
        dynamicProps.subtitle = "Curated premium pret, formal oxford shirts, and contemporary designer wear.";
        dynamicProps.ctaText = "Shop Collection";
        dynamicProps.secondaryCtaText = "Explore Pret";
        dynamicProps.imageUrl = preset.images[0]?.url || "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80";
        dynamicProps.heroImage = dynamicProps.imageUrl;
      } else if (blueprint.type === "HeroBento") {
        dynamicProps.headline = "Haute Couture Meets Modern Pret";
        dynamicProps.subline = "Handpicked luxurious fabrics and bespoke cuts for the discerning wardrobe.";
        dynamicProps.primaryCtaText = "Explore Collection";
        dynamicProps.secondaryCtaText = "View Lookbook";
        dynamicProps.heroImage = preset.images[1]?.url || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80";
      } else if (blueprint.type.includes("Category")) {
        dynamicProps.title = `Explore ${storeName} Collections`;
        dynamicProps.categories = [
          { title: "Formal Oxford Shirts", count: "28 items", image: preset.images[0]?.url || "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600" },
          { title: "Linen Casual Wear", count: "34 items", image: preset.images[1]?.url || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600" },
          { title: "Streetwear & Hoodies", count: "19 items", image: preset.images[3]?.url || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600" },
          { title: "Designer Pret", count: "22 items", image: preset.images[4]?.url || "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600" },
        ];
      } else if (blueprint.type === "BrandStory") {
        dynamicProps.title = "The Art of Master Weavers & Tailors";
        dynamicProps.paragraphs = [
          "Every garment is spun with high-grade Egyptian cotton and stitched with meticulous precision by master tailors.",
          "We craft silhouettes that outlive seasonal trends with enduring refinement.",
        ];
        dynamicProps.imageUrl = preset.images[2]?.url || "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800";
      } else if (blueprint.type === "CustomComponent") {
        dynamicProps.title = "Contemporary Pret & Designer Wear";
        dynamicProps.subtitle = "Exclusive drop featuring hand-finished collars, mother-of-pearl buttons, and structured fits.";
        dynamicProps.imageUrl = preset.images[0]?.url;
        dynamicProps.heroImage = preset.images[0]?.url;
      }
    } else if (activeNiche === "watches") {
      if (blueprint.type === "HeroSplitImage") {
        dynamicProps.title = "Precision Horology & Timeless Elegance";
        dynamicProps.subtitle = "Swiss-grade chronograph movements and sapphire crystal timepieces crafted to perfection.";
        dynamicProps.ctaText = "Shop Timepieces";
        dynamicProps.secondaryCtaText = "Discover Heritage";
        dynamicProps.imageUrl = preset.images[0]?.url || "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80";
        dynamicProps.heroImage = dynamicProps.imageUrl;
      } else if (blueprint.type === "HeroBento") {
        dynamicProps.headline = "Mastery in Precision Timekeeping";
        dynamicProps.subline = "Hand-assembled automatic chronographs engineered for a lifetime of prestige.";
        dynamicProps.primaryCtaText = "Explore Chronographs";
        dynamicProps.secondaryCtaText = "Horology Specs";
        dynamicProps.heroImage = preset.images[1]?.url || "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80";
      } else if (blueprint.type.includes("Category")) {
        dynamicProps.title = `Explore ${storeName} Collections`;
        dynamicProps.categories = [
          { title: "Automatic Chronographs", count: "16 items", image: preset.images[0]?.url || "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600" },
          { title: "18K Gold Jewelry", count: "24 items", image: preset.images[1]?.url || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600" },
          { title: "Minimalist Leather", count: "18 items", image: preset.images[2]?.url || "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600" },
        ];
      } else if (blueprint.type === "BrandStory") {
        dynamicProps.title = "The Art of Precision Horology";
        dynamicProps.paragraphs = [
          "Every timepiece undergoes 200 individual quality checks, utilizing high-grade stainless steel and sapphire glass.",
          "Our dedication to mechanical precision ensures each second is an expression of luxury.",
        ];
        dynamicProps.imageUrl = preset.images[0]?.url;
      } else if (blueprint.type === "CustomComponent") {
        dynamicProps.title = "Handcrafted Luxury Heritage";
        dynamicProps.subtitle = "Engineered with anti-reflective sapphire glass, 100m water resistance, and hand-finished dials.";
        dynamicProps.imageUrl = preset.images[0]?.url;
        dynamicProps.heroImage = preset.images[0]?.url;
      }
    } else if (activeNiche === "tech") {
      if (blueprint.type === "HeroSplitImage") {
        dynamicProps.title = "Next-Generation Audio & Gaming Gear";
        dynamicProps.subtitle = "High-fidelity soundstages, mechanical precision switches, and ultra-low latency wireless tech.";
        dynamicProps.ctaText = "Shop Tech Drop";
        dynamicProps.imageUrl = preset.images[0]?.url || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800";
        dynamicProps.heroImage = dynamicProps.imageUrl;
      }
    }

    const newSection: Section = {
      id: newId,
      type: blueprint.type,
      props: dynamicProps,
    };

    setLayoutConfig((prev) => ({ ...prev, sections: [...prev.sections, newSection] }));
    setActiveSectionId(newId);
    setSidebarTab("props");
    setShowComponentCatalogModal(false);
  };

  // Add Product by SKU, ID or Name from Store Catalog
  const handleAddProductBySkuOrId = (inputVal: string) => {
    if (!inputVal.trim()) return;
    const query = inputVal.trim().toLowerCase();
    
    // Search in the vendor's real store catalog
    const found = storeCatalogProducts.find(
      (p) =>
        (p.sku && p.sku.toLowerCase() === query) ||
        (p.id && p.id.toLowerCase() === query) ||
        (p.name && p.name.toLowerCase().includes(query))
    );

    if (found) {
      if (found.status === "draft") {
        setSkuFeedback({
          type: "error",
          message: `"${found.name}" is currently in Draft mode. Draft products cannot be added to storefront sections. Please publish it from Products first.`,
        });
        return;
      }
      const alreadyInList = productsList.some((p) => p.id === found.id || (p.sku && p.sku === found.sku));
      if (!alreadyInList) {
        const converted = toStorefrontProduct(found);
        setProductsList([...productsList, converted]);
        setSkuFeedback({ type: "success", message: `Added "${found.name}" (${found.sku || found.id}) to storefront!` });
      } else {
        setSkuFeedback({ type: "success", message: `"${found.name}" is already in the section.` });
      }
      setSkuInput("");
    } else {
      setSkuFeedback({
        type: "error",
        message: `No product found matching "${inputVal}". Please verify SKU or ID in your catalog.`,
      });
    }
  };

  // Toggle Product Inclusion from the Store Catalog Items
  const handleToggleProductFromCatalog = (catalogItem: any) => {
    const exists = productsList.some((p) => p.id === catalogItem.id || (p.sku && catalogItem.sku && p.sku === catalogItem.sku));
    if (exists) {
      setProductsList(productsList.filter((p) => p.id !== catalogItem.id && (!catalogItem.sku || p.sku !== catalogItem.sku)));
    } else {
      if (catalogItem.status === "draft") {
        alert(`"${catalogItem.name}" is a Draft product. Draft products cannot be added to storefront sections. Please publish it from the Products tab first.`);
        return;
      }
      const converted = toStorefrontProduct(catalogItem);
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
  // Active Section & Niche Selection Context
  // -------------------------------------------------------------------------
  const activeSection = layoutConfig.sections.find((s) => s.id === activeSectionId) || null;
  const currentNichePreset = NICHE_PRESETS[activeNiche] || NICHE_PRESETS.shoes;

  // -------------------------------------------------------------------------
  // AI Assistant Section Tagging (@hero, @navbar, @theme, @active, etc.)
  // -------------------------------------------------------------------------
  const mentionOptions = useMemo(() => {
    const opts = [
      {
        tag: "active",
        icon: "🎯",
        label: activeSection?.props?.title ? `Active: ${activeSection.props.title.slice(0, 18)}` : "Active Canvas Section",
        description: "Target whichever section is currently selected on the canvas",
      },
      {
        tag: "hero",
        icon: "🖼️",
        label: "Hero Section",
        description: "Main showcase banner, headline, subtitle, buttons & background",
      },
      {
        tag: "theme",
        icon: "🎨",
        label: "Theme & Colors",
        description: "Global store palette (background, primary, text) & typography",
      },
      {
        tag: "navbar",
        icon: "🧭",
        label: "Header / Navbar",
        description: "Store logo, top navigation links, and brand title",
      },
      {
        tag: "products",
        icon: "🛍️",
        label: "Product Catalog Grid",
        description: "Featured product list, display columns, limits & layout",
      },
      {
        tag: "banner",
        icon: "📢",
        label: "Promo Banner",
        description: "Top announcement bar with sale discounts and coupon codes",
      },
      {
        tag: "story",
        icon: "📖",
        label: "Brand Story",
        description: "Store heritage, craftsmanship, and about section",
      },
      {
        tag: "reviews",
        icon: "⭐",
        label: "Customer Reviews",
        description: "Testimonial cards and client ratings slider",
      },
    ];
    if (!mentionQuery) return opts;
    return opts.filter(
      (o) =>
        o.tag.toLowerCase().includes(mentionQuery) ||
        o.label.toLowerCase().includes(mentionQuery) ||
        o.description.toLowerCase().includes(mentionQuery)
    );
  }, [mentionQuery, activeSection]);

  const handleAiInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAiInput(val);

    const lastAtIdx = val.lastIndexOf("@");
    if (lastAtIdx !== -1 && (lastAtIdx === 0 || val[lastAtIdx - 1] === " ")) {
      const query = val.slice(lastAtIdx + 1).toLowerCase();
      if (!query.includes(" ")) {
        setMentionQuery(query);
        setShowMentionMenu(true);
        return;
      }
    }
    setShowMentionMenu(false);
  };

  const handleInsertTag = (tag: string) => {
    const lastAtIdx = aiInput.lastIndexOf("@");
    let newVal = "";
    if (lastAtIdx !== -1) {
      newVal = aiInput.slice(0, lastAtIdx) + `@${tag} `;
    } else {
      newVal = aiInput.trim() ? `@${tag} ${aiInput.trim()} ` : `@${tag} `;
    }
    setAiInput(newVal);
    setShowMentionMenu(false);
  };

  // -------------------------------------------------------------------------
  // Handle AI Chat Commands (Urdu / English) via AI API
  // -------------------------------------------------------------------------
  const handleAiCommand = async (customPrompt?: string) => {
    const userMsg = (customPrompt || aiInput).trim();
    if (!userMsg) return;

    // Detect explicit section tag from message e.g. @hero, @navbar, @theme, @active
    const tagMatch = userMsg.match(/@(active|hero|navbar|theme|products|banner|story|reviews|footer)/i);
    const targetTag = tagMatch ? tagMatch[1].toLowerCase() : undefined;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setAiChatMessages((prev) => [...prev, { role: "user", text: userMsg, time: timeStr }]);
    if (!customPrompt) {
      setAiInput("");
      setShowMentionMenu(false);
    }
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/ai/editor-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          storeSlug: slug,
          storeName,
          currentLayout: layoutConfig,
          userInstruction: userMsg,
          activeSectionId,
          targetTag,
          activeNiche,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.updatedLayout) {
          setLayoutConfig(data.updatedLayout);
          if (data.updatedLayout.storeName && data.updatedLayout.storeName !== storeName) {
            setStoreName(data.updatedLayout.storeName);
          }
        }
        setAiChatMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: data.reply || "Store successfully updated!",
            summary: data.changesSummary,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        const errData = await res.json().catch(() => ({}));
        setAiChatMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: errData.error || "Maazrat, request process nahi ho saki. Dobara try karein.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err: any) {
      console.error("[Editor Assistant Error]:", err);
      setAiChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Connection error: Dobara koshish karein.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const AI_QUICK_ACTIONS = [
    { label: "🎨 Royal Gold & Dark Theme", prompt: "@theme Theme colors ko Royal Gold (#D4AF37) aur sleek dark background me change kardo" },
    { label: "✨ Royal Purple & Slate", prompt: "@theme Theme ko luxury deep purple (#2C1C31), soft lavender (#F5EFF7) aur royal purple (#694873) buttons me change kardo" },
    { label: "🏷️ 20% Off Promo Banner", prompt: "@banner Top par 20% discount aur Free Nationwide Delivery ka promo banner add kardo with coupon code ALT20" },
    { label: "✍️ Luxury Hero Heading", prompt: `@hero Hero section ki heading aur subtitle ko high-converting luxury boutique tone me rewrite kardo for ${storeName}` },
    { label: "🚚 Trust & COD Highlights", prompt: "Features grid me Cash on Delivery, 100% Escrow Protection, aur TCS Express Shipping ke trust badges highlight kardo" },
    { label: "⭐ Customer Testimonials", prompt: "@reviews Store me 5-star customer reviews aur testimonials slider section add kardo" },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 text-slate-800 font-sans select-none overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER TOOLBAR                                                     */}
      {/* ========================================================================= */}
      {/* 1. CLEAN & SIMPLE TOP NAVIGATION BAR                                      */}
      {/* ========================================================================= */}
      <div className="h-14 border-b border-default bg-card shadow-2xs px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-30">
        {/* Left: Back Link */}
        <div className="flex items-center">
          <Link
            href="/my-stores"
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-subtle hover:text-heading border border-default transition-all cursor-pointer"
            title="Back to My Stores"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Center: Clean 4 Store Page Tabs (Home, About, Shop, Contact) */}
        <div className="hidden sm:flex items-center bg-neutral-100 border border-default rounded-xl p-0.5 text-xs shadow-2xs">
          {[
            { id: "home", label: "Home", Icon: Home },
            { id: "about", label: "About", Icon: Info },
            { id: "shop", label: "Shop", Icon: ShoppingBag },
            { id: "contact", label: "Contact", Icon: Phone },
          ].map((p) => {
            const isPActive = activePage === p.id;
            const IconComp = p.Icon;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActivePage(p.id as any);
                  if (p.id === "about") setActiveSectionId("about-hero");
                  else if (p.id === "shop") setActiveSectionId("shop-hero");
                  else if (p.id === "contact") setActiveSectionId("contact-hero");
                  else setActiveSectionId("navbar-header");
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isPActive
                    ? "bg-card text-heading shadow-xs border border-default text-[#312038]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isPActive ? "text-[#312038]" : "text-slate-400"}`} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Actions (AI Assistant, Save Draft, Save Changes) */}
        <div className="flex items-center gap-2">
          {/* AI Chat Tab Trigger */}
          <button
            onClick={() => setSidebarTab(sidebarTab === "ai_chat" ? "props" : "ai_chat")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              sidebarTab === "ai_chat"
                ? "bg-[#312038] text-white shadow-md"
                : "bg-neutral-100 hover:bg-neutral-200 text-heading border border-default"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Assistant</span>
          </button>

          {/* Draft Button */}
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving || isDraftSaving}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Save changes as Draft without publishing"
          >
            {draftSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Draft Saved!</span>
              </>
            ) : isDraftSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                <span>Saving Draft...</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Save Draft</span>
              </>
            )}
          </button>

          {/* Save Live Button */}
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving || isDraftSaving}
            className="px-4 py-1.5 rounded-xl bg-[#312038] hover:bg-[#432c4d] text-white font-extrabold text-xs shadow-md shadow-[#312038]/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Save and publish live to your storefront"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Saved Live!</span>
              </>
            ) : isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-white" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SPLIT WORKSPACE                                                   */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden w-full select-none">
        {/* Left Side: Controller Sidebar (Draggable width) */}
        <div
          style={{ width: `${sidebarWidth}px` }}
          className="border-r border-default bg-card flex flex-col flex-shrink-0 z-20 shadow-xs transition-[width] duration-75 select-auto"
        >
          {/* Sidebar Tabs */}
          <div className="grid grid-cols-4 p-1.5 bg-neutral-100 border-b border-default text-[11px] font-bold">
            <button
              onClick={() => setSidebarTab("sections")}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${sidebarTab === "sections" ? "bg-card text-heading shadow-xs font-extrabold" : "text-subtle hover:text-heading"}`}
            >
              <Layers className={`w-3 h-3 ${sidebarTab === "sections" ? "text-[#312038]" : "text-slate-400"}`} /> Sections
            </button>
            <button
              onClick={() => setSidebarTab("props")}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${sidebarTab === "props" ? "bg-card text-heading shadow-xs font-extrabold" : "text-subtle hover:text-heading"}`}
            >
              <Settings className={`w-3 h-3 ${sidebarTab === "props" ? "text-[#312038]" : "text-slate-400"}`} /> Props
            </button>
            <button
              onClick={() => setSidebarTab("catalog")}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${sidebarTab === "catalog" ? "bg-card text-heading shadow-xs font-extrabold" : "text-subtle hover:text-heading"}`}
            >
              <ShoppingBag className={`w-3 h-3 ${sidebarTab === "catalog" ? "text-[#312038]" : "text-slate-400"}`} /> Catalog
            </button>
            <button
              onClick={() => setSidebarTab("colors")}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${sidebarTab === "colors" ? "bg-card text-heading shadow-xs font-extrabold" : "text-subtle hover:text-heading"}`}
            >
              <Palette className={`w-3 h-3 ${sidebarTab === "colors" ? "text-[#312038]" : "text-slate-400"}`} /> Colors
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
                  className="px-2.5 py-1.5 rounded-xl bg-[#312038] hover:bg-[#432c4d] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-[#312038]/20 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Component</span>
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
                      ? "bg-slate-100 border-[#312038] text-slate-900 shadow-xs ring-1 ring-[#312038]"
                      : "bg-neutral-50/90 border-default text-subtle hover:border-neutral-300 hover:bg-neutral-100 hover:text-heading shadow-2xs"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-heading truncate">{storeName}</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">Header &amp; Navigation</p>
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
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${isActive ? "bg-slate-100 border-[#312038] text-slate-900 shadow-xs ring-1 ring-[#312038]" : "bg-neutral-50/90 border-default text-subtle hover:border-neutral-300 hover:bg-neutral-100 hover:text-heading shadow-2xs"}`}
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
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Element</span>
                      <h3 className="text-sm font-bold text-heading">Header &amp; Navigation Bar</h3>
                    </div>
                    <button
                      onClick={() => setSidebarTab("sections")}
                      className="text-[10px] text-slate-400 hover:text-white inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Sections</span>
                    </button>
                  </div>

                  {/* Store Name / Brand Logo Text */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Store Brand Name (Logo Text)</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038]"
                      placeholder="e.g. StepCraft Luxury Footwear"
                    />
                  </div>

                  {/* Standard 4-Page Navigation Showcase & Quick Switcher */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-400 font-bold text-xs">Standard Store Pages (4)</label>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                        Centered Navbar
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Every store navbar is streamlined with strictly 4 centered pages with active underline navigation.
                    </p>

                    <div className="space-y-1.5 pt-1">
                      {[
                        { id: "home", name: "Home", desc: "Landing page & hero showcase", Icon: Home, secId: "navbar-header" },
                        { id: "about", name: "About", desc: "AI brand story & craftsmanship", Icon: Info, secId: "about-hero" },
                        { id: "shop", name: "Shop", desc: "Catalog grid, search & filters", Icon: ShoppingBag, secId: "shop-hero" },
                        { id: "contact", name: "Contact", desc: "Phone, WhatsApp & inquiry form", Icon: Phone, secId: "contact-hero" },
                      ].map((page) => (
                        <button
                          key={page.id}
                          onClick={() => {
                            setActivePage(page.id as any);
                            setActiveSectionId(page.secId);
                          }}
                          className={`w-full p-2 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                            activePage === page.id ? "bg-slate-100 border-[#312038] text-slate-900 shadow-xs ring-1 ring-[#312038]/30 font-bold"
                              : "bg-neutral-50/50 hover:bg-neutral-100 border-default text-heading"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-card border border-default text-[#312038] shadow-2xs">
                              <page.Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-bold text-xs">{page.name}</p>
                              <p className="text-[10px] text-subtle">{page.desc}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : activeSectionId === "about-hero" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">About Page</span>
                      <h3 className="text-sm font-bold text-heading">About Hero Banner</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">About</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Badge / Tag Text</label>
                    <input
                      type="text"
                      value={layoutConfig.pages?.about?.hero?.badge || "✨ Our Artisan Heritage"}
                      onChange={(e) => handlePagePropChange("about", "hero", "badge", e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Banner Title</label>
                    <input
                      type="text"
                      value={layoutConfig.pages?.about?.hero?.title || `The Craft of ${storeName}`}
                      onChange={(e) => handlePagePropChange("about", "hero", "title", e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Subtitle / Description</label>
                    <textarea
                      rows={3}
                      value={layoutConfig.pages?.about?.hero?.subtitle || "Born from a passion for handcrafted quality and timeless elegance."}
                      onChange={(e) => handlePagePropChange("about", "hero", "subtitle", e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Banner Background Image URL</label>
                    <input
                      type="text"
                      value={layoutConfig.pages?.about?.hero?.imageUrl || ""}
                      onChange={(e) => handlePagePropChange("about", "hero", "imageUrl", e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038]"
                    />
                  </div>
                </div>
              ) : activeSectionId === "about-story" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">About Page</span>
                      <h3 className="text-sm font-bold text-heading">Brand Heritage Story</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">Story</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Story Title</label>
                    <input
                      type="text"
                      value={layoutConfig.pages?.about?.story?.title || "Handcrafted Devotion"}
                      onChange={(e) => handlePagePropChange("about", "story", "title", e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Story Paragraph 1</label>
                    <textarea
                      rows={3}
                      value={layoutConfig.pages?.about?.story?.paragraphs?.[0] || `${storeName} was founded with a singular conviction: luxury should carry authentic craftsmanship.`}
                      onChange={(e) => {
                        const cur = layoutConfig.pages?.about?.story?.paragraphs || ["", ""];
                        handlePagePropChange("about", "story", "paragraphs", [e.target.value, cur[1] || ""]);
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Story Paragraph 2</label>
                    <textarea
                      rows={3}
                      value={layoutConfig.pages?.about?.story?.paragraphs?.[1] || "We reject synthetic shortcuts. Every detail is engineered to ensure timeless luxury."}
                      onChange={(e) => {
                        const cur = layoutConfig.pages?.about?.story?.paragraphs || ["", ""];
                        handlePagePropChange("about", "story", "paragraphs", [cur[0] || "", e.target.value]);
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Story Image URL</label>
                    <input
                      type="text"
                      value={layoutConfig.pages?.about?.story?.imageUrl || ""}
                      onChange={(e) => handlePagePropChange("about", "story", "imageUrl", e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038]"
                    />
                  </div>
                </div>
              ) : activeSectionId === "about-values" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">About Page</span>
                      <h3 className="text-sm font-bold text-heading">Core Values &amp; Guarantees</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">Pillars</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    These trust and authenticity pillars are automatically highlighted for {storeName} buyers, including COD protection and 7-day easy exchange.
                  </p>
                </div>
              ) : activeSectionId === "shop-hero" || activeSectionId === "shop-catalog" || activePage === "shop" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Shop Page</span>
                      <h3 className="text-sm font-bold text-heading">Shop Catalog Settings</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">Catalog</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Shop Headline</label>
                    <input
                      type="text"
                      value={layoutConfig.pages?.shop?.hero?.title || "Complete Store Catalog"}
                      onChange={(e) => handlePagePropChange("shop", "hero", "title", e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Shop Subtitle</label>
                    <textarea
                      rows={2}
                      value={layoutConfig.pages?.shop?.hero?.subtitle || `Explore the entire collection handcrafted for ${storeName}. Nationwide Cash on Delivery & Escrow.`}
                      onChange={(e) => handlePagePropChange("shop", "hero", "subtitle", e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] resize-none leading-relaxed"
                    />
                  </div>

                  {/* Shop Products & Catalog Controls */}
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-[#312038] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Shop Page Products</span>
                      </label>
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {productsList.length} Active
                      </span>
                    </div>

                    {/* Action Button */}
                    <div className="w-full">
                      <button
                        type="button"
                        onClick={() => setShowCatalogPickerModal(true)}
                        className="w-full p-2.5 rounded-xl bg-[#312038] hover:bg-[#432c4d] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#312038]/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pick from Catalog</span>
                      </button>
                    </div>

                    {/* Quick Add by SKU / ID */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-600 font-bold block">Quick Add to Shop by SKU or ID:</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={skuInput}
                          onChange={(e) => {
                            setSkuInput(e.target.value);
                            if (skuFeedback) setSkuFeedback(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddProductBySkuOrId(skuInput);
                            }
                          }}
                          placeholder={activeNiche === "watches" ? "e.g. BDY-7749 or Watch boy" : activeNiche === "clothing" ? "e.g. BDY-6437 or Cotton Shirt" : "e.g. BDY-1001 or Product Name"}
                          className="flex-1 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-[#312038] focus:bg-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddProductBySkuOrId(skuInput)}
                          className="px-4 py-2 rounded-xl bg-[#312038] hover:bg-[#432c4d] text-white font-extrabold text-xs cursor-pointer active:scale-95 transition-all shadow-sm"
                        >
                          Add
                        </button>
                      </div>
                      {skuFeedback && (
                        <p className={`text-[10px] font-semibold ${skuFeedback.type === "success" ? "text-purple-600" : "text-rose-500"}`}>
                          {skuFeedback.message}
                        </p>
                      )}
                    </div>

                    {/* Active Products List in Shop */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-600 font-bold">
                        <span>Active in Shop Page ({productsList.length})</span>
                        {productsList.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setProductsList([])}
                            className="text-rose-500 hover:text-rose-600 cursor-pointer"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                        {productsList.length > 0 ? (
                          productsList.map((prod, idx) => (
                            <div
                              key={prod.id || idx}
                              className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={prod.image || prod.thumbnail}
                                  alt={prod.name}
                                  className="w-8 h-8 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">{prod.name}</p>
                                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
                                    <span className="font-mono text-slate-400">{prod.sku || prod.id}</span>
                                    <span>•</span>
                                    <span className="font-extrabold text-slate-900">{typeof prod.price === "string" && prod.price.startsWith("$") ? prod.price : `$${typeof prod.price === "number" ? prod.price : parseFloat(String(prod.price).replace(/[^0-9.]/g, "")) || 0}`}</span>
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setProductsList(productsList.filter((_, i) => i !== idx))}
                                className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                                title="Remove from Shop"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs">
                            No products added to shop page yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (activeSectionId === "contact-hero" || activeSectionId === "contact-details" || activeSectionId === "contact-form") ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Contact Page</span>
                      <h3 className="text-sm font-bold text-heading">Vendor Contact &amp; Location</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">Contact</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Contact Page Title</label>
                    <input
                      type="text"
                      value={layoutConfig.pages?.contact?.hero?.title || `Contact ${storeName}`}
                      onChange={(e) => handlePagePropChange("contact", "hero", "title", e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Support Phone Number</label>
                    <input
                      type="text"
                      value={layoutConfig.pages?.contact?.phone || "+92 300 8472910"}
                      onChange={(e) => handlePagePropChange("contact", "", "phone", e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">WhatsApp Number (For Direct Chat Button)</label>
                    <input
                      type="text"
                      value={layoutConfig.pages?.contact?.whatsappNumber || "+92 300 8472910"}
                      onChange={(e) => handlePagePropChange("contact", "", "whatsappNumber", e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Official Email Address</label>
                    <input
                      type="email"
                      value={layoutConfig.pages?.contact?.email || `support@${storeName.toLowerCase().replace(/[^a-z0-9]/g, "")}.pk`}
                      onChange={(e) => handlePagePropChange("contact", "", "email", e.target.value)}
                      placeholder="support@store.com"
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Store / Workshop Address</label>
                    <textarea
                      rows={2}
                      value={layoutConfig.pages?.contact?.address || "Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan"}
                      onChange={(e) => handlePagePropChange("contact", "", "address", e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Operating Hours</label>
                    <input
                      type="text"
                      value={layoutConfig.pages?.contact?.businessHours || "Mon - Sat: 10:00 AM - 9:00 PM | Sunday: Closed"}
                      onChange={(e) => handlePagePropChange("contact", "", "businessHours", e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038]"
                    />
                  </div>
                </div>
              ) : activeSection ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Section</span>
                      <h3 className="text-sm font-bold text-heading">{activeSection.type}</h3>
                    </div>
                    <button
                      onClick={() => setSidebarTab("sections")}
                      className="text-[10px] text-slate-400 hover:text-white inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Sections</span>
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
                        className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038]"
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
                        className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] font-bold"
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
                        className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] resize-none leading-relaxed"
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
                        className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038]"
                      />
                    </div>
                  )}

                  {/* Action Buttons & Links */}
                  {(activeSection.props.ctaText !== undefined || activeSection.props.primaryCtaText !== undefined || activeSection.props.secondaryCtaText !== undefined) && (
                    <div className="p-3.5 rounded-2xl bg-neutral-50 border border-default shadow-2xs space-y-2.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Action Buttons &amp; URLs</span>
                      
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
                            className="w-full p-2 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038]"
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
                            className="w-full p-2 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] font-mono"
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
                              className="w-full p-2 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-semibold block">Secondary URL</label>
                            <input
                              type="text"
                              value={activeSection.props.secondaryCtaLink || "#story"}
                              onChange={(e) => handlePropChange("secondaryCtaLink", e.target.value)}
                              placeholder="e.g. #story"
                              className="w-full p-2 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Background & Button Styling (For Custom Components) */}
                  {(activeSection.props.bgTheme !== undefined || activeSection.type === "CustomComponent") && (
                    <div className="p-3.5 rounded-2xl bg-neutral-50 border border-default shadow-2xs space-y-2.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Layout &amp; Color Theme</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-semibold block">Background Theme</label>
                          <select
                            value={activeSection.props.bgTheme || "slate"}
                            onChange={(e) => handlePropChange("bgTheme", e.target.value)}
                            className="w-full p-2 rounded-lg bg-card border border-default text-heading text-xs focus:border-[#312038]"
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
                            value={activeSection.props.buttonTheme || "purple"}
                            onChange={(e) => handlePropChange("buttonTheme", e.target.value)}
                            className="w-full p-2 rounded-lg bg-card border border-default text-heading text-xs focus:border-[#312038]"
                          >
                            <option value="purple">Royal Purple</option>
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
                            className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 text-[10px] font-bold flex items-center gap-1"
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
                        className="w-full p-2.5 rounded-lg border border-slate-800 bg-card text-heading text-xs focus:outline-none focus:border-[#312038] font-mono"
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
                                className="w-full p-1.5 rounded-lg bg-card border border-default text-heading text-[11px] font-semibold focus:border-[#312038]"
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
                                className="w-full p-1.5 rounded-lg bg-card border border-default text-heading text-[11px] font-semibold focus:border-[#312038]"
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

                  {/* SPECIAL SECTION: PRODUCT GRID PROPS (STORE CATALOG ENGINE) */}
                  {(activeSection.type === "ProductGridFeatured" || activeSection.type.includes("ProductGrid")) && (
                    <div className="pt-3 border-t border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">Section Products ({productsList.length})</span>
                          <span className="text-[10px] text-slate-500">
                            Linked to Store Catalog ({sanitizedCatalog.length} Total)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCatalogPickerModal(true)}
                          className="px-2.5 py-1 rounded-lg bg-[#312038] hover:bg-[#432c4d] text-white font-extrabold text-[11px] flex items-center gap-1 shadow-md shadow-[#312038]/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Pick from Catalog</span>
                        </button>
                      </div>

                      {/* Quick Collection Populator derived dynamically from sanitizedCatalog */}
                      {sanitizedCatalog.length > 0 && (
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold block">Quick Fill by Category (Published Only):</label>
                          <div className="flex flex-wrap gap-1.5 text-[10px]">
                            <button
                              type="button"
                              onClick={() => setProductsList([...sanitizedCatalog.filter((p) => p.status === "published")])}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                            >
                              All Published ({sanitizedCatalog.filter((p) => p.status === "published").length})
                            </button>
                            {Array.from(new Set(sanitizedCatalog.filter((p) => p.status === "published").map((p) => p.category || p.tag).filter(Boolean))).map((catName) => {
                              const count = sanitizedCatalog.filter((p) => (p.category || p.tag) === catName && p.status === "published").length;
                              return (
                                <button
                                  key={catName}
                                  type="button"
                                  onClick={() => {
                                    const filtered = sanitizedCatalog.filter((p) => (p.category || p.tag) === catName && p.status === "published");
                                    setProductsList(filtered);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                                >
                                  {catName} ({count})
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Add by SKU or ID Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold block">Add by Product ID / SKU:</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={skuInput}
                            onChange={(e) => {
                              setSkuInput(e.target.value);
                              if (skuFeedback) setSkuFeedback(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddProductBySkuOrId(skuInput);
                              }
                            }}
                            placeholder={activeNiche === "watches" ? "e.g. BDY-7749 or Watch boy" : activeNiche === "clothing" ? "e.g. BDY-6437 or Cotton Shirt" : "e.g. BDY-1001 or Product Name"}
                            className="flex-1 p-2 rounded-xl bg-card border border-default text-heading text-xs placeholder-slate-500 focus:outline-none focus:border-[#312038] font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddProductBySkuOrId(skuInput)}
                            className="px-4 py-2 rounded-xl bg-[#312038] hover:bg-[#432c4d] text-white font-extrabold text-xs cursor-pointer active:scale-95 transition-all shadow-sm"
                          >
                            Add
                          </button>
                        </div>
                        {skuFeedback && (
                          <p className={`text-[10px] font-semibold ${skuFeedback.type === "success" ? "text-purple-600" : "text-rose-400"}`}>
                            {skuFeedback.message}
                          </p>
                        )}
                      </div>

                      {/* Selected Product items list */}
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {productsList.map((prod, pIdx) => {
                          const catalogMatch = sanitizedCatalog.find((cp) => cp.id === prod.id || (cp.sku && cp.sku === prod.sku));
                          const displayImg = catalogMatch?.image || prod.image;
                          return (
                          <div key={prod.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={displayImg}
                                alt={prod.name}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = getCategoryDefaultImage(prod.category, prod.name);
                                }}
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-xs truncate">{prod.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-slate-900 font-extrabold text-[11px]">{prod.price}</span>
                                  {prod.discount && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 text-[9px] font-bold">
                                      {prod.discount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setProductsList(productsList.filter((_, i) => i !== pIdx))}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove from this section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  )}

                  {/* SPECIAL SECTION: CATEGORY CAROUSEL PROPS (FULL IMAGE & CARD CONTROLS) */}
                  {activeSection.type.includes("Category") && activeSection.props.categories && (
                    <div className="pt-3 border-t border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">Category Cards ({activeSection.props.categories.length})</span>
                          <span className="text-[10px] text-slate-500">Edit titles, photos, and item counts</span>
                        </div>
                        <button
                          onClick={() => {
                            const current = activeSection.props.categories || [];
                            const newCat = {
                              title: `New Collection`,
                              count: `12 items`,
                              image: currentNichePreset.images[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
                              href: "#catalog",
                            };
                            handlePropChange("categories", [...current, newCat]);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#312038] hover:bg-[#432c4d] text-white text-[10px] font-extrabold flex items-center gap-1 shadow"
                        >
                          <Plus className="w-3 h-3" /> Add Category
                        </button>
                      </div>

                      {/* Card Shape Selector */}
                      <div className="space-y-1">
                        <label className="text-slate-500 font-bold block text-[10px]">Card Shape / Style</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handlePropChange("itemShape", "card")}
                            className={`p-2 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer ${
                              (activeSection.props.itemShape || "card") === "card"
                                ? "bg-purple-50 border-[#312038] text-purple-700 font-black shadow-xs"
                                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                            }`}
                          >
                            Rounded Card
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePropChange("itemShape", "circle")}
                            className={`p-2 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer ${
                              activeSection.props.itemShape === "circle"
                                ? "bg-purple-50 border-[#312038] text-purple-700 font-black shadow-xs"
                                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                            }`}
                          >
                            Circular Avatar
                          </button>
                        </div>
                      </div>

                      {/* Category Items List */}
                      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                        {activeSection.props.categories.map((cat: any, cIdx: number) => (
                          <div key={cIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs space-y-2">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={cat.image || cat.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"}
                                alt={cat.title || cat.name}
                                className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0"
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
                                  className="w-full bg-white p-1.5 rounded text-slate-900 text-xs font-bold border border-slate-200 focus:border-[#312038]"
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
                                  className="w-full bg-white p-1 rounded text-slate-700 text-[10px] border border-slate-200"
                                  placeholder="Item count (e.g. 24 items)"
                                />
                              </div>

                              <button
                                onClick={() => {
                                  const up = activeSection.props.categories.filter((_: any, i: number) => i !== cIdx);
                                  handlePropChange("categories", up);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-500"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Category Image Upload & URL */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                              <label className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-bold cursor-pointer text-[10px]">
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
                                className="flex items-center gap-1 text-[#312038] hover:text-[#5A3D63] font-bold text-[10px]"
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
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Store Products Catalog</span>
                  <span className="text-[10px] text-slate-500">{productsList.length} total products</span>
                </div>
                <button
                  onClick={openAddProductModal}
                  className="px-2.5 py-1.5 rounded-xl bg-[#312038] hover:bg-[#432c4d] text-white font-extrabold text-[11px] flex items-center gap-1 shadow-md shadow-[#312038]/20 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Product
                </button>
              </div>

              <div className="space-y-3">
                {productsList.map((prod, pIdx) => (
                  <div key={prod.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getCategoryDefaultImage(prod.category, prod.name);
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{prod.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-900 font-extrabold text-[11px]">{prod.price}</span>
                          {prod.discount && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                              {prod.discount}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditProductModal(prod, pIdx)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                          title="Edit in Modal"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                        </button>
                        <button
                          onClick={() => setProductsList(productsList.filter((_, i) => i !== pIdx))}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                      <label className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-bold cursor-pointer">
                        <Upload className="w-3 h-3" /> Upload PC Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, `product_${pIdx}`)}
                        />
                      </label>
                      <span className="flex items-center gap-1 text-purple-700 font-bold">
                        <ShoppingBag className="w-3 h-3" /> Quick Cart
                      </span>
                      <span className="flex items-center gap-1 text-rose-500 font-bold">
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
              <div className="pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-heading">Typography &amp; Theme Styling</h3>
                <p className="text-[10px] text-slate-400">Change fonts, text colors, background colors, and palettes</p>
              </div>

              {/* 1. Quick 1-Click Luxury Theme Palettes */}
              <div className="space-y-2">
                <label className="text-slate-400 font-bold block">1-Click Luxury Theme Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "Royal Black & Gold", primary: "#171717", secondary: "#D4AF37", bg: "#FFFFFF", text: "#0A0A0A" },
                    { name: "Royal Amethyst & Gold", primary: "#2C1C31", secondary: "#B588C2", bg: "#FFFFFF", text: "#0F172A" },
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
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#312038] text-left space-y-1.5 transition-all cursor-pointer shadow-xs hover:bg-slate-100"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: p.primary }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: p.secondary }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: p.bg }} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-900 block truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Typography Font Families */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Heading Font Family</label>
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
                    className="w-full p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#312038]"
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
                  <label className="text-slate-600 font-bold block mb-1">Body Text Font</label>
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
                    className="w-full p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#312038]"
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
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Primary Brand Color (Buttons &amp; Accents)</label>
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
                      className="w-8 h-8 rounded border border-slate-300 bg-white cursor-pointer"
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
                      className="flex-1 p-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Accent Color (Gold &amp; Badges)</label>
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
                      className="w-8 h-8 rounded border border-slate-300 bg-white cursor-pointer"
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
                      className="flex-1 p-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Store Background Color</label>
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
                      className="w-8 h-8 rounded border border-slate-300 bg-white cursor-pointer"
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
                      className="flex-1 p-2 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Text &amp; Heading Color</label>
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
                      className="w-8 h-8 rounded border border-slate-300 bg-white cursor-pointer"
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

          {/* TAB 5: AI CHAT ASSISTANT (STATE-OF-THE-ART REDESIGNED UI/UX) */}
          {sidebarTab === "ai_chat" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
              {/* Top Bar Header */}
              <div className="p-3.5 bg-white border-b border-slate-200/80 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20 flex-shrink-0">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900">Altrivo Assistant</h3>
                    <p className="text-[10px] text-slate-500 font-medium truncate">
                      Store: <span className="font-semibold text-slate-800">{storeName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSidebarTab("props")}
                    title="Close AI Assistant"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
                {aiChatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`max-w-[92%] p-3.5 rounded-2xl shadow-xs leading-relaxed space-y-2 ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none font-medium shadow-sm shadow-violet-500/10"
                          : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-none shadow-xs"
                      }`}
                    >
                      {msg.role === "ai" && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-violet-600 mb-0.5">
                          <Sparkles className="w-3 h-3" />
                          <span>Altrivo Assistant</span>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {msg.summary && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold mt-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{msg.summary}</span>
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-primary-50 border border-primary-200 text-primary-700 text-xs shadow-xs animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-[11px]">AI is designing...</p>
                      <p className="text-[10px] text-primary-600/80">Updating live storefront layout & content</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Input Area with @ Tagging System */}
              <div className="p-3 bg-white border-t border-slate-200 relative">
                {/* Floating @ Mention Autocomplete Popover */}
                {showMentionMenu && (
                  <div className="absolute bottom-full left-3 right-3 mb-2 bg-white/95 backdrop-blur-md rounded-2xl border border-violet-200/90 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 mb-1.5">
                      <span className="flex items-center gap-1.5 text-violet-700">
                        <AtSign className="w-3.5 h-3.5 text-violet-600" />
                        Select Section to Tag
                      </span>
                      <span className="text-[9px] text-slate-400 font-normal">Click or press Esc</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {mentionOptions.map((opt) => (
                        <button
                          key={opt.tag}
                          type="button"
                          onClick={() => handleInsertTag(opt.tag)}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-violet-50 text-left transition-all group"
                        >
                          <span className="text-base flex-shrink-0">{opt.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-violet-700 group-hover:text-violet-900">
                                @{opt.tag}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-700 truncate">
                                {opt.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">{opt.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAiCommand();
                  }}
                  className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-transparent focus-within:bg-white transition-all shadow-inner"
                >
                  <input
                    type="text"
                    value={aiInput}
                    onChange={handleAiInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setShowMentionMenu(false);
                    }}
                    placeholder="Type @ to tag section (e.g. @hero bg white, @theme gold)..."
                    disabled={isAiLoading}
                    className="flex-1 bg-transparent py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                  {aiInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setAiInput("");
                        setShowMentionMenu(false);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!aiInput.trim() || isAiLoading}
                    className="p-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white disabled:opacity-40 transition-all shadow-sm active:scale-95 flex-shrink-0"
                    title="Send to AI Assistant"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Draggable Vertical Divider Resizer */}
        <div
          onMouseDown={() => setIsDraggingSidebar(true)}
          onDoubleClick={() => setSidebarWidth(380)}
          title="Click & drag to resize sidebar and test store responsiveness. Double-click to reset."
          className={`w-2.5 hover:w-3 cursor-col-resize z-30 flex items-center justify-center select-none group transition-all relative flex-shrink-0 ${
            isDraggingSidebar
              ? "bg-purple-500 shadow-md ring-2 ring-purple-400"
              : "bg-slate-200 hover:bg-[#432c4d] border-x border-slate-300"
          }`}
        >
          <div className="w-1 h-8 rounded-full bg-slate-400 group-hover:bg-slate-950 flex flex-col items-center justify-center gap-0.5 pointer-events-none">
            <span className="w-0.5 h-0.5 rounded-full bg-white" />
            <span className="w-0.5 h-0.5 rounded-full bg-white" />
            <span className="w-0.5 h-0.5 rounded-full bg-white" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. RIGHT MAIN VIEWPORT (LIVE STORE RENDER)                                */}
        {/* ========================================================================= */}
        <div className="flex-1 bg-slate-200/70 overflow-y-auto flex items-start justify-center p-4 sm:p-6">
          <div
            className={`transition-all duration-300 ${
              deviceMode === "mobile"
                ? "w-[385px] max-w-[385px] border-[8px] border-slate-800 rounded-[36px] shadow-2xl overflow-hidden my-4 bg-white ring-1 ring-slate-900/10"
                : deviceMode === "tablet"
                ? "w-[768px] max-w-[768px] border-[10px] border-slate-800 rounded-[28px] shadow-2xl overflow-hidden my-4 bg-white ring-1 ring-slate-900/10"
                : "w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden bg-white"
            }`}
          >
            {/* Live Storefront Component Renderer */}
            <StorefrontRenderer
              config={{
                ...layoutConfig,
                storeName,
                categories: Array.from(new Set((storeCatalogProducts.length > 0 ? storeCatalogProducts : productsList).map((p) => p.category || p.tag).filter(Boolean))).length > 0
                  ? Array.from(new Set((storeCatalogProducts.length > 0 ? storeCatalogProducts : productsList).map((p) => p.category || p.tag).filter(Boolean))).map((c) => ({ name: c, href: "#catalog" }))
                  : layoutConfig.categories || [
                      { name: "All", href: "#catalog" },
                    ],
                socialLinks: [
                  { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
                  { name: "WhatsApp Store", href: "https://wa.me/923001234567", icon: "whatsapp" },
                ],
                pages: layoutConfig.pages,
              } as any}
              products={productsList as any}
              categories={
                Array.from(new Set((storeCatalogProducts.length > 0 ? storeCatalogProducts : productsList).map((p) => p.category || p.tag).filter(Boolean))).length > 0
                  ? Array.from(new Set((storeCatalogProducts.length > 0 ? storeCatalogProducts : productsList).map((p) => p.category || p.tag).filter(Boolean))).map((c) => ({ name: c, href: "#catalog" }))
                  : layoutConfig.sections.find((s) => s.type.includes("Category"))?.props?.categories || []
              }
              deviceMode={deviceMode}
              activePage={activePage}
              onNavigatePage={(pageKey) => {
                setActivePage(pageKey as any);
                if (pageKey === "about") setActiveSectionId("about-hero");
                else if (pageKey === "shop") setActiveSectionId("shop-hero");
                else if (pageKey === "contact") setActiveSectionId("contact-hero");
                else setActiveSectionId("navbar-header");
              }}
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
      {/* 4. STORE CATALOG PRODUCTS PICKER MODAL (LIGHT MODE)                       */}
      {/* ========================================================================= */}
      {showCatalogPickerModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl text-slate-900 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#312038]" />
                  <span>Pick Products from Store Catalog ({sanitizedCatalog.length} Total)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select which verified products from {storeName} to display in this storefront section.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCatalogPickerModal(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Filter Bar: Category Tabs + Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Category Pills dynamically generated from sanitizedCatalog */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
                {[
                  { id: "all", label: `All (${sanitizedCatalog.length})` },
                  ...Array.from(new Set(sanitizedCatalog.map((p) => p.category || p.tag).filter(Boolean))).map((cat) => ({
                    id: String(cat),
                    label: String(cat),
                  })),
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCatalogFilterCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex-shrink-0 ${
                      catalogFilterCategory.toLowerCase() === tab.id.toLowerCase()
                        ? "bg-[#312038] text-white shadow-sm font-bold"
                        : "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
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
                  placeholder="Search store products by title, SKU, or category..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#312038] focus:bg-white focus:ring-2 focus:ring-[#312038]/10 transition-all"
                />
              </div>
            </div>

            {/* Quick Actions Counter */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="font-bold text-[#312038]">
                {productsList.filter((p) => p.status !== "draft").length} products currently active in this section
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProductsList([...sanitizedCatalog.filter((p) => p.status === "published")]);
                  }}
                  className="text-[11px] text-primary-600 hover:text-primary-700 font-bold cursor-pointer"
                >
                  Select All Published ({sanitizedCatalog.filter((p) => p.status === "published").length})
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setProductsList([])}
                  className="text-[11px] text-rose-500 hover:text-rose-600 font-bold cursor-pointer"
                >
                  Clear Section
                </button>
              </div>
            </div>

            {/* Store Products Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-1 max-h-[55vh]">
              {sanitizedCatalog
                .filter((p) => {
                  const cat = p.category || p.tag || "";
                  const matchCat =
                    catalogFilterCategory === "all" || cat.toLowerCase() === catalogFilterCategory.toLowerCase();
                  const matchQuery =
                    !catalogSearchQuery.trim() ||
                    (p.name && p.name.toLowerCase().includes(catalogSearchQuery.toLowerCase())) ||
                    (p.sku && p.sku.toLowerCase().includes(catalogSearchQuery.toLowerCase())) ||
                    (cat && cat.toLowerCase().includes(catalogSearchQuery.toLowerCase()));
                  return matchCat && matchQuery;
                })
                .map((item) => {
                  const isDraft = item.status === "draft";
                  const isSelected = !isDraft && productsList.some((p) => p.id === item.id || (p.sku && item.sku && p.sku === item.sku));
                  const displayPrice = typeof item.price === "string" && item.price.startsWith("$")
                    ? item.price
                    : `$${typeof item.price === "number" ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0}`;

                  const resolvedItemImg =
                    (isValidImageUrl(item.thumbnail) && item.thumbnail) ||
                    (isValidImageUrl(item.image) && item.image) ||
                    (Array.isArray(item.images) && item.images.find((img: string) => isValidImageUrl(img))) ||
                    getCategoryDefaultImage(item.category || item.tag, item.name);

                  return (
                    <div
                      key={item.id || item.sku}
                      onClick={() => {
                        if (isDraft) {
                          alert(`"${item.name}" is currently a Draft product. Draft products cannot be added to storefront sections. Please publish this product in the Products tab first.`);
                          return;
                        }
                        handleToggleProductFromCatalog(item);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all select-none ${
                        isDraft
                          ? "bg-slate-50/60 border-slate-200 border-dashed opacity-80 cursor-not-allowed"
                          : isSelected
                          ? "bg-purple-50/70 border-[#312038] shadow-xs ring-1 ring-[#312038]/30 cursor-pointer"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-xs cursor-pointer"
                      }`}
                      title={isDraft ? "Draft products cannot be added to storefront sections until published" : undefined}
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        <img
                          src={resolvedItemImg}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getCategoryDefaultImage(item.category || item.tag, item.name);
                          }}
                        />
                        {isSelected && !isDraft && (
                          <div className="absolute inset-0 bg-[#312038]/70 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                            {item.category || item.tag}
                          </span>
                          {item.sku && (
                            <span className="text-[9px] font-mono text-slate-400 ml-auto font-bold">
                              {item.sku}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-slate-900 text-xs truncate mt-0.5">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-900 font-extrabold text-xs">
                            {displayPrice}
                          </span>
                          {item.discount && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold">
                              {item.discount}
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ml-auto ${
                            isDraft
                              ? "bg-slate-200/80 border border-slate-300 text-slate-600"
                              : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                          }`}>
                            {isDraft ? "Draft" : "Published"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {sanitizedCatalog.length === 0 && (
                <div className="col-span-full py-12 text-center space-y-3">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-slate-900 font-bold text-sm">No products found in this store's catalog</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Products added in your store inventory will automatically appear here.
                  </p>
                </div>
              )}

              {sanitizedCatalog.length > 0 &&
                sanitizedCatalog.filter((p) => {
                  const cat = p.category || p.tag || "";
                  const matchCat =
                    catalogFilterCategory === "all" || cat.toLowerCase() === catalogFilterCategory.toLowerCase();
                  const matchQuery =
                    !catalogSearchQuery.trim() ||
                    (p.name && p.name.toLowerCase().includes(catalogSearchQuery.toLowerCase())) ||
                    (p.sku && p.sku.toLowerCase().includes(catalogSearchQuery.toLowerCase())) ||
                    (cat && cat.toLowerCase().includes(catalogSearchQuery.toLowerCase()));
                  return matchCat && matchQuery;
                }).length === 0 && (
                  <div className="col-span-full py-10 text-center space-y-2 text-slate-500 text-xs">
                    <p>No products match your filter or search query.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogFilterCategory("all");
                        setCatalogSearchQuery("");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Changes take effect in visual canvas immediately.
              </span>
              <button
                type="button"
                onClick={() => setShowCatalogPickerModal(false)}
                className="px-6 py-2.5 rounded-xl bg-[#312038] hover:bg-[#432c4d] text-white font-black text-xs shadow-md shadow-[#312038]/20 active:scale-95 transition-all cursor-pointer"
              >
                Apply Selection ({productsList.length} Items)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. VISUAL COMPONENT CATALOG MODAL WITH DIAGRAMS & WIREFRAMES (LIGHT MODE) */}
      {/* ========================================================================= */}
      {showComponentCatalogModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl text-slate-900 max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-[#312038]" />
                  Visual Component Blueprint Catalog
                </h2>
                <p className="text-xs text-slate-500">
                  Select a section component or generate one with AI. See exact visual wireframe diagram before adding to your store.
                </p>
              </div>
              <button
                onClick={() => setShowComponentCatalogModal(false)}
                className="text-slate-400 hover:text-slate-800 text-sm font-bold p-2 cursor-pointer transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* AI Component Generator Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#312038] text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">AI Component Studio Generator</h3>
                    <p className="text-[10px] text-slate-600">Type what section you want, and AI will generate and add it matching your store niche</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-purple-800 border border-purple-300 text-[10px] font-bold shadow-2xs">
                  Active Niche: {currentNichePreset.name}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiComponentPrompt}
                  onChange={(e) => setAiComponentPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleGenerateAiComponent();
                    }
                  }}
                  placeholder={`e.g. Create a ${activeNiche === 'watches' ? 'luxury automatic chronograph showcase with dual CTA buttons' : 'festive designer pret banner with coupon discount chip'}...`}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#312038] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleGenerateAiComponent}
                  disabled={!aiComponentPrompt.trim() || isGeneratingComponent}
                  className="px-4 py-2.5 rounded-xl bg-[#5A3D63] hover:bg-[#4A3252] text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-sm active:scale-95 cursor-pointer flex-shrink-0"
                >
                  {isGeneratingComponent ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Generate with AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-slate-500 font-semibold">Suggested for {currentNichePreset.name}:</span>
                {(activeNiche === "clothing" || activeNiche === "fashion"
                  ? [
                      "Luxury Pret Designer Showcase",
                      "Summer Clearance 25% OFF Banner",
                      "Master Tailors Heritage Story",
                      "Formal Oxford Shirts Split Hero",
                    ]
                  : activeNiche === "watches"
                  ? [
                      "Automatic Chronograph Split Showcase",
                      "Sapphire Crystal 100m Guarantee",
                      "Swiss Horology Heritage Story",
                      "Gold Edition VIP Collectors Banner",
                    ]
                  : [
                      "Limited Edition Flash Sale Banner",
                      "Brand Story & Artisan Craftsmanship",
                      "Featured Flagship Product Spotlight",
                    ]
                ).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setAiComponentPrompt(chip)}
                    className="px-2 py-0.5 rounded-lg bg-white/90 hover:bg-white border border-slate-200 hover:border-purple-400 text-slate-700 hover:text-purple-700 text-[10px] font-medium transition-all shadow-2xs cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Component Cards Grid in Light Mode */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pr-1">
              {VISUAL_COMPONENT_CATALOG.map((item) => (
                <div
                  key={item.type}
                  className="p-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold">
                        {item.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.type}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#312038] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>

                    {/* Visual Diagram */}
                    <div className="pt-2">{item.diagram}</div>
                  </div>

                  <button
                    onClick={() => addComponentFromCatalog(item)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#432c4d] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
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
      {/* 6. AI IMAGE SELECTOR MODAL (LIGHT MODE)                                   */}
      {/* ========================================================================= */}
      {showImagePickerFor && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#312038]" />
                <h3 className="text-base font-bold text-slate-900">AI High-Res Image Suggestions ({currentNichePreset.name})</h3>
              </div>
              <button
                onClick={() => setShowImagePickerFor(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Click any photo to instantly apply, or upload your own photo from your computer.
            </p>

            {/* AI Image Prompt Generator Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900">
                <Wand2 className="w-4 h-4 text-violet-600 animate-pulse" />
                <span>AI Photo Generator (Studio Diffusion & DALL-E)</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiImagePrompt}
                  onChange={(e) => setAiImagePrompt(e.target.value)}
                  placeholder="e.g. Handmade Royal Oxford shoes on polished wood..."
                  className="flex-1 p-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                />
                <button
                  type="button"
                  onClick={handleGenerateCustomAiImage}
                  disabled={!aiImagePrompt.trim() || isGeneratingAiImg}
                  className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all active:scale-95 cursor-pointer shadow-xs"
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
            <div className="p-3.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#312038] bg-slate-50 hover:bg-slate-100/80 text-center space-y-1 transition-all">
              <label className="cursor-pointer block">
                <Upload className="w-5 h-5 text-[#312038] mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-900 block">📁 Upload Image from PC / Drive</span>
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
                  className="group rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-[#312038] transition-all bg-white shadow-xs"
                >
                  <div className="h-28 overflow-hidden relative">
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-2 bg-white border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-800 truncate">{img.label}</p>
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
