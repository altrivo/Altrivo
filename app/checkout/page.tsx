"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { AccountHeader } from "@/components/account/AccountHeader";
import {
  ShoppingBag,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Tag,
  ArrowRight,
  User,
  MapPin,
  Mail,
  Phone,
  AlertCircle,
  CreditCard,
  Building,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    appliedCoupon,
    couponError,
    effectiveShippingCost,
    grandTotal,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const { customer, loading: authLoading, login, register } = useCustomerAuth();

  // Auth Gate states (if not logged in)
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Delivery details form
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("Lahore");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer" | "card">("cod");
  const [couponInput, setCouponInput] = useState("");

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("custom");

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  // Pre-fill user data when customer becomes available
  useEffect(() => {
    if (customer) {
      setRecipientName(customer.name || "");
      setRecipientPhone(customer.phone || "");

      fetch(`/api/customer/addresses?customerId=${customer.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const def = data.addresses.find((a: any) => a.is_default) || data.addresses[0];
            if (def) {
              setSelectedAddressId(def.id);
              setStreetAddress(def.street_address);
              setCity(def.city || "Lahore");
              setPostalCode(def.postal_code || "");
              if (def.full_name) setRecipientName(def.full_name);
              if (def.phone) setRecipientPhone(def.phone);
            }
          }
        })
        .catch(() => {});
    }
  }, [customer]);

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === "custom") {
      setStreetAddress("");
      setPostalCode("");
    } else {
      const addr = savedAddresses.find((a) => a.id === id);
      if (addr) {
        setStreetAddress(addr.street_address);
        setCity(addr.city || "Lahore");
        setPostalCode(addr.postal_code || "");
        if (addr.full_name) setRecipientName(addr.full_name);
        if (addr.phone) setRecipientPhone(addr.phone);
      }
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);

    if (authMode === "login") {
      const res = await login(authEmail, authPassword);
      setAuthSubmitting(false);
      if (!res.success) {
        setAuthError(res.error || "Login failed. Check your credentials.");
      }
    } else {
      if (!authName.trim()) {
        setAuthError("Name is required");
        setAuthSubmitting(false);
        return;
      }
      const res = await register(authName, authEmail, authPassword, authPhone);
      setAuthSubmitting(false);
      if (!res.success) {
        setAuthError(res.error || "Registration failed. Account may already exist.");
      }
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setCouponInput("");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError("");

    if (!recipientName.trim()) {
      setOrderError("Please provide the recipient name for delivery.");
      return;
    }
    if (!recipientPhone.trim()) {
      setOrderError("Phone number is required for delivery rider contact.");
      return;
    }
    if (!streetAddress.trim()) {
      setOrderError("Please enter full delivery street address.");
      return;
    }
    if (items.length === 0) {
      setOrderError("Your shopping cart is empty.");
      return;
    }

    setPlacingOrder(true);

    try {
      const payload = {
        customerId: customer?.id || null,
        customerName: recipientName.trim(),
        customerEmail: customer?.email || "",
        customerPhone: recipientPhone.trim(),
        shippingAddress: streetAddress.trim(),
        city,
        postalCode: postalCode.trim(),
        paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
        items: items.map((it) => ({
          productId: it.productId,
          variantId: it.sku || "default",
          title: it.title,
          quantity: it.quantity,
          price: it.price,
        })),
      };

      const res = await fetch("/api/checkout/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOrderError(data.error || "Failed to place order. Please check inputs.");
        setPlacingOrder(false);
        return;
      }

      // Order success! Clear cart and redirect
      clearCart();
      router.push(
        `/order-success?orderId=${data.order.id}&orderNumber=${data.order.orderNumber}&tracking=${data.trackingNumber}`
      );
    } catch (err: any) {
      setOrderError(err.message || "Network error placing order.");
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white text-black">
        <AccountHeader />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#3e2845]/10 text-[#3e2845] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Your Cart is Empty</h1>
          <p className="text-xs text-[#5c3d5c]">
            You have no items ready for checkout. Explore our artisanal catalog to add items.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3e2845] text-white text-xs font-bold hover:bg-[#4b3254] transition-all shadow-xs"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <AccountHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <span className="text-[11px] font-bold text-[#5c3d5c] uppercase tracking-wider">
            Secure Escrow Checkout
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight mt-0.5">
            Complete Your Order
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Checkout Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. CHECKOUT AUTHENTICATION GATE */}
            {!customer ? (
              <div className="bg-white rounded-2xl border-2 border-[#3e2845] p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3e2845] text-white flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-black">
                      Step 1: Sign in or Create Account
                    </h2>
                    <p className="text-xs text-[#5c3d5c]">
                      Please authenticate to link your order, enable live courier tracking, and save your address.
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex rounded-xl bg-gray-100 p-1 border border-[#5c3d5c]/10 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                    }}
                    className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                      authMode === "login"
                        ? "bg-white text-[#3e2845] shadow-xs"
                        : "text-[#5c3d5c] hover:text-black"
                    }`}
                  >
                    Returning Customer Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setAuthError("");
                    }}
                    className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                      authMode === "register"
                        ? "bg-white text-[#3e2845] shadow-xs"
                        : "text-[#5c3d5c] hover:text-black"
                    }`}
                  >
                    Create New Account
                  </button>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {authMode === "register" && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-black mb-1">Full Name</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-[#5c3d5c] absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="e.g. Ayesha Malik"
                            className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#5c3d5c]/30 text-xs text-black focus:outline-none focus:border-[#3e2845]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-black mb-1">Phone Number (WhatsApp)</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-[#5c3d5c] absolute left-3.5 top-3" />
                          <input
                            type="tel"
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value)}
                            placeholder="0300 1234567"
                            className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#5c3d5c]/30 text-xs text-black focus:outline-none focus:border-[#3e2845]"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-black mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#5c3d5c] absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#5c3d5c]/30 text-xs text-black focus:outline-none focus:border-[#3e2845]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-black mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#5c3d5c] absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#5c3d5c]/30 text-xs text-black focus:outline-none focus:border-[#3e2845]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="w-full h-10 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {authSubmitting
                      ? "Verifying..."
                      : authMode === "login"
                      ? "Sign In & Proceed to Address"
                      : "Create Account & Proceed"}
                  </button>
                </form>
              </div>
            ) : (
              /* Authenticated User Badge */
              <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-black">
                      Signed in as {customer.name} ({customer.email})
                    </p>
                    <p className="text-[11px] text-[#5c3d5c]">
                      Your order will be linked to your customer account.
                    </p>
                  </div>
                </div>

                <Link
                  href="/account"
                  className="text-xs text-[#3e2845] font-bold hover:underline"
                >
                  My Account
                </Link>
              </div>
            )}

            {/* 2. DELIVERY ADDRESS & RECIPIENT */}
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#3e2845]" />
                  <h2 className="text-sm font-bold text-black">Delivery Details (Pakistan)</h2>
                </div>

                {/* Saved addresses selector */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#5c3d5c]">
                      Choose Saved Address
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? "border-[#3e2845] bg-[#3e2845]/5 font-bold text-black"
                              : "border-[#5c3d5c]/20 text-black hover:border-[#3e2845]/40"
                          }`}
                        >
                          <p className="font-bold text-xs">{addr.label}</p>
                          <p className="text-[11px] text-[#5c3d5c] truncate">{addr.street_address}, {addr.city}</p>
                        </div>
                      ))}
                      <div
                        onClick={() => handleSelectAddress("custom")}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedAddressId === "custom"
                            ? "border-[#3e2845] bg-[#3e2845]/5 font-bold text-black"
                            : "border-[#5c3d5c]/20 text-[#5c3d5c] hover:border-[#3e2845]/40"
                        }`}
                      >
                        <p className="font-bold text-xs">+ Enter Different Address</p>
                        <p className="text-[11px] text-[#5c3d5c]">Custom delivery location</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-black mb-1">Recipient Full Name</label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Ayesha Malik"
                      className="w-full h-10 px-3.5 rounded-xl border border-[#5c3d5c]/30 text-xs text-black focus:outline-none focus:border-[#3e2845]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-black mb-1">
                      Phone Number (WhatsApp Updates)
                    </label>
                    <input
                      type="tel"
                      required
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="e.g. 0300 1234567"
                      className="w-full h-10 px-3.5 rounded-xl border border-[#5c3d5c]/30 text-xs text-black focus:outline-none focus:border-[#3e2845]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-black mb-1">
                      Shipping Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="House / Apartment #, Street, Block, Area..."
                      className="w-full h-10 px-3.5 rounded-xl border border-[#5c3d5c]/30 text-xs text-black focus:outline-none focus:border-[#3e2845]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-black mb-1">City</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-[#5c3d5c]/30 text-xs text-black focus:outline-none focus:border-[#3e2845] bg-white"
                    >
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Quetta">Quetta</option>
                      <option value="Sialkot">Sialkot</option>
                      <option value="Gujranwala">Gujranwala</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-black mb-1">Postal Code (Optional)</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 54000"
                      className="w-full h-10 px-3.5 rounded-xl border border-[#5c3d5c]/30 text-xs text-black focus:outline-none focus:border-[#3e2845]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. PAYMENT METHOD */}
              <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#3e2845]" />
                  <h2 className="text-sm font-bold text-black">Select Payment Method</h2>
                </div>

                <div className="space-y-2.5 text-xs">
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-[#3e2845] bg-[#3e2845]/5"
                        : "border-[#5c3d5c]/20 hover:border-[#3e2845]/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="accent-[#3e2845]"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-black">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-[#5c3d5c]">
                        Pay cash directly to Trax Express courier upon doorstep parcel inspection.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-[#3e2845] bg-[#3e2845]/5"
                        : "border-[#5c3d5c]/20 hover:border-[#3e2845]/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="accent-[#3e2845]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-black">Online Card / Digital Wallet</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          DigiShop Escrow Protected
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5c3d5c]">
                        Funds held in DigiShop platform escrow until delivery verification.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === "bank_transfer"
                        ? "border-[#3e2845] bg-[#3e2845]/5"
                        : "border-[#5c3d5c]/20 hover:border-[#3e2845]/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "bank_transfer"}
                      onChange={() => setPaymentMethod("bank_transfer")}
                      className="accent-[#3e2845]"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-black">Direct Bank Transfer / Raast</p>
                      <p className="text-[11px] text-[#5c3d5c]">
                        Instant zero-fee transfer via 1Link or Raast ID.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {orderError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{orderError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={placingOrder || (!customer && authMode === "login")}
                className="w-full h-12 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {placingOrder ? (
                  <span>Recalculating & Creating Order...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Place Order (₨ {grandTotal.toLocaleString()})</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm space-y-5 sticky top-24">
              <h2 className="text-sm font-bold text-black">Order Summary ({items.length} items)</h2>

              {/* Items List */}
              <div className="divide-y divide-[#5c3d5c]/10 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3 text-xs">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-black truncate">{item.title}</p>
                      {item.variantName && (
                        <p className="text-[11px] text-[#5c3d5c] truncate">{item.variantName}</p>
                      )}
                      <p className="text-[11px] text-[#5c3d5c]">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-black shrink-0">
                      ₨ {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Coupon Form */}
              <div className="pt-3 border-t border-[#5c3d5c]/10">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#3e2845]/5 border border-[#5c3d5c]/20 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#3e2845]" />
                      <span className="font-bold text-black">{appliedCoupon.code}</span>
                      <span className="text-[11px] text-[#5c3d5c]">({appliedCoupon.description})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon: WELCOME10 or FREESHIP"
                      className="flex-1 h-9 px-3 rounded-xl border border-[#5c3d5c]/30 text-xs text-black focus:outline-none focus:border-[#3e2845] uppercase"
                    />
                    <button
                      type="submit"
                      className="h-9 px-3.5 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-600 mt-1">{couponError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-[#5c3d5c]/10 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#5c3d5c]">
                  <span>Subtotal</span>
                  <span className="text-black font-semibold">₨ {subtotal.toLocaleString()}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold">
                      -₨ {((subtotal * appliedCoupon.discountPct) / 100).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[#5c3d5c]">
                  <span>Standard Express Shipping</span>
                  <span className="text-black font-semibold">
                    {effectiveShippingCost === 0 ? "FREE" : `₨ ${effectiveShippingCost.toLocaleString()}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-black pt-2 border-t border-[#5c3d5c]/10">
                  <span>Grand Total</span>
                  <span className="text-base text-black">₨ {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-[#5c3d5c]/10 space-y-2 text-[11px] text-[#5c3d5c]">
                <div className="flex items-center gap-1.5 text-black font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#3e2845]" />
                  <span>DigiShop Buyer Assurance</span>
                </div>
                <p>
                  Prices and stock levels are verified server-side. Parcel is trackable in real-time with courier SMS and WhatsApp updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
