export interface BusinessProfile {
  storeName: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  businessEmail: string;
  logoUrl: string;
}

export interface NotificationSettings {
  orderAlerts: boolean;
  lowStockWarnings: boolean;
  campaignUpdates: boolean;
  whatsAppForwards: boolean;
  marketingTips: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  avatar: string;
  status: "Active" | "Pending";
  addedAt: string;
}

export interface SecuritySession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  date: string;
  description: string;
  amount: number;
  paymentMethod: string;
  status: "Paid" | "Pending" | "Failed";
  downloadUrl: string;
}

export interface BillingState {
  currentPlanId: "starter" | "growth" | "scale";
  billingCycle: "monthly" | "yearly";
  walletBalance: number;
  invoices: InvoiceItem[];
}

export interface SettingsState {
  profile: BusinessProfile;
  notifications: NotificationSettings;
  team: TeamMember[];
  sessions: SecuritySession[];
}

export const INITIAL_SETTINGS_STATE: SettingsState = {
  profile: {
    storeName: "Apex Artisans",
    category: "Handcrafted Goods",
    description: "Premium handcrafted leather accessories and sustainable lifestyle products.",
    address: "Suite 402, Commerce Plaza, Gulberg III, Lahore, Pakistan",
    phone: "+92 300 1234567",
    businessEmail: "hello@apexartisans.com",
    logoUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&q=80",
  },
  notifications: {
    orderAlerts: true,
    lowStockWarnings: true,
    campaignUpdates: false,
    whatsAppForwards: true,
    marketingTips: true,
  },
  team: [
    {
      id: "mem-1",
      name: "Ali Khan (Owner)",
      email: "ali@apexartisans.com",
      role: "Admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      status: "Active",
      addedAt: "2026-01-15",
    },
    {
      id: "mem-2",
      name: "Sara Ahmed",
      email: "sara@apexartisans.com",
      role: "Editor",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
      status: "Active",
      addedAt: "2026-03-10",
    },
    {
      id: "mem-3",
      name: "Usman Raza",
      email: "usman@apexartisans.com",
      role: "Viewer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      status: "Pending",
      addedAt: "2026-07-22",
    },
  ],
  sessions: [
    {
      id: "sess-1",
      device: "Chrome on macOS (MacBook Pro)",
      location: "Lahore, Pakistan",
      ip: "182.185.102.14",
      lastActive: "Just now",
      current: true,
    },
    {
      id: "sess-2",
      device: "Altrivo Vendor App on iPhone 15",
      location: "Karachi, Pakistan",
      ip: "39.40.12.88",
      lastActive: "2 hours ago",
      current: false,
    },
    {
      id: "sess-3",
      device: "Firefox on Windows 11",
      location: "Islamabad, Pakistan",
      ip: "119.160.98.5",
      lastActive: "3 days ago",
      current: false,
    },
  ],
};

export const INITIAL_BILLING_STATE: BillingState = {
  currentPlanId: "growth",
  billingCycle: "monthly",
  walletBalance: 250.0,
  invoices: [
    {
      id: "inv-104",
      invoiceNumber: "INV-2026-0801",
      date: "Aug 01, 2026",
      description: "Growth Plan Monthly Subscription",
      amount: 79.0,
      paymentMethod: "JazzCash Wallet",
      status: "Paid",
      downloadUrl: "#",
    },
    {
      id: "inv-103",
      invoiceNumber: "TOP-2026-0720",
      date: "Jul 20, 2026",
      description: "Ad Campaign Wallet Top-Up",
      amount: 150.0,
      paymentMethod: "EasyPaisa",
      status: "Paid",
      downloadUrl: "#",
    },
    {
      id: "inv-102",
      invoiceNumber: "INV-2026-0701",
      date: "Jul 01, 2026",
      description: "Growth Plan Monthly Subscription",
      amount: 79.0,
      paymentMethod: "Bank Transfer (HBL)",
      status: "Paid",
      downloadUrl: "#",
    },
    {
      id: "inv-101",
      invoiceNumber: "TOP-2026-0615",
      date: "Jun 15, 2026",
      description: "Initial Wallet Deposit",
      amount: 100.0,
      paymentMethod: "Visa ending 4242",
      status: "Paid",
      downloadUrl: "#",
    },
  ],
};

const SETTINGS_KEY = "altrivo_vendor_settings_data";
const BILLING_KEY = "altrivo_vendor_billing_data";

export function getSettingsState(): SettingsState {
  if (typeof window === "undefined") return INITIAL_SETTINGS_STATE;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_SETTINGS_STATE;
  } catch (err) {
    console.error("Failed to load settings from localStorage", err);
    return INITIAL_SETTINGS_STATE;
  }
}

export function saveSettingsState(state: SettingsState): SettingsState {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to save settings to localStorage", err);
    }
  }
  return state;
}

export function getBillingState(): BillingState {
  if (typeof window === "undefined") return INITIAL_BILLING_STATE;
  try {
    const raw = localStorage.getItem(BILLING_KEY);
    return raw ? JSON.parse(raw) : INITIAL_BILLING_STATE;
  } catch (err) {
    console.error("Failed to load billing state from localStorage", err);
    return INITIAL_BILLING_STATE;
  }
}

export function saveBillingState(state: BillingState): BillingState {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BILLING_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to save billing state to localStorage", err);
    }
  }
  return state;
}
