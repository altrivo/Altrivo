"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

import { saveProductFromForm, generateUniqueSku } from "@/lib/product-storage";
import type {
  ProductFormData,
  ProductFormErrors,
  FormTab,
  VariantOption,
  ProductVariant,
  ProductImage,
} from "@/types/product-form";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const defaultFormData: ProductFormData = {
  title: "",
  description: "",
  category: "",
  tags: [],
  brand: "",
  price: 0,
  compareAtPrice: 0,
  costPerItem: 0,
  chargeTax: true,
  taxRate: 10,
  hasVariants: false,
  options: [],
  variants: [],
  images: [],
  metaTitle: "",
  metaDescription: "",
  slug: "",
  status: "draft",
};

export function useProductForm(initialData?: Partial<ProductFormData>, explicitStoreId?: string) {
  const [formData, setFormData] = useState<ProductFormData>(() => {
    const generatedId = initialData?.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const generatedSku = initialData?.sku || generateUniqueSku(initialData?.title, initialData?.category);
    return {
      ...defaultFormData,
      id: generatedId,
      sku: generatedSku,
      storeId: explicitStoreId || initialData?.storeId,
      ...initialData,
    };
  });

  const [activeTab, setActiveTab] = useState<FormTab>("basic");
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  // Auto-slug generation from title
  useEffect(() => {
    if (autoSlug && formData.title) {
      const generated = slugify(formData.title);
      setFormData((prev) => ({ ...prev, slug: generated }));
    }
  }, [formData.title, autoSlug]);

  // General field change
  const updateField = useCallback(
    <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);

      // Clear error for that field
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors],
  );

  // Warn user on window unload if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty) {
        setIsAutoSaving(true);
        setTimeout(() => {
          setLastAutoSaved(
            new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          );
          setIsAutoSaving(false);
          setIsDirty(false);
        }, 500);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isDirty]);

  // Profit Margin calculations
  const profitMetrics = useMemo(() => {
    const price = Number(formData.price) || 0;
    const cost = Number(formData.costPerItem) || 0;
    const profit = price - cost;
    const margin = price > 0 ? (profit / price) * 100 : 0;
    return {
      profit: Math.round(profit * 100) / 100,
      margin: Math.round(margin * 10) / 10,
    };
  }, [formData.price, formData.costPerItem]);

  // Variant Matrix combination generator
  const generateVariantsFromOptions = useCallback(
    (optionsList: VariantOption[], basePrice: number, baseSku: string) => {
      const activeOptions = optionsList.filter(
        (opt) => opt.name.trim() && opt.values.length > 0,
      );
      if (activeOptions.length === 0) return [];

      // Cartesian product generator
      const cartesian = (
        acc: Record<string, string>[],
        optionIndex: number,
      ): Record<string, string>[] => {
        if (optionIndex >= activeOptions.length) return acc;

        const currentOpt = activeOptions[optionIndex];
        const nextAcc: Record<string, string>[] = [];

        if (acc.length === 0) {
          for (const val of currentOpt.values) {
            nextAcc.push({ [currentOpt.name]: val });
          }
        } else {
          for (const item of acc) {
            for (const val of currentOpt.values) {
              nextAcc.push({ ...item, [currentOpt.name]: val });
            }
          }
        }

        return cartesian(nextAcc, optionIndex + 1);
      };

      const combinations = cartesian([], 0);

      return combinations.map((combo, idx) => {
        const skuSuffix = Object.values(combo)
          .map((v) => v.slice(0, 3).toUpperCase())
          .join("-");

        return {
          id: `var_${idx + 1}_${Date.now()}`,
          optionValues: combo,
          price: basePrice || 0,
          stock: 10,
          sku: baseSku ? `${baseSku}-${skuSuffix}` : `SKU-VAR-${idx + 1}`,
          enabled: true,
        };
      });
    },
    [],
  );

  // Bulk Variant Actions
  const bulkSetVariantPrices = useCallback((targetPrice: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => ({ ...v, price: targetPrice })),
    }));
    setIsDirty(true);
  }, []);

  const bulkSetVariantStocks = useCallback((targetStock: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => ({ ...v, stock: targetStock })),
    }));
    setIsDirty(true);
  }, []);

  const bulkSetVariantStatus = useCallback((enabled: boolean) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => ({ ...v, enabled })),
    }));
    setIsDirty(true);
  }, []);

  // Variant Option updates
  const addOption = useCallback(() => {
    const newOpt: VariantOption = {
      id: `opt_${Date.now()}`,
      name: "",
      values: [],
    };
    setFormData((prev) => ({
      ...prev,
      hasVariants: true,
      options: [...prev.options, newOpt],
    }));
    setIsDirty(true);
  }, []);

  const removeOption = useCallback(
    (id: string) => {
      setFormData((prev) => {
        const nextOptions = prev.options.filter((o) => o.id !== id);
        const nextVariants = generateVariantsFromOptions(
          nextOptions,
          prev.price,
          "SKU-PROD",
        );
        return {
          ...prev,
          options: nextOptions,
          hasVariants: nextOptions.length > 0,
          variants: nextVariants,
        };
      });
      setIsDirty(true);
    },
    [generateVariantsFromOptions],
  );

  const updateOption = useCallback(
    (id: string, name: string, values: string[]) => {
      setFormData((prev) => {
        const nextOptions = prev.options.map((o) =>
          o.id === id ? { ...o, name, values } : o,
        );
        const nextVariants = generateVariantsFromOptions(
          nextOptions,
          prev.price,
          "SKU-PROD",
        );
        return {
          ...prev,
          options: nextOptions,
          variants: nextVariants,
        };
      });
      setIsDirty(true);
    },
    [generateVariantsFromOptions],
  );

  const updateVariantRow = useCallback(
    (variantId: string, field: keyof ProductVariant, value: any) => {
      setFormData((prev) => ({
        ...prev,
        variants: prev.variants.map((v) =>
          v.id === variantId ? { ...v, [field]: value } : v,
        ),
      }));
      setIsDirty(true);
    },
    [],
  );

  // Media Handlers
  const addImage = useCallback((url: string) => {
    setFormData((prev) => {
      const isFirst = prev.images.length === 0;
      const newImg: ProductImage = {
        id: `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        url,
        isPrimary: isFirst,
      };
      return {
        ...prev,
        images: [...prev.images, newImg],
      };
    });
    setIsDirty(true);
  }, []);

  const removeImage = useCallback((id: string) => {
    setFormData((prev) => {
      const remaining = prev.images.filter((img) => img.id !== id);
      if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return { ...prev, images: remaining };
    });
    setIsDirty(true);
  }, []);

  const setPrimaryImage = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      })),
    }));
    setIsDirty(true);
  }, []);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: ProductFormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Product title is required";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (formData.price < 0) {
      newErrors.price = "Price cannot be negative";
    }

    if (!formData.slug?.trim()) {
      if (formData.title.trim()) {
        formData.slug = slugify(formData.title);
      } else {
        newErrors.slug = "URL slug is required";
      }
    }

    setErrors(newErrors);

    // Switch to first tab with error
    if (newErrors.title || newErrors.category) {
      setActiveTab("basic");
    } else if (newErrors.price) {
      setActiveTab("pricing");
    } else if (newErrors.slug) {
      setActiveTab("seo");
    }

    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Tab errors indicator
  const tabErrors = useMemo(() => {
    return {
      basic: Boolean(errors.title || errors.category),
      pricing: Boolean(errors.price || errors.costPerItem),
      variants: false,
      media: false,
      seo: Boolean(errors.slug),
    };
  }, [errors]);

  // Save handler
  const saveProduct = useCallback(
    (targetStatus: "published" | "draft", onSuccess?: () => void) => {
      if (targetStatus === "published" && !validateForm()) {
        return false;
      }

      setIsSaving(true);
      
      const currentStoreId =
        explicitStoreId ||
        formData.storeId ||
        (typeof window !== "undefined" ? localStorage.getItem("active_store_id") : null) ||
        undefined;

      const updatedFormData: ProductFormData = {
        ...formData,
        status: targetStatus,
        storeId: currentStoreId,
        sku: formData.sku || generateUniqueSku(formData.title, formData.category),
      };

      const saved = saveProductFromForm(updatedFormData, targetStatus, currentStoreId);

      setFormData((prev) => ({
        ...prev,
        id: saved.id,
        sku: saved.sku,
        storeId: saved.storeId,
        status: targetStatus,
      }));

      setTimeout(() => {
        setIsSaving(false);
        setIsDirty(false);
        setLastAutoSaved(
          new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        );
        if (onSuccess) onSuccess();
      }, 350);

      return true;
    },
    [validateForm, formData, explicitStoreId],
  );

  return {
    formData,
    setFormData,
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
    validateForm,
    saveProduct,
  };
}
