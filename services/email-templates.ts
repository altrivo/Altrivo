/**
 * Altrivo — Master Responsive Email Templates
 * Branded for individual multi-tenant stores and platform events.
 */

export interface StoreBranding {
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  supportPhone?: string;
  supportEmail?: string;
}

function getHeader(storeName: string, subtitle: string, primaryColor: string, logoUrl?: string) {
  return `
    <div style="background: ${primaryColor}; padding: 28px; text-align: center; color: #ffffff;">
      ${logoUrl ? `<img src="${logoUrl}" alt="${storeName}" style="max-height: 42px; margin-bottom: 12px; display: inline-block;" />` : ""}
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">${storeName}</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; color: #f1f5f9;">${subtitle}</p>
    </div>
  `;
}

function getFooter(storeName: string, supportPhone?: string, supportEmail?: string) {
  return `
    <div style="background: #f8fafc; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6;">
      <p style="margin: 0 0 4px 0;">© ${new Date().getFullYear()} ${storeName}. Powered by Altrivo Platform.</p>
      ${supportPhone || supportEmail ? `<p style="margin: 0; color: #94a3b8;">Need assistance? Contact support: ${[supportEmail || "support@altrivo.com", supportPhone].filter(Boolean).join(" • ")}</p>` : ""}
    </div>
  `;
}

function wrapEmail(content: string, storeName: string, subtitle: string, store?: StoreBranding) {
  const primaryColor = store?.primaryColor || "#3e2845";
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${storeName}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
        ${getHeader(storeName, subtitle, primaryColor, store?.logoUrl)}
        <div style="padding: 28px;">
          ${content}
        </div>
        ${getFooter(storeName, store?.supportPhone, store?.supportEmail)}
      </div>
    </body>
    </html>
  `;
}

export class EmailTemplates {
  /**
   * 1. Email Verification
   */
  static verifyEmail(user: { name?: string; email: string }, verifyUrl: string, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Altrivo";
    const primaryColor = store?.primaryColor || "#3e2845";
    const displayName = user.name || user.email.split("@")[0];

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #f3e8ff; border: 1px solid #d8b4fe; border-radius: 100px; padding: 6px 16px; color: #6b21a8; font-size: 12px; font-weight: 700;">
          ✉️ Email Confirmation Required
        </div>
        <h2 style="font-size: 20px; color: #0f172a; margin: 16px 0 8px 0; font-weight: 800;">Verify Your Email Address</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.6;">
          Hello <strong>${displayName}</strong>, thank you for registering with ${storeName}. Please verify your email address to activate your account and access all features.
        </p>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background: ${primaryColor}; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          Verify Email Address →
        </a>
      </div>

      <div style="background: #f8fafc; border-radius: 12px; padding: 14px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
        If you didn't create an account, you can safely ignore this email.<br/>
        This verification link will expire in 24 hours.
      </div>
    `;

    return {
      subject: `Verify your email for ${storeName}`,
      html: wrapEmail(content, storeName, "Account Verification", store),
    };
  }

  /**
   * 2. Welcome Email
   */
  static welcomeEmail(user: { name?: string; email: string; role?: string }, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Altrivo";
    const primaryColor = store?.primaryColor || "#3e2845";
    const displayName = user.name || user.email.split("@")[0];
    const isVendor = user.role === "vendor";

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 100px; padding: 6px 16px; color: #065f46; font-size: 12px; font-weight: 700;">
          🎉 Welcome to ${storeName}
        </div>
        <h2 style="font-size: 20px; color: #0f172a; margin: 16px 0 8px 0; font-weight: 800;">Welcome, ${displayName}!</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.6;">
          ${isVendor 
            ? "Your vendor registration is complete. You can now build your AI storefront, add catalog products, and receive orders with automated courier fulfillment." 
            : "Your customer account is active. Enjoy seamless checkout, track parcel shipments live, and curate your personalized wishlist."}
        </p>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${isVendor ? "http://localhost:3000/dashboard" : "http://localhost:3000/account"}" style="display: inline-block; background: ${primaryColor}; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none;">
          ${isVendor ? "Go to Vendor Dashboard →" : "Explore My Account →"}
        </a>
      </div>
    `;

    return {
      subject: `Welcome to ${storeName}, ${displayName}!`,
      html: wrapEmail(content, storeName, isVendor ? "Vendor Portal" : "Customer Portal", store),
    };
  }

  /**
   * 3. Password Reset Request
   */
  static resetPassword(user: { name?: string; email: string }, resetUrl: string, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Altrivo";
    const primaryColor = store?.primaryColor || "#3e2845";
    const displayName = user.name || user.email.split("@")[0];

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #fef3c7; border: 1px solid #fde68a; border-radius: 100px; padding: 6px 16px; color: #92400e; font-size: 12px; font-weight: 700;">
          🔑 Password Recovery
        </div>
        <h2 style="font-size: 20px; color: #0f172a; margin: 16px 0 8px 0; font-weight: 800;">Reset Your Password</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.6;">
          Hello <strong>${displayName}</strong>, we received a request to reset the password for your account (${user.email}). Click the button below to choose a new password.
        </p>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: ${primaryColor}; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none;">
          Reset Password →
        </a>
      </div>

      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px; font-size: 11px; color: #991b1b; line-height: 1.5;">
        <strong>Security Notice:</strong> If you did not make this request, someone may have entered your email by mistake. Your account remains secure and no changes have been made.
      </div>
    `;

    return {
      subject: `Password Reset Request - ${storeName}`,
      html: wrapEmail(content, storeName, "Security Alert", store),
    };
  }

  /**
   * 4. Password Changed Security Confirmation
   */
  static passwordChanged(user: { name?: string; email: string }, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Altrivo";
    const displayName = user.name || user.email.split("@")[0];

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 100px; padding: 6px 16px; color: #065f46; font-size: 12px; font-weight: 700;">
          🛡️ Security Update
        </div>
        <h2 style="font-size: 20px; color: #0f172a; margin: 16px 0 8px 0; font-weight: 800;">Password Changed Successfully</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.6;">
          Hello <strong>${displayName}</strong>, the password for your ${storeName} account was updated on <strong>${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong> at <strong>${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>.
        </p>
      </div>

      <div style="background: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; font-size: 12px; color: #475569; line-height: 1.5;">
        If you performed this action, no further steps are needed.<br/>
        If you did <strong>not</strong> change your password, please contact support immediately to lock your account.
      </div>
    `;

    return {
      subject: `Security Alert: Password Changed - ${storeName}`,
      html: wrapEmail(content, storeName, "Security Notification", store),
    };
  }

  /**
   * 5. Customer Order Confirmation Email Template
   */
  static customerOrderConfirmation(order: any, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Altrivo Store";
    const primaryColor = store?.primaryColor || "#3e2845";
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

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 100px; padding: 6px 16px; color: #065f46; font-size: 12px; font-weight: 700;">
          ✓ Order Placed Successfully
        </div>
        <h2 style="font-size: 20px; color: #0f172a; margin: 14px 0 6px 0; font-weight: 800;">Thank you, ${order.customerName || "Valued Customer"}!</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0;">We've received your order and our team is preparing it for shipment.</p>
      </div>

      <div style="background: #f8fafc; border-radius: 16px; padding: 18px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
        <table style="width: 100%; font-size: 12px; line-height: 1.8;">
          <tr>
            <td style="color: #64748b;">Order Number:</td>
            <td style="text-align: right; font-weight: 700; color: #0f172a; font-family: monospace;">${order.orderNumber}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Payment Method:</td>
            <td style="text-align: right; font-weight: 700; color: #0f172a; text-transform: uppercase;">${order.paymentMethod === "cod" ? "Cash on Delivery (COD)" : "Online Escrow"}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Delivery Address:</td>
            <td style="text-align: right; font-weight: 700; color: #0f172a;">${order.shippingAddress || "Provided on Checkout"}</td>
          </tr>
        </table>
      </div>

      <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        ${itemsListHtml}
        <tr>
          <td style="padding: 14px 0 0 0; font-size: 14px; font-weight: 800; color: #0f172a;">Grand Total</td>
          <td style="padding: 14px 0 0 0; font-size: 18px; font-weight: 900; color: #10b981; text-align: right;">
            ₨ ${(order.totalAmount || 0).toLocaleString()}
          </td>
        </tr>
      </table>

      <div style="background: #f1f5f9; border-radius: 12px; padding: 14px; text-align: center; font-size: 12px; color: #475569; margin-bottom: 24px;">
        🚚 <strong>Express Courier:</strong> Dispatched via Trax / TCS Express. Estimated delivery in 2-4 business days.
      </div>

      <div style="text-align: center;">
        <a href="http://localhost:3000/account/orders" style="display: inline-block; background: ${primaryColor}; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none;">
          View & Track Order Live →
        </a>
      </div>
    `;

    return {
      subject: `🎉 Order Confirmed #${order.orderNumber} - ${storeName}`,
      html: wrapEmail(content, storeName, "Order Confirmation", store),
    };
  }

  /**
   * 6. Vendor New Order Alert Template
   */
  static vendorNewOrderAlert(order: any, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Your Store";
    const primaryColor = "#1e293b";

    const content = `
      <div style="background: #0f172a; border-radius: 16px; padding: 20px; color: #ffffff; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="background: #10b981; color: #022c22; font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 8px; text-transform: uppercase;">
            🔔 New Customer Order
          </span>
          <span style="font-size: 20px; font-weight: 900; color: #34d399;">
            ₨ ${(order.totalAmount || 0).toLocaleString()}
          </span>
        </div>
        <p style="font-size: 13px; color: #94a3b8; margin: 12px 0 0 0;">
          Order <strong>#${order.orderNumber}</strong> was just placed on <strong>${storeName}</strong>.
        </p>
      </div>

      <div style="background: #f8fafc; border-radius: 14px; padding: 16px; margin-bottom: 20px; border: 1px solid #e2e8f0; font-size: 12px;">
        <p style="margin: 0 0 8px 0; color: #64748b;">Customer: <strong style="color: #0f172a;">${order.customerName}</strong> (${order.customerPhone})</p>
        <p style="margin: 0 0 8px 0; color: #64748b;">Payment Method: <strong style="color: #0f172a; text-transform: uppercase;">${order.paymentMethod}</strong></p>
        <p style="margin: 0; color: #64748b;">Delivery Destination: <strong style="color: #0f172a;">${order.shippingAddress}</strong></p>
      </div>

      <h3 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">Ordered Items (${order.items?.length || 0})</h3>
      <ul style="padding-left: 20px; font-size: 12px; color: #334155; margin-bottom: 24px; line-height: 1.8;">
        ${(order.items || []).map((i: any) => `<li>${i.name} (Qty: ${i.quantity}) — <strong>₨ ${(i.price * i.quantity).toLocaleString()}</strong></li>`).join("")}
      </ul>

      <div style="text-align: center;">
        <a href="http://localhost:3000/orders" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none;">
          Open Order in Vendor Dashboard →
        </a>
      </div>
    `;

    return {
      subject: `⚡ New Order #${order.orderNumber} Received - ₨ ${(order.totalAmount || 0).toLocaleString()}`,
      html: wrapEmail(content, storeName, "Vendor Order Dispatch Alert", store),
    };
  }

  /**
   * 7. Customer Payment Confirmed
   */
  static customerPaymentConfirmed(order: any, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Altrivo Store";
    const primaryColor = store?.primaryColor || "#3e2845";

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 100px; padding: 6px 16px; color: #065f46; font-size: 12px; font-weight: 700;">
          💳 Payment Received & Protected
        </div>
        <h2 style="font-size: 20px; color: #0f172a; margin: 14px 0 6px 0; font-weight: 800;">Payment Confirmed</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0;">Your payment of <strong>₨ ${(order.totalAmount || 0).toLocaleString()}</strong> for order <strong>#${order.orderNumber}</strong> has been secured in Escrow.</p>
      </div>

      <div style="background: #f8fafc; border-radius: 14px; padding: 16px; margin-bottom: 20px; border: 1px solid #e2e8f0; font-size: 12px; line-height: 1.8;">
        <table style="width: 100%;">
          <tr>
            <td style="color: #64748b;">Transaction Status:</td>
            <td style="text-align: right; color: #10b981; font-weight: 700;">COMPLETED / IN ESCROW</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Order Number:</td>
            <td style="text-align: right; font-weight: 700; color: #0f172a; font-family: monospace;">${order.orderNumber}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Amount Paid:</td>
            <td style="text-align: right; font-weight: 800; color: #0f172a;">₨ ${(order.totalAmount || 0).toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center;">
        <a href="http://localhost:3000/account/orders" style="display: inline-block; background: ${primaryColor}; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none;">
          View Order Status →
        </a>
      </div>
    `;

    return {
      subject: `Payment Confirmed for Order #${order.orderNumber} - ${storeName}`,
      html: wrapEmail(content, storeName, "Payment Receipt", store),
    };
  }

  /**
   * 8. Shipment Dispatched & Live Tracking Email Template
   */
  static shipmentDispatched(order: any, shipment: any, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Altrivo Store";
    const primaryColor = store?.primaryColor || "#3e2845";
    const trackingNumber = shipment?.tracking_number || order.orderNumber;
    const courierName = shipment?.courier_name || "Trax Express Logistics";

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 100px; padding: 6px 16px; color: #0369a1; font-size: 12px; font-weight: 700;">
          🚚 Package Dispatched
        </div>
        <h2 style="font-size: 20px; color: #0f172a; font-weight: 800; margin: 14px 0 6px 0;">Your Package is on the Way!</h2>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">
          Great news, ${order.customerName || "Customer"}! Your order <strong>#${order.orderNumber}</strong> has been handed over to <strong>${courierName}</strong>.
        </p>
      </div>

      <div style="background: #f8fafc; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Courier Tracking Airway Bill (AWB)</div>
        <div style="font-family: monospace; font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: 1.5px;">
          ${trackingNumber}
        </div>
        <div style="display: inline-block; background: #ecfdf5; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 100px; margin-top: 10px;">
          Status: In Transit • Estimated Arrival in 2-3 Business Days
        </div>
      </div>

      <div style="text-align: center;">
        <a href="http://localhost:3000/account/orders" style="display: inline-block; background: ${primaryColor}; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none;">
          Track Delivery Live →
        </a>
      </div>
    `;

    return {
      subject: `🚚 Your Order #${order.orderNumber} Has Been Dispatched via ${courierName}`,
      html: wrapEmail(content, storeName, "Courier Dispatch Notification", store),
    };
  }

  /**
   * 9. Out For Delivery Alert
   */
  static outForDelivery(order: any, shipment: any, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Altrivo Store";
    const primaryColor = store?.primaryColor || "#3e2845";

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #fef3c7; border: 1px solid #fde68a; border-radius: 100px; padding: 6px 16px; color: #92400e; font-size: 12px; font-weight: 700;">
          🛵 Out for Delivery Today
        </div>
        <h2 style="font-size: 20px; color: #0f172a; font-weight: 800; margin: 14px 0 6px 0;">Arriving Today!</h2>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">
          Hello ${order.customerName || "Customer"}, our delivery courier rider is out to deliver your parcel for order <strong>#${order.orderNumber}</strong> today.
        </p>
      </div>

      <div style="background: #f8fafc; border-radius: 16px; padding: 18px; border: 1px solid #e2e8f0; margin-bottom: 20px; font-size: 12px; line-height: 1.8;">
        <table style="width: 100%;">
          <tr>
            <td style="color: #64748b;">Delivery Destination:</td>
            <td style="text-align: right; font-weight: 700; color: #0f172a;">${order.shippingAddress || "Registered Shipping Address"}</td>
          </tr>
          ${order.paymentMethod === "cod" ? `
          <tr>
            <td style="color: #b45309; font-weight: 700;">COD Cash Amount to Pay:</td>
            <td style="text-align: right; font-weight: 900; color: #b45309; font-size: 14px;">₨ ${(order.totalAmount || 0).toLocaleString()}</td>
          </tr>
          ` : `
          <tr>
            <td style="color: #10b981; font-weight: 700;">Payment Status:</td>
            <td style="text-align: right; font-weight: 700; color: #10b981;">PAID (No cash required)</td>
          </tr>
          `}
        </table>
      </div>

      <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 12px; font-size: 11px; color: #92400e; text-align: center; margin-bottom: 24px;">
        💡 Please keep your mobile phone (${order.customerPhone || "registered contact"}) handy for the rider's call.
      </div>

      <div style="text-align: center;">
        <a href="http://localhost:3000/account/orders" style="display: inline-block; background: ${primaryColor}; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none;">
          Track Delivery Status →
        </a>
      </div>
    `;

    return {
      subject: `🛵 Out for Delivery Today: Order #${order.orderNumber} - ${storeName}`,
      html: wrapEmail(content, storeName, "Delivery Day Notification", store),
    };
  }

  /**
   * 10. Order Delivered Confirmation
   */
  static orderDelivered(order: any, shipment?: any, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Altrivo Store";
    const primaryColor = store?.primaryColor || "#3e2845";

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 100px; padding: 6px 16px; color: #065f46; font-size: 12px; font-weight: 700;">
          📦 Delivered Successfully
        </div>
        <h2 style="font-size: 20px; color: #0f172a; font-weight: 800; margin: 14px 0 6px 0;">Your Package Has Arrived!</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0;">
          Your order <strong>#${order.orderNumber}</strong> was safely delivered. We hope you love your new items!
        </p>
      </div>

      <div style="background: #f8fafc; border-radius: 14px; padding: 16px; border: 1px solid #e2e8f0; margin-bottom: 24px; text-align: center; font-size: 12px; color: #475569;">
        If you have any feedback or require assistance with your purchase, our customer support team is here to help.
      </div>

      <div style="text-align: center;">
        <a href="http://localhost:3000/shop" style="display: inline-block; background: ${primaryColor}; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none;">
          Explore More Products →
        </a>
      </div>
    `;

    return {
      subject: `📦 Order #${order.orderNumber} Delivered - Thank you for shopping with ${storeName}!`,
      html: wrapEmail(content, storeName, "Delivery Completed", store),
    };
  }

  /**
   * 11. Order Cancelled
   */
  static orderCancelled(order: any, reason?: string, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Altrivo Store";

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #fee2e2; border: 1px solid #fecaca; border-radius: 100px; padding: 6px 16px; color: #991b1b; font-size: 12px; font-weight: 700;">
          ❌ Order Cancelled
        </div>
        <h2 style="font-size: 20px; color: #0f172a; font-weight: 800; margin: 14px 0 6px 0;">Order #${order.orderNumber} Cancelled</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0;">
          Your order has been cancelled. ${reason ? `Reason: <em>${reason}</em>` : ""}
        </p>
      </div>

      <div style="background: #f8fafc; border-radius: 14px; padding: 16px; border: 1px solid #e2e8f0; font-size: 12px; color: #475569; line-height: 1.6;">
        If you made an online escrow payment, your full refund will automatically be processed to your original payment method within 3-5 business days.
      </div>
    `;

    return {
      subject: `Order #${order.orderNumber} Cancelled - ${storeName}`,
      html: wrapEmail(content, storeName, "Cancellation Notice", store),
    };
  }

  /**
   * 12. Order Refunded
   */
  static orderRefunded(order: any, refund?: any, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Altrivo Store";
    const refundAmount = refund?.amount || order.totalAmount || 0;

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 100px; padding: 6px 16px; color: #065f46; font-size: 12px; font-weight: 700;">
          💰 Refund Issued
        </div>
        <h2 style="font-size: 20px; color: #0f172a; font-weight: 800; margin: 14px 0 6px 0;">Refund Processed</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0;">
          A refund of <strong>₨ ${refundAmount.toLocaleString()}</strong> has been initiated for order <strong>#${order.orderNumber}</strong>.
        </p>
      </div>

      <div style="background: #f8fafc; border-radius: 14px; padding: 16px; border: 1px solid #e2e8f0; font-size: 12px; color: #475569; line-height: 1.6;">
        The funds should reflect in your bank account or payment card within 3-5 business days depending on your financial institution.
      </div>
    `;

    return {
      subject: `Refund Processed for Order #${order.orderNumber} - ${storeName}`,
      html: wrapEmail(content, storeName, "Refund Confirmation", store),
    };
  }

  /**
   * 13. COD Verification Request
   */
  static codVerificationRequired(order: any, verifyUrl: string, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Altrivo Store";
    const primaryColor = store?.primaryColor || "#3e2845";

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #fef3c7; border: 1px solid #fde68a; border-radius: 100px; padding: 6px 16px; color: #92400e; font-size: 12px; font-weight: 700;">
          ⚠️ Action Required: Verify COD Order
        </div>
        <h2 style="font-size: 20px; color: #0f172a; font-weight: 800; margin: 14px 0 6px 0;">Confirm Your Cash on Delivery Order</h2>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">
          Hello <strong>${order.customerName || "Customer"}</strong>, to prevent courier return charges and ensure swift dispatch, please click below to confirm your Cash on Delivery order of <strong>₨ ${(order.totalAmount || 0).toLocaleString()}</strong>.
        </p>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background: #10b981; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none;">
          ✓ Confirm My Order for Dispatch →
        </a>
      </div>
    `;

    return {
      subject: `Action Required: Confirm your COD Order #${order.orderNumber} - ${storeName}`,
      html: wrapEmail(content, storeName, "Order Verification", store),
    };
  }

  /**
   * 14. COD Confirmed
   */
  static codConfirmed(order: any, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Altrivo Store";

    const content = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 100px; padding: 6px 16px; color: #065f46; font-size: 12px; font-weight: 700;">
          ✓ COD Verified
        </div>
        <h2 style="font-size: 20px; color: #0f172a; font-weight: 800; margin: 14px 0 6px 0;">COD Order Confirmed</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0;">
          Thank you! Your Cash on Delivery order <strong>#${order.orderNumber}</strong> is now verified and booked with our courier logistics partners.
        </p>
      </div>
    `;

    return {
      subject: `COD Verified for Order #${order.orderNumber} - ${storeName}`,
      html: wrapEmail(content, storeName, "Verification Receipt", store),
    };
  }

  /**
   * 15. Abandoned Cart Recovery
   */
  static abandonedCart(cart: any, checkoutUrl: string, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Altrivo Store";
    const primaryColor = store?.primaryColor || "#3e2845";

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #f3e8ff; border: 1px solid #d8b4fe; border-radius: 100px; padding: 6px 16px; color: #6b21a8; font-size: 12px; font-weight: 700;">
          🛒 You left items in your cart
        </div>
        <h2 style="font-size: 20px; color: #0f172a; font-weight: 800; margin: 14px 0 6px 0;">Ready to complete your purchase?</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0;">
          We saved your shopping cart items so you don't miss out on trending styles and special offers.
        </p>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${checkoutUrl}" style="display: inline-block; background: ${primaryColor}; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none;">
          Resume Checkout Now →
        </a>
      </div>
    `;

    return {
      subject: `Complete your order at ${storeName} before items sell out!`,
      html: wrapEmail(content, storeName, "Cart Reminder", store),
    };
  }

  /**
   * 16. Low Stock Alert for Vendor
   */
  static lowStockAlert(product: any, store?: StoreBranding): { subject: string; html: string } {
    const storeName = store?.name || "Your Store";

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #fee2e2; border: 1px solid #fecaca; border-radius: 100px; padding: 6px 16px; color: #991b1b; font-size: 12px; font-weight: 700;">
          ⚠️ Low Stock Warning
        </div>
        <h2 style="font-size: 20px; color: #0f172a; font-weight: 800; margin: 14px 0 6px 0;">Inventory Alert: ${product.name}</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0;">
          Remaining inventory for <strong>${product.name}</strong> is down to <strong>${product.stock ?? 2} units</strong>.
        </p>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="http://localhost:3000/inventory" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none;">
          Manage Inventory →
        </a>
      </div>
    `;

    return {
      subject: `⚠️ Low Stock Alert: ${product.name} (${product.stock ?? 2} left) - ${storeName}`,
      html: wrapEmail(content, storeName, "Inventory Threshold Alert", store),
    };
  }
}
