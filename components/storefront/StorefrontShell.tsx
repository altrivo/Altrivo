import React from "react";
import { VendorStoreConfig } from "@/lib/storefront/themeResolver";
import { generateThemeCssVariables } from "@/lib/storefront/themeCache";
import { StorefrontFooter } from "./StorefrontFooter";
import { StorefrontHeader } from "./StorefrontHeader";

interface StorefrontShellProps {
  config: VendorStoreConfig;
  children: React.ReactNode;
}

export function StorefrontShell({ config, children }: StorefrontShellProps) {
  const cssVarString = generateThemeCssVariables({
    primaryColor: config.primaryColor,
    accentColor: config.accentColor,
    borderRadius: "rounded-xl",
    styleName: config.storeName,
    styleDescription: config.tagline,
  });

  return (
    <div
      className="min-h-screen bg-page text-body flex flex-col font-sans antialiased selection:bg-accent-100 selection:text-accent-900"
      style={
        {
          "--primary-500": config.primaryColor,
          "--primary-600": config.primaryColor,
          "--primary-700": config.primaryColor,
          "--accent-500": config.accentColor,
          "--accent-200": config.accentColor,
        } as React.CSSProperties
      }
    >
      {/* Dynamic Root SSR Theme Tokens Injection */}
      <style id="artrivo-theme-tokens-ssr" dangerouslySetInnerHTML={{ __html: cssVarString }} />

      {/* SSR Customer Header */}
      <StorefrontHeader config={config} />

      {/* Main Page Slot */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in duration-normal">
        {children}
      </main>

      {/* SSR Customer Footer */}
      <StorefrontFooter config={config} />
    </div>
  );
}
