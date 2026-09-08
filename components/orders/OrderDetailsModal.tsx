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

  const [activeTab, setActiveTab] = useState<"overview" | "lifecycle" | "events" | "notes" | "documents">("overview");

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
  const [courierName, setCourierName] = useState(order.carrier || "Trax Express Logistics");
  const [trackingNo, setTrackingNo] = useState(order.trackingNumber || "");

  // Document view mode
  const [docType, setDocType] = useState<"invoice" | "packingSlip">("invoice");

  const subtotal = order.subtotal || order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = order.discount_total || 0;
  const shipping = order.shipping_total || (order.deliveryMethod === "express" ? 25.0 : 0.0);
  const tax = order.tax_total || 0;
  const grandTotal = order.grand_total || order.totalAmount;

  const currentStatus = order.order_status || (order.deliveryStatus as OrderStatus) || "pending";

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesMessage(null);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorNote, internalNote }),
      });
      if (res.ok) {
        setNotesMessage("Notes saved successfully!");
        setTimeout(() => setNotesMessage(null), 3000);
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
        onUpdateStatus(order.id, "cancelled");
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

                <div className="p-4 rounded-xl border border-default bg-card space-y-2">
                  <h3 className="text-xs font-extrabold uppercase text-heading tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-primary-600" />
                    Delivery Destination & Courier
                  </h3>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-heading leading-relaxed">{order.shippingAddress}</p>
                    <div className="pt-1 flex items-center gap-2 text-body">
                      <span>Carrier: <strong className="text-heading">{order.carrier || "Trax Express"}</strong></span>
                      {order.trackingNumber && (
                        <span>• AWB: <strong className="text-heading font-mono">{order.trackingNumber}</strong></span>
                      )}
                    </div>
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
                      {order.items.map((it, idx) => (
                        <tr key={it.id || idx}>
                          <td className="py-3 px-3">
                            <span className="font-bold text-heading block">{it.name || it.product_name_snapshot}</span>
                          </td>
                          <td className="py-3 px-3 text-body font-mono">
                            {it.sku || it.product_sku_snapshot || "SKU-PK"} {it.variant ? `(${it.variant})` : ""}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-heading font-mono">{it.quantity}</td>
                          <td className="py-3 px-3 text-right font-bold text-heading font-mono">
                            ₨ {it.price.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-heading font-mono">
                            ₨ {(it.price * it.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="p-4 rounded-xl border border-default bg-card space-y-2 text-xs">
                <div className="flex justify-between font-medium text-body">
                  <span>Items Subtotal</span>
                  <span className="font-mono text-heading">₨ {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-medium text-emerald-600">
                    <span>Discount Deductions</span>
                    <span className="font-mono">-₨ {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-body">
                  <span>Shipping & Handling</span>
                  <span className="font-mono text-heading">₨ {shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t border-default pt-2.5 text-sm font-extrabold text-heading">
                  <span>Grand Total Authoritative</span>
                  <span className="font-mono text-xl text-primary-600">₨ {grandTotal.toLocaleString()}</span>
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
                      onClick={() => onUpdateStatus(order.id, "confirmed")}
                      className="font-bold gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Order & Verify Stock
                    </Button>
                  )}

                  {currentStatus === "confirmed" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onUpdateStatus(order.id, "processing")}
                      className="font-bold gap-1.5"
                    >
                      <PackageCheck className="w-4 h-4" />
                      Send to Warehouse Packaging
                    </Button>
                  )}

                  {currentStatus === "processing" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onUpdateStatus(order.id, "packed")}
                      className="font-bold gap-1.5"
                    >
                      <PackageCheck className="w-4 h-4" />
                      Mark Packed & Boxed
                    </Button>
                  )}

                  {currentStatus === "packed" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onUpdateStatus(order.id, "ready_to_ship")}
                      className="font-bold gap-1.5"
                    >
                      <Truck className="w-4 h-4" />
                      Ready for Courier Pickup
                    </Button>
                  )}

                  {currentStatus === "ready_to_ship" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onUpdateStatus(order.id, "shipped")}
                      className="font-bold gap-1.5"
                    >
                      <Send className="w-4 h-4" />
                      Dispatch with Courier
                    </Button>
                  )}

                  {currentStatus === "shipped" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onUpdateStatus(order.id, "delivered")}
                      className="font-bold gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Confirm Customer Doorstep Delivery
                    </Button>
                  )}

                  {currentStatus === "delivered" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onUpdateStatus(order.id, "completed")}
                      className="font-bold gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Complete Order & Close Escrow
                    </Button>
                  )}

                  {currentStatus !== "cancelled" && currentStatus !== "completed" && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onUpdateStatus(order.id, "cancelled")}
                      className="font-bold gap-1.5"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Cancel Order
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRefundDialog(true)}
                    className="font-bold gap-1.5"
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
                      <label className="font-bold text-heading block mb-1">Refund Amount (₨)</label>
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

                <Button variant="ghost" size="sm" onClick={() => window.print()} className="font-bold gap-1.5">
                  <Printer className="w-3.5 h-3.5" />
                  Print Document
                </Button>
              </div>

              {/* Printable Document Sheet */}
              <div className="p-6 rounded-xl border border-default bg-white text-black shadow-xs font-sans space-y-5 print:p-0 print:border-none">
                <div className="flex justify-between items-start border-b border-neutral-300 pb-4">
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight">DIGISHOP STORE</h1>
                    <p className="text-xs text-neutral-600">Official Merchant Tax Receipt</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-mono font-bold text-sm">
                      {docType === "invoice" ? `INV-${order.orderNumber}` : `PS-${order.orderNumber}`}
                    </p>
                    <p className="text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-neutral-500 uppercase block mb-1">Customer / Consignee:</span>
                    <p className="font-bold text-sm">{order.customerName}</p>
                    <p className="text-neutral-700">{order.customerEmail}</p>
                    <p className="font-mono">{order.customerPhone}</p>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-500 uppercase block mb-1">Shipping Destination:</span>
                    <p className="leading-relaxed">{order.shippingAddress}</p>
                    <p className="mt-1 font-bold">
                      Carrier: {order.carrier || "Trax Express"} ({order.trackingNumber || "Pending"})
                    </p>
                  </div>
                </div>

                {/* Document Items Table */}
                <table className="w-full text-left text-xs border border-neutral-200">
                  <thead className="bg-neutral-100 font-bold border-b border-neutral-200">
                    <tr>
                      <th className="p-2">Item Description</th>
                      <th className="p-2">SKU</th>
                      <th className="p-2 text-center">Qty</th>
                      {docType === "invoice" && (
                        <>
                          <th className="p-2 text-right">Price</th>
                          <th className="p-2 text-right">Total</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {order.items.map((i, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold">{i.name}</td>
                        <td className="p-2 font-mono text-neutral-600">{i.sku || "SKU-PK"}</td>
                        <td className="p-2 text-center font-bold font-mono">{i.quantity}</td>
                        {docType === "invoice" && (
                          <>
                            <td className="p-2 text-right font-mono">₨ {i.price.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono font-bold">
                              ₨ {(i.price * i.quantity).toLocaleString()}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {docType === "invoice" && (
                  <div className="border-t border-neutral-200 pt-3 flex justify-end text-xs">
                    <div className="w-64 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Subtotal:</span>
                        <span className="font-mono">₨ {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Shipping:</span>
                        <span className="font-mono">₨ {shipping.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-neutral-300 pt-1 font-extrabold text-sm">
                        <span>Total Paid ({order.paymentMethod.toUpperCase()}):</span>
                        <span className="font-mono">₨ {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
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
