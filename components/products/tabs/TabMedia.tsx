"use client";

import { useState } from "react";

import { AiImageGeneratorModal } from "@/components/products/AiImageGeneratorModal";
import { ProductImageUploader, type UploadingFileState } from "@/components/products/ProductImageUploader";
import type { ProductFormData } from "@/types/product-form";

interface TabMediaProps {
  formData: ProductFormData;
  addImage: (url: string) => void;
  removeImage: (id: string) => void;
  setPrimaryImage: (id: string) => void;
  updateField: <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K],
  ) => void;
}

export function TabMedia({
  formData,
  addImage,
  updateField,
}: TabMediaProps) {
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [uploadingSlots, setUploadingSlots] = useState<Record<number, UploadingFileState>>({});

  const handleAddAiImages = (urls: string[]) => {
    const currentCount = formData.images.length;

    urls.forEach((url, i) => {
      const targetSlot = currentCount + i;
      if (targetSlot >= 5) return;

      // Animate upload progress percentage 0% -> 100% for each selected AI image
      setUploadingSlots((prev) => ({
        ...prev,
        [targetSlot]: { index: targetSlot, name: `AI Photo #${i + 1}`, progress: 0 },
      }));

      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        if (progress <= 90) {
          setUploadingSlots((prev) => ({
            ...prev,
            [targetSlot]: { index: targetSlot, name: `AI Photo #${i + 1}`, progress },
          }));
        } else {
          clearInterval(interval);
          setUploadingSlots((prev) => ({
            ...prev,
            [targetSlot]: { index: targetSlot, name: `AI Photo #${i + 1}`, progress: 100 },
          }));

          setTimeout(() => {
            addImage(url);
            setUploadingSlots((prev) => {
              const copy = { ...prev };
              delete copy[targetSlot];
              return copy;
            });
          }, 250);
        }
      }, 100);
    });
  };

  return (
    <div className="space-y-6">
      {/* Product Image Uploader Grid */}
      <ProductImageUploader
        images={formData.images}
        onChange={(newImages) => updateField("images", newImages)}
        maxImages={5}
        onOpenAiModal={() => setAiModalOpen(true)}
        uploadingSlotsExternal={uploadingSlots}
      />

      {/* Advanced AI Image Generator Modal (4-Style Presets & 4-Image Grid) */}
      <AiImageGeneratorModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onAddImages={handleAddAiImages}
        initialPrompt={formData.title ? `${formData.title} product` : ""}
      />
    </div>
  );
}
