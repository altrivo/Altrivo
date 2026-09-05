"use client";

import { Order, OrderStatus } from "@/types/orders";
import { Badge, StatusPill, Button } from "@/components/shared";

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

  const handlePrint = () => {
    window.print();
  };

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = order.deliveryMethod === "express" ? 25.0 : order.deliveryMethod === "international" ? 45.0 : 0.0;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-overlay backdrop-blur-xs transition-opacity duration-normal"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-strong bg-card p-6 shadow-modal z-modal space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up">
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-default pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-heading font-mono">
                {order.orderNumber}
              </h2>
              {order.isNew && (
                <Badge variant="accent" size="sm" className="font-extrabold">
                  Live Order
                </Badge>
              )}
            </div>
            <p className="text-xs font-bold text-heading mt-1" suppressHydrationWarning>
              Received on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-heading hover:bg-neutral-200 transition-colors border border-default"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Delivery Status Controller */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-100 p-4 border border-default">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase text-heading tracking-wider">
              Fulfillment Status:
            </span>
            <StatusPill
              status={
                order.deliveryStatus === "pending" ? "todo" :
                order.deliveryStatus === "processing" ? "in-progress" :
                order.deliveryStatus === "shipped" ? "in-review" :
                order.deliveryStatus === "delivered" ? "done" : "blocked"
              }
              className="font-bold"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-extrabold text-heading">Update Status:</label>
            <select
              value={order.deliveryStatus}
              onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
              className="rounded-xl border border-strong bg-card px-3 py-1.5 text-xs text-heading font-extrabold focus:border-focus focus:outline-none shadow-xs"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Customer & Shipping Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Customer info */}
          <div className="rounded-xl border border-default p-4 bg-card space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-heading tracking-wider mb-2">
              <svg className="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Information
            </div>
            <p className="text-base font-extrabold text-heading">{order.customerName}</p>
            <p className="text-xs text-heading font-bold font-mono">{order.customerEmail}</p>
            {order.customerPhone && (
              <p className="text-xs text-body font-bold font-mono">{order.customerPhone}</p>
            )}
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-default p-4 bg-card space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-heading tracking-wider mb-2">
              <svg className="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Delivery Destination
            </div>
            <p className="text-xs text-heading font-bold leading-relaxed">{order.shippingAddress}</p>
            <p className="text-xs text-body font-bold pt-1">
              Method: <span className="text-heading font-extrabold capitalize">{order.deliveryMethod.replace("_", " ")}</span>
            </p>
          </div>
        </div>

        {/* Itemized Order Items Table */}
        <div>
          <h3 className="text-xs font-extrabold uppercase text-heading tracking-wider mb-3">
            Itemized Breakdown
          </h3>
          <div className="rounded-xl border border-default overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 text-heading font-extrabold border-b border-default uppercase">
                <tr>
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default bg-card">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-3 font-extrabold text-heading">{item.name}</td>
                    <td className="py-3 px-3 text-center font-bold text-heading font-mono">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-bold text-heading font-mono">${item.price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-extrabold text-heading font-mono text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Payment Summary Calculation */}
        <div className="rounded-xl border border-default p-4 bg-card space-y-3">
          <div className="flex justify-between text-xs font-bold text-heading">
            <span>Items Subtotal</span>
            <span className="font-mono">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-heading">
            <span>Estimated Shipping</span>
            <span className="font-mono">${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-heading">
            <span>Tax (8%)</span>
            <span className="font-mono">${tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center border-t border-default pt-3">
            <div>
              <span className="text-xs font-extrabold uppercase text-heading block">Payment Method</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={
                  order.paymentStatus === "paid" ? "success" :
                  order.paymentStatus === "pending" ? "warning" :
                  order.paymentStatus === "failed" ? "error" : "info"
                } className="font-extrabold">
                  {order.paymentStatus.toUpperCase()}
                </Badge>
                <span className="text-xs text-heading capitalize font-extrabold">
                  via {order.paymentMethod.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-extrabold text-heading block">Grand Total</span>
              <div className="text-2xl font-extrabold text-heading font-mono">
                ${order.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Notes */}
        {order.notes && (
          <div className="rounded-xl bg-card-tint border border-default p-4 text-xs">
            <span className="font-extrabold text-heading">Customer Special Request: </span>
            <span className="text-heading font-semibold italic">{order.notes}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-default pt-4">
          <Button variant="ghost" size="sm" onClick={handlePrint} className="gap-1.5 font-bold border-strong">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Official Invoice
          </Button>

          <Button variant="primary" size="sm" onClick={onClose} className="font-bold">
            Close Window
          </Button>
        </div>
      </div>
    </div>
  );
}
