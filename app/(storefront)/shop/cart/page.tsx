import React from "react";
import Link from "next/link";
import { ArrowRight, Trash2 } from "lucide-react";

export default function StorefrontCartPage() {
  return (
    <div className="space-y-8 select-none">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-heading">
          Your Shopping Cart
        </h1>
        <p className="text-xs text-subtle mt-1">
          Review items in your order before proceeding to express checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {[
            {
              id: "item-1",
              name: "Ceramic Minimalist Vase (Handcrafted)",
              price: "₨ 8,900",
              qty: 1,
              sku: "ART-VAS-001",
            },
            {
              id: "item-2",
              name: "Abstract Canvas Painting 'Golden Dawn'",
              price: "₨ 34,000",
              qty: 1,
              sku: "ART-CAN-089",
            },
            {
              id: "item-3",
              name: "Handcrafted Genuine Leather Journal",
              price: "₨ 4,800",
              qty: 1,
              sku: "ART-JRN-044",
            },
          ].map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-card border border-default shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-50 to-accent-100 border border-primary-200 flex items-center justify-center text-primary-600 font-bold text-xs flex-shrink-0">
                  ART
                </div>

                <div>
                  <h3 className="font-bold text-sm text-heading">{item.name}</h3>
                  <span className="text-[10px] text-subtle font-mono">{item.sku}</span>
                  <div className="font-extrabold text-sm text-primary-700 mt-1">{item.price}</div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="flex items-center border border-default rounded-xl bg-input">
                  <button className="px-3 py-1 font-bold text-subtle hover:text-heading">-</button>
                  <span className="px-3 py-1 text-xs font-bold text-heading">{item.qty}</span>
                  <button className="px-3 py-1 font-bold text-subtle hover:text-heading">+</button>
                </div>

                <button aria-label="Remove item" className="p-2 rounded-xl text-subtle hover:text-error-600 hover:bg-error-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-card border border-default p-6 shadow-card space-y-5">
          <h2 className="font-bold text-base text-heading font-display">Order Summary</h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-subtle">
              <span>Subtotal (3 items):</span>
              <span className="font-bold text-heading">₨ 47,700</span>
            </div>

            <div className="flex justify-between text-subtle">
              <span>Shipping Fee:</span>
              <span className="font-bold text-success-600">FREE</span>
            </div>

            <div className="pt-3 border-t border-default flex justify-between text-sm font-extrabold text-heading">
              <span>Total Amount:</span>
              <span className="text-primary-700">₨ 47,700</span>
            </div>
          </div>

          <Link
            href="/shop/checkout"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-extrabold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Express Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
