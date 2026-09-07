"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";

export interface PasswordStrengthInfo {
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  hasMinLength: boolean;
  score: number;
  level: "low" | "normal" | "strong";
  label: string;
  colorClass: string;
  bgClass: string;
  widthPercent: string;
  isStrong: boolean;
}

export function computePasswordStrength(password: string): PasswordStrengthInfo {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasMinLength = password.length >= 8;

  let criteriaCount = 0;
  if (hasUpper) criteriaCount++;
  if (hasLower) criteriaCount++;
  if (hasNumber) criteriaCount++;
  if (hasSymbol) criteriaCount++;

  if (!password) {
    return {
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSymbol: false,
      hasMinLength: false,
      score: 0,
      level: "low",
      label: "Enter password",
      colorClass: "text-[#5c3d5c]",
      bgClass: "bg-gray-200",
      widthPercent: "w-0",
      isStrong: false,
    };
  }

  if (hasMinLength && criteriaCount === 4) {
    return {
      hasUpper,
      hasLower,
      hasNumber,
      hasSymbol,
      hasMinLength,
      score: 4,
      level: "strong",
      label: "Strong",
      colorClass: "text-emerald-700",
      bgClass: "bg-emerald-600",
      widthPercent: "w-full",
      isStrong: true,
    };
  }

  if ((hasMinLength && criteriaCount >= 3) || (password.length >= 6 && criteriaCount === 4)) {
    return {
      hasUpper,
      hasLower,
      hasNumber,
      hasSymbol,
      hasMinLength,
      score: criteriaCount,
      level: "normal",
      label: "Normal",
      colorClass: "text-amber-700",
      bgClass: "bg-amber-500",
      widthPercent: "w-2/3",
      isStrong: false,
    };
  }

  return {
    hasUpper,
    hasLower,
    hasNumber,
    hasSymbol,
    hasMinLength,
    score: criteriaCount,
    level: "low",
    label: "Low",
    colorClass: "text-red-700",
    bgClass: "bg-red-500",
    widthPercent: "w-1/3",
    isStrong: false,
  };
}

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showStrength?: boolean;
  id?: string;
  placeholder?: string;
  autoComplete?: string;
}

export function PasswordInput({
  label,
  value,
  onChange,
  error,
  showStrength = false,
  id,
  placeholder = "Enter your password",
  autoComplete = "current-password",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold text-black tracking-wide"
      >
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5c3d5c]">
          <Lock className="w-4 h-4" />
        </div>

        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full h-10 pl-10 pr-10 rounded-xl border bg-white text-xs text-black placeholder:text-[#5c3d5c]/60 transition-colors focus:outline-none ${
            error
              ? "border-red-500 focus:border-red-600"
              : "border-[#5c3d5c]/30 focus:border-[#3e2845]"
          }`}
        />

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#5c3d5c] hover:text-[#3e2845] transition-colors rounded-md cursor-pointer"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#5c3d5c]" />}
        </button>
      </div>

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600 mt-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
