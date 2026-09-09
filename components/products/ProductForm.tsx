"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Badge, ConfirmDialog } from "@/components/shared";
import { ArrowLeft, ArrowRight, Check, Rocket, Store } from "lucide-react";
import { useVendorStore } from "@/context/VendorStoreContext";
import { useProductForm } from "@/hooks/useProductForm";
import type { FormTab, ProductFormData } from "@/types/product-form";

import { TabBasic } from "./tabs/TabBasic";
import { TabMedia } from "./tabs/TabMedia";
import { TabPricing } from "./tabs/TabPricing";
import { TabSEO } from "./tabs/TabSEO";
import { TabVariants } from "./tabs/TabVariants";

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: Partial<ProductFormData>;
}

const tabItems: { id: FormTab; label: string; icon: string }[] = [
  { id: "basic", label: "Basic Info", icon: "📝" },
  { id: "pricing", label: "Pricing", icon: "🏷️" },
  { id: "variants", label: "Variants", icon: "🔀" },
  { id: "media", label: "Media & Images", icon: "🖼️" },
  { id: "seo", label: "SEO & Search", icon: "🔍" },
];

export function ProductForm({ mode, initialData }: ProductFormProps) {
  const router = useRouter();
  const { activeStore, activeStoreId } = useVendorStore();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [saveNextSuccess, setSaveNextSuccess] = useState(false);

  const {
    formData,
    activeTab,
    setActiveTab,
    errors,
    tabErrors,
    isDirty,
    isSaving,
    isAutoSaving,
    lastAutoSaved,
    autoSlug,
    setAutoSlug,
    updateField,
    profitMetrics,
    addOption,
    removeOption,
    updateOption,
    updateVariantRow,
    bulkSetVariantPrices,
    bulkSetVariantStocks,
    bulkSetVariantStatus,
    addImage,
    removeImage,
    setPrimaryImage,
    saveProduct,
  } = useProductForm(initialData, activeStoreId || undefined);

  const currentTabIndex = tabItems.findIndex((t) => t.id === activeTab);
  const isLastTab = currentTabIndex === tabItems.length - 1;
  const nextTab = !isLastTab ? tabItems[currentTabIndex + 1] : null;
  const prevTab = currentTabIndex > 0 ? tabItems[currentTabIndex - 1] : null;

  const handleBack = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      router.push("/products");
    }
  };

  const [validationErrorBanner, setValidationErrorBanner] = useState<string | null>(null);

  const handleSave = (status: "published" | "draft") => {
    setValidationErrorBanner(null);
    const success = saveProduct(status, () => {
      router.push("/products");
    });
    if (!success && status === "published") {
      setValidationErrorBanner("Please complete all required fields (Product Title, Category, Valid Price) to publish.");
      setTimeout(() => setValidationErrorBanner(null), 7000);
    }
  };

  const handleSaveAndNext = () => {
    if (!nextTab) return;
    saveProduct("draft", () => {
      setSaveNextSuccess(true);
      setTimeout(() => setSaveNextSuccess(false), 2000);
      setActiveTab(nextTab.id);
    });
  };

  const handleGoToPrev = () => {
    if (prevTab) {
      setActiveTab(prevTab.id);
    }
  };

  return (
    <div className="min-h-screen bg-page pb-16">
      {/* Top Fixed Header Bar */}
      <div className="sticky top-0 z-sticky bg-card/95 backdrop-blur-md border-b border-default shadow-sm">
        <div className="mx-auto max-w-[1200px] px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft size={16} />
              <span>Back</span>
            </Button>
            <div className="h-4 w-px bg-default" />
            <div>
              <h1 className="text-lg font-bold text-heading" suppressHydrationWarning>
                {mode === "create"
                  ? "Add New Product"
                  : `Edit: ${formData.title || "Product"}`}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant={formData.status === "published" ? "success" : "gray"}
                  size="sm"
                >
                  {formData.status === "published" ? "Published" : "Draft"}
                </Badge>
                {activeStore && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 border border-primary-200 text-[11px] font-bold text-primary-800">
                    <Store className="w-3 h-3 text-primary-600" />
                    {activeStore.name}
                  </span>
                )}
                <span className="text-xs text-subtle" suppressHydrationWarning>
                  {isAutoSaving ? (
                    <span className="text-primary-600 animate-pulse font-medium">
                      Auto-saving draft...
                    </span>
                  ) : lastAutoSaved ? (
                    `Auto-saved at ${lastAutoSaved}`
                  ) : isDirty ? (
                    <span className="text-warning-600 font-medium">
                      Unsaved changes
                    </span>
                  ) : (
                    "All changes saved"
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={() => handleSave("draft")}
              disabled={isSaving}
            >
              Save as Draft
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => handleSave("published")}
              disabled={isSaving}
            >
              {isSaving ? "Publishing..." : "Publish Product"}
            </Button>
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div className="mx-auto max-w-[1200px] px-6 pb-2">
          <div className="flex items-center gap-1">
            {tabItems.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              const isDone = idx < currentTabIndex;
              return (
                <div key={tab.id} className="flex items-center gap-1 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all truncate ${
                      isActive
                        ? "bg-[#312038] text-white shadow font-bold"
                        : isDone
                        ? "bg-purple-50 text-[#312038] border border-purple-200/80 font-bold hover:bg-purple-100/70"
                        : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {isDone ? (
                      <Check size={14} className="text-[#312038] font-black stroke-[2.5]" />
                    ) : (
                      <span>{tab.icon}</span>
                    )}
                    <span className="hidden sm:inline truncate">{tab.label}</span>
                    <span className="text-[10px] opacity-60">
                      {idx + 1}/{tabItems.length}
                    </span>
                  </button>
                  {idx < tabItems.length - 1 && (
                    <div className={`h-px flex-1 mx-1 ${isDone ? "bg-[#312038]/30" : "bg-slate-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {validationErrorBanner && (
        <div className="mx-auto max-w-[1200px] px-6 pt-4">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <span className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{validationErrorBanner}</span>
            </span>
            <button
              type="button"
              onClick={() => setValidationErrorBanner(null)}
              className="text-amber-700 hover:text-amber-950 font-bold px-2 py-0.5 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="bg-card rounded-2xl border border-default shadow-card overflow-hidden">
          {/* Tab Header Navigation */}
          <div className="flex items-center gap-1 px-4 pt-3 border-b border-default bg-muted/40 overflow-x-auto">
            {tabItems.map((tab) => {
              const isActive = activeTab === tab.id;
              const hasErr = tabErrors[tab.id];

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap rounded-t-xl border-b-2 -mb-px ${
                    isActive
                      ? "border-primary-500 text-primary-600 bg-card shadow-sm"
                      : "border-transparent text-subtle hover:text-heading hover:bg-muted/50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {hasErr && (
                    <span className="h-2 w-2 rounded-full bg-error-500 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === "basic" && (
              <TabBasic
                formData={formData}
                updateField={updateField}
                errors={errors}
              />
            )}
            {activeTab === "pricing" && (
              <TabPricing
                formData={formData}
                updateField={updateField}
                profitMetrics={profitMetrics}
                errors={errors}
              />
            )}
            {activeTab === "variants" && (
              <TabVariants
                formData={formData}
                updateField={updateField}
                addOption={addOption}
                removeOption={removeOption}
                updateOption={updateOption}
                updateVariantRow={updateVariantRow}
                bulkSetVariantPrices={bulkSetVariantPrices}
                bulkSetVariantStocks={bulkSetVariantStocks}
                bulkSetVariantStatus={bulkSetVariantStatus}
              />
            )}
            {activeTab === "media" && (
              <TabMedia
                formData={formData}
                addImage={addImage}
                removeImage={removeImage}
                setPrimaryImage={setPrimaryImage}
                updateField={updateField}
              />
            )}
            {activeTab === "seo" && (
              <TabSEO
                formData={formData}
                updateField={updateField}
                autoSlug={autoSlug}
                setAutoSlug={setAutoSlug}
                errors={errors}
              />
            )}

            {/* ─── Save & Next / Previous Navigation ─── */}
            <div className="mt-10 pt-6 border-t border-default flex items-center justify-between gap-4 flex-wrap">
              {/* Previous Tab Button */}
              <div>
                {prevTab ? (
                  <button
                    type="button"
                    onClick={handleGoToPrev}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-default text-sm font-medium text-subtle hover:text-heading hover:border-primary-400 hover:bg-primary-50/40 transition-all"
                  >
                    <ArrowLeft size={16} />
                    <span>{prevTab.icon} {prevTab.label}</span>
                  </button>
                ) : (
                  <div />
                )}
              </div>

              {/* Right Side: Progress hint + Save & Next / Publish */}
              <div className="flex items-center gap-3">
                {/* Step counter */}
                <span className="text-xs text-subtle font-medium">
                  Step {currentTabIndex + 1} of {tabItems.length}
                </span>

                {saveNextSuccess && (
                  <span className="text-xs text-success-600 font-semibold animate-in fade-in duration-200 flex items-center gap-1">
                    <Check size={14} />
                    <span>Saved!</span>
                  </span>
                )}

                {!isLastTab ? (
                  <button
                    type="button"
                    onClick={handleSaveAndNext}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                  >
                    {isSaving ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <span>Save &amp; Next: {nextTab?.icon} {nextTab?.label}</span>
                        <ArrowRight size={16} className="text-white/80" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSave("published")}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#312038] hover:bg-[#432c4d] disabled:opacity-60 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Rocket size={16} />
                        <span>Publish Product</span>
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      <ConfirmDialog
        open={showCancelConfirm}
        title="Unsaved Changes"
        description="You have unsaved changes on this product form. Are you sure you want to leave without saving?"
        confirmLabel="Leave Page"
        confirmVariant="danger"
        onConfirm={() => router.push("/products")}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
}

