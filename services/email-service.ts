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
}
