"use client";

import { ReactNode } from "react";

function ShieldIcon() {
  return (
    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function FloatingCard({
  children,
  className,
  delay = "0s",
}: {
  children: ReactNode;
  className: string;
  delay?: string;
}) {
  return (
    <div
      className={`absolute flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-3.5 shadow-lg backdrop-blur-sm ${className}`}
      style={{ animation: `authFloat 6s ease-in-out ${delay} infinite` }}
    >
      {children}
    </div>
  );
}

export interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh">
      {/* Left branded panel */}
      <div className="relative hidden w-[55%] overflow-hidden lg:block"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(242,221,225,0.15), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(148,102,165,0.2), transparent 50%),
            linear-gradient(135deg, var(--primary-950) 0%, var(--primary-800) 50%, var(--primary-700) 100%)
          `,
        }}
      >
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Gradient orbs for depth */}
        <div
          className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full opacity-30 blur-[80px]"
          style={{ background: "radial-gradient(circle, var(--accent-400), transparent)" }}
        />
        <div
          className="absolute -right-16 top-20 h-60 w-60 rounded-full opacity-20 blur-[60px]"
          style={{ background: "radial-gradient(circle, var(--primary-400), transparent)" }}
        />

        {/* Ambient floating glass cards - positioned away from text & logo */}
        <FloatingCard className="right-[12%] top-[10%] pointer-events-none select-none opacity-80" delay="0s">
          <ShieldIcon />
        </FloatingCard>
        <FloatingCard className="right-[8%] top-[50%] pointer-events-none select-none opacity-80" delay="2s">
          <HandshakeIcon />
        </FloatingCard>
        <FloatingCard className="right-[15%] bottom-[14%] pointer-events-none select-none opacity-80" delay="4s">
          <GlobeIcon />
        </FloatingCard>

        {/* Main content container */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-inner">
              <span className="text-2xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>
                A
              </span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
              Altrivo
            </span>
          </div>

          {/* Central Pitch */}
          <div className="max-w-lg space-y-6 my-auto py-6">
            <div className="space-y-2">
              <h1
                className="text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Scale Your E-Commerce,{" "}
                <br />
                <span className="text-accent-200">Build Your Brand</span>
              </h1>
              <p className="text-base xl:text-lg leading-relaxed text-white/75">
                The all-in-one platform for modern vendors to launch online stores, manage multi-channel orders, and grow digital commerce.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {["Multi-Storefronts", "Automated COD & Escrow", "AI Store Builder"].map(
                (feature) => (
                  <div
                    key={feature}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm shadow-xs"
                  >
                    <svg
                      className="h-3.5 w-3.5 text-accent-300"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Bottom decorative dots & subtle footer */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {[0.3, 0.5, 0.8, 0.5, 0.3].map((opacity, i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-white"
                  style={{ opacity }}
                />
              ))}
            </div>
            <span className="text-xs text-white/50 font-medium">Enterprise Vendor Platform</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col bg-page">
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10 sm:px-12 lg:px-16">
          <div className="w-full max-w-md">
            {/* Mobile-only logo header */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white font-bold text-xl shadow-sm">
                A
              </div>
              <span className="text-xl font-bold tracking-tight text-heading font-display">
                Altrivo
              </span>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
