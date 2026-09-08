"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AccountNav } from "@/components/account/AccountNav";
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Building,
  Navigation,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const router = useRouter();
  const { customer, loading } = useCustomerAuth();

  const [order, setOrder] = useState<any | null>(null);
  const [tracking, setTracking] = useState<any | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !customer) {
      router.push(`/login?redirect=/account/orders/${orderId}/tracking`);
      return;
    }

    if (orderId) {
      fetch(`/api/customer/orders/${orderId}/tracking`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrder(data.order);
            setTracking(data.tracking);
          }
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [orderId, customer, loading, router]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-white">
        <AccountHeader />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center text-xs text-[#5c3d5c]">
          Fetching courier tracking...
        </div>
      </div>
    );
  }

  const steps = tracking?.steps || [];

  return (
    <div className="min-h-screen bg-white text-black">
      <AccountHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <AccountNav />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <Link
                href={`/account/orders/${orderId}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5c3d5c] hover:text-[#3e2845]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Order #{order?.orderNumber || orderId.slice(0, 8)}</span>
              </Link>

              <span className="text-xs font-bold text-black flex items-center gap-1">
                <Truck className="w-4 h-4 text-[#3e2845]" />
                <span>{tracking?.courierName || "Trax Express"}</span>
              </span>
            </div>

            {/* Tracking Status Card */}
            <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#5c3d5c]/10">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#5c3d5c] uppercase tracking-wider">
                    Courier Waybill Tracking
                  </span>
                  <h1 className="text-2xl font-bold text-black tracking-tight">
                    {tracking?.trackingNumber || `TRX-${orderId.slice(0, 8).toUpperCase()}`}
                  </h1>
                  <p className="text-xs text-[#5c3d5c]">
                    Estimated Delivery: <strong>{tracking?.estimatedDelivery || "2-4 Business Days"}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#3e2845] text-white text-xs font-bold capitalize">
                    {tracking?.status?.replace(/_/g, " ") || "In Transit"}
                  </span>
                </div>
              </div>

              {/* Courier Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-[#5c3d5c]/10 text-xs space-y-1">
                  <span className="text-[#5c3d5c] text-[11px]">Courier Partner</span>
                  <p className="font-bold text-black">{tracking?.courierName || "Trax Express Logistics"}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-[#5c3d5c]/10 text-xs space-y-1">
                  <span className="text-[#5c3d5c] text-[11px]">Delivery Location</span>
                  <p className="font-bold text-black truncate">{order?.shippingAddress || "Pakistan Address"}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-[#5c3d5c]/10 text-xs space-y-1">
                  <span className="text-[#5c3d5c] text-[11px]">Contact & WhatsApp Updates</span>
                  <p className="font-bold text-black">{order?.customerPhone || customer?.phone || "Active SMS Alert"}</p>
                </div>
              </div>
            </div>

            {/* Visual Tracking Timeline */}
            <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-black">Live Delivery Timeline</h2>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#5c3d5c]/20">
                {steps.map((step: any, index: number) => {
                  const isDone = step.completed;
                  return (
                    <div key={index} className="relative flex items-start gap-4">
                      {/* Step Indicator */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                          isDone
                            ? "bg-[#3e2845] border-[#3e2845] text-white"
                            : "bg-white border-[#5c3d5c]/30 text-gray-300"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <p className={`text-xs font-bold ${isDone ? "text-black" : "text-gray-400"}`}>
                            {step.title}
                          </p>
                          {step.timestamp && (
                            <span className="text-[11px] text-[#5c3d5c]">
                              {new Date(step.timestamp).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${isDone ? "text-[#5c3d5c]" : "text-gray-400"}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
