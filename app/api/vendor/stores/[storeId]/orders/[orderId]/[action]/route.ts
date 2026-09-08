/**
 * DigiShop AI — Vendor Order Action API
 * 
 * POST: Perform vendor actions on orders (confirm, pack, ship, cancel, refund)
 * Enforces vendor-store ownership and order state machine transitions.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireVendorStoreAccess, AuthError } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase";

// Valid order status transitions (state machine)
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["ready_to_ship", "cancelled"],
  ready_to_ship: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
};

// Map action names to target states
const ACTION_MAP: Record<string, { orderStatus: string; fulfillmentStatus?: string; deliveryStatus?: string }> = {
  confirm: { orderStatus: "confirmed" },
  process: { orderStatus: "processing", fulfillmentStatus: "processing" },
  pack: { orderStatus: "packed", fulfillmentStatus: "packed" },
  ready_to_ship: { orderStatus: "ready_to_ship", fulfillmentStatus: "ready_to_ship" },
  ship: { orderStatus: "shipped", fulfillmentStatus: "fulfilled", deliveryStatus: "shipment_created" },
  deliver: { orderStatus: "delivered", deliveryStatus: "delivered" },
  complete: { orderStatus: "completed" },
  cancel: { orderStatus: "cancelled" },
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; orderId: string; action: string }> }
) {
  try {
    const { storeId, orderId, action } = await params;
    const ctx = await requireVendorStoreAccess(storeId);

    const db = supabaseAdmin;
    if (!db) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    // Validate action
    const actionConfig = ACTION_MAP[action];
    if (!actionConfig) {
      return NextResponse.json(
        { success: false, error: `Invalid action: ${action}. Valid: ${Object.keys(ACTION_MAP).join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch current order
    const { data: order, error: orderError } = await db
      .from("orders")
      .select("id, order_status, store_id, vendor_id")
      .eq("id", orderId)
      .eq("store_id", storeId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Verify state machine transition
    const currentStatus = order.order_status || "pending";
    const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(actionConfig.orderStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot transition from '${currentStatus}' to '${actionConfig.orderStatus}'. Allowed: ${allowedNext.join(", ") || "none"}`,
        },
        { status: 409 }
      );
    }

    // Parse request body for optional data (cancellation reason, tracking info, etc.)
    let bodyData: Record<string, any> = {};
    try {
      bodyData = await request.json();
    } catch {
      // No body is fine for most actions
    }

    // Build update
    const updates: Record<string, any> = {
      order_status: actionConfig.orderStatus,
    };

    if (actionConfig.fulfillmentStatus) {
      updates.fulfillment_status = actionConfig.fulfillmentStatus;
    }
    if (actionConfig.deliveryStatus) {
      updates.delivery_status = actionConfig.deliveryStatus;
    }

    // Handle cancellation
    if (action === "cancel") {
      updates.cancelled_at = new Date().toISOString();
      updates.cancelled_by = "vendor";
      updates.cancellation_reason = bodyData.reason || "Cancelled by vendor";
    }

    // Handle completion
    if (action === "complete") {
      updates.completed_at = new Date().toISOString();
    }

    // Handle vendor note
    if (bodyData.vendor_note) {
      updates.vendor_note = bodyData.vendor_note;
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await db
      .from("orders")
      .update(updates)
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("[Vendor Order Action] Update error:", updateError);
      return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
    }

    // Create order event (audit trail)
    await db.from("order_events").insert({
      order_id: orderId,
      store_id: storeId,
      event_type: `ORDER_${action.toUpperCase()}`,
      old_status: currentStatus,
      new_status: actionConfig.orderStatus,
      actor_type: "vendor",
      actor_id: ctx.user.id,
      message: `Order ${action}ed by vendor`,
      metadata: bodyData,
    });

    // If shipping, create shipment record if tracking info provided
    if (action === "ship" && bodyData.tracking_number) {
      await db.from("shipments").insert({
        order_id: orderId,
        store_id: storeId,
        courier_provider: bodyData.courier_provider || "manual",
        courier_name: bodyData.courier_name || "Manual Shipping",
        tracking_number: bodyData.tracking_number,
        waybill_number: bodyData.waybill_number,
        status: "shipment_created",
        estimated_delivery: bodyData.estimated_delivery,
        shipped_at: new Date().toISOString(),
      });
    }

    // If cancelling, release stock reservations
    if (action === "cancel") {
      await db
        .from("stock_reservations")
        .update({ status: "released" })
        .eq("order_id", orderId)
        .eq("status", "reserved");
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order ${action}ed successfully`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    console.error("[Vendor Order Action] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
