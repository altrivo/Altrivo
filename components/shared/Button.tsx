"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "accent" | "ghost" | "danger" | "link";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary-500 text-on-primary hover:bg-primary-600",
  accent: "bg-accent-200 text-on-accent hover:bg-accent-300",
  ghost: "bg-transparent border border-strong text-body hover:bg-muted",
  danger: "bg-error-500 text-on-primary hover:bg-error-600",
  link: "bg-transparent text-link hover:text-link-hover hover:underline px-0 py-0",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-6 py-3 gap-2.5",
};

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 ${
        variantClasses[variant]
      } ${variant === "link" ? "" : sizeClasses[size]} ${
        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
