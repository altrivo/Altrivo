import crypto from "crypto";

export interface GatewaySessionResponse {
  sessionId: string;
  redirectUrl: string;
  gateway: "payfast" | "safepay" | "stripe";
}

export class PaymentGatewayService {
  // Credentials matching sandbox / live values
  private static PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || "10000100";
  private static PAYFAST_SECURE_PASSPHRASE = process.env.PAYFAST_SECURE_PASSPHRASE || "payfast_passphrase_secret";

  private static SAFEPAY_SANDBOX_KEY = process.env.SAFEPAY_SANDBOX_KEY || "safepay_key_secret";
  
  private static STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_stripe_secret";

  /**
   * Create Checkout Session for PayFast
   */
  static async createPayFastSession(
    orderId: string,
    amount: number,
    currency: string = "PKR"
  ): Promise<GatewaySessionResponse> {
    const amountStr = amount.toFixed(2);
    
    // Generate signature payload
    const params: Record<string, string> = {
      merchant_id: this.PAYFAST_MERCHANT_ID,
      merchant_key: "46f0z65zpj6eg",
      return_url: "https://altrivo.com/checkout/success",
      cancel_url: "https://altrivo.com/cart",
      notify_url: "https://altrivo.com/api/webhooks/payfast",
      m_payment_id: orderId,
      amount: amountStr,
      item_name: `Altrivo Order ${orderId}`,
    };

    // Calculate MD5 signature for PayFast validation
    let paramString = "";
    Object.keys(params).forEach((key) => {
      paramString += `${key}=${encodeURIComponent(params[key].trim()).replace(/%20/g, "+")}&`;
    });
    paramString += `passphrase=${encodeURIComponent(this.PAYFAST_SECURE_PASSPHRASE.trim())}`;
    const signature = crypto.createHash("md5").update(paramString).digest("hex");

    const queryParams = new URLSearchParams({ ...params, signature }).toString();
    const redirectUrl = `https://sandbox.payfast.co.za/eng/process?${queryParams}`;

    return {
      sessionId: `pf_sess_${Date.now()}`,
      redirectUrl,
      gateway: "payfast",
    };
  }

  /**
   * Verify PayFast Webhook Notification
   */
  static verifyPayFastWebhook(payload: Record<string, string>, receivedSignature: string): boolean {
    // Collect all parameters except signature
    const keys = Object.keys(payload).filter((k) => k !== "signature");
    let paramString = "";
    keys.forEach((key) => {
      paramString += `${key}=${encodeURIComponent(payload[key].trim()).replace(/%20/g, "+")}&`;
    });
    paramString += `passphrase=${encodeURIComponent(this.PAYFAST_SECURE_PASSPHRASE.trim())}`;
    
    const calculatedSignature = crypto.createHash("md5").update(paramString).digest("hex");
    return calculatedSignature === receivedSignature;
  }

  /**
   * Create Checkout Session for Safepay (Local Pakistan)
   */
  static async createSafepaySession(
    orderId: string,
    amount: number,
    currency: string = "PKR"
  ): Promise<GatewaySessionResponse> {
    const sessionId = `sf_sess_${Date.now()}`;
    // Simulate Safepay URL checkout
    const redirectUrl = `https://sandbox.api.securesafepay.info/checkout?env=sandbox&beacon=${sessionId}&order_id=${orderId}&amount=${amount}&currency=${currency}`;
    
    return {
      sessionId,
      redirectUrl,
      gateway: "safepay",
    };
  }

  /**
   * Verify Safepay Webhook (HMAC-SHA256)
   */
  static verifySafepayWebhook(payload: string, receivedSignature: string): boolean {
    const calculated = crypto
      .createHmac("sha256", this.SAFEPAY_SANDBOX_KEY)
      .update(payload)
      .digest("hex");
    return calculated === receivedSignature;
  }

  /**
   * Create Checkout Session for Stripe (International)
   */
  static async createStripeSession(
    orderId: string,
    amount: number,
    currency: string = "USD"
  ): Promise<GatewaySessionResponse> {
    const sessionId = `cs_stripe_${Date.now()}`;
    // Simulate Stripe Checkout page with metadata
    const redirectUrl = `https://checkout.stripe.com/pay/${sessionId}?order_id=${orderId}&amount=${amount}&currency=${currency}&link=true&wallets=apple_google`;
    
    return {
      sessionId,
      redirectUrl,
      gateway: "stripe",
    };
  }

  /**
   * Verify Stripe Webhook Payload signature
   */
  static verifyStripeWebhook(payload: string, signatureHeader: string): boolean {
    // Signature header usually in format: t=123,v1=sha256
    try {
      const parts = signatureHeader.split(",");
      const timestampPart = parts.find((p) => p.startsWith("t="));
      const sigPart = parts.find((p) => p.startsWith("v1="));

      if (!timestampPart || !sigPart) return false;

      const timestamp = timestampPart.split("=")[1];
      const receivedSig = sigPart.split("=")[1];

      const signedPayload = `${timestamp}.${payload}`;
      const expectedSig = crypto
        .createHmac("sha256", this.STRIPE_WEBHOOK_SECRET)
        .update(signedPayload)
        .digest("hex");

      return expectedSig === receivedSig;
    } catch {
      return false;
    }
  }
}
