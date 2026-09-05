import { Campaign } from "@/types/campaigns";

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "cmp-101",
    name: "Celestial Harmony Gold Leaf Launch",
    productId: "p-101",
    productTitle: "Handcrafted Celestial Harmony Canvas Art",
    productImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80",
    dailyBudget: 45.0,
    durationDays: 14,
    totalBudget: 630.0,
    spend: 315.0,
    status: "Active",
    impressions: 48500,
    clicks: 1940,
    ctr: 4.0,
    roas: 5.4,
    paymentMethod: "VCC (•••• •••• •••• 4289)",
    createdAt: "Aug 01, 2026",
    metaSandboxId: "act_meta_sand_8941203",
    selectedCopy: "Transform your living space with original 24K gold leaf textured impasto oil art. Free Express Shipping on orders over $150!",
    targeting: {
      minAge: 25,
      maxAge: 54,
      gender: "All",
      cities: ["San Francisco, CA", "Los Angeles, CA", "New York, NY", "Austin, TX"],
      interests: ["Fine Art", "Interior Design", "Luxury Home Decor", "Canvas Painting"],
    },
    creatives: [
      {
        id: "cr-1",
        headline: "Original 24K Gold Leaf Texture Art",
        primaryText: "Hand-painted impasto oil artwork crafted with 24K gold leaf accents.",
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
        ctr: 4.6,
        conversions: 18,
        conversionRate: 3.8,
      },
      {
        id: "cr-2",
        headline: "Gallery-Wrapped & Ready to Hang",
        primaryText: "Sustainable kiln-dried pine wood stretchers with certificate of authenticity.",
        image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        ctr: 3.4,
        conversions: 11,
        conversionRate: 2.9,
      },
    ],
  },
  {
    id: "cmp-102",
    name: "Terracotta Ceramic Collector Campaign",
    productId: "p-102",
    productTitle: "Sculpted Earthenware Ceramic Vessel",
    productImage: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80",
    dailyBudget: 30.0,
    durationDays: 7,
    totalBudget: 210.0,
    spend: 180.0,
    status: "Active",
    impressions: 29200,
    clicks: 1168,
    ctr: 4.0,
    roas: 4.2,
    paymentMethod: "VCC (•••• •••• •••• 4289)",
    createdAt: "Aug 05, 2026",
    metaSandboxId: "act_meta_sand_7419284",
    selectedCopy: "Wheel-thrown terracotta ceramic vessels crafted with natural raw earth pigments.",
    targeting: {
      minAge: 28,
      maxAge: 60,
      gender: "All",
      cities: ["Seattle, WA", "Chicago, IL", "Miami, FL"],
      interests: ["Ceramics", "Minimalist Architecture", "Handcrafted Pottery"],
    },
    creatives: [
      {
        id: "cr-3",
        headline: "Artisanal Terracotta Vase",
        primaryText: "Wheel-thrown ceramic with a smooth chalky matte glaze.",
        image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80",
        ctr: 4.0,
        conversions: 14,
        conversionRate: 3.5,
      },
    ],
  },
];

export function getCampaignById(id: string): Campaign {
  const found = INITIAL_CAMPAIGNS.find((c) => c.id === id);
  return found || INITIAL_CAMPAIGNS[0];
}
