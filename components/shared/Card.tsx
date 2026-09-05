import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "elevated" | "tinted" | "accent";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children?: ReactNode;
  className?: string;
}

const variantClasses: Record<CardVariant, string> = {
  default: "bg-card border border-default shadow-card",
  elevated: "bg-card-elevated border border-default shadow-card-hover",
  tinted: "bg-card-tint border border-default",
  accent: "bg-card border-l-4 border-primary-500 shadow-card",
};

export function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl p-6 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
