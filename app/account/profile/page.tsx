"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AccountNav } from "@/components/account/AccountNav";
import { User, Mail, Phone, CheckCircle2, AlertCircle } from "lucide-react";

export default function CustomerProfilePage() {
  const router = useRouter();
  const { customer, loading, updateProfile } = useCustomerAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !customer) {
      router.push("/login?redirect=/account/profile");
      return;
    }
    if (customer) {
      setName(customer.name || "");
      setPhone(customer.phone || "");
    }
  }, [customer, loading, router]);

  if (loading || !customer) {
    return (
      <div className="min-h-screen bg-white">
        <AccountHeader />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center text-xs text-[#5c3d5c]">
          Loading profile...
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim()) {
      setMessage({ type: "error", text: "Full name cannot be empty." });
      return;
    }

    setSaving(true);
    const result = await updateProfile({ name: name.trim(), phone: phone.trim() });
    setSaving(false);

    if (result.success) {
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update profile." });
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <AccountHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <AccountNav />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h1 className="text-xl font-bold text-black">Customer Profile</h1>
                <p className="text-xs text-[#5c3d5c] mt-0.5">
                  Update your personal information for shipping and delivery contact.
                </p>
              </div>

              {message && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                    message.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-black mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#5c3d5c] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-[#5c3d5c]/30 text-xs text-black focus:outline-none focus:border-[#3e2845] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#5c3d5c] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      disabled
                      value={customer.email}
                      className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-[#5c3d5c]/20 bg-gray-50 text-xs text-[#5c3d5c] cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-[#5c3d5c] mt-1">
                    Email address is tied to your store account login.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black mb-1.5">Phone Number (WhatsApp Delivery Alerts)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#5c3d5c] absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0300 1234567"
                      className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-[#5c3d5c]/30 text-xs text-black focus:outline-none focus:border-[#3e2845] transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 h-10 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] text-white text-xs font-bold transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
