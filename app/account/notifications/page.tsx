"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AccountNav } from "@/components/account/AccountNav";
import {
  Bell,
  CheckCircle2,
  Mail,
  Smartphone,
  ShieldCheck,
  Package,
  Truck,
  Sparkles,
  AlertCircle,
  Save,
  Check,
} from "lucide-react";
import { Notification, NotificationPreferences } from "@/types/notifications";

export default function CustomerNotificationsPage() {
  const router = useRouter();
  const { customer, loading: authLoading } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<"notifications" | "preferences">("notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  // Notification Preferences State
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    id: "",
    user_id: "",
    email_order_updates: true,
    email_shipping_updates: true,
    email_marketing: false,
    email_security: true,
    in_app_orders: true,
    in_app_shipping: true,
    in_app_marketing: true,
    whatsapp_order_updates: true,
    whatsapp_cod: true,
    whatsapp_marketing: false,
    created_at: "",
    updated_at: "",
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push("/login?redirect=/account/notifications");
      return;
    }

    if (customer) {
      // 1. Fetch notifications
      fetch(`/api/notifications?userId=${customer.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingNotifs(false));

      // 2. Fetch preferences
      fetch(`/api/notifications/preferences?userId=${customer.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.preferences) {
            setPreferences(data.preferences);
          }
        })
        .catch(() => {});
    }
  }, [customer, authLoading, router]);

  const markAllRead = async () => {
    if (!customer) return;
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: customer.id, markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setSavingPrefs(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: customer.id,
          preferences,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPreferences(data.preferences);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
    } finally {
      setSavingPrefs(false);
    }
  };

  if (authLoading || !customer) {
    return (
      <div className="min-h-screen bg-white">
        <AccountHeader />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center text-xs text-[#5c3d5c]">
          Loading notifications...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <AccountHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <AccountNav />
          </div>

          <div className="lg:col-span-3 space-y-6">
            {/* Header & Tabs */}
            <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-black tracking-tight">Alerts & Notification Hub</h1>
                <p className="text-xs text-[#5c3d5c] mt-1">
                  Manage your real-time order tracking alerts, courier messages, and notification preferences.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-[#f8fafc] p-1 rounded-xl border border-[#5c3d5c]/20">
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "notifications"
                      ? "bg-[#3e2845] text-white shadow-xs"
                      : "text-[#5c3d5c] hover:text-black"
                  }`}
                >
                  Activity Feed {unreadCount > 0 && `(${unreadCount})`}
                </button>
                <button
                  onClick={() => setActiveTab("preferences")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "preferences"
                      ? "bg-[#3e2845] text-white shadow-xs"
                      : "text-[#5c3d5c] hover:text-black"
                  }`}
                >
                  Preferences
                </button>
              </div>
            </div>

            {/* TAB 1: NOTIFICATION FEED */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-[#5c3d5c]">
                    {unreadCount > 0 ? `${unreadCount} unread notification(s)` : "All caught up"}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-bold text-[#3e2845] hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {loadingNotifs ? (
                  <div className="p-12 text-center text-xs text-[#5c3d5c]">Loading alerts...</div>
                ) : notifications.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-12 text-center space-y-3">
                    <Bell className="w-8 h-8 text-[#5c3d5c]/40 mx-auto" />
                    <h3 className="text-sm font-bold text-black">No notifications yet</h3>
                    <p className="text-xs text-[#5c3d5c]">
                      Order confirmations, live courier tracking updates, and delivery alerts will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                          !item.is_read
                            ? "bg-[#3e2845]/5 border-[#3e2845]/30 shadow-xs"
                            : "bg-white border-[#5c3d5c]/20 hover:border-[#5c3d5c]/40"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#3e2845]/10 text-[#3e2845] flex items-center justify-center shrink-0 mt-0.5">
                          {item.event_type.includes("SHIP") || item.event_type.includes("DELIVER") ? (
                            <Truck className="w-4 h-4" />
                          ) : item.event_type.includes("ORDER") ? (
                            <Package className="w-4 h-4" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-black">{item.title}</h4>
                            <span className="text-[10px] text-[#5c3d5c] whitespace-nowrap">
                              {item.created_at
                                ? new Date(item.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Recent"}
                            </span>
                          </div>
                          <p className="text-xs text-[#5c3d5c] mt-1 leading-relaxed">{item.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PREFERENCES */}
            {activeTab === "preferences" && (
              <form onSubmit={handleSavePreferences} className="space-y-6">
                {saveSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your notification preferences have been saved successfully.</span>
                  </div>
                )}

                {/* Email Channel Settings */}
                <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#5c3d5c]/10">
                    <Mail className="w-4 h-4 text-[#3e2845]" />
                    <h3 className="text-sm font-bold text-black">Email Notifications</h3>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-xl border border-[#5c3d5c]/20 hover:bg-[#f8fafc] cursor-pointer">
                      <div>
                        <p className="text-xs font-bold text-black">Order & Payment Confirmations</p>
                        <p className="text-[11px] text-[#5c3d5c]">Receive receipts and invoice summaries upon purchase.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.email_order_updates}
                        onChange={(e) => setPreferences({ ...preferences, email_order_updates: e.target.checked })}
                        className="w-4 h-4 accent-[#3e2845] cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-[#5c3d5c]/20 hover:bg-[#f8fafc] cursor-pointer">
                      <div>
                        <p className="text-xs font-bold text-black">Live Courier Shipment Updates</p>
                        <p className="text-[11px] text-[#5c3d5c]">Get tracking links when your parcel is dispatched or out for delivery.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.email_shipping_updates}
                        onChange={(e) => setPreferences({ ...preferences, email_shipping_updates: e.target.checked })}
                        className="w-4 h-4 accent-[#3e2845] cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-[#5c3d5c]/20 hover:bg-[#f8fafc] cursor-pointer">
                      <div>
                        <p className="text-xs font-bold text-black">Promotional Offers & Newsletters</p>
                        <p className="text-[11px] text-[#5c3d5c]">Special discounts, restock alerts, and seasonal sales.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.email_marketing}
                        onChange={(e) => setPreferences({ ...preferences, email_marketing: e.target.checked })}
                        className="w-4 h-4 accent-[#3e2845] cursor-pointer"
                      />
                    </label>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-dashed border-[#5c3d5c]/20 opacity-80">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <p className="text-xs font-bold text-black">Security & Password Alerts</p>
                        </div>
                        <p className="text-[11px] text-[#5c3d5c]">Crucial security alerts (password resets, login verifications) cannot be turned off.</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Always On
                      </span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp & SMS Alerts */}
                <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#5c3d5c]/10">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-black">WhatsApp & SMS Instant Dispatch</h3>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-xl border border-[#5c3d5c]/20 hover:bg-[#f8fafc] cursor-pointer">
                      <div>
                        <p className="text-xs font-bold text-black">Cash on Delivery (COD) Verification</p>
                        <p className="text-[11px] text-[#5c3d5c]">Receive 1-click confirmation prompts before rider dispatch.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.whatsapp_cod}
                        onChange={(e) => setPreferences({ ...preferences, whatsapp_cod: e.target.checked })}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-[#5c3d5c]/20 hover:bg-[#f8fafc] cursor-pointer">
                      <div>
                        <p className="text-xs font-bold text-black">Courier Rider Out for Delivery</p>
                        <p className="text-[11px] text-[#5c3d5c]">Instant WhatsApp message with rider phone number on delivery day.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.whatsapp_order_updates}
                        onChange={(e) => setPreferences({ ...preferences, whatsapp_order_updates: e.target.checked })}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={savingPrefs}
                  className="w-full h-11 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingPrefs ? (
                    <span>Saving Preferences...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Notification Preferences</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
