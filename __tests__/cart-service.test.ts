import { CartService, CartItem } from "../services/cart-service";

describe("CartService Backend & Guest Cookie Mocks", () => {
  beforeEach(() => {
    CartService.resetStore();
  });

  it("handles guest cart signing and parsing with valid signatures", () => {
    const items: CartItem[] = [
      { productId: "p1", qty: 2, unitPrice: 10.0 },
      { productId: "p2", variantId: "v1", qty: 1, unitPrice: 25.0 },
    ];

    const signedCookie = CartService.signCartPayload(items);
    expect(signedCookie).toContain(".");

    const parsedItems = CartService.verifyAndParseCart(signedCookie);
    expect(parsedItems.length).toBe(2);
    expect(parsedItems[0].productId).toBe("p1");
    expect(parsedItems[1].variantId).toBe("v1");
  });

  it("rejects guest cart cookie payload if signature is tampered", () => {
    const items: CartItem[] = [{ productId: "p1", qty: 2, unitPrice: 10.0 }];
    const signedCookie = CartService.signCartPayload(items);
    
    // Tamper the base64 payload part
    const parts = signedCookie.split(".");
    const tamperedPayload = Buffer.from(JSON.stringify([{ productId: "p1", qty: 99, unitPrice: 10.0 }])).toString("base64");
    const tamperedCookie = `${tamperedPayload}.${parts[1]}`;

    const parsedItems = CartService.verifyAndParseCart(tamperedCookie);
    expect(parsedItems.length).toBe(0);
  });

  it("saves and retrieves cart for logged-in customers in store", async () => {
    const items: CartItem[] = [{ productId: "p3", qty: 1, unitPrice: 100.0 }];
    
    await CartService.saveCart("vendor_1", "customer_123", items);
    const cart = await CartService.getCart("customer_123");
    
    expect(cart.length).toBe(1);
    expect(cart[0].productId).toBe("p3");
  });

  it("correctly merges guest cart items into customer cart on login", async () => {
    const customerItems: CartItem[] = [
      { productId: "p1", qty: 1, unitPrice: 10.0 }, // overlaps
      { productId: "p2", qty: 2, unitPrice: 20.0 }, // customer only
    ];
    const guestItems: CartItem[] = [
      { productId: "p1", qty: 2, unitPrice: 10.0 }, // overlaps
      { productId: "p3", qty: 1, unitPrice: 30.0 }, // guest only
    ];

    await CartService.saveCart("vendor_1", "customer_123", customerItems);
    const mergedCart = await CartService.mergeCarts("vendor_1", "customer_123", guestItems);

    expect(mergedCart.items.length).toBe(3);
    
    // Check overlap quantity addition: p1 should have qty 3 (1 from customer + 2 from guest)
    const p1Item = mergedCart.items.find(i => i.productId === "p1");
    expect(p1Item?.qty).toBe(3);

    // Check customer-only item: p2 should have qty 2
    const p2Item = mergedCart.items.find(i => i.productId === "p2");
    expect(p2Item?.qty).toBe(2);

    // Check guest-only item: p3 should have qty 1
    const p3Item = mergedCart.items.find(i => i.productId === "p3");
    expect(p3Item?.qty).toBe(1);
  });

  it("cleans up idle carts older than 30 days", async () => {
    // Save standard cart (active)
    await CartService.saveCart("vendor_1", "customer_active", [{ productId: "p1", qty: 1, unitPrice: 10.0 }]);
    
    // Insert mock idle cart directly to store database
    const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
    // @ts-ignore (injecting directly to test cleanup)
    CartService.saveCart("vendor_1", "customer_idle", [{ productId: "p2", qty: 1, unitPrice: 15.0 }]);
    
    // Manually force old date
    // @ts-ignore
    const idleCart = CartService.getCart("customer_idle"); 
    // @ts-ignore
    const allCarts = CartService["cartsStore"] || [];
    const idleCartRec = allCarts.find((c: any) => c.customer_id === "customer_idle");
    if (idleCartRec) {
      idleCartRec.updated_at = oldDate;
    }

    const removedCount = await CartService.cleanupIdleCarts();
    expect(removedCount).toBe(1);

    const activeCart = await CartService.getCart("customer_active");
    expect(activeCart.length).toBe(1);

    const checkIdle = await CartService.getCart("customer_idle");
    expect(checkIdle.length).toBe(0);
  });
});
