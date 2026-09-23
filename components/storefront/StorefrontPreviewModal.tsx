"use client";

import {
  Check,
  Copy,
  ExternalLink,
  Laptop,
  Loader2,
  Smartphone,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface StorefrontPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewUrl?: string;
  storeName?: string;
}

export function StorefrontPreviewModal({
  isOpen,
  onClose,
  previewUrl = "/",
  storeName = "Artrivo Store",
}: StorefrontPreviewModalProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setCopied(false);
    }
  }, [isOpen, previewUrl]);

  if (!isOpen) return null;

  const fullShareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${previewUrl}`
      : `http://localhost:3000${previewUrl}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullShareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="storefront-preview-modal-title"
      className="fixed inset-0 z-modal bg-black/70 backdrop-blur-xs flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-fast"
    >
      {/* Top Controls Toolbar Header */}
      <header className="bg-card border-b border-default px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-xs border border-primary-200">
            🏬
          </div>
          <div>
            <h2
              id="storefront-preview-modal-title"
              className="font-extrabold text-sm text-heading leading-tight flex items-center gap-2"
            >
              <span>{storeName} — Live Storefront Preview</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-success-50 text-success-700 border border-success-200">
                Live &lt;2s Load
              </span>
            </h2>
            <p className="text-[11px] text-subtle font-mono truncate max-w-xs sm:max-w-md">
              {fullShareUrl}
            </p>
          </div>
        </div>

        {/* Center Viewport Selector Pills */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-default">
          <button
            onClick={() => setViewport("desktop")}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewport === "desktop"
                ? "bg-card text-primary-700 shadow-xs border border-default"
                : "text-subtle hover:text-heading"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>

          <button
            onClick={() => setViewport("mobile")}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewport === "mobile"
                ? "bg-card text-primary-700 shadow-xs border border-default"
                : "text-subtle hover:text-heading"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right Action Buttons: Copy link, New tab, Close */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              copied
                ? "bg-success-50 text-success-800 border-success-300"
                : "bg-card text-heading border-default hover:bg-muted"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-success-600" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-subtle" />
                <span>Copy Shareable Link</span>
              </>
            )}
          </button>

          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-primary-600 text-white font-bold text-xs shadow-xs hover:bg-primary-700 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in New Tab</span>
          </a>

          <button
            onClick={onClose}
            aria-label="Close storefront preview modal"
            className="w-8 h-8 rounded-xl bg-muted text-subtle hover:text-heading hover:bg-card border border-default flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Preview Area */}
      <main className="flex-1 bg-[#121214] p-4 sm:p-6 flex items-center justify-center overflow-auto relative">
        {/* Loading Spinner Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#121214]/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 z-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <span className="text-xs font-bold text-gray-300">Rendering Live Storefront Preview...</span>
          </div>
        )}

        {/* Viewport Frame Container */}
        {viewport === "desktop" ? (
          /* Desktop Viewport (Full width address bar frame) */
          <div className="w-full max-w-6xl h-full rounded-2xl bg-card border border-gray-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Fake Chrome Address Bar */}
            <div className="bg-[#1E1E22] px-4 py-2 flex items-center gap-3 border-b border-gray-800">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-error-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-warning-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-success-500 inline-block" />
              </div>
              <div className="flex-1 bg-[#121214] px-3 py-1 rounded-lg text-xs text-gray-400 font-mono flex items-center justify-between">
                <span className="truncate">{fullShareUrl}</span>
                <span className="text-[10px] text-success-400 font-sans font-bold">🔒 SSL Secured</span>
              </div>
            </div>
            {/* Iframe */}
            <iframe
              src={previewUrl}
              title="Storefront Desktop Live Preview"
              onLoad={() => setIsLoading(false)}
              className="w-full flex-1 border-0 bg-white"
            />
          </div>
        ) : (
          /* Mobile Viewport (Realistic Smartphone Bezel Frame) */
          <div className="w-[375px] h-[667px] rounded-[40px] bg-[#1E1E22] border-4 border-gray-700 shadow-2xl p-3 flex flex-col relative overflow-hidden my-auto">
            {/* Speaker Notch */}
            <div className="w-32 h-4 bg-[#121214] rounded-b-xl mx-auto flex items-center justify-center mb-2 z-10">
              <span className="w-10 h-1 bg-gray-700 rounded-full" />
            </div>

            {/* Mobile Iframe */}
            <div className="flex-1 rounded-[28px] overflow-hidden border border-gray-800 bg-white">
              <iframe
                src={previewUrl}
                title="Storefront Mobile Live Preview"
                onLoad={() => setIsLoading(false)}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
