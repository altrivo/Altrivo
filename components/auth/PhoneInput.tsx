"use client";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function PhoneInput({ value, onChange, error }: PhoneInputProps) {
  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    onChange(digits);
  };

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="phone"
        className="block text-xs font-semibold tracking-wide text-heading uppercase"
      >
        Phone Number
      </label>
      <div className="relative flex">
        <div className="flex h-input items-center rounded-l-lg border border-r-0 border-default bg-muted px-3 text-sm font-medium text-heading">
          <span className="mr-1.5 text-base">🇵🇰</span>
          +92
        </div>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="3XX XXXXXXX"
          className={`w-full h-input rounded-r-lg border bg-input px-3.5 text-sm text-heading placeholder:text-subtle transition-colors duration-normal focus:border-focus focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
            error
              ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
              : "border-default"
          }`}
        />
      </div>
      {value && value.length > 0 && value.length < 10 && !error && (
        <p className="text-xs text-subtle">
          {10 - value.length} digit{10 - value.length !== 1 ? "s" : ""} remaining
        </p>
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
