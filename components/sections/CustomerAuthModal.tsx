"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, Phone, ShieldCheck, ArrowRight, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useCart } from "./CartContext";

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
  const { setCustomer, setIsCheckoutOpen, storeId } = useCart();

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
          setCustomer(data.customer);
          try {
            localStorage.setItem(
              `storefront_customer_session_${storeId || "default"}`,
              JSON.stringify(data.customer)
            );
          } catch {}

          setSuccessMsg("Welcome! Your store account is ready.");
          setTimeout(() => {
            onClose();
            if (isCheckoutGate) {
              setIsCheckoutOpen(true);
            }
          }, 800);
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
          setCustomer(data.customer);
          try {
            localStorage.setItem(
              `storefront_customer_session_${storeId || "default"}`,
              JSON.stringify(data.customer)
            );
          } catch {}

          setSuccessMsg("Welcome back!");
          setTimeout(() => {
            onClose();
            if (isCheckoutGate) {
              setIsCheckoutOpen(true);
            }
          }, 600);
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
    <div className="fixed inset-0 z-50 overflow-y-auto select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4 text-slate-800 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  {mode === "login" ? "Customer Sign In" : "Create Store Account"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {storeName} Shopper Portal
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Checkout Gate Context Notice */}
          {isCheckoutGate && (
            <div className="bg-amber-50 border-b border-amber-100 px-6 py-2.5 flex items-center gap-2 text-xs text-amber-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Please sign in or create an account to proceed with checkout.</span>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => { setMode("login"); setErrorMsg(null); }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setErrorMsg(null); }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {mode === "register" && (
              <>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Usman Ahmad"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-500 font-medium"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Phone Number (For Delivery & SMS Updates)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="0300 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-500 font-medium"
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-500 font-medium"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-500 font-medium"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Confirm Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === "login" ? (
                <>
                  <span>Sign In to Store</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Store Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-100 text-center text-[11px] text-slate-500 font-medium">
            100% Escrow Protection • Cash on Delivery Available Nationwide
          </div>
        </div>
      </div>
    </div>
  );
}
