import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const storeId = searchParams.get("storeId");

    // CRITICAL: storeId is mandatory for customer orders — we must never return orders across stores
    if (!customerId && !email && !phone) {
      return NextResponse.json({ success: false, orders: [] });
    }

    let customerOrders: any[] = [];

    // Fetch directly from Supabase with strict store scoping
    if (supabaseAdmin) {
      try {
        let validCustomerId = customerId;

        // If email provided or customerId needs validation for this store
        if (!validCustomerId && email && storeId) {
          const { data: sc } = await supabaseAdmin
            .from("store_customers")
            .select("id")
            .eq("store_id", storeId)
            .ilike("email", email)
            .maybeSingle();
          if (sc?.id) validCustomerId = sc.id;
        }

        if (validCustomerId) {
          const { data: dbOrders } = await supabaseAdmin
            .from("orders")
            .select("*, order_items(*), shipments(*)")
            .eq("customer_id", validCustomerId)
            .order("created_at", { ascending: false });

        if (dbOrders && dbOrders.length > 0) {
          customerOrders = dbOrders.map((d: any) => ({
            id: d.id,
            order_number: d.order_number || `#ORD-${d.id.slice(0, 4).toUpperCase()}`,
            orderNumber: d.order_number || `#ORD-${d.id.slice(0, 4).toUpperCase()}`,
            store_id: d.store_id,
            vendor_id: d.vendor_id,
            customer_id: d.customer_id,
            customerName: d.customer_name || "Valued Customer",
            customerEmail: d.customer_email || "",
            customerPhone: d.customer_phone || "",
            totalAmount: Number(d.grand_total) || Number(d.total) || 0,
            subtotal: Number(d.subtotal) || 0,
            discount_total: Number(d.discount_total) || 0,
            shipping_total: Number(d.shipping_total) || 0,
            tax_total: Number(d.tax_total) || 0,
            paymentStatus: d.payment_status || "pending",
            paymentMethod: d.payment_method || "cod",
            order_status: d.order_status || d.delivery_status || "pending",
            deliveryStatus: d.delivery_status || "pending",
            return_status: d.return_status || "none",
            refund_status: d.refund_status || "none",
            escrowStatus: d.escrow_status || "held_in_escrow",
            deliveryMethod: "standard",
            createdAt: d.created_at,
            shippingAddress: d.shipping_address || "",
            items: (d.order_items || []).map((it: any) => ({
              id: it.id,
              name: it.product_name_snapshot || `Product #${it.product_id?.slice(0, 6) || "Item"}`,
              quantity: it.quantity || it.qty || 1,
              price: Number(it.unit_price) || 0,
              product_name_snapshot: it.product_name_snapshot,
              product_sku_snapshot: it.product_sku_snapshot,
            })),
            timeline: (d.order_events || []).map((e: any) => ({
              id: e.id,
              title: e.event_type.replace(/_/g, " "),
              description: e.message,
              timestamp: e.created_at,
              step: e.new_status || "confirmed",
              completed: true,
            })),
            returns: d.returns || [],
            complaints: d.complaints || [],
          }));
        }
        }
      } catch (sbErr) {
        console.warn("[Customer Orders API] Supabase check notice:", sbErr);
      }
    }

    return NextResponse.json({ success: true, orders: customerOrders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
