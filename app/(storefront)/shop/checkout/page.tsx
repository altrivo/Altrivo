"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, CheckCircle2 } from "lucide-react";

export default function StorefrontCheckoutPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-card border border-default shadow-card text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-success-50 text-success-600 border border-success-200 mx-auto flex items-center justify-center shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-success-600" />
        </div>
        <h1 className="text-2xl font-bold font-display text-heading">Order Placed Successfully!</h1>
        <p className="text-xs text-subtle">
          Order <strong>#ALT-8922</strong> has been confirmed. You will receive WhatsApp tracking updates shortly.
        </p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 rounded-xl bg-primary-600 text-white font-extrabold text-xs shadow-md hover:bg-primary-700 active:scale-95 transition-all"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 select-none">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-heading">
          Express Checkout
        </h1>
        <p className="text-xs text-subtle mt-1">
          Complete your delivery details for Cash on Delivery or Card Payment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-card border border-default p-6 sm:p-8 shadow-card space-y-6">
        <h2 className="font-bold text-base text-heading font-display">1. Delivery Address (Pakistan)</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-subtle mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ayesha Malik"
              className="w-full h-input px-3.5 rounded-xl bg-input border border-default text-heading font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-subtle mb-1">Phone Number (WhatsApp)</label>
            <input
              type="tel"
              required
              placeholder="e.g. 0300 1234567"
              className="w-full h-input px-3.5 rounded-xl bg-input border border-default text-heading font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-subtle mb-1">Shipping Street Address</label>
            <input
              type="text"
              required
              placeholder="House/Apartment #, Street, Sector/Block..."
              className="w-full h-input px-3.5 rounded-xl bg-input border border-default text-heading font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-subtle mb-1">City</label>
            <select className="w-full h-input px-3.5 rounded-xl bg-input border border-default text-heading font-medium">
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
              <option value="Faisalabad">Faisalabad</option>
            </select>
          </div>
        </div>

        <h2 className="font-bold text-base text-heading font-display pt-4 border-t border-default">2. Payment Method</h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-primary-500 bg-primary-50/50 cursor-pointer">
            <input type="radio" name="payment" defaultChecked className="accent-primary-600" />
            <span className="font-bold text-heading">Cash on Delivery (COD)</span>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-default bg-card cursor-pointer">
            <input type="radio" name="payment" className="accent-primary-600" />
            <span className="font-bold text-heading">Debit / Credit Card (Visa & Mastercard)</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 text-white font-extrabold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Lock className="w-4 h-4 text-accent-200" />
          <span>Confirm Order (₨ 47,700)</span>
        </button>
      </form>
    </div>
  );
}
