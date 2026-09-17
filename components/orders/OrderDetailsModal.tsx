"use client";

import React, { useState } from "react";
import { Order, OrderStatus } from "@/types/orders";
import { Badge, StatusPill, Button } from "@/components/shared";
import {
  FileText,
  Clock,
  MessageSquare,
  Printer,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  PackageCheck,
  Send,
  Building,
  User,
  Store,
  ArrowRight,
} from "lucide-react";

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus,
}: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <OrderDetailsModalContent
      order={order}
      onClose={onClose}
      onUpdateStatus={onUpdateStatus}
    />
  );
}

function OrderDetailsModalContent({
  order,
  onClose,
  onUpdateStatus,
}: {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "lifecycle" | "events" | "notes" | "documents">("overview");

  // Dynamic status state for instant lifecycle progression feedback
  const [localStatus, setLocalStatus] = useState<OrderStatus>(
    order.order_status || (order.deliveryStatus as OrderStatus) || "pending"
  );

  React.useEffect(() => {
    setLocalStatus(order.order_status || (order.deliveryStatus as OrderStatus) || "pending");
  }, [order.order_status, order.deliveryStatus]);

  // Notes state
  const [vendorNote, setVendorNote] = useState(order.vendor_note || "");
  const [internalNote, setInternalNote] = useState(order.internal_note || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesMessage, setNotesMessage] = useState<string | null>(null);

  // Refund state
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundAmount, setRefundAmount] = useState(order.totalAmount.toString());
  const [refundReason, setRefundReason] = useState("");
  const [processingRefund, setProcessingRefund] = useState(false);

  // Courier Tracking state
  const defaultAwb = order.trackingNumber || `TRX-${(order.orderNumber || order.order_number || "").replace(/[^0-9]/g, "").slice(-8) || "26633895"}`;
  const [courierName, setCourierName] = useState(order.carrier || "Trax Express Logistics");
  const [trackingNo, setTrackingNo] = useState(defaultAwb);
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const [trackingMsg, setTrackingMsg] = useState<string | null>(null);

  // Document view mode
  const [docType, setDocType] = useState<"invoice" | "packingSlip">("invoice");

  const subtotal = order.subtotal || order.items.reduce((sum, item) => sum + (item.price || item.unit_price || 0) * item.quantity, 0);
  const discount = order.discount_total || 0;
  const tax = order.tax_total || 0;
  const rawGrandTotal = order.grand_total || order.totalAmount || 0;

  // Authoritative, self-healing shipping calculation:
  // If grandTotal is known and positive, shipping is strictly grandTotal - subtotal + discount - tax
  let shipping = 0;
  if (rawGrandTotal > 0 && Math.abs(rawGrandTotal - subtotal) > 0.001) {
    shipping = Math.max(0, rawGrandTotal - subtotal + discount - tax);
  } else if (order.shipping_total !== undefined && Number(order.shipping_total) < 100) {
    shipping = Number(order.shipping_total);
  } else {
    shipping = subtotal >= 100 || subtotal === 0 ? 0.0 : 15.0;
  }

  const grandTotal = rawGrandTotal > 0 ? rawGrandTotal : Math.max(0, subtotal - discount + shipping + tax);

  const currentStatus = localStatus;

  const handleStatusTransition = (newStatus: OrderStatus) => {
    setLocalStatus(newStatus);
    onUpdateStatus(order.id, newStatus);
  };

  const handleSaveTracking = async () => {
    setIsUpdatingTracking(true);
    setTrackingMsg(null);
    try {
      // 1. Sync to local storage for storefront orders
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("storefront_customer_orders_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const updated = list.map((item: any) =>
                item.id === order.id ||
                item.orderNumber === order.orderNumber ||
                item.id === order.orderNumber ||
                item.orderNumber === order.id
                  ? {
                      ...item,
                      carrier: courierName,
                      courier_name: courierName,
                      trackingNumber: trackingNo,
                      tracking_number: trackingNo,
                      waybill_number: trackingNo,
                    }
                  : item
              );
              localStorage.setItem(key, JSON.stringify(updated));
            }
          }
        }
      }

      // 2. Sync to backend PATCH
      await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrier: courierName, trackingNumber: trackingNo }),
      });
      order.carrier = courierName;
      order.courier_name = courierName;
      order.trackingNumber = trackingNo;
      order.tracking_number = trackingNo;
      order.waybill_number = trackingNo;

      // 3. Broadcast to customer tabs and other vendor tabs
      try {
        const bc = new BroadcastChannel("vendor_orders_channel");
        bc.postMessage({
          type: "ORDER_TRACKING_UPDATED",
          orderId: order.id,
          orderNumber: order.orderNumber,
          carrier: courierName,
          trackingNumber: trackingNo,
        });
        bc.close();
      } catch (bcErr) {}

      setTrackingMsg("✓ Courier & tracking updated successfully!");
      setTimeout(() => setTrackingMsg(null), 3000);
    } catch (e) {
      setTrackingMsg("Failed to update tracking.");
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesMessage(null);
    try {
      // 1. Sync to local storage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("storefront_customer_orders_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const updated = list.map((item: any) =>
                item.id === order.id || item.orderNumber === order.orderNumber
                  ? { ...item, vendor_note: vendorNote, internal_note: internalNote }
                  : item
              );
              localStorage.setItem(key, JSON.stringify(updated));
            }
          }
        }
      }

      // 2. Sync to backend PATCH
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorNote, internalNote }),
      });
      order.vendor_note = vendorNote;
      order.internal_note = internalNote;
      if (res.ok) {
        setNotesMessage("✓ Notes saved and synced successfully!");
        setTimeout(() => setNotesMessage(null), 3500);
      } else {
        setNotesMessage("✓ Notes saved locally!");
        setTimeout(() => setNotesMessage(null), 3500);
      }
    } catch (e) {
      setNotesMessage("Failed to save notes.");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!refundAmount || !refundReason.trim()) return;
    setProcessingRefund(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(refundAmount),
          reason: refundReason,
        }),
      });
      if (res.ok) {
        setShowRefundDialog(false);
        handleStatusTransition("cancelled");
      }
    } catch (e) {
      console.error("Refund failed", e);
    } finally {
      setProcessingRefund(false);
    }
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-overlay backdrop-blur-xs transition-opacity duration-normal"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl rounded-2xl border border-strong bg-card shadow-modal z-modal max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-default bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-extrabold text-heading font-mono">
                {order.orderNumber || order.order_number}
              </h2>
              <Badge
                variant={
                  currentStatus === "delivered" || currentStatus === "completed"
                    ? "success"
                    : currentStatus === "cancelled"
                    ? "error"
                    : currentStatus === "shipped"
                    ? "info"
                    : "warning"
                }
                size="sm"
                className="font-bold uppercase tracking-wider"
              >
                {currentStatus.replace(/_/g, " ")}
              </Badge>
              {order.paymentMethod === "cod" && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                  COD Verified
                </span>
              )}
            </div>
            <p className="text-xs text-body font-semibold mt-0.5" suppressHydrationWarning>
              Created on {new Date(order.createdAt).toLocaleString()} • UUID: {order.id.slice(0, 8)}...
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab("documents");
                setTimeout(() => window.print(), 100);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-default bg-card text-xs font-bold text-heading hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-heading hover:bg-neutral-200 transition-colors border border-default cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-default px-5 bg-card overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-body hover:text-heading"
            }`}
          >
            Overview & Items
          </button>
          <button
            onClick={() => setActiveTab("lifecycle")}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "lifecycle"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-body hover:text-heading"
            }`}
          >
            Lifecycle & Actions
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "events"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-body hover:text-heading"
            }`}
          >
            <span>Audit Trail</span>
            {order.events && order.events.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 text-neutral-800">
                {order.events.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "notes"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-body hover:text-heading"
            }`}
          >
            Notes & Instructions
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "documents"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-body hover:text-heading"
            }`}
          >
            Invoice & Slip
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* 3 Identities Ownership Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-neutral-50 border border-default text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary-100 text-primary-700">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-body block">Store Scope</span>
                    <span className="font-bold text-heading font-mono">{order.store_id ? order.store_id.slice(0, 12) + "..." : "Default Store"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-body block">Vendor Identity</span>
                    <span className="font-bold text-heading font-mono">{order.vendor_id ? order.vendor_id.slice(0, 12) + "..." : "Current Vendor"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-body block">Customer Identity</span>
                    <span className="font-bold text-heading font-mono">{order.customer_id ? order.customer_id.slice(0, 12) + "..." : "Guest Buyer"}</span>
                  </div>
                </div>
              </div>

              {/* Multi-Status Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-default bg-card">
                  <span className="text-[10px] font-extrabold uppercase text-body block">Order Status</span>
                  <span className="text-xs font-bold text-heading capitalize mt-1 block">
                    {order.order_status || order.deliveryStatus}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-default bg-card">
                  <span className="text-[10px] font-extrabold uppercase text-body block">Payment Status</span>
                  <span className="text-xs font-bold text-heading capitalize mt-1 block">
                    {order.paymentStatus} ({order.paymentMethod.toUpperCase()})
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-default bg-card">
                  <span className="text-[10px] font-extrabold uppercase text-body block">Fulfillment</span>
                  <span className="text-xs font-bold text-heading capitalize mt-1 block">
                    {order.fulfillment_status || "Processing"}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-default bg-card">
                  <span className="text-[10px] font-extrabold uppercase text-body block">A2 Escrow</span>
                  <span className="text-xs font-bold text-heading capitalize mt-1 block">
                    {order.escrowStatus?.replace(/_/g, " ") || "Held in Escrow"}
                  </span>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-default bg-card space-y-2">
                  <h3 className="text-xs font-extrabold uppercase text-heading tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary-600" />
                    Customer Details
                  </h3>
                  <div className="text-xs space-y-1">
                    <p className="font-extrabold text-heading text-sm">{order.customerName}</p>
                    <p className="font-medium text-body">{order.customerEmail}</p>
                    <p className="font-mono text-heading font-bold">{order.customerPhone}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-default bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase text-heading tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-primary-600" />
                      Delivery Destination & Logistics
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Active Carrier
                    </span>
                  </div>
                  <div className="text-xs space-y-2">
                    <p className="font-bold text-heading leading-relaxed">{order.shippingAddress}</p>
                    <div className="pt-2 border-t border-default/70 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-body block mb-1">Carrier Provider</label>
                        <input
                          type="text"
                          value={courierName}
                          onChange={(e) => setCourierName(e.target.value)}
                          placeholder="e.g. Trax Express Logistics"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-default bg-neutral-50 text-xs font-bold text-heading focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-body block mb-1">Waybill Tracking (AWB)</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={trackingNo}
                            onChange={(e) => setTrackingNo(e.target.value)}
                            placeholder="e.g. TRX-26633895"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-default bg-neutral-50 text-xs font-mono font-bold text-heading focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={handleSaveTracking}
                            disabled={isUpdatingTracking}
                            className="px-2.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shrink-0 cursor-pointer disabled:opacity-50"
                          >
                            {isUpdatingTracking ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    </div>
                    {trackingMsg && (
                      <p className="text-[11px] font-bold text-emerald-700">{trackingMsg}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Itemized Snapshot Table */}
              <div>
                <h3 className="text-xs font-extrabold uppercase text-heading tracking-wider mb-2.5">
                  Itemized Order Line Items (Product Snapshots)
                </h3>
                <div className="rounded-xl border border-default overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-100 text-heading font-extrabold border-b border-default uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Item Snapshot</th>
                        <th className="py-2.5 px-3">SKU / Variant</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-default bg-card">
                      {order.items.map((it, idx) => {
                        const itemSku = it.sku || it.product_sku_snapshot || "SKU-ALT-001";
                        const itemPrice = Number(it.price || it.unit_price || 0);
                        return (
                          <tr key={it.id || idx}>
                            <td className="py-3 px-3">
                              <span className="font-bold text-heading block">{it.name || it.product_name_snapshot}</span>
                            </td>
                            <td className="py-3 px-3 text-body font-mono">
                              <span className="font-bold text-heading">{itemSku}</span> {it.variant ? `(${it.variant})` : ""}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-heading font-mono">{it.quantity}</td>
                            <td className="py-3 px-3 text-right font-bold text-heading font-mono">
                              ${itemPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-3 text-right font-extrabold text-heading font-mono">
                              ${(itemPrice * it.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="p-4 rounded-xl border border-default bg-card space-y-2 text-xs">
                <div className="flex justify-between font-medium text-body">
                  <span>Items Subtotal</span>
                  <span className="font-mono text-heading">
                    ${Number(subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-medium text-emerald-600">
                    <span>Discount Deductions</span>
                    <span className="font-mono">
                      -${Number(discount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-body">
                  <span>Shipping & Handling</span>
                  <span className="font-mono text-heading">
                    ${Number(shipping).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-default pt-2.5 text-sm font-extrabold text-heading">
                  <span>Grand Total Authoritative</span>
                  <span className="font-mono text-xl text-primary-600">
                    ${Number(grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIFECYCLE & STATE MACHINE ACTIONS */}
          {activeTab === "lifecycle" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-neutral-50 border border-default space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-heading tracking-wider">
                  Current Lifecycle Progression
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {[
                    "pending",
                    "confirmed",
                    "processing",
                    "packed",
                    "ready_to_ship",
                    "shipped",
                    "delivered",
                    "completed",
                  ].map((step, idx) => {
                    const isDone = [
                      "pending",
                      "confirmed",
                      "processing",
                      "packed",
                      "ready_to_ship",
                      "shipped",
                      "delivered",
                      "completed",
                    ].indexOf(currentStatus) >= idx;

                    const isCurrent = currentStatus === step;

                    return (
                      <div key={step} className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg font-extrabold uppercase text-[10px] ${
                            isCurrent
                              ? "bg-primary-600 text-white shadow-xs"
                              : isDone
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-neutral-200 text-neutral-600"
                          }`}
                        >
                          {step.replace(/_/g, " ")}
                        </span>
                        {idx < 7 && <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transition Action Buttons */}
              <div className="p-4 rounded-xl border border-default bg-card space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-heading tracking-wider">
                  Next Stage Actions
                </h3>

                <div className="flex flex-wrap gap-2.5">
                  {currentStatus === "pending" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusTransition("confirmed")}
                      className="font-bold gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Order & Verify Stock
                    </Button>
                  )}

                  {currentStatus === "confirmed" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusTransition("processing")}
                      className="font-bold gap-1.5 cursor-pointer"
                    >
                      <PackageCheck className="w-4 h-4" />
                      Send to Warehouse Packaging
                    </Button>
                  )}

                  {currentStatus === "processing" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusTransition("packed")}
                      className="font-bold gap-1.5 cursor-pointer"
                    >
                      <PackageCheck className="w-4 h-4" />
                      Mark Packed & Boxed
                    </Button>
                  )}

                  {currentStatus === "packed" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusTransition("ready_to_ship")}
                      className="font-bold gap-1.5 cursor-pointer"
                    >
                      <Truck className="w-4 h-4" />
                      Ready for Courier Pickup
                    </Button>
                  )}

                  {currentStatus === "ready_to_ship" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusTransition("shipped")}
                      className="font-bold gap-1.5 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Dispatch with Courier
                    </Button>
                  )}

                  {currentStatus === "shipped" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusTransition("delivered")}
                      className="font-bold gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Confirm Customer Doorstep Delivery
                    </Button>
                  )}

                  {currentStatus === "delivered" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusTransition("completed")}
                      className="font-bold gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Complete Order & Close Escrow
                    </Button>
                  )}

                  {currentStatus !== "cancelled" && currentStatus !== "completed" && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleStatusTransition("cancelled")}
                      className="font-bold gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Cancel Order
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRefundDialog(true)}
                    className="font-bold gap-1.5 cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4" />
                    Issue Refund
                  </Button>
                </div>
              </div>

              {/* Refund Dialog */}
              {showRefundDialog && (
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/60 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <DollarSign className="w-4 h-4" />
                    <span>Issue Escrow / COD Refund</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-heading block mb-1">Refund Amount ($)</label>
                      <input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-default bg-card font-mono text-heading"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-heading block mb-1">Reason for Refund</label>
                      <input
                        type="text"
                        placeholder="e.g. Customer returned, out of stock"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-default bg-card text-heading"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="ghost" size="sm" onClick={() => setShowRefundDialog(false)}>
                      Dismiss
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleProcessRefund}
                      disabled={processingRefund}
                      className="font-bold"
                    >
                      {processingRefund ? "Processing..." : "Confirm & Process Refund"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUDIT EVENTS LOG */}
          {activeTab === "events" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase text-heading tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary-600" />
                  Chronological Audit Trail
                </h3>
                <span className="text-xs text-body">Immutable system records</span>
              </div>

              {(!order.events || order.events.length === 0) && (!order.timeline || order.timeline.length === 0) ? (
                <div className="text-center py-8 text-xs text-body border border-dashed border-default rounded-xl">
                  No explicit audit events logged for this order yet.
                </div>
              ) : (
                <div className="relative border-l-2 border-primary-500/30 ml-3.5 space-y-5 py-2">
                  {(order.events && order.events.length > 0
                    ? order.events
                    : (order.timeline || []).map((t, idx) => ({
                        id: t.id || `ev-${idx}`,
                        order_id: order.id,
                        store_id: order.store_id || "store",
                        event_type: t.title.replace(/\s+/g, "_").toUpperCase(),
                        actor_type: "system",
                        message: t.description,
                        created_at: t.timestamp,
                      }))
                  ).map((ev: any, idx: number) => (
                    <div key={ev.id || idx} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary-600 border-2 border-white shadow-xs" />
                      <div className="p-3 rounded-xl border border-default bg-card shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-heading uppercase">
                            {ev.event_type?.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-body font-mono" suppressHydrationWarning>
                            {new Date(ev.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-body leading-relaxed">{ev.message}</p>
                        {ev.actor_type && (
                          <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md inline-block mt-1">
                            Actor: {ev.actor_type} {ev.actor_id ? `(${ev.actor_id.slice(0, 10)})` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTES & SUPPORT */}
          {activeTab === "notes" && (
            <div className="space-y-5 text-xs">
              {/* Customer Note */}
              <div className="p-4 rounded-xl bg-card border border-default space-y-1.5">
                <span className="font-extrabold text-heading uppercase tracking-wider block">
                  Customer Special Delivery Instructions
                </span>
                <p className="text-body italic">
                  {order.customer_note || order.notes || "No special instructions provided by customer."}
                </p>
              </div>

              {/* Vendor Note */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-heading uppercase tracking-wider block">
                  Vendor Notes (Visible to Store Staff)
                </label>
                <textarea
                  rows={3}
                  value={vendorNote}
                  onChange={(e) => setVendorNote(e.target.value)}
                  placeholder="Add packaging notes or verification details..."
                  className="w-full p-3 rounded-xl border border-default bg-card text-heading focus:border-focus focus:outline-none"
                />
              </div>

              {/* Internal Note */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-heading uppercase tracking-wider block">
                  Internal Auditing Note (Private)
                </label>
                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Private reconciliation or supplier notes..."
                  className="w-full p-3 rounded-xl border border-default bg-card text-heading focus:border-focus focus:outline-none"
                />
              </div>

              {notesMessage && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs">
                  {notesMessage}
                </div>
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="font-bold"
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </Button>
            </div>
          )}

          {/* TAB 5: INVOICE & PACKING SLIP */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDocType("invoice")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      docType === "invoice" ? "bg-primary-600 text-white" : "bg-neutral-100 text-heading"
                    }`}
                  >
                    Tax Invoice
                  </button>
                  <button
                    onClick={() => setDocType("packingSlip")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      docType === "packingSlip" ? "bg-primary-600 text-white" : "bg-neutral-100 text-heading"
                    }`}
                  >
                    Warehouse Packing Slip
                  </button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDocType("invoice");
                    setTimeout(() => window.print(), 80);
                  }}
                  className="font-bold gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Document
                </Button>
              </div>

              {/* Isolated Print Stylesheet for Clean 1-Page A4 Output */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  /* Hide background web page and all modals */
                  body * {
                    visibility: hidden !important;
                  }
                  /* Exclusively display the printable sheet */
                  #printable-invoice-slip, #printable-invoice-slip * {
                    visibility: visible !important;
                  }
                  #printable-invoice-slip {
                    position: fixed !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 24px 30px !important;
                    border: none !important;
                    box-shadow: none !important;
                    background: #ffffff !important;
                    color: #000000 !important;
                    z-index: 99999999 !important;
                  }
                  @page {
                    size: A4 portrait;
                    margin: 12mm;
                  }
                }
              `}} />

              {/* Printable Document Sheet */}
              <div
                id="printable-invoice-slip"
                className="p-6 sm:p-8 rounded-2xl border border-neutral-300 bg-white text-black shadow-xs font-sans space-y-6 print:p-0 print:border-none print:shadow-none"
              >
                <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-black text-white font-extrabold flex items-center justify-center text-sm font-display">
                        A
                      </div>
                      <h1 className="text-2xl font-black tracking-tight text-black font-display">ALTRIVO</h1>
                    </div>
                    <p className="text-xs font-bold text-neutral-600 mt-1 uppercase tracking-wider">
                      {docType === "invoice" ? "Official Merchant Tax Invoice & Order Slip" : "Warehouse Official Packing Slip"}
                    </p>
                    <p className="text-[11px] text-neutral-500">Altrivo Multi-Vendor Commerce Platform • Verified Merchant</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-mono font-extrabold text-sm text-black">
                      {docType === "invoice"
                        ? `INV-${order.orderNumber || order.order_number}`
                        : `PS-${order.orderNumber || order.order_number}`}
                    </p>
                    <p className="text-neutral-600 font-semibold mt-0.5" suppressHydrationWarning>
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                      Status: {(order.order_status || order.deliveryStatus || "confirmed").toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-xs">
                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-1">
                    <span className="font-extrabold text-neutral-500 uppercase text-[10px] block mb-1 tracking-wider">
                      Customer / Consignee:
                    </span>
                    <p className="font-extrabold text-sm text-black">{order.customerName}</p>
                    <p className="text-neutral-700 font-medium">{order.customerEmail}</p>
                    <p className="font-mono font-bold text-neutral-900">{order.customerPhone}</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-1">
                    <span className="font-extrabold text-neutral-500 uppercase text-[10px] block mb-1 tracking-wider">
                      Shipping Destination:
                    </span>
                    <p className="leading-relaxed font-semibold text-black">{order.shippingAddress}</p>
                    <p className="mt-1 pt-1 border-t border-neutral-200 font-bold text-neutral-800">
                      Carrier: {courierName || order.carrier || "Trax Express"} • AWB: <span className="font-mono">{trackingNo || order.trackingNumber || "Assigned on Dispatch"}</span>
                    </p>
                  </div>
                </div>

                {/* Document Items Table */}
                <table className="w-full text-left text-xs border border-neutral-300 rounded-lg overflow-hidden">
                  <thead className="bg-neutral-100 font-extrabold text-black border-b border-neutral-300 uppercase tracking-wider">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5">SKU / Code</th>
                      <th className="p-2.5 text-center">Qty</th>
                      {docType === "invoice" && (
                        <>
                          <th className="p-2.5 text-right">Unit Price</th>
                          <th className="p-2.5 text-right">Line Total</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {order.items.map((i, idx) => {
                      const itemSku = i.sku || i.product_sku_snapshot || "SKU-ALT-001";
                      const itemPrice = Number(i.price || i.unit_price || 0);
                      return (
                        <tr key={idx} className="even:bg-neutral-50/40">
                          <td className="p-2.5 font-bold text-black">
                            {i.name || i.product_name_snapshot}
                            {i.variant && <span className="text-[10px] text-neutral-500 block font-normal">{i.variant}</span>}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-neutral-700">{itemSku}</td>
                          <td className="p-2.5 text-center font-bold font-mono text-black">{i.quantity}</td>
                          {docType === "invoice" && (
                            <>
                              <td className="p-2.5 text-right font-mono text-neutral-800">
                                ${itemPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="p-2.5 text-right font-mono font-extrabold text-black">
                                ${(itemPrice * i.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {docType === "invoice" && (
                  <div className="border-t border-neutral-300 pt-3 flex justify-end text-xs">
                    <div className="w-72 space-y-1.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                      <div className="flex justify-between text-neutral-600 font-medium">
                        <span>Items Subtotal:</span>
                        <span className="font-mono text-black">
                          ${Number(subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span>Discount Applied:</span>
                          <span className="font-mono">
                            -${Number(discount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-neutral-600 font-medium">
                        <span>Shipping & Handling:</span>
                        <span className="font-mono text-black">
                          ${Number(shipping).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-neutral-300 pt-2 font-black text-sm text-black">
                        <span>Total Paid ({order.paymentMethod.toUpperCase()}):</span>
                        <span className="font-mono text-base">
                          ${Number(grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-neutral-200 flex justify-between items-center text-[10px] text-neutral-500">
                  <p>Thank you for choosing Altrivo. All products are guaranteed authentic & covered by buyer protection.</p>
                  <p className="font-mono font-bold">www.altrivo.com</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-default bg-neutral-50/50 flex items-center justify-between">
          <span className="text-xs text-body font-mono">
            Status: <strong className="text-heading capitalize">{currentStatus.replace(/_/g, " ")}</strong>
          </span>
          <Button variant="primary" size="sm" onClick={onClose} className="font-bold">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
