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
      colorClass: "text-subtle",
      bgClass: "bg-neutral-200",
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
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-500",
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
      label: "Moderate",
      colorClass: "text-amber-600",
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
    label: "Weak",
    colorClass: "text-red-500",
    bgClass: "bg-red-500",
    widthPercent: "w-1/3",
    isStrong: false,
  };
}

interface PasswordInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showStrength?: boolean;
  id?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  rightLabelAction?: React.ReactNode;
}

export function PasswordInput({
  label = "Password",
  value,
  onChange,
  error,
  showStrength = false,
  id,
  placeholder = "Enter your password",
  autoComplete = "current-password",
  className = "",
  rightLabelAction,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  const strength = computePasswordStrength(value);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-heading uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        {rightLabelAction}
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle">
          <Lock className="w-4 h-4" />
        </div>

        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full h-input pl-10 pr-10 rounded-xl border bg-input text-sm text-heading placeholder:text-subtle transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
            error
              ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
              : "border-default focus:border-focus"
          }`}
        />

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-subtle hover:text-heading transition-colors rounded-md cursor-pointer"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showStrength && value && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-subtle">Password strength:</span>
            <span className={`font-semibold ${strength.colorClass}`}>{strength.label}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div className={`h-full transition-all duration-300 ${strength.bgClass} ${strength.widthPercent}`} />
          </div>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1 text-xs text-error-500 mt-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
