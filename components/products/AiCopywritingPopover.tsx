"use client";

import { useState, useEffect } from "react";

import { Button, Input } from "@/components/shared";
import {
  generateAiCopywriting,
  type CopywritingTone,
  type AiCopywritingResult,
} from "@/services/ai-copywriter";

interface ToneOption {
  id: CopywritingTone;
  label: string;
  icon: string;
}

const toneOptions: ToneOption[] = [
  { id: "professional", label: "Professional", icon: "💼" },
  { id: "friendly", label: "Friendly", icon: "😊" },
  { id: "luxurious", label: "Luxurious", icon: "💎" },
  { id: "playful", label: "Playful", icon: "🎉" },
];

interface AiCopywritingPopoverProps {
  open: boolean;
  onClose: () => void;
  onApplyCopy: (title?: string, description?: string) => void;
  initialKeywords?: string;
  targetField?: "title" | "description" | "both";
}

export function AiCopywritingPopover({
  open,
  onClose,
  onApplyCopy,
  initialKeywords = "",
  targetField = "both",
}: AiCopywritingPopoverProps) {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [selectedTone, setSelectedTone] = useState<CopywritingTone>("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyResults, setCopyResults] = useState<AiCopywritingResult | null>(null);
  const [selectedTitleIdx, setSelectedTitleIdx] = useState<number>(0);
  const [selectedDescIdx, setSelectedDescIdx] = useState<number>(0);

  useEffect(() => {
    if (initialKeywords && !keywords) {
      setKeywords(initialKeywords);
    }
  }, [initialKeywords, keywords]);

  if (!open) return null;

  const handleGenerate = () => {
    if (!keywords.trim()) return;
    setIsGenerating(true);
    setCopyResults(null);

    setTimeout(() => {
      const result = generateAiCopywriting(keywords, selectedTone);
      setCopyResults(result);
      setSelectedTitleIdx(0);
      setSelectedDescIdx(0);
      setIsGenerating(false);
    }, 600);
  };

  const handleApply = () => {
    if (!copyResults) return;

    const chosenTitle = copyResults.titles[selectedTitleIdx];
    const chosenDesc = copyResults.descriptions[selectedDescIdx];

    if (targetField === "title") {
      onApplyCopy(chosenTitle, undefined);
    } else if (targetField === "description") {
      onApplyCopy(undefined, chosenDesc);
    } else {
      onApplyCopy(chosenTitle, chosenDesc);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl border border-default bg-card p-6 md:p-8 shadow-modal space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-default pb-4">
          <div>
            <h3 className="text-lg font-bold text-heading flex items-center gap-2">
              ✨ AI Copywriter (Title & Description)
            </h3>
            <p className="text-xs text-subtle mt-0.5">
              Generate SEO titles (≤60 chars) and structured product descriptions in seconds.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-subtle hover:text-heading p-1 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Step 1: Config Form (when no results yet) */}
        {!isGenerating && !copyResults && (
          <div className="space-y-6">
            {/* Keywords */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-heading">
                1. Product Name or Keywords
              </label>
              <Input
                placeholder="e.g. Leather Crossbody Bag, Smart Watch, Wireless Headphones..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>

            {/* Tone Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-heading">
                2. Select Brand Tone of Voice
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {toneOptions.map((tone) => {
                  const isSelected = selectedTone === tone.id;
                  return (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => setSelectedTone(tone.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? "border-primary-500 bg-primary-50/60 shadow-sm"
                          : "border-default bg-card hover:border-primary-300 hover:bg-muted/30"
                      }`}
                    >
                      <span className="text-xl">{tone.icon}</span>
                      <span className="text-xs font-semibold text-heading">
                        {tone.label}
                      </span>
                    </button>
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
                onClick={handleGenerate}
                disabled={!keywords.trim()}
              >
                ✨ Generate AI Copy
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="py-12 text-center space-y-4">
            <div className="relative mx-auto h-14 w-14 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
              <span className="text-lg">✍️</span>
            </div>
            <h4 className="text-base font-bold text-heading">
              Crafting 3 Titles & 3 Descriptions...
            </h4>
            <p className="text-xs text-subtle">
              Applying <strong>{selectedTone}</strong> tone for &quot;{keywords}&quot;
            </p>
          </div>
        )}

        {/* Step 2: Results View (3 Titles + 3 Descriptions) */}
        {!isGenerating && copyResults && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 3 Title Options */}
            {(targetField === "title" || targetField === "both") && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-heading uppercase tracking-wider flex items-center justify-between">
                  <span>Pick Title Option (SEO ≤60 chars)</span>
                  <span className="text-subtle font-normal">
                    Tone: {selectedTone}
                  </span>
                </h4>

                <div className="space-y-2">
                  {copyResults.titles.map((t, idx) => {
                    const isSelected = selectedTitleIdx === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedTitleIdx(idx)}
                        className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "border-primary-500 bg-primary-50/50 shadow-sm"
                            : "border-default bg-card hover:border-primary-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="titleOption"
                            checked={isSelected}
                            onChange={() => setSelectedTitleIdx(idx)}
                            className="h-4 w-4 accent-primary-500"
                          />
                          <span className="text-sm font-semibold text-heading">
                            {t}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-subtle px-2 py-0.5 rounded bg-muted">
                          {t.length}/60
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3 Description Options */}
            {(targetField === "description" || targetField === "both") && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-heading uppercase tracking-wider">
                  Pick Description Option (Hook + Features + CTA)
                </h4>

                <div className="space-y-3">
                  {copyResults.descriptions.map((desc, idx) => {
                    const isSelected = selectedDescIdx === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedDescIdx(idx)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? "border-primary-500 bg-primary-50/40 shadow-sm"
                            : "border-default bg-card hover:border-primary-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary-700">
                            Description Option #{idx + 1}
                          </span>
                          <input
                            type="radio"
                            name="descOption"
                            checked={isSelected}
                            onChange={() => setSelectedDescIdx(idx)}
                            className="h-4 w-4 accent-primary-500"
                          />
                        </div>
                        <p className="text-xs text-body whitespace-pre-line leading-relaxed font-sans">
                          {desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-default">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCopyResults(null)}
                >
                  ← Back
                </Button>
                <Button variant="ghost" size="sm" onClick={handleGenerate}>
                  🔄 Regenerate Copy
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" onClick={handleApply}>
                  Apply to Product
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
