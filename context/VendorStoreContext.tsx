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

export function VendorStoreProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<VendorStore[]>([]);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [activeStoreId, setActiveStoreIdState] = useState<string | null>(null);
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
            setActiveStoreId(newStoreIdToActivate);
          } else {
            // Check stored preference
            let preferredId: string | null = null;
            try {
              preferredId = localStorage.getItem("active_store_id");
            } catch {}

            // Validate that preferredId actually belongs to this vendor
            const match = vendorStores.find((s) => s.id === preferredId);
            if (match) {
              setActiveStoreIdState(match.id);
            } else if (vendorStores.length > 0) {
              setActiveStoreId(vendorStores[0].id);
            } else {
              setActiveStoreIdState(null);
            }
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

  const activeStore = stores.find((s) => s.id === activeStoreId) || (stores.length > 0 ? stores[0] : null);

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
