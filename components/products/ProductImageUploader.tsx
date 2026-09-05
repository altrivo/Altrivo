"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from "react";

import { Button } from "@/components/shared";
import { uploadToCloudinary, deleteFromCloudinary } from "@/services/cloudinary";
import type { ProductImage } from "@/types/product-form";

export interface UploadingFileState {
  index: number;
  name: string;
  progress: number;
}

interface ProductImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
  onOpenAiModal?: () => void;
  uploadingSlotsExternal?: Record<number, UploadingFileState>;
}

export function ProductImageUploader({
  images,
  onChange,
  maxImages = 5,
  onOpenAiModal,
  uploadingSlotsExternal,
}: ProductImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [draggingSlotIndex, setDraggingSlotIndex] = useState<number | null>(null);
  const [uploadingSlots, setUploadingSlots] = useState<Record<number, UploadingFileState>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Combine internal and external uploading progress states
  const activeUploadingSlots = {
    ...uploadingSlots,
    ...(uploadingSlotsExternal || {}),
  };

  // Trigger file explorer for a specific slot or general selection
  const handleSlotClick = (slotIndex: number) => {
    setActiveSlotIndex(slotIndex);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const processFilesForSlot = async (filesArray: File[], targetSlotIndex: number) => {
    setErrorMsg(null);
    const validFiles = filesArray.filter((f) => f.type.startsWith("image/"));

    if (validFiles.length === 0) {
      setErrorMsg("Please select valid image files (.png, .jpg, .jpeg, .webp).");
      return;
    }

    let nextAvailableIndex = targetSlotIndex;

    for (let i = 0; i < validFiles.length; i++) {
      while (nextAvailableIndex < maxImages && images[nextAvailableIndex]) {
        nextAvailableIndex++;
      }
      if (nextAvailableIndex >= maxImages && i > 0) break;

      const slotToUse = i === 0 ? targetSlotIndex : nextAvailableIndex;
      const file = validFiles[i];

      setUploadingSlots((prev) => ({
        ...prev,
        [slotToUse]: { index: slotToUse, name: file.name, progress: 0 },
      }));

      try {
        const result = await uploadToCloudinary(file, undefined, (percent) => {
          setUploadingSlots((prev) => ({
            ...prev,
            [slotToUse]: { index: slotToUse, name: file.name, progress: percent },
          }));
        });

        const newImageObj: ProductImage = {
          id: result.publicId || `img_${Date.now()}_${slotToUse}`,
          url: result.url,
          isPrimary: slotToUse === 0 || images.length === 0,
        };

        const currentList = [...images];
        if (slotToUse < currentList.length) {
          currentList[slotToUse] = newImageObj;
        } else {
          currentList.push(newImageObj);
        }

        if (!currentList.some((img) => img?.isPrimary)) {
          if (currentList[0]) currentList[0].isPrimary = true;
        }

        onChange(currentList.filter(Boolean));
      } catch (err) {
        console.error("Upload failed:", err);
        setErrorMsg(`Failed to upload ${file.name}.`);
      } finally {
        setUploadingSlots((prev) => {
          const copy = { ...prev };
          delete copy[slotToUse];
          return copy;
        });
      }
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const targetSlot = activeSlotIndex !== null ? activeSlotIndex : images.length;
      processFilesForSlot(Array.from(e.target.files), Math.min(targetSlot, maxImages - 1));
    }
  };

  const handleSlotDragOver = (e: DragEvent<HTMLDivElement>, slotIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingSlotIndex(slotIndex);
  };

  const handleSlotDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingSlotIndex(null);
  };

  const handleSlotDrop = (e: DragEvent<HTMLDivElement>, slotIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingSlotIndex(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFilesForSlot(Array.from(e.dataTransfer.files), slotIndex);
    }
  };

  const handleDeleteImage = (index: number) => {
    const targetImage = images[index];
    if (targetImage) {
      deleteFromCloudinary(targetImage.id);
    }
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const list = [...images];
    const [moved] = list.splice(index, 1);
    list.splice(newIndex, 0, moved);
    onChange(list);
  };

  const slots = Array.from({ length: maxImages }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h4 className="text-sm font-semibold text-heading flex items-center gap-2">
            Product Media Gallery
            <span className="text-xs font-normal text-subtle">
              ({images.length}/{maxImages} slots filled)
            </span>
          </h4>
          <p className="text-xs text-subtle mt-0.5">
            Click any of the 5 boxes below to pick an image from your desktop, or drag & drop directly onto a slot.
          </p>
        </div>

        {onOpenAiModal && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenAiModal}
            className="border border-primary-300 text-primary-700 bg-primary-50/50 hover:bg-primary-100"
          >
            ✨ Generate with AI
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3 rounded-xl border border-error-200 bg-error-50 text-xs font-medium text-error-600 flex items-center justify-between animate-in fade-in duration-150">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="hover:text-error-800">
            ×
          </button>
        </div>
      )}

      {/* Unique 5-Slot Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {slots.map((slotIndex) => {
          const img = images[slotIndex];
          const uploadingState = activeUploadingSlots[slotIndex];
          const isDragging = draggingSlotIndex === slotIndex;
          const isPrimarySlot = slotIndex === 0 || img?.isPrimary;

          return (
            <div
              key={slotIndex}
              onDragOver={(e) => handleSlotDragOver(e, slotIndex)}
              onDragLeave={handleSlotDragLeave}
              onDrop={(e) => handleSlotDrop(e, slotIndex)}
              className={`relative aspect-[4/5] rounded-2xl border-2 transition-all overflow-hidden group shadow-sm flex flex-col items-center justify-center ${
                isDragging
                  ? "border-primary-500 bg-primary-50/70 scale-[1.02] shadow-md"
                  : img && !uploadingState
                    ? isPrimarySlot
                      ? "border-primary-500 bg-card ring-2 ring-primary-500/20"
                      : "border-default bg-card"
                    : "border-dashed border-default bg-muted/20 hover:border-primary-400 hover:bg-primary-50/30 cursor-pointer"
              }`}
            >
              {/* Case 1: Uploading State with Percentage Progress Bar */}
              {uploadingState ? (
                <div className="p-4 text-center space-y-3 w-full bg-card h-full flex flex-col items-center justify-center">
                  <div className="mx-auto h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                  <div className="space-y-1 w-full">
                    <span className="block text-[11px] font-bold text-heading truncate">
                      {uploadingState.name || "Uploading..."}
                    </span>
                    <span className="block text-xs font-mono font-bold text-primary-700">
                      {uploadingState.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-primary-100 rounded-full overflow-hidden border border-primary-200">
                    <div
                      className="h-full bg-primary-600 transition-all duration-150 ease-out"
                      style={{ width: `${uploadingState.progress}%` }}
                    />
                  </div>
                </div>
              ) : img ? (
                /* Case 2: Populated Image Card */
                <>
                  <img
                    src={img.url}
                    alt={`Product slot ${slotIndex + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const slotFallbacks = [
                        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1596568359553-a56de6970068?w=800&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1581101767113-1677fc2beaa8?w=800&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800&auto=format&fit=crop&q=80",
                      ];
                      (e.target as HTMLImageElement).src =
                        slotFallbacks[slotIndex % slotFallbacks.length];
                    }}
                  />

                  {/* Primary Badge */}
                  {img.isPrimary && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-600 text-white shadow-md z-10">
                      Cover Photo
                    </span>
                  )}

                  {/* Slot Number Indicator */}
                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-white backdrop-blur-sm z-10">
                    Slot #{slotIndex + 1}
                  </span>

                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 z-20">
                    <div className="flex items-center justify-between">
                      {/* Reorder Arrows */}
                      <div className="flex items-center gap-1 bg-black/40 rounded-lg p-0.5 backdrop-blur-sm">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMove(slotIndex, "left");
                          }}
                          disabled={slotIndex === 0}
                          className="h-6 w-6 rounded flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent text-xs"
                          title="Move Left"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMove(slotIndex, "right");
                          }}
                          disabled={slotIndex === images.length - 1}
                          className="h-6 w-6 rounded flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent text-xs"
                          title="Move Right"
                        >
                          →
                        </button>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(slotIndex);
                        }}
                        className="h-7 w-7 rounded-lg bg-error-600 hover:bg-error-700 text-white flex items-center justify-center text-xs shadow transition-colors"
                        title="Delete Image"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetPrimary(slotIndex);
                          }}
                          className="w-full py-1 bg-white/90 hover:bg-white text-heading text-[11px] font-semibold rounded-lg shadow transition-colors text-center"
                        >
                          Set Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSlotClick(slotIndex);
                        }}
                        className="w-full py-1 bg-primary-600/90 hover:bg-primary-600 text-white text-[11px] font-medium rounded-lg shadow transition-colors text-center"
                      >
                        Replace Image
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Case 3: Empty Slot Card */
                <div
                  onClick={() => handleSlotClick(slotIndex)}
                  className="flex flex-col items-center justify-center p-4 text-center w-full h-full space-y-2 select-none"
                >
                  <div className="h-10 w-10 rounded-xl bg-card border border-default flex items-center justify-center text-subtle group-hover:text-primary-600 group-hover:border-primary-400 group-hover:scale-110 transition-all shadow-xs">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 4v16M4 12h16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-heading group-hover:text-primary-600 transition-colors">
                      {slotIndex === 0 ? "Upload Cover Photo" : `Upload Photo #${slotIndex + 1}`}
                    </span>
                    <span className="block text-[10px] text-subtle">
                      {slotIndex === 0 ? "Main Thumbnail" : "Gallery Slot"}
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary-50 text-primary-700 border border-primary-200 opacity-80 group-hover:opacity-100 transition-opacity">
                    Select File
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
