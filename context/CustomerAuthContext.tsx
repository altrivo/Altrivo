"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { StoreCustomer, CustomerAddress } from "@/types/customer";

interface CustomerAuthContextType {
  customer: StoreCustomer | null;
  loading: boolean;
  storeId: string;
  login: (email: string, password: string, storeId?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string, storeId?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { name: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshCustomer: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const DEFAULT_STORE_ID = "753ea49c-abae-4dd3-9107-1dc8fcd6b221";

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<StoreCustomer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [storeId] = useState<string>(DEFAULT_STORE_ID);

  // Hydrate customer session on mount
  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const cached = localStorage.getItem("digishop_customer_session");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.id) {
            setCustomer(parsed);
          }
        }

        // Verify with server profile endpoint
        const res = await fetch(`/api/customer/profile?store_id=${storeId}`, { credentials: "omit" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.customer) {
            setCustomer(data.customer);
            localStorage.setItem("digishop_customer_session", JSON.stringify(data.customer));
          }
        }
      } catch (err) {
        console.warn("[CustomerAuthContext] Hydration note:", err);
      } finally {
        setLoading(false);
      }
    };

    hydrateSession();
  }, [storeId]);

  const login = async (email: string, password: string, targetStoreId?: string) => {
    try {
      const res = await fetch("/api/auth/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          store_id: targetStoreId || storeId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Login failed" };
      }

      setCustomer(data.customer);
      try {
        localStorage.setItem("digishop_customer_session", JSON.stringify(data.customer));
      } catch {}

      // Trigger Cart Merge if guest items exist in localStorage
      try {
        const guestCart = localStorage.getItem("altrio_vendor_cart");
        if (guestCart) {
          const parsed = JSON.parse(guestCart);
          if (Array.isArray(parsed) && parsed.length > 0) {
            await fetch("/api/cart/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "merge",
                vendorId: targetStoreId || storeId,
                customerId: data.customer.id,
                items: parsed,
              }),
            });
          }
        }
      } catch (mergeErr) {
        console.warn("[CustomerAuth] Cart merge notice:", mergeErr);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error during login" };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string, targetStoreId?: string) => {
    try {
      const res = await fetch("/api/auth/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone?.trim(),
          store_id: targetStoreId || storeId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Registration failed" };
      }

      setCustomer(data.customer);
      try {
        localStorage.setItem("digishop_customer_session", JSON.stringify(data.customer));
      } catch {}

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error during registration" };
    }
  };

  const logout = async () => {
    setCustomer(null);
    try {
      localStorage.removeItem("digishop_customer_session");
    } catch {}
  };

  const updateProfile = async (data: { name: string; phone?: string }) => {
    if (!customer) return { success: false, error: "Not logged in" };
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          storeId: customer.store_id || storeId,
          ...data,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || "Update failed" };
      }

      const updated = { ...customer, ...data };
      setCustomer(updated);
      localStorage.setItem("digishop_customer_session", JSON.stringify(updated));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update profile" };
    }
  };

  const refreshCustomer = async () => {
    if (!customer) return;
    try {
      const res = await fetch(`/api/customer/profile?customerId=${customer.id}&store_id=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.customer) {
          setCustomer(data.customer);
          localStorage.setItem("digishop_customer_session", JSON.stringify(data.customer));
        }
      }
    } catch (e) {}
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        loading,
        storeId,
        login,
        register,
        logout,
        updateProfile,
        refreshCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}
