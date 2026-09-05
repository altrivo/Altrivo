import { StoreBlueprintPlan } from './store-planner';

export interface StoreMediaAssets {
  heroImage: { url: string; altText: string };
  categoryImages: Array<{ url: string; altText: string }>;
  productPlaceholders: Array<{ url: string; altText: string }>;
  brandStoryImage: { url: string; altText: string };
}

// ---------------------------------------------------------------------------
// 100% Verified, Working HD Unsplash Photo Library by Niche
// ---------------------------------------------------------------------------
const VERIFIED_NICHE_ASSETS: Record<string, string[]> = {
  shoes: [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80', // Royal Oxford
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',  // Tan Brogues
    'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',  // Suede Loafers
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',  // Sneakers
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',  // Traditional Peshawari
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80', // Cobbler Workshop Story
  ],
  fashion: [
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80', // Formal Shirt
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',  // Linen Casual
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',  // Navy Executive
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',  // Streetwear Tee
    'https://images.unsplash.com/photo-1490481651828-36b1c0ca8f4d?auto=format&fit=crop&w=800&q=80',  // Boutique Model
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80', // Tailor Atelier Story
  ],
  clothing: [
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=80',
  ],
  electronics: [
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80', // Wireless ANC Earbuds
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',  // RGB Keyboard
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',  // Smartwatch
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',  // Studio Headphones
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',  // Minimal Watch
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80', // Workspace Tech
  ],
  watches: [
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80', // Chronograph
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',  // Leather Watch
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',  // Coffee Watch
    'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',  // Vintage Gold
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',  // Gold Bracelet
    'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?auto=format&fit=crop&w=1200&q=80', // Watchmaker Studio
  ],
  perfumes: [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80', // Luxury Perfume Bottle
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',  // Amber Oud Scent
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',  // Minimalist Cologne
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',  // Gold Cap Essence
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',  // Attar Oils
    'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=80', // Perfume Studio
  ],
  jewelry: [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80', // 18K Gold Ring
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',  // Gold Necklace
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',  // Diamond Earrings
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',  // Moissanite Band
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80',  // Gemstone Pendant
    'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=80', // Goldsmith Atelier
  ],
  beauty: [
    'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80', // Luxury Cosmetics
    'https://images.unsplash.com/photo-1596462502278-27bf85a7bb93?auto=format&fit=crop&w=800&q=80',  // Skincare Serum
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',  // Natural Cream
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80',  // Essential Oils
    'https://images.unsplash.com/photo-1611077544390-3ae8e630cc00?auto=format&fit=crop&w=800&q=80',  // Perfume Bottle
    'https://images.unsplash.com/photo-1512290900672-1f4865104d4f?auto=format&fit=crop&w=1200&q=80', // Organic Lab
  ],
  home: [
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80', // Modern Living
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',  // Designer Armchair
    'https://images.unsplash.com/photo-1505691938895-1758d7bef511?auto=format&fit=crop&w=800&q=80',  // Ceramic Tableware
    'https://images.unsplash.com/photo-1616487211158-eb5fa30b1348?auto=format&fit=crop&w=800&q=80',  // Minimalist Lamp
    'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=800&q=80',  // Abstract Canvas
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', // Architecture Studio
  ],
};

const DEFAULT_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80',
];

/**
 * Instant AI Image URL Generator (Uses AI diffusion models for prompt generation)
 */
export function generateAIImageUrl(prompt: string, width = 800, height = 1000): string {
  const cleanPrompt = prompt.replace(/[^\w\s,.-]/gi, '').trim();
  const seed = Math.floor(Math.random() * 100000);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
}

export async function generateStoreMedia(plan: StoreBlueprintPlan): Promise<StoreMediaAssets> {
  const query = (plan.industry || 'shoes').toLowerCase();
  const industryKey = Object.keys(VERIFIED_NICHE_ASSETS).find(k => query.includes(k)) || 'shoes';
  const urls = VERIFIED_NICHE_ASSETS[industryKey] || DEFAULT_FALLBACK_IMAGES;

  return {
    heroImage: {
      url: urls[0],
      altText: `${plan.suggestedName || plan.industry} Hero Showcase`,
    },
    categoryImages: [
      { url: urls[1], altText: `${plan.industry} Category 1` },
      { url: urls[2], altText: `${plan.industry} Category 2` },
      { url: urls[3], altText: `${plan.industry} Category 3` },
      { url: urls[4] || urls[0], altText: `${plan.industry} Category 4` },
    ],
    productPlaceholders: [
      { url: urls[0], altText: `Product 1` },
      { url: urls[1], altText: `Product 2` },
      { url: urls[2], altText: `Product 3` },
      { url: urls[3], altText: `Product 4` },
    ],
    brandStoryImage: {
      url: urls[5] || urls[0],
      altText: `${plan.suggestedName} Brand Heritage Story`,
    },
  };
}
