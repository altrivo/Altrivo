import { Resend } from "resend";
import { Order } from "@/types/orders";
import { StoreBranding } from "./email-templates";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  recipientType?: "customer" | "vendor" | "admin";
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  deliveredTo?: string;
  sandboxForwarded?: boolean;
  error?: string;
}

let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export const resend = {
  emails: {
    send: async (payload: any) => {
      const client = getResend();
      if (!client) {
        console.warn("[EmailService] RESEND_API_KEY not configured. Simulating email dispatch:", payload.to);
        return { data: { id: `sim_${Date.now()}` }, error: null };
      }
      return client.emails.send(payload);
    },
  },
} as unknown as Resend;

export class EmailService {
  /**
   * Universal resilient Resend email dispatcher.
   * - In Production (with custom domain verified): delivers directly to recipient.
   * - In Dev / Sandbox mode: if Resend restricts sending to the verified account owner,
   *   safely routes a preview copy to the account owner (altrivo1@gmail.com) with
   *   an informative sandbox header so emails are NEVER dropped during development!
   */
  static async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const { to, subject, html, recipientType = "customer" } = options;
    if (!to || !to.includes("@")) {
      return { success: false, error: "Invalid recipient email" };
    }

    const cleanTo = to.trim().toLowerCase();
    const from = options.from || process.env.RESEND_FROM_EMAIL || "Altrivo <onboarding@resend.dev>";
    const client = getResend();

    if (!client) {
      console.warn("[EmailService] RESEND_API_KEY not set. Simulating dispatch to:", cleanTo);
      return { success: true, id: `sim_${Date.now()}`, deliveredTo: cleanTo };
    }

    try {
      // 1. Attempt direct delivery via Resend
      const { data, error } = await client.emails.send({
        from,
        to: [cleanTo],
        subject,
        html,
      });

      if (!error && data?.id) {
        console.log(`[EmailService] Resend email successfully delivered to ${cleanTo} (id: ${data.id})`);
        return { success: true, id: data.id, deliveredTo: cleanTo };
      }

      // 2. Check if error is due to Resend Sandbox restrictions (403 or 422 for non-verified/test addresses)
      const errorMessage = error?.message || "";
      const isSandboxRestriction =
        (error as any)?.statusCode === 403 ||
        (error as any)?.statusCode === 422 ||
        errorMessage.includes("testing emails to your own email address") ||
        errorMessage.includes("testing email address") ||
        errorMessage.includes("example.com") ||
        errorMessage.includes("verify a domain");

      if (isSandboxRestriction) {
        const adminEmail = (process.env.RESEND_DEV_FORWARD_EMAIL || "altrivo1@gmail.com").trim().toLowerCase();
        console.warn(
          `[EmailService] Resend Sandbox restricted delivery to ${cleanTo}. Routing preview copy to verified admin: ${adminEmail}`
        );

        const sandboxNotice = `
          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 10px; margin-bottom: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="font-weight: 800; font-size: 13px; color: #92400e; margin-bottom: 4px;">
              ⚡ Resend Development Sandbox Notice
            </div>
            <p style="margin: 0; font-size: 12px; color: #78350f; line-height: 1.5;">
              Original Recipient: <strong style="color: #0f172a;">${cleanTo}</strong> (${recipientType})<br/>
              <em>Custom domain is pending on Resend. Resend safely routed this preview copy to your verified developer email (<strong>${adminEmail}</strong>). Once a domain is verified, emails deliver directly to customer/vendor inboxes!</em>
            </p>
          </div>
        `;

        let sandboxHtml = html;
        if (sandboxHtml.includes("<body")) {
          sandboxHtml = sandboxHtml.replace(/(<body[^>]*>)/i, `$1\n${sandboxNotice}`);
        } else {
          sandboxHtml = `${sandboxNotice}\n${html}`;
        }

        const sandboxSubject = `[Sandbox for: ${cleanTo}] ${subject}`;

        const fallbackRes = await client.emails.send({
          from,
          to: [adminEmail],
          subject: sandboxSubject,
          html: sandboxHtml,
        });

        if (fallbackRes.data?.id) {
          console.log(`[EmailService] Sandbox preview email sent to admin ${adminEmail} (id: ${fallbackRes.data.id})`);
          return {
            success: true,
            id: fallbackRes.data.id,
            deliveredTo: adminEmail,
            sandboxForwarded: true,
          };
        }
      }

      console.error("[EmailService] Resend dispatch failed:", error);
      return { success: false, error: errorMessage };
    } catch (err: any) {
      console.error("[EmailService] Unexpected send exception:", err);
      return { success: false, error: err?.message || "Send failed" };
    }
  }

  /**
   * Send Order Confirmation Email to Customer
   */
  static async sendOrderConfirmation(order: Order, store?: StoreBranding) {
    if (!order.customerEmail || !order.customerEmail.includes("@")) {
      console.log("[EmailService] No valid customer email provided. Skipping email dispatch.");
      return null;
    }

    const storeName = store?.name || "Altrivo Store";
    const primaryColor = store?.primaryColor || "#3e2845";

    const itemsListHtml = (order.items || [])
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-size: 13px; color: #1e293b;">
            <strong>${item.name}</strong>
            <div style="font-size: 11px; color: #64748b;">Qty: ${item.quantity}</div>
          </td>
          <td style="padding: 10px 0; font-size: 13px; color: #0f172a; text-align: right; font-weight: bold;">
            ₨ ${(item.price * item.quantity).toLocaleString()}
          </td>
        </tr>
      `
      )
      .join("");

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
          <h1 style="color: ${primaryColor}; font-size: 22px; margin: 0; font-weight: 800;">Order Confirmed 🎉</h1>
          <p style="color: #64748b; font-size: 13px; margin: 6px 0 0 0;">Thank you for shopping with ${storeName}! Your order is being processed.</p>
        </div>

        <div style="padding: 20px 0; border-bottom: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 12px;">Order Number:</span>
            <strong style="color: #0f172a; font-size: 12px; font-family: monospace;">${order.orderNumber}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #64748b; font-size: 12px;">Payment Method:</span>
            <strong style="color: #0f172a; font-size: 12px; text-transform: uppercase;">${order.paymentMethod || "COD"}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b; font-size: 12px;">Shipping Address:</span>
            <span style="color: #0f172a; font-size: 12px; font-weight: 600;">${order.shippingAddress || "Provided during checkout"}</span>
          </div>
        </div>

        <div style="padding: 20px 0;">
          <h3 style="color: #0f172a; font-size: 14px; margin: 0 0 12px 0;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsListHtml}
            <tr>
              <td style="padding: 12px 0 0 0; font-size: 14px; font-weight: 800; color: #0f172a;">Total Amount</td>
              <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 900; color: #10b981; text-align: right;">
                ₨ ${(order.totalAmount || 0).toLocaleString()}
              </td>
            </tr>
          </table>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 14px; text-align: center; font-size: 11px; color: #64748b;">
          🚚 <strong>TCS Express Courier:</strong> Estimated arrival in 2-4 business days.
        </div>
      </div>
    `;

    return this.sendEmail({
      to: order.customerEmail,
      subject: `Your Order ${order.orderNumber} Confirmation - ${storeName}`,
      html,
      recipientType: "customer",
    });
  }

  /**
   * Send New Order Alert to Vendor
   */
  static async sendVendorOrderAlert(order: Order, vendorEmail: string, vendorName?: string, store?: StoreBranding) {
    if (!vendorEmail || !vendorEmail.includes("@")) return null;

    const storeName = store?.name || "Your Store";
    const itemsListHtml = (order.items || [])
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 0; font-size: 13px; color: #1e293b;">
            <strong>${item.name}</strong> × ${item.quantity}
          </td>
          <td style="padding: 8px 0; font-size: 13px; color: #0f172a; text-align: right; font-weight: bold;">
            ₨ ${(item.price * item.quantity).toLocaleString()}
          </td>
        </tr>
      `
      )
      .join("");

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="background: #0f172a; padding: 24px; border-radius: 12px; text-align: center; color: #ffffff; margin-bottom: 20px;">
          <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 800;">New Order Received! 💰</h1>
          <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">${storeName} just received an order from ${order.customerName || "a customer"}.</p>
        </div>

        <div style="padding: 16px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <div style="margin-bottom: 6px;"><strong>Order ID:</strong> ${order.orderNumber}</div>
          <div style="margin-bottom: 6px;"><strong>Customer:</strong> ${order.customerName || "N/A"} (${order.customerPhone || "No Phone"})</div>
          <div style="margin-bottom: 6px;"><strong>Delivery Address:</strong> ${order.shippingAddress || "N/A"}</div>
          <div style="margin-bottom: 6px;"><strong>Payment:</strong> ${order.paymentMethod || "COD"}</div>
        </div>

        <div style="padding: 16px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsListHtml}
            <tr>
              <td style="padding: 12px 0 0 0; font-size: 14px; font-weight: 800; color: #0f172a;">Payout Total</td>
              <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 900; color: #10b981; text-align: right;">
                ₨ ${(order.totalAmount || 0).toLocaleString()}
              </td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 10px;">
            View Order in Dashboard →
          </a>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: vendorEmail,
      subject: `New Order #${order.orderNumber} (₨ ${(order.totalAmount || 0).toLocaleString()}) - ${storeName}`,
      html,
      recipientType: "vendor",
    });
  }

  /**
   * Send Order Status Update to Customer (Shipped, Delivered, etc.)
   */
  static async sendOrderStatusUpdate(order: Order, newStatus: string, trackingNumber?: string, store?: StoreBranding) {
    if (!order.customerEmail || !order.customerEmail.includes("@")) return null;

    const storeName = store?.name || "Altrivo Store";
    const statusLabel = newStatus.replace(/_/g, " ").toUpperCase();

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
          <div style="display: inline-block; padding: 6px 14px; background: #f1f5f9; border-radius: 20px; font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
            STATUS: ${statusLabel}
          </div>
          <h1 style="color: #0f172a; font-size: 22px; margin: 0; font-weight: 800;">Order Update</h1>
          <p style="color: #64748b; font-size: 13px; margin: 6px 0 0 0;">Your order <strong>${order.orderNumber}</strong> has been updated to: <strong>${statusLabel}</strong></p>
        </div>

        ${trackingNumber ? `
        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">TCS Tracking Number</div>
          <div style="font-size: 18px; font-weight: 900; color: #0f172a; font-family: monospace; letter-spacing: 1px;">${trackingNumber}</div>
        </div>
        ` : ""}

        <div style="text-align: center; margin-top: 24px;">
          <p style="font-size: 12px; color: #64748b;">Thank you for shopping with ${storeName}.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: order.customerEmail,
      subject: `Order ${order.orderNumber} Status: ${statusLabel} - ${storeName}`,
      html,
      recipientType: "customer",
    });
  }

  /**
   * Send Altrivo-branded Password Reset Email via Resend
   */
  static async sendPasswordReset(email: string, resetLink: string, recipientName?: string) {
    if (!email || !email.includes("@")) {
      console.warn("[EmailService] No valid email provided for password reset.");
      return null;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Altrivo Password</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <!-- Header with Altrivo Branding -->
          <div style="background: linear-gradient(135deg, #2d1a33 0%, #3e2845 50%, #5c3d5c 100%); padding: 32px 24px; text-align: center;">
            <div style="display: inline-block; padding: 8px 16px; background: rgba(255, 255, 255, 0.15); border-radius: 9999px; margin-bottom: 12px; backdrop-filter: blur(8px);">
              <span style="color: #f3e8ff; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">ALTRIVO COMMERCE</span>
            </div>
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Password Reset Request</h1>
            <p style="color: #e9d5ff; font-size: 13px; margin: 8px 0 0 0;">Secure access recovery for your account</p>
          </div>

          <!-- Content Area -->
          <div style="padding: 32px 28px;">
            <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0; line-height: 1.6;">
              Hello${recipientName ? ` <strong>${recipientName}</strong>` : ""},
            </p>
            <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.6;">
              We received a request to reset your password for your Altrivo account (<strong style="color: #0f172a;">${email}</strong>). Click the secure button below to set a new password:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" style="display: inline-block; background: #3e2845; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 10px rgba(62, 40, 69, 0.25);">
                Reset Password →
              </a>
            </div>

            <!-- Plain link -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 24px 0 0 0;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0; line-height: 1.5;">
                <strong>Button not working?</strong> Copy and paste this URL into your browser:
              </p>
              <p style="font-size: 11px; color: #3e2845; word-break: break-all; margin: 0; font-family: monospace;">
                ${resetLink}
              </p>
            </div>

            <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5;">
                🔒 <em>This recovery link will expire in 1 hour. If you didn't initiate this request, you can safely ignore this email.</em>
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
            <p style="font-size: 12px; font-weight: 600; color: #475569; margin: 0 0 4px 0;">Altrivo E-Commerce Platform</p>
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">Multi-Storefront Management & Automated Commerce</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: "Reset your Altrivo password",
      html,
      recipientType: "vendor",
    });
  }

  /**
   * Send Altrivo-branded Vendor Welcome Email via Resend
   */
  static async sendVendorWelcome(name: string, email: string, businessName?: string) {
    if (!email || !email.includes("@")) return null;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Altrivo</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <div style="background: linear-gradient(135deg, #2d1a33 0%, #3e2845 50%, #5c3d5c 100%); padding: 36px 24px; text-align: center;">
            <div style="display: inline-block; padding: 8px 18px; background: rgba(255, 255, 255, 0.15); border-radius: 9999px; margin-bottom: 12px;">
              <span style="color: #f3e8ff; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">ALTRIVO COMMERCE</span>
            </div>
            <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Welcome to Altrivo! 🎉</h1>
            <p style="color: #e9d5ff; font-size: 14px; margin: 8px 0 0 0;">Your vendor merchant account has been activated</p>
          </div>

          <div style="padding: 32px 28px;">
            <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0; line-height: 1.6;">
              Dear <strong>${name || "Vendor"}</strong>,
            </p>
            <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
              Welcome to Altrivo — the multi-tenant platform designed to launch high-converting online storefronts with ease.
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 0 0 24px 0;">
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 10px;">Account Details</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b; width: 120px;">Email:</td>
                  <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${email}</td>
                </tr>
                ${businessName ? `
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Business:</td>
                  <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${businessName}</td>
                </tr>` : ""}
              </table>
            </div>

            <div style="text-align: center; margin: 28px 0 12px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login" style="display: inline-block; background: #3e2845; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 36px; border-radius: 12px;">
                Log In to Your Vendor Dashboard →
              </a>
            </div>
          </div>

          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
            <p style="font-size: 12px; font-weight: 600; color: #475569; margin: 0 0 4px 0;">Altrivo E-Commerce Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: "Welcome to Altrivo - Your Vendor Account is Ready 🎉",
      html,
      recipientType: "vendor",
    });
  }
}
