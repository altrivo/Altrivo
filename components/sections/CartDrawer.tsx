"use client";

import React from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { useCart } from "./CartContext";

export default function CartDrawer() {
  const {
    cartItems,
    itemCount,
    cartTotal,
    isCartOpen,
    customer,
    setIsCartOpen,
    setIsCheckoutOpen,
    setIsCustomerAuthOpen,
    setIsCheckoutGate,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div 
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between h-full border-l border-slate-200/50 transform transition-transform duration-300 animate-slide-in"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[var(--color-primary,#0f172a)]" />
              <h3 
                className="font-bold text-base text-slate-800"
                style={{ fontFamily: "var(--font-heading, inherit)" }}
              >
                Shopping Cart
              </h3>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold rounded-full px-2 py-0.5">
                {itemCount}
              </span>
            </div>
            
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer transition-all duration-150"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-grow overflow-y-auto px-6 py-4 divide-y divide-slate-100">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="h-20 w-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-200/50 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Info details */}
                  <div className="flex-grow flex flex-col justify-between py-0.5 min-w-0">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-2 leading-snug">
                        {item.name}
                      </h4>
                      {item.variant && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                          {item.variant}
                        </span>
                      )}
                      <span className="text-xs font-extrabold text-[var(--color-primary,#0f172a)] block pt-0.5">
                        {item.price}
                      </span>
                    </div>

                    {/* Quantity Editors & Trash */}
                    <div className="flex items-center justify-between gap-4 mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 text-xs font-extrabold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 cursor-pointer transition-colors duration-150"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-700">Your cart is empty</h4>
                  <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                    Add products from our collection to begin your checkout.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Calculations */}
          {cartItems.length > 0 && (
            <div className="border-t border-slate-100 p-6 space-y-4 bg-slate-50/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Subtotal ({itemCount} items)</span>
                <span className="text-base font-black text-slate-900">{cartTotal}</span>
              </div>
              
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-[10px] text-emerald-800 flex items-center gap-2">
                <span className="font-bold">🚚 Free Express Delivery</span>
                <span>•</span>
                <span>100% Escrow &amp; Cash on Delivery Protected</span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    if (!customer) {
                      setIsCheckoutGate(true);
                      setIsCustomerAuthOpen(true);
                    } else {
                      setIsCheckoutOpen(true);
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl text-xs font-extrabold text-white shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] bg-slate-950 hover:bg-slate-900"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 pt-1">
                  <a
                    href="#catalog"
                    onClick={() => setIsCartOpen(false)}
                    className="hover:underline text-slate-600 font-semibold inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft size={13} />
                    <span>Continue Shopping</span>
                  </a>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to clear your cart?")) {
                        cartItems.forEach((i) => removeFromCart(i.id));
                      }
                    }}
                    className="text-rose-500 hover:underline font-semibold"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
