"use client";

import React, { useState } from "react";
import { ArrowRight, X, Check } from "lucide-react";

const FAQS = [
  {
    q: "Can I upgrade or downgrade my plan at any time?",
    a: "Yes! You can switch between Starter, Growth, and Scale plans whenever your catalog or order volume expands. Prorated credits will automatically apply to your next invoice.",
  },
  {
    q: "How does the wallet balance top-up work?",
    a: "Your wallet balance is used for ad campaign spend, domain renewals, and automated shipping label bookings. You can top up instantly via JazzCash, EasyPaisa, or Bank Transfer.",
  },
  {
    q: "Are there any hidden transaction or setup fees?",
    a: "No hidden setup fees. Altrivo only charges the listed subscription price and the low commission rate tied to your active plan tier (2.5%, 1.0%, or 0.5%).",
  },
  {
    q: "How do digital invoices and payment links work for custom enterprise clients?",
    a: "If your organization requires purchase orders or wire transfers, click 'Generate Digital Invoice' to receive a downloadable PDF invoice and instant online payment link.",
  },
  {
    q: "What payment methods are supported for vendor payouts?",
    a: "Payouts are deposited daily or weekly directly into your local Pakistani Bank Account (HBL, Meezan, Allied, UBL), JazzCash Business, or EasyPaisa merchant account.",
  },
];

export function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [salesSent, setSalesSent] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* FAQ Header */}
      <div className="p-6 rounded-2xl bg-card border border-default shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
            Frequently Asked Billing Questions
          </h3>
          <p className="text-xs text-subtle mt-1">
            Everything you need to know about plans, commissions, and payment processing.
          </p>
        </div>

        {/* Accordion Items */}
        <div className="divide-y divide-default">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer group"
                >
                  <span className="text-sm font-bold text-heading group-hover:text-primary-600 transition-colors">
                    {faq.q}
                  </span>
                  <span className="text-primary-500 font-bold text-base shrink-0">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <p className="text-xs text-body mt-2 leading-relaxed animate-fadeIn">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Sales Enterprise Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary-900 to-primary-950 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-primary-700/50">
        <div>
          <span className="px-2.5 py-1 rounded bg-accent-400/20 text-accent-200 text-[10px] font-extrabold uppercase tracking-wider">
            Custom Architecture
          </span>
          <h4 className="text-xl font-bold text-white mt-1" style={{ fontFamily: "var(--font-display)" }}>
            Need a custom enterprise solution?
          </h4>
          <p className="text-primary-200 text-xs mt-0.5 max-w-lg">
            High volume merchant processing 10,000+ orders/month? Talk to our sales engineers for dedicated servers, custom SAP/ERP sync, and zero-commission contracts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowSalesModal(true)}
          className="px-6 py-3 rounded-xl bg-accent-200 hover:bg-white text-primary-950 font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>Contact Sales Team</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Contact Sales Modal */}
      {showSalesModal && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-fadeIn">
          <div className="bg-card border border-default max-w-md w-full rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-default pb-3">
              <h3 className="text-base font-bold text-heading">Contact Enterprise Sales</h3>
              <button
                type="button"
                onClick={() => {
                  setShowSalesModal(false);
                  setSalesSent(false);
                }}
                className="text-subtle hover:text-heading p-1"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {salesSent ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-success-100 text-success-600 flex items-center justify-center">
                  <Check size={24} />
                </div>
                <h4 className="font-bold text-heading">Request Submitted!</h4>
                <p className="text-xs text-subtle">
                  Our enterprise account lead will reach out to you within 2 business hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSalesSent(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-heading mb-1">Estimated Monthly Orders</label>
                  <select className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500">
                    <option>5,000 - 10,000 orders/mo</option>
                    <option>10,000 - 50,000 orders/mo</option>
                    <option>50,000+ orders/mo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-heading mb-1">Special Requirements</label>
                  <textarea
                    rows={3}
                    placeholder="e.g., SAP integration, custom courier SLA, dedicated IP address..."
                    className="w-full p-3 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSalesModal(false)}
                    className="px-4 py-2 text-xs font-medium text-body hover:text-heading"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-primary-500 text-on-primary text-xs font-bold hover:bg-primary-600"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
