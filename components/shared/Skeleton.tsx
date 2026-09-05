import type { HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = "1rem",
  className = "",
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`skeleton-bone ${className}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}
