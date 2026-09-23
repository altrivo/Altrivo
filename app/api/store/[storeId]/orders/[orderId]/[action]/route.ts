/**
 * DigiShop AI — Customer Order Actions API
 * 
 * Handles customer-side order actions:
 *   /api/store/[storeId]/orders/[orderId]/cancel
 *   /api/store/[storeId]/orders/[orderId]/return
 *   /api/store/[storeId]/orders/[orderId]/complaint
 *   /api/store/[storeId]/orders/[orderId]/tracking
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession, AuthError } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ storeId: string; orderId: string; action: string }> }
) {
  const { storeId, orderId, action } = await params;

  if (action === "tracking") {
    return handleGetTracking(storeId, orderId);
  }

  return NextResponse.json({ success: false, error: "Method not allowed for this action" }, { status: 405 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; orderId: string; action: string }> }
) {
  const { storeId, orderId, action } = await params;

  switch (action) {
    case "cancel":
      return handleCancel(request, storeId, orderId);
    case "return":
      return handleReturn(request, storeId, orderId);
    case "complaint":
      return handleComplaint(request, storeId, orderId);
    default:
      return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  }
}

// ─── Tracking ────────────────────────────────────────────────────────────────

async function handleGetTracking(storeId: string, orderId: string) {
  try {
    const user = await getServerSession();
    const db = supabaseAdmin;
    if (!db) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    // Verify the order exists and belongs to this store
    const { data: order } = await db
      .from("orders")
      .select("id, order_status, delivery_status, customer_id, vendor_id")
      .eq("id", orderId)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Verify order belongs to this store
    let matchesStore = false;
    if (order.customer_id) {
      const { data: sc } = await db
        .from("store_customers")
        .select("id")
        .eq("id", order.customer_id)
        .eq("store_id", storeId)
        .maybeSingle();
      if (sc) matchesStore = true;
    }
    if (!matchesStore && order.vendor_id) {
      const { data: storeRow } = await db
        .from("stores")
        .select("id, vendor_id")
        .eq("id", storeId)
        .maybeSingle();
      if (storeRow && storeRow.vendor_id === order.vendor_id) {
        matchesStore = true;
      }
    }
    if (!matchesStore) {
      return NextResponse.json({ success: false, error: "Order not found for this store" }, { status: 404 });
    }

    // If authenticated, verify customer ownership
    if (user) {
      const { data: customer } = await db
        .from("store_customers")
        .select("id")
        .eq("auth_user_id", user.id)
        .eq("store_id", storeId)
        .maybeSingle();

      if (customer && order.customer_id !== customer.id) {
        return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
      }
    }

    // Fetch shipments and events
    const { data: shipments } = await db
      .from("shipments")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    let shipmentEvents: any[] = [];
    if (shipments && shipments.length > 0) {
      const shipmentIds = shipments.map((s) => s.id);
      const { data: events } = await db
        .from("shipment_events")
        .select("*")
        .in("shipment_id", shipmentIds)
        .order("event_time", { ascending: true });
      shipmentEvents = events || [];
    }

    // Fetch order events for timeline
    const { data: orderEvents } = await db
      .from("order_events")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      success: true,
      tracking: {
        order_status: order.order_status,
        delivery_status: order.delivery_status,
        shipments: shipments || [],
        shipment_events: shipmentEvents,
        timeline: orderEvents || [],
      },
    });
  } catch (error) {
    console.error("[Customer Tracking] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// ─── Cancel ──────────────────────────────────────────────────────────────────

async function handleCancel(req: NextRequest, storeId: string, orderId: string) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ success: false, error: "Login required" }, { status: 401 });

    const db = supabaseAdmin;
    if (!db) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    // Verify customer owns this order
    const { data: customer } = await db
      .from("store_customers")
      .select("id")
      .eq("auth_user_id", user.id)
      .eq("store_id", storeId)
      .maybeSingle();

    if (!customer) return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });

    const { data: order } = await db
      .from("orders")
      .select("id, order_status, customer_id")
      .eq("id", orderId)
      .eq("customer_id", customer.id)
      .single();

    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    // Customer can only cancel pending/confirmed orders
    const cancellableStatuses = ["pending", "confirmed"];
    if (!cancellableStatuses.includes(order.order_status || "")) {
      return NextResponse.json(
        { success: false, error: `Cannot cancel order in '${order.order_status}' status` },
        { status: 409 }
      );
    }

    const body = await req.json().catch(() => ({}));

    await db
      .from("orders")
      .update({
        order_status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_by: "customer",
        cancellation_reason: body.reason || "Cancelled by customer",
      })
      .eq("id", orderId);

    // Audit trail
    await db.from("order_events").insert({
      order_id: orderId,
      store_id: storeId,
      event_type: "ORDER_CANCELLED",
      old_status: order.order_status,
      new_status: "cancelled",
      actor_type: "customer",
      actor_id: user.id,
      message: body.reason || "Order cancelled by customer",
    });

    // Release stock reservations
    await db
      .from("stock_reservations")
      .update({ status: "released" })
      .eq("order_id", orderId)
      .eq("status", "reserved");

    return NextResponse.json({ success: true, message: "Order cancelled" });
  } catch (error) {
    console.error("[Customer Cancel] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// ─── Return ──────────────────────────────────────────────────────────────────

async function handleReturn(req: NextRequest, storeId: string, orderId: string) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ success: false, error: "Login required" }, { status: 401 });

    const db = supabaseAdmin;
    if (!db) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const { data: customer } = await db
      .from("store_customers")
      .select("id")
      .eq("auth_user_id", user.id)
      .eq("store_id", storeId)
      .maybeSingle();

    if (!customer) return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });

    const { data: order } = await db
      .from("orders")
      .select("id, order_status, customer_id")
      .eq("id", orderId)
      .eq("customer_id", customer.id)
      .single();

    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    // Only delivered/completed orders can be returned
    if (!["delivered", "completed"].includes(order.order_status || "")) {
      return NextResponse.json(
        { success: false, error: "Returns are only available for delivered orders" },
        { status: 409 }
      );
    }

    const body = await req.json();
    if (!body.reason?.trim()) {
      return NextResponse.json({ success: false, error: "Return reason is required" }, { status: 400 });
    }

    const { data: returnRecord, error } = await db
      .from("returns")
      .insert({
        store_id: storeId,
        order_id: orderId,
        customer_id: customer.id,
        status: "requested",
        reason: body.reason.trim(),
        description: body.description?.trim(),
        items: body.items || [],
      })
      .select()
      .single();

    if (error) {
      console.error("[Customer Return] Insert error:", error);
      return NextResponse.json({ success: false, error: "Failed to create return request" }, { status: 500 });
    }

    // Update order return status
    await db.from("orders").update({ return_status: "requested" }).eq("id", orderId);

    // Audit trail
    await db.from("order_events").insert({
      order_id: orderId,
      store_id: storeId,
      event_type: "RETURN_REQUESTED",
      actor_type: "customer",
      actor_id: user.id,
      message: `Return requested: ${body.reason.trim()}`,
    });

    return NextResponse.json({ success: true, return: returnRecord, message: "Return request submitted" });
  } catch (error) {
    console.error("[Customer Return] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// ─── Complaint ───────────────────────────────────────────────────────────────

async function handleComplaint(req: NextRequest, storeId: string, orderId: string) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ success: false, error: "Login required" }, { status: 401 });

    const db = supabaseAdmin;
    if (!db) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const { data: customer } = await db
      .from("store_customers")
      .select("id, name")
      .eq("auth_user_id", user.id)
      .eq("store_id", storeId)
      .maybeSingle();

    if (!customer) return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });

    // Verify order belongs to customer
    const { data: order } = await db
      .from("orders")
      .select("id, customer_id")
      .eq("id", orderId)
      .eq("customer_id", customer.id)
      .single();

    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    const body = await req.json();
    if (!body.subject?.trim()) {
      return NextResponse.json({ success: false, error: "Complaint subject is required" }, { status: 400 });
    }

    // Create complaint
    const { data: complaint, error } = await db
      .from("complaints")
      .insert({
        store_id: storeId,
        order_id: orderId,
        customer_id: customer.id,
        subject: body.subject.trim(),
        category: body.category || "general",
        priority: body.priority || "medium",
        description: body.description?.trim(),
        status: "open",
      })
      .select()
      .single();

    if (error) {
      console.error("[Customer Complaint] Insert error:", error);
      return NextResponse.json({ success: false, error: "Failed to create complaint" }, { status: 500 });
    }

    // Create initial message
    if (body.message?.trim()) {
      await db.from("complaint_messages").insert({
        complaint_id: complaint.id,
        sender_type: "customer",
        sender_id: user.id,
        sender_name: customer.name,
        message: body.message.trim(),
        attachments: body.attachments || [],
      });
    }

    // Audit trail
    await db.from("order_events").insert({
      order_id: orderId,
      store_id: storeId,
      event_type: "COMPLAINT_CREATED",
      actor_type: "customer",
      actor_id: user.id,
      message: `Complaint filed: ${body.subject.trim()}`,
    });

    return NextResponse.json({ success: true, complaint, message: "Complaint submitted" });
  } catch (error) {
    console.error("[Customer Complaint] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
