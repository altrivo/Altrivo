"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface VendorStore {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  is_published?: boolean;
  created_at?: string;
  layout_config?: any;
}

export interface VendorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  business_name?: string;
  category?: string;
  status?: string;
}

interface VendorStoreContextType {
  stores: VendorStore[];
  activeStore: VendorStore | null;
  activeStoreId: string | null;
  setActiveStoreId: (storeId: string) => void;
  vendor: VendorProfile | null;
  hasStore: boolean;
  isLoading: boolean;
  refreshStores: (newStoreIdToActivate?: string) => Promise<void>;
}

const VendorStoreContext = createContext<VendorStoreContextType | undefined>(undefined);

// Read saved store ID from localStorage synchronously before any render
function getPersistedStoreId(): string | null {
  try {
    return typeof window !== "undefined" ? localStorage.getItem("active_store_id") : null;
  } catch {
    return null;
  }
}

export function VendorStoreProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<VendorStore[]>([]);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);

  // Initialize from localStorage immediately — no delay, no flash
  const [activeStoreId, setActiveStoreIdState] = useState<string | null>(getPersistedStoreId);

  const [isLoading, setIsLoading] = useState(true);

  // Set active store ID with persistent cookie and localStorage storage
  const setActiveStoreId = useCallback((storeId: string) => {
    setActiveStoreIdState(storeId);
    try {
      localStorage.setItem("active_store_id", storeId);
      document.cookie = `active_store_id=${storeId}; path=/; max-age=604800; SameSite=Lax`;
    } catch {}
  }, []);

  const refreshStores = useCallback(async (newStoreIdToActivate?: string) => {
    try {
      const res = await fetch("/api/auth/vendor/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.vendor) {
          setVendor(data.vendor);
          const vendorStores: VendorStore[] = data.stores || [];
          setStores(vendorStores);

          if (newStoreIdToActivate) {
            // Explicit activation request (e.g. after creating a store)
            setActiveStoreId(newStoreIdToActivate);
          } else {
            // Restore the persisted preference — read again in case it changed
            const persistedId = getPersistedStoreId();
            const currentId = persistedId;

            // Only change if the current saved store doesn't belong to this vendor
            const match = currentId ? vendorStores.find((s) => s.id === currentId) : null;
            if (!match && vendorStores.length > 0) {
              // Persisted store not found for this vendor — default to first and save it
              setActiveStoreId(vendorStores[0].id);
            }
            // If match found, keep the existing state — no update needed (avoids flicker)
          }
        } else {
          setVendor(null);
          setStores([]);
          setActiveStoreIdState(null);
        }
      }
    } catch (err) {
      console.error("[VendorStoreContext] Failed to load stores:", err);
    } finally {
      setIsLoading(false);
    }
  }, [setActiveStoreId]);

  useEffect(() => {
    refreshStores();
  }, [refreshStores]);

  // Derive activeStore strictly from activeStoreId — never auto-switch to stores[0]
  const activeStore = activeStoreId
    ? (stores.find((s) => s.id === activeStoreId) ?? null)
    : stores.length > 0
    ? stores[0]  // Only use stores[0] as fallback if NO preference was ever saved
    : null;

  return (
    <VendorStoreContext.Provider
      value={{
        stores,
        activeStore,
        activeStoreId,
        setActiveStoreId,
        vendor,
        hasStore: stores.length > 0,
        isLoading,
        refreshStores,
      }}
    >
      {children}
    </VendorStoreContext.Provider>
  );
}

export function useVendorStore() {
  const context = useContext(VendorStoreContext);
  if (!context) {
    throw new Error("useVendorStore must be used within a VendorStoreProvider");
  }
  return context;
}
