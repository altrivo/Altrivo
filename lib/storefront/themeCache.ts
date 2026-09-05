import { GeneratedThemeTokens, getVendorStoredTheme } from "./aiThemeGenerator";

export interface VendorThemeTokenCacheEntry {
  tokens: GeneratedThemeTokens;
  cachedAt: number;
  expiresAt: number;
}

const VENDOR_THEME_CACHE: Map<string, VendorThemeTokenCacheEntry> = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute TTL

export const DEFAULT_FALLBACK_TOKENS: GeneratedThemeTokens = {
  primaryColor: "#694873",
  accentColor: "#F2DDE1",
  backgroundColor: "#FFFFFF",
  textColor: "#111827",
  fontFamily: "Plus Jakarta Sans",
  headingFont: "Plus Jakarta Sans",
  bodyFont: "Inter",
  borderRadius: "rounded-xl",
  spacingDensity: "comfortable",
  styleName: "Default Artrivo Theme",
  styleDescription: "Default marketplace aesthetic with signature purple and pastel rose accents.",
};

export async function getVendorThemeTokensSSR(vendorId: string = "v-default"): Promise<{
  tokens: GeneratedThemeTokens;
  fromCache: boolean;
}> {
  const now = Date.now();
  const cached = VENDOR_THEME_CACHE.get(vendorId);

  if (cached && cached.expiresAt > now) {
    return { tokens: cached.tokens, fromCache: true };
  }

  // Fetch from theme_tokens DB / repository
  let tokens = getVendorStoredTheme(vendorId);

  if (!tokens) {
    tokens = DEFAULT_FALLBACK_TOKENS;
  }

  VENDOR_THEME_CACHE.set(vendorId, {
    tokens,
    cachedAt: now,
    expiresAt: now + CACHE_TTL_MS,
  });

  return { tokens, fromCache: false };
}

export function invalidateVendorThemeCache(vendorId: string): void {
  VENDOR_THEME_CACHE.delete(vendorId);
}

export function clearAllVendorThemeCache(): void {
  VENDOR_THEME_CACHE.clear();
}

export function generateThemeCssVariables(tokens: GeneratedThemeTokens): string {
  const radiusMap: Record<string, string> = {
    "rounded-none": "0px",
    "rounded-md": "6px",
    "rounded-xl": "12px",
    "rounded-2xl": "16px",
    "rounded-full": "9999px",
  };

  const radiusPx = radiusMap[tokens.borderRadius] || "12px";

  return `
    :root {
      --theme-primary: ${tokens.primaryColor};
      --theme-accent: ${tokens.accentColor};
      --theme-bg: ${tokens.backgroundColor || "#FFFFFF"};
      --theme-text: ${tokens.textColor || "#111827"};
      --theme-heading-font: '${tokens.headingFont || tokens.fontFamily || "Inter"}', sans-serif;
      --theme-body-font: '${tokens.bodyFont || "Inter"}', sans-serif;
      --theme-radius: ${radiusPx};
    }
  `.trim();
}
