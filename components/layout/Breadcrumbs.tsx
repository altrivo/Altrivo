"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathSegments.length === 0) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-subtle">
        <span className="flex items-center gap-1.5 font-semibold text-heading">
          <Home className="w-3.5 h-3.5 text-primary-500" />
          Dashboard
        </span>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-subtle overflow-x-auto py-1 scrollbar-none">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-heading transition-colors"
      >
        <Home className="w-3.5 h-3.5 text-subtle" />
        <span className="hidden sm:inline">Vendor Studio</span>
      </Link>

      {pathSegments.map((segment, idx) => {
        const routePath = `/${pathSegments.slice(0, idx + 1).join("/")}`;
        const isLast = idx === pathSegments.length - 1;

        const formattedLabel =
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

        return (
          <React.Fragment key={routePath}>
            <ChevronRight className="w-3.5 h-3.5 text-subtle/60 flex-shrink-0" />
            {isLast ? (
              <span className="font-semibold text-heading truncate">
                {formattedLabel}
              </span>
            ) : (
              <Link
                href={routePath}
                className="hover:text-heading transition-colors truncate"
              >
                {formattedLabel}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
