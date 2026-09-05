import { CodVerificationService, MetaMarketingService, WalletService } from "../services/marketing-wallet-service";
import { OrdersBackendService } from "../services/orders-backend-service";

describe("COD, Meta Marketing, and Wallet Ledger Services", () => {
  beforeEach(() => {
    OrdersBackendService.resetStore();
    WalletService.resetStore();
    CodVerificationService.pendingVerificationOrders.clear();
  });

  // 1. COD & WhatsApp Verification Flow
  it("creates a COD order, initiates WhatsApp verification, and transitions status on verify click", async () => {
    const mockOrder = await OrdersBackendService.createOrder({
      vendor_id: "vendor_dev_123",
      customerName: "Ayesha Malik",
      customerEmail: "ayesha@example.com",
      customerPhone: "+923001234567",
      totalAmount: 18500,
      paymentStatus: "pending",
      paymentMethod: "cod",
      deliveryStatus: "pending",
      deliveryMethod: "standard",
      shippingAddress: "Street Address, Lahore",
      items: [{ id: "i1", name: "Fashion Item", price: 18500, quantity: 1 }],
    });

    const verifyUrl = await CodVerificationService.initiateVerification(mockOrder);
    expect(verifyUrl).toContain("verify-cod");
    expect(verifyUrl).toContain(mockOrder.id);
    expect(CodVerificationService.pendingVerificationOrders.has(mockOrder.id)).toBe(true);

    // Call verify
    const success = await CodVerificationService.verifyOrder(mockOrder.id);
    expect(success).toBe(true);
    expect(CodVerificationService.pendingVerificationOrders.has(mockOrder.id)).toBe(false);

    // Check updated order state (should be processing / confirmed)
    const updatedOrder = await OrdersBackendService.getOrderById(mockOrder.id);
    expect(updatedOrder?.deliveryStatus).toBe("processing");
    const verifiedTimelineEvent = updatedOrder?.timeline?.find(t => t.step === "confirmed");
    expect(verifiedTimelineEvent).toBeDefined();
  });

  // 2. Meta Marketing API & AI Mocks
  it("generates 3 ad copy variants and suggests target demographics", async () => {
    const copy = await MetaMarketingService.generateAdCopy("prod_001");
    expect(copy.length).toBe(3);
    expect(copy[0].headline).toBeDefined();
    expect(copy[0].cta).toBe("Shop Now");

    const targeting = await MetaMarketingService.getTargetingSuggestion("Fashion");
    expect(targeting.age).toBe("18-35");
    expect(targeting.cities).toContain("Lahore");
    expect(targeting.interests).toContain("Online shopping");
  });

  it("creates campaigns and runs sync job queries correctly", async () => {
    const campaign = await MetaMarketingService.createCampaign("vendor_dev_123", {
      name: "Eid Launch Sale",
      budget: 12000,
    });
    expect(campaign.campaignId).toBeDefined();
    expect(campaign.status).toBe("ACTIVE");
    expect(campaign.budget).toBe(12000);

    const activeSyncedCount = await MetaMarketingService.syncCampaignMetrics();
    expect(activeSyncedCount).toBeGreaterThan(0);
  });

  // 3. Wallet Ledger & VCC Card balance derivations
  it("correctly derives wallet balances from the ledger list", async () => {
    const vendorId = "vendor_dev_123";
    
    // Initial balance should be 0
    let balance = WalletService.getBalanceFromLedger(vendorId);
    expect(balance).toBe(0);

    // Add Top-Up
    await WalletService.recordTransaction(vendorId, "top-up", 15000.00);
    balance = WalletService.getBalanceFromLedger(vendorId);
    expect(balance).toBe(15000.00);

    // Charge Ad campaigns
    await WalletService.recordTransaction(vendorId, "charge", -2500.00);
    balance = WalletService.getBalanceFromLedger(vendorId);
    expect(balance).toBe(12500.00);

    // Verify ledger transactions
    const history = WalletService.getTransactions(vendorId);
    expect(history.length).toBe(2);
    expect(history[0].type).toBe("top-up");
    expect(history[1].type).toBe("charge");
    expect(history[1].balance_after).toBe(12500.00);
  });

  it("issues virtual cards and charges the wallet balance ledger", async () => {
    const vendorId = "vendor_dev_123";

    // Inject initial funds
    await WalletService.recordTransaction(vendorId, "top-up", 20000.00);

    // Issue VCC of 5000
    const vcc = await WalletService.issueVcc(vendorId, 5000.00);
    expect(vcc.id).toBeDefined();
    expect(vcc.balance).toBe(5000.00);
    expect(vcc.maskedPan).toMatch(/^4111-XXXX-XXXX-\d{4}$/);
    expect(vcc.status).toBe("active");

    // Wallet balance should now be 15000 (charged 5000 for VCC funding)
    const walletBalance = WalletService.getBalanceFromLedger(vendorId);
    expect(walletBalance).toBe(15000.00);

    const cards = WalletService.getVccs(vendorId);
    expect(cards.length).toBe(1);
    expect(cards[0].id).toBe(vcc.id);
  });

  it("throws error during VCC issuance if wallet balance is insufficient", async () => {
    const vendorId = "vendor_dev_123";
    await expect(
      WalletService.issueVcc(vendorId, 100.00)
    ).rejects.toThrow("Insufficient wallet balance for VCC issuance");
  });

  // 4. VCC Lifecycle & BaaS Webhook operations
  it("controls VCC status active -> freeze -> close, and handles card top-ups & webhooks", async () => {
    const vendorId = "vendor_dev_123";
    
    // Setup initial balance & card
    await WalletService.recordTransaction(vendorId, "top-up", 30000.00);
    const vcc = await WalletService.issueVcc(vendorId, 10000.00);

    // Freeze card
    const frozen = await WalletService.freezeVcc(vcc.id);
    expect(frozen.status).toBe("frozen");

    // Re-activate card
    const active = await WalletService.activateVcc(vcc.id);
    expect(active.status).toBe("active");

    // Top up VCC card from Wallet ledger
    await WalletService.topUpVccFromWallet(vcc.id, vendorId, 5000.00);
    expect(active.balance).toBe(15000.00);
    expect(WalletService.getBalanceFromLedger(vendorId)).toBe(15000.00); // 30k initial - 10k initial vcc - 5k topup

    // Close card
    const closed = await WalletService.closeVcc(vcc.id);
    expect(closed.status).toBe("cancelled");

    // Check webhook decline if card is cancelled
    let webhookResult = await WalletService.processVccTransactionWebhook(vcc.id, 200.00, "Facebook Ads");
    expect(webhookResult).toBe(false);

    // Check webhook approve on active card with sufficient balance
    const activeCard = await WalletService.activateVcc(vcc.id);
    webhookResult = await WalletService.processVccTransactionWebhook(vcc.id, 2000.00, "Google Ads");
    expect(webhookResult).toBe(true);
    expect(activeCard.balance).toBe(13000.00);
    expect(WalletService.getBalanceFromLedger(vendorId)).toBe(13000.00); // Wallet ledger reflects VCC card transaction charge
  });
});
