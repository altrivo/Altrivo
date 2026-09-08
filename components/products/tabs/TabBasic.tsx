"use client";

import { useState, type KeyboardEvent } from "react";

import { AiCopywritingPopover } from "@/components/products/AiCopywritingPopover";
import { Input, Select } from "@/components/shared";
import { generateUniqueSku } from "@/lib/product-storage";
import type { ProductFormData, ProductFormErrors } from "@/types/product-form";

const defaultCategories = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Sports",
  "Books",
  "Toys",
  "Beauty",
  "Automotive",
  "Food & Beverages",
  "Jewelry",
];

interface TabBasicProps {
  formData: ProductFormData;
  updateField: <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K],
  ) => void;
  errors: ProductFormErrors;
}

export function TabBasic({ formData, updateField, errors }: TabBasicProps) {
  const [tagInput, setTagInput] = useState("");
  const [aiPopoverOpen, setAiPopoverOpen] = useState(false);
  const [targetField, setTargetField] = useState<"title" | "description" | "both">("both");

  const openAiFor = (field: "title" | "description" | "both") => {
    setTargetField(field);
    setAiPopoverOpen(true);
  };

  const handleApplyCopy = (newTitle?: string, newDesc?: string) => {
    if (newTitle) {
      updateField("title", newTitle);
      if (!formData.sku) {
        updateField("sku", generateUniqueSku(newTitle, formData.category));
      }
    }
    if (newDesc) updateField("description", newDesc);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      updateField("tags", [...formData.tags, trimmed]);
      setTagInput("");
    }
  };

  const handleKeyDownTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateField(
      "tags",
      formData.tags.filter((t) => t !== tagToRemove),
    );
  };

  const applyFormat = (command: string) => {
    const desc = formData.description;
    let formatted = desc;
    if (command === "bold") formatted += " **bold text**";
    else if (command === "italic") formatted += " *italic text*";
    else if (command === "heading") formatted += "\n### Heading\n";
    else if (command === "list") formatted += "\n- Bullet item 1\n- Bullet item 2\n";
    else if (command === "link") formatted += " [Link text](https://example.com)";
    updateField("description", formatted);
  };

  return (
    <div className="space-y-6">
      {/* Title & Brand */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-heading">
              Product Title <span className="text-error-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => openAiFor("title")}
              className="text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors flex items-center gap-1"
            >
              ✨ Write with AI
            </button>
          </div>
          <Input
            placeholder="e.g. Premium Leather Crossbody Bag"
            value={formData.title}
            onChange={(e) => {
              const newTitle = e.target.value;
              updateField("title", newTitle);
              if (!formData.sku || formData.sku === "WATCH") {
                updateField("sku", generateUniqueSku(newTitle, formData.category));
              }
            }}
            error={errors.title}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-heading">Brand</label>
          <Input
            placeholder="e.g. Altrivo Studio"
            value={formData.brand}
            onChange={(e) => updateField("brand", e.target.value)}
          />
        </div>
      </div>

      {/* Category & Unique SKU */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-heading">
            Category <span className="text-error-500">*</span>
          </label>
          <Select
            options={[
              { value: "", label: "Select a Category" },
              ...defaultCategories.map((c) => ({ value: c, label: c })),
            ]}
            value={formData.category}
            onChange={(e) => {
              const newCat = e.target.value;
              updateField("category", newCat);
              if (!formData.sku || formData.sku === "WATCH") {
                updateField("sku", generateUniqueSku(formData.title, newCat));
              }
            }}
            className="w-full"
          />
          {errors.category && (
            <p className="text-xs text-error-500 mt-1">{errors.category}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-heading">
              SKU (Stock Keeping Unit)
            </label>
            <button
              type="button"
              onClick={() => {
                const newSku = generateUniqueSku(formData.title, formData.category);
                updateField("sku", newSku);
              }}
              className="text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              🎲 Generate New SKU
            </button>
          </div>
          <Input
            placeholder="e.g. BDY-8392 or WAT-4721"
            value={formData.sku || ""}
            onChange={(e) => updateField("sku", e.target.value.toUpperCase())}
          />
          <p className="text-xs text-subtle">
            Unique product inventory code (e.g. BDY-8392). Auto-generated or custom.
          </p>
        </div>
      </div>

      {/* Rich Text Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-heading">
            Description
          </label>
          <button
            type="button"
            onClick={() => openAiFor("description")}
            className="text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors flex items-center gap-1"
          >
            ✨ Write with AI
          </button>
        </div>

        <div className="border border-default rounded-xl overflow-hidden bg-card focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
          {/* Editor Toolbar */}
          <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-default bg-muted/50 text-subtle">
            <button
              type="button"
              onClick={() => applyFormat("bold")}
              className="p-1.5 rounded hover:bg-card hover:text-heading transition-colors font-bold text-xs"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => applyFormat("italic")}
              className="p-1.5 rounded hover:bg-card hover:text-heading transition-colors italic text-xs"
              title="Italic"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => applyFormat("heading")}
              className="p-1.5 rounded hover:bg-card hover:text-heading transition-colors font-semibold text-xs"
              title="Heading"
            >
              H3
            </button>
            <div className="h-4 w-px bg-default mx-1" />
            <button
              type="button"
              onClick={() => applyFormat("list")}
              className="p-1.5 rounded hover:bg-card hover:text-heading transition-colors text-xs"
              title="Bullet List"
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => applyFormat("link")}
              className="p-1.5 rounded hover:bg-card hover:text-heading transition-colors text-xs"
              title="Add Link"
            >
              🔗 Link
            </button>
          </div>

          <textarea
            rows={6}
            placeholder="Write a detailed description of your product..."
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full p-3 bg-transparent text-sm text-heading placeholder:text-subtle focus:outline-none resize-y min-h-[140px]"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-heading">
          Product Tags
        </label>
        <div className="flex flex-wrap items-center gap-2 p-3 bg-card border border-default rounded-xl min-h-[50px]">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-error-600 transition-colors"
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={
              formData.tags.length === 0
                ? "Type a tag and press Enter..."
                : "Add another tag..."
            }
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDownTag}
            onBlur={handleAddTag}
            className="flex-1 min-w-[160px] bg-transparent text-sm text-heading placeholder:text-subtle focus:outline-none"
          />
        </div>
        <p className="text-xs text-subtle">
          Press Enter or comma to add a tag.
        </p>
      </div>

      {/* AI Copywriting Popover Modal */}
      <AiCopywritingPopover
        open={aiPopoverOpen}
        onClose={() => setAiPopoverOpen(false)}
        onApplyCopy={handleApplyCopy}
        initialKeywords={formData.title}
        targetField={targetField}
      />
    </div>
  );
}
