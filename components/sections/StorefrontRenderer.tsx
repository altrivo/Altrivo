"use client";

import React from "react";
import { CartProvider } from "./CartContext";
import { formatPrice, formatCutPrice } from "@/lib/storefront/priceUtils";
import StorefrontGlobalModals from "./StorefrontGlobalModals";
import StorefrontOfferModal from "./StorefrontOfferModal";
import ProductSaleHighlight from "./ProductSaleHighlight";

// Import all sections in library
import HeaderStandard from "./HeaderStandard";
import FooterDetailed from "./FooterDetailed";
import { AboutPageView, ShopPageView, ContactPageView } from "./StorefrontPageViews";
import HeroSplitImage from "./HeroSplitImage";
import HeroCenteredOverlay from "./HeroCenteredOverlay";
import PromoBanner from "./PromoBanner";
import FeatureGrid from "./FeatureGrid";
import ProductGridFeatured from "./ProductGridFeatured";
import ProductSingleFocus from "./ProductSingleFocus";
import CategoryCarousel from "./CategoryCarousel";
import TestimonialSlider from "./TestimonialSlider";
import BrandStory from "./BrandStory";
import NewsletterSignup from "./NewsletterSignup";

// New dynamic hero variations
import HeroBrokenGrid from "./HeroBrokenGrid";
import HeroBento from "./HeroBento";
import HeroDiagonal from "./HeroDiagonal";
import HeroDepthStack from "./HeroDepthStack";
import HeroMarquee from "./HeroMarquee";
import HeroStaggerReveal from "./HeroStaggerReveal";

// New Product Card & Grid variations
import ProductCardElevate from "./ProductCardElevate";
import ProductCardZoom from "./ProductCardZoom";
import ProductCard3DTilt from "./ProductCard3DTilt";
import ProductCardFlip from "./ProductCardFlip";
import ProductCardSlideActions from "./ProductCardSlideActions";
import ProductCardMagnetic from "./ProductCardMagnetic";
import ProductGridStaggered from "./ProductGridStaggered";
import ProductCardSkeleton from "./ProductCardSkeleton";

// New Product Single Focus variations
import ProductSingleFocusSplitScroll from "./ProductSingleFocusSplitScroll";
import ProductSingleFocusGallery from "./ProductSingleFocusGallery";
import ProductSingleFocusZoom from "./ProductSingleFocusZoom";
import ProductSingleFocus360 from "./ProductSingleFocus360";
import ProductSingleFocusVariantSwap from "./ProductSingleFocusVariantSwap";
import ProductSingleFocusStickyBar from "./ProductSingleFocusStickyBar";

// New Category Carousel variations
import CategoryCarouselNativeSnap from "./CategoryCarouselNativeSnap";
import CategoryCarouselDrag from "./CategoryCarouselDrag";
import CategoryCarouselCenterEmphasis from "./CategoryCarouselCenterEmphasis";
import CategoryCarouselAutoplay from "./CategoryCarouselAutoplay";
import CategoryCarouselInfinite from "./CategoryCarouselInfinite";

// New Testimonial Slider variations
import TestimonialSliderCrossfade from "./TestimonialSliderCrossfade";
import TestimonialSliderMultiCard from "./TestimonialSliderMultiCard";
import TestimonialSliderVideo from "./TestimonialSliderVideo";

// New Newsletter Signup variations
import NewsletterSignupInline from "./NewsletterSignupInline";
import NewsletterSignupModal from "./NewsletterSignupModal";
import NewsletterSignupProgressive from "./NewsletterSignupProgressive";
import NewsletterSignupSticky from "./NewsletterSignupSticky";

// New Brand Story variations
import BrandStoryZigZag from "./BrandStoryZigZag";
import BrandStoryTimeline from "./BrandStoryTimeline";
import BrandStoryStickyChapter from "./BrandStoryStickyChapter";

// New Hero Gradient variations
import HeroGradientBlobs from "./HeroGradientBlobs";
import HeroGradientConic from "./HeroGradientConic";
import HeroGradientRoute from "./HeroGradientRoute";

// New Hero Slideshow variations
import HeroSlideshowKenBurns from "./HeroSlideshowKenBurns";
import HeroSlideshowSplit from "./HeroSlideshowSplit";
import HeroSlideshowPortal from "./HeroSlideshowPortal";

// New Kinetic typography hero variations
import HeroKinetic from "./HeroKinetic";

// New Timed reveal hero variations
import HeroReveal from "./HeroReveal";

// User-Defined Custom Component
import CustomComponent from "./CustomComponent";

// Component Registry Map
const REGISTRY = {
  HeaderStandard,
  FooterDetailed,
  HeroSplitImage,
  HeroCenteredOverlay,
  PromoBanner,
  FeatureGrid,
  ProductGridFeatured,
  ProductSingleFocus,
  CategoryCarousel,
  TestimonialSlider,
  BrandStory,
  NewsletterSignup,
  CustomComponent,
  CustomSection: CustomComponent,
  HeroBrokenGrid,
  HeroBento,
  HeroDiagonal,
  HeroDepthStack,
  HeroMarquee,
  HeroStaggerReveal,
  ProductCardElevate,
  ProductCardZoom,
  ProductCard3DTilt,
  ProductCardFlip,
  ProductCardSlideActions,
  ProductCardMagnetic,
  ProductGridStaggered,
  ProductCardSkeleton,
  ProductSingleFocusSplitScroll,
  ProductSingleFocusGallery,
  ProductSingleFocusZoom,
  ProductSingleFocus360,
  ProductSingleFocusVariantSwap,
  ProductSingleFocusStickyBar,
  CategoryCarouselNativeSnap,
  CategoryCarouselDrag,
  CategoryCarouselCenterEmphasis,
  CategoryCarouselAutoplay,
  CategoryCarouselInfinite,
  TestimonialSliderCrossfade,
  TestimonialSliderMultiCard,
  TestimonialSliderVideo,
  NewsletterSignupInline,
  NewsletterSignupModal,
  NewsletterSignupProgressive,
  NewsletterSignupSticky,
  BrandStoryZigZag,
  BrandStoryTimeline,
  BrandStoryStickyChapter,
  HeroGradientBlobs,
  HeroGradientConic,
  HeroGradientRoute,
  HeroSlideshowKenBurns,
  HeroSlideshowSplit,
  HeroSlideshowPortal,
  HeroKinetic,
  HeroReveal,
  ProductSaleHighlight,
  StorefrontOfferModal,
};

export interface SectionConfig {
  id: string;
  type: keyof typeof REGISTRY;
  props: any;
}

import { Pencil, MoveUp, MoveDown, Trash2 } from "lucide-react";

export interface StorefrontRendererProps {
  config: {
    storeName?: string;
    niche?: string;
    categories?: { name: string; href: string }[];
    socialLinks?: { name: string; href: string; icon: string }[];
    theme: {
      colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
      };
      typography: {
        heading: string;
        body: string;
      };
    };
    sections: SectionConfig[];
    pages?: {
      about?: any;
      shop?: any;
      contact?: any;
    };
  };
  products?: any[];
  categories?: any[];
  isEditorMode?: boolean;
  activeSectionId?: string | null;
  deviceMode?: "desktop" | "tablet" | "mobile";
  activePage?: "home" | "about" | "shop" | "contact";
  onNavigatePage?: (page: string) => void;
  onSelectSection?: (sectionId: string) => void;
  onMoveSection?: (sectionId: string, direction: "up" | "down") => void;
  onDeleteSection?: (sectionId: string) => void;
}

export default function StorefrontRenderer({
  config,
  products = [],
  categories = [],
  isEditorMode = false,
  activeSectionId = null,
  deviceMode = "desktop",
  activePage: activePageProp,
  onNavigatePage,
  onSelectSection,
  onMoveSection,
  onDeleteSection,
}: StorefrontRendererProps) {
  const { theme, sections = [] } = config;
  const storeIdentifier = (config as any).slug || (config as any).subdomain || (config as any).storeId || config.storeName || "store_default";
  const rawCatalog = (products && Array.isArray(products) && products.length > 0)
    ? products
    : (Array.isArray((config as any).products) && (config as any).products.length > 0)
    ? (config as any).products
    : [];
  const catalogProducts = rawCatalog.map((p: any) => ({
    ...p,
    price: formatPrice(p.price),
    originalPrice: formatCutPrice(p.price, p.originalPrice),
  }));

  const [internalPage, setInternalPage] = React.useState<string>(activePageProp || "home");

  React.useEffect(() => {
    if (activePageProp) {
      setInternalPage(activePageProp);
    }
  }, [activePageProp]);

  // Synchronize with URL hash on live storefront (e.g. /store/[slug]#about)
  React.useEffect(() => {
    const handleHashCheck = () => {
      if (typeof window !== "undefined") {
        const h = window.location.hash.replace("#", "").toLowerCase();
        if (["home", "about", "shop", "contact"].includes(h)) {
          setInternalPage(h);
        }
      }
    };
    handleHashCheck();
    window.addEventListener("hashchange", handleHashCheck);
    return () => window.removeEventListener("hashchange", handleHashCheck);
  }, []);

  const currentPage = activePageProp || internalPage || "home";

  const handlePageChange = (p: string) => {
    setInternalPage(p);
    onNavigatePage?.(p);
  };

  return (
    <CartProvider storeId={storeIdentifier}>
      <div
        className="min-h-screen w-full max-w-full overflow-x-hidden text-[var(--color-text,#1e293b)] bg-[var(--color-bg,#ffffff)]"
        style={{
          "--color-primary": theme?.colors?.primary || "#0f172a",
          "--color-secondary": theme?.colors?.secondary || "#d97706",
          "--color-bg": theme?.colors?.background || "#ffffff",
          "--color-text": theme?.colors?.text || "#1e293b",
          "--font-heading": theme?.typography?.heading || "inherit",
          "--font-body": theme?.typography?.body || "inherit",
        } as React.CSSProperties}
      >
        {/* Global Floating Header (With Click-to-Edit Selector Support in Editor Mode) */}
        {isEditorMode ? (
          <div
            onClickCapture={() => onSelectSection?.("navbar-header")}
            className={`relative group/navbar transition-all duration-200 cursor-pointer ${
              activeSectionId === "navbar-header"
                ? "ring-4 ring-[#312038] shadow-2xl z-20"
                : "hover:ring-2 hover:ring-[#312038]/50 hover:ring-offset-2"
            }`}
          >
            <div className="absolute top-2 left-4 z-30 pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-[#312038] text-white font-extrabold text-[10px] shadow-lg flex items-center gap-1.5">
                <Pencil className="w-3 h-3" />
                <span>Header &amp; Navigation Bar</span>
              </span>
            </div>
            <HeaderStandard 
              logoText={config["storeName"] || "Artisanal Store"} 
              navigation={config["categories"] || []}
              products={catalogProducts}
              deviceMode={deviceMode}
              activePage={currentPage}
              storeSlug={storeIdentifier}
              isEditorMode={isEditorMode}
              onNavigatePage={handlePageChange}
              headerConfig={(config as any)?.header}
              theme={(config as any)?.theme}
            />
          </div>
        ) : (
          <HeaderStandard 
            logoText={config["storeName"] || "Artisanal Store"} 
            navigation={config["categories"] || []}
            products={catalogProducts}
            deviceMode={deviceMode}
            activePage={currentPage}
            storeSlug={storeIdentifier}
            isEditorMode={isEditorMode}
            onNavigatePage={handlePageChange}
            headerConfig={(config as any)?.header}
            theme={(config as any)?.theme}
          />
        )}

        <main className="pb-16">
          {/* ABOUT PAGE */}
          {currentPage === "about" && (
            <AboutPageView
              storeName={config["storeName"] || "Artisanal Store"}
              niche={config.niche || (config as any)._niche || "apparel"}
              config={config.pages?.about}
              isEditorMode={isEditorMode}
              activeSectionId={activeSectionId}
              onSelectSection={onSelectSection}
            />
          )}

          {/* SHOP PAGE */}
          {currentPage === "shop" && (
            <ShopPageView
              storeName={config["storeName"] || "Artisanal Store"}
              products={catalogProducts}
              categories={config.categories || categories}
              config={config.pages?.shop}
              storeSlug={storeIdentifier}
              isEditorMode={isEditorMode}
              activeSectionId={activeSectionId}
              onSelectSection={onSelectSection}
            />
          )}

          {/* CONTACT PAGE */}
          {currentPage === "contact" && (
            <ContactPageView
              storeName={config["storeName"] || "Artisanal Store"}
              niche={config.niche || (config as any)._niche || "apparel"}
              config={config.pages?.contact}
              isEditorMode={isEditorMode}
              activeSectionId={activeSectionId}
              onSelectSection={onSelectSection}
            />
          )}

          {/* HOME PAGE: Standard Sections Pipeline */}
          {currentPage === "home" && sections.map((section, idx) => {
            const Component = REGISTRY[section.type] as any;
            if (!Component) return null;

            // Injections: Feed real backend data lists to listing components
            const dynamicProps = { ...section.props, storeSlug: storeIdentifier };
            if (
              section.type === "ProductGridFeatured" ||
              section.type.includes("ProductGrid") ||
              section.type.includes("ProductCard") ||
              section.type.includes("Product")
            ) {
              const secProducts = section.props?.products;
              const storeProducts = (products && Array.isArray(products)) ? products : (config as any).products;
              const rawGridProducts = (secProducts && secProducts.length > 0)
                ? secProducts
                : (storeProducts && Array.isArray(storeProducts) && storeProducts.length > 0)
                ? storeProducts
                : [];
              dynamicProps.products = rawGridProducts.map((p: any) => ({
                ...p,
                price: formatPrice(p.price),
                originalPrice: formatCutPrice(p.price, p.originalPrice),
              }));
              dynamicProps.limit = section.props?.limit || (dynamicProps.products.length > 0 ? dynamicProps.products.length : 12);
              dynamicProps.storeSlug = storeIdentifier;
            } else if (section.type === "CategoryCarousel" || section.type.startsWith("CategoryCarousel")) {
              dynamicProps.categories = section.props?.categories || categories;
            }

            const isSelected = activeSectionId === section.id;

            if (isEditorMode) {
              return (
                <div
                  key={section.id}
                  onClickCapture={() => {
                    onSelectSection?.(section.id);
                  }}
                  className={`relative group/section transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "ring-4 ring-[#312038] shadow-2xl z-20"
                      : "hover:ring-2 hover:ring-[#312038]/50 hover:ring-offset-2"
                  }`}
                >
                  {/* Floating In-Place Section Header & Quick Action Pill */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSection?.(section.id);
                    }}
                    className={`absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-2xl cursor-pointer ${
                      isSelected
                        ? "bg-[#312038] text-white opacity-100 ring-2 ring-white/30 scale-105"
                        : "bg-slate-950/90 text-white border border-slate-700 opacity-90 group-hover/section:opacity-100 group-hover/section:bg-[#312038] group-hover/section:text-white"
                    }`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>{isSelected ? `Editing: ${section.props?.title || section.type}` : `Edit ${section.type}`}</span>
                  </div>

                  {/* Quick Floating Actions on Right */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-slate-950/95 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-2xl">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveSection?.(section.id, "up");
                        }}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveSection?.(section.id, "down");
                        }}
                        disabled={idx === sections.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSection?.(section.id);
                        }}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <Component {...dynamicProps} />
                </div>
              );
            }

            return <Component key={section.id} {...dynamicProps} />;
          })}
        </main>

        {/* Global Footer */}
        <FooterDetailed 
          storeName={(config as any).storeName || "Artisanal Store"}
          tagline={(config as any).tagline || (config as any).hero?.subtitle}
          description={(config as any).description}
          copyrightText={`© ${new Date().getFullYear()} ${(config as any).storeName || "Store"}. All rights reserved.`}
          socialLinks={(config as any).socialLinks || []}
          categories={categories && categories.length > 0 ? categories : ((config as any).categories || [])}
          sections={(config as any).footerSections}
          supportPhone={(config as any).supportPhone}
          supportEmail={(config as any).supportEmail}
          policies={(config as any).policies}
        />

        {/* Global Cart Drawer, Checkout, Auth & Tracking Modals */}
        <StorefrontGlobalModals storeName={config["storeName"] || "Artisanal Store"} />
      </div>
    </CartProvider>
  );
}
