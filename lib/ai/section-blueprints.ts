import type { StoreBlueprintPlan } from "./store-planner";
import type { GeneratedStoreContent } from "./content-engine";
import type { StoreMediaAssets } from "./media-engine";
import type { SectionConfig, StoreLayoutConfig } from "./store-generator";

// ---------------------------------------------------------------------------
// Section Blueprint Types
// ---------------------------------------------------------------------------

export type SectionCategory =
  | "hero"
  | "categories"
  | "products"
  | "features"
  | "story"
  | "testimonials"
  | "newsletter";

export interface ComponentVariant {
  id: string; // e.g. "HeroSplitImage"
  name: string;
  category: SectionCategory;
  tag: string;
  description: string;
  badge?: string;
  recommendedFor: string[]; // e.g. ["shoes", "fashion", "luxury"]
  previewSnippet: {
    layoutType: string;
    highlights: string[];
  };
}

export interface SectionCategoryBlueprint {
  category: SectionCategory;
  title: string;
  subtitle: string;
  icon: string;
  defaultVariant: string;
  variants: ComponentVariant[];
}

// ---------------------------------------------------------------------------
// Master Blueprint Catalog (5+ Variants Per Section)
// ---------------------------------------------------------------------------

export const SECTION_BLUEPRINT_CATALOG: SectionCategoryBlueprint[] = [
  // 1. HERO SECTIONS
  {
    category: "hero",
    title: "Hero Section",
    subtitle: "The first thing your buyers see. Sets the tone, brand vibe, and main CTA.",
    icon: "Sparkles",
    defaultVariant: "HeroSplitImage",
    variants: [
      {
        id: "HeroSplitImage",
        name: "Classic Luxury Split",
        category: "hero",
        tag: "High Conversion",
        badge: "Recommended",
        description: "2-column layout with high-impact product photo, headline, and clear dual CTAs.",
        recommendedFor: ["shoes", "fashion", "luxury", "home"],
        previewSnippet: {
          layoutType: "2-Column Split",
          highlights: ["Big Image on Right", "Dual CTA Buttons", "Trust Subtitle"],
        },
      },
      {
        id: "HeroBento",
        name: "Modern Bento Grid",
        category: "hero",
        tag: "Modern & Trendy",
        description: "Interactive multi-tile grid showcasing your bestseller, verified badge, and discount banner.",
        recommendedFor: ["electronics", "tech", "sneakers", "streetwear"],
        previewSnippet: {
          layoutType: "Bento Box Grid",
          highlights: ["4 Grid Cards", "Badge Chips", "Feature Highlights"],
        },
      },
      {
        id: "HeroCenteredOverlay",
        name: "Cinematic Full-Width",
        category: "hero",
        tag: "Editorial & Bold",
        description: "Full-width background photograph with centered typography and luxury aesthetic.",
        recommendedFor: ["luxury", "shoes", "jewelry", "fashion"],
        previewSnippet: {
          layoutType: "Full Background",
          highlights: ["Centered Copy", "Dark Gradient Tint", "High-End Serifs"],
        },
      },
      {
        id: "HeroDepthStack",
        name: "3D Layered Depth Stack",
        category: "hero",
        tag: "Visual Depth",
        description: "Layered card stack creating a 3D physical effect for premium footwear and lifestyle brands.",
        recommendedFor: ["shoes", "fashion", "sports"],
        previewSnippet: {
          layoutType: "Layered 3D Stack",
          highlights: ["Floating Cards", "Shadow Elevation", "Modern Angle"],
        },
      },
      {
        id: "HeroMarquee",
        name: "Kinetic Action Marquee",
        category: "hero",
        tag: "High Energy",
        description: "Animated continuous marquee banner with dynamic headline and fast-action shop CTA.",
        recommendedFor: ["sports", "sneakers", "streetwear", "electronics"],
        previewSnippet: {
          layoutType: "Kinetic Marquee",
          highlights: ["Animated Text", "High Contrast", "Action Orientated"],
        },
      },
    ],
  },

  // 2. CATEGORIES / COLLECTIONS SHOWCASE
  {
    category: "categories",
    title: "Collection Showcase",
    subtitle: "Help visitors navigate shoes by category (Casual, Formal, Sports, Boots, Traditional).",
    icon: "Grid",
    defaultVariant: "CategoryCarouselCenterEmphasis",
    variants: [
      {
        id: "CategoryCarouselCenterEmphasis",
        name: "3D Center Focus Carousel",
        category: "categories",
        tag: "Interactive 3D",
        badge: "Recommended",
        description: "Enlarges and elevates the active category card in the center with smooth snap scrolling.",
        recommendedFor: ["shoes", "fashion", "electronics"],
        previewSnippet: {
          layoutType: "3D Focused Carousel",
          highlights: ["Active Center Scale", "Item Count Badges", "Smooth Touch Snap"],
        },
      },
      {
        id: "CategoryCarouselNativeSnap",
        name: "Fluid Mobile Snap Slider",
        category: "categories",
        tag: "Mobile Optimized",
        description: "Mobile-first horizontal touch slider with clean category pill titles and item counts.",
        recommendedFor: ["all", "shoes", "retail"],
        previewSnippet: {
          layoutType: "Native Snap Slider",
          highlights: ["Zero Lag Scroll", "Image Tiles", "Pill Count Badges"],
        },
      },
      {
        id: "CategoryCarouselDrag",
        name: "Interactive Physics Drag Slider",
        category: "categories",
        tag: "Tactile UX",
        description: "Physics-based draggable slider with smooth momentum and hover magnification.",
        recommendedFor: ["luxury", "boutique", "shoes"],
        previewSnippet: {
          layoutType: "Momentum Drag Track",
          highlights: ["Drag & Swipe", "Hover Tilt", "Custom Arrow Buttons"],
        },
      },
      {
        id: "CategoryCarouselAutoplay",
        name: "Continuous Motion Marquee",
        category: "categories",
        tag: "Auto Motion",
        description: "Smooth continuous autoplay marquee that keeps categories moving gracefully.",
        recommendedFor: ["streetwear", "gadgets", "shoes"],
        previewSnippet: {
          layoutType: "Continuous Marquee",
          highlights: ["Hands-Free Autoplay", "Infinite Loop", "Pause on Hover"],
        },
      },
      {
        id: "CategoryCarousel",
        name: "Classic Grid Cards",
        category: "categories",
        tag: "Clean & Simple",
        description: "Standard clean cards with category icons, count tags, and direct collection links.",
        recommendedFor: ["general", "home", "crafts"],
        previewSnippet: {
          layoutType: "Card Grid",
          highlights: ["Clean Borders", "Category Icons", "Direct Nav Links"],
        },
      },
    ],
  },

  // 3. PRODUCTS & CATALOG SHOWCASE
  {
    category: "products",
    title: "Products & Catalog Showcase",
    subtitle: "Showcase your best-selling shoe models, pricing in PKR, ratings, and instant Add to Cart.",
    icon: "ShoppingBag",
    defaultVariant: "ProductGridFeatured",
    variants: [
      {
        id: "ProductGridFeatured",
        name: "Standard 3-Column Grid",
        category: "products",
        tag: "Classic E-Commerce",
        badge: "Recommended",
        description: "Clean 3-column product catalog with Cloudinary image zoom, price tags, and Quick Cart button.",
        recommendedFor: ["all", "shoes", "fashion", "electronics"],
        previewSnippet: {
          layoutType: "3-Column Grid",
          highlights: ["Quick Add to Cart", "Discount Badges", "Star Rating Stars"],
        },
      },
      {
        id: "ProductGridStaggered",
        name: "Vogue Editorial Masonry",
        category: "products",
        tag: "Magazine Style",
        description: "Asymmetric staggered height cards that make shoes and footwear look like a high-fashion catalog.",
        recommendedFor: ["fashion", "shoes", "lifestyle"],
        previewSnippet: {
          layoutType: "Staggered Masonry",
          highlights: ["Editorial Heights", "Hover Floating Price", "Artistic Flow"],
        },
      },
      {
        id: "ProductSingleFocus",
        name: "Single Bestseller Spotlight",
        category: "products",
        tag: "High Ticket Focus",
        description: "Dedicated deep-dive showcase for your #1 bestselling flagship product with buy box.",
        recommendedFor: ["shoes", "gadgets", "crafts"],
        previewSnippet: {
          layoutType: "Spotlight Hero Product",
          highlights: ["Detailed Specs", "Variant Selectors", "Direct Escrow Checkout"],
        },
      },
      {
        id: "ProductSingleFocusGallery",
        name: "Studio Multi-Angle Gallery",
        category: "products",
        tag: "Shoe Showcase",
        description: "Multi-angle photo gallery (side, top, sole, leather detail) with live thumbnail switcher.",
        recommendedFor: ["shoes", "jewelry", "gadgets"],
        previewSnippet: {
          layoutType: "Multi-View Gallery",
          highlights: ["Thumbnail Switcher", "Zoom In View", "Stock Availability Pill"],
        },
      },
      {
        id: "ProductSingleFocusSplitScroll",
        name: "Sticky Purchase Split Scroll",
        category: "products",
        tag: "High Conversion",
        description: "Sticky purchase box stays on screen while buyer scrolls through product photo stack.",
        recommendedFor: ["luxury", "shoes", "fashion"],
        previewSnippet: {
          layoutType: "Sticky Split Screen",
          highlights: ["Sticky Buy Box", "Scrolling Photo Stack", "Size Selector"],
        },
      },
    ],
  },

  // 4. ABOUT US / BRAND STORY (5 Variants)
  {
    category: "story",
    title: "Brand Story & Heritage",
    subtitle: "Tell your brand story, craftsmanship, leather quality, and reason why your shoes are superior.",
    icon: "BookOpen",
    defaultVariant: "BrandStory",
    variants: [
      {
        id: "BrandStory",
        name: "Artisan Studio Story",
        category: "story",
        tag: "Heritage & Craft",
        badge: "Recommended",
        description: "Photo of master craftsman with inspiring brand story and promise of handmade perfection.",
        recommendedFor: ["shoes", "crafts", "fashion", "luxury"],
        previewSnippet: {
          layoutType: "Photo + Paragraphs",
          highlights: ["Artisan Image", "Craftsmanship Story", "Founder Quote"],
        },
      },
      {
        id: "BrandStoryZigZag",
        name: "Alternating Visual Journey",
        category: "story",
        tag: "Multi-Step Story",
        description: "Alternating zig-zag photo blocks explaining materials, stitching, and finishing.",
        recommendedFor: ["shoes", "fashion", "lifestyle"],
        previewSnippet: {
          layoutType: "Zig-Zag Alternating",
          highlights: ["Material Sourcing", "Hand Stitching", "Quality Control"],
        },
      },
      {
        id: "BrandStoryTimeline",
        name: "Milestones Timeline",
        category: "story",
        tag: "Heritage Timeline",
        description: "Chronological milestone timeline showcasing brand evolution from founding to current drop.",
        recommendedFor: ["luxury", "heritage", "shoes"],
        previewSnippet: {
          layoutType: "Vertical Timeline",
          highlights: ["Year Milestones", "Growth Steps", "Verified Badges"],
        },
      },
      {
        id: "BrandStoryStickyChapter",
        name: "Editorial Sticky Chapter",
        category: "story",
        tag: "Interactive Reading",
        description: "Sticky table of contents on left with scrolling story chapters on right.",
        recommendedFor: ["editorial", "luxury", "shoes"],
        previewSnippet: {
          layoutType: "Sticky Chapter Nav",
          highlights: ["Chapter Links", "Smooth Scroll", "Full Editorial Layout"],
        },
      },
      {
        id: "BrandStoryFounderQuote",
        name: "Founder Heritage Statement",
        category: "story",
        tag: "Luxury Signature",
        description: "Centered luxury founder statement with authentic digital signature badge and workshop photo.",
        recommendedFor: ["luxury", "bespoke", "shoes"],
        previewSnippet: {
          layoutType: "Signature Quote Block",
          highlights: ["Founder Signature", "Workshop Photo", "Mission Statement"],
        },
      },
    ],
  },

  // 6. CUSTOMER REVIEWS / TESTIMONIALS (5 Variants)
  {
    category: "testimonials",
    title: "Customer Reviews & Social Proof",
    subtitle: "Real verified buyer reviews, 5-star ratings, and buyer photos to maximize conversions.",
    icon: "Star",
    defaultVariant: "TestimonialSlider",
    variants: [
      {
        id: "TestimonialSlider",
        name: "Classic Reviews Carousel",
        category: "testimonials",
        tag: "Verified Feedback",
        badge: "Recommended",
        description: "Card slider featuring quotes from real Pakistani buyers, verified badges, and 5-star chips.",
        recommendedFor: ["all", "shoes", "fashion"],
        previewSnippet: {
          layoutType: "Reviews Slider",
          highlights: ["5-Star Rating Pill", "Verified Buyer Badge", "Customer City/Name"],
        },
      },
      {
        id: "TestimonialSliderMultiCard",
        name: "3-Column Review Wall",
        category: "testimonials",
        tag: "Social Proof Wall",
        description: "3-column grid displaying multiple buyer reviews side-by-side for instant trust building.",
        recommendedFor: ["retail", "shoes", "electronics"],
        previewSnippet: {
          layoutType: "3-Column Wall",
          highlights: ["Multiple Reviews", "Verified Avatar", "Shoe Size Purchased"],
        },
      },
      {
        id: "TestimonialSliderCrossfade",
        name: "Minimalist Serif Quote",
        category: "testimonials",
        tag: "Luxury Aesthetic",
        description: "Large editorial quote with subtle crossfade animation and high-end typography.",
        recommendedFor: ["luxury", "shoes", "jewelry"],
        previewSnippet: {
          layoutType: "Crossfade Quote",
          highlights: ["Serif Typography", "Minimal Background", "Smooth Fade"],
        },
      },
      {
        id: "TestimonialSliderVideo",
        name: "UGC Video Testimonials",
        category: "testimonials",
        tag: "Video Social Proof",
        description: "Video unboxing & review cards with play overlays and buyer verification stamps.",
        recommendedFor: ["shoes", "streetwear", "beauty"],
        previewSnippet: {
          layoutType: "Video Card Grid",
          highlights: ["Play Badges", "Unboxing Clips", "Instant Trust"],
        },
      },
      {
        id: "TestimonialBadgeWall",
        name: "4.9/5 Rating Score Wall",
        category: "testimonials",
        tag: "Score Highlight",
        description: "Massive 4.9/5 overall rating badge accompanied by verified review cards and city tags.",
        recommendedFor: ["all", "shoes", "retail"],
        previewSnippet: {
          layoutType: "Rating Scoreboard",
          highlights: ["4.9/5 Score Pill", "City Tags (Lahore, KHI)", "Verified Buyer"],
        },
      },
    ],
  },

  // 7. NEWSLETTER & VIP OFFERS (5 Variants)
  {
    category: "newsletter",
    title: "VIP Club & Newsletter",
    subtitle: "Capture buyer phone numbers and emails with instant discount incentives.",
    icon: "Mail",
    defaultVariant: "NewsletterSignupProgressive",
    variants: [
      {
        id: "NewsletterSignupProgressive",
        name: "VIP 10% OFF Unlocker",
        category: "newsletter",
        tag: "High Capture Rate",
        badge: "Recommended",
        description: "Gamified VIP unlocker that gives buyers an instant 10% discount code upon signup.",
        recommendedFor: ["shoes", "fashion", "retail"],
        previewSnippet: {
          layoutType: "VIP Reward Box",
          highlights: ["Instant Discount Code", "Phone / Email Input", "WhatsApp VIP Alert"],
        },
      },
      {
        id: "NewsletterSignup",
        name: "Boxed Inner Circle",
        category: "newsletter",
        tag: "Clean & Elegant",
        description: "Clean boxed container with private drops access and seasonal collection alerts.",
        recommendedFor: ["all", "luxury", "shoes"],
        previewSnippet: {
          layoutType: "Boxed Container",
          highlights: ["Exclusive Drops", "Privacy Guarantee", "One-Click Submit"],
        },
      },
      {
        id: "NewsletterSignupInline",
        name: "Minimalist Single Bar",
        category: "newsletter",
        tag: "Space Saving",
        description: "Compact single-line input bar seamlessly integrated above the footer.",
        recommendedFor: ["minimal", "nordic", "shoes"],
        previewSnippet: {
          layoutType: "Inline Bar",
          highlights: ["Clean Border", "Minimal Footprint", "Fast Submit"],
        },
      },
      {
        id: "NewsletterSignupSticky",
        name: "Floating Bottom Ribbon",
        category: "newsletter",
        tag: "Sticky Notification",
        description: "Floating bottom notification bar that gently invites buyers to join the VIP list.",
        recommendedFor: ["modern", "shoes", "electronics"],
        previewSnippet: {
          layoutType: "Floating Ribbon",
          highlights: ["Sticky Bottom", "Dismissible", "High Visibility"],
        },
      },
      {
        id: "NewsletterDiscountScratch",
        name: "Instant Voucher Card",
        category: "newsletter",
        tag: "Discount Voucher",
        description: "Stylized coupon ticket container with instant copy code button and email unlock.",
        recommendedFor: ["fashion", "shoes", "retail"],
        previewSnippet: {
          layoutType: "Coupon Ticket Box",
          highlights: ["Voucher Border", "Copy Coupon Code", "Instant Incentive"],
        },
      },
    ],
  },

  // 7. FEATURES & TRUST (5 Variants - Placed last, right above the footer)
  {
    category: "features",
    title: "Trust & Buyer Guarantees",
    subtitle: "Give Pakistani buyers 100% confidence with COD, Escrow protection, and express courier.",
    icon: "ShieldCheck",
    defaultVariant: "FeatureGrid",
    variants: [
      {
        id: "FeatureGrid",
        name: "4-Column Trust Badges",
        category: "features",
        tag: "Pakistani E-Commerce Essential",
        badge: "Recommended",
        description: "Cash on Delivery (COD), 2-4 Days Express TCS, Buyer Protection, and Easy 7-Day Exchange.",
        recommendedFor: ["all", "shoes", "fashion", "electronics"],
        previewSnippet: {
          layoutType: "4-Column Icon Grid",
          highlights: ["COD Badge", "Buyer Protection", "TCS / Courier Logo"],
        },
      },
      {
        id: "PromoBanner",
        name: "Top Urgency Banner Ribbon",
        category: "features",
        tag: "Urgency & Offers",
        description: "Prominent top ribbon banner announcing seasonal drop, free delivery threshold, or discount code.",
        recommendedFor: ["all", "retail", "shoes"],
        previewSnippet: {
          layoutType: "Full Ribbon Bar",
          highlights: ["Free Delivery Alert", "Discount Coupon Pill", "Live Pulse Dot"],
        },
      },
      {
        id: "FeatureGridCards3D",
        name: "Floating 3D Trust Cards",
        category: "features",
        tag: "Modern Depth",
        description: "Elevated glassmorphic cards with glowing border gradients and Lucide trust icons.",
        recommendedFor: ["luxury", "shoes", "tech"],
        previewSnippet: {
          layoutType: "3D Elevated Cards",
          highlights: ["Glassmorphism", "Icon Badges", "Interactive Hover"],
        },
      },
      {
        id: "FeatureGridMinimalBar",
        name: "Clean Minimal Divider Strip",
        category: "features",
        tag: "Minimalist",
        description: "Ultra-clean single line trust bar seamlessly placed below the hero with inline icons.",
        recommendedFor: ["minimal", "apparel", "shoes"],
        previewSnippet: {
          layoutType: "Inline Divider Bar",
          highlights: ["Minimalist Style", "Clean Line", "Zero Clutter"],
        },
      },
      {
        id: "FeatureGridBuyerProtection",
        name: "Escrow & Courier Badge Wall",
        category: "features",
        tag: "High Trust",
        description: "Prominent Pakistani buyer safety stamps, bank grade encryption, and delivery assurance.",
        recommendedFor: ["high-ticket", "leather", "shoes"],
        previewSnippet: {
          layoutType: "Badge Stamp Wall",
          highlights: ["Verified Escrow", "Courier Partners", "Money-Back Guarantee"],
        },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper: Assemble Dynamic Store from Custom Section Selections
// ---------------------------------------------------------------------------

export interface UserSectionSelections {
  hero: string;
  categories: string;
  products: string;
  features: string;
  story: string;
  testimonials: string;
  newsletter: string;
}

export function assembleCustomStore(
  plan: StoreBlueprintPlan,
  content: GeneratedStoreContent,
  media: StoreMediaAssets,
  selections: UserSectionSelections,
  themeColors?: { primary: string; secondary: string; background: string; text: string },
  typography?: { heading: string; body: string },
  customComponents?: any[]
): StoreLayoutConfig {
  const sections: SectionConfig[] = [];

  // 1. Promo / Announcement (if selected)
  if (selections.features === "PromoBanner") {
    sections.push({
      id: "promo-banner-1",
      type: "PromoBanner",
      props: {
        text: content.announcementText || "🎉 Free Express Delivery on orders over ₨ 5,000 across Pakistan!",
        layout: "ribbon",
      },
    });
  }

  // 2. Hero Section (Selected Variant)
  sections.push({
    id: "hero-section-1",
    type: selections.hero || "HeroSplitImage",
    props: {
      title: content.heroHeadline,
      subtitle: content.heroSubheadline,
      ctaText: content.heroCta || "Shop Collection",
      ctaLink: "#products",
      secondaryCtaText: content.heroSecondaryCta || "View Catalog",
      secondaryCtaLink: "#products",
      imageUrl: media.heroImage.url,
      imageAlignment: "right",
    },
  });

  // 2b. Custom Components (if user created custom sections)
  if (customComponents && customComponents.length > 0) {
    customComponents.forEach((comp, idx) => {
      sections.push({
        id: comp.id || `custom-section-${idx + 1}`,
        type: "CustomComponent",
        props: {
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



  // 4. Categories Showcase (Selected Variant)
  sections.push({
    id: "categories-showcase-1",
    type: selections.categories || "CategoryCarouselCenterEmphasis",
    props: {
      title: `Explore ${plan.suggestedName || plan.industry || "Our"} Collections`,
      layout: "card",
      categories: content.categoryNames.map((c, idx) => ({
        ...c,
        image: media.categoryImages[idx]?.url || media.heroImage.url,
      })),
    },
  });

  // 5. Products Catalog (Selected Variant)
  sections.push({
    id: "products-catalog-1",
    type: selections.products || "ProductGridFeatured",
    props: {
      title: "Featured Masterpieces",
      columns: 3,
    },
  });

  // 6. Brand Story (Selected Variant)
  sections.push({
    id: "brand-story-1",
    type: selections.story || "BrandStory",
    props: {
      title: content.brandStoryTitle,
      paragraphs: content.brandStoryParagraphs,
      imageUrl: media.brandStoryImage.url,
    },
  });

  // 7. Testimonials (Selected Variant)
  sections.push({
    id: "testimonials-slider-1",
    type: selections.testimonials || "TestimonialSlider",
    props: {
      title: "What Our Buyers Say",
      layout: "carousel",
      testimonials: content.testimonials.map((t, i) => ({
        id: String(i + 1),
        ...t,
      })),
    },
  });

  // 8. Newsletter (Selected Variant)
  sections.push({
    id: "newsletter-signup-1",
    type: selections.newsletter || "NewsletterSignupProgressive",
    props: {
      title: content.newsletterHeadline,
      subtitle: content.newsletterSubheadline,
      buttonText: "Join VIP Club",
      layout: "box",
    },
  });

  // 9. Features & Trust Grid (Placed last, right above the footer)
  if (selections.features && selections.features !== "PromoBanner") {
    sections.push({
      id: "feature-grid-1",
      type: "FeatureGrid",
      props: {
        columns: 4,
        layout: selections.features === "FeatureGridCards3D" ? "cards3d" : selections.features === "FeatureGridMinimalBar" ? "minimal" : "grid",
        items: content.featureItems.length >= 4 ? content.featureItems.slice(0, 4) : [
          { icon: "truck", title: "Cash on Delivery", description: "Nationwide COD express delivery across Pakistan" },
          { icon: "shield-check", title: "Escrow Protection", description: "100% money back guarantee until delivery confirmation" },
          { icon: "rotate-ccw", title: "7-Day Easy Exchange", description: "Hassle-free replacement guarantee" },
          { icon: "award", title: "100% Genuine Quality", description: "Authentic materials with full craftsmanship warranty" },
        ],
      },
    });
  }

  const categories = content.categoryNames.map((c) => ({
    name: c.title,
    href: `/category/${c.title.toLowerCase().replace(/\s+/g, "-")}`,
  }));

  return {
    storeName: plan.suggestedName,
    categories,
    socialLinks: [
      { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
      { name: "WhatsApp Store", href: "https://wa.me/923001234567", icon: "whatsapp" },
      { name: "Facebook", href: "https://facebook.com", icon: "facebook" },
    ],
    theme: {
      colors: themeColors || {
        primary: plan.colorPalette?.primary || "#171717",
        secondary: plan.colorPalette?.accent || "#D4AF37",
        background: plan.colorPalette?.background || "#FFFFFF",
        text: plan.colorPalette?.text || "#0A0A0A",
      },
      typography: typography || {
        heading: plan.style === "luxury" ? "Playfair Display" : "Plus Jakarta Sans",
        body: "Inter",
      },
    },
    sections,
  };
}
