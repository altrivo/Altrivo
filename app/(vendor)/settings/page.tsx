"use client";

import { useState } from "react";
import { Card, Button } from "@/components/shared";
import { CheckCircle2 } from "@/components/shared/LucideIcons";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("Tahleel Studio");
  const [email, setEmail] = useState("vendor@altrio.com");
  const [phone, setPhone] = useState("+15552345678");
  const [location, setLocation] = useState("San Francisco, CA");
  const [payoutAccount, setPayoutAccount] = useState("•••• •••• •••• 9842 (Chase Bank)");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg("Settings successfully updated!");
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {toastMsg && (
        <div className="flex items-center gap-3 rounded-2xl border border-success-300 bg-success-50 p-4 shadow-sm animate-bounce">
          <CheckCircle2 size={20} className="text-success-600 shrink-0" />
          <span className="text-sm font-extrabold text-success-950">{toastMsg}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-heading font-display">
          Vendor Store Settings
        </h1>
        <p className="mt-1 text-sm font-medium text-body">
          Manage your artist profile, business location, payout accounts, and shipping preferences.
        </p>
      </div>

      <Card className="p-6 max-w-2xl space-y-6 shadow-card">
        <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
              Studio / Store Name
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full rounded-xl border border-default bg-input p-3 font-semibold text-heading focus:border-focus focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
                Vendor Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-default bg-input p-3 font-semibold text-heading focus:border-focus focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
                WhatsApp Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-default bg-input p-3 font-semibold text-heading focus:border-focus focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
              Studio Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-default bg-input p-3 font-semibold text-heading focus:border-focus focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-extrabold text-heading mb-1 uppercase tracking-wider text-[11px]">
              A2 Escrow Payout Bank Account
            </label>
            <input
              type="text"
              value={payoutAccount}
              onChange={(e) => setPayoutAccount(e.target.value)}
              className="w-full rounded-xl border border-default bg-input p-3 font-mono font-semibold text-heading focus:border-focus focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-default flex justify-end">
            <Button variant="primary" size="md" type="submit" className="font-extrabold shadow-md">
              Save Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
