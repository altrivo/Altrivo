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
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        <span className="flex items-center gap-1.5 font-bold text-heading">
          <Home className="w-4 h-4 text-primary-600" />
          <span>Dashboard</span>
        </span>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm overflow-x-auto py-0.5 scrollbar-none">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-subtle hover:text-heading transition-colors font-medium"
      >
        <Home className="w-4 h-4 text-subtle" />
        <span className="font-semibold text-body">Vendor</span>
      </Link>

      {pathSegments.map((segment, idx) => {
        const routePath = `/${pathSegments.slice(0, idx + 1).join("/")}`;
        const isLast = idx === pathSegments.length - 1;

        const formattedLabel =
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

        return (
          <React.Fragment key={routePath}>
            <ChevronRight className="w-3.5 h-3.5 text-subtle/70 flex-shrink-0" />
            {isLast ? (
              <span className="font-bold text-heading truncate">
                {formattedLabel}
              </span>
            ) : (
              <Link
                href={routePath}
                className="text-subtle hover:text-heading transition-colors truncate font-medium"
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

