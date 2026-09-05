import { validatePatch, type ValidationResult } from "./store-validator";
import { buildPatchPrompt } from "./prompts/store-planner-prompt";

// ---------------------------------------------------------------------------
// Patch Types
// ---------------------------------------------------------------------------

export type PatchOperationType =
  | "UPDATE_SECTION"
  | "CREATE_SECTION"
  | "DELETE_SECTION"
  | "MOVE_SECTION"
  | "UPDATE_PROPS"
  | "UPDATE_DESIGN_TOKEN"
  | "UPDATE_SEO"
  | "CREATE_PAGE"
  | "UPDATE_PAGE_METADATA"
  | "FULL_LAYOUT_UPDATE";

export interface StorePatch {
  operation: PatchOperationType;
  target?: string; // section id or path (e.g. "home.hero_1")
  changes?: Record<string, any>;
  newSection?: {
    id: string;
    type: string;
    props: Record<string, any>;
  };
  moveIndex?: number;
}

export interface PatchResult {
  success: boolean;
  updatedLayout: any;
  patches: StorePatch[];
  validation: ValidationResult;
  method: "gemini-ai" | "rule-fallback";
  tokensUsed: number;
  costUsd: number;
}

// ---------------------------------------------------------------------------
// Registry types for validation (must match components/registry.ts)
// ---------------------------------------------------------------------------

const REGISTRY_TYPES = [
  "HeaderStandard", "FooterDetailed",
  "HeroSplitImage", "HeroCenteredOverlay", "HeroBrokenGrid", "HeroBento",
  "HeroDiagonal", "HeroDepthStack", "HeroMarquee", "HeroStaggerReveal",
  "HeroGradientBlobs", "HeroGradientConic", "HeroGradientRoute",
  "HeroSlideshowKenBurns", "HeroSlideshowSplit", "HeroSlideshowPortal",
  "HeroKinetic", "HeroReveal",
  "PromoBanner", "FeatureGrid",
  "ProductGridFeatured", "ProductSingleFocus",
  "ProductCardElevate", "ProductCardZoom", "ProductCard3DTilt",
  "ProductCardFlip", "ProductCardSlideActions", "ProductCardMagnetic",
  "ProductGridStaggered", "ProductCardSkeleton",
  "ProductSingleFocusSplitScroll", "ProductSingleFocusGallery",
  "ProductSingleFocusZoom", "ProductSingleFocus360",
  "ProductSingleFocusVariantSwap", "ProductSingleFocusStickyBar",
  "CategoryCarousel", "CategoryCarouselNativeSnap", "CategoryCarouselDrag",
  "CategoryCarouselCenterEmphasis", "CategoryCarouselAutoplay", "CategoryCarouselInfinite",
  "TestimonialSlider", "TestimonialSliderCrossfade",
  "TestimonialSliderMultiCard", "TestimonialSliderVideo",
  "BrandStory", "BrandStoryZigZag", "BrandStoryTimeline", "BrandStoryStickyChapter",
  "NewsletterSignup", "NewsletterSignupInline", "NewsletterSignupModal",
  "NewsletterSignupProgressive", "NewsletterSignupSticky",
];

// ---------------------------------------------------------------------------
// Gemini AI Patch
// ---------------------------------------------------------------------------

async function callGeminiPatch(
  currentLayout: any,
  userInstruction: string
): Promise<{ updatedLayout: any; tokensUsed: number; costUsd: number } | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  try {
    const systemPrompt = buildPatchPrompt(currentLayout, userInstruction, REGISTRY_TYPES);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const updatedLayout = JSON.parse(rawText.trim());

    // Estimate token usage
    const promptTokens = Math.round(JSON.stringify(currentLayout).length / 4 + systemPrompt.length / 4);
    const completionTokens = Math.round(rawText.length / 4);
    const totalTokens = promptTokens + completionTokens;
    const costUsd = Number((totalTokens * 0.000004).toFixed(6));

    return { updatedLayout, tokensUsed: totalTokens, costUsd };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Rule-Based Fallback Patch Engine
// ---------------------------------------------------------------------------

function applyRuleBasedPatch(currentLayout: any, instruction: string): { updatedLayout: any; patches: StorePatch[] } {
  const updated = JSON.parse(JSON.stringify(currentLayout));
  const cmd = instruction.toLowerCase().trim();
  const patches: StorePatch[] = [];

  // --- Color Changes ---
  if (cmd.includes("dark") || cmd.includes("black")) {
    updated.theme.colors.background = "#0f172a";
    updated.theme.colors.text = "#f8fafc";
    if (!cmd.includes("gold") && !cmd.includes("red")) {
      updated.theme.colors.primary = "#38bdf8";
    }
    patches.push({ operation: "UPDATE_DESIGN_TOKEN", target: "theme.colors", changes: { background: "#0f172a", text: "#f8fafc" } });
  }
  if (cmd.includes("light") || cmd.includes("white")) {
    updated.theme.colors.background = "#ffffff";
    updated.theme.colors.text = "#1e293b";
    patches.push({ operation: "UPDATE_DESIGN_TOKEN", target: "theme.colors", changes: { background: "#ffffff", text: "#1e293b" } });
  }

  // Primary color
  if (cmd.includes("gold") || cmd.includes("amber")) {
    updated.theme.colors.primary = "#D4AF37";
    patches.push({ operation: "UPDATE_DESIGN_TOKEN", target: "theme.colors.primary", changes: { primary: "#D4AF37" } });
  } else if (cmd.includes("emerald") || cmd.includes("green")) {
    updated.theme.colors.primary = "#10b981";
    patches.push({ operation: "UPDATE_DESIGN_TOKEN", target: "theme.colors.primary", changes: { primary: "#10b981" } });
  } else if (cmd.includes("blue") || cmd.includes("cobalt")) {
    updated.theme.colors.primary = "#1d4ed8";
    patches.push({ operation: "UPDATE_DESIGN_TOKEN", target: "theme.colors.primary", changes: { primary: "#1d4ed8" } });
  } else if (cmd.includes("red") || cmd.includes("crimson")) {
    updated.theme.colors.primary = "#DC2626";
    patches.push({ operation: "UPDATE_DESIGN_TOKEN", target: "theme.colors.primary", changes: { primary: "#DC2626" } });
  } else if (cmd.includes("purple") || cmd.includes("violet")) {
    updated.theme.colors.primary = "#7C3AED";
    patches.push({ operation: "UPDATE_DESIGN_TOKEN", target: "theme.colors.primary", changes: { primary: "#7C3AED" } });
  }

  // --- Typography ---
  if (cmd.includes("serif") || cmd.includes("playfair")) {
    updated.theme.typography.heading = "Playfair Display";
    patches.push({ operation: "UPDATE_DESIGN_TOKEN", target: "theme.typography", changes: { heading: "Playfair Display" } });
  } else if (cmd.includes("sans") || cmd.includes("inter") || cmd.includes("modern font")) {
    updated.theme.typography.heading = "Inter";
    patches.push({ operation: "UPDATE_DESIGN_TOKEN", target: "theme.typography", changes: { heading: "Inter" } });
  }

  // --- Hero heading change ---
  const headingMatch = cmd.match(/(?:heading|title|headline).*?["'](.+?)["']/i) ||
    cmd.match(/(?:heading|title|headline).*?(?:ko|to|change)\s+(.+?)(?:\.|$)/i);
  if (headingMatch) {
    const heroSection = updated.sections?.find((s: any) => s.type?.startsWith("Hero"));
    if (heroSection) {
      heroSection.props.title = headingMatch[1].trim();
      patches.push({ operation: "UPDATE_PROPS", target: heroSection.id, changes: { title: headingMatch[1].trim() } });
    }
  }

  // --- Section additions ---
  const sectionAdditions: Array<{ keywords: string[]; type: string; defaultProps: any }> = [
    {
      keywords: ["newsletter", "subscribe", "email signup"],
      type: "NewsletterSignup",
      defaultProps: { title: "Join Our Inner Circle", subtitle: "Sign up for exclusive offers and new collection alerts.", buttonText: "Subscribe", layout: "box" },
    },
    {
      keywords: ["testimonial", "review", "customer say"],
      type: "TestimonialSlider",
      defaultProps: {
        title: "What Our Customers Say", layout: "carousel",
        testimonials: [
          { id: "1", name: "Ayesha M.", text: "Absolutely stunning quality!", rating: 5, role: "Verified Buyer" },
          { id: "2", name: "Bilal K.", text: "Fast delivery and great packaging.", rating: 5, role: "Verified Buyer" },
        ],
      },
    },
    {
      keywords: ["banner", "promo", "announcement", "sale"],
      type: "PromoBanner",
      defaultProps: { text: "🎉 Free shipping on orders over ₨ 5,000! Limited time offer.", layout: "ribbon" },
    },
    {
      keywords: ["brand story", "about us", "our story"],
      type: "BrandStory",
      defaultProps: { title: "Our Story", paragraphs: ["Every product tells a story of craftsmanship and passion."], imageUrl: "" },
    },
    {
      keywords: ["faq", "questions"],
      type: "FeatureGrid",
      defaultProps: { columns: 2, items: [{ icon: "help-circle", title: "Returns Policy", description: "Easy 7-day returns on all orders." }] },
    },
  ];

  for (const { keywords, type, defaultProps } of sectionAdditions) {
    if (keywords.some((kw) => cmd.includes(kw))) {
      const exists = updated.sections?.some((s: any) => s.type === type);
      if (!exists) {
        const newSec = { id: `${type.toLowerCase()}-${Date.now()}`, type, props: defaultProps };
        if (type === "PromoBanner") {
          updated.sections.unshift(newSec);
        } else {
          updated.sections.push(newSec);
        }
        patches.push({ operation: "CREATE_SECTION", newSection: newSec });
      }
    }
  }

  // --- Section removal ---
  const removeMatch = cmd.match(/(?:remove|delete|hata|nikal)\s+(?:the\s+)?(\w+)/i);
  if (removeMatch) {
    const target = removeMatch[1].toLowerCase();
    const idx = updated.sections?.findIndex((s: any) =>
      s.type.toLowerCase().includes(target) || s.id.toLowerCase().includes(target)
    );
    if (idx !== undefined && idx >= 0) {
      const removed = updated.sections.splice(idx, 1)[0];
      patches.push({ operation: "DELETE_SECTION", target: removed.id });
    }
  }

  // --- Product card styling ---
  if (cmd.includes("rounded") || cmd.includes("round cards")) {
    updated.sections?.forEach((s: any) => {
      if (s.type?.includes("Product")) {
        s.props.cardRadius = "20px";
        s.props.cardShadow = "medium";
        patches.push({ operation: "UPDATE_PROPS", target: s.id, changes: { cardRadius: "20px", cardShadow: "medium" } });
      }
    });
  }

  return { updatedLayout: updated, patches };
}

// ---------------------------------------------------------------------------
// PUBLIC: Apply Patch
// ---------------------------------------------------------------------------

/**
 * Main entry point: take current layout + user instruction → return patched layout.
 */
export async function applyStorePatch(
  currentLayout: any,
  userInstruction: string
): Promise<PatchResult> {
  // 1. Try Gemini AI first
  const aiResult = await callGeminiPatch(currentLayout, userInstruction);

  if (aiResult) {
    // Validate AI output
    const validation = validatePatch(aiResult.updatedLayout, currentLayout);
    if (validation.valid) {
      return {
        success: true,
        updatedLayout: aiResult.updatedLayout,
        patches: [{ operation: "FULL_LAYOUT_UPDATE", changes: {} }],
        validation,
        method: "gemini-ai",
        tokensUsed: aiResult.tokensUsed,
        costUsd: aiResult.costUsd,
      };
    }
    // If AI output is invalid, fall through to rules
  }

  // 2. Rule-based fallback
  const { updatedLayout, patches } = applyRuleBasedPatch(currentLayout, userInstruction);
  const validation = validatePatch(updatedLayout, currentLayout);

  return {
    success: patches.length > 0,
    updatedLayout,
    patches,
    validation,
    method: "rule-fallback",
    tokensUsed: 0,
    costUsd: 0,
  };
}
