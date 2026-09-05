import { OrdersBackendService } from "@/services/orders-backend-service";
import { Order } from "@/types/orders";

// 1. WhatsApp COD Verification Mock Service
export class CodVerificationService {
  static pendingVerificationOrders = new Set<string>();

  static async initiateVerification(order: Order): Promise<string> {
    const orderId = order.id;
    this.pendingVerificationOrders.add(orderId);
    
    // Build verify URL
    const verifyUrl = `https://altrivo.com/api/checkout/verify-cod?orderId=${orderId}`;
    
    console.log(`[WhatsApp Business API] Sending Verification to ${order.customerPhone || "+923001234567"}`);
    console.log(`[WhatsApp Message]: "Hi ${order.customerName}, please click this link to verify your Cash on Delivery order ${order.orderNumber}: ${verifyUrl}"`);
    
    return verifyUrl;
  }

  static async verifyOrder(orderId: string): Promise<boolean> {
    if (!this.pendingVerificationOrders.has(orderId)) {
      return false;
    }
    
    // Remove from pending verify set
    this.pendingVerificationOrders.delete(orderId);

    // Transition the order status to confirmed (processing) via state machine
    await OrdersBackendService.transitionStatus(orderId, "confirmed");
    return true;
  }
}

// 2. Meta Marketing API v18+ & AI Mock Service
export interface AdCopyVariant {
  headline: string;
  body: string;
  cta: string;
}

export interface AdTargeting {
  age: string;
  gender: string;
  cities: string[];
  interests: string[];
}

export class MetaMarketingService {
  static async generateAdCopy(productId: string): Promise<AdCopyVariant[]> {
    // Simulated LLM generation based on product ID
    console.log(`[AI LLM Engine] Generating ad copy variants for product: ${productId} with minimal token footprint.`);
    return [
      {
        headline: "Premium Handcrafted Quality, Direct to You",
        body: "Discover the best artisanal products, beautifully designed and made with care. Order today with secure checkout!",
        cta: "Shop Now",
      },
      {
        headline: "Elevate Your Space with Artisan Crafts",
        body: "Authentic, high-quality items designed to fit your unique lifestyle. Limited stock available. Get yours now!",
        cta: "Order Today",
      },
      {
        headline: "Exclusive Handcrafted Selection",
        body: "Every piece tells a story. Shop directly from Pakistan's most talented creators with verified escrow protection.",
        cta: "Buy Now",
      },
    ];
  }

  static async getTargetingSuggestion(category: string): Promise<AdTargeting> {
    console.log(`[AI Targeting Engine] Suggesting demographics based on category: ${category}`);
    if (category.toLowerCase().includes("fashion")) {
      return {
        age: "18-35",
        gender: "All",
        cities: ["Lahore", "Karachi", "Islamabad"],
        interests: ["Fashion accessories", "Online shopping", "Luxury goods"],
      };
    }
    return {
      age: "22-45",
      gender: "All",
      cities: ["Lahore", "Karachi", "Islamabad", "Faisalabad"],
      interests: ["Home decor", "Handicraft", "Artisan crafts"],
    };
  }

  static async createCampaign(vendorId: string, campaignData: any): Promise<any> {
    console.log(`[Meta Marketing API v18+] Creating Campaign for vendor: ${vendorId}`);
    return {
      campaignId: `meta_camp_${Date.now()}`,
      status: "ACTIVE",
      budget: campaignData.budget || 5000,
      name: campaignData.name || "Default Meta Campaign",
      targeting: campaignData.targeting || {},
    };
  }

  static async syncCampaignMetrics(): Promise<number> {
    console.log("[Meta Sync Job] Querying Meta Marketing API v18+ for latest campaign stats...");
    // Simulates pulling statistics into DB every 15 minutes
    return 15; // Represents number of active campaigns synced
  }
}

// 3. Wallet Ledger & VCC Service
export interface WalletTransaction {
  id: string;
  vendorId: string;
  type: "top-up" | "charge" | "refund" | "vcc_funding";
  amount: number;
  balance_after: number;
  ref_id?: string;
  created_at: string;
}

export interface VccCard {
  id: string;
  vendorId: string;
  bankRef: string;
  maskedPan: string;
  balance: number;
  status: "active" | "frozen" | "cancelled";
}

// In-memory append-only transaction ledger
let transactionLedgerStore: WalletTransaction[] = [];
let vccStore: VccCard[] = [];

export class WalletService {
  /**
   * Derive vendor balance by summing up all transaction amounts in the append-only ledger
   */
  static getBalanceFromLedger(vendorId: string): number {
    const vendorTx = transactionLedgerStore.filter(t => t.vendorId === vendorId);
    return vendorTx.reduce((sum, tx) => sum + tx.amount, 0.00);
  }

  /**
   * Get transaction history for vendor
   */
  static getTransactions(vendorId: string): WalletTransaction[] {
    return transactionLedgerStore.filter(t => t.vendorId === vendorId);
  }

  /**
   * Record transaction to append-only ledger
   */
  static async recordTransaction(
    vendorId: string,
    type: "top-up" | "charge" | "refund" | "vcc_funding",
    amount: number,
    refId?: string
  ): Promise<WalletTransaction> {
    const currentBalance = this.getBalanceFromLedger(vendorId);
    const newBalance = currentBalance + amount;

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      vendorId,
      type,
      amount,
      balance_after: newBalance,
      ref_id: refId,
      created_at: new Date().toISOString(),
    };

    transactionLedgerStore.push(newTx);
    return newTx;
  }

  /**
   * Issue Virtual Credit Card (VCC)
   */
  static async issueVcc(vendorId: string, fundingAmount: number): Promise<VccCard> {
    const currentBalance = this.getBalanceFromLedger(vendorId);
    if (currentBalance < fundingAmount) {
      throw new Error("Insufficient wallet balance for VCC issuance");
    }

    // 1. Charge the wallet (VCC Funding transaction is a negative amount in ledger)
    await this.recordTransaction(vendorId, "vcc_funding", -fundingAmount);

    // 2. Call partner bank mock API
    const cardId = `vcc-${Date.now()}`;
    const bankRef = `partner_bank_ref_${Date.now()}`;
    
    // Masked PAN generation (showing only last 4 digits)
    const randomCardNo = Math.floor(1000 + Math.random() * 9000);
    const maskedPan = `4111-XXXX-XXXX-${randomCardNo}`;

    const newCard: VccCard = {
      id: cardId,
      vendorId,
      bankRef,
      maskedPan,
      balance: fundingAmount,
      status: "active",
    };

    vccStore.push(newCard);
    console.log(`[Partner Bank Card Issuance API] Successfully issued VCC ${maskedPan} via bank ref ${bankRef}`);

    return newCard;
  }

  static getVccs(vendorId: string): VccCard[] {
    return vccStore.filter(c => c.vendorId === vendorId);
  }

  /**
   * KYC Verification Check Mock
   */
  static async performKycCheck(vendorId: string): Promise<boolean> {
    console.log(`[Partner Bank BaaS] Running KYC verification checks for vendor ${vendorId}...`);
    // Basic verification passes successfully in dev
    return true;
  }

  /**
   * Freeze Virtual Card
   */
  static async freezeVcc(cardId: string): Promise<VccCard> {
    const card = vccStore.find((c) => c.id === cardId);
    if (!card) throw new Error("VCC card not found");
    card.status = "frozen";
    console.log(`[Partner Bank BaaS] Card ${card.maskedPan} status set to FREEZE.`);
    return card;
  }

  /**
   * Activate Virtual Card
   */
  static async activateVcc(cardId: string): Promise<VccCard> {
    const card = vccStore.find((c) => c.id === cardId);
    if (!card) throw new Error("VCC card not found");
    card.status = "active";
    console.log(`[Partner Bank BaaS] Card ${card.maskedPan} status set to ACTIVE.`);
    return card;
  }

  /**
   * Close/Cancel Virtual Card
   */
  static async closeVcc(cardId: string): Promise<VccCard> {
    const card = vccStore.find((c) => c.id === cardId);
    if (!card) throw new Error("VCC card not found");
    card.status = "cancelled";
    console.log(`[Partner Bank BaaS] Card ${card.maskedPan} status set to CANCELLED.`);
    return card;
  }

  /**
   * Top up Virtual Card from Wallet balance
   */
  static async topUpVccFromWallet(cardId: string, vendorId: string, amount: number): Promise<VccCard> {
    const card = vccStore.find((c) => c.id === cardId && c.vendorId === vendorId);
    if (!card) throw new Error("VCC card not found");
    if (card.status !== "active") throw new Error("VCC card is not active");

    const currentBalance = this.getBalanceFromLedger(vendorId);
    if (currentBalance < amount) {
      throw new Error("Insufficient wallet balance for VCC top-up");
    }

    // Charge wallet
    await this.recordTransaction(vendorId, "vcc_funding", -amount, cardId);
    // Add to card balance
    card.balance += amount;
    console.log(`[Partner Bank BaaS] Topped up VCC ${card.maskedPan} with $${amount}. New balance: $${card.balance}`);
    return card;
  }

  /**
   * Webhook callback processing for card payments / transactions
   */
  static async processVccTransactionWebhook(cardId: string, amount: number, merchant: string): Promise<boolean> {
    const card = vccStore.find((c) => c.id === cardId);
    if (!card) {
      console.error(`[BaaS Webhook] Card ${cardId} not found.`);
      return false;
    }

    if (card.status !== "active") {
      console.warn(`[BaaS Webhook] Authorization declined: Card ${card.maskedPan} is ${card.status}.`);
      return false;
    }

    if (card.balance < amount) {
      console.warn(`[BaaS Webhook] Authorization declined: Insufficient VCC balance ($${card.balance} < $${amount}).`);
      return false;
    }

    // Deduct card balance
    card.balance -= amount;
    console.log(`[BaaS Webhook] Authorized card transaction: -$${amount} at ${merchant}. Card balance: $${card.balance}`);

    // Log VCC transaction in ledger
    await this.recordTransaction(card.vendorId, "charge", -amount, `vcc_tx_${Date.now()}`);
    return true;
  }

  static resetStore() {
    transactionLedgerStore = [];
    vccStore = [];
  }
}
