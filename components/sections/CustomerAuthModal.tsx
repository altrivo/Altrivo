"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, Phone, ShieldCheck, ArrowRight, CheckCircle2, ShoppingBag, AlertCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

export interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName?: string;
  isCheckoutGate?: boolean;
}

export default function CustomerAuthModal({
  isOpen,
  onClose,
  storeName = "Artisanal Store",
  isCheckoutGate = false,
}: CustomerAuthModalProps) {
  const { setCustomer, setIsCheckoutOpen, storeId } = useCart() as any;

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === "register") {
      if (!name.trim()) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/customer/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            store_id: storeId || "753ea49c-abae-4dd3-9107-1dc8fcd6b221",
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
          }),
        });

        const data = await res.json();
        if (data.success && data.customer) {
          if (typeof setCustomer === "function") setCustomer(data.customer);
          try {
            localStorage.setItem("digishop_customer_session", JSON.stringify(data.customer));
          } catch {}

          setSuccessMsg("Welcome! Your account is ready.");
          setTimeout(() => {
            onClose();
            if (isCheckoutGate && typeof setIsCheckoutOpen === "function") {
              setIsCheckoutOpen(true);
            }
          }, 600);
        } else {
          setErrorMsg(data.error || "Failed to create account.");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Login Mode
      if (!email.trim() || !password) {
        setErrorMsg("Please enter your email and password.");
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/customer/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            store_id: storeId || "753ea49c-abae-4dd3-9107-1dc8fcd6b221",
            email: email.trim(),
            password,
          }),
        });

        const data = await res.json();
        if (data.success && data.customer) {
          if (typeof setCustomer === "function") setCustomer(data.customer);
          try {
            localStorage.setItem("digishop_customer_session", JSON.stringify(data.customer));
          } catch {}

          setSuccessMsg("Welcome back!");
          setTimeout(() => {
            onClose();
            if (isCheckoutGate && typeof setIsCheckoutOpen === "function") {
              setIsCheckoutOpen(true);
            }
          }, 500);
        } else {
          setErrorMsg(data.error || "Invalid email or password.");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Clean light backdrop instead of harsh dark backdrop */}
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#5c3d5c]/25 overflow-hidden animate-in fade-in-50 zoom-in-95">
          {/* Header */}
          <div className="p-5 border-b border-[#5c3d5c]/15 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#3e2845] text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-black tracking-tight">
                  {mode === "login" ? "Customer Sign In" : "Create Store Account"}
                </h3>
                <p className="text-[11px] text-[#5c3d5c]">
                  {storeName} Shopper Portal
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#5c3d5c] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Checkout Gate Context Notice */}
          {isCheckoutGate && (
            <div className="bg-[#3e2845]/5 border-b border-[#5c3d5c]/20 px-5 py-2.5 flex items-center gap-2 text-xs text-[#3e2845] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#3e2845] shrink-0" />
              <span>Please authenticate to proceed with your checkout.</span>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="p-3 bg-gray-50/70 border-b border-[#5c3d5c]/10 grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => {
                setMode("login");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-white text-[#3e2845] shadow-xs border border-[#5c3d5c]/20"
                  : "text-[#5c3d5c] hover:text-black"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("register");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-white text-[#3e2845] shadow-xs border border-[#5c3d5c]/20"
                  : "text-[#5c3d5c] hover:text-black"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3.5 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {mode === "register" && (
              <>
                <div>
                  <label className="block font-semibold text-black mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#5c3d5c] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ayesha Malik"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-[#5c3d5c]/30 bg-white text-black placeholder:text-[#5c3d5c]/50 text-xs focus:outline-none focus:border-[#3e2845]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-black mb-1">Phone Number (WhatsApp Delivery Alerts)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#5c3d5c] absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="0300 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-[#5c3d5c]/30 bg-white text-black placeholder:text-[#5c3d5c]/50 text-xs focus:outline-none focus:border-[#3e2845]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold text-black mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5c3d5c] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-[#5c3d5c]/30 bg-white text-black placeholder:text-[#5c3d5c]/50 text-xs focus:outline-none focus:border-[#3e2845]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-black mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5c3d5c] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-[#5c3d5c]/30 bg-white text-black placeholder:text-[#5c3d5c]/50 text-xs focus:outline-none focus:border-[#3e2845]"
                />
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block font-semibold text-black mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#5c3d5c] absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-[#5c3d5c]/30 bg-white text-black placeholder:text-[#5c3d5c]/50 text-xs focus:outline-none focus:border-[#3e2845]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] text-white text-xs font-bold transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-3 shadow-xs"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : mode === "login" ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="p-3.5 bg-gray-50 border-t border-[#5c3d5c]/10 text-center text-[11px] text-[#5c3d5c] font-medium">
            100% Escrow Protection • Cash on Delivery Available Nationwide
          </div>
        </div>
      </div>
    </div>
  );
}
