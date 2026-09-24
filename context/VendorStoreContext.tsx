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
    if (typeof window === "undefined") return null;
    const vendorId = localStorage.getItem("active_vendor_id");
    if (!vendorId) return null;
    return localStorage.getItem("active_store_id");
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

          if (typeof window !== "undefined" && vendorStores.length > 0) {
            try {
              const currentMap = JSON.parse(localStorage.getItem("artrivo_store_aliases") || "{}");
              vendorStores.forEach((s) => {
                if (s.id && s.slug) {
                  currentMap[s.id] = s.slug;
                  currentMap[s.slug] = s.id;
                }
              });
              localStorage.setItem("artrivo_store_aliases", JSON.stringify(currentMap));
            } catch {}
          }

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
            } else if (vendorStores.length === 0) {
              // Vendor has no stores yet — clear any stale activeStoreId
              setActiveStoreIdState(null);
              try {
                localStorage.removeItem("active_store_id");
                document.cookie = "active_store_id=; path=/; max-age=0";
              } catch {}
            }
            // If match found, keep the existing state — no update needed (avoids flicker)
          }
        } else {
          setVendor(null);
          setStores([]);
          setActiveStoreIdState(null);
          try {
            localStorage.removeItem("active_store_id");
            document.cookie = "active_store_id=; path=/; max-age=0";
          } catch {}
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

  const activeStore = stores.find((s) => s.id === activeStoreId) || null;
  const hasStore = stores.length > 0;

  return (
    <VendorStoreContext.Provider
      value={{
        stores,
        activeStore,
        activeStoreId,
        setActiveStoreId,
        vendor,
        hasStore,
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
    return {
      stores: [] as VendorStore[],
      activeStore: null as VendorStore | null,
      activeStoreId: null as string | null,
      setActiveStoreId: () => {},
      vendor: null as VendorProfile | null,
      hasStore: false,
      isLoading: false,
      refreshStores: async () => {},
    };
  }
  return context;
}
