"use client";

import React, { useState } from "react";
import { NotificationSettings } from "@/lib/settings";

interface Props {
  notifications: NotificationSettings;
  onSave: (notifications: NotificationSettings) => void;
}

export function NotificationPreferencesTab({ notifications, onSave }: Props) {
  const [prefs, setPrefs] = useState<NotificationSettings>(notifications);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggle = (key: keyof NotificationSettings) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const ITEMS: { key: keyof NotificationSettings; title: string; desc: string; icon: string; tag: string }[] = [
    {
      key: "orderAlerts",
      title: "Instant Order Alerts",
      desc: "Receive real-time push notifications and emails whenever a customer places a new order.",
      icon: "🔔",
      tag: "Recommended",
    },
    {
      key: "lowStockWarnings",
      title: "Low Inventory & Stock Warnings",
      desc: "Get notified when any product inventory drops below 5 units so you never run out.",
      icon: "📦",
      tag: "Automated",
    },
    {
      key: "whatsAppForwards",
      title: "WhatsApp Order Forwards",
      desc: "Automatically send order confirmation receipts and tracking links directly to your WhatsApp.",
      icon: "💬",
      tag: "WhatsApp API",
    },
    {
      key: "campaignUpdates",
      title: "Promotions & Campaign Updates",
      desc: "Receive notices about platform discounts, flash sales, and seasonal marketing features.",
      icon: "📣",
      tag: "Growth",
    },
    {
      key: "marketingTips",
      title: "Weekly Store Insights & Growth Tips",
      desc: "Get personalized weekly summaries on conversion rates, revenue trends, and SEO recommendations.",
      icon: "💡",
      tag: "Analytics",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-success-50 border border-success-200 text-success-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <svg className="w-4 h-4 text-success-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Notification settings updated live!</span>
        </div>
      )}

      <div className="p-6 rounded-2xl bg-card border border-default shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
            Notification Preferences
          </h3>
          <p className="text-xs text-subtle mt-1">
            Choose how and when Altrivo notifies you about store activity, inventory, and customer messages.
          </p>
        </div>

        <div className="divide-y divide-default">
          {ITEMS.map((item) => {
            const active = prefs[item.key];
            return (
              <div key={item.key} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <span className="text-2xl mt-0.5">{item.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-heading">{item.title}</h4>
                      <span className="px-2 py-0.5 rounded bg-muted text-subtle text-[10px] font-semibold">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xs text-body mt-0.5 leading-relaxed max-w-xl">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => toggle(item.key)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    active ? "bg-primary-500" : "bg-neutral-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      active ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
