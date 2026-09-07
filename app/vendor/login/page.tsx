"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center text-xs text-[#5c3d5c]">
      Redirecting to Vendor Portal...
    </div>
  );
}
