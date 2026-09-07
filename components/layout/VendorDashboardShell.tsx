"use client";

import React, { useState } from "react";
import { VendorSidebar } from "./VendorSidebar";
import { VendorNavbar } from "./VendorNavbar";
import { MobileDrawer } from "./MobileDrawer";

interface VendorDashboardShellProps {
  children: React.ReactNode;
}

export function VendorDashboardShell({ children }: VendorDashboardShellProps) {
  // Default to minimized (collapsed) mode. Hovering cursor over sidebar auto-expands it.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page text-body flex flex-col font-sans antialiased selection:bg-primary-100 selection:text-primary-900">
      {/* Main Vendor Studio Outer Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (Collapsible >=1280px) */}
        <VendorSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Mobile Slide-Over Drawer (<1280px) */}
        <MobileDrawer
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
        />

        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 bg-page overflow-x-hidden">
          {/* Top Primary Single Unified Navbar */}
          <VendorNavbar
            onToggleMobileMenu={() => setMobileDrawerOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 animate-in fade-in duration-normal z-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
