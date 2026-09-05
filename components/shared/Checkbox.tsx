"use client";

import type { InputHTMLAttributes } from "react";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  indeterminate?: boolean;
}

export function Checkbox({
  indeterminate = false,
  className = "",
  ref,
  ...props
}: CheckboxProps & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <input
      ref={(el) => {
        if (el) el.indeterminate = indeterminate;
        if (typeof ref === "function") ref(el);
      }}
      type="checkbox"
      className={`h-4 w-4 rounded border-default text-primary-500 accent-primary-500 cursor-pointer focus:ring-2 focus:ring-focus/20 ${className}`}
      {...props}
    />
  );
}
