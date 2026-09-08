"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { User, Phone, Mail, CheckCircle2, AlertCircle, ArrowRight, Store, Loader2, ShieldCheck } from "lucide-react";

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
      newErrors.name = "Full name or business name is required";
    }

    // 2. Validate Phone
    const cleanPhone = phone.trim().replace(/[\s\-]/g, "");
    if (!cleanPhone) {
      newErrors.phone = "Mobile phone number is required";
    } else if (cleanPhone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Enter a valid phone number (at least 10 digits)";
    }

    // 3. Validate Email
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      newErrors.email = "Please enter a valid email address";
    }

    // 4. Validate Password
    if (!password) {
      newErrors.password = "Password is required";
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
            data.error || "This email or phone number is already registered. Please sign in or use another."
          );
        } else {
          setDuplicateError(data.error || "Signup failed. Please check your information and try again.");
        }
        setLoading(false);
        return;
      }

      try {
        if (data.vendor) {
          localStorage.setItem("active_vendor_id", data.vendor.id);
          localStorage.setItem("active_vendor_name", data.vendor.name || "");
          localStorage.setItem("active_vendor_email", data.vendor.email || "");
        }
      } catch {}

      // Direct, immediate navigation to login without annoying temporary popup screen
      router.push(`/auth/login?email=${encodeURIComponent(cleanEmail)}`);
    } catch (err: any) {
      setDuplicateError(err.message || "Failed to register. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold mb-3">
          <Store className="w-3.5 h-3.5 text-primary-600" />
          <span>Vendor Onboarding</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight font-display">
          Create Vendor Account
        </h1>
        <p className="mt-1.5 text-sm text-body">
          Register your business to build your AI store and start selling.
        </p>
      </div>

      {duplicateError && (
        <div className="flex items-start gap-3 rounded-xl border border-error-200 bg-error-50 p-4 text-xs text-error-700 shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-error-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-error-900">Registration Notice</p>
            <p className="mt-0.5 text-error-700 leading-relaxed">
              {duplicateError}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name / Business Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="vendor-name"
            className="block text-xs font-semibold text-heading uppercase tracking-wider"
          >
            Vendor / Business Name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle">
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
              placeholder="e.g. Usman Ali or Ali Traders"
              className={`w-full h-input pl-10 pr-4 rounded-xl border bg-input text-sm text-heading placeholder:text-subtle transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                errors.name
                  ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
                  : "border-default focus:border-focus"
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-error-500 mt-1 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Mobile / Phone */}
        <div className="space-y-1.5">
          <label
            htmlFor="vendor-phone"
            className="block text-xs font-semibold text-heading uppercase tracking-wider"
          >
            Mobile / Phone Number
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle">
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
              className={`w-full h-input pl-10 pr-4 rounded-xl border bg-input text-sm text-heading placeholder:text-subtle transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                errors.phone
                  ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
                  : "border-default focus:border-focus"
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-error-500 mt-1 font-medium">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="vendor-email"
            className="block text-xs font-semibold text-heading uppercase tracking-wider"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle">
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
              placeholder="vendor@company.com"
              className={`w-full h-input pl-10 pr-4 rounded-xl border bg-input text-sm text-heading placeholder:text-subtle transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                errors.email
                  ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
                  : "border-default focus:border-focus"
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-error-500 mt-1 font-medium">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <PasswordInput
          label="Password"
          id="vendor-password"
          value={password}
          onChange={(val) => {
            setPassword(val);
            setErrors((prev) => ({ ...prev, password: undefined }));
            setDuplicateError("");
          }}
          showStrength={true}
          error={errors.password}
          placeholder="Min 8 characters"
          autoComplete="new-password"
        />

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-600 h-input py-2.5 px-4 text-sm font-bold text-on-primary shadow-sm hover:shadow transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Checking database & registering...</span>
              </>
            ) : (
              <>
                <span>Create Vendor Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer / Login Link */}
      <div className="text-center pt-3 border-t border-default">
        <p className="text-xs text-body">
          Already have a vendor account?{" "}
          <Link
            href="/auth/login"
            className="font-bold text-link hover:text-link-hover hover:underline ml-1"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
