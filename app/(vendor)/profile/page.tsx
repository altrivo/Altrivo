import React from "react";
import { ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-heading">
          Vendor Profile
        </h1>
        <p className="text-xs text-subtle mt-1">
          Manage your seller profile, merchant identity, and contact information.
        </p>
      </div>

      <div className="rounded-2xl bg-card border border-default p-6 shadow-card space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 text-white font-bold text-xl flex items-center justify-center shadow-lg">
            AS
          </div>
          <div>
            <h2 className="text-lg font-bold text-heading">Artrivo Vendor</h2>
            <p className="text-xs text-subtle">Verified Pro Merchant since 2024</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success-700 bg-success-50 px-2 py-0.5 rounded-full border border-success-200 mt-1">
              <ShieldCheck className="w-3 h-3 text-success-600" /> Identity Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
