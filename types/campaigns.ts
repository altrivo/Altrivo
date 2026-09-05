export type CampaignStatus = "Active" | "Paused" | "Draft" | "Completed";

export interface AdCreative {
  id: string;
  headline: string;
  primaryText: string;
  image: string;
  ctr: number;
  conversions: number;
  conversionRate: number;
}

export interface CampaignTargeting {
  minAge: number;
  maxAge: number;
  gender: "All" | "Men" | "Women";
  cities: string[];
  interests: string[];
}

export interface Campaign {
  id: string;
  name: string;
  productId: string;
  productTitle: string;
  productImage: string;
  dailyBudget: number;
  durationDays: number;
  totalBudget: number;
  spend: number;
  status: CampaignStatus;
  impressions: number;
  clicks: number;
  ctr: number;
  roas: number;
  paymentMethod: string;
  createdAt: string;
  targeting: CampaignTargeting;
  selectedCopy: string;
  creatives: AdCreative[];
  metaSandboxId: string;
}
