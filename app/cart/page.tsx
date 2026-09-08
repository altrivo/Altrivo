"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { SAMPLE_PRODUCTS } from "@/utils/productsMock";
import { Button, Card, Badge } from "@/components/shared";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Tag,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Package,
} from "@/components/shared/LucideIcons";

export default function FullCartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    couponError,
    subtotal,
    discountAmount,
    effectiveShippingCost,
    taxAmount,
    grandTotal,
    clearCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [zipCode, setZipCode] = useState("94103");
  const [deliveryEstimate, setDeliveryEstimate] = useState<string>("Aug 14 - Aug 16, 2026");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const success = applyCoupon(couponInput);
    if (success) {
      setToastMessage(`🎉 Coupon "${couponInput.toUpperCase()}" applied successfully!`);
      setCouponInput("");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleCalculateShipping = () => {
    setDeliveryEstimate("Aug 14 - Aug 16, 2026 (Express Delivery to " + zipCode + ")");
  };

  const handleProceedCheckout = () => {
    router.push("/checkout/success");
  };

  return (
    <div className="min-h-dvh bg-muted font-sans text-body pb-20">
      {/* Top Navbar */}
      <header className="h-16 border-b border-default bg-card px-4 sm:px-8 flex items-center justify-between sticky top-0 z-sticky shadow-xs">
        <Link href="/orders" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary-500 flex items-center justify-center text-on-primary font-bold font-display text-lg shadow-sm">
            A
          </div>
          <span className="font-extrabold text-lg text-heading font-display tracking-tight">
            Altrio <span className="text-xs font-bold text-heading uppercase tracking-wider">Shopping Cart</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="font-extrabold text-xs gap-1.5">
              <Package size={16} />
              <span>Back to Products</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Cart Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-success-300 bg-success-50 p-4 shadow-sm animate-bounce">
            <CheckCircle2 size={20} className="text-success-600 shrink-0" />
            <span className="text-sm font-extrabold text-success-950">{toastMessage}</span>
          </div>
        )}

        {/* Page Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-heading font-display tracking-tight flex items-center gap-3">
              <ShoppingCart size={32} className="text-primary-600" />
              <span>Review Your Cart</span>
            </h1>
            <p className="text-xs font-semibold text-body mt-1">
              Verify line items, apply promotional discount codes, and calculate express delivery estimates.
            </p>
          </div>

          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-error-600 hover:bg-error-50 border-error-200 font-extrabold gap-1.5 self-start sm:self-auto"
            >
              <Trash2 size={16} />
              <span>Clear Entire Cart</span>
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <Card className="p-12 text-center space-y-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-neutral-100 flex items-center justify-center text-heading">
              <ShoppingCart size={40} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-heading">Your cart is currently empty</h2>
              <p className="text-xs font-semibold text-body max-w-md mx-auto">
                Looks like you haven't added any handcrafted artwork or home decor items to your shopping cart yet.
              </p>
            </div>
            <Link href="/products" className="inline-block pt-2">
              <Button variant="primary" size="lg" className="font-extrabold shadow-md gap-2">
                <span>Explore Products Catalog</span>
                <ArrowRight size={18} />
              </Button>
            </Link>
          </Card>
        ) : (
          /* Cart Content 2-Column Grid */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Line Items & Delivery Calculator (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Line Items Table Card */}
              <Card className="p-6 space-y-6">
                <h2 className="text-base font-extrabold text-heading font-display flex items-center justify-between">
                  <span>Cart Items ({items.length})</span>
                  <span className="text-xs font-mono font-bold text-body">Verified Inventory</span>
                </h2>

                <div className="divide-y divide-default">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Item Info */}
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-20 w-20 rounded-2xl object-cover border border-default shrink-0 shadow-xs"
                        />
                        <div className="min-w-0 space-y-1">
                          <h3 className="text-sm font-extrabold text-heading truncate">
                            {item.title}
                          </h3>
                          <p className="text-xs font-semibold text-body">
                            {item.variantName}
                          </p>
                          <p className="text-[11px] font-mono text-body font-bold">
                            SKU: {item.sku}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Stepper & Price */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-default">
                        <div className="flex items-center rounded-xl border border-default bg-neutral-100">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1.5 text-heading hover:bg-neutral-200 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-xs font-extrabold font-mono text-heading">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1.5 text-heading hover:bg-neutral-200 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-extrabold text-heading font-mono">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-[11px] text-body">
                            (${item.price.toFixed(2)} each)
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-body hover:text-error-600 transition-colors p-2"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Delivery Estimate & ZIP Calculator */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
                    <Truck size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-heading">Delivery Estimate Calculator</h3>
                    <p className="text-xs font-semibold text-body">Enter your destination ZIP code to estimate shipping speed.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Enter 5-digit ZIP Code (e.g. 94103)"
                    className="w-full sm:w-64 rounded-xl border border-default bg-input px-3.5 py-2.5 text-xs font-semibold text-heading focus:border-focus focus:outline-none shadow-xs"
                  />
                  <Button variant="ghost" size="sm" onClick={handleCalculateShipping} className="w-full sm:w-auto font-bold border-strong">
                    Calculate Speed
                  </Button>
                </div>

                <div className="rounded-xl border border-success-200 bg-success-50 p-3 flex items-center gap-3 text-xs font-bold text-success-900">
                  <CheckCircle2 size={18} className="text-success-600 shrink-0" />
                  <span>Estimated Arrival: <strong>{deliveryEstimate}</strong></span>
                </div>
              </Card>
            </div>

            {/* Right Column: Coupon Code & Order Summary (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Coupon Code Entry Card */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Tag size={18} className="text-primary-600" />
                  <h3 className="text-sm font-extrabold text-heading">Promo / Coupon Code</h3>
                </div>

                {appliedCoupon ? (
                  <div className="rounded-xl border border-success-200 bg-success-50 p-3 flex items-center justify-between text-xs font-extrabold text-success-900">
                    <div className="space-y-0.5">
                      <p>Active Code: {appliedCoupon.code}</p>
                      <p className="text-[11px] font-normal text-success-800">{appliedCoupon.description}</p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-error-600 hover:underline font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Try WELCOME10 or ALTRIVO20"
                        className="flex-1 rounded-xl border border-default bg-input px-3 py-2 text-xs font-mono font-bold text-heading focus:border-focus focus:outline-none shadow-xs"
                      />
                      <Button variant="primary" size="sm" type="submit" className="font-extrabold shrink-0">
                        Apply
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] font-bold text-error-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        <span>{couponError}</span>
                      </p>
                    )}
                  </form>
                )}
              </Card>

              {/* Order Summary Card */}
              <Card className="p-6 space-y-5 border-strong shadow-card">
                <h3 className="text-base font-extrabold text-heading font-display border-b border-default pb-3">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-body font-semibold">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-heading">${subtotal.toFixed(2)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-success-700 font-extrabold bg-success-50 p-2 rounded-lg border border-success-200">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-body font-semibold">
                    <span>Estimated Shipping</span>
                    <span className="font-mono font-bold text-heading">
                      {effectiveShippingCost === 0 ? (
                        <strong className="text-success-700 font-extrabold">FREE</strong>
                      ) : (
                        `$${effectiveShippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-body font-semibold">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-mono font-bold text-heading">${taxAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-heading font-extrabold text-base pt-3 border-t border-default">
                    <span>Grand Total</span>
                    <span className="font-mono text-xl text-primary-700">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleProceedCheckout}
                  className="w-full font-extrabold shadow-md gap-2 text-base py-3"
                >
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight size={18} />
                </Button>

                {/* Trust Badges */}
                <div className="space-y-2 pt-2 border-t border-default text-center">
                  <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-heading">
                    <ShieldCheck size={16} className="text-success-600" />
                    <span>A2 Escrow Protection Guarantee</span>
                  </div>
                  <p className="text-[11px] font-semibold text-body">
                    30-Day Money-Back Returns & 256-Bit SSL Encryption
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Related Products Carousel ("Frequently Bought Together") */}
        <div className="space-y-4 pt-8 border-t border-default">
          <h2 className="text-xl font-extrabold text-heading font-display">
            Frequently Bought Together
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {SAMPLE_PRODUCTS.slice(0, 3).map((rel) => (
              <Card
                key={rel.id}
                className="p-4 space-y-3 transition-all hover:shadow-card-hover group"
              >
                <div className="aspect-4/3 overflow-hidden rounded-xl bg-neutral-200 relative">
                  <img
                    src={rel.media[0]?.url}
                    alt={rel.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-normal"
                  />
                  <Badge variant="primary" size="sm" className="absolute top-2 left-2 font-extrabold">
                    {rel.category}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-extrabold text-heading text-sm line-clamp-1">
                    {rel.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono font-extrabold text-heading text-base">
                      ${rel.price.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-warning-600">
                      ★ {rel.rating}
                    </span>
                  </div>
                </div>

                <Link href={`/products/${rel.id}`} className="block">
                  <Button variant="ghost" size="sm" className="w-full font-bold text-xs inline-flex items-center justify-center gap-1">
                    <span>View Product</span>
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
