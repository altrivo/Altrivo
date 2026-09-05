"use client";

import React, { useState } from "react";
import { SetupChecklist, saveOnboardingState, OnboardingState } from "@/lib/onboarding";

interface Props {
  state: OnboardingState;
  onUpdateState: (newState: OnboardingState) => void;
}

export function SetupChecklistWidget({ state, onUpdateState }: Props) {
  const checklist = state.checklist;
  const [activeModal, setActiveModal] = useState<"domain" | "courier" | "payment" | null>(null);

  // Modal form states
  const [domainInput, setDomainInput] = useState(checklist.customDomainName || "mystore.com");
  const [selectedCourier, setSelectedCourier] = useState(checklist.courierName || "TCS Express");

  // Calculate items done
  const item1Done = checklist.additionalProductsCount >= 3;
  const item2Done = checklist.domainConnected;
  const item3Done = checklist.courierAdded;
  const item4Done = checklist.paymentGatewayConfigured;

  const completedCount = [item1Done, item2Done, item3Done, item4Done].filter(Boolean).length;
  const percentComplete = Math.round((completedCount / 4) * 100);

  const updateChecklist = (updater: (prev: SetupChecklist) => SetupChecklist) => {
    const updatedChecklist = updater(checklist);
    const updatedState: OnboardingState = {
      ...state,
      checklist: updatedChecklist,
    };
    saveOnboardingState(updatedState);
    onUpdateState(updatedState);
  };

  const handleAddProduct = () => {
    updateChecklist((prev) => ({
      ...prev,
      additionalProductsCount: Math.min(prev.additionalProductsCount + 1, 3),
    }));
  };

  const handleConnectDomain = (e: React.FormEvent) => {
    e.preventDefault();
    updateChecklist((prev) => ({
      ...prev,
      domainConnected: true,
      customDomainName: domainInput,
    }));
    setActiveModal(null);
  };

  const handleSaveCourier = () => {
    updateChecklist((prev) => ({
      ...prev,
      courierAdded: true,
      courierName: selectedCourier,
    }));
    setActiveModal(null);
  };

  const handleTogglePayment = () => {
    updateChecklist((prev) => ({
      ...prev,
      paymentGatewayConfigured: !prev.paymentGatewayConfigured,
    }));
  };

  return (
    <div className="rounded-2xl border border-default bg-card p-6 shadow-sm space-y-6 animate-fadeIn">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-default">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-primary-500" />
            <h3 className="text-lg font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
              Complete your setup
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
              {completedCount} of 4 tasks done
            </span>
          </div>
          <p className="text-xs text-subtle mt-1">
            Finish post-onboarding tasks to optimize conversion rates and streamline logistics.
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="flex items-center gap-3 sm:w-48">
          <div className="flex-1 bg-muted h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-primary-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <span className="text-xs font-bold text-heading shrink-0">{percentComplete}%</span>
        </div>
      </div>

      {/* Completion Banner */}
      {completedCount === 4 && (
        <div className="p-4 rounded-xl bg-success-50 border border-success-200 flex items-center justify-between gap-4 text-success-800 text-xs font-medium animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚀</span>
            <div>
              <p className="font-bold text-sm text-success-900">Your store setup is 100% complete!</p>
              <p className="text-success-700">All domain, courier, products, and payout channels are verified.</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg bg-success-600 text-white font-bold shrink-0">
            Store Ready
          </span>
        </div>
      )}

      {/* Checklist Items Grid */}
      <div className="space-y-3">
        {/* Item 1: Add 3 more products */}
        <div
          className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
            item1Done ? "bg-page border-default opacity-85" : "bg-card border-default hover:border-strong"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => {
                if (item1Done) {
                  updateChecklist((prev) => ({ ...prev, additionalProductsCount: 0 }));
                } else {
                  handleAddProduct();
                }
              }}
              className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                item1Done
                  ? "bg-success-500 border-success-500 text-white"
                  : "border-strong text-transparent hover:border-primary-500"
              }`}
            >
              ✓
            </button>
            <div>
              <h4 className={`text-sm font-semibold ${item1Done ? "line-through text-subtle" : "text-heading"}`}>
                Add 3 more products to catalog
              </h4>
              <p className="text-xs text-subtle">
                Expand your product selection ({checklist.additionalProductsCount}/3 added).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-subtle hidden sm:inline">
              {checklist.additionalProductsCount} / 3
            </span>
            <button
              type="button"
              disabled={item1Done}
              onClick={handleAddProduct}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                item1Done
                  ? "bg-muted text-subtle cursor-default"
                  : "bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200"
              }`}
            >
              {item1Done ? "Completed" : "+ Add product"}
            </button>
          </div>
        </div>

        {/* Item 2: Connect custom domain */}
        <div
          className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
            item2Done ? "bg-page border-default opacity-85" : "bg-card border-default hover:border-strong"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => {
                updateChecklist((prev) => ({ ...prev, domainConnected: !prev.domainConnected }));
              }}
              className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                item2Done
                  ? "bg-success-500 border-success-500 text-white"
                  : "border-strong text-transparent hover:border-primary-500"
              }`}
            >
              ✓
            </button>
            <div>
              <h4 className={`text-sm font-semibold ${item2Done ? "line-through text-subtle" : "text-heading"}`}>
                Connect domain name
              </h4>
              <p className="text-xs text-subtle">
                {item2Done
                  ? `Connected: ${checklist.customDomainName || "mystore.com"}`
                  : "Link your brand web address (e.g. www.yourbrand.com)."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal("domain")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 transition-all cursor-pointer"
          >
            {item2Done ? "Edit Domain" : "Connect Domain"}
          </button>
        </div>

        {/* Item 3: Add courier / shipping provider */}
        <div
          className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
            item3Done ? "bg-page border-default opacity-85" : "bg-card border-default hover:border-strong"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => {
                updateChecklist((prev) => ({ ...prev, courierAdded: !prev.courierAdded }));
              }}
              className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                item3Done
                  ? "bg-success-500 border-success-500 text-white"
                  : "border-strong text-transparent hover:border-primary-500"
              }`}
            >
              ✓
            </button>
            <div>
              <h4 className={`text-sm font-semibold ${item3Done ? "line-through text-subtle" : "text-heading"}`}>
                Add courier &amp; shipping provider
              </h4>
              <p className="text-xs text-subtle">
                {item3Done
                  ? `Active courier: ${checklist.courierName || "TCS Express"}`
                  : "Enable automated shipping label generation and order tracking."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal("courier")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 transition-all cursor-pointer"
          >
            {item3Done ? "Manage Courier" : "Add Courier"}
          </button>
        </div>

        {/* Item 4: Configure payment gateway */}
        <div
          className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
            item4Done ? "bg-page border-default opacity-85" : "bg-card border-default hover:border-strong"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={handleTogglePayment}
              className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                item4Done
                  ? "bg-success-500 border-success-500 text-white"
                  : "border-strong text-transparent hover:border-primary-500"
              }`}
            >
              ✓
            </button>
            <div>
              <h4 className={`text-sm font-semibold ${item4Done ? "line-through text-subtle" : "text-heading"}`}>
                Enable payment methods &amp; payout
              </h4>
              <p className="text-xs text-subtle">
                {item4Done
                  ? "Payment channels configured (Cards, JazzCash, EasyPaisa, COD)"
                  : "Connect Stripe, local mobile wallets, or Cash on Delivery."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTogglePayment}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              item4Done
                ? "bg-success-50 text-success-700 border border-success-200"
                : "bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200"
            }`}
          >
            {item4Done ? "Configured ✓" : "Enable Payments"}
          </button>
        </div>
      </div>

      {/* Connect Domain Modal */}
      {activeModal === "domain" && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleConnectDomain}
            className="bg-card border border-default max-w-md w-full rounded-2xl p-6 shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold text-heading">Connect Custom Domain</h3>
            <p className="text-xs text-body">
              Enter your registered domain address to point it to your Altrivo storefront.
            </p>
            <div>
              <label className="block text-xs font-semibold text-heading mb-1">Domain Name</label>
              <input
                type="text"
                required
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="e.g. www.apexartisans.com"
                className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-medium text-body hover:text-heading"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary-500 text-on-primary text-xs font-bold hover:bg-primary-600"
              >
                Save &amp; Connect
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courier Modal */}
      {activeModal === "courier" && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-fadeIn">
          <div className="bg-card border border-default max-w-md w-full rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-heading">Select Shipping Courier</h3>
            <p className="text-xs text-body">
              Choose your primary shipping partner for automated fulfillment and booking.
            </p>
            <div className="space-y-2">
              {["TCS Express", "Leopard Courier", "Trax Logistics", "DHL Express", "FedEx International"].map(
                (c) => (
                  <label
                    key={c}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      selectedCourier === c
                        ? "border-primary-500 bg-primary-50 text-primary-900"
                        : "border-default bg-page hover:border-strong text-body"
                    }`}
                  >
                    <span>{c}</span>
                    <input
                      type="radio"
                      name="courier"
                      checked={selectedCourier === c}
                      onChange={() => setSelectedCourier(c)}
                      className="accent-primary-500"
                    />
                  </label>
                )
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-medium text-body hover:text-heading"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCourier}
                className="px-4 py-2 rounded-xl bg-primary-500 text-on-primary text-xs font-bold hover:bg-primary-600"
              >
                Save Courier Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
