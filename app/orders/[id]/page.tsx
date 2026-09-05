"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Order, OrderStatus, PaymentStatus, EscrowStatus, TimelineEvent } from "@/types/orders";
import { INITIAL_ORDERS, getOrderById } from "@/utils/ordersMock";
import { printPackingSlip } from "@/utils/packingSlip";
import { VendorLayout } from "@/components/vendor/VendorLayout";
import { Badge, StatusPill, Button, Card } from "@/components/shared";

export default function OrderDetailPage() {
  const resolvedParams = useParams() as { id: string };
  const initialOrderData = getOrderById(resolvedParams.id) || INITIAL_ORDERS[0];

  const [order, setOrder] = useState<Order>(initialOrderData);

  // Modal dialog states
  const [showShipModal, setShowShipModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  // Form states for modals
  const [carrierInput, setCarrierInput] = useState(order.carrier || "FedEx Express");
  const [trackingInput, setTrackingInput] = useState(order.trackingNumber || `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`);
  const [cancelReason, setCancelReason] = useState("");
  const [refundReason, setRefundReason] = useState("Customer return request");

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. ACTION: Mark Shipped
  const handleConfirmShipment = () => {
    if (!trackingInput.trim()) {
      alert("Please enter a valid tracking number.");
      return;
    }

    const newEvent: TimelineEvent = {
      id: `t-${Date.now()}`,
      title: `Shipped via ${carrierInput}`,
      description: `Package handed to carrier. Tracking #: ${trackingInput}`,
      timestamp: new Date().toISOString(),
      step: "shipped",
      completed: true,
      current: true,
    };

    const updatedTimeline: TimelineEvent[] = (order.timeline || []).map((t: TimelineEvent) => ({ ...t, current: false }));
    updatedTimeline.push(newEvent);

    setOrder((prev) => ({
      ...prev,
      deliveryStatus: "shipped",
      carrier: carrierInput,
      trackingNumber: trackingInput,
      timeline: updatedTimeline,
    }));

    setShowShipModal(false);
    triggerToast(`🚚 Order ${order.orderNumber} marked as Shipped via ${carrierInput}!`);
  };

  // 2. ACTION: Cancel Order
  const handleConfirmCancel = () => {
    const newEvent: TimelineEvent = {
      id: `t-${Date.now()}`,
      title: "Order Cancelled",
      description: cancelReason ? `Reason: ${cancelReason}` : "Cancelled by vendor.",
      timestamp: new Date().toISOString(),
      step: "cancelled",
      completed: true,
      current: true,
    };

    const updatedTimeline: TimelineEvent[] = (order.timeline || []).map((t: TimelineEvent) => ({ ...t, current: false }));
    updatedTimeline.push(newEvent);

    setOrder((prev) => ({
      ...prev,
      deliveryStatus: "cancelled",
      timeline: updatedTimeline,
    }));

    setShowCancelModal(false);
    triggerToast(`⛔ Order ${order.orderNumber} has been cancelled.`);
  };

  // 3. ACTION: Issue Refund (Triggers A2 Escrow Release)
  const handleConfirmRefund = () => {
    const newEvent: TimelineEvent = {
      id: `t-${Date.now()}`,
      title: "Refund Issued & A2 Escrow Released",
      description: `Full refund of $${order.totalAmount.toFixed(2)} processed. A2 Escrow released funds to customer. Reason: ${refundReason || "Customer refund"}`,
      timestamp: new Date().toISOString(),
      step: "refunded",
      completed: true,
      current: true,
    };

    const updatedTimeline: TimelineEvent[] = (order.timeline || []).map((t: TimelineEvent) => ({ ...t, current: false }));
    updatedTimeline.push(newEvent);

    setOrder((prev) => ({
      ...prev,
      paymentStatus: "refunded",
      escrowStatus: "refunded_a2_escrow",
      deliveryStatus: "cancelled",
      timeline: updatedTimeline,
    }));

    setShowRefundModal(false);
    triggerToast(`💸 A2 Escrow Release Triggered! $${order.totalAmount.toFixed(2)} refunded to customer.`);
  };

  // 4. ACTION: Contact Customer via WhatsApp
  const handleContactWhatsApp = () => {
    const phone = (order.customerPhone || "+15552345678").replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hi ${order.customerName}, regarding your Altrio order ${order.orderNumber} for $${order.totalAmount.toFixed(2)}: `
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  // 5. ACTION: Print Packing Slip
  const handlePrintSlip = () => {
    printPackingSlip(order);
  };

  // Calculation helpers
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = order.deliveryMethod === "express" ? 25.0 : order.deliveryMethod === "international" ? 45.0 : 0.0;

  return (
    <VendorLayout>
      <div className="space-y-6 animate-fade-in pb-16">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-toast flex items-center gap-3 rounded-2xl border border-primary-300 bg-primary-50 px-5 py-3.5 shadow-modal animate-bounce">
            <span className="text-lg">📢</span>
            <span className="text-sm font-extrabold text-primary-950">{toastMessage}</span>
          </div>
        )}

        {/* Back Link & Header Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/orders"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-heading hover:text-primary-600 hover:underline mb-2"
            >
              ← Back to All Orders
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-heading font-mono tracking-tight">
                {order.orderNumber}
              </h1>
              <Badge variant={
                order.paymentStatus === "paid" ? "success" :
                order.paymentStatus === "pending" ? "warning" :
                order.paymentStatus === "failed" ? "error" : "info"
              } className="font-extrabold text-sm px-3 py-1">
                {order.paymentStatus.toUpperCase()}
              </Badge>
              <StatusPill status={
                order.deliveryStatus === "pending" ? "todo" :
                order.deliveryStatus === "processing" ? "in-progress" :
                order.deliveryStatus === "shipped" ? "in-review" :
                order.deliveryStatus === "delivered" ? "done" : "blocked"
              } className="font-extrabold" />
            </div>
            <p className="text-xs font-bold text-heading mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()} · Order ID: <span className="font-mono text-body">{order.id}</span>
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handlePrintSlip} className="font-bold border-strong">
              🖨️ Print Packing Slip
            </Button>

            <Button variant="ghost" size="sm" onClick={handleContactWhatsApp} className="font-bold border-strong text-success-700 hover:bg-success-50">
              💬 WhatsApp Customer
            </Button>

            {order.deliveryStatus !== "shipped" && order.deliveryStatus !== "delivered" && order.deliveryStatus !== "cancelled" && (
              <Button variant="primary" size="sm" onClick={() => setShowShipModal(true)} className="font-bold shadow-sm">
                🚚 Mark Shipped
              </Button>
            )}

            {order.paymentStatus === "paid" && (
              <Button variant="danger" size="sm" onClick={() => setShowRefundModal(true)} className="font-bold">
                💸 Issue Refund (A2 Escrow)
              </Button>
            )}

            {order.deliveryStatus !== "cancelled" && order.deliveryStatus !== "delivered" && (
              <Button variant="ghost" size="sm" onClick={() => setShowCancelModal(true)} className="font-bold text-error-700 hover:bg-error-50 border-error-200">
                ⛔ Cancel Order
              </Button>
            )}
          </div>
        </div>

        {/* Real Event Step Timeline */}
        <Card className="p-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-heading mb-6 font-display flex items-center gap-2">
            <span>⏱️ Order Event Timeline & Progress</span>
          </h2>

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-5 left-12 right-12 h-1 bg-neutral-200 -z-0" />

            {/* Timeline Steps */}
            {[
              { key: "paid", title: "Order Paid", desc: "Escrow Deposited" },
              { key: "confirmed", title: "Confirmed", desc: "Vendor Accepted" },
              { key: "shipped", title: "Shipped", desc: order.carrier || "In Transit" },
              { key: "delivered", title: "Delivered", desc: "Escrow Released" },
            ].map((step, idx) => {
              const isCompleted =
                step.key === "paid"
                  ? order.paymentStatus === "paid" || order.paymentStatus === "refunded"
                  : step.key === "confirmed"
                  ? order.deliveryStatus !== "pending"
                  : step.key === "shipped"
                  ? order.deliveryStatus === "shipped" || order.deliveryStatus === "delivered"
                  : order.deliveryStatus === "delivered";

              const isCurrent =
                step.key === "paid"
                  ? order.paymentStatus === "pending"
                  : step.key === "confirmed"
                  ? order.deliveryStatus === "processing"
                  : step.key === "shipped"
                  ? order.deliveryStatus === "shipped"
                  : order.deliveryStatus === "delivered";

              return (
                <div key={step.key} className="relative z-10 flex flex-row md:flex-col items-center gap-3 text-left md:text-center flex-1">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-extrabold text-sm border-2 transition-all ${
                      isCompleted
                        ? "bg-success-500 border-success-600 text-on-primary shadow-sm"
                        : isCurrent
                        ? "bg-primary-500 border-primary-600 text-on-primary animate-pulse"
                        : "bg-neutral-100 border-neutral-300 text-heading"
                    }`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </div>

                  <div>
                    <p className={`text-xs font-extrabold ${isCompleted || isCurrent ? "text-heading" : "text-body"}`}>
                      {step.title}
                    </p>
                    <p className="text-[11px] font-semibold text-body mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Detailed Log */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="mt-8 pt-6 border-t border-default space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-heading tracking-wider">Detailed Activity Log</h3>
              <div className="space-y-2">
                {order.timeline.map((evt) => (
                  <div key={evt.id} className="flex items-start justify-between rounded-xl bg-neutral-100 p-3 border border-default text-xs">
                    <div>
                      <span className="font-extrabold text-heading">{evt.title}</span>
                      <p className="font-semibold text-body mt-0.5">{evt.description}</p>
                    </div>
                    {evt.timestamp && (
                      <span className="font-mono font-bold text-heading whitespace-nowrap ml-4">
                        {new Date(evt.timestamp).toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Main Grid: 2 Columns */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column (2 Cols): Line Items & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Line Items Grid */}
            <Card className="p-6">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-heading mb-4 font-display flex items-center justify-between">
                <span>📦 Order Line Items ({order.items.length})</span>
                <span className="text-xs font-bold text-body font-mono">Currency: USD ($)</span>
              </h2>

              <div className="rounded-xl border border-default overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-heading font-extrabold border-b border-default uppercase">
                    <tr>
                      <th className="py-3.5 px-4">Item Details</th>
                      <th className="py-3.5 px-4 text-center">Qty</th>
                      <th className="py-3.5 px-4 text-right">Unit Price</th>
                      <th className="py-3.5 px-4 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default bg-card">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-800 flex items-center justify-center font-extrabold text-xs shrink-0 border border-primary-200">
                              🎨
                            </div>
                            <div>
                              <div className="font-extrabold text-heading text-sm">{item.name}</div>
                              <div className="text-xs font-bold text-body font-mono">SKU: {item.sku || "N/A"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center font-extrabold text-heading text-sm font-mono">
                          {item.quantity}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-heading font-mono text-sm">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-right font-extrabold text-heading font-mono text-base">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Payment Breakdown Card */}
            <Card className="p-6 space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-heading font-display">
                💳 Payment Breakdown & A2 Escrow Status
              </h2>

              <div className="space-y-2.5 text-xs font-bold text-heading">
                <div className="flex justify-between py-1 border-b border-default">
                  <span>Items Subtotal</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-default">
                  <span>Shipping Fee ({order.deliveryMethod.toUpperCase()})</span>
                  <span className="font-mono">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-default">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-mono">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-base font-extrabold text-heading border-b-2 border-default">
                  <span>Total Amount Paid</span>
                  <span className="font-mono">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* A2 Escrow Status Banner */}
              <div className="rounded-xl border border-primary-300 bg-primary-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-primary-950">A2 Escrow Protection:</span>
                  <Badge variant={
                    order.escrowStatus === "released_to_vendor" ? "success" :
                    order.escrowStatus === "refunded_a2_escrow" ? "error" : "warning"
                  } className="font-extrabold">
                    {order.escrowStatus === "released_to_vendor" ? "RELEASED TO VENDOR" :
                     order.escrowStatus === "refunded_a2_escrow" ? "REFUND RELEASED" : "HELD IN ESCROW"}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-primary-900 leading-relaxed">
                  {order.escrowStatus === "released_to_vendor"
                    ? "Funds have been released directly into your vendor account balance."
                    : order.escrowStatus === "refunded_a2_escrow"
                    ? "Refund processed. Funds returned to customer via A2 Escrow."
                    : "Payment is held securely in A2 Escrow until delivery is completed."}
                </p>
              </div>
            </Card>
          </div>

          {/* Right Column (1 Col): Customer Info & Tracking */}
          <div className="space-y-6">
            {/* Customer Info Card */}
            <Card className="p-6 space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-heading font-display flex items-center justify-between">
                <span>👤 Customer Details</span>
                <button onClick={handleContactWhatsApp} className="text-xs font-bold text-success-700 hover:underline">
                  WhatsApp →
                </button>
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-body block text-[11px] uppercase">Customer Name</span>
                  <span className="font-extrabold text-heading text-sm">{order.customerName}</span>
                </div>

                <div>
                  <span className="font-bold text-body block text-[11px] uppercase">Email Address</span>
                  <span className="font-bold text-heading font-mono">{order.customerEmail}</span>
                </div>

                <div>
                  <span className="font-bold text-body block text-[11px] uppercase">Phone Number</span>
                  <span className="font-bold text-heading font-mono">{order.customerPhone || "N/A"}</span>
                </div>

                <div className="pt-2 border-t border-default">
                  <span className="font-bold text-body block text-[11px] uppercase">Shipping Address</span>
                  <p className="font-extrabold text-heading leading-relaxed mt-0.5">{order.shippingAddress}</p>
                </div>

                {order.billingAddress && (
                  <div className="pt-2 border-t border-default">
                    <span className="font-bold text-body block text-[11px] uppercase">Billing Address</span>
                    <p className="font-semibold text-heading leading-relaxed mt-0.5">{order.billingAddress}</p>
                  </div>
                )}

                {order.notes && (
                  <div className="pt-2 border-t border-default bg-card-tint p-3 rounded-lg">
                    <span className="font-extrabold text-heading block">Customer Note:</span>
                    <p className="font-semibold text-heading italic mt-1">{order.notes}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Delivery Tracking Card */}
            <Card className="p-6 space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-heading font-display">
                📍 Delivery Tracking
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-body block text-[11px] uppercase">Carrier</span>
                  <span className="font-extrabold text-heading text-sm">{order.carrier || "FedEx Express"}</span>
                </div>

                <div>
                  <span className="font-bold text-body block text-[11px] uppercase">Tracking Number</span>
                  <span className="font-extrabold text-heading font-mono text-sm block mt-0.5">
                    {order.trackingNumber || "Not assigned yet"}
                  </span>
                </div>

                <div>
                  <span className="font-bold text-body block text-[11px] uppercase">Estimated Delivery</span>
                  <span className="font-extrabold text-heading font-mono">
                    {order.estimatedDeliveryDate
                      ? new Date(order.estimatedDeliveryDate).toLocaleDateString()
                      : "2-4 Business Days"}
                  </span>
                </div>

                {order.trackingNumber && (
                  <div className="pt-2 border-t border-default">
                    <a
                      href={`https://www.google.com/search?q=${order.carrier || "FedEx"}+${order.trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-200 px-3 py-2 text-xs font-extrabold text-heading border border-strong hover:bg-neutral-300 transition-colors w-full justify-center"
                    >
                      <span>🔍 Live Carrier Tracking Page</span>
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* --- MODAL DIALOGS --- */}

        {/* 1. Mark Shipped Modal */}
        {showShipModal && (
          <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-overlay backdrop-blur-xs" onClick={() => setShowShipModal(false)} />
            <div className="relative w-full max-w-md rounded-2xl border border-strong bg-card p-6 shadow-modal z-modal space-y-4">
              <h3 className="text-lg font-extrabold text-heading font-display">Mark Order as Shipped</h3>
              <p className="text-xs font-semibold text-body">
                Enter shipment details to update status and notify customer.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-heading mb-1">Carrier Name</label>
                  <input
                    type="text"
                    value={carrierInput}
                    onChange={(e) => setCarrierInput(e.target.value)}
                    placeholder="e.g. FedEx Express, DHL, UPS"
                    className="w-full rounded-xl border border-default bg-input px-3 py-2 font-semibold text-heading focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-heading mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="e.g. TRK-984712035"
                    className="w-full rounded-xl border border-default bg-input px-3 py-2 font-mono font-semibold text-heading focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowShipModal(false)} className="font-bold">
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleConfirmShipment} className="font-bold">
                  Confirm Shipment
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Cancel Order Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-overlay backdrop-blur-xs" onClick={() => setShowCancelModal(false)} />
            <div className="relative w-full max-w-md rounded-2xl border border-strong bg-card p-6 shadow-modal z-modal space-y-4">
              <h3 className="text-lg font-extrabold text-error-700 font-display">Cancel Order</h3>
              <p className="text-xs font-semibold text-body">
                Are you sure you want to cancel order {order.orderNumber}?
              </p>

              <div>
                <label className="block text-xs font-bold text-heading mb-1">Cancellation Reason</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Provide reason for cancellation..."
                  className="w-full rounded-xl border border-default bg-input p-3 text-xs font-semibold text-heading focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowCancelModal(false)} className="font-bold">
                  Keep Order
                </Button>
                <Button variant="danger" size="sm" onClick={handleConfirmCancel} className="font-bold">
                  Confirm Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Issue Refund (A2 Escrow Release) Modal */}
        {showRefundModal && (
          <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-overlay backdrop-blur-xs" onClick={() => setShowRefundModal(false)} />
            <div className="relative w-full max-w-md rounded-2xl border border-strong bg-card p-6 shadow-modal z-modal space-y-4">
              <h3 className="text-lg font-extrabold text-error-700 font-display">Issue Refund & Release Escrow</h3>
              <div className="rounded-xl bg-error-50 border border-error-200 p-3 text-xs font-bold text-error-800">
                ⚠️ Warning: This action will trigger A2 Escrow Release to return ${order.totalAmount.toFixed(2)} to the customer.
              </div>

              <div>
                <label className="block text-xs font-bold text-heading mb-1">Refund Note / Reason</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full rounded-xl border border-default bg-input px-3 py-2 text-xs font-semibold text-heading focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowRefundModal(false)} className="font-bold">
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={handleConfirmRefund} className="font-bold">
                  Trigger A2 Refund
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
