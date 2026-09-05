"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { StoreCustomer } from "@/types/customer";

export interface CartItem {
  id: string;
  name: string;
  price: string; // E.g., "₨ 8,900" or "$85.00"
  originalPrice?: string;
  image: string;
  quantity: number;
  variant?: string; // E.g., "Black / 42" or "Automatic 40mm"
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

  const customerSessionKey = `storefront_customer_session_${storeId || "default_store"}`;

  // Load customer session & cart from localStorage on mount
  useEffect(() => {
    try {
      // 1. First restore customer session if exists
      const savedCustomer = localStorage.getItem(customerSessionKey);
      let activeCustomer: StoreCustomer | null = null;
      if (savedCustomer) {
        activeCustomer = JSON.parse(savedCustomer);
        setCustomer(activeCustomer);
      }

      // 2. Load cart strictly scoped to this customer (or guest)
      const activeStorageKey = activeCustomer
        ? `storefront_cart_${storeId}_user_${activeCustomer.id}`
        : `storefront_cart_${storeId}_guest`;

      const savedCart = localStorage.getItem(activeStorageKey);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]);
      }

      // Clean up any un-scoped legacy test cart from old sessions
      localStorage.removeItem(`storefront_cart_${storeId}`);
    } catch (e) {
      console.error("Failed to load session/cart from storage", e);
    }
  }, [storeId, customerSessionKey]);

  // Sync cart to customer-scoped localStorage on changes
  useEffect(() => {
    try {
      const activeStorageKey = customer
        ? `storefront_cart_${storeId}_user_${customer.id}`
        : `storefront_cart_${storeId}_guest`;
      localStorage.setItem(activeStorageKey, JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to storage", e);
    }
  }, [cartItems, customer, storeId]);

  // Sync customer session to localStorage & isolate their cart
  const handleSetCustomer = (newCustomer: StoreCustomer | null) => {
    setCustomer(newCustomer);
    try {
      if (newCustomer) {
        localStorage.setItem(customerSessionKey, JSON.stringify(newCustomer));
        const userCartKey = `storefront_cart_${storeId}_user_${newCustomer.id}`;
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
  };

  const logoutCustomer = () => {
    setCustomer(null);
    setCartItems([]);
    try {
      localStorage.removeItem(customerSessionKey);
      localStorage.removeItem(`storefront_cart_${storeId}_guest`);
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

  // Helper to extract currency symbols (e.g. Rs. or ₨ or $)
  const detectCurrencySymbol = (priceStr: string): string => {
    if (!priceStr) return "₨ ";
    const matches = priceStr.match(/^[^0-9]*/);
    return matches ? matches[0].trim() + " " : "₨ ";
  };

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Compute total price string with dynamic currency symbol resolution
  const rawSubtotal = cartItems.reduce(
    (acc, item) => acc + parseNumericPrice(item.price) * item.quantity,
    0
  );

  const currencySymbol = cartItems.length > 0 ? detectCurrencySymbol(cartItems[0].price) : "₨ ";
  const cartTotal = `${currencySymbol}${rawSubtotal.toLocaleString()}`;

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
