"use client";

import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

export function Input({ icon, error, className = "", ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none">
          {icon}
        </span>
      )}
      <input
        aria-invalid={Boolean(error)}
        className={`h-input w-full rounded-lg border bg-input px-3 text-sm text-heading placeholder:text-subtle transition-colors duration-normal focus:outline-none focus:ring-2 ${error ? "border-error-500 focus:border-error-500 focus:ring-error-500/20" : "border-default focus:border-focus focus:ring-focus/20"} ${icon ? "pl-10" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
    </div>
  );
}
