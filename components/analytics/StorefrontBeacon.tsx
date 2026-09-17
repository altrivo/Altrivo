"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface StorefrontBeaconProps {
  vendorId?: string;
  storeId?: string;
  productContext?: {
    productId: string;
    productName: string;
    category?: string;
    price?: number;
  };
}

export function StorefrontBeacon({
  vendorId = "v-default",
  storeId,
  productContext,
}: StorefrontBeaconProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. GDPR / Do Not Track (DNT) Compliance Check
    const dnt =
      navigator.doNotTrack ||
      (window as unknown as { doNotTrack?: string }).doNotTrack ||
      (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack;

    if (dnt === "1" || dnt === "yes") {
      return;
    }

    // 2. Session ID Management via sessionStorage
    let sessionId = sessionStorage.getItem("altrivo_session_id") || sessionStorage.getItem("artrivo_session_id");
    if (!sessionId) {
      sessionId =
        "sess_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      sessionStorage.setItem("altrivo_session_id", sessionId);
      sessionStorage.setItem("artrivo_session_id", sessionId);
    }

    // 3. Device Classification
    const ua = navigator.userAgent;
    const device = /mobile/i.test(ua)
      ? "mobile"
      : /tablet|ipad/i.test(ua)
      ? "tablet"
      : "desktop";

    // 4. Debounced Event Delivery to prevent UI thread blocking
    const timer = setTimeout(() => {
      const payload = {
        vendorId,
        storeId: storeId || null,
        sessionId,
        page: pathname,
        referrer: document.referrer || "direct",
        device,
        timestamp: new Date().toISOString(),
        productContext: productContext || null,
      };

      const jsonPayload = JSON.stringify(payload);

      // Prefer navigator.sendBeacon for non-blocking asynchronous delivery
      if (typeof navigator.sendBeacon === "function") {
        const blob = new Blob([jsonPayload], { type: "application/json" });
        navigator.sendBeacon("/api/track", blob);
      } else {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: jsonPayload,
          keepalive: true,
        }).catch((err) => {
          console.warn("[Storefront Beacon] Tracking delivery warning:", err);
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, vendorId, storeId, productContext]);

  return null;
}
