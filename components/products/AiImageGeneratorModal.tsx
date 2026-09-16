"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/shared";
import {
  ArrowLeft,
  RefreshCw,
  Sparkles,
  X,
  Check,
} from "@/components/shared/LucideIcons";
import { generate4AiProductImages } from "@/services/ai-image-generator";

export type PhotographyStyle = "studio" | "lifestyle" | "flatlay" | "moody";

interface StyleOption {
  id: PhotographyStyle;
  title: string;
  description: string;
  icon: string;
  promptSuffix: string;
}

const photographyStyles: StyleOption[] = [
  {
    id: "studio",
    title: "Studio White BG",
    description: "Clean isolated product shot on seamless white background with soft shadow",
    icon: "🏢",
    promptSuffix: "commercial studio product photography, isolated on clean white background, soft shadow, 4k detail, no humans",
  },
  {
    id: "lifestyle",
    title: "Lifestyle Scene",
    description: "In-context realistic environment with warm natural sunlight styling",
    icon: "🌿",
    promptSuffix: "aesthetic lifestyle product photography, natural warm sunlight, in-context realistic environment, elegant setup, 4k detail",
  },
  {
    id: "flatlay",
    title: "Flat Lay Overhead",
    description: "Top-down 90° overhead aesthetic arrangement with complementary props",
    icon: "📐",
    promptSuffix: "flat lay product photography, top-down 90 degree view, aesthetic organized arrangement, minimalist props, 4k detail",
  },
  {
    id: "moody",
    title: "Dark Moody",
    description: "Dramatic dark ambient lighting, high contrast & cinematic shadows",
    icon: "🌑",
    promptSuffix: "dark moody product photography, dramatic ambient lighting, cinematic shadows, high contrast, luxury presentation, 4k detail",
  },
];

const fallbackPool = [
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&auto=format&fit=crop&q=80",
];

interface GeneratedPhotoItem {
  id: string;
  url: string;
  fallbackUrl?: string;
  angleName: string;
  prompt?: string;
}

interface AiImageGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  onAddImages: (urls: string[]) => void;
  initialPrompt?: string;
}

export function AiImageGeneratorModal({
  open,
  onClose,
  onAddImages,
  initialPrompt = "",
}: AiImageGeneratorModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedStyle, setSelectedStyle] = useState<PhotographyStyle>("studio");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedPhotoItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [generationProgress, setGenerationProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>("Analyzing product prompt with AI...");

  useEffect(() => {
    if (initialPrompt && !prompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt, prompt]);

  if (!open) return null;

  const currentStyleObj =
    photographyStyles.find((s) => s.id === selectedStyle) || photographyStyles[0];

  const runGeneration = async () => {
    const rawPrompt = prompt.trim();
    if (!rawPrompt) return;

    setIsGenerating(true);
    setGenerationProgress(15);
    setStatusMessage("AI is analyzing product & crafting 4 studio perspectives...");
    setGeneratedImages([]);
    setSelectedIndices(new Set());

    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + 15;
      });
    }, 350);

    try {
      const res = await fetch("/api/ai/generate-product-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: rawPrompt,
          style: selectedStyle,
        }),
      });

      clearInterval(progressInterval);

      if (res.ok) {
        const data = await res.json();
        if (data.images && data.images.length > 0) {
          setGenerationProgress(100);
          setStatusMessage("Images generated successfully!");
          setGeneratedImages(data.images);
          setSelectedIndices(new Set([0])); // Pre-select primary front view
          setIsGenerating(false);
          return;
        }
      }
      throw new Error("API call failed");
    } catch (err) {
      clearInterval(progressInterval);
      console.warn("[AiImageGeneratorModal] fallback generation:", err);
      const fallbackUrls = generate4AiProductImages(rawPrompt, currentStyleObj.promptSuffix);
      const defaultAngles = [
        "Front Studio View",
        "3/4 Perspective Angle",
        "Material Texture Macro",
        "Styled Presentation",
      ];
      setGeneratedImages(
        fallbackUrls.map((url, idx) => ({
          id: `fallback_${idx}`,
          url,
          angleName: defaultAngles[idx] || `Angle #${idx + 1}`,
        }))
      );
      setSelectedIndices(new Set([0]));
      setIsGenerating(false);
    }
  };

  const toggleSelectImage = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleConfirmAdd = () => {
    const selectedUrls = Array.from(selectedIndices)
      .map((idx) => generatedImages[idx]?.url)
      .filter((url): url is string => Boolean(url));

    if (selectedUrls.length > 0) {
      onAddImages(selectedUrls);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl border border-default bg-card p-6 md:p-8 shadow-modal space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-default pb-4">
          <div>
            <h3 className="text-lg font-bold text-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <span>AI Image Generator</span>
            </h3>
            <p className="text-xs text-subtle mt-0.5">
              Generate 4 studio-quality product photos using AI and pick your favorites.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-subtle hover:text-heading p-1 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Config View (when not generated yet and not generating) */}
        {!isGenerating && generatedImages.length === 0 && (
          <div className="space-y-6">
            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-heading">
                1. Product Description / Prompt
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Modern women handbag, black leather luxury tote bag..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-default bg-background text-sm text-heading placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            {/* 4 Photography Style Presets */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-heading">
                2. Select Photography Style
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {photographyStyles.map((style) => {
                  const isSelected = selectedStyle === style.id;
                  return (
                    <div
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "border-primary-500 bg-primary-50/50 shadow-sm"
                          : "border-default bg-card hover:border-primary-300 hover:bg-muted/30"
                      }`}
                    >
                      <span className="text-2xl">{style.icon}</span>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-heading flex items-center justify-between">
                          {style.title}
                          {isSelected && (
                            <Check size={14} className="text-primary-600 font-bold" />
                          )}
                        </h4>
                        <p className="text-[11px] text-subtle leading-tight">
                          {style.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-default">
              <Button variant="ghost" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={runGeneration}
                disabled={!prompt.trim()}
                className="gap-2"
              >
                <span>✨ Generate 4 AI Images</span>
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Loading State */}
        {isGenerating && (
          <div className="py-12 text-center space-y-4">
            <div className="relative mx-auto h-16 w-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
              <span className="text-xl">✨</span>
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-heading">
                Generating 4 AI Product Images...
              </h4>
              <p className="text-xs text-subtle max-w-sm mx-auto">
                {statusMessage} ({generationProgress}%)
              </p>
            </div>
            <div className="max-w-xs mx-auto h-2 bg-primary-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-200"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 3: 4-Image Grid & Results Selection */}
        {!isGenerating && generatedImages.length === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-semibold text-heading uppercase tracking-wider">
                Pick images to add ({selectedIndices.size} selected)
              </span>
              <span className="text-xs text-subtle">
                Style: <strong>{currentStyleObj.title}</strong>
              </span>
            </div>

            {/* 4 Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((item, idx) => {
                const isSelected = selectedIndices.has(idx);
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => toggleSelectImage(idx)}
                    className={`group relative aspect-square rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary-500 ring-4 ring-primary-500/20 scale-[1.01]"
                        : "border-default opacity-85 hover:opacity-100 hover:border-primary-300"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.angleName || `Option #${idx + 1}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback image if network times out
                        (e.target as HTMLImageElement).src =
                          item.fallbackUrl || fallbackPool[idx % fallbackPool.length];
                      }}
                    />

                    {/* Selection Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow ${
                          isSelected
                            ? "bg-primary-600 text-white scale-110"
                            : "bg-black/40 text-white/70 hover:bg-black/60"
                        }`}
                      >
                        {isSelected ? <Check size={14} /> : idx + 1}
                      </div>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/75 text-white backdrop-blur-md shadow-xs border border-white/10">
                        Option #{idx + 1}
                      </span>
                      {item.angleName && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-primary-200 backdrop-blur-md truncate max-w-[140px]">
                          {item.angleName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-default">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setGeneratedImages([])} className="gap-2">
                  <ArrowLeft size={16} />
                  <span>Back to Prompt</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={runGeneration} className="gap-2">
                  <RefreshCw size={14} />
                  <span>Regenerate (New Seed)</span>
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleConfirmAdd}
                  disabled={selectedIndices.size === 0}
                >
                  Add {selectedIndices.size} Selected Image{selectedIndices.size > 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
