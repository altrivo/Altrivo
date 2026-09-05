"use client";

import React, { useState } from "react";
import { THEME_OPTIONS, ThemeOption } from "@/lib/onboarding";
import { ThemePreview } from "@/components/onboarding/ThemePreview";

interface Props {
  selectedThemeId: string;
  onSelectTheme: (themeId: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function Step3ThemeSelection({
  selectedThemeId,
  onSelectTheme,
  onNext,
  onBack,
  onSkip,
}: Props) {
  const [previewTheme, setPreviewTheme] = useState<ThemeOption | null>(null);

  const activeTheme = THEME_OPTIONS.find((t) => t.id === selectedThemeId) || THEME_OPTIONS[0];

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-xs font-semibold text-primary-700 border border-primary-100">
          Step 3 of 4 &bull; Store Aesthetic & Theme
        </div>
        <h1 className="text-3xl font-bold text-heading tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Pick your AI-Generated Theme
        </h1>
        <p className="text-body text-sm max-w-md mx-auto">
          Choose a visual design for your online store. You can customize colors, fonts, and banner sections anytime from your dashboard.
        </p>
      </div>

      {/* Grid of 6 Themes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {THEME_OPTIONS.map((theme) => {
          const isSelected = selectedThemeId === theme.id;
          return (
            <div
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`group relative rounded-2xl border bg-card overflow-hidden transition-all duration-200 cursor-pointer flex flex-col ${
                isSelected
                  ? "border-primary-500 ring-2 ring-primary-500/20 shadow-lg scale-[1.01]"
                  : "border-default hover:border-strong hover:shadow-md"
              }`}
            >
              {/* Live storefront preview rendered in the theme itself */}
              <div className="relative w-full overflow-hidden border-b border-default">
                <ThemePreview theme={theme} />

                {/* Category Tag */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white">
                  {theme.tag}
                </div>

                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-primary-500 text-on-primary text-xs font-bold flex items-center gap-1 shadow-md">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Selected
                  </div>
                )}

                {/* Palette + typography summary */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-inner"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-inner"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <span className="text-[11px] ml-1 opacity-90">{theme.fontFamily}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTheme(theme);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-md text-[11px] font-medium transition-colors"
                  >
                    Full Preview
                  </button>
                </div>
              </div>

              {/* Theme Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-heading text-lg group-hover:text-primary-600 transition-colors">
                      {theme.name}
                    </h3>
                  </div>
                  <p className="text-xs text-body mt-1 leading-relaxed">
                    {theme.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-default text-xs">
                  <span className="text-subtle font-medium capitalize">Layout: {theme.layout}</span>
                  <span className={`font-semibold ${isSelected ? "text-primary-600" : "text-subtle"}`}>
                    {isSelected ? "Active Theme" : "Click to select"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Preview Modal */}
      {previewTheme && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-fadeIn">
          <div className="bg-card border border-default max-w-3xl w-full rounded-2xl p-6 shadow-xl space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-default pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: previewTheme.primaryColor }}
                />
                <h3 className="font-bold text-heading text-lg">{previewTheme.name} Preview</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-muted text-subtle">
                  {previewTheme.tag}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTheme(null)}
                className="text-subtle hover:text-heading text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-default">
              <ThemePreview theme={previewTheme} showChrome />
            </div>

            <p className="text-sm text-body leading-relaxed">{previewTheme.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-page border border-default">
                <div className="text-subtle">Layout</div>
                <div className="font-semibold text-heading capitalize">{previewTheme.layout}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-page border border-default">
                <div className="text-subtle">Typeface</div>
                <div className="font-semibold text-heading truncate">{previewTheme.fontFamily}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-page border border-default">
                <div className="text-subtle">Corners</div>
                <div className="font-semibold text-heading">{previewTheme.tokens.radius}px</div>
              </div>
              <div className="p-2.5 rounded-lg bg-page border border-default">
                <div className="text-subtle">Palette</div>
                <div className="flex items-center gap-1.5 mt-1">
                  {[previewTheme.tokens.bg, previewTheme.tokens.primary, previewTheme.tokens.accent, previewTheme.tokens.text].map(
                    (c) => (
                      <span
                        key={c}
                        className="w-4 h-4 rounded-full border border-default"
                        style={{ backgroundColor: c }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewTheme(null)}
                className="px-4 py-2 text-sm font-medium text-body hover:text-heading"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTheme(previewTheme.id);
                  setPreviewTheme(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary-500 text-on-primary text-sm font-semibold hover:bg-primary-600 transition-colors"
              >
                Select {previewTheme.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 h-12 rounded-xl border border-default bg-card text-heading font-medium text-sm hover:bg-muted transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="px-5 h-12 rounded-xl text-subtle hover:text-heading font-medium text-sm transition-colors cursor-pointer"
          >
            Skip theme setup
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 px-8 h-12 rounded-xl bg-primary-500 text-on-primary font-semibold text-sm shadow-md hover:bg-primary-600 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Confirm {activeTheme.name}</span>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
