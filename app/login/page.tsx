"use client";

import React, { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Mail, Lock, ArrowRight, ShoppingBag, AlertCircle, CheckCircle2, User } from "lucide-react";

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";
  const { login } = useCustomerAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Incorrect email or password.");
      return;
    }

    setSuccess("Login successful! Redirecting...");
    setTimeout(() => {
      router.push(redirectUrl);
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-[#5c3d5c]/20 p-8 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[#3e2845]/10 text-[#3e2845] flex items-center justify-center mx-auto mb-2">
          <ShoppingBag className="w-6 h-6 text-[#3e2845]" />
        </div>
        <h1 className="text-2xl font-bold text-black tracking-tight">Customer Login</h1>
        <p className="text-xs text-[#5c3d5c]">
          Sign in to your store account to manage orders, wishlist & checkout.
        </p>
      </div>

      {redirectUrl.includes("checkout") && (
        <div className="p-3.5 rounded-xl bg-[#3e2845]/5 border border-[#5c3d5c]/20 text-xs text-[#3e2845] font-medium flex items-center gap-2.5">
          <ShoppingBag className="w-4 h-4 text-[#3e2845] shrink-0" />
          <span>Please sign in to proceed with your checkout. Your cart is preserved.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-black mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#5c3d5c] absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-[#5c3d5c]/30 text-xs text-black focus:outline-none focus:border-[#3e2845] transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-black">Password</label>
            <Link
              href={`/forgot-password${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="text-xs text-[#5c3d5c] hover:text-[#3e2845] font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#5c3d5c] absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-[#5c3d5c]/30 text-xs text-black focus:outline-none focus:border-[#3e2845] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-[#5c3d5c]/10 text-center space-y-3">
        <p className="text-xs text-black">
          Don&apos;t have a store account?{" "}
          <Link
            href={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
            className="text-[#3e2845] font-bold hover:underline"
          >
            Create an Account
          </Link>
        </p>

        <div className="pt-2">
          <Link
            href="/vendor/login"
            className="inline-flex items-center gap-1.5 text-[11px] text-[#5c3d5c] hover:text-[#3e2845] font-medium"
          >
            <User className="w-3.5 h-3.5" />
            <span>Are you a store owner? Vendor Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center text-xs text-[#5c3d5c]">Loading login...</div>}>
        <CustomerLoginForm />
      </Suspense>
    </div>
  );
}
