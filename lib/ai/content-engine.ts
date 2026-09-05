import { buildGeneratorPrompt } from './prompts/store-planner-prompt';
import { StoreBlueprintPlan } from './store-planner';

export interface GeneratedStoreContent {
  heroHeadline: string;
  heroSubheadline: string;
  heroCta: string;
  heroSecondaryCta?: string;
  featureItems: Array<{ icon: string; title: string; description: string }>;
  categoryNames: Array<{ title: string; count: string; icon: string; href: string }>;
  testimonials: Array<{ name: string; text: string; rating: number; role: string }>;
  faqItems: Array<{ question: string; answer: string }>;
  newsletterHeadline: string;
  newsletterSubheadline: string;
  brandStoryTitle: string;
  brandStoryParagraphs: string[];
  seoTitle: string;
  seoDescription: string;
  announcementText: string;
}

export async function generateStoreContent(plan: StoreBlueprintPlan): Promise<{ content: GeneratedStoreContent; tokensUsed: number; costUsd: number }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const prompt = buildGeneratorPrompt(plan, {}); // We omit real theme tokens for simplicity here

  const fallbackContent: GeneratedStoreContent = generateFallbackContent(plan);

  if (!apiKey) {
    console.warn("No Gemini API key found. Using fallback content.");
    return { content: fallbackContent, tokensUsed: 0, costUsd: 0 };
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

    const content = JSON.parse(textContent) as GeneratedStoreContent;
    
    const tokensUsed = prompt.length + textContent.length;
    const costUsd = (tokensUsed / 1000) * 0.0001; 

    return { content, tokensUsed, costUsd };
  } catch (error) {
    console.error("Failed to generate content via AI, falling back.", error);
    return { content: fallbackContent, tokensUsed: 0, costUsd: 0 };
  }
}

function generateFallbackContent(plan: StoreBlueprintPlan): GeneratedStoreContent {
  const query = (plan.industry || plan.suggestedName || '').toLowerCase();
  
  if (query.includes('watch') || query.includes('ghari') || query.includes('timepiece') || query.includes('chronograph')) {
    return {
      heroHeadline: `Precision Engineering & Timeless Horology`,
      heroSubheadline: plan.suggestedTagline || 'Handcrafted luxury chronographs featuring Japanese automatic movements, sapphire crystal glass, and genuine Italian leather straps.',
      heroCta: 'Explore Timepieces',
      heroSecondaryCta: 'View Chronographs',
      featureItems: [
        { icon: 'shield-check', title: 'Sapphire Crystal Glass', description: 'Scratch-resistant anti-reflective coating' },
        { icon: 'award', title: 'Japanese Movement', description: 'Precision Miyota automatic caliber accuracy' },
        { icon: 'truck', title: 'Cash on Delivery', description: 'Tracked express courier dispatch nationwide' },
        { icon: 'rotate-ccw', title: '2-Year Warranty', description: 'Comprehensive movement and repair guarantee' }
      ],
      categoryNames: [
        { title: 'Automatic Chronographs', count: '18 models', icon: 'star', href: '#catalog' },
        { title: 'Classic Leather Dress', count: '24 models', icon: 'trending-up', href: '#catalog' },
        { title: '18K Gold Plated Editions', count: '12 models', icon: 'award', href: '#catalog' },
        { title: 'Sports & Diver 200M', count: '15 models', icon: 'tag', href: '#catalog' }
      ],
      testimonials: [
        { name: 'Dr. Daniyal Ahmed (Islamabad)', text: 'The bezel finish and sweep of the second hand is stunning. Looks like a 2-lakh watch!', rating: 5, role: 'Verified Buyer' },
        { name: 'Shahmeer Khan (Lahore)', text: 'Delivered in luxury velvet box with warranty card. Outstanding quality.', rating: 5, role: 'Verified Buyer' }
      ],
      faqItems: [
        { question: 'Is the watch water resistant?', answer: 'Yes, all our chronographs are water resistant up to 50M/100M with screw-down crowns.' },
        { question: 'Do you offer warranty in Pakistan?', answer: 'Every timepiece comes with a 2-Year Official Movement Warranty.' }
      ],
      newsletterHeadline: 'Join The Chrono VIP Collectors Club',
      newsletterSubheadline: 'Receive private invitations to limited batch drops and 10% OFF your first luxury timepiece.',
      brandStoryTitle: `The Art of Precision Horology`,
      brandStoryParagraphs: [
        'Each timepiece is individually assembled and tested for 72 hours in dust-free horological chambers.',
        'We blend surgical-grade 316L stainless steel with sapphire crystal to build watches meant to be passed down generations.'
      ],
      seoTitle: `${plan.suggestedName || 'ChronoCraft'} | Luxury Watches & Chronographs`,
      seoDescription: plan.suggestedTagline || 'Discover precision handcrafted luxury watches and chronographs in Pakistan.',
      announcementText: '🎉 Official Drop: Free Nationwide Insured Delivery on all Luxury Timepieces!'
    };
  }

  if (query.includes('perfume') || query.includes('fragrance') || query.includes('attar') || query.includes('scent') || query.includes('oud')) {
    return {
      heroHeadline: `The Royal Essence of Pure Luxury`,
      heroSubheadline: plan.suggestedTagline || 'Artisanal French and Oriental extrait de parfum crafted with rare Cambodian oud, ambergris, and Taif rose.',
      heroCta: 'Shop Fragrances',
      heroSecondaryCta: 'Discovery Set',
      featureItems: [
        { icon: 'award', title: 'Extrait De Parfum (35%)', description: 'Ultra long-lasting 24-hour projection' },
        { icon: 'shield-check', title: 'Pure Natural Oils', description: 'Zero synthetic irritants or dilution' },
        { icon: 'truck', title: 'Cash on Delivery', description: 'Nationwide express dispatch across Pakistan' },
        { icon: 'rotate-ccw', title: 'Free Sample Vial', description: 'Test the scent before opening main bottle' }
      ],
      categoryNames: [
        { title: 'Royal Oud & Amber', count: '14 Scents', icon: 'star', href: '#catalog' },
        { title: 'French Extrait de Parfum', count: '20 Scents', icon: 'trending-up', href: '#catalog' },
        { title: 'Fresh Citrus & Aquatic', count: '16 Scents', icon: 'tag', href: '#catalog' },
        { title: 'Concentrated Pure Attar', count: '10 Scents', icon: 'award', href: '#catalog' }
      ],
      testimonials: [
        { name: 'Usman Ghani (Karachi)', text: 'The Royal Oud stayed on my suit for over 2 days. Compliments non-stop!', rating: 5, role: 'Verified Buyer' },
        { name: 'Ayesha Malik (Lahore)', text: 'Packaging is royal and the French Rose scent is hypnotic.', rating: 5, role: 'Verified Buyer' }
      ],
      faqItems: [
        { question: 'How long does the fragrance last?', answer: 'Our Extrait de Parfum concentration (35% oil) lasts 18-24+ hours on fabric.' },
        { question: 'Can I test before keeping?', answer: 'Yes, every bottle includes a matching free 2ml sample tester.' }
      ],
      newsletterHeadline: 'Enter The Perfumer’s Sanctuary',
      newsletterSubheadline: 'Unlock private scent releases and enjoy flat 10% OFF your first signature fragrance.',
      brandStoryTitle: `Mastery in Every Drop`,
      brandStoryParagraphs: [
        'Our master perfumers source natural raw botanicals, aged sandalwood, and rare distillations from Grasse and Dubai.',
        'Matured in dark temperature-regulated cellars for 6 months before bottling to ensure depth and projection.'
      ],
      seoTitle: `${plan.suggestedName || 'Aura Parfums'} | Luxury Fragrances & Pure Attar`,
      seoDescription: plan.suggestedTagline || 'Exquisite long-lasting luxury fragrances and pure oud in Pakistan.',
      announcementText: '✨ Complimentary 2ml Tester Included with Every Order! Free Express Delivery over ₨ 4,000.'
    };
  }

  if (query.includes('shoe') || query.includes('footwear') || query.includes('leather')) {
    return {
      heroHeadline: `Walk With Royal Distinction`,
      heroSubheadline: plan.suggestedTagline || '100% pure full-grain calfskin leather shoes handcrafted by master Pakistani artisans with ergonomic comfort.',
      heroCta: 'Shop Collection',
      heroSecondaryCta: 'Explore Heritage',
      featureItems: [
        { icon: 'truck', title: 'Cash on Delivery', description: 'Nationwide COD express delivery across Pakistan' },
        { icon: 'shield-check', title: '100% Escrow Protection', description: 'Complete buyer safety on every order' },
        { icon: 'rotate-ccw', title: '7-Day Easy Exchange', description: 'Hassle-free size replacement' },
        { icon: 'award', title: 'Pure Full-Grain Leather', description: 'Hand-inspected natural leather' }
      ],
      categoryNames: [
        { title: 'Oxford & Formals', count: '24 items', icon: 'star', href: '#catalog' },
        { title: 'Casual Loafers', count: '18 items', icon: 'trending-up', href: '#catalog' },
        { title: 'Sneakers & Street', count: '32 items', icon: 'tag', href: '#catalog' },
        { title: 'Peshawari Chappal', count: '12 items', icon: 'award', href: '#catalog' }
      ],
      testimonials: [
        { name: 'Hamza Tariq (Lahore)', text: 'Ordered the Black Oxford for my brother\'s wedding. Leather quality is unmatched!', rating: 5, role: 'Verified Buyer' },
        { name: 'Dr. Bilal Khan (Islamabad)', text: 'COD was delivered in 2 days. Arch support is so comfortable.', rating: 5, role: 'Verified Buyer' }
      ],
      faqItems: [
        { question: 'Do you offer Cash on Delivery across Pakistan?', answer: 'Yes, we deliver nationwide with Cash on Delivery via TCS and Leopard Courier.' },
        { question: 'What if the shoe size does not fit?', answer: 'We offer a 7-day free size exchange.' }
      ],
      newsletterHeadline: 'Join The StepCraft Inner Circle',
      newsletterSubheadline: 'Get exclusive access to private shoe drops and enjoy instant 10% OFF your first order.',
      brandStoryTitle: `The Legacy of Master Cobblers`,
      brandStoryParagraphs: [
        'Every pair of shoes begins with hand-selected hides of top-tier full-grain leather. Our craftsmen spend over 36 hours stitching and shaping each silhouette.',
        'We reject synthetic shortcuts. Every detail is engineered to ensure timeless luxury and all-day comfort.'
      ],
      seoTitle: `${plan.suggestedName || 'StepCraft'} | Handcrafted Luxury Footwear`,
      seoDescription: plan.suggestedTagline || 'Discover Pakistan\'s finest handmade leather footwear.',
      announcementText: '🎉 Free Express Delivery on orders over ₨ 5,000 across Pakistan! Use code "ROYAL10" for 10% OFF.'
    };
  }

  if (query.includes('shirt') || query.includes('cloth') || query.includes('fashion') || query.includes('apparel')) {
    return {
      heroHeadline: `Bespoke Elegance & Modern Tailoring`,
      heroSubheadline: plan.suggestedTagline || 'Premium Egyptian cotton shirts and bespoke tailored menswear crafted for distinction.',
      heroCta: 'Explore Apparel',
      heroSecondaryCta: 'View Lookbook',
      featureItems: [
        { icon: 'truck', title: 'Cash on Delivery', description: 'Nationwide COD delivery across Pakistan' },
        { icon: 'shield-check', title: '100% Escrow Protection', description: 'Guaranteed buyer satisfaction' },
        { icon: 'rotate-ccw', title: '7-Day Easy Exchange', description: 'Zero hassle size exchange' },
        { icon: 'award', title: 'Egyptian Giza Cotton', description: 'Breathable, wrinkle-resistant luxury' }
      ],
      categoryNames: [
        { title: 'Formal Oxford Shirts', count: '28 items', icon: 'star', href: '#catalog' },
        { title: 'Linen Casual Wear', count: '19 items', icon: 'trending-up', href: '#catalog' },
        { title: 'Streetwear & Hoodies', count: '35 items', icon: 'tag', href: '#catalog' },
        { title: 'Traditional Kurtas', count: '14 items', icon: 'award', href: '#catalog' }
      ],
      testimonials: [
        { name: 'Ali Raza (Karachi)', text: 'The fabric quality and fit of the white oxford is impeccable!', rating: 5, role: 'Verified Buyer' },
        { name: 'Omer Farooq (Rawalpindi)', text: 'Super fast delivery in 2 days. Highly recommended!', rating: 5, role: 'Verified Buyer' }
      ],
      faqItems: [
        { question: 'What fabrics do you use?', answer: 'We use 100% pure Egyptian Giza cotton and lightweight European linen.' },
        { question: 'Do you offer COD?', answer: 'Yes, Cash on Delivery is available across Pakistan.' }
      ],
      newsletterHeadline: 'Join The VIP Style Circle',
      newsletterSubheadline: 'Get 10% OFF your first order and early access to limited capsule drops.',
      brandStoryTitle: `The Art of Modern Tailoring`,
      brandStoryParagraphs: [
        'We believe that modern fashion should blend heritage craftsmanship with contemporary silhouettes.',
        'Each shirt is precision-tailored to provide effortless comfort from morning meetings to evening soirees.'
      ],
      seoTitle: `${plan.suggestedName || 'Artisan Apparel'} | Premium Menswear`,
      seoDescription: plan.suggestedTagline || 'Bespoke menswear and luxury apparel in Pakistan.',
      announcementText: '🎉 Summer Drop Live! Get Flat 15% OFF on all shirts with code "SUMMER15".'
    };
  }

  // Default Universal Fallback
  return {
    heroHeadline: `Handcrafted Luxury & Curated Excellence`,
    heroSubheadline: plan.suggestedTagline || 'Discover authentic artisanal creations curated for luxury living.',
    heroCta: 'Shop Collection',
    heroSecondaryCta: 'Learn More',
    featureItems: [
      { icon: 'truck', title: 'Cash on Delivery', description: 'Nationwide express COD across Pakistan' },
      { icon: 'shield-check', title: 'Escrow Protection', description: '100% buyer security guarantee' },
      { icon: 'rotate-ccw', title: 'Easy Returns & Exchange', description: '7-day hassle-free replacement' },
      { icon: 'award', title: 'Authentic Quality', description: 'Directly sourced from master craftsmen' }
    ],
    categoryNames: [
      { title: 'Featured Drop', count: '24 items', icon: 'star', href: '#catalog' },
      { title: 'Trending Bestsellers', count: '18 items', icon: 'trending-up', href: '#catalog' },
      { title: 'Limited Editions', count: '12 items', icon: 'tag', href: '#catalog' },
      { title: 'Heritage Collection', count: '16 items', icon: 'award', href: '#catalog' }
    ],
    testimonials: [
      { name: 'Zainab M. (Lahore)', text: 'Flawless product quality and packaging!', rating: 5, role: 'Verified Buyer' },
      { name: 'Kashif A. (Karachi)', text: 'Fast COD delivery and authentic items.', rating: 5, role: 'Verified Buyer' }
    ],
    faqItems: [
      { question: 'What payment methods do you support?', answer: 'We accept Cash on Delivery, Bank Transfer, and Escrow protected cards.' },
      { question: 'How long does delivery take?', answer: 'Orders are delivered in 2-4 business days.' }
    ],
    newsletterHeadline: 'Join The VIP Club',
    newsletterSubheadline: 'Get 10% off your first order and exclusive drops alert.',
    brandStoryTitle: `Our Artisan Heritage`,
    brandStoryParagraphs: [
      'We started with a passion for uncompromised craftsmanship and ethical creation.',
      'Every product in our collection is hand-inspected to guarantee timeless beauty and durability.'
    ],
    seoTitle: `${plan.suggestedName || 'Our Store'} | Artisan Store`,
    seoDescription: plan.suggestedTagline || 'Shop curated artisanal creations.',
    announcementText: '🎉 Free Express Delivery on orders over ₨ 5,000 across Pakistan!'
  };
}
