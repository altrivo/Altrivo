"use client";

import { useState, useCallback } from "react";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showStrength?: boolean;
  id?: string;
  placeholder?: string;
}

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 0, label: "Weak", color: "bg-error-500" };
  if (score === 2) return { level: 1, label: "Fair", color: "bg-warning-500" };
  if (score === 3) return { level: 2, label: "Good", color: "bg-info-500" };
  return { level: 3, label: "Strong", color: "bg-success-500" };
}

function generatePassword(): string {
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const symbols = "!@#$%&*?";
  const all = lower + upper + digits + symbols;

  const mandatory = [
    lower[Math.floor(Math.random() * lower.length)],
    upper[Math.floor(Math.random() * upper.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  const rest = Array.from({ length: 12 }, () =>
    all[Math.floor(Math.random() * all.length)]
  );

  return [...mandatory, ...rest]
    .sort(() => Math.random() - 0.5)
    .join("");
}

export function PasswordInput({
  label,
  value,
  onChange,
  error,
  showStrength = false,
  id,
  placeholder = "Min. 8 characters, must be strong",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  const strength = showStrength && value ? getStrength(value) : null;

  const handleGenerate = useCallback(() => {
    const pwd = generatePassword();
    onChange(pwd);
    setVisible(true);
  }, [onChange]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold tracking-wide text-heading uppercase"
        >
          {label}
        </label>
        {showStrength && (
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-500 transition-colors hover:text-primary-600"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.967.744L14.146 7.2 17.5 7.512a1 1 0 01.576 1.765l-2.586 2.18.86 3.415a1 1 0 01-1.504 1.09L12 13.977l-2.846 1.985a1 1 0 01-1.504-1.09l.86-3.415-2.586-2.18a1 1 0 01.576-1.765l3.354-.312 1.179-3.456A1 1 0 0112 2z" />
            </svg>
            Generate strong password
          </button>
        )}
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={showStrength ? "new-password" : "current-password"}
          className={`w-full h-input rounded-lg border bg-input pl-10 pr-10 text-sm text-heading placeholder:text-subtle transition-colors duration-normal focus:border-focus focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
            error
              ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
              : "border-default"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle transition-colors hover:text-heading"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                clipRule="evenodd"
              />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {strength && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-normal ${
                  i <= strength.level ? strength.color : "bg-neutral-200"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-subtle">
            Password strength:{" "}
            <span
              className={`font-medium ${
                strength.level === 0
                  ? "text-error-500"
                  : strength.level === 1
                    ? "text-warning-500"
                    : strength.level === 2
                      ? "text-info-500"
                      : "text-success-500"
              }`}
            >
              {strength.label}
            </span>
          </p>
        </div>
      )}

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
