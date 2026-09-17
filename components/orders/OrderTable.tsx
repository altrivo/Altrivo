"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Order, OrderStatus, PaymentStatus } from "@/types/orders";
import { Badge, StatusPill, Button, EmptyState } from "@/components/shared";
import { ArrowRight, Check } from "lucide-react";

interface OrderTableProps {
  orders: Order[];
  realtimeNewOrders: Order[];
  onLoadRealtimeOrders: () => void;
  onViewOrderDetails: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  selectedOrderIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelectOrder: (orderId: string) => void;
}

const paymentStatusVariantMap: Record<PaymentStatus, "success" | "warning" | "error" | "info" | "gray"> = {
  paid: "success",
  pending: "warning",
  failed: "error",
  refunded: "info",
  cancelled: "gray",
  processing: "warning",
  partially_refunded: "info",
};

const deliveryStatusPillMap: Record<string, "todo" | "in-progress" | "in-review" | "done" | "blocked"> = {
  pending: "todo",
  processing: "in-progress",
  shipped: "in-review",
  delivered: "done",
  cancelled: "blocked",
  completed: "done",
  confirmed: "todo",
  packed: "in-progress",
  ready_to_ship: "in-progress",
};

function getInitials(name: string): string {
  if (!name) return "CU";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function OrderTable({
  orders,
  realtimeNewOrders,
  onLoadRealtimeOrders,
  onViewOrderDetails,
  onUpdateOrderStatus,
  selectedOrderIds,
  onToggleSelectAll,
  onToggleSelectOrder,
}: OrderTableProps) {
  const [mounted, setMounted] = useState(false);
  const [activeMenuOrderId, setActiveMenuOrderId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAllSelected = orders.length > 0 && selectedOrderIds.length === orders.length;

  return (
    <div className="rounded-2xl border border-default bg-card shadow-card overflow-hidden transition-all duration-normal">

      {/* Table Container */}
      <div className="overflow-x-auto min-h-[360px] pb-36">
        <table className="w-full text-left text-sm text-body">
          <thead className="bg-neutral-100 text-xs font-extrabold uppercase tracking-wider text-heading border-b border-default font-display">
            <tr>
              <th className="py-4 px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-strong text-primary-600 focus:ring-focus cursor-pointer h-4 w-4"
                />
              </th>
              <th className="py-4 px-4">Order #</th>
              <th className="py-4 px-4">Customer</th>
              <th className="py-4 px-4">Items</th>
              <th className="py-4 px-4">Total</th>
              <th className="py-4 px-4">Payment</th>
              <th className="py-4 px-4">Fulfillment</th>
              <th className="py-4 px-4">Date & Time</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default bg-card">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <EmptyState
                    title="No orders match your filter"
                    description="Try updating your search phrase, status selection, or date range."
                  />
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isSelected = selectedOrderIds.includes(order.id);
                const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

                return (
                  <tr
                    key={order.id}
                    className={`transition-colors duration-fast hover:bg-neutral-100/70 ${
                      order.isNew
                        ? "bg-accent-50 border-l-4 border-primary-500"
                        : isSelected
                        ? "bg-primary-50/50"
                        : ""
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectOrder(order.id)}
                        className="rounded border-strong text-primary-600 focus:ring-focus cursor-pointer h-4 w-4"
                      />
                    </td>

                    {/* Order # (Link to dedicated detail page) */}
                    <td className="py-4 px-4 font-extrabold text-heading font-mono text-sm">
                      <Link
                        href={`/orders/${order.id}`}
                        className="hover:text-primary-600 hover:underline flex items-center gap-1.5"
                      >
                        {order.orderNumber}
                        {order.isNew && (
                          <span className="rounded-full bg-accent-200 px-2 py-0.5 text-[10px] font-extrabold text-accent-900 tracking-wider">
                            NEW
                          </span>
                        )}
                      </Link>
                    </td>

                    {/* Customer Info with Avatar */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-extrabold text-xs shrink-0 border border-primary-300 shadow-xs">
                          {getInitials(order.customerName)}
                        </div>
                        <div>
                          <div className="font-bold text-heading text-sm">{order.customerName}</div>
                          <div className="text-xs font-semibold text-body">{order.customerEmail}</div>
                        </div>
                      </div>
                    </td>

                    {/* Items Count */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-neutral-200 px-2.5 py-1 text-xs font-extrabold text-heading border border-neutral-300">
                        {itemCount} item{itemCount > 1 ? "s" : ""}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4 font-extrabold text-heading font-mono text-base">
                      ${order.totalAmount.toFixed(2)}
                    </td>

                    {/* Payment Status & Method */}
                    <td className="py-4 px-4">
                      <Badge variant={paymentStatusVariantMap[order.paymentStatus]} size="md" className="font-extrabold">
                        {order.paymentStatus.toUpperCase()}
                      </Badge>
                      <div className="text-xs font-bold text-heading capitalize mt-1">
                        {order.paymentMethod.replace("_", " ")}
                      </div>
                    </td>

                    {/* Fulfillment Status */}
                    <td className="py-4 px-4">
                      <StatusPill status={deliveryStatusPillMap[order.deliveryStatus] || "todo"} className="font-bold" />
                      <div className="text-xs font-semibold text-body capitalize mt-1">
                        {order.deliveryMethod.replace("_", " ")}
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="py-4 px-4 text-xs whitespace-nowrap" suppressHydrationWarning>
                      <div className="font-extrabold text-heading" suppressHydrationWarning>
                        {mounted
                          ? new Date(order.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : new Date(order.createdAt).toISOString().split("T")[0]}
                      </div>
                      <div className="text-xs font-semibold text-body" suppressHydrationWarning>
                        {mounted
                          ? new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right relative">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewOrderDetails(order)}
                          className="px-3 py-1.5 text-xs font-extrabold border-strong cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>

                        {/* Status Update Menu Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenuOrderId(
                                activeMenuOrderId === order.id ? null : order.id
                              )
                            }
                            className="p-1.5 rounded-lg text-heading hover:text-primary-600 hover:bg-neutral-200 transition-colors border border-default"
                            title="Quick update status"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>

                          {activeMenuOrderId === order.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setActiveMenuOrderId(null)}
                              />
                              <div className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl border border-strong bg-card p-2 shadow-2xl z-50 text-left animate-scale-up">
                                <div className="px-3 py-1.5 mb-1 border-b border-default flex items-center justify-between">
                                  <p className="text-[11px] font-black uppercase text-heading tracking-wider">
                                    Set Delivery Status
                                  </p>
                                  <span className="text-[10px] text-body capitalize font-bold">
                                    ({order.deliveryStatus})
                                  </span>
                                </div>
                                {(["pending", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => {
                                      onUpdateOrderStatus(order.id, st);
                                      setActiveMenuOrderId(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-all capitalize font-bold flex items-center justify-between mb-0.5 cursor-pointer ${
                                      order.deliveryStatus === st
                                        ? "bg-primary-100 text-primary-900 font-black shadow-xs"
                                        : "text-heading hover:bg-neutral-100"
                                    }`}
                                  >
                                    <span>{st}</span>
                                    {order.deliveryStatus === st && (
                                      <Check className="w-3.5 h-3.5 text-primary-700" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
