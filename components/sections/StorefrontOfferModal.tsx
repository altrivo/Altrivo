"use client";

export interface StorefrontOfferModalProps {
  couponCode?: string;
  discountAmount?: string;
  headline?: string;
  subheadline?: string;
  delaySeconds?: number;
}

export default function StorefrontOfferModal(_props?: StorefrontOfferModalProps) {
  // Permanently disabled across all current and future storefronts per store design
  return null;
}
