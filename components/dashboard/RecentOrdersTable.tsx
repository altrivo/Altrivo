"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  Package,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { OrderItem } from "@/app/api/orders/recent/route";

export function RecentOrdersTable({
  vendorId,
  storeId,
  storeSlug,
}: {
  vendorId?: string;
  storeId?: string;
  storeSlug?: string;
} = {}) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async (pageNum: number, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }
      let url = `/api/orders/recent?page=${pageNum}&limit=5`;
      if (vendorId) url += `&vendorId=${encodeURIComponent(vendorId)}`;
      if (storeId) url += `&storeId=${encodeURIComponent(storeId)}`;
      if (storeSlug) url += `&storeSlug=${encodeURIComponent(storeSlug)}`;

      let backendOrders: OrderItem[] = [];
      let backendTotal = 0;

      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            backendOrders = data.orders;
            backendTotal = data.totalOrders || data.orders.length;
          }
        }
      } catch (e) {}

      // 2. Read local customer placed orders strictly for real-time responsiveness of THIS store
      let localOrders: OrderItem[] = [];
      try {
        if (storeId || storeSlug) {
          const validStoreIdentifiers = [
            storeId ? storeId.toLowerCase() : "",
            storeSlug ? storeSlug.toLowerCase() : "",
          ].filter(Boolean);

          const storeKeys: string[] = [];
          for (const ident of validStoreIdentifiers) {
            storeKeys.push(`storefront_customer_orders_${ident}`);
          }

          // Also match customer suffixed keys for this specific store
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i) || "";
            for (const ident of validStoreIdentifiers) {
              if (
                k === `storefront_customer_orders_${ident}` ||
                k.startsWith(`storefront_customer_orders_${ident}_`)
              ) {
                storeKeys.push(k);
              }
            }
          }

          const rawList: any[] = [];
          for (const key of Array.from(new Set(storeKeys))) {
            const raw = localStorage.getItem(key);
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  for (const item of parsed) {
                    const ordStore = (item.store_id || item.storeId || item.storeSlug || "").toLowerCase();
                    if (ordStore && validStoreIdentifiers.length > 0 && !validStoreIdentifiers.includes(ordStore)) {
                      continue;
                    }
                    rawList.push(item);
                  }
                }
              } catch {}
            }
          }

          localOrders = rawList.map((lo: any) => {
            const orderDate = new Date(lo.createdAt || lo.created_at || Date.now());
            const isToday = orderDate.toDateString() === new Date().toDateString();
            const isYesterday =
              orderDate.toDateString() ===
              new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

            let dateLabel = orderDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            if (isToday) dateLabel = "Today";
            else if (isYesterday) dateLabel = "Yesterday";

            const timeLabel = orderDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });

            const amtNumber = Number(lo.totalAmount || lo.total || lo.grand_total) || 0;

            let st: OrderItem["status"] = "Pending";
            const rawSt = (lo.deliveryStatus || lo.status || "pending").toLowerCase();
            if (rawSt === "processing" || rawSt === "confirmed") st = "Processing";
            else if (rawSt === "shipped") st = "Shipped";
            else if (rawSt === "delivered" || rawSt === "completed") st = "Delivered";
            else if (rawSt === "cancelled" || rawSt === "refunded") st = "Cancelled";

            return {
              id: String(lo.id || lo.orderNumber || ""),
              orderNumber: lo.orderNumber || lo.order_number || `#ORD-${String(lo.id).substring(0, 4).toUpperCase()}`,
              customerName: lo.customerName || lo.customer_name || "Customer",
              customerEmail: lo.customerEmail || lo.customer_email || "customer@example.com",
              amount: `$${amtNumber.toLocaleString()}`,
              rawAmount: amtNumber,
              currency: "$",
              status: st,
              itemsCount: lo.items?.length || 1,
              date: dateLabel,
              time: timeLabel,
            };
          });
        }
      } catch (e) {}

      // 3. Merge backend and local orders without duplicates (latest first)
      const mergedList: OrderItem[] = [...backendOrders];

      localOrders.forEach((lo) => {
        const loId = lo.id ? String(lo.id).toLowerCase() : "";
        const loNum = lo.orderNumber ? lo.orderNumber.toLowerCase() : "";

        // Check if this order is already in mergedList
        const existingIdx = mergedList.findIndex((m) => {
          const mId = m.id ? String(m.id).toLowerCase() : "";
          const mNum = m.orderNumber ? m.orderNumber.toLowerCase() : "";

          if (loId && mId && loId === mId) return true;
          if (loNum && mNum && loNum === mNum) return true;
          if (loId && mNum && (mNum.includes(loId.slice(0, 6)) || loId.includes(mNum.replace(/[^a-z0-9]/g, "")))) return true;
          if (mId && loNum && (loNum.includes(mId.slice(0, 6)) || mId.includes(loNum.replace(/[^a-z0-9]/g, "")))) return true;
          return false;
        });

        if (existingIdx !== -1) {
          const existing = mergedList[existingIdx];
          const bestOrderNumber =
            existing.orderNumber && !existing.orderNumber.startsWith("#ORD-")
              ? existing.orderNumber
              : lo.orderNumber || existing.orderNumber;
          mergedList[existingIdx] = {
            ...existing,
            orderNumber: bestOrderNumber,
            customerName: lo.customerName || existing.customerName,
            status: existing.status || lo.status,
          };
        } else {
          mergedList.push(lo);
        }
      });

      // 4. Strict deduplication pass by unique ID to guarantee NO two items share the same ID
      const finalUniqueOrders: OrderItem[] = [];
      const seenOrderIds = new Set<string>();

      for (const ord of mergedList) {
        const cleanId = ord.id ? String(ord.id) : (ord.orderNumber || `order-${finalUniqueOrders.length}`);
        if (!seenOrderIds.has(cleanId)) {
          seenOrderIds.add(cleanId);
          finalUniqueOrders.push({
            ...ord,
            id: cleanId,
          });
        }
      }

      const totalMerged = finalUniqueOrders.length;
      const startIndex = (pageNum - 1) * 5;
      const paginated = finalUniqueOrders.slice(startIndex, startIndex + 5);

      setOrders(paginated);
      setTotalOrders(totalMerged);
      setTotalPages(Math.max(1, Math.ceil(totalMerged / 5)));
    } catch (err) {
      console.error("Failed to fetch recent orders:", err);
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setPage(1);
  }, [storeId, storeSlug]);

  useEffect(() => {
    fetchOrders(page, true);

    // Quiet background refresh every 60s without UI reload
    const interval = setInterval(() => {
      fetchOrders(page, false);
    }, 60000);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("vendor_orders_channel");
      bc.onmessage = () => {
        fetchOrders(page, false);
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, [page, storeId, storeSlug, vendorId]);

  const getStatusBadge = (status: OrderItem["status"]) => {
    switch (status) {
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-accent-100 text-accent-800 border border-accent-300 shadow-2xs">
            <Clock className="w-3 h-3 text-accent-600 animate-pulse" />
            Processing
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-100 text-primary-800 border border-primary-300 shadow-2xs">
            <Package className="w-3 h-3 text-primary-600" />
            Shipped
          </span>
        );
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-success-50 text-success-700 border border-success-200 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-success-600" />
            Delivered
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-warning-50 text-warning-700 border border-warning-200 shadow-2xs">
            <AlertCircle className="w-3 h-3 text-warning-600" />
            Pending
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-error-50 text-error-700 border border-error-200 shadow-2xs">
            <XCircle className="w-3 h-3 text-error-600" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-default bg-card shadow-card overflow-hidden flex flex-col justify-between">
      {/* 3D Header with Equal Purple & Rose Pink Accent Styling */}
      <div className="p-4 sm:p-5 border-b border-default bg-gradient-to-r from-primary-900/10 via-accent-100/30 to-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 text-white flex items-center justify-center shadow-md">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-heading font-display leading-tight">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-subtle mt-0.5">
              Showing {orders.length} of {totalOrders} orders
            </p>
          </div>
        </div>

        <Link
          href="/orders"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-accent-300 bg-accent-50 hover:bg-accent-100 text-accent-900 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <span>View All Orders</span>
          <ExternalLink className="w-3.5 h-3.5 text-accent-700" />
        </Link>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-default text-subtle font-bold uppercase tracking-wider">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default font-medium text-heading">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="p-4"><div className="h-4 w-20 skeleton-bone" /></td>
                  <td className="p-4"><div className="h-4 w-32 skeleton-bone" /></td>
                  <td className="p-4"><div className="h-4 w-20 skeleton-bone" /></td>
                  <td className="p-4"><div className="h-5 w-24 rounded-full skeleton-bone" /></td>
                  <td className="p-4"><div className="h-4 w-16 skeleton-bone" /></td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-subtle mb-1">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-heading">No customer orders yet</p>
                    <p className="text-xs text-subtle leading-relaxed">
                      Once your store is live and customers place orders, real-time orders and statuses will be tracked here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order, idx) => (
                <tr
                  key={`${order.id}-${idx}`}
                  onClick={() => router.push(`/orders?id=${order.orderNumber}`)}
                  className="hover:bg-accent-50/40 transition-colors cursor-pointer group"
                >
                  <td className="p-4">
                    <span className="font-mono font-bold text-primary-700 group-hover:text-primary-900 group-hover:underline">
                      {order.orderNumber}
                    </span>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-bold text-heading">{order.customerName}</div>
                      <div className="text-[10px] text-subtle">{order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}</div>
                    </div>
                  </td>
                  <td className="p-4 font-extrabold text-heading">
                    {order.amount}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="p-4 text-subtle font-medium">
                    {order.date} <span className="text-[10px] block opacity-75">{order.time}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 sm:p-4 border-t border-default bg-muted/20 flex items-center justify-between">
        <span className="text-xs text-subtle font-medium">
          Page <strong className="text-heading">{page}</strong> of <strong className="text-heading">{totalPages}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || loading}
            className="px-3 py-1.5 rounded-xl border border-default bg-card hover:bg-sidebar-hover text-xs font-semibold text-heading shadow-2xs active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || loading}
            className="px-3 py-1.5 rounded-xl border border-default bg-card hover:bg-sidebar-hover text-xs font-semibold text-heading shadow-2xs active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
