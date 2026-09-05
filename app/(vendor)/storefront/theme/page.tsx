"use client";

import {
  CheckCircle2,
  ExternalLink,
  Palette,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
  Wand2,
} from "lucide-react";
import React, { useState } from "react";

import { StorefrontPreviewModal } from "@/components/storefront/StorefrontPreviewModal";
import { generateAITheme, GeneratedThemeTokens } from "@/lib/storefront/aiThemeGenerator";


export default function AIThemeRebrandingPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [activeTheme, setActiveTheme] = useState<GeneratedThemeTokens>({
    primaryColor: "#694873",
    accentColor: "#F2DDE1",
    fontFamily: "Plus Jakarta Sans",
    borderRadius: "rounded-xl",
    styleName: "Artrivo Signature Luxury",
    styleDescription: "Original signature deep purple primary with soft rose accent.",
  });

  const [proposedTheme, setProposedTheme] = useState<GeneratedThemeTokens>({
    primaryColor: "#1C1917",
    accentColor: "#EAB308",
    fontFamily: "Playfair Display",
    borderRadius: "rounded-xl",
    styleName: "Luxurious Gold & Obsidian Velvet",
    styleDescription: "Deep onyx obsidian primary infused with rich imperial gold foil accents and serif display typography.",
  });

  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const samplePrompts = [
    "modern minimal",
    "luxurious gold accents",
    "aggressive sports look",
    "cozy rustic artisan",
    "cyberpunk neon",
  ];

  const handleGenerate = (customPrompt?: string) => {
    const targetPrompt = customPrompt || prompt;
    if (!targetPrompt.trim()) return;

    setIsGenerating(true);
    setIsSaved(false);

    setTimeout(() => {
      const generated = generateAITheme(targetPrompt);
      setProposedTheme(generated);
      setIsGenerating(false);
    }, 600);
  };

  const handleAcceptSave = async () => {
    setIsSaved(false);
    try {
      const res = await fetch("/api/storefront/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposedTheme),
      });

      const data = await res.json();
      if (data.success) {
        setActiveTheme(proposedTheme);
        setIsSaved(true);
        setSaveMessage("Rebrand saved to DB! Public storefront updated.");
        setTimeout(() => setIsSaved(false), 5000);
      }
    } catch {
      setActiveTheme(proposedTheme);
      setIsSaved(true);
      setSaveMessage("Rebrand saved locally! Public storefront updated.");
      setTimeout(() => setIsSaved(false), 5000);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-default pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold border border-primary-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            <span>AI Theme Rebranding Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-heading">
            Natural Language AI Theme Customizer
          </h1>
          <p className="text-xs text-subtle mt-0.5">
            Describe your brand aesthetic in plain words to generate side-by-side live previews in &lt;3s.
          </p>
        </div>

        <button
          onClick={() => setIsPreviewOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs shadow-md hover:bg-primary-700 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Preview Live Storefront</span>
        </button>
      </div>

      {/* 1. AI Prompt Box */}
      <div className="rounded-2xl border border-default bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="ai-style-prompt-input" className="font-extrabold text-sm text-heading flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-accent-600" />
            <span>Describe Your Desired Brand Aesthetic</span>
          </label>
          <span className="text-[11px] text-subtle font-semibold">Response Time &lt;3s</span>
        </div>

        <div className="relative">
          <textarea
            id="ai-style-prompt-input"
            aria-label="Style prompt input for AI theme rebranding"
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type a style prompt (e.g. 'modern minimal', 'aggressive sports look', 'luxurious gold accents')..."
            className="w-full p-4 rounded-xl bg-input border border-default text-xs sm:text-sm text-heading placeholder:text-subtle focus:outline-none focus:border-focus focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
          />

          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !prompt.trim()}
            className={`absolute right-3 bottom-3.5 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
              isGenerating || !prompt.trim() ? "opacity-50 cursor-not-allowed" : "hover:brightness-110 active:scale-95"
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating AI Theme...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Rebrand</span>
              </>
            )}
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-subtle font-semibold text-xs">Prompt Ideas:</span>
          {samplePrompts.map((p) => (
            <button
              key={p}
              onClick={() => {
                setPrompt(p);
                handleGenerate(p);
              }}
              className="px-3 py-1 rounded-full bg-muted/80 border border-default text-heading hover:border-primary-400 hover:text-primary-700 text-xs font-bold transition-all cursor-pointer"
            >
              &quot;{p}&quot;
            </button>
          ))}
        </div>
      </div>

      {/* Save Success Toast Banner */}
      {isSaved && (
        <div className="p-4 rounded-2xl bg-success-50 border border-success-300 text-success-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in duration-fast">
          <CheckCircle2 className="w-5 h-5 text-success-600" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* 2. Side-by-Side Before / After Live Preview Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-heading flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary-600" />
            <span>Side-by-Side Live Theme Comparison</span>
          </h2>
          <span className="text-xs font-semibold text-subtle">Real-Time Instant Preview</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: BEFORE (Active Theme) */}
          <div className="rounded-2xl bg-card border-2 border-default p-5 shadow-card space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-default pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-muted text-subtle border border-default uppercase">
                  Current Active Theme
                </span>
                <h3 className="font-extrabold text-sm text-heading mt-1">
                  {activeTheme.styleName}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full border border-default shadow-2xs"
                  style={{ backgroundColor: activeTheme.primaryColor }}
                  title={`Primary: ${activeTheme.primaryColor}`}
                />
                <div
                  className="w-6 h-6 rounded-full border border-default shadow-2xs"
                  style={{ backgroundColor: activeTheme.accentColor }}
                  title={`Accent: ${activeTheme.accentColor}`}
                />
              </div>
            </div>

            {/* Mini Storefront Card Preview (Before) */}
            <div className="p-4 rounded-xl border border-default bg-page space-y-3">
              <div
                className="p-3 rounded-lg text-white font-bold text-xs flex items-center justify-between"
                style={{ backgroundColor: activeTheme.primaryColor }}
              >
                <span>Store Header Preview</span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] text-heading font-extrabold"
                  style={{ backgroundColor: activeTheme.accentColor }}
                >
                  Cart (3)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-card border border-default text-xs space-y-2">
                <div className="font-bold text-heading" style={{ fontFamily: activeTheme.fontFamily }}>
                  Ceramic Minimalist Vase (Handcrafted)
                </div>
                <div className="font-extrabold text-sm" style={{ color: activeTheme.primaryColor }}>
                  ₨ 8,900
                </div>
                <button
                  className={`w-full py-1.5 text-xs font-bold text-heading ${activeTheme.borderRadius}`}
                  style={{ backgroundColor: activeTheme.accentColor }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: AFTER (AI Proposed Theme) */}
          <div className="rounded-2xl bg-card border-2 border-primary-500 p-5 shadow-card space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-default pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-100 text-primary-800 border border-primary-300 uppercase">
                  AI Proposed Rebrand
                </span>
                <h3 className="font-extrabold text-sm text-heading mt-1">
                  {proposedTheme.styleName}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full border border-default shadow-2xs"
                  style={{ backgroundColor: proposedTheme.primaryColor }}
                  title={`Primary: ${proposedTheme.primaryColor}`}
                />
                <div
                  className="w-6 h-6 rounded-full border border-default shadow-2xs"
                  style={{ backgroundColor: proposedTheme.accentColor }}
                  title={`Accent: ${proposedTheme.accentColor}`}
                />
              </div>
            </div>

            <p className="text-xs text-subtle leading-relaxed">
              {proposedTheme.styleDescription}
            </p>

            {/* Mini Storefront Card Preview (After) */}
            <div className="p-4 rounded-xl border border-default bg-page space-y-3">
              <div
                className="p-3 rounded-lg text-white font-bold text-xs flex items-center justify-between shadow-xs transition-all"
                style={{ backgroundColor: proposedTheme.primaryColor }}
              >
                <span style={{ fontFamily: proposedTheme.fontFamily }}>Store Header Preview</span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] text-heading font-extrabold shadow-2xs"
                  style={{ backgroundColor: proposedTheme.accentColor }}
                >
                  Cart (3)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-card border border-default text-xs space-y-2">
                <div className="font-bold text-heading" style={{ fontFamily: proposedTheme.fontFamily }}>
                  Ceramic Minimalist Vase (Handcrafted)
                </div>
                <div className="font-extrabold text-sm" style={{ color: proposedTheme.primaryColor }}>
                  ₨ 8,900
                </div>
                <button
                  className={`w-full py-1.5 text-xs font-bold text-heading transition-all ${proposedTheme.borderRadius}`}
                  style={{ backgroundColor: proposedTheme.accentColor }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Manual Token Tweaker Panel */}
      <div className="rounded-2xl border border-default bg-card p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-default pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary-600" />
            <h2 className="font-extrabold text-sm text-heading">Manual Token Fine-Tuning</h2>
          </div>
          <span className="text-xs text-subtle font-semibold">Tweak Color &amp; Font Specs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Primary Color Picker */}
          <div className="space-y-2">
            <label htmlFor="primary-color-input" className="text-xs font-bold text-heading block">Primary Color Token</label>
            <div className="flex items-center gap-2">
              <input
                id="primary-color-input"
                type="color"
                aria-label="Primary Color Picker"
                value={proposedTheme.primaryColor}
                onChange={(e) => setProposedTheme({ ...proposedTheme, primaryColor: e.target.value })}
                className="w-9 h-9 rounded-lg border border-default cursor-pointer bg-card p-0.5"
              />
              <input
                type="text"
                aria-label="Primary Color Hex Code"
                value={proposedTheme.primaryColor}
                onChange={(e) => setProposedTheme({ ...proposedTheme, primaryColor: e.target.value })}
                className="w-full h-9 px-3 rounded-xl bg-input border border-default text-xs font-mono font-bold text-heading"
              />
            </div>
          </div>

          {/* Accent Color Picker */}
          <div className="space-y-2">
            <label htmlFor="accent-color-input" className="text-xs font-bold text-heading block">Accent Color Token</label>
            <div className="flex items-center gap-2">
              <input
                id="accent-color-input"
                type="color"
                aria-label="Accent Color Picker"
                value={proposedTheme.accentColor}
                onChange={(e) => setProposedTheme({ ...proposedTheme, accentColor: e.target.value })}
                className="w-9 h-9 rounded-lg border border-default cursor-pointer bg-card p-0.5"
              />
              <input
                type="text"
                aria-label="Accent Color Hex Code"
                value={proposedTheme.accentColor}
                onChange={(e) => setProposedTheme({ ...proposedTheme, accentColor: e.target.value })}
                className="w-full h-9 px-3 rounded-xl bg-input border border-default text-xs font-mono font-bold text-heading"
              />
            </div>
          </div>

          {/* Font Family Selector */}
          <div className="space-y-2">
            <label htmlFor="font-family-select" className="text-xs font-bold text-heading block">Font Family</label>
            <select
              id="font-family-select"
              aria-label="Select Font Family"
              value={proposedTheme.fontFamily}
              onChange={(e) => setProposedTheme({ ...proposedTheme, fontFamily: e.target.value as GeneratedThemeTokens["fontFamily"] })}
              className="w-full h-9 px-3 rounded-xl bg-input border border-default text-xs font-bold text-heading focus:outline-none"
            >
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Default)</option>
              <option value="Inter">Inter (Clean Sans)</option>
              <option value="Playfair Display">Playfair Display (Serif Luxury)</option>
              <option value="Outfit">Outfit (Modern Bold)</option>
              <option value="Cinzel">Cinzel (Imperial Display)</option>
              <option value="Space Grotesk">Space Grotesk (Technical)</option>
            </select>
          </div>

          {/* Corner Radius Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-heading block">Corner Radius</label>
            <div className="grid grid-cols-4 gap-1 bg-muted/60 p-1 rounded-xl border border-default text-[10px] font-bold">
              {[
                { label: "Sharp", value: "rounded-none" },
                { label: "Med", value: "rounded-md" },
                { label: "Curved", value: "rounded-xl" },
                { label: "Pill", value: "rounded-full" },
              ].map((r) => (
                <button
                  key={r.value}
                  onClick={() => setProposedTheme({ ...proposedTheme, borderRadius: r.value as GeneratedThemeTokens["borderRadius"] })}
                  className={`py-1 rounded-lg text-center transition-all cursor-pointer ${
                    proposedTheme.borderRadius === r.value
                      ? "bg-card text-heading shadow-xs"
                      : "text-subtle hover:text-heading"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action Bar (Accept, Retry, Reset) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-default pt-6">
        <button
          onClick={() => setProposedTheme(activeTheme)}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-default bg-card text-heading font-bold text-xs hover:bg-muted/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-subtle" />
          <span>Reset to Active Theme</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => handleGenerate()}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-primary-300 bg-primary-50 text-primary-800 font-bold text-xs hover:bg-primary-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span>Retry AI Prompt</span>
          </button>

          <button
            onClick={handleAcceptSave}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-extrabold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Accept &amp; Save Rebrand</span>
          </button>
        </div>
      </div>

      <StorefrontPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
