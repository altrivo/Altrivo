import Link from "next/link";
import React from "react";

import { formatCloudinaryUrl } from "@/lib/storefront/imageOptimizer";
import { VendorStoreConfig } from "@/lib/storefront/themeResolver";

interface CategoryTilesProps {
  config: VendorStoreConfig;
}

export function CategoryTiles({ config }: CategoryTilesProps) {
  return (
    <section aria-label="Product Categories" className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-heading">
            Browse By Category
          </h2>
          <p className="text-xs text-subtle mt-0.5">
            Curated artisanal collections handcrafted by master artisans
          </p>
        </div>
        <span className="text-xs font-semibold text-subtle hidden sm:inline">
          {config.categoryTiles.length} Categories Available
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {config.categoryTiles.map((cat) => {
          const optimizedImage = cat.image
            ? formatCloudinaryUrl(cat.image, { width: 400, height: 400, crop: "fill" })
            : null;

          return (
            <Link
              key={cat.title}
              href={cat.href}
              className="relative group p-5 rounded-2xl border border-default bg-card hover:bg-accent-50/50 hover:border-accent-400 shadow-xs hover:shadow-card-hover transition-all text-center space-y-3 cursor-pointer overflow-hidden flex flex-col items-center justify-center min-h-[140px]"
            >
              {optimizedImage && (
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                  <img
                    src={optimizedImage}
                    alt={cat.title}
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-slow"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="text-3xl relative z-10 group-hover:scale-110 transition-transform duration-fast">
                {cat.icon}
              </div>

              <div className="relative z-10 space-y-0.5">
                <h3 className="font-bold text-xs sm:text-sm text-heading group-hover:text-primary-700">
                  {cat.title}
                </h3>
                <span className="text-[11px] font-semibold text-subtle block">
                  {cat.count}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
