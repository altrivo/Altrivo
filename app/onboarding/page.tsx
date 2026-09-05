"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Step1BusinessInfo } from "@/components/onboarding/Step1BusinessInfo";
import { Step2ProductPrompt } from "@/components/onboarding/Step2ProductPrompt";
import { Step3ThemeSelection } from "@/components/onboarding/Step3ThemeSelection";
import { Step4AddProduct } from "@/components/onboarding/Step4AddProduct";
import {
  OnboardingState,
  getOnboardingState,
  saveOnboardingState,
  THEME_OPTIONS,
} from "@/lib/onboarding";

function OnboardingWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadedState = getOnboardingState();
    const queryStep = searchParams.get("step");

    if (queryStep && !isNaN(Number(queryStep))) {
      const stepNum = Math.min(Math.max(Number(queryStep), 1), 4);
      // Never let a deep link jump past the required business-info step.
      loadedState.currentStep = loadedState.businessInfo?.storeName?.trim() ? stepNum : 1;
    }

    setState(loadedState);
    setIsLoaded(true);
  }, [searchParams]);

  if (!isLoaded || !state) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-page">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-subtle">Loading store setup wizard...</p>
        </div>
      </div>
    );
  }

  const currentStep = state.currentStep;

  // Progress percentage calculation
  const progressPercent = currentStep === 1 ? 25 : currentStep === 2 ? 50 : currentStep === 3 ? 75 : 100;

  const updateState = (updater: (prev: OnboardingState) => OnboardingState) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      saveOnboardingState(next);
      return next;
    });
  };

  // Step 1 is the only gate: the store name is required before any later step
  // is meaningful. Everything after it is skippable, so once step 1 is valid
  // the vendor may move freely between steps.
  const maxReachableStep = state.businessInfo.storeName.trim() ? 4 : 1;

  const goToStep = (step: number) => {
    const targetStep = Math.min(Math.max(step, 1), maxReachableStep);
    updateState((prev) => ({
      ...prev,
      currentStep: targetStep,
    }));
  };

  const handleSaveAndExit = () => {
    if (state) {
      saveOnboardingState(state);
    }
    router.push("/dashboard");
  };

  return (
    <main className="min-h-dvh bg-page text-body flex flex-col justify-between selection:bg-primary-100 selection:text-primary-900">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-sticky bg-card/90 backdrop-blur-md border-b border-default">
        {/* Animated Progress Bar along very top edge */}
        <div className="w-full bg-muted h-1.5 overflow-hidden">
          <div
            className="bg-primary-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white font-black flex items-center justify-center text-lg shadow-md group-hover:scale-105 transition-transform">
              A
            </div>
            <span className="font-bold text-heading text-lg tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Altrivo <span className="text-xs font-normal text-subtle ml-1">Vendor Setup</span>
            </span>
          </Link>

          {/* Progress Indicator */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((stepNum) => {
                const isLocked = stepNum > maxReachableStep;
                return (
                  <button
                    key={stepNum}
                    onClick={() => goToStep(stepNum)}
                    disabled={isLocked}
                    title={isLocked ? "Enter your store name to continue" : `Go to step ${stepNum}`}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                      stepNum === currentStep
                        ? "bg-primary-500 text-on-primary ring-2 ring-primary-500 ring-offset-2"
                        : stepNum < currentStep
                        ? "bg-success-500 text-white"
                        : "bg-muted text-subtle"
                    } ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {stepNum < currentStep ? "✓" : stepNum}
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-semibold text-subtle">
              {progressPercent}% Complete
            </span>
          </div>

          {/* Exit / Save Button */}
          <button
            type="button"
            onClick={handleSaveAndExit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-default bg-page text-xs font-semibold text-body hover:text-heading hover:bg-muted transition-all cursor-pointer"
          >
            <span>Save &amp; Exit</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L6 9.414 7.414 8l1.879 1.879L12.586 6 14 7.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 md:py-12">
        {currentStep === 1 && (
          <Step1BusinessInfo
            data={state.businessInfo}
            onChange={(info) => updateState((prev) => ({ ...prev, businessInfo: info }))}
            onNext={() => goToStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2ProductPrompt
            data={state.productPrompt}
            onChange={(promptData) => updateState((prev) => ({ ...prev, productPrompt: promptData }))}
            onNext={() => goToStep(3)}
            onBack={() => goToStep(1)}
            onSkip={() => {
              updateState((prev) => ({
                ...prev,
                productPrompt: { prompt: prev.productPrompt.prompt || "General catalog item", skipped: true },
              }));
              goToStep(3);
            }}
          />
        )}

        {currentStep === 3 && (
          <Step3ThemeSelection
            selectedThemeId={state.selectedThemeId}
            onSelectTheme={(themeId) => updateState((prev) => ({ ...prev, selectedThemeId: themeId }))}
            onNext={() => goToStep(4)}
            onBack={() => goToStep(2)}
            onSkip={() => {
              updateState((prev) => ({ ...prev, selectedThemeId: THEME_OPTIONS[0].id }));
              goToStep(4);
            }}
          />
        )}

        {currentStep === 4 && (
          <Step4AddProduct
            productData={state.firstProduct}
            productPrompt={state.productPrompt}
            onChange={(prod) => updateState((prev) => ({ ...prev, firstProduct: prod }))}
            onFinish={() => {
              updateState((prev) => ({ ...prev, isCompleted: true, currentStep: 4 }));
            }}
            onBack={() => goToStep(3)}
          />
        )}
      </div>

      {/* Simple Footer */}
      <footer className="border-t border-default py-4 text-center text-xs text-subtle">
        <p>&copy; {new Date().getFullYear()} Altrivo Commerce Inc. All onboarding progress is automatically saved.</p>
      </footer>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-dvh items-center justify-center bg-page">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-subtle">Loading store setup wizard...</p>
        </div>
      </div>
    }>
      <OnboardingWizardInner />
    </Suspense>
  );
}
