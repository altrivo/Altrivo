"use client";

import React, { useState, useEffect, useRef } from "react";
import { Star, ShoppingBag, Check, RotateCw } from "lucide-react";

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

export default function ProductSingleFocus360({
  id,
  name,
  price,
  description,
  imageUrl,
  badgeText = "360 Spin Spotlight",
  options = [],
  onAddToCart,
}: ProductSingleFocusProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragStartX = useRef(0);
  const dragStartFrame = useRef(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [interacted, setInteracted] = useState(false);
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

  // Handle option swatch clicks
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

  // Drag interaction events
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    dragStartFrame.current = frameIndex;
    setIsDragging(true);
    setInteracted(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragStartFrame.current = frameIndex;
    setIsDragging(true);
    setInteracted(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX.current;
      const frameDelta = Math.floor(deltaX / (300 / 24)); // 300px for full rotation (24 frames)
      let newFrame = (dragStartFrame.current + frameDelta) % 24;
      if (newFrame < 0) newFrame += 24;
      setFrameIndex(newFrame);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const deltaX = e.touches[0].clientX - dragStartX.current;
      const frameDelta = Math.floor(deltaX / (300 / 24));
      let newFrame = (dragStartFrame.current + frameDelta) % 24;
      if (newFrame < 0) newFrame += 24;
      setFrameIndex(newFrame);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  // 3D wireframe vase rendering logic inside 2D Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Rotation angle
    const angle = (frameIndex * (360 / 24) * Math.PI) / 180;

    // Draw parameters
    const centerX = width / 2;
    const centerY = height / 2;
    const vaseHeight = 220;
    
    ctx.strokeStyle = "var(--color-primary, #694873)";
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";

    // Helper: Draw horizontal ellipses (latitude lines)
    const drawVaseSlice = (yOffset: number, radius: number) => {
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + yOffset, radius, radius * 0.28, 0, 0, Math.PI * 2);
      ctx.stroke();
    };

    // Helper: Draw vertical loops rotating (longitude lines)
    const drawVaseVerticalLoop = (phase: number) => {
      ctx.beginPath();
      // Draw a smooth bezier curve representing the vase silhouette
      // We scale the X-coordinates based on rotation cosine
      const scaleX = Math.cos(angle + phase);

      // Path coordinates
      ctx.moveTo(centerX + 35 * scaleX, centerY - 100);
      ctx.bezierCurveTo(
        centerX + 20 * scaleX, centerY - 60,
        centerX + 70 * scaleX, centerY + 10,
        centerX + 50 * scaleX, centerY + 80
      );
      ctx.lineTo(centerX + 30 * scaleX, centerY + 110);
      ctx.stroke();
    };

    // 1. Draw horizontal latitude rings (different heights and radii)
    ctx.globalAlpha = 0.22;
    drawVaseSlice(-100, 35); // top neck rim
    drawVaseSlice(-50, 27);  // neck base
    drawVaseSlice(0, 52);   // bulbous middle
    drawVaseSlice(50, 60);   // maximum bulb
    drawVaseSlice(110, 30);  // bottom base

    // 2. Draw vertical rotating wireframe longitude ribs
    ctx.globalAlpha = 0.55;
    for (let i = 0; i < 4; i++) {
      drawVaseVerticalLoop((i * Math.PI) / 4);
    }

    // 3. Draw outer dark backdrop silhouette container boundaries
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 130, 0, Math.PI * 2);
    ctx.stroke();

  }, [frameIndex]);

  return (
    <section className="relative w-full py-12 bg-white text-slate-900 border-b border-slate-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: 360 Spin interactive frame */}
        <div className="md:col-span-6 relative flex flex-col items-center">
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="w-full aspect-square max-w-md bg-slate-50 border border-slate-200/60 rounded-3xl overflow-hidden relative cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
          >
            {badgeText && (
              <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                {badgeText}
              </span>
            )}

            {/* Canvas wireframe rotation viewer */}
            <canvas
              ref={canvasRef}
              width={350}
              height={350}
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* "Drag to rotate" overlay indicator (fades out after first interaction) */}
            {!interacted && (
              <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center gap-3 transition-opacity duration-300 pointer-events-none">
                <div className="p-3.5 rounded-full bg-white/95 shadow-md border border-slate-100 animate-bounce">
                  <RotateCw className="h-6 w-6 text-slate-700 animate-spin" style={{ animationDuration: "3s" }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-white px-3 py-1 rounded-md border border-slate-100 shadow-xs">
                  Drag to Rotate 360
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Description */}
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

          {/* Options swatches */}
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

          {/* CTA Add button */}
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
    </section>
  );
}
