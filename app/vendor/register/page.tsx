"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorRegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/auth/signup");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center text-xs text-[#5c3d5c]">
      Redirecting to Vendor Registration...
    </div>
  );
}
