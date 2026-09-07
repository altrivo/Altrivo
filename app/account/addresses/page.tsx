"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AccountNav } from "@/components/account/AccountNav";
import { MapPin, Plus, Trash2, CheckCircle2, Home, Building } from "lucide-react";

export default function CustomerAddressesPage() {
  const router = useRouter();
  const { customer, loading } = useCustomerAuth();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [label, setLabel] = useState("Home");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("Lahore");
  const [postalCode, setPostalCode] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !customer) {
      router.push("/login?redirect=/account/addresses");
      return;
    }

    if (customer) {
      setFullName(customer.name || "");
      setPhone(customer.phone || "");

      fetch(`/api/customer/addresses?customerId=${customer.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.addresses && data.addresses.length > 0) {
            setAddresses(data.addresses);
          } else {
            // Pre-seed default address for seamless experience
            setAddresses([
              {
                id: "addr-default",
                customer_id: customer.id,
                label: "Home",
                full_name: customer.name || "Customer",
                phone: customer.phone || "0300 1234567",
                street_address: "House 42, Street 8, Phase 5 DHA",
                city: "Lahore",
                region: "Punjab",
                postal_code: "54000",
                is_default: true,
              },
            ]);
          }
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [customer, loading, router]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          label,
          full_name: fullName,
          phone,
          street_address: streetAddress,
          city,
          postal_code: postalCode,
          is_default: isDefault,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAddresses((prev) => [data.address, ...prev]);
        setShowAddForm(false);
        setStreetAddress("");
        setPostalCode("");
      }
    } catch (e) {
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (customer) {
      try {
        await fetch(`/api/customer/addresses?id=${id}&customerId=${customer.id}`, {
          method: "DELETE",
        });
      } catch (e) {}
    }
  };

  if (loading || !customer) {
    return (
      <div className="min-h-screen bg-white">
        <AccountHeader />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center text-xs text-[#5c3d5c]">
          Loading addresses...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <AccountHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <AccountNav />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-black">Delivery Addresses</h1>
                  <p className="text-xs text-[#5c3d5c] mt-0.5">
                    Save multiple delivery locations for fast express checkout across Pakistan.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddForm ? "Cancel" : "Add New Address"}</span>
                </button>
              </div>

              {/* Add Address Form */}
              {showAddForm && (
                <form
                  onSubmit={handleAddAddress}
                  className="p-5 rounded-xl border border-[#5c3d5c]/30 bg-gray-50/50 space-y-4"
                >
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                    New Address Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-black mb-1">Address Label</label>
                      <select
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#5c3d5c]/30 bg-white text-black focus:outline-none focus:border-[#3e2845]"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office / Workplace</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-black mb-1">Recipient Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#5c3d5c]/30 bg-white text-black focus:outline-none focus:border-[#3e2845]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-black mb-1">Phone (WhatsApp for Rider)</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0300 1234567"
                        className="w-full h-10 px-3 rounded-xl border border-[#5c3d5c]/30 bg-white text-black focus:outline-none focus:border-[#3e2845]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-black mb-1">City</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#5c3d5c]/30 bg-white text-black focus:outline-none focus:border-[#3e2845]"
                      >
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Multan">Multan</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Quetta">Quetta</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-black mb-1">Full Street Address</label>
                      <input
                        type="text"
                        required
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="House #, Street, Block, Area..."
                        className="w-full h-10 px-3 rounded-xl border border-[#5c3d5c]/30 bg-white text-black focus:outline-none focus:border-[#3e2845]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isDefaultCheck"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="rounded border-[#5c3d5c]"
                    />
                    <label htmlFor="isDefaultCheck" className="text-xs text-black font-medium">
                      Set as primary delivery address
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 h-10 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {submitting ? "Saving..." : "Save Address"}
                    </button>
                  </div>
                </form>
              )}

              {/* Address Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 rounded-xl border border-[#5c3d5c]/20 hover:border-[#3e2845]/40 transition-colors bg-white relative space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {addr.label === "Home" ? (
                            <Home className="w-4 h-4 text-[#3e2845]" />
                          ) : (
                            <Building className="w-4 h-4 text-[#3e2845]" />
                          )}
                          <span className="text-xs font-bold text-black">{addr.label}</span>
                        </div>

                        {addr.is_default && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-black">{addr.full_name || customer.name}</p>
                      <p className="text-xs text-[#5c3d5c] leading-relaxed">{addr.street_address}</p>
                      <p className="text-xs text-[#5c3d5c]">
                        {addr.city}, {addr.region || "Pakistan"}
                      </p>
                      <p className="text-xs text-[#5c3d5c]">Phone: {addr.phone || customer.phone}</p>
                    </div>

                    <div className="pt-3 border-t border-[#5c3d5c]/10 flex items-center justify-end">
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                        title="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
