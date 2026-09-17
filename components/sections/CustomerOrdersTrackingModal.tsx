"use client";



import React, { useState, useEffect, useRef } from "react";

import { 

  X, 

  Package, 

  Search, 

  Truck, 

  CheckCircle2, 

  Clock, 

  MapPin, 

  ShieldCheck, 

  ExternalLink, 

  ChevronRight, 

  ArrowLeft,

  ShoppingBag,

  MessageCircle,

  Copy,

  Check

} from "lucide-react";

import { useCart } from "./CartContext";

import { Order, OrderStatus } from "@/types/orders";



export interface CustomerOrdersTrackingModalProps {

  isOpen: boolean;

  onClose: () => void;

  initialOrderNumber?: string;

  storeName?: string;

}



export default function CustomerOrdersTrackingModal({

  isOpen,

  onClose,

  initialOrderNumber = "",

  storeName = "Artisanal Store",

}: CustomerOrdersTrackingModalProps) {

  const { storeId, customer, setIsCustomerAuthOpen } = useCart();

  const [activeTab, setActiveTab] = useState<"my_orders" | "search_tracking">(
    initialOrderNumber ? "search_tracking" : "my_orders"
  );

  const [searchQuery, setSearchQuery] = useState(initialOrderNumber);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [ordersList, setOrdersList] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [copiedTracking, setCopiedTracking] = useState(false);

  const selectedOrderRef = useRef<any>(null);
  useEffect(() => {
    selectedOrderRef.current = selectedOrder;
  }, [selectedOrder]);

  const ordersListRef = useRef<any[]>([]);
  useEffect(() => {
    ordersListRef.current = ordersList;
  }, [ordersList]);



  // Load customer's local and backend orders on modal open

  useEffect(() => {
    if (!isOpen) return;

    if (initialOrderNumber) {
      setActiveTab("search_tracking");
      setSearchQuery(initialOrderNumber);
    }

    const loadOrders = async () => {
      try {
        // 1. Fetch from backend API scoped to customer / store
        const queryParams = new URLSearchParams({ limit: "50" });
        if (storeId) queryParams.set("storeId", storeId);
        if (customer?.email) queryParams.set("customerEmail", customer.email);
        if (customer?.id) queryParams.set("customerId", customer.id);

        const res = await fetch(`/api/orders?${queryParams.toString()}`);
        let backendOrders: any[] = [];
        if (res.ok) {
          const data = await res.json();
          if (data.orders && Array.isArray(data.orders)) {
            backendOrders = data.orders;
          }
        }

        // 2. Read local stored orders across all storefront_customer_orders_* keys
        const customerPlacedOrders: any[] = [];
        if (typeof window !== "undefined") {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith("storefront_customer_orders_")) {
              try {
                const raw = localStorage.getItem(k);
                if (raw) {
                  const list = JSON.parse(raw);
                  if (Array.isArray(list)) {
                    list.forEach((ord: any) => {
                      if (
                        ord &&
                        !customerPlacedOrders.some(
                          (co) => co.id === ord.id || (ord.orderNumber && co.orderNumber === ord.orderNumber)
                        )
                      ) {
                        customerPlacedOrders.push(ord);
                      }
                    });
                  }
                }
              } catch (e) {}
            }
          }
        }

        // Merge orders with latest backend status
        let combined: any[] = [];

        if (customer) {
          const customerEmailClean = customer.email?.toLowerCase().trim();
          const customerId = customer.id;

          const filteredBackend = backendOrders.filter((bo) => {
            const matchId = bo.customer_id && bo.customer_id === customerId;
            const matchEmail = bo.customerEmail && bo.customerEmail.toLowerCase().trim() === customerEmailClean;
            return matchId || matchEmail;
          });

          const filteredLocal = customerPlacedOrders.filter((co: any) => {
            const matchId = co.customer_id && co.customer_id === customerId;
            const matchEmail = co.customerEmail && co.customerEmail.toLowerCase().trim() === customerEmailClean;
            return matchId || matchEmail;
          });

          const mergedLocal = filteredLocal.map((co: any) => {
            const match = filteredBackend.find(
              (bo: any) => bo.id === co.id || bo.orderNumber === co.orderNumber
            );
            return match
              ? {
                  ...co,
                  deliveryStatus: match.deliveryStatus || match.delivery_status || co.deliveryStatus,
                  delivery_status: match.deliveryStatus || match.delivery_status || co.delivery_status,
                  order_status: match.order_status || match.deliveryStatus || co.order_status,
                  paymentStatus: match.paymentStatus || co.paymentStatus,
                  payment_method: match.payment_method || co.payment_method || co.paymentMethod,
                  escrowStatus: match.escrowStatus || co.escrowStatus,
                  timeline: match.timeline || co.timeline,
                  carrier: match.carrier || match.courier_name || co.carrier,
                  courier_name: match.courier_name || match.carrier || co.courier_name,
                  trackingNumber: match.trackingNumber || match.tracking_number || match.waybill_number || co.trackingNumber,
                  tracking_number: match.tracking_number || match.trackingNumber || co.tracking_number,
                  waybill_number: match.waybill_number || match.trackingNumber || co.waybill_number,
                }
              : co;
          });

          combined = [...mergedLocal];
          filteredBackend.forEach((bo: any) => {
            if (!combined.some((co: any) => co.id === bo.id || co.orderNumber === bo.orderNumber)) {
              combined.push(bo);
            }
          });
        } else {
          // If guest, show orders placed in this browser session, merged with backend updates
          const mergedGuest = customerPlacedOrders.map((co: any) => {
            const match = backendOrders.find(
              (bo: any) => bo.id === co.id || bo.orderNumber === co.orderNumber
            );
            return match
              ? {
                  ...co,
                  deliveryStatus: match.deliveryStatus || match.delivery_status || co.deliveryStatus,
                  delivery_status: match.deliveryStatus || match.delivery_status || co.delivery_status,
                  order_status: match.order_status || match.deliveryStatus || co.order_status,
                  paymentStatus: match.paymentStatus || co.paymentStatus,
                  payment_method: match.payment_method || co.payment_method || co.paymentMethod,
                  escrowStatus: match.escrowStatus || co.escrowStatus,
                  timeline: match.timeline || co.timeline,
                  carrier: match.carrier || match.courier_name || co.carrier,
                  courier_name: match.courier_name || match.carrier || co.courier_name,
                  trackingNumber: match.trackingNumber || match.tracking_number || match.waybill_number || co.trackingNumber,
                  tracking_number: match.tracking_number || match.trackingNumber || co.tracking_number,
                  waybill_number: match.waybill_number || match.trackingNumber || co.waybill_number,
                }
              : co;
          });

          combined = [...mergedGuest];
          backendOrders.forEach((bo: any) => {
            if (!combined.some((co: any) => co.id === bo.id || co.orderNumber === bo.orderNumber)) {
              combined.push(bo);
            }
          });
        }

        // Strictly sort by latest date descending
        combined.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrdersList(combined);

        // Keep active selected order updated with latest status
        setSelectedOrder((prev: any) => {
          if (!prev) return null;
          const fresh = combined.find(
            (o: any) =>
              o.id === prev.id ||
              o.orderNumber === prev.orderNumber ||
              (prev.orderNumber && (o.id === prev.orderNumber || o.orderNumber === prev.orderNumber)) ||
              (prev.id && (o.id === prev.id || o.orderNumber === prev.id))
          );
          return fresh ? { ...prev, ...fresh } : prev;
        });

        // Authoritative single order fetch for selected order or initialOrderNumber
        const activeOrderToSync = selectedOrderRef.current || (initialOrderNumber ? { orderNumber: initialOrderNumber } : null);
        if (activeOrderToSync) {
          const lookupKey = activeOrderToSync.orderNumber || activeOrderToSync.id;
          if (lookupKey) {
            try {
              const singleRes = await fetch(`/api/orders/${encodeURIComponent(lookupKey)}`);
              if (singleRes.ok) {
                const singleData = await singleRes.json();
                const authoritativeOrder = singleData.order || (singleData.id ? singleData : null);
                if (authoritativeOrder) {
                  setSelectedOrder((prev: any) => ({ ...(prev || {}), ...authoritativeOrder }));
                  setOrdersList((prev) => {
                    const matchIdx = prev.findIndex(
                      (o: any) => o.id === authoritativeOrder.id || o.orderNumber === authoritativeOrder.orderNumber
                    );
                    if (matchIdx !== -1) {
                      const copy = [...prev];
                      copy[matchIdx] = { ...copy[matchIdx], ...authoritativeOrder };
                      return copy;
                    }
                    return [authoritativeOrder, ...prev];
                  });
                }
              }
            } catch (e) {}
          }
        }

        // Sync fresh statuses back to localStorage
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith("storefront_customer_orders_")) {
              const raw = localStorage.getItem(k);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  let changed = false;
                  const updatedList = parsed.map((item: any) => {
                    const match = combined.find((c: any) => c.id === item.id || c.orderNumber === item.orderNumber);
                    if (match && (match.deliveryStatus !== item.deliveryStatus || match.order_status !== item.order_status)) {
                      changed = true;
                      return { ...item, ...match };
                    }
                    return item;
                  });
                  if (changed) {
                    localStorage.setItem(k, JSON.stringify(updatedList));
                  }
                }
              }
            }
          }
        } catch (e) {}
      } catch (err) {
        console.error("Failed to load customer orders", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();

    // Auto-poll for status updates every 3 seconds while modal is open
    const pollInterval = setInterval(loadOrders, 3000);

    // Listen to real-time vendor status changes
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("vendor_orders_channel");
      bc.onmessage = (event) => {
        if (event.data?.type === "ORDER_STATUS_UPDATED") {
          const { orderId, orderNumber, newStatus } = event.data;
          const matchOrder = (o: any) =>
            o.id === orderId || o.orderNumber === orderId ||
            (orderNumber && (o.id === orderNumber || o.orderNumber === orderNumber));

          setOrdersList((prev) =>
            prev.map((o) =>
              matchOrder(o)
                ? { ...o, deliveryStatus: newStatus, delivery_status: newStatus, order_status: newStatus }
                : o
            )
          );
          setSelectedOrder((prev: any) =>
            prev && matchOrder(prev)
              ? { ...prev, deliveryStatus: newStatus, delivery_status: newStatus, order_status: newStatus }
              : prev
          );

          // Update local storage directly
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith("storefront_customer_orders_")) {
                const raw = localStorage.getItem(key);
                if (raw) {
                  const list = JSON.parse(raw);
                  if (Array.isArray(list)) {
                    const updatedList = list.map((item: any) =>
                      matchOrder(item)
                        ? { ...item, deliveryStatus: newStatus, delivery_status: newStatus, order_status: newStatus }
                        : item
                    );
                    localStorage.setItem(key, JSON.stringify(updatedList));
                  }
                }
              }
            }
          } catch (e) {}
        } else if (event.data?.type === "ORDER_TRACKING_UPDATED") {
          const { orderId, orderNumber, carrier, trackingNumber } = event.data;
          const matchOrder = (o: any) =>
            o.id === orderId || o.orderNumber === orderId ||
            (orderNumber && (o.id === orderNumber || o.orderNumber === orderNumber));

          setOrdersList((prev) =>
            prev.map((o) =>
              matchOrder(o)
                ? {
                    ...o,
                    carrier,
                    courier_name: carrier,
                    trackingNumber,
                    tracking_number: trackingNumber,
                    waybill_number: trackingNumber,
                  }
                : o
            )
          );
          setSelectedOrder((prev: any) =>
            prev && matchOrder(prev)
              ? {
                  ...prev,
                  carrier,
                  courier_name: carrier,
                  trackingNumber,
                  tracking_number: trackingNumber,
                  waybill_number: trackingNumber,
                }
              : prev
          );
        }
      };
    } catch (e) {}

    return () => {
      clearInterval(pollInterval);
      if (bc) bc.close();
    };
  }, [isOpen, initialOrderNumber, storeId, customer]);



  if (!isOpen) return null;



  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.trim().toLowerCase();
    const cleanSearch = searchQuery.trim();

    setIsLoading(true);
    try {
      // 1. Direct authoritative lookup by ID or orderNumber
      const singleRes = await fetch(`/api/orders/${encodeURIComponent(cleanSearch)}`);
      if (singleRes.ok) {
        const singleData = await singleRes.json();
        const foundOrder = singleData.order || (singleData.id ? singleData : null);
        if (foundOrder) {
          setSelectedOrder(foundOrder);
          setOrdersList((prev) => {
            const exists = prev.some((o) => o.id === foundOrder.id || o.orderNumber === foundOrder.orderNumber);
            return exists
              ? prev.map((o) => (o.id === foundOrder.id || o.orderNumber === foundOrder.orderNumber ? { ...o, ...foundOrder } : o))
              : [foundOrder, ...prev];
          });
          return;
        }
      }

      // 2. Check local ordersList
      const localFound = ordersList.find(
        (o) =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o.id?.toLowerCase().includes(q) ||
          o.customerPhone?.replace(/[^0-9]/g, "").includes(q) ||
          o.customerEmail?.toLowerCase().includes(q)
      );

      if (localFound) {
        setSelectedOrder(localFound);
        // Refresh with latest status from server
        try {
          const freshRes = await fetch(`/api/orders/${encodeURIComponent(localFound.orderNumber || localFound.id)}`);
          if (freshRes.ok) {
            const freshData = await freshRes.json();
            if (freshData.order) {
              setSelectedOrder((prev: any) => ({ ...prev, ...freshData.order }));
            }
          }
        } catch (e) {}
        return;
      }

      // 3. Fallback search query
      const res = await fetch(`/api/orders?searchQuery=${encodeURIComponent(cleanSearch)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.orders && data.orders.length > 0) {
          setSelectedOrder(data.orders[0]);
          return;
        }
      }
    } catch (e) {
      console.warn("Backend order search failed:", e);
    } finally {
      setIsLoading(false);
    }
  };



  const getStatusBadge = (status: string, carrierName?: string) => {
    switch (status) {
      case "pending":
        return null;

      case "processing":
      case "confirmed":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>Confirmed &amp; Packing</span>
          </span>
        );

      case "shipped":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F5EFF7] text-[#5A3D63] border border-[#D1B2DB] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#694873]" />
            <span>In Transit ({carrierName || "Courier"})</span>
          </span>
        );

      case "delivered":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F5EFF7] text-[#4A3252] border border-[#D1B2DB] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#694873]" />
            <span>Delivered &amp; Signed</span>
          </span>
        );

      case "cancelled":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );

      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const copyTrackingNumber = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 text-slate-800 relative z-10">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#694873] text-white flex items-center justify-center shadow-md">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  {selectedOrder ? "Live Order Tracking & Invoice" : "My Orders & Live Tracking"}
                </h3>
                <p className="text-xs text-slate-500">
                  Track your delivery status with {selectedOrder?.carrier || selectedOrder?.courier_name || "Express Courier"} ({storeName})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          {!selectedOrder && (
            <div className="flex border-b border-slate-100 bg-slate-50/30 px-6 pt-3 gap-6 text-xs font-bold">
              <button
                onClick={() => setActiveTab("my_orders")}
                className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "my_orders"
                    ? "border-[#694873] text-[#694873]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>My Recent Orders ({ordersList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("search_tracking")}
                className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "search_tracking"
                    ? "border-[#694873] text-[#694873]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Track By Order # / Phone</span>
              </button>
            </div>
          )}



          {/* Main Body */}

          <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">

            

            {/* VIEW 1: Single Order Detail & Live Timeline */}

            {selectedOrder ? (

              <div className="space-y-6">

                

                {/* Back button */}

                <button

                  onClick={() => setSelectedOrder(null)}

                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"

                >

                  <ArrowLeft className="w-4 h-4" />

                  <span>Back to All Orders</span>

                </button>



                {/* Top Status & Summary Card (Clean Light Design without dark background or badge) */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-900 shadow-xs space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                      Order Tracking ID
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-black text-lg text-slate-900">
                        {selectedOrder.orderNumber}
                      </span>
                      <button
                        onClick={() => copyTrackingNumber(selectedOrder.orderNumber)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all shadow-xs"
                        title="Copy Order ID"
                      >
                        {copiedTracking ? <Check className="w-3.5 h-3.5 text-[#694873]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">Order Date</span>
                      <span className="font-bold text-slate-800" suppressHydrationWarning>
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">Total Amount</span>
                      <span className="font-black text-[#694873] text-sm">
                        $ {selectedOrder.totalAmount?.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">Payment Method</span>
                      <span className="font-bold text-slate-800 uppercase">
                        {String(selectedOrder.paymentMethod || selectedOrder.payment_method || "cod").toLowerCase() === "cod" ? "COD (Cash on Delivery)" : "Online Escrow"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">Courier Partner</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-[#694873]" />
                        <span>{selectedOrder.carrier || selectedOrder.courier_name || "Express Courier"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Step Tracker Timeline */}
                {(() => {
                  const activeDelStatus = (
                    selectedOrder.deliveryStatus ||
                    selectedOrder.delivery_status ||
                    selectedOrder.order_status ||
                    selectedOrder.status ||
                    "pending"
                  ).toLowerCase();

                  const isConfirmedStep = ["confirmed", "processing", "packed", "ready_to_ship", "shipped", "delivered", "completed"].includes(activeDelStatus);
                  const isShippedStep = ["shipped", "delivered", "completed"].includes(activeDelStatus);
                  const isDeliveredStep = ["delivered", "completed"].includes(activeDelStatus);

                  return (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#694873]" />
                          <span>Live Delivery Timeline</span>
                        </h4>
                        <span className="text-[11px] font-bold text-[#694873]">
                          Estimated Arrival: 2-4 Days
                        </span>
                      </div>

                      {/* Vertical Timeline */}
                      <div className="space-y-4 pt-2">
                        {/* Step 1: Order Placed */}
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#694873] text-white flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-sm">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-900">Order Placed &amp; Verified</p>
                            <p className="text-[11px] text-slate-500">
                              {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • System recorded order
                            </p>
                          </div>
                        </div>

                        {/* Step 2: Confirmed */}
                        <div className="flex items-start gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-sm ${
                            isConfirmedStep
                              ? "bg-[#694873] text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}>
                            {isConfirmedStep ? <Check className="w-3.5 h-3.5" /> : "2"}
                          </div>
                          <div>
                            <p className={`font-bold text-xs ${isConfirmedStep ? "text-slate-900" : "text-slate-400"}`}>
                              Order Confirmed by Vendor
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Stock reserved and packaging initiated in warehouse
                            </p>
                          </div>
                        </div>

                        {/* Step 3: Shipped / In Transit */}
                        <div className="flex items-start gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-sm ${
                            isShippedStep
                              ? "bg-[#694873] text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}>
                            {isDeliveredStep ? <Check className="w-3.5 h-3.5" /> : "3"}
                          </div>
                          <div>
                            <p className={`font-bold text-xs ${
                              isShippedStep
                                ? "text-slate-900"
                                : "text-slate-400"
                            }`}>
                              Handed over to {selectedOrder.carrier || selectedOrder.courier_name || "Express Courier"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Waybill #{selectedOrder.trackingNumber || selectedOrder.tracking_number || selectedOrder.waybill_number || selectedOrder.orderNumber || "Pending"} • Transit to destination hub
                            </p>
                          </div>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="flex items-start gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-sm ${
                            isDeliveredStep
                              ? "bg-[#694873] text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}>
                            {isDeliveredStep ? <Check className="w-3.5 h-3.5" /> : "4"}
                          </div>
                          <div>
                            <p className={`font-bold text-xs ${isDeliveredStep ? "text-slate-900" : "text-slate-400"}`}>
                              Delivered to Doorstep
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Signed and cash collected via COD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}



                {/* Products Itemized List */}

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3">

                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">

                    Order Items ({selectedOrder.items?.length || 1})

                  </h4>



                  <div className="divide-y divide-slate-100">

                    {(selectedOrder.items && selectedOrder.items.length > 0 ? selectedOrder.items : [

                      {

                        name: "Ordered Product Item",

                        quantity: 1,

                        price: selectedOrder.totalAmount,

                        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=120&auto=format&fit=crop&q=80"

                      }

                    ]).map((item: any, idx: number) => (

                      <div key={idx} className="py-3 flex items-center justify-between gap-3">

                        <div className="flex items-center gap-3">

                          <img

                            src={item.image || "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=120&auto=format&fit=crop&q=80"}

                            alt={item.name}

                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200/60"

                          />

                          <div>

                            <p className="font-bold text-xs text-slate-900">{item.name}</p>

                            {item.variant && (

                              <p className="text-[10px] text-slate-500">{item.variant}</p>

                            )}

                            <p className="text-[11px] text-slate-400">Qty: {item.quantity || 1}</p>

                          </div>

                        </div>



                        <span className="font-extrabold text-xs text-slate-900">

                          $ {((item.price || selectedOrder.totalAmount) * (item.quantity || 1)).toLocaleString()}

                        </span>

                      </div>

                    ))}

                  </div>



                  {/* Shipping Address snapshot */}

                  <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl">

                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />

                    <div>

                      <span className="font-bold text-slate-900">Delivery Address: </span>

                      <span>{selectedOrder.shippingAddress || "Lahore, Pakistan"}</span>

                    </div>

                  </div>

                </div>



                {/* Customer Support Links */}

                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#F5EFF7] border border-[#D1B2DB]/60 text-xs">

                  <div className="flex items-center gap-2 text-[#4A3252] font-semibold">

                    <ShieldCheck className="w-4 h-4 text-[#694873]" />

                    <span>Need help with this order? Contact vendor directly on WhatsApp</span>

                  </div>

                  <a

                    href={`https://wa.me/923001234567?text=Hi,%20I%20need%20an%20update%20regarding%20my%20order%20${selectedOrder.orderNumber}`}

                    target="_blank"

                    rel="noopener noreferrer"

                    className="px-3.5 py-2 rounded-xl bg-[#694873] hover:bg-[#5A3D63] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"

                  >

                    <MessageCircle className="w-3.5 h-3.5" />

                    <span>WhatsApp Vendor</span>

                  </a>

                </div>



              </div>

            ) : activeTab === "my_orders" ? (

              /* VIEW 2: My Orders List */

              <div className="space-y-4">

                {ordersList.length > 0 ? (

                  ordersList.map((ord) => (

                    <div
                      key={ord.id || ord.orderNumber}
                      onClick={async () => {
                        setSelectedOrder(ord);
                        setActiveTab("search_tracking");
                        try {
                          const lookup = ord.orderNumber || ord.id;
                          const res = await fetch(`/api/orders/${encodeURIComponent(lookup)}`);
                          if (res.ok) {
                            const data = await res.json();
                            if (data.order) {
                              setSelectedOrder((prev: any) => ({ ...(prev || {}), ...data.order }));
                              setOrdersList((prevList) =>
                                prevList.map((item) =>
                                  item.orderNumber === data.order.orderNumber || item.id === data.order.id
                                    ? { ...item, ...data.order }
                                    : item
                                )
                              );
                            }
                          }
                        } catch (e) {}
                      }}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-[#694873]/50 hover:bg-slate-50/80 transition-all cursor-pointer group shadow-xs space-y-3"
                    >

                      <div className="flex items-center justify-between gap-3">

                        <div className="flex items-center gap-2.5">

                          <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-[#E8D8ED] group-hover:text-[#4A3252] text-slate-700 flex items-center justify-center font-bold text-xs transition-colors">

                            <Package className="w-4 h-4" />

                          </div>

                          <div>

                            <span className="font-mono font-black text-xs sm:text-sm text-slate-900 group-hover:text-[#694873] transition-colors">

                              {ord.orderNumber}

                            </span>

                            <span className="text-[11px] text-slate-400 block" suppressHydrationWarning>
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>



                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">

                        <span className="font-bold text-slate-600">

                          {ord.items?.length || 1} {ord.items?.length === 1 ? "Product" : "Products"} •{" "}

                          <span className="text-slate-900 font-extrabold">$ {ord.totalAmount?.toLocaleString()}</span>

                        </span>



                        <button className="text-[#694873] hover:text-[#5A3D63] font-extrabold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">

                          <span>Track Order</span>

                          <ChevronRight className="w-4 h-4" />

                        </button>

                      </div>

                    </div>

                  ))

                ) : (

                  <div className="p-10 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200/60">

                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">

                      <ShoppingBag className="w-6 h-6" />

                    </div>

                    <h4 className="font-bold text-sm text-slate-800">

                      {customer ? "No Orders Found For Your Account" : "Sign In to View Your Account Orders"}

                    </h4>

                    <p className="text-xs text-slate-500 max-w-sm mx-auto">

                      {customer

                        ? `You have not placed any orders under ${customer.email} yet. Place an order or track with Order Number.`

                        : "Sign in with your store account to view your past orders, or search using your Tracking ID."}

                    </p>

                    <div className="flex items-center justify-center gap-2 pt-2">

                      {!customer && (

                        <button

                          onClick={() => {

                            onClose();

                            setIsCustomerAuthOpen(true);

                          }}

                          className="px-5 py-2.5 rounded-xl bg-[#694873] hover:bg-[#5A3D63] text-white font-bold text-xs shadow-sm cursor-pointer transition-all"

                        >

                          Sign In to Account

                        </button>

                      )}

                      <button

                        onClick={onClose}

                        className="px-5 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-900 cursor-pointer"

                      >

                        Browse Catalog

                      </button>

                    </div>

                  </div>

                )}

              </div>

            ) : (

              /* VIEW 3: Search Tracking Box */

              <div className="space-y-6">

                <form onSubmit={handleSearchOrder} className="space-y-3">

                  <label className="font-bold text-xs text-slate-700 block">

                    Enter Order # or Phone Number

                  </label>

                  <div className="relative flex items-center">

                    <input

                      type="text"

                      value={searchQuery}

                      onChange={(e) => setSearchQuery(e.target.value)}

                      placeholder="e.g. #ORD-8942 or 03001234567"

                      className="w-full pl-10 pr-28 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#694873] focus:ring-2 focus:ring-[#694873]/20 focus:bg-white transition-all shadow-xs"

                    />

                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    

                    <button

                      type="submit"

                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-[#694873] hover:bg-[#5A3D63] text-white font-extrabold text-xs shadow-sm active:scale-95 transition-all"

                    >

                      Track Now

                    </button>

                  </div>

                </form>



                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">

                  <h5 className="font-bold text-slate-800">Quick Tips for Tracking:</h5>

                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">

                    <li>Check your SMS / WhatsApp / Email for your tracking ID (e.g. `#ORD-8942`).</li>

                    <li>Orders are dispatched via express courier within 24 hours of placement.</li>

                    <li>For immediate assistance, contact our WhatsApp Support team.</li>

                  </ul>

                </div>

              </div>

            )}



          </div>



        </div>

      </div>

    </div>

  );

}

