"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

interface Props {
  currentPlanId: "starter" | "growth" | "scale";
  billingCycle: "monthly" | "yearly";
  onSelectPlan: (planId: "starter" | "growth" | "scale", cycle: "monthly" | "yearly") => void;
}

export function PlanCards({ currentPlanId, billingCycle, onSelectPlan }: Props) {
  const [cycle, setCycle] = useState<"monthly" | "yearly">(billingCycle);
  const [showComparison, setShowComparison] = useState(false);

  const PLANS = [
    {
      id: "starter" as const,
      name: "Starter",
      tagline: "For emerging boutiques launching their first online store.",
      priceMonthly: 29,
      priceYearly: 24, // 20% discount
      badge: null,
      features: [
        "Up to 50 Products",
        "Standard Theme Templates",
        "2.5% Transaction Commission",
        "Basic Analytics Dashboard",
        "Email Support (24h response)",
        "Single Admin Seat",
      ],
    },
    {
      id: "growth" as const,
      name: "Growth",
      tagline: "For growing brands looking to scale sales & marketing automation.",
      priceMonthly: 79,
      priceYearly: 64,
      badge: "Most Popular",
      features: [
        "Up to 1,000 Products",
        "All AI-Generated Themes",
        "1.0% Transaction Commission",
        "Advanced Conversion Analytics",
        "Priority WhatsApp & Live Chat Support",
        "Up to 5 Team Seats",
        "Custom Domain & Courier Integrations",
      ],
    },
    {
      id: "scale" as const,
      name: "Scale",
      tagline: "For high-volume enterprise stores requiring custom speed & APIs.",
      priceMonthly: 199,
      priceYearly: 159,
      badge: "Enterprise Speed",
      features: [
        "Unlimited Product Catalog",
        "Custom Theme Builder & CSS Access",
        "0.5% Ultra-low Commission",
        "Real-time Custom Reports & API Access",
        "Dedicated Account Manager",
        "Unlimited Team Seats",
        "Multi-warehouse & Global Shipping",
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Cycle Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-default p-4 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-base font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
            Choose Your Store Growth Plan
          </h3>
          <p className="text-xs text-subtle mt-0.5">
            Switch plans or change billing frequency anytime. No hidden lock-in contracts.
          </p>
        </div>

        {/* Toggle Pills */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl border border-default">
          <button
            type="button"
            onClick={() => {
              setCycle("monthly");
              onSelectPlan(currentPlanId, "monthly");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              cycle === "monthly"
                ? "bg-card text-heading shadow-xs"
                : "text-subtle hover:text-heading"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => {
              setCycle("yearly");
              onSelectPlan(currentPlanId, "yearly");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              cycle === "yearly"
                ? "bg-primary-500 text-on-primary shadow-xs"
                : "text-subtle hover:text-heading"
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.5 rounded bg-accent-200 text-primary-950 text-[10px] font-extrabold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* 3 Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const price = cycle === "yearly" ? plan.priceYearly : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl border bg-card p-6 md:p-8 flex flex-col justify-between transition-all duration-300 shadow-sm ${
                isCurrent
                  ? "border-primary-500 ring-2 ring-primary-500/20 shadow-xl scale-[1.02]"
                  : "border-default hover:border-strong hover:shadow-md"
              }`}
            >
              {/* Card Badges */}
              <div className="flex items-center justify-between mb-4">
                {isCurrent ? (
                  <span className="px-3 py-1 rounded-full bg-primary-500 text-on-primary text-xs font-extrabold shadow-sm animate-pulse">
                    ★ Current Plan
                  </span>
                ) : plan.badge ? (
                  <span className="px-3 py-1 rounded-full bg-accent-100 text-accent-800 text-xs font-bold">
                    {plan.badge}
                  </span>
                ) : (
                  <span />
                )}
              </div>

              {/* Header */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
                  {plan.name}
                </h3>
                <p className="text-xs text-body leading-relaxed min-h-[36px]">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="py-4 border-y border-default flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-heading tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                    ${price}
                  </span>
                  <span className="text-xs text-subtle font-medium">/ month {cycle === "yearly" && "(billed annually)"}</span>
                </div>

                {/* Feature Bullet List */}
                <ul className="space-y-2.5 pt-2">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-body">
                      <svg className="w-4 h-4 text-success-600 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-default">
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="w-full h-12 rounded-xl bg-primary-50 text-primary-700 border border-primary-200 text-xs font-bold cursor-default"
                  >
                    Active Plan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectPlan(plan.id, cycle)}
                    className="w-full h-12 rounded-xl bg-primary-500 hover:bg-primary-600 text-on-primary text-xs font-bold shadow-md transition-all active:scale-[0.99] cursor-pointer"
                  >
                    {plan.id === "scale" ? "Upgrade to Scale" : "Switch to Starter"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix Accordion/Toggle */}
      <div className="rounded-2xl border border-default bg-card p-6 shadow-sm space-y-4">
        <button
          type="button"
          onClick={() => setShowComparison((v) => !v)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div>
            <h4 className="text-base font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
              Detailed Feature Comparison Matrix
            </h4>
            <p className="text-xs text-subtle mt-0.5">
              Compare product limits, commission rates, and API access side-by-side.
            </p>
          </div>
          <span className="text-primary-600 text-xs font-bold flex items-center gap-1">
            {showComparison ? "Hide Matrix ▲" : "Expand Matrix ▼"}
          </span>
        </button>

        {showComparison && (
          <div className="pt-4 border-t border-default overflow-x-auto animate-fadeIn">
            <table className="w-full text-left text-xs text-body">
              <thead className="bg-muted uppercase font-bold text-subtle border-b border-default">
                <tr>
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4">Starter</th>
                  <th className="py-3 px-4 text-primary-600">Growth (Active)</th>
                  <th className="py-3 px-4">Scale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default">
                <tr>
                  <td className="py-3 px-4 font-semibold text-heading">Max Products</td>
                  <td className="py-3 px-4">50 products</td>
                  <td className="py-3 px-4 font-bold text-primary-700">1,000 products</td>
                  <td className="py-3 px-4">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-heading">Transaction Commission</td>
                  <td className="py-3 px-4">2.5% per sale</td>
                  <td className="py-3 px-4 font-bold text-primary-700">1.0% per sale</td>
                  <td className="py-3 px-4">0.5% per sale</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-heading">Team Seats</td>
                  <td className="py-3 px-4">1 Admin</td>
                  <td className="py-3 px-4 font-bold text-primary-700">Up to 5 Seats</td>
                  <td className="py-3 px-4">Unlimited Seats</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-heading">AI Theme Generator</td>
                  <td className="py-3 px-4 text-subtle">Basic Templates</td>
                  <td className="py-3 px-4 font-bold text-primary-700">Full Access (6 Themes)</td>
                  <td className="py-3 px-4">Custom Code &amp; CSS</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-heading">WhatsApp API Integration</td>
                  <td className="py-3 px-4 text-subtle">&mdash;</td>
                  <td className="py-3 px-4 font-bold text-primary-700">
                    <span className="inline-flex items-center gap-1.5">
                      <Check size={14} className="text-primary-700" />
                      <span>Included</span>
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5">
                      <Check size={14} className="text-success-600" />
                      <span>Dedicated Number</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-heading">Support SLA</td>
                  <td className="py-3 px-4">Standard 24h Email</td>
                  <td className="py-3 px-4 font-bold text-primary-700">4h Priority Chat</td>
                  <td className="py-3 px-4">15-min VIP Phone &amp; Manager</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
