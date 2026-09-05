"use client";

import { InputHTMLAttributes, ReactNode } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
}

export function FormInput({
  label,
  error,
  icon,
  className = "",
  id,
  ...props
}: FormInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold tracking-wide text-heading uppercase"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full h-input rounded-lg border bg-input px-3.5 text-sm text-heading placeholder:text-subtle transition-colors duration-normal focus:border-focus focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${
            icon ? "pl-10" : ""
          } ${
            error
              ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
              : "border-default"
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-error-500">
          <svg
            className="h-3.5 w-3.5 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
