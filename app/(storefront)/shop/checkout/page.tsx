"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import CheckoutPage from "@/app/checkout/page";

export default function StorefrontCheckoutWrapper() {
  return <CheckoutPage />;
}
