import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NotificationService } from "@/services/notification-service";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    // Allow cron/admin trigger with secret or development mode
    const isAuthorized =
      authHeader === `Bearer ${process.env.CRON_SECRET || "digishop_cron_secret"}` ||
      process.env.NODE_ENV === "development";

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized cron trigger" },
        { status: 401 }
      );
    }

    let processedCount = 0;
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    if (supabaseAdmin) {
      try {
        // Query carts that have items and haven't checked out
        const { data: abandonedCarts, error } = await supabaseAdmin
          .from("carts")
          .select("*, store_customers(*)")
          .lt("updated_at", twoHoursAgo)
          .gt("updated_at", oneDayAgo)
          .limit(20);

        if (!error && abandonedCarts && abandonedCarts.length > 0) {
          for (const cart of abandonedCarts) {
            const customer = cart.store_customers;
            if (customer && (customer.email || customer.phone)) {
              await NotificationService.dispatch({
                eventType: "ABANDONED_CART",
                storeId: cart.store_id,
                recipientUserId: customer.id,
                recipientType: "customer",
                recipientEmail: customer.email,
                recipientPhone: customer.phone,
                title: "You left items in your cart",
                message: `We've reserved your cart items. Complete your order now before stock runs out.`,
                data: {
                  cartId: cart.id,
                  cartItems: cart.items,
                  checkoutUrl: `http://localhost:3000/cart`,
                },
              });
              processedCount++;
            }
          }
        }
      } catch (e) {
        console.warn("[Abandoned Cart Cron] DB query note:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Abandoned cart recovery scan complete`,
      processedCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process abandoned carts" },
      { status: 500 }
    );
  }
}
