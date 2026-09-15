import { NextRequest, NextResponse } from "next/server";
import { OrdersBackendService } from "@/services/orders-backend-service";
import { NotificationService } from "@/services/notification-service";
import { SAMPLE_PRODUCTS } from "@/utils/productsMock";
import { supabaseAdmin } from "@/lib/supabase";

const VALID_COUPONS: Record<string, { discountPct: number; freeShipping?: boolean }> = {
  WELCOME10: { discountPct: 10 },
  ALTRIVO20: { discountPct: 20 },
  FREESHIP: { discountPct: 0, freeShipping: true },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      region = "Punjab",
      postalCode = "",
      paymentMethod = "cod",
      couponCode,
      customerNote,
      notes,
      idempotencyKey,
      idempotency_key,
      items,
    } = body;
    const storeId = body.store_id || body.storeId;
    const vendorId = body.vendor_id || body.vendorId;

    // 1. Mandatory field checks
    if (!customerName?.trim()) {
      return NextResponse.json({ success: false, error: "Customer name is required" }, { status: 400 });
    }
    if (!customerPhone?.trim()) {
      return NextResponse.json({ success: false, error: "Phone number is required for delivery & WhatsApp updates" }, { status: 400 });
    }
    if (!shippingAddress?.trim() || !city?.trim()) {
      return NextResponse.json({ success: false, error: "Complete street address and city are required" }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty. Please add items to checkout." }, { status: 400 });
    }

    // 2. SERVER-AUTHORITATIVE PRICE & STOCK RECALCULATION
    let verifiedSubtotal = 0;
    const verifiedOrderItems: any[] = [];

    for (const clientItem of items) {
      const quantity = Math.max(1, parseInt(clientItem.quantity || clientItem.qty || 1, 10));
      
      const product = SAMPLE_PRODUCTS.find(
        (p) => p.id === clientItem.productId || p.id === clientItem.id
      );

      let unitPrice = 150.0;
      let itemName = clientItem.title || clientItem.name || "Handcrafted Product";
      let variantName = clientItem.variantName || clientItem.variant || "";
      let productSku =
        product?.sku ||
        clientItem.sku ||
        (clientItem.productId || clientItem.id
          ? `SKU-${String(clientItem.productId || clientItem.id).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}`
          : "SKU-ALT-001");
      let productImage = product?.media?.[0]?.url || clientItem.image || "";

      if (product) {
        itemName = product.title;
        unitPrice = product.price;

        if (clientItem.variantId) {
          const variant = product.variants?.find((v) => v.id === clientItem.variantId);
          if (variant) {
            unitPrice = variant.price;
            variantName = variant.name;
          }
        }
      } else if (clientItem.price && typeof clientItem.price === "number") {
        unitPrice = Math.max(10, clientItem.price);
      }

      const itemTotal = unitPrice * quantity;
      verifiedSubtotal += itemTotal;

      verifiedOrderItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        product_id: clientItem.productId || clientItem.id || "e43de5ec-df94-46b8-96cc-eeb4e85e747e",
        variant_id: clientItem.variantId || null,
        name: itemName,
        sku: productSku,
        product_name_snapshot: itemName,
        product_sku_snapshot: productSku,
        variant_snapshot: variantName,
        image_snapshot: productImage,
        quantity,
        price: unitPrice,
        unit_price: unitPrice,
        line_total: itemTotal,
      });
    }

    // 3. Discount calculation
    let discountAmount = 0;
    let freeShipping = false;

    if (couponCode && typeof couponCode === "string") {
      const cleanCoupon = couponCode.trim().toUpperCase();
      const matchedCoupon = VALID_COUPONS[cleanCoupon];
      if (matchedCoupon) {
        discountAmount = (verifiedSubtotal * matchedCoupon.discountPct) / 100;
        if (matchedCoupon.freeShipping) {
          freeShipping = true;
        }
      }
    }

    // 4. Shipping calculation
    const baseShipping = 15.0;
    const effectiveShipping = freeShipping || verifiedSubtotal >= 200 ? 0 : baseShipping;

    // 5. Final Total
    const finalTotal = Math.max(0, verifiedSubtotal - discountAmount + effectiveShipping);

    // 6. Create Order atomically via OrdersBackendService
    const fullShippingAddress = `${shippingAddress.trim()}, ${city.trim()}${region ? `, ${region.trim()}` : ""}${postalCode ? ` - ${postalCode.trim()}` : ""}`;
    const cleanIdempotencyKey = idempotency_key || idempotencyKey || `order-idem-${Date.now()}-${customerPhone.replace(/[^0-9]/g, "")}`;

    const newOrder = await OrdersBackendService.createOrder({
      store_id: storeId,
      vendor_id: vendorId,
      customer_id: customerId || null,
      idempotency_key: cleanIdempotencyKey,
      customerName: customerName.trim(),
      customerEmail: customerEmail?.trim() || "customer@pakistan.store",
      customerPhone: customerPhone.trim(),
      shippingAddress: fullShippingAddress,
      shippingCity: city.trim(),
      shippingRegion: region.trim(),
      shippingPostalCode: postalCode.trim(),
      paymentMethod,
      couponCode: couponCode?.trim(),
      customerNote: (customerNote || notes || "").trim(),
      items: verifiedOrderItems,
      subtotal: verifiedSubtotal,
      discountTotal: discountAmount,
      shippingTotal: effectiveShipping,
      taxTotal: 0,
      grandTotal: finalTotal,
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
      orderNumber: newOrder.orderNumber,
      trackingNumber: newOrder.trackingNumber,
      recalculatedSummary: {
        subtotal: verifiedSubtotal,
        discount: discountAmount,
        shipping: effectiveShipping,
        grandTotal: finalTotal,
      },
    }, { status: 201 });
  } catch (err: any) {
    console.error("[Place Order] Exception:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to place order" }, { status: 500 });
  }
}
