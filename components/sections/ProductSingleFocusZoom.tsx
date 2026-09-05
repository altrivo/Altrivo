"use client";

import React, { useState, useEffect, useRef } from "react";
import { Star, ShoppingBag, Check, X, Maximize2 } from "lucide-react";

export interface ProductSingleFocusProps {
  id: string;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  badgeText?: string;
  options?: { name: string; values: string[] }[];
  onAddToCart?: (id: string, selectedOptions: Record<string, string>) => void;
}

export default function ProductSingleFocusZoom({
  id,
  name,
  price,
  description,
  imageUrl,
  badgeText = "Zoom Spotlight",
  options = [],
  onAddToCart,
}: ProductSingleFocusProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showLens, setShowLens] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0, bgX: "50%", bgY: "50%" });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    options.forEach((opt) => {
      if (opt.values && opt.values.length > 0) {
        initial[opt.name] = opt.values[0];
      }
    });
    return initial;
  });

  // Detect touch devices
  useEffect(() => {
    const media = window.matchMedia("(hover: hover)");
    setIsTouchDevice(!media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setIsTouchDevice(!e.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdded(true);
    if (onAddToCart) {
      onAddToCart(id, selectedOptions);
    }
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // Track cursor position inside visual frame
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate mouse position percentage inside target element
    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;

    // 120px circular lens dimension offsets
    const lensWidth = 120;
    const lensHeight = 120;

    setLensPos({
      x: x - lensWidth / 2,
      y: y - lensHeight / 2,
      bgX: `${pctX}%`,
      bgY: `${pctY}%`,
    });
    setShowLens(true);
  };

  const handleMouseLeave = () => {
    setShowLens(false);
  };

  const handleImageClick = () => {
    if (isTouchDevice) {
      setIsFullscreen(true);
    }
  };

  return (
    <section 
      ref={containerRef}
      className="relative w-full py-12 bg-white text-slate-900 border-b border-slate-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Zoom Lens visual frame */}
        <div className="md:col-span-6 relative">
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleImageClick}
            className="w-full aspect-[4/5] bg-slate-50 border border-slate-200/60 rounded-3xl overflow-hidden relative cursor-crosshair group"
          >
            {badgeText && (
              <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                {badgeText}
              </span>
            )}

            {/* Mobile tap-to-zoom badge indicator */}
            {isTouchDevice && (
              <span className="absolute bottom-4 right-4 z-10 p-2 rounded-xl bg-white/90 backdrop-blur-md shadow border border-slate-100 text-slate-700 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest">
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Tap to Zoom</span>
              </span>
            )}

            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="eager"
            />

            {/* Magnifying Circular Lens (shown on desktop only) */}
            {showLens && !isTouchDevice && (
              <div
                style={{
                  left: `${lensPos.x}px`,
                  top: `${lensPos.y}px`,
                  backgroundImage: `url(${imageUrl})`,
                  backgroundPosition: `${lensPos.bgX} ${lensPos.bgY}`,
                  backgroundSize: "250%", // zoom magnification factor
                  backgroundRepeat: "no-repeat",
                }}
                className="absolute w-[120px] h-[120px] rounded-full border-2 border-white/60 shadow-[0_8px_16px_rgba(0,0,0,0.15)] pointer-events-none z-20"
              />
            )}
          </div>
        </div>

        {/* Right Side: Product Details */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-3">
            <h1 
              className="text-3xl font-black tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              {name}
            </h1>
            <span className="text-xl font-black text-[var(--color-primary,#694873)] block">
              {price}
            </span>
          </div>

          <p className="text-sm text-slate-500 leading-relaxed">
            {description}
          </p>

          {/* Options / Swatches selectors */}
          {options.length > 0 && (
            <div className="space-y-6 pt-4 border-t border-slate-100">
              {options.map((opt) => (
                <div key={opt.name} className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Select {opt.name}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val) => {
                      const isActive = selectedOptions[opt.name] === val;
                      return (
                        <button
                          key={val}
                          onClick={() => handleOptionSelect(opt.name, val)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 ${
                            isActive
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add to Cart CTA */}
          <div className="pt-4">
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-extrabold tracking-widest uppercase text-white shadow-md active:scale-95 transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: "var(--color-primary, #0f172a)" }}
            >
              {isAdded ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Added To Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add To Checkout</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Fullscreen Zoom Backdrop Modal (for mobile touch devices) */}
      {isFullscreen && isTouchDevice && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-90 transition-all duration-150"
            aria-label="Close zoom viewport"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={imageUrl}
            alt={name}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

    </section>
  );
}
