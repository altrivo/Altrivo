import crypto from "crypto";
import { PaymentGatewayService } from "../services/payment-gateway-service";

describe("PaymentGatewayService Mocks & Webhook Signatures", () => {
  
  it("creates a PayFast sandbox session and calculates correct MD5 parameters signature", async () => {
    const session = await PaymentGatewayService.createPayFastSession("ord-pf-001", 1500.0, "PKR");
    expect(session.gateway).toBe("payfast");
    expect(session.redirectUrl).toContain("signature=");

    // Verify generated redirect signature parameters
    const url = new URL(session.redirectUrl);
    const receivedParams: Record<string, string> = {};
    url.searchParams.forEach((val, key) => {
      receivedParams[key] = val;
    });

    const receivedSignature = receivedParams.signature;
    const isValid = PaymentGatewayService.verifyPayFastWebhook(receivedParams, receivedSignature);
    expect(isValid).toBe(true);
  });

  it("creates Safepay session and verifies webhook signature successfully", async () => {
    const session = await PaymentGatewayService.createSafepaySession("ord-sf-001", 3500.0, "PKR");
    expect(session.gateway).toBe("safepay");
    expect(session.redirectUrl).toContain("env=sandbox");

    const payload = JSON.stringify({ order_id: "ord-sf-001", status: "success" });
    const sandboxKey = "safepay_key_secret";
    const signature = crypto
      .createHmac("sha256", sandboxKey)
      .update(payload)
      .digest("hex");

    const isVerified = PaymentGatewayService.verifySafepayWebhook(payload, signature);
    expect(isVerified).toBe(true);
  });

  it("creates Stripe session and verifies timestamped webhook headers successfully", async () => {
    const session = await PaymentGatewayService.createStripeSession("ord-str-001", 45.0, "USD");
    expect(session.gateway).toBe("stripe");
    expect(session.redirectUrl).toContain("checkout.stripe.com");

    const payload = JSON.stringify({ type: "checkout.session.completed", id: "evt_123" });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const webhookSecret = "whsec_stripe_secret";

    const signedPayload = `${timestamp}.${payload}`;
    const expectedSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(signedPayload)
      .digest("hex");

    const signatureHeader = `t=${timestamp},v1=${expectedSig}`;
    const isVerified = PaymentGatewayService.verifyStripeWebhook(payload, signatureHeader);
    expect(isVerified).toBe(true);
  });
});
