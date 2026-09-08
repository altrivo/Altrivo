import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import React from "react";

import { formatCloudinaryUrl } from "@/lib/storefront/imageOptimizer";
import { VendorStoreConfig } from "@/lib/storefront/themeResolver";


interface HeroBannerProps {
  config: VendorStoreConfig;
}

export function HeroBanner({ config }: HeroBannerProps) {
  const { hero } = config;
  const optimizedImageUrl = formatCloudinaryUrl(hero.imageUrl, { width: 1280, height: 720, crop: "fill" });

  return (
    <section aria-label="Hero Showcase" className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-950 via-primary-900 to-[#3B2742] p-8 sm:p-12 md:p-16 text-white shadow-xl">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-accent-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-16 w-80 h-80 rounded-full bg-primary-400/25 blur-2xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Headline & CTAs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-tight text-white">
            {hero.headline}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-accent-100/90 leading-relaxed max-w-2xl">
            {hero.subheadline}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href={hero.ctaHref}
              className="px-7 py-4 rounded-xl bg-gradient-to-r from-accent-400 to-accent-500 text-primary-950 font-extrabold text-sm sm:text-base hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-2.5 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-primary-950" />
              <span>{hero.ctaText}</span>
            </Link>

            {hero.secondaryCtaText && hero.secondaryCtaHref && (
              <Link
                href={hero.secondaryCtaHref}
                className="px-7 py-4 rounded-xl bg-white/15 border border-white/30 text-white font-bold text-sm sm:text-base hover:bg-white/25 active:scale-95 transition-all backdrop-blur-md flex items-center gap-2 cursor-pointer"
              >
                <span>{hero.secondaryCtaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Right Hero Image / Media Card (5 cols) */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-primary-900/50 group">
            {hero.videoUrl ? (
              <video
                src={hero.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={optimizedImageUrl}
                alt={hero.headline}
                width={800}
                height={800}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
                loading="eager"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white flex items-center justify-between">
              <span>Verified Merchant Product Showcase</span>
              <span className="px-2 py-0.5 rounded bg-accent-500 text-primary-950 font-extrabold text-[10px]">
                100% Authentic
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
