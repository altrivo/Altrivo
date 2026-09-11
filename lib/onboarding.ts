export interface BusinessInfo {
  storeName: string;
  category: string;
  targetRegion: string;
  expectedProducts: string;
}

export interface ProductPrompt {
  prompt: string;
  skipped: boolean;
}

/** How the storefront arranges its product listing. */
export type ThemeLayout = "editorial" | "grid" | "list" | "masonry";

/** A sample catalog item, drawn with CSS so previews need no network. */
export interface ThemeProduct {
  name: string;
  price: string;
  emoji: string;
  swatch: string;
}

/** The design tokens the storefront actually renders with. */
export interface ThemeTokens {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  onPrimary: string;
  accent: string;
  heroBg: string;
  heroText: string;
  fontHeading: string;
  fontBody: string;
  radius: number;
  buttonRadius: number;
  cardShadow: string;
  headingTransform: "none" | "uppercase";
  headingWeight: number;
  headingTracking: string;
}

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  tag: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  fontFamily: string;
  layout: ThemeLayout;
  /** Sample storefront copy shown in the preview. */
  storeName: string;
  navLinks: string[];
  heroHeadline: string;
  heroSub: string;
  ctaLabel: string;
  tokens: ThemeTokens;
  products: ThemeProduct[];
}

export interface FirstProduct {
  title: string;
  price: string;
  category: string;
  description: string;
  imageUrl: string;
  stock: number;
  added: boolean;
}

export interface SetupChecklist {
  additionalProductsCount: number; // Goal: 3
  domainConnected: boolean;
  customDomainName?: string;
  courierAdded: boolean;
  courierName?: string;
  paymentGatewayConfigured: boolean;
}

export interface OnboardingState {
  currentStep: number; // 1, 2, 3, 4
  isCompleted: boolean;
  businessInfo: BusinessInfo;
  productPrompt: ProductPrompt;
  selectedThemeId: string;
  firstProduct: FirstProduct;
  checklist: SetupChecklist;
  updatedAt: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "minimal-luxe",
    name: "Minimal Luxe",
    description: "Monochrome elegance with high-contrast serif typography and sharp, gallery-like product framing.",
    tag: "High End & Fashion",
    primaryColor: "#171717",
    accentColor: "#D4AF37",
    bgGradient: "linear-gradient(135deg, #171717 0%, #262626 100%)",
    fontFamily: "Playfair Display",
    layout: "editorial",
    storeName: "MAISON NOIR",
    navLinks: ["New In", "Ready to Wear", "Atelier", "Journal"],
    heroHeadline: "The Autumn Edit",
    heroSub: "Considered pieces, made to outlast the season.",
    ctaLabel: "Shop the edit",
    tokens: {
      bg: "#FFFFFF",
      surface: "#FAFAFA",
      text: "#0A0A0A",
      muted: "#737373",
      border: "#E5E5E5",
      primary: "#171717",
      onPrimary: "#FFFFFF",
      accent: "#D4AF37",
      heroBg: "linear-gradient(135deg, #171717 0%, #2E2E2E 100%)",
      heroText: "#FFFFFF",
      fontHeading: 'var(--font-playfair), "Playfair Display", Georgia, serif',
      fontBody: 'var(--font-inter), Inter, system-ui, sans-serif',
      radius: 0,
      buttonRadius: 0,
      cardShadow: "none",
      headingTransform: "uppercase",
      headingWeight: 500,
      headingTracking: "0.14em",
    },
    products: [
      { name: "The Marlowe Trench", price: "$420", emoji: "🧥", swatch: "linear-gradient(160deg,#E7E2DA,#C9C1B6)" },
      { name: "Silk Slip Dress", price: "$260", emoji: "👗", swatch: "linear-gradient(160deg,#2B2B2B,#4A4A4A)" },
      { name: "Structured Leather Tote", price: "$340", emoji: "👜", swatch: "linear-gradient(160deg,#8B6F52,#5C4630)" },
      { name: "Cashmere Scarf", price: "$150", emoji: "🧣", swatch: "linear-gradient(160deg,#D8CFC4,#B4A794)" },
    ],
  },
  {
    id: "artisan-earth",
    name: "Artisan Earth",
    description: "Warm terracotta and clay tones with soft rounded cards, built for handmade and small-batch goods.",
    tag: "Handcrafted & Organic",
    primaryColor: "#874759",
    accentColor: "#C97B5A",
    bgGradient: "linear-gradient(135deg, #44232E 0%, #874759 100%)",
    fontFamily: "Fraunces",
    layout: "grid",
    storeName: "Clay & Thread",
    navLinks: ["Shop", "Our Makers", "Studio", "Care"],
    heroHeadline: "Made by hand, in small batches",
    heroSub: "Every piece is thrown, fired and finished in our studio.",
    ctaLabel: "Browse the collection",
    tokens: {
      bg: "#FDF8F4",
      surface: "#FFFFFF",
      text: "#44232E",
      muted: "#8A6A72",
      border: "#EADFD8",
      primary: "#874759",
      onPrimary: "#FFF7F4",
      accent: "#C97B5A",
      heroBg: "linear-gradient(135deg, #F6E4DA 0%, #E8C9BA 100%)",
      heroText: "#44232E",
      fontHeading: 'var(--font-fraunces), Fraunces, Georgia, serif',
      fontBody: 'var(--font-inter), Inter, system-ui, sans-serif',
      radius: 16,
      buttonRadius: 999,
      cardShadow: "0 6px 18px rgba(135,71,89,0.10)",
      headingTransform: "none",
      headingWeight: 600,
      headingTracking: "-0.01em",
    },
    products: [
      { name: "Hand-thrown Mug", price: "$34", emoji: "☕", swatch: "linear-gradient(160deg,#E0B49C,#C08163)" },
      { name: "Woven Seagrass Basket", price: "$58", emoji: "🧺", swatch: "linear-gradient(160deg,#E8D9BE,#C7AE86)" },
      { name: "Beeswax Candle Set", price: "$22", emoji: "🕯️", swatch: "linear-gradient(160deg,#F3E2C4,#DEBF8E)" },
      { name: "Speckled Clay Vase", price: "$46", emoji: "🏺", swatch: "linear-gradient(160deg,#D69A82,#A96A55)" },
    ],
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    description: "Dark surfaces with neon accents and glowing cards, tuned for tech, gadgets and gear.",
    tag: "Tech & Gadgets",
    primaryColor: "#38BDF8",
    accentColor: "#C084FC",
    bgGradient: "linear-gradient(135deg, #0B0713 0%, #2A1F3D 100%)",
    fontFamily: "Space Grotesk",
    layout: "grid",
    storeName: "NEONWORKS",
    navLinks: ["Keyboards", "Audio", "Desk", "Deals"],
    heroHeadline: "Build your endgame setup",
    heroSub: "Hot-swappable, hand-tuned, ships in 48 hours.",
    ctaLabel: "Configure yours",
    tokens: {
      bg: "#0B0713",
      surface: "#16101F",
      text: "#F4F0FF",
      muted: "#9B8FB5",
      border: "#2A1F3D",
      primary: "#38BDF8",
      onPrimary: "#06121C",
      accent: "#C084FC",
      heroBg: "linear-gradient(135deg, #1B1030 0%, #0B0713 60%, #123044 100%)",
      heroText: "#F4F0FF",
      fontHeading: 'var(--font-space), "Space Grotesk", ui-monospace, monospace',
      fontBody: 'var(--font-space), "Space Grotesk", system-ui, sans-serif',
      radius: 10,
      buttonRadius: 8,
      cardShadow: "0 0 0 1px rgba(56,189,248,0.14), 0 8px 26px rgba(56,189,248,0.14)",
      headingTransform: "none",
      headingWeight: 700,
      headingTracking: "-0.02em",
    },
    products: [
      { name: "Hot-swap Mech Keyboard", price: "$189", emoji: "⌨️", swatch: "linear-gradient(160deg,#1E2B45,#0E1626)" },
      { name: "PBT Keycap Set", price: "$79", emoji: "🎛️", swatch: "linear-gradient(160deg,#3B2A55,#1B1030)" },
      { name: "Low-latency Mouse", price: "$99", emoji: "🖱️", swatch: "linear-gradient(160deg,#123044,#0A1C29)" },
      { name: "RGB Desk Pad", price: "$45", emoji: "🟪", swatch: "linear-gradient(160deg,#4C1D95,#1E1B4B)" },
    ],
  },
  {
    id: "botanical-fresh",
    name: "Botanical Fresh",
    description: "Sage and ivory with a calm stacked product list, tailored to skincare, wellness and beauty.",
    tag: "Beauty & Skincare",
    primaryColor: "#047857",
    accentColor: "#A7F3D0",
    bgGradient: "linear-gradient(135deg, #064E3B 0%, #047857 100%)",
    fontFamily: "Inter",
    layout: "list",
    storeName: "Fern & Folk",
    navLinks: ["Skin", "Body", "Rituals", "Ingredients"],
    heroHeadline: "Clean formulas, quietly effective",
    heroSub: "Plant-derived actives. Nothing you can't pronounce.",
    ctaLabel: "Find your routine",
    tokens: {
      bg: "#F6FBF7",
      surface: "#FFFFFF",
      text: "#06342A",
      muted: "#5C8577",
      border: "#D8EAE0",
      primary: "#047857",
      onPrimary: "#FFFFFF",
      accent: "#A7F3D0",
      heroBg: "linear-gradient(135deg, #DCF3E6 0%, #B7E4CD 100%)",
      heroText: "#06342A",
      fontHeading: 'var(--font-inter), Inter, system-ui, sans-serif',
      fontBody: 'var(--font-inter), Inter, system-ui, sans-serif',
      radius: 20,
      buttonRadius: 999,
      cardShadow: "0 4px 14px rgba(4,120,87,0.08)",
      headingTransform: "none",
      headingWeight: 600,
      headingTracking: "-0.02em",
    },
    products: [
      { name: "Rosewater Facial Mist", price: "$28", emoji: "🌸", swatch: "linear-gradient(160deg,#F7D9E3,#E4AFC2)" },
      { name: "Vitamin C Serum", price: "$42", emoji: "🍊", swatch: "linear-gradient(160deg,#FBE0B8,#EFBC76)" },
      { name: "Oat Milk Cleanser", price: "$24", emoji: "🥛", swatch: "linear-gradient(160deg,#EFEADF,#D9D0BC)" },
      { name: "Overnight Repair Balm", price: "$36", emoji: "🌿", swatch: "linear-gradient(160deg,#CDE9D6,#96C9AB)" },
    ],
  },
  {
    id: "bold-vogue",
    name: "Bold Vogue",
    description: "Oversized editorial headlines and a staggered magazine grid for vibrant lifestyle collections.",
    tag: "Lifestyle & Apparel",
    primaryColor: "#E11D48",
    accentColor: "#FDE047",
    bgGradient: "linear-gradient(135deg, #881337 0%, #E11D48 100%)",
    fontFamily: "Playfair Display",
    layout: "masonry",
    storeName: "VOGUE&CO",
    navLinks: ["Drops", "Womenswear", "Archive", "Stockists"],
    heroHeadline: "Loud on purpose",
    heroSub: "The SS26 collection has landed. Limited runs only.",
    ctaLabel: "Shop the drop",
    tokens: {
      bg: "#FFF7F2",
      surface: "#FFFFFF",
      text: "#4C0519",
      muted: "#9F5B6C",
      border: "#FBD5DD",
      primary: "#E11D48",
      onPrimary: "#FFFFFF",
      accent: "#FDE047",
      heroBg: "linear-gradient(135deg, #E11D48 0%, #F97316 100%)",
      heroText: "#FFFFFF",
      fontHeading: 'var(--font-playfair), "Playfair Display", Georgia, serif',
      fontBody: 'var(--font-jakarta), "Plus Jakarta Sans", system-ui, sans-serif',
      radius: 4,
      buttonRadius: 999,
      cardShadow: "0 10px 24px rgba(225,29,72,0.12)",
      headingTransform: "none",
      headingWeight: 700,
      headingTracking: "-0.03em",
    },
    products: [
      { name: "Oversized Blazer", price: "$210", emoji: "🧥", swatch: "linear-gradient(160deg,#F9A8D4,#DB2777)" },
      { name: "Pleated Midi Skirt", price: "$130", emoji: "👗", swatch: "linear-gradient(160deg,#FDE047,#F59E0B)" },
      { name: "Statement Boots", price: "$290", emoji: "👢", swatch: "linear-gradient(160deg,#7C2D12,#431407)" },
      { name: "Gold Hoop Set", price: "$85", emoji: "💍", swatch: "linear-gradient(160deg,#FEF3C7,#D4AF37)" },
    ],
  },
  {
    id: "nordic-crisp",
    name: "Nordic Crisp",
    description: "Hairline borders and a tight scandinavian grid for home, furniture and interior catalogs.",
    tag: "Home & Living",
    primaryColor: "#2563EB",
    accentColor: "#BFDBFE",
    bgGradient: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
    fontFamily: "Inter",
    layout: "grid",
    storeName: "NORDHEM",
    navLinks: ["Furniture", "Lighting", "Textiles", "Sale"],
    heroHeadline: "Room for what matters",
    heroSub: "Solid oak, natural linen, free delivery over $200.",
    ctaLabel: "Shop living room",
    tokens: {
      bg: "#FFFFFF",
      surface: "#F8FAFC",
      text: "#0F172A",
      muted: "#64748B",
      border: "#E2E8F0",
      primary: "#2563EB",
      onPrimary: "#FFFFFF",
      accent: "#BFDBFE",
      heroBg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      heroText: "#0F172A",
      fontHeading: 'var(--font-inter), Inter, system-ui, sans-serif',
      fontBody: 'var(--font-inter), Inter, system-ui, sans-serif',
      radius: 6,
      buttonRadius: 6,
      cardShadow: "none",
      headingTransform: "none",
      headingWeight: 600,
      headingTracking: "-0.02em",
    },
    products: [
      { name: "Oak Side Table", price: "$240", emoji: "🪵", swatch: "linear-gradient(160deg,#E7D3B8,#C4A57B)" },
      { name: "Linen Cushion", price: "$45", emoji: "🛋️", swatch: "linear-gradient(160deg,#E2E8F0,#B8C4D4)" },
      { name: "Paper Pendant Lamp", price: "$120", emoji: "💡", swatch: "linear-gradient(160deg,#F8FAFC,#DBEAFE)" },
      { name: "Wool Throw", price: "$95", emoji: "🧶", swatch: "linear-gradient(160deg,#CBD5E1,#94A3B8)" },
    ],
  },
];

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  currentStep: 1,
  isCompleted: false,
  businessInfo: {
    storeName: "",
    category: "Fashion & Apparel",
    targetRegion: "Pakistan",
    expectedProducts: "10-50",
  },
  productPrompt: {
    prompt: "",
    skipped: false,
  },
  selectedThemeId: "minimal-luxe",
  firstProduct: {
    title: "",
    price: "49.99",
    category: "Fashion & Apparel",
    description: "",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    stock: 25,
    added: false,
  },
  checklist: {
    additionalProductsCount: 0,
    domainConnected: false,
    courierAdded: false,
    paymentGatewayConfigured: false,
  },
  updatedAt: new Date().toISOString(),
};

const STORAGE_KEY = "altrivo_vendor_onboarding_state";

export function getOnboardingState(): OnboardingState {
  if (typeof window === "undefined") {
    return INITIAL_ONBOARDING_STATE;
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return INITIAL_ONBOARDING_STATE;

    // Merge over defaults so state saved by an older shape never yields
    // undefined sub-objects for the step components.
    const saved = JSON.parse(data) as Partial<OnboardingState>;
    return {
      ...INITIAL_ONBOARDING_STATE,
      ...saved,
      businessInfo: { ...INITIAL_ONBOARDING_STATE.businessInfo, ...saved.businessInfo },
      productPrompt: { ...INITIAL_ONBOARDING_STATE.productPrompt, ...saved.productPrompt },
      firstProduct: { ...INITIAL_ONBOARDING_STATE.firstProduct, ...saved.firstProduct },
      checklist: { ...INITIAL_ONBOARDING_STATE.checklist, ...saved.checklist },
    };
  } catch (err) {
    console.error("Failed to load onboarding state from localStorage", err);
    return INITIAL_ONBOARDING_STATE;
  }
}

export function saveOnboardingState(state: OnboardingState): OnboardingState {
  const updatedState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
    } catch (err) {
      console.warn("Failed to save onboarding state to localStorage", err);
    }
  }
  return updatedState;
}

export function resetOnboardingState(): OnboardingState {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to reset onboarding state", err);
    }
  }
  return INITIAL_ONBOARDING_STATE;
}
