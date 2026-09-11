export function buildPlannerPrompt(userPrompt: string): string {
  return `You are an expert AI e-commerce store architect. Your task is to analyze the user's request and output a structured store blueprint.

USER REQUEST:
"${userPrompt}"

Extract and recommend the following in a strictly typed JSON object:
- industry: The industry or niche (e.g., fashion, electronics).
- storeType: E-commerce model (e.g., retail, wholesale, dropshipping, D2C).
- style: Must be one of ['luxury', 'minimal', 'bold', 'modern', 'editorial', 'dark'].
- market: Target market geography (e.g., global, US, Europe).
- targetAudience: Description of the main customer base.
- language: Primary language for the store (e.g., en, es).
- currency: Primary currency (e.g., USD, EUR).
- suggestedName: A catchy store name if not explicitly provided.
- suggestedTagline: A short, engaging tagline.
- recommendedTemplateId: Must be one of ['minimal-luxe', 'artisan-earth', 'cyber-neon', 'botanical-fresh', 'bold-vogue', 'nordic-crisp'].
- colorPalette: Hex codes for { primary, accent, background, text }.
- recommendedSections: An object mapping page roles to section types from our registry.
  - hero: e.g. 'HeroSplitImage', 'HeroCenteredOverlay', etc.
  - productGrid: e.g. 'ProductGridFeatured', etc.
  - categoryCarousel: e.g. 'CategoryCarousel', etc.
  - testimonials: e.g. 'TestimonialSlider', etc.
  - newsletter: e.g. 'NewsletterSignup', etc.
  - brandStory: e.g. 'BrandStory', etc.
- pageStructure: Array of page routes, e.g., ['home', 'shop', 'product', 'contact'].
- seoKeywords: Array of 5-10 SEO keywords.

Return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.`;
}

export function buildGeneratorPrompt(blueprint: any, templateTokens: any): string {
  const userVision = blueprint.userPrompt || blueprint.suggestedTagline || blueprint.suggestedName || "curated e-commerce storefront";
  return `You are an expert copywriter and content generator for e-commerce stores on the Altrivo platform.
Using the provided store blueprint and theme tokens, generate compelling, high-converting content for each section of the store.

VENDOR'S EXACT STORE VISION / PROMPT:
"${userVision}"

STORE BLUEPRINT:
${JSON.stringify(blueprint, null, 2)}

THEME TOKENS:
${JSON.stringify(templateTokens, null, 2)}

CRITICAL INSTRUCTIONS:
- Tailor all copywriting (headlines, subheadlines, category titles, brand story paragraphs, testimonials, and announcements) directly and specifically to the vendor's store vision prompt above.
- Categories should be 4 realistic sub-collections specific to this niche (e.g. if watches: Automatic Chronographs, Minimalist Dress Watches, Diver Series, 18K Gold Editions).
- Testimonials should be authentic Pakistani buyer feedback (mentioning cities like Lahore, Karachi, Islamabad) praising genuine craftsmanship and fast Cash on Delivery.
- Feature items must highlight buyer trust: Cash on Delivery nationwide, Escrow buyer protection, 7-day easy exchange, and 100% authentic quality.

Generate a JSON object with the following structure:
- heroHeadline: Catchy main title tailored to the brand.
- heroSubheadline: Engaging subtitle explaining the craftsmanship and unique value.
- heroCta: Primary call to action text (e.g. "Shop Collection", "Explore Timepieces", "Order Now").
- heroSecondaryCta: (Optional) Secondary call to action text (e.g. "View Catalog", "Brand Heritage").
- featureItems: Array of 4 objects { icon: "truck"|"shield-check"|"rotate-ccw"|"award", title: string, description: string }.
- categoryNames: Array of 4 objects { title: string, count: string, icon: string, href: string }.
- testimonials: Array of 2-3 objects { name: string, text: string, rating: 5, role: "Verified Buyer" }.
- faqItems: Array of 3-4 objects { question: string, answer: string }.
- newsletterHeadline: Title for VIP newsletter section.
- newsletterSubheadline: Subtitle for newsletter (e.g. with discount incentive like 10% OFF).
- brandStoryTitle: Main title for brand heritage and story.
- brandStoryParagraphs: Array of 2 rich storytelling paragraphs.
- seoTitle: Store SEO title.
- seoDescription: Store SEO meta description.
- announcementText: Text for the top announcement bar with discount / delivery guarantee.

Return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.`;
}

export function buildPatchPrompt(currentLayout: any, userInstruction: string, registryTypes: string[]): string {
  return `You are an expert UI developer. You need to apply a modification to an existing JSON layout configuration based on a user's instruction.

CURRENT LAYOUT CONFIG:
${JSON.stringify(currentLayout, null, 2)}

USER INSTRUCTION:
"${userInstruction}"

ALLOWED SECTION TYPES:
${JSON.stringify(registryTypes)}

Output a valid JSON patch object. Or, output a new layout configuration that incorporates the changes. 
Return ONLY a valid JSON object representing the entirely updated layout config. Do not include markdown formatting like \`\`\`json.`;
}
