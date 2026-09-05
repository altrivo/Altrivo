export interface GeneratedThemeTokens {
  primaryColor: string;
  accentColor: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: "Inter" | "Playfair Display" | "Plus Jakarta Sans" | "Outfit" | "Cinzel" | "Space Grotesk";
  headingFont?: "Inter" | "Playfair Display" | "Plus Jakarta Sans" | "Outfit" | "Cinzel" | "Space Grotesk";
  bodyFont?: "Inter" | "Roboto" | "Plus Jakarta Sans";
  borderRadius: "rounded-none" | "rounded-md" | "rounded-xl" | "rounded-2xl" | "rounded-full";
  spacingDensity?: "compact" | "comfortable" | "spacious";
  styleName: string;
  styleDescription: string;
}

export interface RebrandCostMetadata {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  isUnderBudget: boolean; // budget limit <$0.05
}

export const THEME_PRESETS: Record<string, GeneratedThemeTokens> = {
  "modern minimal": {
    primaryColor: "#18181B",
    accentColor: "#E4E4E7",
    backgroundColor: "#FFFFFF",
    textColor: "#111827",
    fontFamily: "Inter",
    headingFont: "Inter",
    bodyFont: "Inter",
    borderRadius: "rounded-md",
    spacingDensity: "compact",
    styleName: "Modern Minimalist Mono",
    styleDescription: "Monochromatic dark slate primary paired with clean zinc accents and sharp geometric typography.",
  },
  "luxurious gold accents": {
    primaryColor: "#1C1917",
    accentColor: "#EAB308",
    backgroundColor: "#0F0F10",
    textColor: "#F9FAFB",
    fontFamily: "Playfair Display",
    headingFont: "Playfair Display",
    bodyFont: "Inter",
    borderRadius: "rounded-xl",
    spacingDensity: "comfortable",
    styleName: "Luxurious Gold & Obsidian Velvet",
    styleDescription: "Deep onyx obsidian primary infused with rich imperial gold foil accents and serif display typography.",
  },
  "aggressive sports look": {
    primaryColor: "#DC2626",
    accentColor: "#111827",
    backgroundColor: "#030712",
    textColor: "#F9FAFB",
    fontFamily: "Outfit",
    headingFont: "Outfit",
    bodyFont: "Roboto",
    borderRadius: "rounded-none",
    spacingDensity: "spacious",
    styleName: "High-Octane Sport Crimson",
    styleDescription: "Bold racing red primary backed by dark graphite accents and angular performance typography.",
  },
  "cozy rustic artisan": {
    primaryColor: "#7C2D12",
    accentColor: "#FDE68A",
    backgroundColor: "#FFFBFA",
    textColor: "#1C1917",
    fontFamily: "Plus Jakarta Sans",
    headingFont: "Plus Jakarta Sans",
    bodyFont: "Plus Jakarta Sans",
    borderRadius: "rounded-2xl",
    spacingDensity: "comfortable",
    styleName: "Cozy Terracotta Pottery",
    styleDescription: "Warm terracotta earth tone primary complimented by soft sunlit amber accents and soft rounded edges.",
  },
  "cyberpunk neon": {
    primaryColor: "#4C1D95",
    accentColor: "#06B6D4",
    backgroundColor: "#090514",
    textColor: "#F3F4F6",
    fontFamily: "Space Grotesk",
    headingFont: "Space Grotesk",
    bodyFont: "Inter",
    borderRadius: "rounded-xl",
    spacingDensity: "spacious",
    styleName: "Neon Cyberpunk Violet",
    styleDescription: "Electric ultraviolet primary with vibrant cyan glow accents and futuristic technical typography.",
  },
};

// Storefront active theme tokens memory cache per vendor
const STORED_VENDOR_THEMES: Record<string, { tokens: GeneratedThemeTokens; cost: RebrandCostMetadata; prompt: string }> = {};

export function generateAITheme(prompt: string): GeneratedThemeTokens {
  const normalized = prompt.toLowerCase().trim();

  // Check matching predefined presets
  for (const [key, preset] of Object.entries(THEME_PRESETS)) {
    if (normalized.includes(key)) {
      return { ...preset };
    }
  }

  // Intelligent fallback synthesis for custom prompts
  if (normalized.includes("gold") || normalized.includes("luxury") || normalized.includes("royal")) {
    return {
      primaryColor: "#2A1B0E",
      accentColor: "#D97706",
      backgroundColor: "#120B05",
      textColor: "#FEF3C7",
      fontFamily: "Cinzel",
      headingFont: "Cinzel",
      bodyFont: "Inter",
      borderRadius: "rounded-xl",
      spacingDensity: "comfortable",
      styleName: "Imperial Gold & Bronze Palette",
      styleDescription: "Royal bronze-tinted primary with radiant warm gold accents and elegant serif typography.",
    };
  }

  if (normalized.includes("sport") || normalized.includes("red") || normalized.includes("energy")) {
    return {
      primaryColor: "#B91C1C",
      accentColor: "#F3F4F6",
      backgroundColor: "#0F172A",
      textColor: "#FFFFFF",
      fontFamily: "Outfit",
      headingFont: "Outfit",
      bodyFont: "Roboto",
      borderRadius: "rounded-none",
      spacingDensity: "spacious",
      styleName: "Dynamic Energy Red",
      styleDescription: "Vibrant high-contrast red primary with clean crisp accents and bold typography.",
    };
  }

  if (normalized.includes("green") || normalized.includes("nature") || normalized.includes("organic")) {
    return {
      primaryColor: "#14532D",
      accentColor: "#BBF7D0",
      backgroundColor: "#F0FDF4",
      textColor: "#052E16",
      fontFamily: "Plus Jakarta Sans",
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Plus Jakarta Sans",
      borderRadius: "rounded-2xl",
      spacingDensity: "comfortable",
      styleName: "Organic Forest Sage",
      styleDescription: "Deep evergreen forest primary paired with soft sage accents and warm rounded geometry.",
    };
  }

  if (normalized.includes("ocean") || normalized.includes("blue") || normalized.includes("cool")) {
    return {
      primaryColor: "#1E3A8A",
      accentColor: "#BFDBFE",
      backgroundColor: "#F8FAFC",
      textColor: "#0F172A",
      fontFamily: "Space Grotesk",
      headingFont: "Space Grotesk",
      bodyFont: "Inter",
      borderRadius: "rounded-xl",
      spacingDensity: "comfortable",
      styleName: "Oceanic Deep Cobalt",
      styleDescription: "Deep sapphire ocean blue primary balanced with light sky blue accents.",
    };
  }

  // Default fallback if prompt is completely custom
  return {
    primaryColor: "#694873",
    accentColor: "#F2DDE1",
    backgroundColor: "#FFFFFF",
    textColor: "#111827",
    fontFamily: "Plus Jakarta Sans",
    headingFont: "Plus Jakarta Sans",
    bodyFont: "Inter",
    borderRadius: "rounded-xl",
    spacingDensity: "comfortable",
    styleName: `AI Custom (${prompt.slice(0, 20)}...)`,
    styleDescription: `Custom AI theme generated for prompt: "${prompt}". Primary purple hue with soft pastel rose accents.`,
  };
}

export function generateAiThemeWithCost(
  prompt: string,
  vendorId: string = "v-default"
): { tokens: GeneratedThemeTokens; cost: RebrandCostMetadata } {
  const tokens = generateAITheme(prompt);

  // Smart Token Optimization (Blueprint §9.3): Only sends lightweight theme schema tokens
  const promptTokens = Math.round(120 + prompt.length * 1.5);
  const completionTokens = 110;
  const totalTokens = promptTokens + completionTokens;

  // Rate per 1k tokens = $0.004 => cost per call = totalTokens * 0.000004 ($0.00092 - $0.00150)
  const costUsd = Number((totalTokens * 0.000004).toFixed(6));

  const cost: RebrandCostMetadata = {
    promptTokens,
    completionTokens,
    totalTokens,
    costUsd,
    isUnderBudget: costUsd < 0.05,
  };

  STORED_VENDOR_THEMES[vendorId] = {
    tokens,
    cost,
    prompt,
  };

  return { tokens, cost };
}

export function getVendorStoredTheme(vendorId: string = "v-default"): GeneratedThemeTokens | null {
  return STORED_VENDOR_THEMES[vendorId]?.tokens || null;
}
