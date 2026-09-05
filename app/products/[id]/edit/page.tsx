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
    setInitialData(stored || { id, title: `Product ${id}` });
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
