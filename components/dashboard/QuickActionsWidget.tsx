"use client";

import React from "react";
import Link from "next/link";
import {
  PlusCircle,
  Megaphone,
  Wallet,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";

export function QuickActionsWidget() {
  const quickActions = [
    {
      title: "Add Product",
      description: "Create new physical or digital listing",
      href: "/products?action=new",
      icon: PlusCircle,
      badge: undefined,
      buttonStyle:
        "bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white shadow-[0_4px_14px_rgba(196,122,142,0.4)] border border-accent-300/40",
      iconBg: "bg-accent-100/30 text-white",
    },
    {
      title: "Launch Ad Campaign",
      description: "Promote store on marketplace homepage",
      href: "/campaigns?action=new",
      icon: Megaphone,
      badge: undefined,
      buttonStyle:
        "bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 hover:brightness-110 text-white shadow-[0_4px_14px_rgba(105,72,115,0.4)] border border-primary-400/30",
      iconBg: "bg-white/20 text-white",
    },
    {
      title: "Top-Up Wallet",
      description: "Add balance for ad credits & shipping",
      href: "/wallet?action=topup",
      icon: Wallet,
      badge: undefined,
      buttonStyle:
        "bg-card/90 hover:bg-card border-2 border-accent-300 text-heading shadow-sm",
      iconBg: "bg-accent-100 text-accent-700",
    },
    {
      title: "WhatsApp Queries",
      description: "Customer inquiries waiting for reply",
      href: "/orders?action=whatsapp",
      icon: MessageCircle,
      badge: "5 new",
      buttonStyle:
        "bg-gradient-to-r from-success-600 to-success-700 hover:from-success-700 hover:to-success-800 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] border border-success-400/40",
      iconBg: "bg-white/20 text-white",
    },
  ];

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 shadow-xl border border-primary-800/40 flex flex-col justify-between space-y-5 relative overflow-hidden"
      style={{
        backgroundColor: "#3B2742",
        backgroundImage:
          "linear-gradient(145deg, #2C1C31 0%, #3B2742 45%, #482D4F 100%)",
        boxShadow:
          "0 20px 40px -15px rgba(59,39,66,0.5), 0 4px 10px rgba(0,0,0,0.15)",
      }}
    >
      {/* Gloss Ambient Accents */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-accent-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 rounded-full bg-primary-400/25 blur-2xl pointer-events-none" />

      {/* 3D Title Bar with Equal Purple & Rose Pink Accent */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-400 to-accent-500 text-white flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 fill-accent-100 text-accent-100" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white font-display leading-tight flex items-center gap-2">
              Quick Actions
            </h2>
            <p className="text-[11px] text-accent-200/80">Common vendor studio tasks</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-accent-200 text-primary-950 shadow-2xs">
          Fast Access
        </span>
      </div>

      {/* 4 Quick Action Buttons */}
      <div className="relative z-10 space-y-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className={`group flex items-center justify-between p-3.5 rounded-xl transition-all duration-fast active:scale-[0.98] cursor-pointer ${action.buttonStyle}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs ${action.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs truncate flex items-center gap-2">
                    <span>{action.title}</span>
                    {action.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-success-800 animate-pulse border border-white/40">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] opacity-85 truncate mt-0.5">
                    {action.description}
                  </p>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 opacity-75 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            </Link>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-accent-100/90 font-medium">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent-300" />
          Equal Purple & Pink Studio Tokens
        </span>
        <span className="font-bold text-white">V2 Ready</span>
      </div>
    </div>
  );
}
