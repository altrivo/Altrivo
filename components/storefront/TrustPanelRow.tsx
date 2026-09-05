import { Award, Headphones, Lock, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import React from "react";

import { TrustFeature, VendorStoreConfig } from "@/lib/storefront/themeResolver";


interface TrustPanelRowProps {
  config: VendorStoreConfig;
}

export function TrustPanelRow({ config }: TrustPanelRowProps) {
  const getIcon = (icon: TrustFeature["icon"]) => {
    switch (icon) {
      case "lock":
        return <Lock className="w-5 h-5" />;
      case "truck":
        return <Truck className="w-5 h-5" />;
      case "rotate-ccw":
        return <RotateCcw className="w-5 h-5" />;
      case "shield-check":
        return <ShieldCheck className="w-5 h-5" />;
      case "headphones":
        return <Headphones className="w-5 h-5" />;
      case "award":
        return <Award className="w-5 h-5" />;
      default:
        return <ShieldCheck className="w-5 h-5" />;
    }
  };

  return (
    <section aria-label="Trust & Guarantees" className="rounded-2xl border border-default bg-card p-6 shadow-xs select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
        {config.trustFeatures.map((feat) => (
          <div key={feat.title} className="flex items-start gap-3.5 p-2 rounded-xl hover:bg-muted/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-700 shrink-0 shadow-2xs">
              {getIcon(feat.icon)}
            </div>
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-heading text-xs sm:text-sm">
                {feat.title}
              </h3>
              <p className="text-[11px] text-subtle leading-relaxed">
                {feat.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
