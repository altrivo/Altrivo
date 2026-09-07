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
  Package,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  CreditCard,
  RotateCcw,
  AlertCircle,
  XCircle,
  MessageSquare,
  FileText,
} from "lucide-react";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const router = useRouter();
  const { customer, loading } = useCustomerAuth();

  const [order, setOrder] = useState<any | null>(null);
  const [fetching, setFetching] = useState(true);

  // Return modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("wrong_product");
  const [returnDescription, setReturnDescription] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);

  // Complaint modal state
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintSubject, setComplaintSubject] = useState("");
  const [complaintMessage, setComplaintMessage] = useState("");
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  // Cancel order state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!loading && !customer) {
      router.push(`/login?redirect=/account/orders/${orderId}`);
      return;
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, customer, loading, router]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (e) {
    } finally {
      setFetching(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "cancelled",
          actorType: "customer",
          actorId: customer?.id || "customer",
          reason: cancelReason || "Customer requested cancellation",
        }),
      });
      if (res.ok) {
        setShowCancelModal(false);
        fetchOrder();
      }
    } catch (e) {
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!order || !customer) return;
    setSubmittingReturn(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          reason: returnReason,
          description: returnDescription,
          items: order.items,
        }),
      });
      if (res.ok) {
        setReturnSuccess(true);
        setTimeout(() => {
          setShowReturnModal(false);
          setReturnSuccess(false);
          fetchOrder();
        }, 1800);
      }
    } catch (e) {
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleFileComplaint = async () => {
    if (!order || !customer || !complaintSubject.trim() || !complaintMessage.trim()) return;
    setSubmittingComplaint(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/complaint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          subject: complaintSubject,
          message: complaintMessage,
        }),
      });
      if (res.ok) {
        setComplaintSuccess(true);
        setTimeout(() => {
          setShowComplaintModal(false);
          setComplaintSuccess(false);
          fetchOrder();
        }, 1800);
      }
    } catch (e) {
    } finally {
      setSubmittingComplaint(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-white">
        <AccountHeader />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center text-xs text-[#5c3d5c]">
          Loading order details...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <AccountHeader />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center space-y-3">
          <p className="text-xs font-semibold text-black">Order not found.</p>
          <Link href="/account/orders" className="text-xs text-[#3e2845] font-bold hover:underline">
            Return to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = order.order_status || order.deliveryStatus || "pending";
  const canCancel = currentStatus === "pending" || currentStatus === "confirmed";
  const canReturn = currentStatus === "delivered" || currentStatus === "completed";

  return (
    <div className="min-h-screen bg-white text-black">
      <AccountHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <AccountNav />
          </div>

          <div className="lg:col-span-3 space-y-6">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5c3d5c] hover:text-[#3e2845]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to My Orders</span>
              </Link>

              <div className="flex items-center gap-2">
                {canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 bg-rose-50 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )}

                {canReturn && order.return_status === "none" && (
                  <button
                    onClick={() => setShowReturnModal(true)}
                    className="px-3 py-1.5 rounded-xl border border-[#3e2845]/30 text-[#3e2845] bg-[#3e2845]/5 text-xs font-bold hover:bg-[#3e2845]/10 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Request Return</span>
                  </button>
                )}

                <button
                  onClick={() => setShowComplaintModal(true)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:text-black text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Support / Complaint</span>
                </button>

                <Link
                  href={`/account/orders/${order.id}/tracking`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track Courier Parcel</span>
                </Link>
              </div>
            </div>

            {/* Return or Complaint Status Alert */}
            {order.return_status && order.return_status !== "none" && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-700" />
                  <span>Return Request Status: <strong>{order.return_status.toUpperCase()}</strong></span>
                </div>
                <span className="text-[11px] text-amber-800">Our customer team will contact you.</span>
              </div>
            )}

            {/* Order Header Summary */}
            <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#3e2845]/10 text-[#3e2845] uppercase">
                    {currentStatus.replace(/_/g, " ")}
                  </span>
                  {order.paymentMethod === "cod" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                      Cash on Delivery
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-black tracking-tight mt-1.5">
                  Order {order.orderNumber || order.order_number}
                </h1>
                <p className="text-xs text-[#5c3d5c] mt-0.5" suppressHydrationWarning>
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs text-[#5c3d5c]">Grand Total</p>
                <p className="text-2xl font-bold text-black">
                  ₨ {Number(order.totalAmount || order.grand_total || order.total || 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-[#5c3d5c]">
                  Payment: <strong className="text-black capitalize">{order.paymentStatus || "pending"}</strong> via {order.paymentMethod?.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-black flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#3e2845]" />
                Delivery Progress
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { key: "confirmed", label: "Order Confirmed" },
                  { key: "packed", label: "Packed & Ready" },
                  { key: "shipped", label: "Dispatched" },
                  { key: "delivered", label: "Delivered" },
                ].map((st, idx) => {
                  const currentIdx = ["pending", "confirmed", "processing", "packed", "ready_to_ship", "shipped", "delivered", "completed"].indexOf(currentStatus);
                  const stepTargetIdx = [1, 3, 5, 6][idx];
                  const isDone = currentIdx >= stepTargetIdx;

                  return (
                    <div
                      key={st.key}
                      className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                        isDone
                          ? "border-emerald-300 bg-emerald-50/50 text-emerald-900"
                          : "border-gray-200 bg-gray-50 text-gray-400"
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 mx-auto ${isDone ? "text-emerald-600" : "text-gray-300"}`} />
                      <span className="font-bold text-[11px] block">{st.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-black flex items-center justify-between">
                <span>Order Line Items</span>
                <span className="text-xs text-[#5c3d5c] font-normal">{order.items?.length || 0} product(s)</span>
              </h2>
              <div className="divide-y divide-[#5c3d5c]/10">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-black text-sm">{item.name || item.product_name_snapshot}</p>
                      {item.variant && <p className="text-[11px] text-[#5c3d5c]">{item.variant}</p>}
                      <p className="text-[11px] text-[#5c3d5c]">
                        Quantity: <strong>{item.quantity || 1}</strong> × ₨ {Number(item.price || item.unit_price || 0).toLocaleString()}
                      </p>
                    </div>
                    <span className="font-bold text-black text-sm">
                      ₨ {(Number(item.price || item.unit_price || 0) * Number(item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="pt-3 border-t border-[#5c3d5c]/10 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#5c3d5c]">
                  <span>Subtotal</span>
                  <span className="font-medium text-black">₨ {Number(order.subtotal || order.totalAmount).toLocaleString()}</span>
                </div>
                {order.discount_total > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Applied</span>
                    <span className="font-medium">-₨ {Number(order.discount_total).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#5c3d5c]">
                  <span>Shipping Fee</span>
                  <span className="font-medium text-black">₨ {Number(order.shipping_total || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-black font-bold pt-2 border-t border-[#5c3d5c]/10 text-sm">
                  <span>Grand Total</span>
                  <span>₨ {Number(order.totalAmount || order.grand_total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Shipping & Payment Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-5 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-black">
                  <MapPin className="w-4 h-4 text-[#3e2845]" />
                  <span>Delivery Address</span>
                </div>
                <p className="text-xs text-black font-semibold">{order.customerName}</p>
                <p className="text-xs text-[#5c3d5c] leading-relaxed">{order.shippingAddress || "Standard Pakistan Address"}</p>
                {order.customerPhone && (
                  <p className="text-xs text-[#5c3d5c]">Phone: {order.customerPhone}</p>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-5 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-black">
                  <CreditCard className="w-4 h-4 text-[#3e2845]" />
                  <span>Payment & Protection</span>
                </div>
                <p className="text-xs text-black font-semibold">
                  Method: {order.paymentMethod?.toUpperCase() || "COD"}
                </p>
                <p className="text-xs text-[#5c3d5c]">
                  Status: {order.paymentStatus === "paid" ? "Paid" : "Pending Doorstep Collection"}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-[#5c3d5c] pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3e2845]" />
                  <span>A2 Escrow Protection • 100% Genuine Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <h3 className="text-base font-bold text-black">Cancel Order</h3>
            <p className="text-xs text-gray-600">
              Are you sure you want to cancel order #{order.orderNumber}? This action cannot be reversed.
            </p>
            <div>
              <label className="text-xs font-bold text-black block mb-1">Reason for cancellation</label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Changed my mind, found alternative"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:border-[#3e2845] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center gap-2 text-[#3e2845]">
              <RotateCcw className="w-5 h-5" />
              <h3 className="text-base font-bold text-black">Request Item Return</h3>
            </div>
            {returnSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center">
                Return request submitted! Our merchant will contact you shortly.
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-600">
                  You can request a return within 7 days of delivery under DigiShop's Return Policy.
                </p>
                <div>
                  <label className="text-xs font-bold text-black block mb-1">Return Reason</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:border-[#3e2845] focus:outline-none"
                  >
                    <option value="wrong_product">Received wrong item</option>
                    <option value="damaged">Item arrived damaged or broken</option>
                    <option value="defective">Item defective / not working</option>
                    <option value="wrong_size">Incorrect size or variant</option>
                    <option value="not_as_expected">Product quality not as advertised</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-black block mb-1">Detailed Explanation</label>
                  <textarea
                    rows={3}
                    value={returnDescription}
                    onChange={(e) => setReturnDescription(e.target.value)}
                    placeholder="Provide details about the issue with photos/packaging notes..."
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:border-[#3e2845] focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowReturnModal(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleRequestReturn}
                    disabled={submittingReturn}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#3e2845] hover:bg-[#4b3254] disabled:opacity-50"
                  >
                    {submittingReturn ? "Submitting..." : "Submit Return Request"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Complaint / Support Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center gap-2 text-[#3e2845]">
              <MessageSquare className="w-5 h-5" />
              <h3 className="text-base font-bold text-black">Order Support & Complaint</h3>
            </div>
            {complaintSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center">
                Support ticket opened! Our customer resolution desk will review this promptly.
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-bold text-black block mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Courier delay, Missing package item"
                    value={complaintSubject}
                    onChange={(e) => setComplaintSubject(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:border-[#3e2845] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-black block mb-1">Message</label>
                  <textarea
                    rows={3}
                    value={complaintMessage}
                    onChange={(e) => setComplaintMessage(e.target.value)}
                    placeholder="Describe what happened so our support desk can resolve it..."
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:border-[#3e2845] focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowComplaintModal(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFileComplaint}
                    disabled={submittingComplaint || !complaintSubject || !complaintMessage}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#3e2845] hover:bg-[#4b3254] disabled:opacity-50"
                  >
                    {submittingComplaint ? "Sending..." : "Submit Ticket"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
