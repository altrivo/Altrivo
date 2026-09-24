"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Check, ShoppingBag, Truck, AlertTriangle, Sparkles, X, CheckCheck, ArrowRight } from "lucide-react";
import { Notification } from "@/types/notifications";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications on mount
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?userId=vendor_dev_123");
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifications();

    // Listen to real-time notification broadcasts
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("vendor_notifications_channel");
      bc.onmessage = (event) => {
        if (event.data?.type === "NEW_NOTIFICATION") {
          const newNotif = event.data.notification;
          setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
          setUnreadCount((prev) => prev + 1);
        }
      };
    } catch (e) {}

    // Polling fallback every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);

    return () => {
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true, userId: "vendor_dev_123" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes("ORDER")) {
      return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
    }
    if (type.includes("SHIPMENT") || type.includes("SHIPPED")) {
      return <Truck className="w-4 h-4 text-sky-500" />;
    }
    if (type.includes("STOCK") || type.includes("FAILED")) {
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
    return <Sparkles className="w-4 h-4 text-violet-500" />;
  };

  return (
    <div ref={dropdownRef} className="relative select-none">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-2xl border transition-all duration-150 cursor-pointer ${
          isOpen
            ? "bg-slate-900 text-white border-slate-900 shadow-md"
            : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs"
        }`}
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in-50 zoom-in-95 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900">Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notification Items List */}
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href="/orders"
                  onClick={() => setIsOpen(false)}
                  className={`p-3 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer block ${
                    !notif.is_read
                      ? "bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/80"
                      : "bg-slate-50/50 border-slate-100 hover:bg-slate-100/70"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notif.event_type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="font-extrabold text-xs text-slate-900 truncate">{notif.title}</h5>
                      {!notif.is_read && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 mt-0.5">{notif.message}</p>
                    <span className="text-[9px] text-slate-400 font-semibold block mt-1">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs font-bold text-slate-700">No new notifications</p>
                <p className="text-[11px] text-slate-400">All alerts and store activities will show up here.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors inline-flex items-center gap-1"
            >
              <span>View Order Manager</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
