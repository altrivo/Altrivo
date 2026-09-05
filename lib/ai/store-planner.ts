import { buildPlannerPrompt } from './prompts/store-planner-prompt';

export interface StoreBlueprintPlan {
  industry: string;
  storeType: string;
  style: 'luxury' | 'minimal' | 'bold' | 'modern' | 'editorial' | 'dark';
  market: string;
  targetAudience: string;
  language: string;
  currency: string;
  suggestedName: string;
  suggestedTagline: string;
  recommendedTemplateId: string;
  colorPalette: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
  recommendedSections: {
    hero: string;
    productGrid: string;
    categoryCarousel: string;
    testimonials: string;
    newsletter: string;
    brandStory: string;
  };
  pageStructure: string[];
  seoKeywords: string[];
}

export async function planStore(userPrompt: string): Promise<{ plan: StoreBlueprintPlan; tokensUsed: number; costUsd: number }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const prompt = buildPlannerPrompt(userPrompt);

  const fallbackPlan: StoreBlueprintPlan = generateFallbackPlan(userPrompt);

  if (!apiKey) {
    console.warn("No Gemini API key found. Using fallback plan.");
    return { plan: fallbackPlan, tokensUsed: 0, costUsd: 0 };
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      throw new Error("Empty response from Gemini API");
    }

    const plan = JSON.parse(textContent) as StoreBlueprintPlan;
    
    // Calculate mock token usage and cost
    const tokensUsed = prompt.length + textContent.length;
    const costUsd = (tokensUsed / 1000) * 0.0001; // Approximate flash cost

    return { plan, tokensUsed, costUsd };
  } catch (error) {
    console.error("Failed to plan store via AI, falling back.", error);
    return { plan: fallbackPlan, tokensUsed: 0, costUsd: 0 };
  }
}

function generateFallbackPlan(userPrompt: string): StoreBlueprintPlan {
  const lp = userPrompt.toLowerCase();

  // Industry detection (English + Urdu/Hinglish keywords)
  interface IndustryMatch {
    keywords: string[];
    industry: string;
    templateId: string;
    style: StoreBlueprintPlan['style'];
    hero: string;
    productGrid: string;
    suggestedName: string;
    tagline: string;
    colors: { primary: string; accent: string; background: string; text: string };
  }

  const industries: IndustryMatch[] = [
    {
      keywords: ['watch', 'watches', 'ghari', 'ghadi', 'timepiece', 'chronograph', 'horology', 'rolex', 'wrist watch'],
      industry: 'watches', templateId: 'minimal-luxe', style: 'luxury',
      hero: 'HeroCenteredOverlay', productGrid: 'ProductGridFeatured',
      suggestedName: 'ChronoCraft Luxury', tagline: 'Precision luxury timepieces and bespoke chronographs',
      colors: { primary: '#0A0A0A', accent: '#D4AF37', background: '#050505', text: '#F8FAFC' },
    },
    {
      keywords: ['perfume', 'fragrance', 'attar', 'itr', 'khushboo', 'cologne', 'scent', 'oud'],
      industry: 'perfumes', templateId: 'minimal-luxe', style: 'luxury',
      hero: 'HeroSplitImage', productGrid: 'ProductGridFeatured',
      suggestedName: 'Aura Royal Parfums', tagline: 'Artisanal French & Oriental fragrances crafted with rare essences',
      colors: { primary: '#18181B', accent: '#EAB308', background: '#09090B', text: '#FAFAFA' },
    },
    {
      keywords: ['shoe', 'joota', 'chappal', 'sneaker', 'footwear', 'joggers', 'leather shoes', 'boots', 'sandals'],
      industry: 'shoes', templateId: 'minimal-luxe', style: 'luxury',
      hero: 'HeroSplitImage', productGrid: 'ProductGridFeatured',
      suggestedName: 'StepCraft Premium', tagline: 'Handcrafted luxury footwear made by master artisans',
      colors: { primary: '#171717', accent: '#D4AF37', background: '#FFFFFF', text: '#0A0A0A' },
    },
    {
      keywords: ['fashion', 'cloth', 'kapra', 'dress', 'apparel', 'wear', 'garment', 'boutique', 'lawn', 'kurta', 'shalwar', 'suit'],
      industry: 'fashion', templateId: 'bold-vogue', style: 'editorial',
      hero: 'HeroCenteredOverlay', productGrid: 'ProductGridStaggered',
      suggestedName: 'Vogue Studio', tagline: 'Curated fashion and pret for the modern wardrobe',
      colors: { primary: '#E11D48', accent: '#FDE047', background: '#FFF7F2', text: '#4C0519' },
    },
    {
      keywords: ['tech', 'gadget', 'electronic', 'mobile', 'phone', 'laptop', 'computer', 'gaming', 'audio', 'earbuds', 'headphone'],
      industry: 'electronics', templateId: 'cyber-neon', style: 'dark',
      hero: 'HeroDepthStack', productGrid: 'ProductGridFeatured',
      suggestedName: 'NeonTech Hub', tagline: 'Cutting-edge tech, gaming gear & smart gadgets',
      colors: { primary: '#38BDF8', accent: '#C084FC', background: '#0B0713', text: '#F4F0FF' },
    },
    {
      keywords: ['beauty', 'skin', 'cosmetic', 'makeup', 'cream', 'serum', 'skincare', 'husn', 'organic'],
      industry: 'beauty', templateId: 'botanical-fresh', style: 'minimal',
      hero: 'HeroBento', productGrid: 'ProductGridFeatured',
      suggestedName: 'Bloom Beauty', tagline: 'Clean botanical skincare & organic beauty',
      colors: { primary: '#047857', accent: '#A7F3D0', background: '#F6FBF7', text: '#06342A' },
    },
    {
      keywords: ['jewelry', 'jewel', 'zewar', 'gold', 'ring', 'necklace', 'bracelet', 'silver', 'diamond'],
      industry: 'jewelry', templateId: 'minimal-luxe', style: 'luxury',
      hero: 'HeroCenteredOverlay', productGrid: 'ProductGridFeatured',
      suggestedName: 'Luxe Jewels', tagline: 'Timeless elegance, handcrafted 18K gold & silver perfection',
      colors: { primary: '#171717', accent: '#D4AF37', background: '#FFFFFF', text: '#0A0A0A' },
    },
    {
      keywords: ['home', 'furniture', 'decor', 'ghar', 'sofa', 'curtain', 'interior', 'living'],
      industry: 'home', templateId: 'nordic-crisp', style: 'minimal',
      hero: 'HeroSplitImage', productGrid: 'ProductGridFeatured',
      suggestedName: 'NordHome', tagline: 'Minimalist living and artisan home decor',
      colors: { primary: '#2563EB', accent: '#BFDBFE', background: '#FFFFFF', text: '#0F172A' },
    },
    {
      keywords: ['food', 'khana', 'restaurant', 'biryani', 'sweet', 'mithai', 'bakery', 'cake', 'grocery'],
      industry: 'food', templateId: 'artisan-earth', style: 'modern',
      hero: 'HeroSplitImage', productGrid: 'ProductGridFeatured',
      suggestedName: 'Desi Flavors', tagline: 'Authentic flavors delivered to your door',
      colors: { primary: '#874759', accent: '#C97B5A', background: '#FDF8F4', text: '#44232E' },
    },
    {
      keywords: ['craft', 'handmade', 'art', 'pottery', 'dastkar', 'handicraft'],
      industry: 'crafts', templateId: 'artisan-earth', style: 'modern',
      hero: 'HeroBrokenGrid', productGrid: 'ProductGridStaggered',
      suggestedName: 'Artisan Collective', tagline: 'Handmade with love, crafted with care',
      colors: { primary: '#874759', accent: '#C97B5A', background: '#FDF8F4', text: '#44232E' },
    },
    {
      keywords: ['sport', 'fitness', 'gym', 'workout', 'athletic', 'activewear'],
      industry: 'sports', templateId: 'bold-vogue', style: 'bold',
      hero: 'HeroMarquee', productGrid: 'ProductGridFeatured',
      suggestedName: 'Peak Performance', tagline: 'High performance activewear & fitness gear',
      colors: { primary: '#DC2626', accent: '#111827', background: '#030712', text: '#F9FAFB' },
    },
  ];

  // Find best match
  const match = industries.find((i) => i.keywords.some((kw) => lp.includes(kw))) || industries[0];

  // Detect if Pakistan market (Urdu keywords or explicit mention)
  const isPakistan = /pakistan|lahore|karachi|islamabad|multan|peshawar|rawalpindi|mujhe|banao|chahiye|store.?bana|ka store/i.test(userPrompt);

  // Try to extract a store name from the prompt
  const nameMatch = userPrompt.match(/(?:store|shop|dukan|brand)\s+(?:named?|called?|naam)\s+["']?([^"'\n,.]+)/i) ||
    userPrompt.match(/["']([^"']+)["']\s+(?:store|shop|brand)/i);

  return {
    industry: match.industry,
    storeType: 'retail',
    style: match.style,
    market: isPakistan ? 'Pakistan' : 'global',
    targetAudience: `${match.industry} consumers`,
    language: isPakistan ? 'ur-en' : 'en',
    currency: isPakistan ? 'PKR' : 'USD',
    suggestedName: nameMatch?.[1]?.trim() || match.suggestedName,
    suggestedTagline: match.tagline,
    recommendedTemplateId: match.templateId,
    colorPalette: match.colors,
    recommendedSections: {
      hero: match.hero,
      productGrid: match.productGrid,
      categoryCarousel: 'CategoryCarousel',
      testimonials: 'TestimonialSlider',
      newsletter: 'NewsletterSignup',
      brandStory: 'BrandStory',
    },
    pageStructure: ['home', 'shop', 'product', 'cart', 'checkout', 'contact'],
    seoKeywords: [match.industry, 'buy online', 'shop', isPakistan ? 'Pakistan' : 'worldwide', match.suggestedName.toLowerCase()],
  };
}
