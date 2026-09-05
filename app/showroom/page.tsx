"use client";

import React from "react";
import { CartProvider } from "@/components/sections/CartContext";
import CartDrawer from "@/components/sections/CartDrawer";
import HeaderStandard from "@/components/sections/HeaderStandard";
import FooterDetailed from "@/components/sections/FooterDetailed";
import HeroSplitImage from "@/components/sections/HeroSplitImage";
import HeroCenteredOverlay from "@/components/sections/HeroCenteredOverlay";
import HeroBrokenGrid from "@/components/sections/HeroBrokenGrid";
import HeroBento from "@/components/sections/HeroBento";
import HeroDiagonal from "@/components/sections/HeroDiagonal";
import HeroDepthStack from "@/components/sections/HeroDepthStack";
import HeroMarquee from "@/components/sections/HeroMarquee";
import HeroStaggerReveal from "@/components/sections/HeroStaggerReveal";
import HeroGradientBlobs from "@/components/sections/HeroGradientBlobs";
import HeroGradientConic from "@/components/sections/HeroGradientConic";
import HeroGradientRoute from "@/components/sections/HeroGradientRoute";
import HeroSlideshowKenBurns from "@/components/sections/HeroSlideshowKenBurns";
import HeroSlideshowSplit from "@/components/sections/HeroSlideshowSplit";
import HeroSlideshowPortal from "@/components/sections/HeroSlideshowPortal";
import HeroKinetic from "@/components/sections/HeroKinetic";
import HeroReveal from "@/components/sections/HeroReveal";
import PromoBanner from "@/components/sections/PromoBanner";
import FeatureGrid from "@/components/sections/FeatureGrid";
import ProductGridFeatured from "@/components/sections/ProductGridFeatured";
import ProductSingleFocus from "@/components/sections/ProductSingleFocus";
import CategoryCarousel from "@/components/sections/CategoryCarousel";
import CategoryCarouselNativeSnap from "@/components/sections/CategoryCarouselNativeSnap";
import CategoryCarouselDrag from "@/components/sections/CategoryCarouselDrag";
import CategoryCarouselCenterEmphasis from "@/components/sections/CategoryCarouselCenterEmphasis";
import CategoryCarouselAutoplay from "@/components/sections/CategoryCarouselAutoplay";
import CategoryCarouselInfinite from "@/components/sections/CategoryCarouselInfinite";
import TestimonialSlider from "@/components/sections/TestimonialSlider";
import TestimonialSliderCrossfade from "@/components/sections/TestimonialSliderCrossfade";
import TestimonialSliderMultiCard from "@/components/sections/TestimonialSliderMultiCard";
import TestimonialSliderVideo from "@/components/sections/TestimonialSliderVideo";
import BrandStory from "@/components/sections/BrandStory";
import BrandStoryZigZag from "@/components/sections/BrandStoryZigZag";
import BrandStoryTimeline from "@/components/sections/BrandStoryTimeline";
import BrandStoryStickyChapter from "@/components/sections/BrandStoryStickyChapter";
import NewsletterSignup from "@/components/sections/NewsletterSignup";
import NewsletterSignupInline from "@/components/sections/NewsletterSignupInline";
import NewsletterSignupModal from "@/components/sections/NewsletterSignupModal";
import NewsletterSignupProgressive from "@/components/sections/NewsletterSignupProgressive";
import NewsletterSignupSticky from "@/components/sections/NewsletterSignupSticky";
import ProductCard from "@/components/sections/ProductCard";
import ProductCardElevate from "@/components/sections/ProductCardElevate";
import ProductCardZoom from "@/components/sections/ProductCardZoom";
import ProductCard3DTilt from "@/components/sections/ProductCard3DTilt";
import ProductCardFlip from "@/components/sections/ProductCardFlip";
import ProductCardSlideActions from "@/components/sections/ProductCardSlideActions";
import ProductCardMagnetic from "@/components/sections/ProductCardMagnetic";
import ProductGridStaggered from "@/components/sections/ProductGridStaggered";
import ProductCardSkeleton from "@/components/sections/ProductCardSkeleton";
import ProductSingleFocusSplitScroll from "@/components/sections/ProductSingleFocusSplitScroll";
import ProductSingleFocusGallery from "@/components/sections/ProductSingleFocusGallery";
import ProductSingleFocusZoom from "@/components/sections/ProductSingleFocusZoom";
import ProductSingleFocus360 from "@/components/sections/ProductSingleFocus360";
import ProductSingleFocusVariantSwap from "@/components/sections/ProductSingleFocusVariantSwap";
import ProductSingleFocusStickyBar from "@/components/sections/ProductSingleFocusStickyBar";

// Mock database lists
const MOCK_PRODUCTS = [
  { id: "p1", name: "Premium Terracotta Vase", price: "₨ 8,900", originalPrice: "₨ 11,000", rating: 4.9, reviewsCount: 42, category: "Decor", inStock: true, badge: "Best Seller", image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=300" },
  { id: "p2", name: "Abstract Sunrise Canvas Painting", price: "₨ 34,000", originalPrice: "₨ 40,000", rating: 5.0, reviewsCount: 28, category: "Art", inStock: true, badge: "Featured", image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300" },
  { id: "p3", name: "Handcrafted Oak Table Lamp", price: "₨ 12,500", originalPrice: "₨ 15,000", rating: 4.8, reviewsCount: 19, category: "Lighting", inStock: true, badge: "Low Stock", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300" },
  { id: "p4", name: "Genuine Leather Sketchbook", price: "₨ 4,800", originalPrice: "₨ 6,000", rating: 4.9, reviewsCount: 64, category: "Stationery", inStock: true, badge: "New", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=300" }
];

const MOCK_CATEGORIES = [
  { id: "c1", name: "Ceramics & Decor", icon: "🏺", href: "#decor", imageUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=200" },
  { id: "c2", name: "Fine Art Paintings", icon: "🎨", href: "#art", imageUrl: "https://images.unsplash.com/photo-1579783922619-2215db746c5a?w=200" },
  { id: "c3", name: "Artisan Lighting", icon: "💡", href: "#lighting", imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200" },
  { id: "c4", name: "Genuine Leather", icon: "🧶", href: "#leather", imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=200" }
];

const MOCK_TESTIMONIALS = [
  { id: "t1", name: "Zainab Ahmed", text: "Stunning quality, the craftsmanship is incredible! Highly recommended.", rating: 5, role: "Verified Buyer" },
  { id: "t2", name: "Bilal Khan", text: "Fast TCS express delivery and the escrow option gave me complete peace of mind.", rating: 5, role: "Verified Buyer" },
  { id: "t3", name: "Saira Yusuf", text: "Excellent customer service. The terracotta vase looks even better in person.", rating: 4.8, role: "Collector" }
];

const MOCK_FEATURES = [
  { icon: "shield", title: "Secure Checkout", description: "100% buyer escrow protection on every order" },
  { icon: "truck", title: "Cash on Delivery", description: "Nationwide express COD courier shipping" },
  { icon: "exchange", title: "Easy Returns", description: "Hassle-free 7 days product exchange window" },
  { icon: "sparkles", title: "Artisan Care", description: "Direct support from crafting network" }
];

export default function ShowroomPage() {
  return (
    <CartProvider>
      <div 
        className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans select-none"
        style={{
          "--color-primary": "#694873",
          "--color-secondary": "#d97706",
          "--color-bg": "#ffffff",
          "--color-text": "#1e293b",
          "--font-heading": "Plus Jakarta Sans",
          "--font-body": "Inter",
        } as React.CSSProperties}
      >
        {/* Navigation jump menu */}
        <div className="bg-slate-900 text-white py-4 px-6 sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-sm font-black tracking-tight">Component Showroom</h1>
              <p className="text-[10px] text-slate-400">Previewing all 15 dynamic storefront components in isolation</p>
            </div>
            
            <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-wider">
              <a href="#headers" className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700">Headers</a>
              <a href="#promos" className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700">Promos</a>
              <a href="#heroes" className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700">Heroes</a>
              <a href="#features" className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700">Features</a>
              <a href="#products" className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700">Products</a>
              <a href="#testimonials" className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700">Reviews</a>
              <a href="#story" className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700">Stories</a>
              <a href="#newsletter" className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700">Forms</a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
          
          {/* Group 1: Headers & Announcement ribbons */}
          <section id="headers" className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2">Global Headers</h2>
            
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs relative">
              <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">HeaderStandard</span>
              <HeaderStandard 
                logoText="ARTRIVO LUXURY" 
                navigation={[{ name: "All Products", href: "#" }, { name: "Decor", href: "#" }, { name: "Canvas Art", href: "#" }]} 
              />
            </div>
          </section>

          <section id="promos" className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2">Promo Banners</h2>
            
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs space-y-4">
              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">PromoBanner (Announcement Ribbon)</span>
                <PromoBanner campaignId="campaign-ribbon-show" messages={["Exclusive Summer Drop Live! Apply code SUMMER26 for 10% off.", "Get free nationwide cash on delivery checkout today."]} />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">PromoBanner (Urgent Expiry Countdown Style)</span>
                <PromoBanner campaignId="campaign-countdown-show" messages={["Flash discount code: SALE15 for 15% off total order!"]} expiresAt="2026-08-31T23:59:59Z" variant="urgent" position="static" />
              </div>
            </div>
          </section>

          {/* Group 2: Hero Banners */}
          <section id="heroes" className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2">Hero Banners (All 8 Layout Variations)</h2>
            
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs space-y-8 divide-y divide-slate-100">
              
              {/* 1. Legacy Split Image */}
              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">1. HeroSplitImage (Side Split)</span>
                <HeroSplitImage 
                  title="Crafted Terracotta Ceramics" 
                  subtitle="Collect premium hand-thrown clay vases designed by master artisans."
                  ctaText="Browse Art"
                  ctaLink="#catalog"
                  imageUrl="https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600"
                  imageAlignment="right"
                />
              </div>

              {/* 2. Legacy Centered Overlay */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">2. HeroCenteredOverlay (Cinematic Vignette)</span>
                <HeroCenteredOverlay 
                  title="Contemporary Oil Paintings" 
                  subtitle="Transform your home aesthetic with original gold leaf abstract canvas collections."
                  ctaText="Explore Fine Art"
                  ctaLink="#catalog"
                  backgroundImageUrl="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800"
                  overlayOpacity={0.4}
                />
              </div>

              {/* 3. Asymmetric Broken Grid */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">3. HeroBrokenGrid (Asymmetric Overlapping Solid Layout)</span>
                <HeroBrokenGrid
                  headline="Artisanal Broken Grids"
                  subtext="Diagonal visual flow containing overlapping left/bottom entrance animations, using a single background color."
                  bgColor="#f8fafc"
                />
              </div>

              {/* 4. Bento Dashboard grid */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">4. HeroBento (Bento Grid with bobbing cards)</span>
                <HeroBento
                  headline="Bento Value Boards"
                  subtext="Asymmetric card dashboard containing continuous floating keyframe translate loops."
                  bgColor="#f1f5f9"
                />
              </div>

              {/* 5. Diagonal split clip-path */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">5. HeroDiagonal (CSS Clip-Path Skewed Regions)</span>
                <HeroDiagonal
                  headline="Diagonal Divide Panels"
                  subtext="Swappable color regions separated by skewed boundaries that collapse cleanly on mobile layouts."
                  primaryColor="#0f172a"
                  secondaryColor="#0d9488"
                />
              </div>

              {/* 6. Deck stack layers */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">6. HeroDepthStack (Deck stack layer tilt)</span>
                <HeroDepthStack
                  headline="Rotated Depth Deck"
                  subtext="Interactive cards stacked around text blocks that offset dynamically matching cursor coordinates."
                  bgColor="#fafafa"
                />
              </div>

              {/* 7. Marquee loop */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">7. HeroMarquee (Seamless scrolling band loop)</span>
                <HeroMarquee
                  headline="Scrolling Feature Band"
                  subtext="Seamless ticker ribbons continuously scrolling items left, pausing on active hover states."
                  bgColor="#ffffff"
                />
              </div>

              {/* 8. Multi-reveal reveals */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">8. HeroStaggerReveal (Multi-directional offset entry fades)</span>
                <HeroStaggerReveal
                  headline="Multi-Directional Reveal"
                  subtext="Elements entering from top, bottom, left, and right coordinates using snappy cubic delays."
                  bgColor="#f8fafc"
                />
              </div>

              {/* 9. Gradient Blobs */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">9. HeroGradientBlobs (GPU-optimized soft drifting divs with mouse drift)</span>
                <HeroGradientBlobs
                  title="Layered Blob Atmosphere"
                  subtitle="2-3 large soft-edged shapes with unsynced translate animations and pointer spring-reactive drifts."
                  colors={["#0c4a6e", "#047857", "#4338ca"]}
                />
              </div>

              {/* 10. Gradient Conic */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">10. HeroGradientConic (Performance-optimized slow rotating conic backdrop)</span>
                <HeroGradientConic
                  title="Spindown Conic Atmosphere"
                  subtitle="A rotating conic-gradient backdrop spin sequence behind a blur shield, cheaper to render."
                  colors={["#a855f7", "#ec4899", "#3b82f6"]}
                />
              </div>

              {/* 11. Gradient Route */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">11. HeroGradientRoute (CSS custom variables palette transitions)</span>
                <HeroGradientRoute
                  title="Seamless Variable Transitions"
                  subtitle="Transitioning underlying custom properties rather than re-mounting components when category themes shift."
                />
              </div>

              {/* 12. Slideshow Ken Burns */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">12. HeroSlideshowKenBurns (Slow alternating Ken Burns zoom drifts)</span>
                <HeroSlideshowKenBurns
                  title="Indus Valley Chronicles"
                  subtitle="Slow ambient photographic crossfades with randomized panning origins and preloading queues."
                  images={[
                    { src: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800", alt: "Terracotta craftsmanship" },
                    { src: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800", alt: "Loom weavers detail" },
                    { src: "https://images.unsplash.com/photo-1565192647048-f997ee879ab8?w=800", alt: "Artisan clay kilns" }
                  ]}
                />
              </div>

              {/* 13. Slideshow Split */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">13. HeroSlideshowSplit (Split column image galleries and text sliders)</span>
                <HeroSlideshowSplit
                  items={[
                    { src: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800", alt: "Vase", title: "Indus Craft Kilns", description: "Every ceramic is handmade by Indus artisans using ancient glazing secrets." },
                    { src: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800", alt: "Loom", title: "Handspun Heritage Weaves", description: "Each rug and pillow utilizes raw local wool hand-dyed with vegetable extracts." }
                  ]}
                />
              </div>

              {/* 14. Slideshow Portal */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">14. HeroSlideshowPortal (Circular visual portals and thumb navigation)</span>
                <HeroSlideshowPortal
                  items={[
                    { src: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800", alt: "Vase", title: "Circular Ceramic Portals", description: "View our master collections through masked focus layers." },
                    { src: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800", alt: "Loom", title: "Loom Detail Portals", description: "Interactive thumbnails trigger instant crossfades." }
                  ]}
                />
              </div>

              {/* 15. Kinetic Typography */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">15. HeroKinetic (Staggered Words and Width-Stable Rotator)</span>
                <HeroKinetic
                  variant="stagger"
                  headlineParts={["Direct Escrow Protection", "Connecting Authentic Kilns", "And Rug Weavers for"]}
                  rotatingWords={["potters", "weavers", "carvers", "designers"]}
                />
              </div>

              {/* 16. Kinetic Typewriter */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">16. HeroKinetic (Monospace Blinking Caret Typewriter Layout)</span>
                <HeroKinetic
                  variant="typewriter"
                  headlineParts={["Bringing Heritage Craft Directly to Your Doorstep."]}
                  rotatingWords={[]}
                />
              </div>

              {/* 17. Timed Reveal Hero */}
              <div className="pt-8">
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">17. HeroReveal (Sequenced Entrance Reveals and Overlapping Mockups)</span>
                <HeroReveal
                  eyebrow="Special Edition Carpets"
                  headline="Handmade Woolen Rugs from Peshawar"
                  subtext="Each piece takes up to six months of meticulous weaving by master craft guilds using premium handspun organic wool."
                  ctaText="Explore Peshawar Drops"
                />
              </div>

            </div>
          </section>

          {/* Group 3: Features */}
          <section id="features" className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2">Store Benefit Policies</h2>
            
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs space-y-8">
              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">FeatureGrid (Grid Features with outline path drawing icons)</span>
                <FeatureGrid layout="features" features={MOCK_FEATURES} featuredIndex={1} />
              </div>
              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">FeatureGrid (Sequential Steps Chronology Layout)</span>
                <FeatureGrid layout="steps" features={MOCK_FEATURES.slice(0, 3)} />
              </div>
            </div>
          </section>

          {/* Group 4: Product Catalog elements */}
          <section id="products" className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2">Product Catalog & listing components</h2>
            
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs space-y-8">
              
              {/* Product Card Variations Showcase */}
              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">Product Card Interaction Variations</span>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 mb-2 uppercase">1. Elevate</span>
                    <ProductCardElevate {...MOCK_PRODUCTS[0]} />
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 mb-2 uppercase">2. Zoom</span>
                    <ProductCardZoom {...MOCK_PRODUCTS[0]} />
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 mb-2 uppercase">3. 3D Tilt</span>
                    <ProductCard3DTilt {...MOCK_PRODUCTS[0]} />
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 mb-2 uppercase">4. 3D Flip</span>
                    <ProductCardFlip {...MOCK_PRODUCTS[0]} />
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 mb-2 uppercase">5. Slide Actions</span>
                    <ProductCardSlideActions {...MOCK_PRODUCTS[0]} />
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 mb-2 uppercase">6. Magnetic</span>
                    <ProductCardMagnetic {...MOCK_PRODUCTS[0]} />
                  </div>
                </div>
              </div>

              {/* Product Card Skeleton Showcase */}
              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">ProductCardSkeleton (Pulsing Load States)</span>
                <div className="p-6 max-w-xs">
                  <ProductCardSkeleton />
                </div>
              </div>

              {/* Product Grid Staggered Showcase */}
              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">ProductGridStaggered (Staggered Viewport Entrance)</span>
                <ProductGridStaggered title="Staggered Viewport Grid" products={MOCK_PRODUCTS} cardType="zoom" />
              </div>

              {/* Product Grid featured */}
              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">ProductGridFeatured (Catalog Grid)</span>
                <ProductGridFeatured title="Trending Artisan Crafts" products={MOCK_PRODUCTS} columns={4} />
              </div>

              {/* Product Single Focus Variations */}
              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">1. ProductSingleFocus (Legacy Layout)</span>
                <ProductSingleFocus 
                  id={MOCK_PRODUCTS[1].id}
                  name={MOCK_PRODUCTS[1].name}
                  price={MOCK_PRODUCTS[1].price}
                  imageUrl={MOCK_PRODUCTS[1].image}
                  description="Handcrafted vintage abstract painting with rich oil finishes and gold leaf highlights."
                  badgeText="Featured Spotlight"
                  options={[
                    { name: "Size", values: ["Small (12x12)", "Medium (18x18)", "Large (24x24)"] },
                    { name: "Color", values: ["Sunset Gold", "Azure Blue", "Emerald Jade"] }
                  ]}
                />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">2. ProductSingleFocusSplitScroll (Sticky Gallery with Scrolling Details)</span>
                <ProductSingleFocusSplitScroll 
                  id={MOCK_PRODUCTS[1].id}
                  name={MOCK_PRODUCTS[1].name}
                  price={MOCK_PRODUCTS[1].price}
                  imageUrl={MOCK_PRODUCTS[1].image}
                  description="Handcrafted vintage abstract painting with rich oil finishes and gold leaf highlights."
                  badgeText="Sticky Split Column"
                  options={[
                    { name: "Size", values: ["Small (12x12)", "Medium (18x18)", "Large (24x24)"] },
                    { name: "Color", values: ["Sunset Gold", "Azure Blue", "Emerald Jade"] }
                  ]}
                />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">3. ProductSingleFocusGallery (Thumbnail Rail with Crossfade Transitions)</span>
                <ProductSingleFocusGallery 
                  id={MOCK_PRODUCTS[1].id}
                  name={MOCK_PRODUCTS[1].name}
                  price={MOCK_PRODUCTS[1].price}
                  imageUrl={MOCK_PRODUCTS[1].image}
                  description="Handcrafted vintage abstract painting with rich oil finishes and gold leaf highlights."
                  badgeText="Crossfade Rail"
                  options={[
                    { name: "Size", values: ["Small (12x12)", "Medium (18x18)", "Large (24x24)"] },
                    { name: "Color", values: ["Sunset Gold", "Azure Blue", "Emerald Jade"] }
                  ]}
                />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">4. ProductSingleFocusZoom (Cursor-Following Magnification Lens)</span>
                <ProductSingleFocusZoom 
                  id={MOCK_PRODUCTS[1].id}
                  name={MOCK_PRODUCTS[1].name}
                  price={MOCK_PRODUCTS[1].price}
                  imageUrl={MOCK_PRODUCTS[1].image}
                  description="Handcrafted vintage abstract painting with rich oil finishes and gold leaf highlights."
                  badgeText="Hover Zoom Lens"
                  options={[
                    { name: "Size", values: ["Small (12x12)", "Medium (18x18)", "Large (24x24)"] },
                    { name: "Color", values: ["Sunset Gold", "Azure Blue", "Emerald Jade"] }
                  ]}
                />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">5. ProductSingleFocus360 (Drag-to-Spin 3D Vector Clay Jar Canvas)</span>
                <ProductSingleFocus360 
                  id={MOCK_PRODUCTS[1].id}
                  name={MOCK_PRODUCTS[1].name}
                  price={MOCK_PRODUCTS[1].price}
                  imageUrl={MOCK_PRODUCTS[1].image}
                  description="Interactive wireframe vector rendering displaying active coordinate drag rotates."
                  badgeText="360 Interactive Spin"
                  options={[
                    { name: "Size", values: ["Small (12x12)", "Medium (18x18)", "Large (24x24)"] },
                    { name: "Color", values: ["Sunset Gold", "Azure Blue", "Emerald Jade"] }
                  ]}
                />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">6. ProductSingleFocusVariantSwap (Synced swatch transitions)</span>
                <ProductSingleFocusVariantSwap 
                  id={MOCK_PRODUCTS[1].id}
                  name={MOCK_PRODUCTS[1].name}
                  price={MOCK_PRODUCTS[1].price}
                  imageUrl={MOCK_PRODUCTS[1].image}
                  description="Swatches updating image crossfades and quick text opacity updates simultaneously."
                  badgeText="Swatch Sync Shifts"
                  options={[
                    { name: "Size", values: ["Small (12x12)", "Medium (18x18)", "Large (24x24)"] },
                    { name: "Color", values: ["Sunset Gold", "Azure Blue", "Emerald Jade"] }
                  ]}
                />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">7. ProductSingleFocusStickyBar (Collapsing floating Cart header)</span>
                <ProductSingleFocusStickyBar 
                  id={MOCK_PRODUCTS[1].id}
                  name={MOCK_PRODUCTS[1].name}
                  price={MOCK_PRODUCTS[1].price}
                  imageUrl={MOCK_PRODUCTS[1].image}
                  description="Condensed floating cta bar that slides down from top coordinates once original trigger sentinel is scrolled past."
                  badgeText="Sentinel Sticky Bar"
                  options={[
                    { name: "Size", values: ["Small (12x12)", "Medium (18x18)", "Large (24x24)"] },
                    { name: "Color", values: ["Sunset Gold", "Azure Blue", "Emerald Jade"] }
                  ]}
                />
              </div>

              {/* Category Carousel Variations */}
              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">1. CategoryCarousel (Legacy Layout)</span>
                <CategoryCarousel title="Browse Handcrafted Categories" categories={MOCK_CATEGORIES} itemShape="card" />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">2. CategoryCarouselNativeSnap (Native Snap Scroll & Progress Indicators)</span>
                <CategoryCarouselNativeSnap title="Native Snapping Scroll" categories={MOCK_CATEGORIES} itemShape="card" />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">3. CategoryCarouselDrag (Desktop Mouse-Drag Grab Snapping)</span>
                <CategoryCarouselDrag title="Desktop Grab Drag Snap" categories={MOCK_CATEGORIES} itemShape="card" />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">4. CategoryCarouselCenterEmphasis (Horizontal Center Scaling & Opacities)</span>
                <CategoryCarouselCenterEmphasis title="Horizontal Centered Scale Focus" categories={MOCK_CATEGORIES} itemShape="card" />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">5. CategoryCarouselAutoplay (Auto-Advance Scrolling with Pause on Touch)</span>
                <CategoryCarouselAutoplay title="Autoplay Scroll with Gesture Pauses" categories={MOCK_CATEGORIES} itemShape="card" />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">6. CategoryCarouselInfinite (Seamless Dynamic Clone Infinite Wraparounds)</span>
                <CategoryCarouselInfinite title="Seamless Loop Scroll" categories={MOCK_CATEGORIES} itemShape="card" />
              </div>

            </div>
          </section>

          {/* Group 5: Social & Stories */}
          <section id="testimonials" className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2">Testimonials & Review Sections</h2>
            
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs space-y-4">
              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">1. TestimonialSlider (Legacy Layout: carousel)</span>
                <TestimonialSlider title="What Our Collectors Say" testimonials={MOCK_TESTIMONIALS} layout="carousel" />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">2. TestimonialSlider (Legacy Layout: masonry)</span>
                <TestimonialSlider title="Verified Reviews Feed" testimonials={MOCK_TESTIMONIALS} layout="masonry" />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">3. TestimonialSliderCrossfade (Single-Quote Height-Matched Crossfades)</span>
                <TestimonialSliderCrossfade title="Customer Stories Spotlight" testimonials={MOCK_TESTIMONIALS} />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">4. TestimonialSliderMultiCard (Multi-Card Snapping Carousel)</span>
                <TestimonialSliderMultiCard title="Verified Collector Reviews" testimonials={MOCK_TESTIMONIALS} />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">5. TestimonialSliderVideo (Video story spotlights with muted autoplays)</span>
                <TestimonialSliderVideo 
                  title="Featured Story Spotlights" 
                  testimonials={[
                    ...MOCK_TESTIMONIALS,
                    {
                      id: "v1",
                      name: "Ayesha Malik",
                      text: "Seeing the pottery spinning live in 360 convinced me. It looks absolutely stunning in my dining room!",
                      rating: 5,
                      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-making-pottery-on-a-wheel-42289-large.mp4"
                    }
                  ]} 
                />
              </div>
            </div>
          </section>

          <section id="story" className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2">Brand Stories</h2>
            
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs space-y-4">
              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">1. BrandStory (Legacy Layout)</span>
                <BrandStory 
                  title="Preserving Heritage Craftsmanship"
                  paragraphs={[
                    "Altrivo works closely with veteran pottery weavers and canvas artists across local villages in Pakistan.",
                    "Every purchase provides fair wages, sustainable materials sourcing, and funds the heritage artisans association."
                  ]}
                  imageUrl="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500"
                  imageAlignment="left"
                  ctaText="Read Storybook"
                />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">2. BrandStoryZigZag (Alternating Row Reveals & Stats Count-ups)</span>
                <BrandStoryZigZag 
                  title="Preserving Heritage Weaves"
                  paragraphs={[
                    "Our story begins in small regional workshops where master craftsmen pass down secrets of clay kilns and loom-woven fibers.",
                    "By bridging the gap to international marketplaces, we create stable livelihood loops for dozens of artisan families."
                  ]}
                  imageUrl="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500"
                  imageAlignment="left"
                  ctaText="Browse Storybook"
                />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">3. BrandStoryTimeline (Scroll-linked Milestone tracker & SVG Signature draws)</span>
                <BrandStoryTimeline 
                  title="Chronology of Crafts"
                  paragraphs={[]}
                  imageUrl="https://images.unsplash.com/photo-1565192647048-f997ee879ab8?w=500"
                />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">4. BrandStoryStickyChapter (Sticky vertical navigation trackers & progressive revelations)</span>
                <BrandStoryStickyChapter 
                  title="Staged Narrative Chronicles"
                  paragraphs={[]}
                  imageUrl="https://images.unsplash.com/photo-1507206130072-9a4c1d55978b?w=500"
                />
              </div>
            </div>
          </section>

          <section id="newsletter" className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2">Newsletter Signup Forms</h2>
            
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs space-y-4">
              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">1. NewsletterSignup (Legacy Layout: box)</span>
                <NewsletterSignup title="Join Our Collector List" subtitle="Subscribe to get notifications of private art drops." layout="box" />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">2. NewsletterSignup (Legacy Layout: strip)</span>
                <NewsletterSignup title="Stay Updated" subtitle="Receive discounts and seasonal drop schedules." layout="strip" />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">3. NewsletterSignupInline (In-Place Morph & Floating Labels)</span>
                <NewsletterSignupInline title="Artisan Private Collections" subtitle="Register now for custom invite lists." />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">4. NewsletterSignupProgressive (Staged Fields Preference Disclosures)</span>
                <NewsletterSignupProgressive title="Collector Preferences Feed" subtitle="Enter your email to unlock category drops options." />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">5. NewsletterSignupModal (Scroll depth & Mouse out exit triggers)</span>
                <NewsletterSignupModal title="Privilege Launch Gates" subtitle="Enter your email to receive immediate validation codes." />
              </div>

              <div>
                <span className="block p-3 text-[10px] font-bold text-slate-400 bg-slate-50 border-b">6. NewsletterSignupSticky (Floating footer scroll triggers)</span>
                <NewsletterSignupSticky title="Collector Club Signup" subtitle="Verify email code to redeem 10% off." />
              </div>
            </div>
          </section>

        </div>

        {/* Global Footer (Visible inside Showroom) */}
        <div className="mt-20">
          <FooterDetailed />
        </div>

        {/* Dynamic Cart Shell sliding panel */}
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
