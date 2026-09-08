import { Resend } from "resend";
import { Order } from "@/types/orders";

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
   * Send Order Confirmation Email to Customer
   */
  static async sendOrderConfirmation(order: Order) {
    if (!order.customerEmail || !order.customerEmail.includes("@")) {
      console.log("[EmailService] No valid customer email provided. Skipping email dispatch.");
      return null;
    }

    try {
      const itemsListHtml = order.items
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

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
            <h1 style="color: #0f172a; font-size: 22px; margin: 0; font-weight: 800;">Order Confirmed 🎉</h1>
            <p style="color: #64748b; font-size: 13px; margin: 6px 0 0 0;">Thank you for shopping with us! Your order is being processed.</p>
          </div>

          <div style="padding: 20px 0; border-bottom: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #64748b; font-size: 12px;">Order Number:</span>
              <strong style="color: #0f172a; font-size: 12px; font-family: monospace;">${order.orderNumber}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #64748b; font-size: 12px;">Payment Method:</span>
              <strong style="color: #0f172a; font-size: 12px; text-transform: uppercase;">${order.paymentMethod}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b; font-size: 12px;">Shipping Address:</span>
              <span style="color: #0f172a; font-size: 12px; font-weight: 600;">${order.shippingAddress}</span>
            </div>
          </div>

          <div style="padding: 20px 0;">
            <h3 style="color: #0f172a; font-size: 14px; margin: 0 0 12px 0;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsListHtml}
              <tr>
                <td style="padding: 12px 0 0 0; font-size: 14px; font-weight: 800; color: #0f172a;">Total Amount</td>
                <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 900; color: #10b981; text-align: right;">
                  ₨ ${order.totalAmount.toLocaleString()}
                </td>
              </tr>
            </table>
          </div>

          <div style="background: #f8fafc; border-radius: 12px; padding: 14px; text-align: center; font-size: 11px; color: #64748b;">
            🚚 <strong>TCS Express Delivery:</strong> Estimated arrival in 2-4 business days.
          </div>
        </div>
      `;

      const { data, error } = await resend.emails.send({
        from: "Artisanal Store <onboarding@resend.dev>",
        to: [order.customerEmail],
        subject: `Your Order ${order.orderNumber} Confirmation`,
        html: htmlContent,
      });

      if (error) {
        console.error("[EmailService] Resend email error:", error);
        return null;
      }

      console.log(`[EmailService] Order confirmation email dispatched to ${order.customerEmail}`, data);
      return data;
    } catch (err) {
      console.error("[EmailService] Failed to send email:", err);
      return null;
    }
  }

  /**
   * Send Altrivo-branded Password Reset Email via Resend
   */
  static async sendPasswordReset(email: string, resetLink: string, recipientName?: string) {
    if (!email || !email.includes("@")) {
      console.warn("[EmailService] No valid email provided for password reset.");
      return null;
    }

    try {
      const from = process.env.RESEND_FROM_EMAIL || "Altrivo <onboarding@resend.dev>";
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Altrivo Password</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <div style="max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <!-- Header with Altrivo Branding -->
            <div style="background: linear-gradient(135deg, #2d1a33 0%, #3e2845 50%, #5c3d5c 100%); padding: 32px 24px; text-align: center;">
              <div style="display: inline-block; padding: 8px 16px; background: rgba(255, 255, 255, 0.15); border-radius: 9999px; margin-bottom: 12px; backdrop-filter: blur(8px);">
                <span style="color: #f3e8ff; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">ALTRIVO COMMERCE</span>
              </div>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Password Reset Request</h1>
              <p style="color: #e9d5ff; font-size: 13px; margin: 8px 0 0 0;">Secure access recovery for your vendor account</p>
            </div>

            <!-- Content Area -->
            <div style="padding: 32px 28px;">
              <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0; line-height: 1.6;">
                Hello${recipientName ? ` <strong>${recipientName}</strong>` : ""},
              </p>
              <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.6;">
                We received a request to reset your password for your Altrivo account (<strong style="color: #0f172a;">${email}</strong>). Click the secure button below to set a new password.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}" style="display: inline-block; background: #3e2845; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 10px rgba(62, 40, 69, 0.25); letter-spacing: 0.2px;">
                  Reset Password →
                </a>
              </div>

              <!-- Note / Plain link -->
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
                  🔒 <em>This recovery link will expire in 1 hour. If you didn't initiate this request, you can safely ignore this email — your account remains completely secure.</em>
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

      const { data, error } = await resend.emails.send({
        from,
        to: [email],
        subject: "Reset your Altrivo password",
        html: htmlContent,
      });

      if (error) {
        console.error("[EmailService] Resend password reset error:", error);
        return null;
      }

      console.log(`[EmailService] Branded password reset email sent to ${email}`, data);
      return data;
    } catch (err) {
      console.error("[EmailService] Failed to send password reset email:", err);
      return null;
    }
  }

  /**
   * Send Altrivo-branded Vendor Welcome Email via Resend
   */
  static async sendVendorWelcome(name: string, email: string, businessName?: string) {
    if (!email || !email.includes("@")) {
      console.warn("[EmailService] No valid email provided for welcome message.");
      return null;
    }

    try {
      const from = process.env.RESEND_FROM_EMAIL || "Altrivo <onboarding@resend.dev>";
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Altrivo</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <div style="max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2d1a33 0%, #3e2845 50%, #5c3d5c 100%); padding: 36px 24px; text-align: center;">
              <div style="display: inline-block; padding: 8px 18px; background: rgba(255, 255, 255, 0.15); border-radius: 9999px; margin-bottom: 12px; backdrop-filter: blur(8px);">
                <span style="color: #f3e8ff; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">ALTRIVO COMMERCE</span>
              </div>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Welcome to Altrivo! 🎉</h1>
              <p style="color: #e9d5ff; font-size: 14px; margin: 8px 0 0 0;">Your vendor account has been successfully created</p>
            </div>

            <!-- Content Area -->
            <div style="padding: 32px 28px;">
              <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0; line-height: 1.6;">
                Dear <strong>${name || "Vendor"}</strong>,
              </p>
              <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
                Welcome to Altrivo — the modern multi-tenant e-commerce platform designed to help you build, launch, and scale high-converting online storefronts with ease.
              </p>

              <!-- Account Details Card -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 0 0 24px 0;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 10px;">Registered Account Details</div>
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
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Role:</td>
                    <td style="padding: 4px 0; color: #3e2845; font-weight: 700;">Vendor Merchant</td>
                  </tr>
                </table>
              </div>

              <!-- What You Can Do Now -->
              <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">What you can do right away:</h3>
              <div style="margin-bottom: 24px;">
                <div style="margin-bottom: 10px;">
                  <span style="font-size: 13px; color: #334155; line-height: 1.5;">🏬 <strong>Create Multiple Stores:</strong> Build unique storefronts for different niches, products, and brands under your single vendor account.</span>
                </div>
                <div style="margin-bottom: 10px;">
                  <span style="font-size: 13px; color: #334155; line-height: 1.5;">⚡ <strong>AI Store Builder:</strong> Generate high-converting store layouts, banners, and product copy in seconds with AI.</span>
                </div>
                <div style="margin-bottom: 10px;">
                  <span style="font-size: 13px; color: #334155; line-height: 1.5;">📦 <strong>Manage Products & Orders:</strong> Track real-time orders, manage inventory, and handle deliveries seamlessly.</span>
                </div>
              </div>

              <!-- Button -->
              <div style="text-align: center; margin: 28px 0 12px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login" style="display: inline-block; background: #3e2845; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 36px; border-radius: 12px; box-shadow: 0 4px 10px rgba(62, 40, 69, 0.25);">
                  Log In to Your Vendor Dashboard →
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
              <p style="font-size: 12px; font-weight: 600; color: #475569; margin: 0 0 4px 0;">Altrivo E-Commerce Platform</p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">Need help? Reply directly to this email or contact support.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { data, error } = await resend.emails.send({
        from,
        to: [email],
        subject: "Welcome to Altrivo - Your Vendor Account is Ready 🎉",
        html: htmlContent,
      });

      if (error) {
        console.error("[EmailService] Resend welcome email error:", error);
        return null;
      }

      console.log(`[EmailService] Vendor welcome email sent to ${email}`, data);
      return data;
    } catch (err) {
      console.error("[EmailService] Failed to send welcome email:", err);
      return null;
    }
  }
}

