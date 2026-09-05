import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";

import AIThemeRebrandingPage from "@/app/(vendor)/storefront/theme/page";
import { generateAITheme, THEME_PRESETS } from "@/lib/storefront/aiThemeGenerator";
import { POST as handleThemePost } from "@/app/api/storefront/theme/route";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("AI Theme Rebranding Engine & Interface", () => {
  describe("aiThemeGenerator", () => {
    it("generates correct theme tokens for 'modern minimal' prompt", () => {
      const theme = generateAITheme("modern minimal");
      expect(theme.primaryColor).toBe(THEME_PRESETS["modern minimal"].primaryColor);
      expect(theme.accentColor).toBe(THEME_PRESETS["modern minimal"].accentColor);
      expect(theme.fontFamily).toBe("Inter");
    });

    it("generates correct theme tokens for 'luxurious gold accents' prompt", () => {
      const theme = generateAITheme("luxurious gold accents");
      expect(theme.primaryColor).toBe(THEME_PRESETS["luxurious gold accents"].primaryColor);
      expect(theme.accentColor).toBe(THEME_PRESETS["luxurious gold accents"].accentColor);
      expect(theme.fontFamily).toBe("Playfair Display");
    });

    it("generates correct theme tokens for 'aggressive sports look' prompt", () => {
      const theme = generateAITheme("aggressive sports look");
      expect(theme.primaryColor).toBe(THEME_PRESETS["aggressive sports look"].primaryColor);
      expect(theme.fontFamily).toBe("Outfit");
      expect(theme.borderRadius).toBe("rounded-none");
    });
  });

  describe("API Theme Persistence Route Handler", () => {
    it("persists theme tokens and returns 200 success response", async () => {
      const req = {
        json: async () => ({
          primaryColor: "#DC2626",
          accentColor: "#111827",
          fontFamily: "Outfit",
          borderRadius: "rounded-none",
          styleName: "High-Octane Sport Crimson",
        }),
      };

      const res = await handleThemePost(req as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.theme.primaryColor).toBe("#DC2626");
    });

    it("rejects invalid request body missing required color tokens", async () => {
      const req = {
        json: async () => ({}),
      };

      const res = await handleThemePost(req as any);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
    });
  });

  describe("AIThemeRebrandingPage Component", () => {
    it("renders prompt form, suggestion chips, side-by-side comparison, and manual tweakers", () => {
      render(<AIThemeRebrandingPage />);

      expect(screen.getByText("AI Theme Rebranding Studio")).toBeDefined();
      expect(screen.getByLabelText("Style prompt input for AI theme rebranding")).toBeDefined();

      // Suggestion chips
      expect(screen.getByText('"modern minimal"')).toBeDefined();
      expect(screen.getByText('"luxurious gold accents"')).toBeDefined();

      // Side-by-Side comparison panels
      expect(screen.getByText("Current Active Theme")).toBeDefined();
      expect(screen.getByText("AI Proposed Rebrand")).toBeDefined();

      // Manual token tweak inputs
      expect(screen.getByLabelText("Primary Color Picker")).toBeDefined();
      expect(screen.getByLabelText("Accent Color Picker")).toBeDefined();
      expect(screen.getByLabelText("Select Font Family")).toBeDefined();

      // Actions
      expect(screen.getByText("Accept & Save Rebrand")).toBeDefined();
    });

    it("handles prompt submission and updates proposed preview", () => {
      render(<AIThemeRebrandingPage />);

      const promptInput = screen.getByLabelText("Style prompt input for AI theme rebranding");
      const generateBtn = screen.getByText("Generate Rebrand");

      fireEvent.change(promptInput, { target: { value: "cyberpunk neon" } });
      fireEvent.click(generateBtn);

      expect(screen.getByText("Generating AI Theme...")).toBeDefined();
    });
  });
});
