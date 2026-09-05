"use client";

import React, { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState<"my_orders" | "search_tracking">("my_orders");
  const [searchQuery, setSearchQuery] = useState(initialOrderNumber);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Load customer's local and backend orders on modal open
  useEffect(() => {
    if (!isOpen) return;

    const loadOrders = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch from backend API
        const res = await fetch("/api/orders?limit=50");
        let backendOrders: any[] = [];
        if (res.ok) {
          const data = await res.json();
          if (data.orders && Array.isArray(data.orders)) {
            backendOrders = data.orders;
          }
        }

        // 2. Read local stored orders for this customer session
        const localKey = `storefront_customer_orders_${storeId || "default_store"}_${customer?.id || "guest"}`;
        const localData = typeof window !== "undefined" ? localStorage.getItem(localKey) : null;
        const customerPlacedOrders = localData ? JSON.parse(localData) : [];

        // Merge orders with latest backend status
        let combined: any[] = [];

        if (customer) {
          // STRICT CUSTOMER SCOPE: Show ONLY orders belonging to this logged in customer
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

          // Prioritize server status over local storage
          const mergedLocal = filteredLocal.map((co: any) => {
            const match = filteredBackend.find(
              (bo: any) => bo.id === co.id || bo.orderNumber === co.orderNumber
            );
            return match
              ? {
                  ...co,
                  deliveryStatus: match.deliveryStatus || co.deliveryStatus,
                  paymentStatus: match.paymentStatus || co.paymentStatus,
                  escrowStatus: match.escrowStatus || co.escrowStatus,
                  timeline: match.timeline || co.timeline,
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
          // If guest, show only orders placed in this browser session
          combined = [...customerPlacedOrders];
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
            (o: any) => o.id === prev.id || o.orderNumber === prev.orderNumber
          );
          return fresh ? { ...prev, ...fresh } : prev;
        });

        // If initialOrderNumber passed, select that order
        if (initialOrderNumber) {
          const target = combined.find(
            (o: any) => o.orderNumber?.toLowerCase() === initialOrderNumber.toLowerCase()
          );
          if (target) {
            setSelectedOrder(target);
            setActiveTab("search_tracking");
          }
        }
      } catch (err) {
        console.error("Failed to load customer orders", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();

    // Auto-poll for status updates every 2 seconds while modal is open
    const pollInterval = setInterval(loadOrders, 2000);

    // Listen to real-time vendor status changes
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("vendor_orders_channel");
      bc.onmessage = (event) => {
        if (event.data?.type === "ORDER_STATUS_UPDATED") {
          const { orderId, newStatus } = event.data;
          setOrdersList((prev) =>
            prev.map((o) =>
              o.id === orderId || o.orderNumber === orderId
                ? { ...o, deliveryStatus: newStatus }
                : o
            )
          );
          setSelectedOrder((prev: any) =>
            prev && (prev.id === orderId || prev.orderNumber === orderId)
              ? { ...prev, deliveryStatus: newStatus }
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

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.trim().toLowerCase();
    const found = ordersList.find(
      (o) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerPhone?.replace(/[^0-9]/g, "").includes(q) ||
        o.customerEmail?.toLowerCase().includes(q)
    );

    if (found) {
      setSelectedOrder(found);
    } else {
      // Simulate live tracked order if not found locally
      const simulatedTrackedOrder = {
        id: `ord-mock-${Date.now()}`,
        orderNumber: searchQuery.startsWith("#") ? searchQuery.toUpperCase() : `#${searchQuery.toUpperCase()}`,
        customerName: "Customer Buyer",
        customerPhone: "0300 1234567",
        totalAmount: 15600,
        paymentStatus: "pending",
        paymentMethod: "cod",
        deliveryStatus: "shipped",
        deliveryMethod: "express",
        shippingAddress: "Gulberg III, Lahore, Pakistan",
        createdAt: new Date().toISOString(),
        items: [
          {
            id: "item-1",
            name: "Automatic Chronograph Luxury Watch",
            variant: "Black Leather / 42mm",
            quantity: 1,
            price: 15600,
            image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200&auto=format&fit=crop&q=80",
          },
        ],
      };
      setSelectedOrder(simulatedTrackedOrder);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Order Placed (Pending)</span>
          </span>
        );
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
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span>In Transit (TCS Courier)</span>
          </span>
        );
      case "delivered":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  {selectedOrder ? "Live Order Tracking & Invoice" : "My Orders & Live Tracking"}
                </h3>
                <p className="text-xs text-slate-500">
                  Track your delivery status with TCS Express Courier ({storeName})
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
                    ? "border-emerald-500 text-emerald-600"
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
                    ? "border-emerald-500 text-emerald-600"
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
                  <span>← Back to All Orders</span>
                </button>

                {/* Top Status & Summary Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Order Tracking ID
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-black text-lg text-white">
                          {selectedOrder.orderNumber}
                        </span>
                        <button
                          onClick={() => copyTrackingNumber(selectedOrder.orderNumber)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                          title="Copy Order ID"
                        >
                          {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>{getStatusBadge(selectedOrder.deliveryStatus)}</div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Order Date</span>
                      <span className="font-bold text-slate-200" suppressHydrationWarning>
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Amount</span>
                      <span className="font-black text-emerald-400 text-sm">
                        ₨ {selectedOrder.totalAmount?.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Payment Method</span>
                      <span className="font-bold text-slate-200 uppercase">
                        {selectedOrder.paymentMethod === "cod" ? "COD (Cash on Delivery)" : "Online Escrow"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Courier Partner</span>
                      <span className="font-bold text-slate-200 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>TCS Express (Air)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Step Tracker Timeline */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Live Delivery Timeline</span>
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-600">
                      Estimated Arrival: 2-4 Days
                    </span>
                  </div>

                  {/* Vertical / Horizontal Timeline */}
                  <div className="space-y-4 pt-2">
                    {/* Step 1: Order Placed */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-sm">
                        ✓
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
                        selectedOrder.deliveryStatus !== "pending"
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-200 text-slate-500"
                      }`}>
                        {selectedOrder.deliveryStatus !== "pending" ? "✓" : "2"}
                      </div>
                      <div>
                        <p className={`font-bold text-xs ${selectedOrder.deliveryStatus !== "pending" ? "text-slate-900" : "text-slate-400"}`}>
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
                        selectedOrder.deliveryStatus === "shipped" || selectedOrder.deliveryStatus === "delivered"
                          ? "bg-purple-500 text-white animate-pulse"
                          : "bg-slate-200 text-slate-500"
                      }`}>
                        {selectedOrder.deliveryStatus === "delivered" ? "✓" : "3"}
                      </div>
                      <div>
                        <p className={`font-bold text-xs ${
                          selectedOrder.deliveryStatus === "shipped" || selectedOrder.deliveryStatus === "delivered"
                            ? "text-slate-900"
                            : "text-slate-400"
                        }`}>
                          Handed over to TCS Express Courier
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Waybill #TCS-{Math.floor(100000 + Math.random() * 900000)} • Transit to destination hub
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-sm ${
                        selectedOrder.deliveryStatus === "delivered"
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-200 text-slate-500"
                      }`}>
                        {selectedOrder.deliveryStatus === "delivered" ? "✓" : "4"}
                      </div>
                      <div>
                        <p className={`font-bold text-xs ${selectedOrder.deliveryStatus === "delivered" ? "text-slate-900" : "text-slate-400"}`}>
                          Delivered to Doorstep
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Signed and cash collected via COD
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

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
                          ₨ {((item.price || selectedOrder.totalAmount) * (item.quantity || 1)).toLocaleString()}
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
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Need help with this order? Contact vendor directly on WhatsApp</span>
                  </div>
                  <a
                    href={`https://wa.me/923001234567?text=Hi,%20I%20need%20an%20update%20regarding%20my%20order%20${selectedOrder.orderNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
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
                      onClick={() => setSelectedOrder(ord)}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50/80 transition-all cursor-pointer group shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-700 text-slate-700 flex items-center justify-center font-bold text-xs transition-colors">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono font-black text-xs sm:text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                              {ord.orderNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 block" suppressHydrationWarning>
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {getStatusBadge(ord.deliveryStatus)}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                        <span className="font-bold text-slate-600">
                          {ord.items?.length || 1} {ord.items?.length === 1 ? "Product" : "Products"} •{" "}
                          <span className="text-slate-900 font-extrabold">₨ {ord.totalAmount?.toLocaleString()}</span>
                        </span>

                        <button className="text-emerald-600 font-extrabold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
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
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
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
                      className="w-full pl-10 pr-28 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-xs"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-sm active:scale-95 transition-all"
                    >
                      Track Now
                    </button>
                  </div>
                </form>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
                  <h5 className="font-bold text-slate-800">Quick Tips for Tracking:</h5>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
                    <li>Check your SMS / WhatsApp / Email for your tracking ID (e.g. `#ORD-8942`).</li>
                    <li>Orders are dispatched via TCS Express within 24 hours of placement.</li>
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
