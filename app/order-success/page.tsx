"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AccountHeader } from "@/components/account/AccountHeader";
import {
  CheckCircle2,
  Truck,
  Package,
  Copy,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Clock,
  MapPin,
} from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const orderNumber = searchParams.get("orderNumber") || "#ORD-8942";
  const trackingNumber = searchParams.get("tracking") || "TRX-48201948";

  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrder(data.order);
          }
        })
        .catch(() => {});
    }
  }, [orderId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      {/* Celebration Header */}
      <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-8 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-bold text-[#5c3d5c] uppercase tracking-wider">
            Order Confirmed & Booked
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight mt-1">
            Thank you for your order!
          </h1>
          <p className="text-xs text-[#5c3d5c] mt-1.5 max-w-md mx-auto leading-relaxed">
            Your order <strong className="text-black">{orderNumber}</strong> has been received by the vendor. Courier dispatch has been initiated with Trax Express.
          </p>
        </div>

        {/* Courier Waybill Card */}
        <div className="p-4 rounded-xl bg-gray-50 border border-[#5c3d5c]/20 max-w-md mx-auto flex items-center justify-between gap-4 text-xs">
          <div className="text-left space-y-0.5">
            <span className="text-[11px] text-[#5c3d5c]">Trax Express Waybill #</span>
            <p className="font-bold text-black text-sm">{trackingNumber}</p>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#5c3d5c]/20 bg-white hover:bg-gray-50 text-xs font-semibold text-black transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-[#5c3d5c]" />
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {orderId && (
            <Link
              href={`/account/orders/${orderId}/tracking`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] text-white text-xs font-bold transition-all shadow-xs"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Parcel</span>
            </Link>
          )}

          {orderId && (
            <Link
              href={`/account/orders/${orderId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#5c3d5c]/20 hover:bg-gray-50 text-black text-xs font-bold transition-colors"
            >
              <Package className="w-4 h-4 text-[#5c3d5c]" />
              <span>View Order Details</span>
            </Link>
          )}

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#5c3d5c] hover:text-[#3e2845] px-3 py-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Delivery Expectations */}
      <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-black">Estimated Delivery & Next Steps</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-[#5c3d5c]/10 bg-gray-50 space-y-1">
            <Clock className="w-4 h-4 text-[#3e2845]" />
            <p className="font-bold text-black pt-1">Estimated Arrival</p>
            <p className="text-[#5c3d5c] text-[11px]">2 - 4 Business Days anywhere across Pakistan</p>
          </div>

          <div className="p-4 rounded-xl border border-[#5c3d5c]/10 bg-gray-50 space-y-1">
            <Truck className="w-4 h-4 text-[#3e2845]" />
            <p className="font-bold text-black pt-1">Doorstep Inspection</p>
            <p className="text-[#5c3d5c] text-[11px]">Inspect package condition before paying COD cash to courier</p>
          </div>

          <div className="p-4 rounded-xl border border-[#5c3d5c]/10 bg-gray-50 space-y-1">
            <ShieldCheck className="w-4 h-4 text-[#3e2845]" />
            <p className="font-bold text-black pt-1">Escrow Protection</p>
            <p className="text-[#5c3d5c] text-[11px]">Direct vendor guarantee with 30-day risk-free exchange</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <AccountHeader />
      <Suspense fallback={<div className="text-center py-16 text-xs text-[#5c3d5c]">Loading confirmation...</div>}>
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}
