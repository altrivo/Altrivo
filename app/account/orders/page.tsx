"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AccountNav } from "@/components/account/AccountNav";
import { Package, Truck, ArrowRight, Eye, AlertCircle, ShoppingBag } from "lucide-react";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { customer, loading } = useCustomerAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!loading && !customer) {
      router.push("/login?redirect=/account/orders");
      return;
    }

    if (customer) {
      setFetching(true);
      fetch(`/api/customer/orders?customerId=${customer.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrders(data.orders || []);
          }
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [customer, loading, router]);

  if (loading || !customer) {
    return (
      <div className="min-h-screen bg-white">
        <AccountHeader />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center text-xs text-[#5c3d5c]">
          Loading orders...
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.deliveryStatus === statusFilter;
  });

  return (
    <div className="min-h-screen bg-white text-black">
      <AccountHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <AccountNav />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-black">My Orders</h1>
                  <p className="text-xs text-[#5c3d5c] mt-0.5">
                    Track current parcels, check invoices, and review past purchases.
                  </p>
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 border border-[#5c3d5c]/10 text-xs">
                  {["all", "pending", "shipped", "delivered"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                        statusFilter === st
                          ? "bg-white text-[#3e2845] shadow-xs"
                          : "text-[#5c3d5c] hover:text-black"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {fetching ? (
                <div className="py-12 text-center text-xs text-[#5c3d5c]">Loading your orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#5c3d5c]/20 rounded-xl space-y-3">
                  <Package className="w-10 h-10 text-[#5c3d5c]/40 mx-auto" />
                  <p className="text-xs font-semibold text-black">No orders found in this category.</p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3e2845] text-white text-xs font-bold shadow-xs hover:bg-[#4b3254]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Browse Products</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-5 rounded-xl border border-[#5c3d5c]/20 hover:border-[#3e2845]/40 transition-colors space-y-3 bg-white"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#5c3d5c]/10">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-black">{order.orderNumber}</span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#3e2845]/10 text-[#3e2845] uppercase">
                            {order.deliveryStatus || "Processing"}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#5c3d5c]">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Items preview */}
                      <div className="space-y-1.5 text-xs">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-black">
                            <span className="truncate max-w-[280px] sm:max-w-md">
                              {item.name} {item.variant ? `(${item.variant})` : ""} × {item.quantity || 1}
                            </span>
                            <span className="font-semibold text-black shrink-0">
                              ₨ {Number(item.price || 0).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#5c3d5c]/10">
                        <div className="text-xs">
                          <span className="text-[#5c3d5c]">Total: </span>
                          <span className="font-bold text-black text-sm">
                            ₨ {Number(order.totalAmount || order.total || 0).toLocaleString()}
                          </span>
                          <span className="text-[11px] text-[#5c3d5c] ml-2">
                            via {order.paymentMethod?.toUpperCase() || "COD"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/account/orders/${order.id}/tracking`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] text-white text-xs font-bold transition-all shadow-xs"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Live Tracking</span>
                          </Link>

                          <Link
                            href={`/account/orders/${order.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#5c3d5c]/20 hover:bg-gray-50 text-xs font-semibold text-black transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#5c3d5c]" />
                            <span>View Details</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
