"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { ProductForm } from "@/components/products/ProductForm";
import { getStoredProductFormData } from "@/lib/product-storage";
import type { ProductFormData } from "@/types/product-form";

export default function EditProductPage() {
  const { id } = useParams() as { id: string };
  const [initialData, setInitialData] = useState<Partial<ProductFormData> | null>(null);

  useEffect(() => {
    const stored = getStoredProductFormData(id);
    if (stored) {
      setInitialData(stored);
    }

    // Also fetch from DB to ensure gallery images from product_media/products.images are loaded
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.product) {
          const p = data.product;
          const dbImages: string[] = Array.isArray(p.images) && p.images.length > 0
            ? p.images
            : p.image_url ? [p.image_url] : [];

          const mappedImages = dbImages.map((url, idx) => ({
            id: `img_${idx}_${Date.now()}`,
            url,
            isPrimary: idx === 0,
          }));

          setInitialData((prev) => {
            const base: Partial<ProductFormData> = stored || prev || { id, title: p.title || p.name || `Product ${id}` };
            const currentImgCount = base.images?.length || 0;
            return {
              ...base,
              id,
              title: base.title || p.title || p.name,
              price: base.price || p.price,
              description: base.description || p.description,
              category: base.category || p.category,
              // Use DB images if they have more photos or base has no images
              images: mappedImages.length > currentImgCount ? mappedImages : (base.images?.length ? base.images : mappedImages),
            };
          });
        } else if (!stored) {
          setInitialData({ id, title: `Product ${id}` });
        }
      })
      .catch(() => {
        if (!stored) {
          setInitialData({ id, title: `Product ${id}` });
        }
      });
  }, [id]);

  if (!initialData) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-8">
        <div className="animate-pulse text-sm text-subtle">Loading product editor...</div>
      </div>
    );
  }

  return <ProductForm mode="edit" initialData={initialData} />;
}
