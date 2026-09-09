import { THEME_OPTIONS, type ThemeOption, type ThemeTokens } from "@/lib/onboarding";
import type { StoreBlueprintPlan } from "./store-planner";
import { generateStoreContent, type GeneratedStoreContent } from "./content-engine";
import { generateStoreMedia, type StoreMediaAssets } from "./media-engine";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SectionConfig {
  id: string;
  type: string;
  props: Record<string, any>;
  visible?: boolean;
  order?: number;
}

export interface StoreLayoutConfig {
  storeName: string;
  categories: Array<{ name: string; href: string }>;
  socialLinks: Array<{ name: string; href: string; icon: string }>;
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
}

export interface StoreSeoConfig {
  title: string;
  description: string;
  ogImage?: string;
  keywords: string[];
}

export interface StoreCommerceConfig {
  currency: string;
  currencySymbol: string;
  codEnabled: boolean;
  freeShippingThreshold?: number;
  escrowEnabled: boolean;
}

export interface GeneratedStore {
  name: string;
  slug: string;
  niche: string;
  description: string;
  layoutConfig: StoreLayoutConfig;
  seoConfig: StoreSeoConfig;
  commerceConfig: StoreCommerceConfig;
}

export interface TemplatePreview {
  templateId: string;
  templateName: string;
  description: string;
  tag: string;
  layoutConfig: StoreLayoutConfig;
  preview: {
    primaryColor: string;
    accentColor: string;
    bgGradient: string;
    fontFamily: string;
    heroHeadline: string;
    heroSub: string;
  };
}

export interface GenerationResult {
  previews: TemplatePreview[];
  plan: StoreBlueprintPlan;
  tokensUsed: number;
  costUsd: number;
}

export interface FinalGenerationResult {
  store: GeneratedStore;
  tokensUsed: number;
  costUsd: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function pickSectionId(type: string, index?: number): string {
  const suffix = index !== undefined ? index : Math.floor(Math.random() * 9000) + 1000;
  return `${type.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "")}-${suffix}`;
}

/**
 * Pick the top 3 best-matching templates for the plan.
 * If the plan already recommends one, that one comes first.
 */
function pickTemplates(plan: StoreBlueprintPlan): ThemeOption[] {
  const recommended = THEME_OPTIONS.find((t) => t.id === plan.recommendedTemplateId);
  const others = THEME_OPTIONS.filter((t) => t.id !== plan.recommendedTemplateId);

  // Style affinity scoring
  const scored = others.map((t) => {
    let score = 0;
    const style = plan.style;
    if (style === "luxury" && (t.id === "minimal-luxe" || t.id === "bold-vogue")) score += 3;
    if (style === "minimal" && (t.id === "nordic-crisp" || t.id === "minimal-luxe")) score += 3;
    if (style === "bold" && (t.id === "bold-vogue" || t.id === "cyber-neon")) score += 3;
    if (style === "modern" && (t.id === "cyber-neon" || t.id === "nordic-crisp")) score += 3;
    if (style === "editorial" && (t.id === "minimal-luxe" || t.id === "bold-vogue")) score += 3;
    if (style === "dark" && t.id === "cyber-neon") score += 4;

    const ind = plan.industry.toLowerCase();
    if (ind.includes("tech") && t.id === "cyber-neon") score += 2;
    if (ind.includes("beauty") && t.id === "botanical-fresh") score += 2;
    if (ind.includes("fashion") && (t.id === "minimal-luxe" || t.id === "bold-vogue")) score += 2;
    if (ind.includes("home") && t.id === "nordic-crisp") score += 2;
    if (ind.includes("craft") && t.id === "artisan-earth") score += 2;
    if (ind.includes("food") && t.id === "artisan-earth") score += 2;

    return { template: t, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top2 = scored.slice(0, 2).map((s) => s.template);

  if (recommended) {
    return [recommended, ...top2];
  }
  return scored.slice(0, 3).map((s) => s.template);
}

function extractFontFamily(tokenFont: string): string {
  // e.g. 'var(--font-playfair), "Playfair Display", Georgia, serif'  → "Playfair Display"
  const match = tokenFont.match(/"([^"]+)"/);
  if (match) return match[1];
  const commas = tokenFont.split(",");
  return commas[0].replace(/var\([^)]+\),?\s*/, "").replace(/["']/g, "").trim() || "Inter";
}

// ---------------------------------------------------------------------------
// Build sections from a plan + content + media
// ---------------------------------------------------------------------------

function buildSections(
  plan: StoreBlueprintPlan,
  content: GeneratedStoreContent,
  media: StoreMediaAssets
): SectionConfig[] {
  const sections: SectionConfig[] = [];

  // 1. Announcement / Promo Banner
  sections.push({
    id: pickSectionId("PromoBanner", 1),
    type: "PromoBanner",
    props: {
      text: content.announcementText,
      layout: "ribbon",
    },
  });

  // 2. Hero
  sections.push({
    id: pickSectionId(plan.recommendedSections.hero, 1),
    type: plan.recommendedSections.hero,
    props: {
      title: content.heroHeadline,
      subtitle: content.heroSubheadline,
      ctaText: content.heroCta,
      ctaLink: "/shop",
      secondaryCtaText: content.heroSecondaryCta || undefined,
      secondaryCtaLink: content.heroSecondaryCta ? "/shop" : undefined,
      imageUrl: media.heroImage.url,
      imageAlignment: "right",
    },
  });

  // 3. Feature Grid (trust/benefits)
  sections.push({
    id: pickSectionId("FeatureGrid", 1),
    type: "FeatureGrid",
    props: {
      columns: content.featureItems.length >= 4 ? 4 : 3,
      items: content.featureItems.slice(0, 4),
    },
  });

  // 4. Category Carousel
  const catCarouselType = plan.recommendedSections.categoryCarousel || "CategoryCarousel";
  sections.push({
    id: pickSectionId(catCarouselType, 1),
    type: catCarouselType,
    props: {
      title: "Explore Collections",
      layout: "card",
      categories: content.categoryNames.map((c, i) => ({
        ...c,
        image: media.categoryImages[i]?.url || media.heroImage.url,
      })),
    },
  });

  // 5. Featured Products Grid
  const prodGridType = plan.recommendedSections.productGrid || "ProductGridFeatured";
  sections.push({
    id: pickSectionId(prodGridType, 1),
    type: prodGridType,
    props: {
      title: "Featured Products",
      columns: 3,
    },
  });

  // 6. Testimonials
  const testimonialType = plan.recommendedSections.testimonials || "TestimonialSlider";
  sections.push({
    id: pickSectionId(testimonialType, 1),
    type: testimonialType,
    props: {
      title: "What Our Customers Say",
      layout: "carousel",
      testimonials: content.testimonials.map((t, i) => ({
        id: String(i + 1),
        ...t,
      })),
    },
  });

  // 7. Brand Story
  const brandType = plan.recommendedSections.brandStory || "BrandStory";
  sections.push({
    id: pickSectionId(brandType, 1),
    type: brandType,
    props: {
      title: content.brandStoryTitle,
      paragraphs: content.brandStoryParagraphs,
      imageUrl: media.brandStoryImage.url,
    },
  });

  // 8. Newsletter
  const newsletterType = plan.recommendedSections.newsletter || "NewsletterSignup";
  sections.push({
    id: pickSectionId(newsletterType, 1),
    type: newsletterType,
    props: {
      title: content.newsletterHeadline,
      subtitle: content.newsletterSubheadline,
      buttonText: "Subscribe",
      layout: "box",
    },
  });

  return sections;
}

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

/**
 * Phase 1: Generate 3 template previews from a user prompt.
 */
export async function generateTemplatePreviews(
  plan: StoreBlueprintPlan
): Promise<GenerationResult> {
  const templates = pickTemplates(plan);
  const totalTokens = 0;
  const totalCost = 0;

  const previews: TemplatePreview[] = templates.map((tmpl) => {
    const heading = extractFontFamily(tmpl.tokens.fontHeading);
    const body = extractFontFamily(tmpl.tokens.fontBody);

    const layoutConfig: StoreLayoutConfig = {
      storeName: plan.suggestedName || tmpl.storeName,
      categories: tmpl.navLinks.map((n) => ({ name: n, href: `/category/${slugify(n)}` })),
      socialLinks: [],
      theme: {
        colors: {
          primary: plan.colorPalette?.primary || tmpl.tokens.primary,
          secondary: plan.colorPalette?.accent || tmpl.tokens.accent,
          background: plan.colorPalette?.background || tmpl.tokens.bg,
          text: plan.colorPalette?.text || tmpl.tokens.text,
        },
        typography: { heading, body },
      },
      sections: [
        {
          id: "hero-preview-1",
          type: plan.recommendedSections.hero || "HeroSplitImage",
          props: {
            title: tmpl.heroHeadline,
            subtitle: tmpl.heroSub,
            ctaText: tmpl.ctaLabel,
            ctaLink: "/shop",
            imageAlignment: "right",
          },
        },
        {
          id: "products-preview-1",
          type: plan.recommendedSections.productGrid || "ProductGridFeatured",
          props: { title: "Featured Products", columns: 3 },
        },
      ],
    };

    return {
      templateId: tmpl.id,
      templateName: tmpl.name,
      description: tmpl.description,
      tag: tmpl.tag,
      layoutConfig,
      preview: {
        primaryColor: tmpl.tokens.primary,
        accentColor: tmpl.tokens.accent,
        bgGradient: tmpl.bgGradient,
        fontFamily: tmpl.fontFamily,
        heroHeadline: tmpl.heroHeadline,
        heroSub: tmpl.heroSub,
      },
    };
  });

  return { previews, plan, tokensUsed: totalTokens, costUsd: totalCost };
}

/**
 * Phase 2: Generate the final complete store from a selected template.
 */
export async function generateFinalStore(
  plan: StoreBlueprintPlan,
  selectedTemplateId: string
): Promise<FinalGenerationResult> {
  // Find template
  const template = THEME_OPTIONS.find((t) => t.id === selectedTemplateId) || THEME_OPTIONS[0];
  const heading = extractFontFamily(template.tokens.fontHeading);
  const body = extractFontFamily(template.tokens.fontBody);

  // Generate content and media in parallel
  const [contentResult, media] = await Promise.all([
    generateStoreContent(plan),
    generateStoreMedia(plan),
  ]);

  const { content, tokensUsed: contentTokens, costUsd: contentCost } = contentResult;

  // Build sections
  const sections = buildSections(plan, content, media);

  // Build categories from content
  const categories = content.categoryNames.map((c) => ({
    name: c.title,
    href: `/category/${slugify(c.title)}`,
  }));

  // Assemble complete layout config
  const layoutConfig: StoreLayoutConfig = {
    storeName: plan.suggestedName,
    categories,
    socialLinks: [
      { name: "Instagram", href: "#", icon: "instagram" },
      { name: "WhatsApp", href: "#", icon: "whatsapp" },
      { name: "Facebook", href: "#", icon: "facebook" },
    ],
    theme: {
      colors: {
        primary: plan.colorPalette?.primary || template.tokens.primary,
        secondary: plan.colorPalette?.accent || template.tokens.accent,
        background: plan.colorPalette?.background || template.tokens.bg,
        text: plan.colorPalette?.text || template.tokens.text,
      },
      typography: { heading, body },
    },
    sections,
  };

  // Currency mapping
  const currencyMap: Record<string, string> = {
    PKR: "₨",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "AED",
  };

  const store: GeneratedStore = {
    name: plan.suggestedName,
    slug: slugify(plan.suggestedName),
    niche: plan.industry,
    description: plan.suggestedTagline,
    layoutConfig,
    seoConfig: {
      title: content.seoTitle,
      description: content.seoDescription,
      keywords: plan.seoKeywords,
    },
    commerceConfig: {
      currency: plan.currency || "USD",
      currencySymbol: (plan.currency && currencyMap[plan.currency]) || "$",
      codEnabled: plan.market?.toLowerCase().includes("pakistan") ?? true,
      freeShippingThreshold: 50,
      escrowEnabled: true,
    },
  };

  return {
    store,
    tokensUsed: contentTokens,
    costUsd: contentCost,
  };
}
