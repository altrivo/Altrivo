import React from "react";
import { VendorDashboardShell } from "@/components/layout/VendorDashboardShell";

export const metadata = {
  title: "Vendor Studio | Altrivo",
  description: "Altrivo Vendor Management Studio & Control Dashboard",
};

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return <VendorDashboardShell>{children}</VendorDashboardShell>;
}
