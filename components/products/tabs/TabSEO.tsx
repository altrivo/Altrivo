"use client";

import { Input, Button } from "@/components/shared";
import { slugify } from "@/hooks/useProductForm";
import type { ProductFormData, ProductFormErrors } from "@/types/product-form";

interface TabSEOProps {
  formData: ProductFormData;
  updateField: <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K],
  ) => void;
  autoSlug: boolean;
  setAutoSlug: (auto: boolean) => void;
  errors: ProductFormErrors;
}

export function TabSEO({
  formData,
  updateField,
  autoSlug,
  setAutoSlug,
  errors,
}: TabSEOProps) {
  const metaTitleCharCount = (formData.metaTitle || formData.title).length;
  const metaDescCharCount = (formData.metaDescription || formData.description).length;

  const displayTitle = formData.metaTitle || formData.title || "Product Title Preview";
  const displaySlug = formData.slug || "product-url-slug";
  const displayDesc =
    formData.metaDescription ||
    formData.description ||
    "Add a meta description to see how your product will appear in search engine result pages.";

  return (
    <div className="space-y-6">
      {/* Live Google Search Preview Card */}
      <div className="p-5 rounded-2xl border border-default bg-card shadow-sm space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-subtle mb-3">
          Google Search Engine Result Preview
        </h4>
        <div className="space-y-1">
          <span className="block text-xs font-mono text-emerald-700 dark:text-emerald-400">
            https://artrivo.shop/products/<span className="font-semibold">{displaySlug}</span>
          </span>
          <h3 className="text-lg font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">
            {displayTitle} | Altrivo Vendor Store
          </h3>
          <p className="text-xs text-body line-clamp-2 leading-relaxed">
            {displayDesc}
          </p>
        </div>
      </div>

      {/* Meta Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-heading">
            Meta Title
          </label>
          <span
            className={`text-xs ${
              metaTitleCharCount > 60 ? "text-error-500 font-semibold" : "text-subtle"
            }`}
          >
            {metaTitleCharCount}/60 chars
          </span>
        </div>
        <Input
          placeholder={formData.title || "Meta title for search engines..."}
          value={formData.metaTitle}
          onChange={(e) => updateField("metaTitle", e.target.value)}
        />
        <p className="text-xs text-subtle">
          If left blank, product title will be used.
        </p>
      </div>

      {/* Meta Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-heading">
            Meta Description
          </label>
          <span
            className={`text-xs ${
              metaDescCharCount > 160 ? "text-error-500 font-semibold" : "text-subtle"
            }`}
          >
            {metaDescCharCount}/160 chars
          </span>
        </div>
        <textarea
          rows={3}
          placeholder="Concise summary for search engine results..."
          value={formData.metaDescription}
          onChange={(e) => updateField("metaDescription", e.target.value)}
          className="w-full p-3 rounded-xl border border-default bg-card text-sm text-heading placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* URL Slug */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-heading">
            URL Slug <span className="text-error-500">*</span>
          </label>
          <Button
            variant="ghost"
            size="sm"
            disabled={autoSlug}
            onClick={() => {
              setAutoSlug(true);
              updateField("slug", slugify(formData.title));
            }}
          >
            Auto-generate from Title
          </Button>
        </div>
        <div className="flex items-center">
          <span className="inline-flex items-center px-3 py-2 rounded-l-xl border border-r-0 border-default bg-muted text-subtle text-xs font-mono">
            /products/
          </span>
          <Input
            value={formData.slug}
            onChange={(e) => {
              setAutoSlug(false);
              updateField("slug", slugify(e.target.value));
            }}
            error={errors.slug}
            className="rounded-l-none font-mono text-xs"
          />
        </div>
      </div>
    </div>
  );
}
