import crypto from "crypto";

export interface CartItem {
  productId: string;
  variantId?: string;
  qty: number;
  unitPrice: number;
}

export interface CartRecord {
  id: string;
  customer_id?: string;
  vendor_id: string;
  items: CartItem[];
  updated_at: string;
}

// In-memory mock database store for carts (matching codebase conventions)
let cartsStore: CartRecord[] = [];
const COOKIE_SIGNING_SECRET = process.env.COOKIE_SIGNING_SECRET || "altrivo_default_secret_key";

export class CartService {
  static get cartsStore() {
    return cartsStore;
  }
  static set cartsStore(val) {
    cartsStore = val;
  }

  /**
   * Helper to sign cart payload for guests (guest cookie simulation)
   */
  static signCartPayload(items: CartItem[]): string {
    const payload = JSON.stringify(items);
    const signature = crypto
      .createHmac("sha256", COOKIE_SIGNING_SECRET)
      .update(payload)
      .digest("hex");
    return `${Buffer.from(payload).toString("base64")}.${signature}`;
  }

  /**
   * Helper to verify and parse signed cart cookie payload
   */
  static verifyAndParseCart(cookieValue: string): CartItem[] {
    try {
      const parts = cookieValue.split(".");
      if (parts.length !== 2) return [];
      
      const payloadBase64 = parts[0];
      const signature = parts[1];
      const payload = Buffer.from(payloadBase64, "base64").toString("utf8");
      
      const expectedSignature = crypto
        .createHmac("sha256", COOKIE_SIGNING_SECRET)
        .update(payload)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.warn("[CartService] Guest cart cookie signature mismatch.");
        return [];
      }

      return JSON.parse(payload);
    } catch (err) {
      console.error("[CartService] Failed to parse guest cookie:", err);
      return [];
    }
  }

  /**
   * Retrieve cart for a customer or guest
   */
  static async getCart(customerId?: string, guestCookie?: string): Promise<CartItem[]> {
    if (customerId) {
      const dbCart = cartsStore.find((c) => c.customer_id === customerId);
      if (dbCart) {
        // Update timestamp on access
        dbCart.updated_at = new Date().toISOString();
        return dbCart.items;
      }
      return [];
    }

    if (guestCookie) {
      return this.verifyAndParseCart(guestCookie);
    }

    return [];
  }

  /**
   * Save cart content
   */
  static async saveCart(
    vendorId: string,
    customerId: string | undefined,
    items: CartItem[]
  ): Promise<{ customerCart?: CartRecord; guestCookie?: string }> {
    if (customerId) {
      let dbCart = cartsStore.find((c) => c.customer_id === customerId && c.vendor_id === vendorId);
      if (dbCart) {
        dbCart.items = items;
        dbCart.updated_at = new Date().toISOString();
      } else {
        dbCart = {
          id: `cart-${Date.now()}`,
          customer_id: customerId,
          vendor_id: vendorId,
          items,
          updated_at: new Date().toISOString(),
        };
        cartsStore.push(dbCart);
      }
      return { customerCart: dbCart };
    }

    // Guest cart -> return signed cookie payload
    const signedCookie = this.signCartPayload(items);
    return { guestCookie: signedCookie };
  }

  /**
   * Merge guest cart into customer cart on login
   */
  static async mergeCarts(vendorId: string, customerId: string, guestItems: CartItem[]): Promise<CartRecord> {
    let customerCart = cartsStore.find((c) => c.customer_id === customerId && c.vendor_id === vendorId);
    let customerItems: CartItem[] = customerCart ? [...customerCart.items] : [];

    // Merge logic: Combine quantities of duplicate items
    guestItems.forEach((gItem) => {
      const match = customerItems.find(
        (cItem) => cItem.productId === gItem.productId && cItem.variantId === gItem.variantId
      );

      if (match) {
        match.qty += gItem.qty;
      } else {
        customerItems.push({ ...gItem });
      }
    });

    if (customerCart) {
      customerCart.items = customerItems;
      customerCart.updated_at = new Date().toISOString();
    } else {
      customerCart = {
        id: `cart-${Date.now()}`,
        customer_id: customerId,
        vendor_id: vendorId,
        items: customerItems,
        updated_at: new Date().toISOString(),
      };
      cartsStore.push(customerCart);
    }

    return customerCart;
  }

  /**
   * Cleanup idle carts (older than 30 days)
   */
  static async cleanupIdleCarts(): Promise<number> {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const initialCount = cartsStore.length;
    
    cartsStore = cartsStore.filter((c) => {
      const updatedAtMs = new Date(c.updated_at).getTime();
      return updatedAtMs >= thirtyDaysAgo;
    });

    return initialCount - cartsStore.length;
  }

  /**
   * Reset store helper for test isolation
   */
  static resetStore() {
    cartsStore = [];
  }
}
