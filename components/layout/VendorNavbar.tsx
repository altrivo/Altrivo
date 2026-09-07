"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { NotificationItem } from "@/app/api/notifications/route";
import { Breadcrumbs } from "./Breadcrumbs";
import { StorefrontPreviewModal } from "@/components/storefront/StorefrontPreviewModal";
import { createClient } from "@/lib/supabase/client";

interface VendorNavbarProps {
  onToggleMobileMenu: () => void;
}

export function VendorNavbar({ onToggleMobileMenu }: VendorNavbarProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [vendorInfo, setVendorInfo] = useState<{
    name: string;
    email: string;
    storeName: string;
    initials: string;
  }>({
    name: "Vendor",
    email: "vendor@artrivo.com",
    storeName: "My Store",
    initials: "VS",
  });

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch active vendor profile
  useEffect(() => {
    async function loadVendor() {
      try {
        const res = await fetch("/api/auth/vendor/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.vendor) {
            const name = data.vendor.name || "Vendor";
            const email = data.vendor.email || "";
            const storeName =
              data.stores?.[0]?.name ||
              (data.hasStore ? "My Store" : "No Store Yet");
            const parts = name.trim().split(" ");
            const initials =
              parts.length > 1
                ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
                : name.substring(0, 2).toUpperCase();
            setVendorInfo({ name, email, storeName, initials });
          }
        }
      } catch {}
    }
    loadVendor();
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Handle Mark All Read API call
  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(0);
        }
      }
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="h-navbar sticky top-0 z-fixed bg-card/80 backdrop-blur-xl border-b border-default flex items-center justify-between px-4 sm:px-6 transition-all duration-normal"
      style={{
        boxShadow:
          "0 4px 20px -2px rgba(105,72,115,0.05), 0 1px 3px 0 rgba(0,0,0,0.03)",
      }}
    >
      {/* Left side: Hamburger Button (mobile/tablet <1280px) & Location Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Menu Toggle (<1280px) */}
        <button
          onClick={onToggleMobileMenu}
          aria-label="Open mobile navigation menu"
          className="xl:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-default bg-card hover:bg-sidebar-hover text-heading shadow-xs active:scale-95 transition-all flex-shrink-0"
        >
          <Menu className="w-5 h-5 text-heading" />
        </button>

        {/* Dynamic Location Breadcrumbs (Vendor > Dashboard) */}
        <Breadcrumbs />
      </div>

      {/* Right side Actions: Notifications + Profile Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Action Button to Open Storefront Preview Modal */}
        <button
          onClick={() => setPreviewModalOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-default bg-card hover:bg-sidebar-hover text-xs font-semibold text-heading shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <span>Preview Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-subtle" />
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            aria-label="View notifications"
            className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-default bg-card hover:bg-sidebar-hover text-heading shadow-xs hover:shadow-sm active:scale-95 transition-all"
          >
            <Bell className="w-5 h-5 text-heading" />

            {/* Unread Count Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-error-500 to-error-600 px-1.5 text-[10px] font-bold text-white shadow-[0_2px_6px_rgba(239,68,68,0.4)] animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover Menu */}
          {notifOpen && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-default bg-card shadow-float z-popover overflow-hidden animate-in fade-in slide-in-from-top-2 duration-fast"
              style={{
                boxShadow:
                  "0 20px 40px -10px rgba(105,72,115,0.18), 0 8px 16px -4px rgba(0,0,0,0.06)",
              }}
            >
              <div className="p-4 border-b border-default flex items-center justify-between bg-card-tint">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-heading">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-link hover:text-link-hover hover:underline transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-default scrollbar-thin">
                {loadingNotifs ? (
                  <div className="p-6 text-center text-sm text-subtle">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-subtle">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 hover:bg-sidebar-hover transition-colors flex items-start gap-3 ${
                        !item.read ? "bg-primary-50/50" : ""
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          !item.read ? "bg-primary-500" : "bg-transparent"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-heading truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-body line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                        <span className="text-[10px] text-subtle mt-1 block">
                          {item.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 border-t border-default text-center bg-muted/40">
                <Link
                  href="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 block"
                >
                  View notification settings →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl border border-default bg-card hover:bg-sidebar-hover shadow-xs active:scale-95 transition-all"
          >
            {/* 3D Profile Avatar */}
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-500 p-[1px] shadow-sm flex items-center justify-center">
              <div className="w-full h-full rounded-[7px] bg-primary-700 flex items-center justify-center text-white font-bold text-xs">
                {vendorInfo.initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success-500 border-2 border-card" />
            </div>

            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-heading leading-tight truncate max-w-[120px]">
                {vendorInfo.name}
              </span>
              <span className="text-[10px] text-subtle font-medium truncate max-w-[120px]">
                {vendorInfo.storeName}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-subtle hidden sm:block" />
          </button>

          {/* Profile Dropdown Popover */}
          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-2xl border border-default bg-card shadow-float z-popover overflow-hidden animate-in fade-in slide-in-from-top-2 duration-fast"
              style={{
                boxShadow:
                  "0 20px 40px -10px rgba(105,72,115,0.18), 0 8px 16px -4px rgba(0,0,0,0.06)",
              }}
            >
              {/* Profile Card Header */}
              <div className="p-4 border-b border-default bg-gradient-to-br from-primary-50/80 to-accent-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                    {vendorInfo.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-heading truncate">
                      {vendorInfo.name}
                    </h4>
                    <p className="text-xs text-subtle truncate">
                      {vendorInfo.email}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded-md mt-1 border border-primary-200">
                      <ShieldCheck className="w-3 h-3 text-primary-600" />
                      {vendorInfo.storeName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1.5 space-y-0.5">
                <Link
                  href="/store-builder"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-heading hover:bg-sidebar-hover transition-colors"
                >
                  <User className="w-4 h-4 text-subtle" />
                  <span>Store Generator</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-heading hover:bg-sidebar-hover transition-colors"
                >
                  <Settings className="w-4 h-4 text-subtle" />
                  <span>Store Settings</span>
                </Link>
              </div>

              <div className="p-1.5 border-t border-default bg-muted/30">
                <button
                  onClick={async () => {
                    setProfileOpen(false);
                    try {
                      const supabase = createClient();
                      await supabase.auth.signOut();
                    } catch {}
                    try {
                      localStorage.removeItem("active_vendor_id");
                      localStorage.removeItem("active_vendor_name");
                      localStorage.removeItem("active_vendor_email");
                    } catch {}
                    router.push("/auth/login");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-error-600 hover:bg-error-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-error-500" />
                  <span>Sign Out (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <StorefrontPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
      />
    </header>
  );
}
