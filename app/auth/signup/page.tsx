"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput, computePasswordStrength } from "@/components/auth/PasswordInput";
import { User, Phone, Mail, CheckCircle2, AlertCircle, ArrowRight, Store, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function VendorSignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
  }>({});
  const [duplicateError, setDuplicateError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setDuplicateError("");
    setSuccessMessage("");

    const newErrors: typeof errors = {};

    // 1. Validate Name
    if (!name.trim()) {
      newErrors.name = "Name likhna lazmi hai / Name is required";
    }

    // 2. Validate Phone
    const cleanPhone = phone.trim().replace(/[\s\-]/g, "");
    if (!cleanPhone) {
      newErrors.phone = "Mobile number likhna lazmi hai / Phone number is required";
    } else if (cleanPhone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Enter a valid phone number (at least 10 digits)";
    }

    // 3. Validate Email
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      newErrors.email = "Email address likhna lazmi hai / Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      newErrors.email = "Sahi email format enter karein / Valid email required";
    }

    // 4. Validate Password
    if (!password) {
      newErrors.password = "Password enter karein / Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/auth/vendor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          email: cleanEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 409) {
          setDuplicateError(
            data.error || "Ye mail ya number already register h other use kry."
          );
        } else {
          setDuplicateError(data.error || "Signup failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      setSuccessMessage(
        data.message ||
          "Registration successful! Your vendor account has been created."
      );

      try {
        if (data.vendor) {
          localStorage.setItem("active_vendor_id", data.vendor.id);
          localStorage.setItem("active_vendor_name", data.vendor.name || "");
          localStorage.setItem("active_vendor_email", data.vendor.email || "");
        }
      } catch {}

      setTimeout(() => {
        router.push(`/auth/login?email=${encodeURIComponent(cleanEmail)}`);
      }, 1500);
    } catch (err: any) {
      setDuplicateError(err.message || "Failed to register. Please try again.");
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[11px] font-bold text-[#5c3d5c] uppercase tracking-wider">
              Registration Successful
            </span>
            <h1 className="text-2xl font-bold text-black tracking-tight mt-1">
              Welcome to DigiShop Vendor Portal
            </h1>
            <p className="mt-2 text-xs text-[#5c3d5c] leading-relaxed">
              {successMessage}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#5c3d5c]/20 bg-gray-50 text-xs text-black">
            <p className="font-semibold">Your Registered Email:</p>
            <p className="font-mono text-black mt-0.5">{email}</p>
            <p className="text-[#5c3d5c] text-[11px] mt-2">
              Redirecting you to login in a moment...
            </p>
          </div>

          <Link
            href={`/auth/login?email=${encodeURIComponent(email)}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] py-2.5 px-4 text-xs font-bold text-white shadow-xs"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3e2845]/10 border border-[#5c3d5c]/20 text-[#3e2845] text-xs font-semibold mb-3">
            <Store className="w-3.5 h-3.5 text-[#3e2845]" />
            <span>Vendor Registration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
            Create Vendor Account
          </h1>
          <p className="mt-1 text-xs text-[#5c3d5c]">
            Register your vendor details to create and manage your store.
          </p>
        </div>

        {duplicateError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Registration Notice</p>
              <p className="mt-0.5 text-red-700 leading-relaxed">
                {duplicateError}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <label
              htmlFor="vendor-name"
              className="block text-xs font-semibold text-black tracking-wide"
            >
              Vendor / Business Name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5c3d5c]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="vendor-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: undefined }));
                  setDuplicateError("");
                }}
                placeholder="e.g. Usman Ali"
                className={`w-full h-10 pl-10 pr-4 rounded-xl border bg-white text-xs text-black placeholder:text-[#5c3d5c]/60 transition-colors focus:outline-none ${
                  errors.name
                    ? "border-red-500 focus:border-red-600"
                    : "border-[#5c3d5c]/30 focus:border-[#3e2845]"
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="vendor-phone"
              className="block text-xs font-semibold text-black tracking-wide"
            >
              Mobile / Phone Number
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5c3d5c]">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="vendor-phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors((prev) => ({ ...prev, phone: undefined }));
                  setDuplicateError("");
                }}
                placeholder="0300 1234567"
                className={`w-full h-10 pl-10 pr-4 rounded-xl border bg-white text-xs text-black placeholder:text-[#5c3d5c]/60 transition-colors focus:outline-none ${
                  errors.phone
                    ? "border-red-500 focus:border-red-600"
                    : "border-[#5c3d5c]/30 focus:border-[#3e2845]"
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="vendor-email"
              className="block text-xs font-semibold text-black tracking-wide"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5c3d5c]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="vendor-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                  setDuplicateError("");
                }}
                placeholder="vendor@example.com"
                className={`w-full h-10 pl-10 pr-4 rounded-xl border bg-white text-xs text-black placeholder:text-[#5c3d5c]/60 transition-colors focus:outline-none ${
                  errors.email
                    ? "border-red-500 focus:border-red-600"
                    : "border-[#5c3d5c]/30 focus:border-[#3e2845]"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password without clutter boxes */}
          <PasswordInput
            label="Password"
            id="vendor-password"
            value={password}
            onChange={(val) => {
              setPassword(val);
              setErrors((prev) => ({ ...prev, password: undefined }));
              setDuplicateError("");
            }}
            showStrength={false}
            error={errors.password}
            placeholder="Min 8 characters"
            autoComplete="new-password"
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] py-2.5 px-4 text-xs font-bold text-white shadow-xs transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Checking database & registering...</span>
                </>
              ) : (
                <>
                  <span>Vendor Signup Karein (Register)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-[#5c3d5c]/20">
          <p className="text-xs text-[#5c3d5c]">
            Already have a vendor account?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-[#3e2845] hover:text-[#4b3254] hover:underline"
            >
              Sign In here / Login karein
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
