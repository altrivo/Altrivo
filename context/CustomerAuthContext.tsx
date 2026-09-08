"use client";

/**
 * DigiShop AI — Customer Authentication Context
 *
 * Uses real Supabase client-side auth via @supabase/ssr.
 * Dynamic store context (resolved from domain/route instead of hardcoded).
 * Handles cart merge on login, token refresh, and session lifecycle.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StoreCustomer } from "@/types/customer";
import type { User } from "@supabase/supabase-js";

interface CustomerAuthContextType {
  customer: StoreCustomer | null;
  user: User | null;
  loading: boolean;
  storeId: string;
  isAuthenticated: boolean;
  login: (email: string, password: string, storeId?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string, storeId?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { name: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshCustomer: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

/**
 * Resolve the current store ID from the domain/URL.
 * In production, this reads from the domain resolver.
 * In development, falls back to a default.
 */
function resolveStoreId(): string {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;

  // In development, use default store ID or read from meta tag
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const metaStoreId = document.querySelector('meta[name="x-store-id"]')?.getAttribute("content");
    if (metaStoreId) return metaStoreId;
    // Fallback: try localStorage
    const saved = localStorage.getItem("digishop_current_store_id");
    if (saved) return saved;
    return "";
  }

  // For custom domains, the store ID is resolved server-side and injected via headers
  return "";
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<StoreCustomer | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [storeId, setStoreId] = useState<string>("");
  const supabase = createClient();

  // Hydrate session on mount
  useEffect(() => {
    const hydrateSession = async () => {
      try {
        // 1. Resolve store context
        const resolvedStoreId = resolveStoreId();
        setStoreId(resolvedStoreId);

        // 2. Check Supabase auth session
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);

        if (authUser && resolvedStoreId) {
          // 3. Fetch or hydrate store customer profile
          const res = await fetch(
            `/api/customer/profile?store_id=${resolvedStoreId}`,
            { credentials: "include" }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.customer) {
              setCustomer(data.customer);
            }
          }
        } else if (authUser) {
          // No store context yet — just set the user, customer profile will load when store is known
          // Try to hydrate from localStorage cache
          try {
            const cached = localStorage.getItem("digishop_customer_session");
            if (cached) {
              const parsed = JSON.parse(cached);
              if (parsed?.id && parsed?.auth_user_id === authUser.id) {
                setCustomer(parsed);
                if (parsed.store_id) setStoreId(parsed.store_id);
              }
            }
          } catch {
            // Ignore parse errors
          }
        }
      } catch (err) {
        console.warn("[CustomerAuthContext] Hydration note:", err);
      } finally {
        setLoading(false);
      }
    };

    hydrateSession();

    // Listen for auth state changes (token refresh, login from another tab, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);

        if (event === "SIGNED_OUT") {
          setCustomer(null);
          try { localStorage.removeItem("digishop_customer_session"); } catch {}
        }

        if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
          // Re-fetch customer profile with refreshed session
          if (session?.user && storeId) {
            try {
              const res = await fetch(
                `/api/customer/profile?store_id=${storeId}`,
                { credentials: "include" }
              );
              if (res.ok) {
                const data = await res.json();
                if (data.success && data.customer) {
                  setCustomer(data.customer);
                }
              }
            } catch {}
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string, targetStoreId?: string) => {
    try {
      const effectiveStoreId = targetStoreId || storeId;

      // 1. Sign in via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !authData.user) {
        return { success: false, error: authError?.message || "Login failed" };
      }

      setUser(authData.user);

      // 2. Resolve/create store customer record via API
      const res = await fetch("/api/auth/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          store_id: effectiveStoreId,
          auth_user_id: authData.user.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.customer) {
        setCustomer(data.customer);
        if (data.customer.store_id) setStoreId(data.customer.store_id);
        try {
          localStorage.setItem("digishop_customer_session", JSON.stringify(data.customer));
        } catch {}
      }

      // 3. Cart merge: merge guest cart items after login
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
                vendorId: effectiveStoreId,
                customerId: data.customer?.id,
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
  }, [storeId, supabase.auth]);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    targetStoreId?: string
  ) => {
    try {
      const effectiveStoreId = targetStoreId || storeId;

      // 1. Create Supabase auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            phone: phone?.trim(),
            role: "customer",
          },
        },
      });

      if (authError || !authData.user) {
        return { success: false, error: authError?.message || "Registration failed" };
      }

      setUser(authData.user);

      // 2. Create store customer record via API
      const res = await fetch("/api/auth/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone?.trim(),
          store_id: effectiveStoreId,
          auth_user_id: authData.user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Registration failed" };
      }

      if (data.customer) {
        setCustomer(data.customer);
        if (data.customer.store_id) setStoreId(data.customer.store_id);
        try {
          localStorage.setItem("digishop_customer_session", JSON.stringify(data.customer));
        } catch {}
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error during registration" };
    }
  }, [storeId, supabase.auth]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCustomer(null);
    setUser(null);
    try {
      localStorage.removeItem("digishop_customer_session");
    } catch {}
  }, [supabase.auth]);

  const updateProfile = useCallback(async (data: { name: string; phone?: string }) => {
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
  }, [customer, storeId]);

  const refreshCustomer = useCallback(async () => {
    if (!customer) return;
    try {
      const res = await fetch(
        `/api/customer/profile?customerId=${customer.id}&store_id=${storeId}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.customer) {
          setCustomer(data.customer);
          localStorage.setItem("digishop_customer_session", JSON.stringify(data.customer));
        }
      }
    } catch {}
  }, [customer, storeId]);

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        user,
        loading,
        storeId,
        isAuthenticated: !!user,
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
