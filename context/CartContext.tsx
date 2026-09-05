"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string; // unique item entry key
  productId: string;
  title: string;
  variantName: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  sku: string;
}

export interface Coupon {
  code: string;
  discountPct: number;
  description: string;
  freeShipping?: boolean;
}

const VALID_COUPONS: Record<string, Coupon> = {
  WELCOME10: { code: "WELCOME10", discountPct: 10, description: "10% OFF Welcome Discount" },
  ALTRIVO20: { code: "ALTRIVO20", discountPct: 20, description: "20% OFF Summer VIP Deal" },
  FREESHIP: { code: "FREESHIP", discountPct: 0, description: "Free Express Shipping", freeShipping: true },
};

interface CartContextType {
  items: CartItem[];
  isDrawerOpen: boolean;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  shippingCost: number;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  clearCart: () => void;
  subtotal: number;
  discountAmount: number;
  effectiveShippingCost: number;
  taxAmount: number;
  grandTotal: number;
  totalItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const INITIAL_DEMO_ITEMS: CartItem[] = [
  {
    id: "cart-101",
    productId: "p-101",
    title: "Handcrafted Celestial Harmony Canvas Art",
    variantName: "24 x 36 Inches / Natural Oak Frame",
    price: 290.0,
    originalPrice: 350.0,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80",
    sku: "ART-CEL-2436-OAK",
  },
];

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(15.0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("altrio_vendor_cart");
      const savedCoupon = localStorage.getItem("altrio_vendor_coupon");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      } else {
        setItems(INITIAL_DEMO_ITEMS);
      }
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      setItems(INITIAL_DEMO_ITEMS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("altrio_vendor_cart", JSON.stringify(items));
      if (appliedCoupon) {
        localStorage.setItem("altrio_vendor_coupon", JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem("altrio_vendor_coupon");
      }
    } catch (e) {
      console.error(e);
    }
  }, [items, appliedCoupon, isLoaded]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  const addToCart = (newItem: Omit<CartItem, "id">) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.productId === newItem.productId && i.variantName === newItem.variantName
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += newItem.quantity;
        return updated;
      }

      return [
        ...prev,
        {
          ...newItem,
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        },
      ];
    });

    openDrawer();
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const applyCoupon = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    setCouponError(null);

    if (!cleanCode) {
      setCouponError("Please enter a valid promo code.");
      return false;
    }

    if (VALID_COUPONS[cleanCode]) {
      setAppliedCoupon(VALID_COUPONS[cleanCode]);
      setCouponError(null);
      return true;
    }

    setCouponError("Invalid promo code. Try 'WELCOME10' or 'ALTRIVO20'");
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const clearCart = () => {
    setItems([]);
    removeCoupon();
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon
    ? (subtotal * appliedCoupon.discountPct) / 100
    : 0;
  const effectiveShippingCost =
    subtotal === 0 ? 0 : appliedCoupon?.freeShipping || subtotal > 150 ? 0 : shippingCost;
  const taxAmount = (subtotal - discountAmount) * 0.08;
  const grandTotal = Math.max(0, subtotal - discountAmount + effectiveShippingCost + taxAmount);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isDrawerOpen,
        appliedCoupon,
        couponError,
        shippingCost,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyCoupon,
        removeCoupon,
        clearCart,
        subtotal,
        discountAmount,
        effectiveShippingCost,
        taxAmount,
        grandTotal,
        totalItemCount,
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
