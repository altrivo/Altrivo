"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { StoreCustomer } from "@/types/customer";

export interface CartItem {
  id: string;
  name: string;
  price: string; // E.g., "$85.00" or "$8,900"
  originalPrice?: string;
  image: string;
  quantity: number;
  variant?: string; // E.g., "Black / 42" or "Automatic 40mm"
  sku?: string;
  storeId?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  itemCount: number;
  cartTotal: string;
  rawSubtotal: number;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isTrackingOpen: boolean;
  trackingOrderNumber: string;
  storeId?: string;
  customer: StoreCustomer | null;
  isCustomerAuthOpen: boolean;
  isCheckoutGate: boolean;
  selectedProductForDetail: any | null;
  setIsCartOpen: (isOpen: boolean) => void;
  setIsCheckoutOpen: (isOpen: boolean) => void;
  setIsTrackingOpen: (isOpen: boolean) => void;
  setTrackingOrderNumber: (orderNumber: string) => void;
  setCustomer: (customer: StoreCustomer | null) => void;
  setIsCustomerAuthOpen: (isOpen: boolean) => void;
  setIsCheckoutGate: (isGate: boolean) => void;
  setSelectedProductForDetail: (product: any | null) => void;
  openProductDetail: (product: any) => void;
  logoutCustomer: () => void;
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  storeId = "default_store",
}: {
  children: React.ReactNode;
  storeId?: string;
}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState("");
  
  // Customer Auth state
  const [customer, setCustomer] = useState<StoreCustomer | null>(null);
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [isCheckoutGate, setIsCheckoutGate] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<any | null>(null);

  const openProductDetail = (product: any) => {
    setSelectedProductForDetail(product);
  };

  const normalizedStoreId = (storeId || "default_store").trim().toLowerCase();
  const customerSessionKey = `storefront_customer_session_${normalizedStoreId}`;

  // Sync customer session across browser tabs/windows (STRICTLY scoped to this store)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("customer_auth_channel");
      bc.onmessage = (event) => {
        // Strictly ignore events intended for a different store!
        const eventStore = event.data?.storeId ? String(event.data.storeId).trim().toLowerCase() : "";
        if (eventStore && eventStore !== normalizedStoreId) {
          return;
        }

        if (event.data?.type === "CUSTOMER_LOGIN" && event.data.customer) {
          const cust = event.data.customer;
          const matches =
            (cust.store_slug && cust.store_slug.toLowerCase() === normalizedStoreId) ||
            (cust.store_id && cust.store_id.toLowerCase() === normalizedStoreId) ||
            cust.store_id === storeId ||
            cust.store_slug === storeId;

          if (matches) {
            setCustomer(cust);
          }
        } else if (event.data?.type === "CUSTOMER_LOGOUT") {
          setCustomer(null);
        }
      };
    } catch (e) {}

    return () => {
      try {
        bc?.close();
      } catch (e) {}
    };
  }, [normalizedStoreId, storeId]);

  // Load customer session & cart from localStorage on mount (STRICTLY scoped to this store)
  useEffect(() => {
    try {
      // 1. Purge legacy global un-scoped session keys so they never leak across stores
      localStorage.removeItem("storefront_customer_session");
      localStorage.removeItem("digishop_customer_session");
      localStorage.removeItem("altrivo_customer_session");

      // 2. Read ONLY from store-scoped session key
      const savedCustomerRaw = localStorage.getItem(customerSessionKey);
      let activeCustomer: StoreCustomer | null = null;

      if (savedCustomerRaw) {
        try {
          const parsed: StoreCustomer = JSON.parse(savedCustomerRaw);
          const matches =
            Boolean(parsed) &&
            (
              (parsed.store_slug && parsed.store_slug.toLowerCase() === normalizedStoreId) ||
              (parsed.store_id && parsed.store_id.toLowerCase() === normalizedStoreId) ||
              parsed.store_id === storeId ||
              parsed.store_slug === storeId
            );

          if (matches) {
            activeCustomer = parsed;
            setCustomer(activeCustomer);
          } else {
            // Belongs to another store! Do NOT login on this store.
            localStorage.removeItem(customerSessionKey);
            setCustomer(null);
          }
        } catch {
          localStorage.removeItem(customerSessionKey);
          setCustomer(null);
        }
      } else {
        setCustomer(null);
      }

      // 3. Load cart strictly scoped to this store and customer (or guest)
      const activeStorageKey = activeCustomer
        ? `storefront_cart_${normalizedStoreId}_user_${activeCustomer.id}`
        : `storefront_cart_${normalizedStoreId}_guest`;

      const savedCart = localStorage.getItem(activeStorageKey);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]);
      }

      // Clean up legacy un-scoped carts
      localStorage.removeItem(`storefront_cart_${storeId}`);
      localStorage.removeItem(`storefront_cart_${normalizedStoreId}`);
    } catch (e) {
      console.error("Failed to load session/cart from storage", e);
    }
  }, [storeId, customerSessionKey, normalizedStoreId]);

  // Sync cart to customer-scoped localStorage on changes
  useEffect(() => {
    try {
      const activeStorageKey = customer
        ? `storefront_cart_${normalizedStoreId}_user_${customer.id}`
        : `storefront_cart_${normalizedStoreId}_guest`;
      localStorage.setItem(activeStorageKey, JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to storage", e);
    }
  }, [cartItems, customer, normalizedStoreId]);

  // Sync customer session to localStorage & isolate their cart
  const handleSetCustomer = (newCustomer: StoreCustomer | null) => {
    setCustomer(newCustomer);
    try {
      // Purge legacy global keys
      localStorage.removeItem("storefront_customer_session");
      localStorage.removeItem("digishop_customer_session");
      localStorage.removeItem("altrivo_customer_session");

      if (newCustomer) {
        localStorage.setItem(customerSessionKey, JSON.stringify(newCustomer));

        const userCartKey = `storefront_cart_${normalizedStoreId}_user_${newCustomer.id}`;
        const savedUserCart = localStorage.getItem(userCartKey);
        if (savedUserCart) {
          setCartItems(JSON.parse(savedUserCart));
        } else {
          setCartItems([]);
        }
      } else {
        localStorage.removeItem(customerSessionKey);
        setCartItems([]);
      }
    } catch (e) {}

    try {
      const bc = new BroadcastChannel("customer_auth_channel");
      bc.postMessage({
        type: newCustomer ? "CUSTOMER_LOGIN" : "CUSTOMER_LOGOUT",
        storeId: normalizedStoreId,
        customer: newCustomer,
      });
      bc.close();
    } catch (e) {}
  };

  const logoutCustomer = () => {
    handleSetCustomer(null);
    try {
      localStorage.removeItem(`storefront_cart_${normalizedStoreId}_guest`);
      localStorage.removeItem(`storefront_cart_${normalizedStoreId}`);
      localStorage.removeItem(`storefront_cart_${storeId}`);
    } catch (e) {}
  };

  const addToCart = (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const qtyToAdd = newItem.quantity || 1;
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === newItem.id);
      if (existing) {
        return prevItems.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        );
      }
      return [...prevItems, { ...newItem, quantity: qtyToAdd, storeId }];
    });
    setIsCartOpen(true); // Automatically open cart drawer on add
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      const activeStorageKey = customer
        ? `storefront_cart_${storeId}_user_${customer.id}`
        : `storefront_cart_${storeId}_guest`;
      localStorage.removeItem(activeStorageKey);
      localStorage.removeItem(`storefront_cart_${storeId}`);
    } catch (e) {}
  };

  // Helper to extract numerical price from formatted price strings
  const parseNumericPrice = (priceStr: string): number => {
    if (!priceStr) return 0;
    const numbersOnly = priceStr.replace(/[^\d.]/g, ""); // strip non-numeric
    return parseFloat(numbersOnly) || 0;
  };

  // Currency symbol - storefront uses USD ($)
  const detectCurrencySymbol = (_priceStr?: string): string => {
    return "$";
  };

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Compute total price string with $ currency
  const rawSubtotal = cartItems.reduce(
    (acc, item) => acc + parseNumericPrice(item.price) * item.quantity,
    0
  );

  const cartTotal = `$${rawSubtotal.toLocaleString()}`;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        cartTotal,
        rawSubtotal,
        isCartOpen,
        isCheckoutOpen,
        isTrackingOpen,
        trackingOrderNumber,
        storeId,
        customer,
        isCustomerAuthOpen,
        isCheckoutGate,
        selectedProductForDetail,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsTrackingOpen,
        setTrackingOrderNumber,
        setCustomer: handleSetCustomer,
        setIsCustomerAuthOpen,
        setIsCheckoutGate,
        setSelectedProductForDetail,
        openProductDetail,
        logoutCustomer,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
