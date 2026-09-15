"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  ShoppingBag,
  Truck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  CheckCheck,
  Trash2,
  RefreshCw,
  Sliders,
  Mail,
  Smartphone,
  ShieldCheck,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Card, Button } from "@/components/shared";
import { useVendorStore } from "@/context/VendorStoreContext";

interface NotificationItem {
  id: string;
  title: string;
  message?: string;
  description?: string;
  event_type: string;
  is_read?: boolean;
  read?: boolean;
  created_at?: string;
  timestamp?: string;
  data?: any;
  store_id?: string;
}

export default function NotificationsPage() {
  const { vendor, activeStore } = useVendorStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "orders" | "shipments" | "settings">("all");
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Notification Preferences State
  const [prefs, setPrefs] = useState({
    emailNewOrder: true,
    emailShipmentUpdate: true,
    emailDailyDigest: false,
    inAppSound: true,
    smsAlerts: false,
    escrowAlerts: true,
  });

  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  const fetchPreferences = async () => {
    try {
      const currentUserId = vendor?.id;
      if (!currentUserId) return;
      const res = await fetch(`/api/notifications/preferences?userId=${currentUserId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.preferences) {
          setPrefs({
            emailNewOrder: data.preferences.email_order_updates ?? true,
            emailShipmentUpdate: data.preferences.email_shipping_updates ?? true,
            emailDailyDigest: data.preferences.email_marketing ?? false,
            inAppSound: data.preferences.in_app_orders ?? true,
            smsAlerts: data.preferences.whatsapp_cod ?? true,
            escrowAlerts: data.preferences.email_security ?? true,
          });
        }
      }
    } catch (e) {}
  };

  const handleSavePreferences = async () => {
    setIsSavingPrefs(true);
    try {
      const currentUserId = vendor?.id;
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          storeId: activeStore?.id,
          preferences: {
            email_order_updates: prefs.emailNewOrder,
            email_shipping_updates: prefs.emailShipmentUpdate,
            email_marketing: prefs.emailDailyDigest,
            in_app_orders: prefs.inAppSound,
            in_app_shipping: prefs.inAppSound,
            whatsapp_cod: prefs.smsAlerts,
            whatsapp_order_updates: prefs.smsAlerts,
          },
        }),
      });
      if (res.ok) {
        showToast("Notification preferences updated successfully");
      }
    } catch (e) {
      showToast("Failed to save preferences");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (vendor?.id) params.set("userId", vendor.id);
      if (activeStore?.id) params.set("storeId", activeStore.id);

      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();

    // Listen to real-time notification broadcasts
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("vendor_notifications_channel");
      bc.onmessage = (event) => {
        if (event.data?.type === "NEW_NOTIFICATION") {
          const newNotif = event.data.notification;
          // Filter by active store
          if (!activeStore?.id || !newNotif.store_id || newNotif.store_id === activeStore.id) {
            setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
            setUnreadCount((prev) => prev + 1);
          }
        }
      };
    } catch (e) {}

    return () => {
      if (bc) bc.close();
    };
  }, [vendor?.id, activeStore?.id]);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markAll: true,
          markAllRead: true,
          userId: vendor?.id,
          storeId: activeStore?.id,
        }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read: true })));
      setUnreadCount(0);
      showToast("All notifications marked as read");
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast("Notification dismissed");
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const getNotificationIcon = (type: string = "") => {
    const t = type.toUpperCase();
    if (t.includes("ORDER")) {
      return (
        <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-xs">
          <ShoppingBag className="w-5 h-5" />
        </div>
      );
    }
    if (t.includes("SHIPMENT") || t.includes("SHIPPED") || t.includes("COURIER")) {
      return (
        <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200/60 shadow-xs">
          <Truck className="w-5 h-5" />
        </div>
      );
    }
    if (t.includes("STOCK") || t.includes("WARN") || t.includes("FAILED")) {
      return (
        <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 shadow-xs">
          <AlertTriangle className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="p-2.5 rounded-2xl bg-violet-50 text-violet-600 border border-violet-200/60 shadow-xs">
        <Sparkles className="w-5 h-5" />
      </div>
    );
  };

  // Filtered notifications
  const filteredNotifications = notifications.filter((item) => {
    const isUnread = !(item.is_read || item.read);
    if (filterUnreadOnly && !isUnread) return false;

    const t = (item.event_type || "").toUpperCase();
    if (activeTab === "orders") {
      return t.includes("ORDER") || t.includes("ESCROW") || t.includes("PAYMENT");
    }
    if (activeTab === "shipments") {
      return t.includes("SHIPMENT") || t.includes("SHIPPED") || t.includes("DELIVERED") || t.includes("COURIER");
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-950 text-white px-5 py-3 shadow-2xl animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-default pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-50 text-primary-600 border border-primary-200/50">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-heading font-display">
              Notifications &amp; Activity
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-xs shadow-sm">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-body">
            Real-time notifications, customer order dispatch updates, courier tracking, and alert preferences.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchNotifications}
            className="p-2.5 rounded-xl border border-default bg-card hover:bg-sidebar-hover text-heading text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-default pb-px">
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "All Activity", count: notifications.length },
            { id: "orders", label: "Orders & Escrow", count: notifications.filter(n => (n.event_type || "").includes("ORDER")).length },
            { id: "shipments", label: "Shipments & TCS", count: notifications.filter(n => (n.event_type || "").includes("SHIP")).length },
            { id: "settings", label: "Alert Settings", count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600 bg-primary-50/50"
                  : "border-transparent text-subtle hover:text-heading hover:bg-sidebar-hover"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === tab.id ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-700"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab !== "settings" && (
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterUnreadOnly
                ? "bg-rose-50 border-rose-200 text-rose-700 shadow-2xs"
                : "border-default text-subtle hover:text-heading"
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Unread Only</span>
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === "settings" ? (
        /* ================= ALERT PREFERENCES TAB ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Email Notification Settings */}
          <Card className="p-6 space-y-5 shadow-card border border-default">
            <div className="flex items-center gap-3 border-b border-default pb-4">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/50">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-heading">Email Notifications</h3>
                <p className="text-xs text-subtle">Manage transaction &amp; dispatch emails sent via Resend API</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold text-heading">
              <label className="flex items-center justify-between p-3 rounded-xl border border-default hover:bg-sidebar-hover cursor-pointer transition-colors">
                <div>
                  <span className="font-extrabold block">Instant Order Notifications</span>
                  <span className="text-subtle text-[11px]">Receive an email immediately when a customer places an order.</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.emailNewOrder}
                  onChange={(e) => setPrefs({ ...prefs, emailNewOrder: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-default hover:bg-sidebar-hover cursor-pointer transition-colors">
                <div>
                  <span className="font-extrabold block">Courier &amp; Tracking Alerts</span>
                  <span className="text-subtle text-[11px]">Receive status updates when TCS courier picks up or delivers shipments.</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.emailShipmentUpdate}
                  onChange={(e) => setPrefs({ ...prefs, emailShipmentUpdate: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-default hover:bg-sidebar-hover cursor-pointer transition-colors">
                <div>
                  <span className="font-extrabold block">Daily Summary Digest</span>
                  <span className="text-subtle text-[11px]">Daily recap of orders, revenue, and customer reviews at 8:00 PM.</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.emailDailyDigest}
                  onChange={(e) => setPrefs({ ...prefs, emailDailyDigest: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </label>
            </div>
          </Card>

          {/* In-App & Security Notifications */}
          <Card className="p-6 space-y-5 shadow-card border border-default">
            <div className="flex items-center gap-3 border-b border-default pb-4">
              <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200/50">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-heading">In-App &amp; Security Alerts</h3>
                <p className="text-xs text-subtle">Real-time browser notifications and escrow protections</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold text-heading">
              <label className="flex items-center justify-between p-3 rounded-xl border border-default hover:bg-sidebar-hover cursor-pointer transition-colors">
                <div>
                  <span className="font-extrabold block">Live Order Sound &amp; Banner</span>
                  <span className="text-subtle text-[11px]">Play audio alert and show instant badge on new incoming orders.</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.inAppSound}
                  onChange={(e) => setPrefs({ ...prefs, inAppSound: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-default hover:bg-sidebar-hover cursor-pointer transition-colors">
                <div>
                  <span className="font-extrabold block">Escrow Fund Release Notifications</span>
                  <span className="text-subtle text-[11px]">Get alerted when COD courier payment is cleared to your vendor wallet.</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.escrowAlerts}
                  onChange={(e) => setPrefs({ ...prefs, escrowAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-default hover:bg-sidebar-hover cursor-pointer transition-colors">
                <div>
                  <span className="font-extrabold block">SMS / WhatsApp Courier Sync</span>
                  <span className="text-subtle text-[11px]">Send automatic SMS notifications to buyers when parcel is out for delivery.</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.smsAlerts}
                  onChange={(e) => setPrefs({ ...prefs, smsAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </label>
            </div>
          </Card>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSavePreferences}
              disabled={isSavingPrefs}
              className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSavingPrefs ? "Saving..." : "Save Notification Preferences"}
            </button>
          </div>
        </div>
      ) : (
        /* ================= NOTIFICATION FEED LIST ================= */
        <div className="space-y-3 pt-2">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-subtle">Loading your notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => {
              const isUnread = !(item.is_read || item.read);
              const orderId = item.data?.orderNumber || item.data?.orderId;

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all flex items-start gap-4 shadow-xs ${
                    isUnread
                      ? "bg-primary-50/30 border-primary-200/80 hover:bg-primary-50/60 ring-1 ring-primary-300/40"
                      : "bg-card border-default hover:border-slate-300"
                  }`}
                >
                  {/* Icon */}
                  {getNotificationIcon(item.event_type)}

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-heading">{item.title}</h4>
                        {isUnread && (
                          <span className="px-2 py-0.2 rounded-full bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider">
                            New
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-subtle">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString([], {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : item.timestamp || "Just now"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-body leading-relaxed mt-1">
                      {item.message || item.description}
                    </p>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-default/60">
                      <div className="flex items-center gap-3">
                        {orderId && (
                          <Link
                            href="/orders"
                            className="text-xs font-extrabold text-primary-600 hover:text-primary-700 flex items-center gap-1 hover:underline"
                          >
                            <span>View in Orders ({orderId})</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {isUnread && (
                          <button
                            onClick={() => handleMarkSingleRead(item.id)}
                            className="p-1.5 rounded-lg text-subtle hover:text-emerald-600 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Mark as read"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Mark Read</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(item.id)}
                          className="p-1.5 rounded-lg text-subtle hover:text-rose-500 hover:bg-rose-50 text-xs cursor-pointer transition-colors"
                          title="Dismiss"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <Card className="py-16 text-center space-y-3 border-dashed border-2 border-default">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-subtle">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-heading">No notifications found</h3>
              <p className="text-xs sm:text-sm text-subtle max-w-sm mx-auto">
                {filterUnreadOnly
                  ? "You have caught up on all alerts! There are no unread notifications."
                  : "All real-time customer orders, TCS shipments, and system activities will appear here."}
              </p>
              {filterUnreadOnly && (
                <Button
                  onClick={() => setFilterUnreadOnly(false)}
                  className="mt-2 text-xs font-bold"
                >
                  Show All Notifications
                </Button>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
