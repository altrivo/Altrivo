/**
 * DigiShop AI — Master Responsive Email Templates
 * Branded for individual stores and platform events
 */

interface StoreBranding {
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  supportPhone?: string;
}

export class EmailTemplates {
  /**
   * 1. Customer Order Confirmation Email Template
   */
  static customerOrderConfirmation(order: any, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "DigiShop Store";
    const primaryColor = store?.primaryColor || "#0f172a";
    const itemsListHtml = (order.items || [])
      .map(
        (item: any) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 0; font-size: 13px; color: #1e293b;">
            <strong style="display: block; font-size: 13px;">${item.name}</strong>
            <span style="font-size: 11px; color: #64748b;">Variant: ${item.variant || "Standard"} • Qty: ${item.quantity}</span>
          </td>
          <td style="padding: 12px 0; font-size: 13px; color: #0f172a; text-align: right; font-weight: 700;">
            ₨ ${(item.price * item.quantity).toLocaleString()}
          </td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background: ${primaryColor}; padding: 28px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">${storeName}</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Order Confirmation • 100% Escrow Protected</p>
          </div>

          <!-- Body -->
          <div style="padding: 28px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 100px; padding: 6px 16px; color: #065f46; font-size: 12px; font-weight: 700;">
                ✓ Order Placed Successfully
              </div>
              <h2 style="font-size: 18px; color: #0f172a; margin: 14px 0 6px 0; font-weight: 800;">Thank you, ${order.customerName || "Valued Customer"}!</h2>
              <p style="font-size: 13px; color: #64748b; margin: 0;">We've received your order and our team is preparing it for shipment.</p>
            </div>

            <!-- Summary Table -->
            <div style="background: #f8fafc; border-radius: 16px; padding: 18px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
                <span style="color: #64748b;">Order Tracking Number:</span>
                <strong style="color: #0f172a; font-family: monospace; font-size: 13px;">${order.orderNumber}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
                <span style="color: #64748b;">Payment Method:</span>
                <strong style="color: #0f172a; text-transform: uppercase;">${order.paymentMethod === "cod" ? "Cash on Delivery (COD)" : "Online Escrow"}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span style="color: #64748b;">Delivery Destination:</span>
                <strong style="color: #0f172a; text-align: right; max-width: 60%;">${order.shippingAddress}</strong>
              </div>
            </div>

            <!-- Items -->
            <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              ${itemsListHtml}
              <tr>
                <td style="padding: 14px 0 0 0; font-size: 14px; font-weight: 800; color: #0f172a;">Grand Total</td>
                <td style="padding: 14px 0 0 0; font-size: 18px; font-weight: 900; color: #10b981; text-align: right;">
                  ₨ ${order.totalAmount?.toLocaleString()}
                </td>
              </tr>
            </table>

            <!-- Courier Notice -->
            <div style="background: #f1f5f9; border-radius: 12px; padding: 14px; text-align: center; font-size: 12px; color: #475569; margin-bottom: 24px;">
              🚚 <strong>Express Courier:</strong> Dispatched via TCS Express. Estimated delivery in 2-4 business days.
            </div>

            <!-- CTA -->
            <div style="text-align: center;">
              <a href="http://localhost:3000/preview/${order.store_id || "stepcraft-premium"}#tracking" style="display: inline-block; background: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none;">
                Track Your Order Live →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 18px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            © 2026 ${storeName}. Powered by DigiShop AI E-Commerce Platform.
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      subject: `🎉 Order Confirmed #${order.orderNumber} - ${storeName}`,
      html,
    };
  }

  /**
   * 2. Vendor New Order Alert Template
   */
  static vendorNewOrderAlert(order: any, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Your Store";

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; margin: 0; padding: 24px; color: #e2e8f0;">
        <div style="max-width: 580px; margin: 0 auto; background: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);">
          
          <div style="background: #0f172a; padding: 24px; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span style="background: #10b981; color: #022c22; font-size: 10px; font-weight: 900; padding: 4px 10px; rounded: 8px; text-transform: uppercase;">
                🔔 New Order Received
              </span>
              <h1 style="color: #ffffff; font-size: 18px; margin: 8px 0 0 0; font-weight: 800;">${storeName}</h1>
            </div>
            <div style="font-size: 20px; font-weight: 900; color: #34d399;">
              ₨ ${order.totalAmount?.toLocaleString()}
            </div>
          </div>

          <div style="padding: 24px;">
            <div style="background: #0f172a; border-radius: 14px; padding: 16px; margin-bottom: 20px; border: 1px solid #334155; font-size: 12px;">
              <p style="margin: 0 0 8px 0; color: #94a3b8;">Customer: <strong style="color: #ffffff;">${order.customerName}</strong> (${order.customerPhone})</p>
              <p style="margin: 0 0 8px 0; color: #94a3b8;">Order #: <strong style="color: #38bdf8; font-family: monospace;">${order.orderNumber}</strong></p>
              <p style="margin: 0 0 8px 0; color: #94a3b8;">Payment: <strong style="color: #ffffff; text-transform: uppercase;">${order.paymentMethod}</strong></p>
              <p style="margin: 0; color: #94a3b8;">Destination: <strong style="color: #ffffff;">${order.shippingAddress}</strong></p>
            </div>

            <h3 style="color: #ffffff; font-size: 13px; font-weight: 800; margin: 0 0 10px 0;">Ordered Items (${order.items?.length || 0})</h3>
            <ul style="padding-left: 20px; font-size: 12px; color: #cbd5e1; margin-bottom: 24px;">
              ${(order.items || []).map((i: any) => `<li>${i.name} (Qty: ${i.quantity}) — <strong>₨ ${(i.price * i.quantity).toLocaleString()}</strong></li>`).join("")}
            </ul>

            <div style="text-align: center;">
              <a href="http://localhost:3000/orders" style="display: inline-block; background: #38bdf8; color: #082f49; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none;">
                Open Vendor Order Manager →
              </a>
            </div>
          </div>

          <div style="background: #0f172a; padding: 14px; text-align: center; border-top: 1px solid #334155; font-size: 11px; color: #64748b;">
            DigiShop AI Platform Notification Engine
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      subject: `⚡ New Order #${order.orderNumber} Received - ₨ ${order.totalAmount?.toLocaleString()}`,
      html,
    };
  }

  /**
   * 3. Shipment Dispatched & Live Tracking Email Template
   */
  static shipmentDispatched(order: any, shipment: any, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "DigiShop Store";

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden;">
          <div style="background: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">${storeName}</h1>
            <p style="margin: 6px 0 0 0; font-size: 12px; color: #38bdf8;">Your Package is on the Way 🚚</p>
          </div>

          <div style="padding: 28px;">
            <h2 style="font-size: 18px; color: #0f172a; font-weight: 800; margin: 0 0 10px 0;">Great news, ${order.customerName || "Customer"}!</h2>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 20px 0;">
              Your order <strong>${order.orderNumber}</strong> has been handed over to <strong>${shipment?.courier_name || "TCS Express Courier"}</strong>.
            </p>

            <div style="background: #f8fafc; border-radius: 16px; padding: 18px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">Courier Tracking Airway Bill (AWB):</div>
              <div style="font-family: monospace; font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: 1px;">
                ${shipment?.tracking_number || order.orderNumber}
              </div>
              <div style="font-size: 11px; color: #10b981; font-weight: 700; margin-top: 6px;">
                Status: In Transit • Estimated Arrival in 2-3 Days
              </div>
            </div>

            <div style="text-align: center;">
              <a href="http://localhost:3000/preview/${order.store_id || "stepcraft-premium"}#tracking" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none;">
                Track Courier Delivery →
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      subject: `🚚 Your Order #${order.orderNumber} Has Been Dispatched via TCS`,
      html,
    };
  }
}
