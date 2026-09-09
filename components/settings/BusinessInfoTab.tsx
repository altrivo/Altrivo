"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BusinessProfile } from "@/lib/settings";

interface Props {
  profile: BusinessProfile;
  onSave: (profile: BusinessProfile) => void;
}

const SAMPLE_LOGOS = [
  "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
];

export function BusinessInfoTab({ profile, onSave }: Props) {
  const [formData, setFormData] = useState<BusinessProfile>(profile);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof BusinessProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  const handleSimulateCloudinaryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            // Pick a realistic logo preview URL or create object URL
            const previewUrl = URL.createObjectURL(file);
            setFormData((prevData) => ({ ...prevData, logoUrl: previewUrl }));
            setUploading(false);
            setUploadProgress(100);
          }, 300);
          return 90;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Toast alert */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-success-50 border border-success-200 text-success-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-success-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Business profile details saved successfully!</span>
          </div>
        </div>
      )}

      {/* Cloudinary Logo Upload Section */}
      <div className="p-6 rounded-2xl bg-card border border-default shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
              Store Logo &amp; Branding
            </h3>
            <p className="text-xs text-subtle">
              Upload your brand logo (PNG, JPG, SVG up to 5MB). Uploaded directly to Cloudinary CDN.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-accent-100 text-accent-800 text-[10px] font-bold uppercase tracking-wider">
            Cloudinary CDN
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
          {/* Logo Avatar Circle */}
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary-500/20 bg-muted shrink-0 shadow-md">
            {formData.logoUrl ? (
              <Image
                src={formData.logoUrl}
                alt="Store Logo"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-subtle font-bold text-xl">
                LOGO
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                <span className="text-xs font-bold">{uploadProgress}%</span>
              </div>
            )}
          </div>

          {/* Upload Dropzone */}
          <div className="flex-1 w-full space-y-3">
            <label className="relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-default bg-page hover:border-primary-400 hover:bg-primary-50/20 transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleSimulateCloudinaryUpload}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-2 text-primary-600 text-xs font-bold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{uploading ? "Uploading to Cloudinary..." : "Click or drag to upload logo"}</span>
              </div>
              <p className="text-[11px] text-subtle mt-1">Recommended: 500x500px square image</p>
            </label>

            {/* Quick sample logo select */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-subtle font-medium">Or pick sample logo:</span>
              <div className="flex items-center gap-1.5">
                {SAMPLE_LOGOS.map((url, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => handleChange("logoUrl", url)}
                    className={`relative w-7 h-7 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      formData.logoUrl === url ? "border-primary-500 ring-2 ring-primary-500" : "border-default opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={url} alt={`Sample ${i}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <div className="p-6 rounded-2xl bg-card border border-default shadow-sm space-y-6">
        <h3 className="text-base font-bold text-heading border-b border-default pb-3" style={{ fontFamily: "var(--font-display)" }}>
          General Business Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">
              Business / Store Name
            </label>
            <input
              type="text"
              required
              value={formData.storeName}
              onChange={(e) => handleChange("storeName", e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">
              Primary Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
            >
              <option value="Handcrafted Goods">Handcrafted Goods</option>
              <option value="Fashion & Apparel">Fashion &amp; Apparel</option>
              <option value="Beauty & Personal Care">Beauty &amp; Personal Care</option>
              <option value="Electronics & Gadgets">Electronics &amp; Gadgets</option>
              <option value="Home & Living">Home &amp; Living</option>
              <option value="Food & Beverage">Food &amp; Beverage</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">
              Business Description / Bio
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Tell customers what makes your products unique..."
              className="w-full p-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">
              Official Business Phone
            </label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">
              Business Email Address
            </label>
            <input
              type="email"
              required
              value={formData.businessEmail}
              onChange={(e) => handleChange("businessEmail", e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">
              Physical Business / Warehouse Address
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-default">
          <button
            type="submit"
            className="px-6 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-on-primary text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            Save Profile Changes
          </button>
        </div>
      </div>
    </form>
  );
}
