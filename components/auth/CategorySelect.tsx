"use client";

const CATEGORIES = [
  "Textiles & Apparel",
  "Agriculture & Food",
  "Electronics & Technology",
  "Manufacturing",
  "Construction Materials",
  "Chemicals & Pharmaceuticals",
  "Automotive & Parts",
  "Handicrafts & Artisan",
  "Gems & Jewelry",
  "Leather & Footwear",
  "Sports & Fitness",
  "Services & Consulting",
  "Other",
];

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function CategorySelect({ value, onChange, error }: CategorySelectProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor="business-category"
        className="block text-xs font-semibold tracking-wide text-heading uppercase"
      >
        Business Category
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <select
          id="business-category"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-input appearance-none rounded-lg border bg-input pl-10 pr-10 text-sm transition-colors duration-normal focus:border-focus focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
            value ? "text-heading" : "text-subtle"
          } ${
            error
              ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
              : "border-default"
          }`}
        >
          <option value="" disabled>
            Select your business category
          </option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-subtle">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
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
