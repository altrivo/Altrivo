"use client";

import React from "react";
import { useCart } from "./CartContext";
import CartDrawer from "./CartDrawer";
import CheckoutModal from "./CheckoutModal";
import CustomerOrdersTrackingModal from "./CustomerOrdersTrackingModal";
import CustomerAuthModal from "./CustomerAuthModal";

export interface StorefrontGlobalModalsProps {
  storeName?: string;
}

export default function StorefrontGlobalModals({
  storeName = "Artisanal Store",
}: StorefrontGlobalModalsProps) {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    isTrackingOpen,
    setIsTrackingOpen,
    trackingOrderNumber,
    isCustomerAuthOpen,
    setIsCustomerAuthOpen,
    isCheckoutGate,
  } = useCart();

  return (
    <>
      {/* Global Shopping Cart Side Panel */}
      <CartDrawer />

      {/* Global Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        storeName={storeName}
      />

      {/* Global Customer Orders Tracking Modal */}
      <CustomerOrdersTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrderNumber={trackingOrderNumber}
        storeName={storeName}
      />

      {/* Global Customer Auth Modal (Login / Register / Checkout Gate) */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        storeName={storeName}
        isCheckoutGate={isCheckoutGate}
      />
    </>
  );
}
