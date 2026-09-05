import { NextRequest, NextResponse } from "next/server";
import { CartService } from "@/services/cart-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, customerId, vendorId, items, guestCookie } = body;

    if (!vendorId) {
      return NextResponse.json({ success: false, error: "Missing vendorId" }, { status: 400 });
    }

    if (action === "get") {
      const cartItems = await CartService.getCart(customerId, guestCookie);
      return NextResponse.json({ success: true, items: cartItems });
    }

    if (action === "save") {
      if (!items) {
        return NextResponse.json({ success: false, error: "Missing items" }, { status: 400 });
      }

      const result = await CartService.saveCart(vendorId, customerId, items);
      if (result.guestCookie) {
        const response = NextResponse.json({ success: true, items });
        // Set signed cart cookie for guests
        response.cookies.set("altrivo_guest_cart", result.guestCookie, {
          path: "/",
          maxAge: 30 * 24 * 60 * 60, // 30 days
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });
        return response;
      }

      return NextResponse.json({ success: true, items });
    }

    if (action === "merge") {
      if (!customerId) {
        return NextResponse.json({ success: false, error: "Missing customerId for merge" }, { status: 400 });
      }
      if (!items) {
        return NextResponse.json({ success: false, error: "Missing guest items to merge" }, { status: 400 });
      }

      const mergedCart = await CartService.mergeCarts(vendorId, customerId, items);
      
      // Clear guest cookie after merge
      const response = NextResponse.json({ success: true, items: mergedCart.items });
      response.cookies.delete("altrivo_guest_cart");
      return response;
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process cart request" },
      { status: 500 }
    );
  }
}
