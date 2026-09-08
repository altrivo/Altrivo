"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/shared";
import {
  ShoppingCart,
  XIcon,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
} from "@/components/shared/LucideIcons";

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
    subtotal,
    effectiveShippingCost,
    grandTotal,
    totalItemCount,
    appliedCoupon,
  } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-modal overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-overlay backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={closeDrawer}
      />

      {/* Drawer Container */}
      <aside className="fixed inset-y-0 right-0 z-modal flex w-full max-w-md flex-col bg-card border-l border-strong shadow-modal animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-default p-4 sm:px-6 bg-card">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-heading font-display">
                Shopping Cart
              </h2>
              <p className="text-xs font-semibold text-body">
                {totalItemCount} {totalItemCount === 1 ? "item" : "items"} in cart
              </p>
            </div>
          </div>

          <button
            onClick={closeDrawer}
            className="rounded-xl p-2 text-heading hover:bg-neutral-200 transition-colors border border-default"
            aria-label="Close cart"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-primary-50/70 px-4 py-2.5 border-b border-primary-100 flex items-center gap-2 text-xs font-semibold text-primary-900">
          <Truck size={16} className="text-primary-600 shrink-0" />
          <span>
            {subtotal >= 150 ? (
              <strong className="text-success-700 font-extrabold">🎉 You qualify for FREE Express Shipping!</strong>
            ) : (
              <span>
                Add <strong className="font-mono font-bold">${(150 - subtotal).toFixed(2)}</strong> more for <strong>FREE Shipping</strong>
              </span>
            )}
          </span>
        </div>

        {/* Items List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center text-heading">
                <ShoppingCart size={32} />
              </div>
              <div>
                <p className="text-base font-extrabold text-heading">Your cart is empty</p>
                <p className="text-xs text-body mt-1">Explore our original art & handcrafted catalog.</p>
              </div>
              <Link href="/products" onClick={closeDrawer} className="inline-block pt-2">
                <Button variant="primary" size="md" className="font-extrabold shadow-sm">
                  Browse Products Catalog
                </Button>
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-2xl border border-default bg-card p-3.5 shadow-card transition-all hover:border-strong"
              >
                {/* Thumbnail */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-20 w-20 rounded-xl object-cover border border-default shrink-0"
                />

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-extrabold text-heading truncate">
                        {item.title}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-body hover:text-error-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-[11px] font-semibold text-body truncate">
                      {item.variantName}
                    </p>
                  </div>

                  {/* Quantity Stepper & Price */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-lg border border-default bg-neutral-100">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-heading hover:bg-neutral-200 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-extrabold font-mono text-heading">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-heading hover:bg-neutral-200 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold text-heading font-mono">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      {item.originalPrice && (
                        <div className="text-[10px] text-body line-through font-mono">
                          ${(item.originalPrice * item.quantity).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Actions */}
        {items.length > 0 && (
          <div className="border-t border-default bg-card p-4 sm:p-6 space-y-4 shadow-modal">
            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs font-extrabold text-success-700 bg-success-50 p-2.5 rounded-xl border border-success-200">
                <div className="flex items-center gap-1.5">
                  <Tag size={14} />
                  <span>Promo Code applied: {appliedCoupon.code}</span>
                </div>
                <span>-{appliedCoupon.discountPct}%</span>
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-body font-medium">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-heading">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-body font-medium">
                <span>Shipping Estimate</span>
                <span className="font-mono font-bold text-heading">
                  {effectiveShippingCost === 0 ? (
                    <strong className="text-success-700 font-extrabold">FREE</strong>
                  ) : (
                    `$${effectiveShippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-heading font-extrabold text-sm pt-2 border-t border-default">
                <span>Estimated Total</span>
                <span className="font-mono text-base font-extrabold">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link href="/cart" onClick={closeDrawer} className="block">
                <Button variant="primary" size="lg" className="w-full font-extrabold shadow-md gap-2">
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} />
                </Button>
              </Link>

              <Link href="/cart" onClick={closeDrawer} className="inline-flex items-center justify-center gap-1 w-full text-center text-xs font-extrabold text-primary-700 hover:underline">
                <span>View Full Cart Review Page</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Secured Checkout Footer */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-body pt-1">
              <ShieldCheck size={14} className="text-success-600" />
              <span>Secured 256-Bit SSL A2 Escrow Protection</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
