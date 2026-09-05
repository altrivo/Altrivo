"use client";

import { useState } from "react";
import { Product } from "@/types/products";
import { Button } from "@/components/shared";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (newProduct: Product) => void;
}

export function AddProductModal({
  isOpen,
  onClose,
  onAddProduct,
}: AddProductModalProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("Wall Art & Canvas");
  const [price, setPrice] = useState("195.00");
  const [originalPrice, setOriginalPrice] = useState("240.00");
  const [stock, setStock] = useState("10");
  const [sku, setSku] = useState(`ART-NEW-${Math.floor(1000 + Math.random() * 9000)}`);
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80");
  const [description, setDescription] = useState("");
  const [variantSize, setVariantSize] = useState("24 x 36 Inches");
  const [variantColor, setVariantColor] = useState("Natural Oak Frame");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a product title.");
      return;
    }

    const numPrice = parseFloat(price) || 100.0;
    const numOrigPrice = parseFloat(originalPrice) || numPrice * 1.2;
    const numStock = parseInt(stock, 10) || 1;
    const newId = `p-${Date.now()}`;

    const newProd: Product = {
      id: newId,
      title: title.trim(),
      subtitle: subtitle.trim() || "Original Artisanal Creation",
      category,
      price: numPrice,
      originalPrice: numOrigPrice,
      rating: 5.0,
      reviewCount: 1,
      stock: numStock,
      sku: sku.trim() || `ART-${Date.now()}`,
      description: description.trim() || "Handcrafted artwork created by Tahleel Studio using premium materials.",
      vendorName: "Tahleel Studio",
      vendorPhone: "+15552345678",
      vendorEmail: "studio@altrio.com",
      vendorLocation: "San Francisco, CA",
      shippingInfo: "Free Express Shipping on orders over $150.",
      returnPolicy: "30-Day Money-Back Guarantee.",
      media: [
        {
          id: `m-${Date.now()}`,
          type: "image",
          url: imageUrl.trim() || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
          thumbnail: imageUrl.trim() || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=200&q=80",
          alt: title,
        },
      ],
      variants: [
        {
          id: `v-${Date.now()}`,
          name: `${variantSize} / ${variantColor}`,
          size: variantSize,
          color: variantColor,
          price: numPrice,
          originalPrice: numOrigPrice,
          stock: numStock,
          sku: sku.trim() || `ART-${Date.now()}`,
          image: imageUrl.trim(),
        },
      ],
      specs: [
        { label: "Medium", value: "Acrylic & Impasto Oil on Canvas" },
        { label: "Dimensions", value: variantSize },
        { label: "Frame Finish", value: variantColor },
      ],
      reviews: [
        {
          id: `r-${Date.now()}`,
          author: "Gallery Inspector",
          rating: 5,
          date: "Just Now",
          comment: "Newly listed artwork verified by studio master artist.",
          verifiedPurchase: true,
        },
      ],
      relatedProducts: [],
    };

    onAddProduct(newProd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-overlay backdrop-blur-xs" onClick={onClose} />

      {/* Form Card Container */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-strong bg-card p-6 shadow-modal z-modal space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-default pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-heading font-display">
              Add New Product to Catalog
            </h2>
            <p className="text-xs font-semibold text-body mt-0.5">
              Fill in product details, variants, inventory, and pricing.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-heading hover:bg-neutral-200 transition-colors border border-default"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Golden Horizon Oil Painting"
                className="w-full rounded-xl border border-default bg-input px-3.5 py-2.5 font-semibold text-heading focus:border-focus focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
                Subtitle / Tagline
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Original Textured Impasto Painting"
                className="w-full rounded-xl border border-default bg-input px-3.5 py-2.5 font-semibold text-heading focus:border-focus focus:outline-none"
              />
            </div>
          </div>

          {/* Category & SKU */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-default bg-input px-3.5 py-2.5 font-semibold text-heading focus:border-focus focus:outline-none"
              >
                <option value="Wall Art & Canvas">Wall Art & Canvas</option>
                <option value="Ceramics & Sculpture">Ceramics & Sculpture</option>
                <option value="Home Accent">Home Accent</option>
                <option value="Framed Prints">Framed Prints</option>
              </select>
            </div>

            <div>
              <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
                SKU Code
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-xl border border-default bg-input px-3.5 py-2.5 font-mono font-semibold text-heading focus:border-focus focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-default bg-input px-3.5 py-2.5 font-mono font-bold text-heading focus:border-focus focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
                Original Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full rounded-xl border border-default bg-input px-3.5 py-2.5 font-mono font-bold text-heading focus:border-focus focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
                Initial Stock *
              </label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full rounded-xl border border-default bg-input px-3.5 py-2.5 font-mono font-bold text-heading focus:border-focus focus:outline-none"
              />
            </div>
          </div>

          {/* Variant Defaults */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl bg-neutral-100 p-4 border border-default">
            <div>
              <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
                Default Size Variant
              </label>
              <input
                type="text"
                value={variantSize}
                onChange={(e) => setVariantSize(e.target.value)}
                placeholder="e.g. 24 x 36 Inches"
                className="w-full rounded-xl border border-default bg-card px-3 py-2 font-semibold text-heading focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
                Default Frame / Finish
              </label>
              <input
                type="text"
                value={variantColor}
                onChange={(e) => setVariantColor(e.target.value)}
                placeholder="e.g. Natural Oak Frame"
                className="w-full rounded-xl border border-default bg-card px-3 py-2 font-semibold text-heading focus:outline-none"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
              Image URL
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-default bg-input px-3.5 py-2.5 font-mono font-semibold text-heading focus:border-focus focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
              Full Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe artwork medium, technique, and care instructions..."
              className="w-full rounded-xl border border-default bg-input p-3 font-semibold text-heading focus:border-focus focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-default">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} className="font-bold border-strong">
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" className="font-bold shadow-md">
              Save & Add to Catalog
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
