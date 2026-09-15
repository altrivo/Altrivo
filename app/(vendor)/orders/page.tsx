"use client";

import { useState, useEffect, useMemo } from "react";
import { Order, OrderFilterState, OrderStatus } from "@/types/orders";
import { INITIAL_ORDERS, generateMockOrder } from "@/utils/ordersMock";
import { exportOrdersToCSV } from "@/utils/csvExport";
import { subscribeToOrders, isSupabaseConfigured } from "@/lib/supabase";
import { OrderHeader } from "@/components/orders/OrderHeader";
import { OrderFilters } from "@/components/orders/OrderFilters";
import { OrderTable } from "@/components/orders/OrderTable";
import { OrderPagination } from "@/components/orders/OrderPagination";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { useVendorStore } from "@/context/VendorStoreContext";

export default function OrdersPage() {
  const { activeStore, activeStoreId } = useVendorStore();
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [realtimeNewOrders, setRealtimeNewOrders] = useState<Order[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filters state
  const [filters, setFilters] = useState<OrderFilterState>({
    searchQuery: "",
    deliveryStatus: "all",
    paymentStatus: "all",
    paymentMethod: "all",
    deliveryMethod: "all",
    dateRange: "all",
  });

  // Fetch live orders from backend API and sync with local storefront orders
  const fetchOrders = async () => {
    try {
      // 1. Fetch from backend scoped to storeId
      const storeParam = activeStoreId ? `&storeId=${activeStoreId}` : "";
      const res = await fetch(`/api/orders?limit=100${storeParam}`);
      let backendOrders: Order[] = [];
      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          backendOrders = activeStoreId
            ? data.orders.filter((o: any) => {
                const sid = o.store_id || o.storeId;
                return sid === activeStoreId || (activeStore?.slug && sid === activeStore.slug);
              })
            : [];
        }
      }

      // 2. Read local customer placed orders strictly scoped to active store
      let localOrders: Order[] = [];
      try {
        if (activeStoreId || activeStore?.slug) {
          // Collect all possible keys (store-only key + all customer-suffixed keys)
          const storeKeys = [
            `storefront_customer_orders_${activeStoreId}`,
            activeStore?.slug ? `storefront_customer_orders_${activeStore.slug}` : "",
          ].filter(Boolean);

          // Also scan for customer-specific keys matching this store
          const allLsKeys: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i) || "";
            if (activeStoreId && k.startsWith(`storefront_customer_orders_${activeStoreId}_`)) {
              allLsKeys.push(k);
            }
            if (activeStore?.slug && k.startsWith(`storefront_customer_orders_${activeStore.slug}_`)) {
              allLsKeys.push(k);
            }
          }

          for (const key of [...storeKeys, ...allLsKeys]) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                localOrders = [...localOrders, ...parsed];
              }
            }
          }
        }
      } catch (e) {}

      // 3. Merge without duplicates (strictly sorted by latest date descending)
      setOrders((prev) => {
        const merged = [...backendOrders];
        localOrders.forEach((lo) => {
          const existingIdx = merged.findIndex(
            (m) =>
              m.id === lo.id ||
              m.orderNumber?.toLowerCase() === lo.orderNumber?.toLowerCase() ||
              (m.totalAmount === lo.totalAmount &&
                Math.abs(new Date(m.createdAt).getTime() - new Date(lo.createdAt).getTime()) < 60000)
          );

          if (existingIdx !== -1) {
            merged[existingIdx] = {
              ...merged[existingIdx],
              customerName: lo.customerName || merged[existingIdx].customerName,
              customerEmail: lo.customerEmail || merged[existingIdx].customerEmail,
              customerPhone: lo.customerPhone || merged[existingIdx].customerPhone,
              shippingAddress: lo.shippingAddress || merged[existingIdx].shippingAddress,
              items: (lo.items && lo.items.length > 0) ? lo.items : merged[existingIdx].items,
              deliveryStatus: merged[existingIdx].deliveryStatus || lo.deliveryStatus,
            };
          } else {
            merged.push(lo);
          }
        });
        merged.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return merged.length > 0 ? merged : prev;
      });
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  };


  // Initial load and auto-polling every 3 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [activeStoreId]);

  // Multi-tab instant sync via BroadcastChannel & storage events
  useEffect(() => {
    const handleStorageChange = () => {
      fetchOrders();
    };
    window.addEventListener("storage", handleStorageChange);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("vendor_orders_channel");
      bc.onmessage = (event) => {
        if (event.data?.type === "NEW_ORDER" && event.data?.order) {
          const newOrder = event.data.order;
          setOrders((prev) => {
            if (prev.some((o) => o.id === newOrder.id || o.orderNumber === newOrder.orderNumber)) {
              return prev;
            }
            const updated = [newOrder, ...prev];
            return updated.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        } else if (event.data?.type === "ORDER_STATUS_UPDATED") {
          const { orderId, newStatus } = event.data;
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderId || o.orderNumber === orderId
                ? { ...o, deliveryStatus: newStatus }
                : o
            )
          );
        }
      };
    } catch (e) {}

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (bc) bc.close();
    };
  }, []);

  // Subscribe to Supabase Realtime changes for automated instant updates
  useEffect(() => {
    const unsubscribe = subscribeToOrders(
      (newOrder) => {
        fetchOrders();
      },
      (updatedOrder) => {
        fetchOrders();
      },
      () => {
        fetchOrders();
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeStoreId]);

  // Keyboard shortcut listener for search '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>("input[placeholder*='Search']");
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Merge newly arrived real-time orders into active state
  const handleLoadRealtimeOrders = () => {
    if (realtimeNewOrders.length === 0) return;
    setOrders((prev) => [...realtimeNewOrders, ...prev]);
    setRealtimeNewOrders([]);
    setCurrentPage(1);
  };

  // Simulate a live incoming order
  const handleSimulateNewOrder = () => {
    const mockLiveOrder = generateMockOrder();
    setRealtimeNewOrders((prev) => [mockLiveOrder, ...prev]);
  };

  // Filter change handler
  const handleFilterChange = (updated: Partial<OrderFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      deliveryStatus: "all",
      paymentStatus: "all",
      paymentMethod: "all",
      deliveryMethod: "all",
      dateRange: "all",
    });
    setCurrentPage(1);
  };

  // Status Tab click handler
  const handleSelectStatusTab = (statusTab: string) => {
    setFilters((prev) => ({
      ...prev,
      deliveryStatus: statusTab as OrderStatus | "all",
    }));
    setCurrentPage(1);
  };

  // Status counts calculation
  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.deliveryStatus === "pending").length,
      processing: orders.filter((o) => o.deliveryStatus === "processing").length,
      shipped: orders.filter((o) => o.deliveryStatus === "shipped").length,
      delivered: orders.filter((o) => o.deliveryStatus === "delivered").length,
      cancelled: orders.filter((o) => o.deliveryStatus === "cancelled").length,
    };
  }, [orders]);

  // Compute filtered list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesQuery =
          order.orderNumber.toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.customerEmail.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Delivery Status filter
      if (filters.deliveryStatus !== "all" && order.deliveryStatus !== filters.deliveryStatus) {
        return false;
      }

      // Payment Status filter
      if (filters.paymentStatus !== "all" && order.paymentStatus !== filters.paymentStatus) {
        return false;
      }

      // Payment Method filter
      if (filters.paymentMethod !== "all" && order.paymentMethod !== filters.paymentMethod) {
        return false;
      }

      // Delivery Method filter
      if (filters.deliveryMethod !== "all" && order.deliveryMethod !== filters.deliveryMethod) {
        return false;
      }

      // Date Range filter
      if (filters.dateRange !== "all") {
        const orderDate = new Date(order.createdAt).getTime();
        const now = Date.now();

        if (filters.dateRange === "today") {
          const startOfToday = new Date().setHours(0, 0, 0, 0);
          if (orderDate < startOfToday) return false;
        } else if (filters.dateRange === "last_7_days") {
          const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
          if (orderDate < sevenDaysAgo) return false;
        } else if (filters.dateRange === "last_30_days") {
          const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
          if (orderDate < thirtyDaysAgo) return false;
        } else if (filters.dateRange === "custom") {
          if (filters.customStartDate) {
            const start = new Date(filters.customStartDate).getTime();
            if (orderDate < start) return false;
          }
          if (filters.customEndDate) {
            const end = new Date(filters.customEndDate).setHours(23, 59, 59, 999);
            if (orderDate > end) return false;
          }
        }
      }

      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, filters]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Metrics
  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [filteredOrders]);

  const pendingDeliveriesCount = useMemo(() => {
    return filteredOrders.filter((o) => o.deliveryStatus === "processing" || o.deliveryStatus === "pending").length;
  }, [filteredOrders]);

  // Bulk selection handlers
  const handleToggleSelectAll = () => {
    if (selectedOrderIds.length === paginatedOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(paginatedOrders.map((o) => o.id));
    }
  };

  const handleToggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // Status update handler (Optimistic UI + Local Storage + Broadcast + Backend DB Sync)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const nowISO = new Date().toISOString();

    // 1. Optimistic UI update across all orders
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o.orderNumber === orderId
          ? { ...o, deliveryStatus: newStatus, order_status: newStatus }
          : o
      )
    );

    // 2. Update selected modal order with live audit trail and timeline
    if (
      selectedOrderForDetails &&
      (selectedOrderForDetails.id === orderId || selectedOrderForDetails.orderNumber === orderId)
    ) {
      setSelectedOrderForDetails((prev) => {
        if (!prev) return null;
        const updatedEvents = [...(prev.events || [])];
        updatedEvents.unshift({
          id: `ev-${Date.now()}`,
          order_id: prev.id,
          store_id: prev.store_id || "store",
          event_type: `ORDER_${newStatus.toUpperCase()}`,
          old_status: prev.order_status || prev.deliveryStatus,
          new_status: newStatus,
          actor_type: "vendor",
          message: `Order status updated to ${newStatus.replace(/_/g, " ").toUpperCase()}`,
          created_at: nowISO,
        });

        const updatedTimeline = [...(prev.timeline || [])];
        updatedTimeline.push({
          id: `tl-${Date.now()}`,
          title: newStatus.replace(/_/g, " ").toUpperCase(),
          description: `Order marked ${newStatus.replace(/_/g, " ")} by vendor`,
          timestamp: nowISO,
          step: (newStatus === "cancelled" ? "cancelled" : newStatus === "delivered" ? "delivered" : "confirmed") as any,
          completed: true,
          current: true,
        });

        return {
          ...prev,
          deliveryStatus: newStatus,
          order_status: newStatus,
          events: updatedEvents,
          timeline: updatedTimeline,
        };
      });
    }

    // 3. Update local storage across all stores
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("storefront_customer_orders_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const updatedList = list.map((item: any) =>
                item.id === orderId || item.orderNumber === orderId
                  ? { ...item, deliveryStatus: newStatus, order_status: newStatus }
                  : item
              );
              localStorage.setItem(key, JSON.stringify(updatedList));
            }
          }
        }
      }
    } catch (e) {}

    // 4. Broadcast to storefront tabs
    try {
      const bc = new BroadcastChannel("vendor_orders_channel");
      bc.postMessage({ type: "ORDER_STATUS_UPDATED", orderId, newStatus });
      bc.close();
    } catch (e) {}

    // 5. Update backend server & Supabase database
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, ...data.order } : o))
          );
          if (
            selectedOrderForDetails &&
            (selectedOrderForDetails.id === orderId || selectedOrderForDetails.orderNumber === orderId)
          ) {
            setSelectedOrderForDetails((prev) => (prev ? { ...prev, ...data.order } : null));
          }
        }
      }
    } catch (err) {
      console.error("Failed to update status on server", err);
    }
  };

  // Bulk CSV Export handler
  const handleExportCSV = () => {
    const exportData =
      selectedOrderIds.length > 0
        ? orders.filter((o) => selectedOrderIds.includes(o.id))
        : filteredOrders;

    exportOrdersToCSV(exportData);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Enhanced Header Section with KPIs, Status Tabs, and Actions */}
      <OrderHeader
        totalOrdersCount={orders.length}
        totalRevenue={totalRevenue}
        pendingDeliveriesCount={pendingDeliveriesCount}
        realtimeCount={realtimeNewOrders.length}
        activeStatusTab={filters.deliveryStatus}
        onSelectStatusTab={handleSelectStatusTab}
        onExportCSV={handleExportCSV}
        statusCounts={statusCounts}
      />

      {/* Enhanced Filter Bar */}
      <OrderFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalFilteredCount={filteredOrders.length}
      />

      {/* Enhanced Order Table Component */}
      <OrderTable
        orders={paginatedOrders}
        realtimeNewOrders={realtimeNewOrders}
        onLoadRealtimeOrders={handleLoadRealtimeOrders}
        onViewOrderDetails={(order) => setSelectedOrderForDetails(order)}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        selectedOrderIds={selectedOrderIds}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelectOrder={handleToggleSelectOrder}
      />

      {/* Pagination Footer */}
      <OrderPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filteredOrders.length}
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
      />

      {/* Order Details Modal Drawer */}
      {selectedOrderForDetails && (
        <OrderDetailsModal
          order={selectedOrderForDetails}
          onClose={() => setSelectedOrderForDetails(null)}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      )}
    </div>
  );
}
