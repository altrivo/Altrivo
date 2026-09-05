import {
  getVendorThemeTokensSSR,
  invalidateVendorThemeCache,
  clearAllVendorThemeCache,
  generateThemeCssVariables,
  DEFAULT_FALLBACK_TOKENS,
} from "@/lib/storefront/themeCache";
import { generateAiThemeWithCost } from "@/lib/storefront/aiThemeGenerator";

describe("Theme Token Injection at SSR + 5-Min TTL Cache Layer", () => {
  beforeEach(() => {
    clearAllVendorThemeCache();
  });

  it("fetches vendor theme tokens with 5-minute TTL caching", async () => {
    const vendorId = "vendor_brandxyz";

    // Seed vendor custom theme
    generateAiThemeWithCost("cyberpunk neon", vendorId);

    // Initial fetch -> should resolve from DB / store (fromCache: false)
    const firstFetch = await getVendorThemeTokensSSR(vendorId);
    expect(firstFetch.fromCache).toBe(false);
    expect(firstFetch.tokens.primaryColor).toBe("#4C1D95");
    expect(firstFetch.tokens.accentColor).toBe("#06B6D4");

    // Second fetch within 5 minutes -> should hit cache (fromCache: true)
    const secondFetch = await getVendorThemeTokensSSR(vendorId);
    expect(secondFetch.fromCache).toBe(true);
    expect(secondFetch.tokens.primaryColor).toBe("#4C1D95");
  });

  it("invalidates vendor theme cache immediately when vendor edits theme", async () => {
    const vendorId = "vendor_brandxyz";

    generateAiThemeWithCost("modern minimal", vendorId);
    await getVendorThemeTokensSSR(vendorId);

    // Update theme
    generateAiThemeWithCost("luxurious gold accents", vendorId);
    invalidateVendorThemeCache(vendorId);

    // Fetch after invalidation -> must bypass cache (fromCache: false) and return new tokens
    const refreshedFetch = await getVendorThemeTokensSSR(vendorId);
    expect(refreshedFetch.fromCache).toBe(false);
    expect(refreshedFetch.tokens.primaryColor).toBe("#1C1917");
    expect(refreshedFetch.tokens.accentColor).toBe("#EAB308");
  });

  it("falls back gracefully to default theme tokens when custom tokens are missing", async () => {
    const unknownVendorId = "vendor_unknown_123";

    const fetchResult = await getVendorThemeTokensSSR(unknownVendorId);
    expect(fetchResult.tokens.primaryColor).toBe(DEFAULT_FALLBACK_TOKENS.primaryColor);
    expect(fetchResult.tokens.accentColor).toBe(DEFAULT_FALLBACK_TOKENS.accentColor);
    expect(fetchResult.tokens.styleName).toBe("Default Artrivo Theme");
  });

  it("generates formatted CSS root variables string for SSR injection", () => {
    const cssVars = generateThemeCssVariables({
      primaryColor: "#1C1917",
      accentColor: "#EAB308",
      backgroundColor: "#0F0F10",
      textColor: "#F9FAFB",
      headingFont: "Playfair Display",
      bodyFont: "Inter",
      borderRadius: "rounded-xl",
      styleName: "Test",
      styleDescription: "Test",
    });

    expect(cssVars).toContain("--theme-primary: #1C1917;");
    expect(cssVars).toContain("--theme-accent: #EAB308;");
    expect(cssVars).toContain("--theme-bg: #0F0F10;");
    expect(cssVars).toContain("--theme-heading-font: 'Playfair Display', sans-serif;");
    expect(cssVars).toContain("--theme-radius: 12px;");
  });
});
