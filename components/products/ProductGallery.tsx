"use client";

import { useState } from "react";
import { ProductMedia } from "@/types/products";

interface ProductGalleryProps {
  media: ProductMedia[];
  selectedMediaId?: string;
  onSelectMedia?: (media: ProductMedia) => void;
}

export function ProductGallery({ media }: ProductGalleryProps) {
  const [activeMedia, setActiveMedia] = useState<ProductMedia>(media[0] || {
    id: "m0",
    type: "image",
    url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=200&q=80",
    alt: "Product Image",
  });

  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showFullModal, setShowFullModal] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="space-y-4">
      {/* Main Media Stage */}
      <div className="relative overflow-hidden rounded-2xl border border-default bg-card shadow-card group">
        {activeMedia.type === "video" ? (
          <div className="relative aspect-4/3 w-full bg-neutral-900 flex items-center justify-center">
            <video
              src={activeMedia.url}
              controls
              autoPlay
              muted
              loop
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className="relative aspect-4/3 w-full cursor-zoom-in overflow-hidden"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setShowFullModal(true)}
          >
            <img
              src={activeMedia.url}
              alt={activeMedia.alt}
              className="h-full w-full object-cover transition-transform duration-fast"
              style={
                isZoomed
                  ? {
                      transform: "scale(2)",
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    }
                  : undefined
              }
            />

            {/* Hover Zoom Hint */}
            <div className="absolute bottom-3 right-3 rounded-full bg-card/90 px-3 py-1 text-xs font-bold text-heading border border-default shadow-xs pointer-events-none flex items-center gap-1.5 backdrop-blur-xs">
              <svg className="h-3.5 w-3.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
              <span>Hover / Click to Zoom</span>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails Navigation Row */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {media.map((item) => {
          const isActive = activeMedia.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMedia(item)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                isActive
                  ? "border-primary-500 ring-2 ring-primary-500/20 scale-105 shadow-sm"
                  : "border-default opacity-70 hover:opacity-100 hover:border-strong"
              }`}
            >
              <img
                src={item.thumbnail}
                alt={item.alt}
                className="h-full w-full object-cover"
              />
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/40">
                  <div className="h-7 w-7 rounded-full bg-primary-500 text-on-primary flex items-center justify-center shadow-xs">
                    <svg className="h-4 w-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Full Screen Modal */}
      {showFullModal && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-md">
          <div className="relative max-w-4xl w-full bg-card rounded-2xl p-4 border border-strong shadow-modal space-y-4">
            <div className="flex justify-between items-center border-b border-default pb-3">
              <span className="text-sm font-bold text-heading">{activeMedia.alt}</span>
              <button
                onClick={() => setShowFullModal(false)}
                className="rounded-lg p-2 text-heading hover:bg-neutral-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[80vh] overflow-hidden flex items-center justify-center">
              <img src={activeMedia.url} alt={activeMedia.alt} className="max-h-[75vh] w-auto object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
