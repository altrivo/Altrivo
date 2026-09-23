"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AccountNav } from "@/components/account/AccountNav";
import { Package, Heart, MapPin, ArrowRight, Truck, Clock, ShieldCheck, ShoppingBag } from "lucide-react";

export default function AccountOverviewPage() {
  const router = useRouter();
  const { customer, loading } = useCustomerAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  useEffect(() => {
    if (!loading && !customer) {
      router.push("/login?redirect=/account");
      return;
    }

    if (customer) {
      setFetchingOrders(true);
      fetch(`/api/customer/orders?customerId=${customer.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrders(data.orders || []);
          }
        })
        .catch(() => {})
        .finally(() => setFetchingOrders(false));
    }
  }, [customer, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <AccountHeader />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center text-xs text-[#5c3d5c]">
          Loading account...
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="min-h-screen bg-white text-black">
      <AccountHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <AccountNav />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Greeting Banner */}
            <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-[#5c3d5c] uppercase tracking-wider">
                  Store Customer Portal
                </span>
                <h1 className="text-2xl font-bold text-black tracking-tight mt-0.5">
                  Welcome back, {customer.name}!
                </h1>
                <p className="text-xs text-[#5c3d5c] mt-1">
                  Manage your recent purchases, view real-time courier tracking, and update your details.
                </p>
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3e2845] hover:bg-[#4b3254] text-white text-xs font-bold transition-all shrink-0 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-5 shadow-sm space-y-1">
                <div className="w-8 h-8 rounded-lg bg-[#3e2845]/10 text-[#3e2845] flex items-center justify-center mb-2">
                  <Package className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-[#5c3d5c]">Total Orders</p>
                <p className="text-2xl font-bold text-black">{orders.length}</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-5 shadow-sm space-y-1">
                <div className="w-8 h-8 rounded-lg bg-[#3e2845]/10 text-[#3e2845] flex items-center justify-center mb-2">
                  <Heart className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-[#5c3d5c]">Wishlist Items</p>
                <p className="text-2xl font-bold text-black">Saved</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-5 shadow-sm space-y-1">
                <div className="w-8 h-8 rounded-lg bg-[#3e2845]/10 text-[#3e2845] flex items-center justify-center mb-2">
                  <MapPin className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-[#5c3d5c]">Delivery Address</p>
                <p className="text-xs font-bold text-black truncate">{customer.phone || "Pakistan Standard"}</p>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-black">Recent Orders</h2>
                  <p className="text-xs text-[#5c3d5c]">Your latest store purchases and their fulfillment status</p>
                </div>
                {orders.length > 0 && (
                  <Link
                    href="/account/orders"
                    className="text-xs font-bold text-[#3e2845] hover:text-[#4b3254] flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {fetchingOrders ? (
                <div className="py-8 text-center text-xs text-[#5c3d5c]">Loading orders...</div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#5c3d5c]/20 rounded-xl space-y-3">
                  <Package className="w-10 h-10 text-[#5c3d5c]/40 mx-auto" />
                  <p className="text-xs font-semibold text-black">You haven&apos;t placed any orders yet.</p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3e2845] text-white text-xs font-bold"
                  >
                    <span>Start Browsing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-xl border border-[#5c3d5c]/15 hover:border-[#3e2845]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-black">{order.orderNumber}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#3e2845]/10 text-[#3e2845] uppercase">
                            {order.deliveryStatus || "Processing"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5c3d5c]">
                          Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 1} item(s)
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-black">
                          ₨ {Number(order.totalAmount || order.total || 0).toLocaleString()}
                        </span>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/account/orders/${order.id}/tracking`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3e2845]/10 hover:bg-[#3e2845]/20 text-[#3e2845] text-xs font-bold transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Track</span>
                          </Link>

                          <Link
                            href={`/account/orders/${order.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#5c3d5c]/20 hover:bg-gray-50 text-xs font-semibold text-black transition-colors"
                          >
                            <span>Details</span>
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
