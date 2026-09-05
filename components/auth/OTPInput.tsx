"use client";

import { useRef, useCallback, KeyboardEvent, ClipboardEvent } from "react";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
}

export function OTPInput({
  value,
  onChange,
  length = 6,
  error,
}: OTPInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const getDigits = useCallback((): string[] => {
    const arr: string[] = [];
    for (let i = 0; i < length; i++) {
      arr.push(value[i] ?? "");
    }
    return arr;
  }, [value, length]);

  const digits = getDigits();

  const focusInput = (index: number) => {
    inputs.current[index]?.focus();
  };

  const setRef = (i: number) => (el: HTMLInputElement | null) => {
    inputs.current[i] = el;
  };

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const next = [...digits];
    next[index] = char;
    const joined = next.join("").replace(/\s/g, "");
    onChange(joined);
    if (char && index < length - 1) {
      setTimeout(() => focusInput(index + 1), 0);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) focusInput(index - 1);
    if (e.key === "ArrowRight" && index < length - 1) focusInput(index + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    setTimeout(() => focusInput(Math.min(pasted.length, length - 1)), 0);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold tracking-wide text-heading uppercase">
        Verification Code
      </label>
      <div className="flex justify-center gap-2.5">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={setRef(i)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit ${i + 1}`}
            className={`h-14 w-12 rounded-xl border-2 bg-input text-center text-xl font-bold text-heading transition-all duration-normal focus:border-primary-500 focus:outline-none focus:ring-3 focus:ring-primary-500/20 ${
              error ? "border-error-500" : digits[i] ? "border-primary-300" : "border-default"
            }`}
          />
        ))}
      </div>
      {error && (
        <p className="text-center text-xs text-error-500">{error}</p>
      )}
    </div>
  );
}
