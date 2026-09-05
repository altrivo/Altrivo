"use client";

import React from "react";
import Link from "next/link";

import { OnboardingState } from "@/lib/onboarding";

interface Props {
  state: OnboardingState;
  onDismiss?: () => void;
}

export function OnboardingBanner({ state, onDismiss }: Props) {
  if (state.isCompleted && state.currentStep >= 4) {
    return null; // Don't show abandonment banner if onboarding completed
  }

  const stepNames: Record<number, string> = {
    1: "Step 1: Business & Store Info",
    2: "Step 2: Product Line Concept",
    3: "Step 3: AI Theme Selection",
    4: "Step 4: Add First Product",
  };

  const currentStep = state.currentStep || 1;
  const progressPercent = currentStep === 1 ? 25 : currentStep === 2 ? 50 : currentStep === 3 ? 75 : 90;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 p-6 text-white shadow-lg border border-primary-700/50 animate-fadeIn">
      {/* Decorative background ambient lighting */}
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/30 text-accent-200 border border-primary-400/30 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-ping" />
            Action Required &bull; Store Setup Incomplete
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Continue setting up {state.businessInfo.storeName || "your store"}
          </h2>

          <p className="text-primary-200 text-sm leading-relaxed">
            You left off at <span className="font-semibold text-white">{stepNames[currentStep]}</span>. Complete the remaining steps to launch your store and accept customer orders.
          </p>

          {/* Progress bar inside banner */}
          <div className="pt-2 max-w-md">
            <div className="flex justify-between text-xs text-primary-200 mb-1 font-medium">
              <span>Setup Progress</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-primary-950/60 overflow-hidden p-0.5 border border-primary-700/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-200 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-3 shrink-0">
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="px-3.5 py-2.5 rounded-xl text-primary-300 hover:text-white text-xs font-medium transition-colors"
            >
              Remind Me Later
            </button>
          )}

          <Link
            href={`/onboarding?step=${currentStep}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-200 hover:bg-white text-primary-950 font-bold text-sm shadow-md hover:shadow-xl active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Resume Onboarding</span>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
