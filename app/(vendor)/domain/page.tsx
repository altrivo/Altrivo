import React from "react";
import { Globe, CheckCircle2, ShieldCheck } from "lucide-react";

export default function DomainPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-heading">
          Domain & SSL Configuration
        </h1>
        <p className="text-xs text-subtle mt-1">
          Connect your custom domain or manage your free Altrivo storefront URL.
        </p>
      </div>

      <div className="rounded-2xl bg-card border border-default p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success-50 text-success-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-heading">store.artrivo.com</h3>
              <span className="text-xs text-subtle">Primary Custom Domain</span>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-success-50 text-success-700 border border-success-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-success-600" /> Active & Verified
          </span>
        </div>

        <div className="p-4 rounded-xl bg-muted/40 border border-default grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-subtle font-semibold">DNS CNAME Record:</span>
            <p className="font-mono text-heading font-bold mt-0.5">cname.artrivo-vendor.com</p>
          </div>
          <div>
            <span className="text-subtle font-semibold">SSL Certificate:</span>
            <p className="font-semibold text-success-700 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-success-600" /> Let&apos;s Encrypt TLS 1.3 Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
