"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendorOnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/onboarding");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-xs text-[#5c3d5c]">
      Redirecting to Vendor Store Setup Wizard...
    </div>
  );
}
