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
  return `You are an expert copywriter and content generator for e-commerce stores.
Using the provided store blueprint and theme tokens, generate compelling, high-converting content for each section of the store.

STORE BLUEPRINT:
${JSON.stringify(blueprint, null, 2)}

THEME TOKENS:
${JSON.stringify(templateTokens, null, 2)}

Generate a JSON object with the following structure:
- heroHeadline: Catchy main title.
- heroSubheadline: Engaging subtitle.
- heroCta: Primary call to action text.
- heroSecondaryCta: (Optional) Secondary call to action text.
- featureItems: Array of 3-4 objects { icon, title, description }.
- categoryNames: Array of 3-6 objects { title, count, icon, href }.
- testimonials: Array of 3-4 objects { name, text, rating (1-5), role }.
- faqItems: Array of 4-6 objects { question, answer }.
- newsletterHeadline: Title for newsletter section.
- newsletterSubheadline: Subtitle for newsletter.
- brandStoryTitle: Main title for brand story.
- brandStoryParagraphs: Array of 2-3 paragraph strings.
- seoTitle: Store SEO title.
- seoDescription: Store SEO meta description.
- announcementText: Text for the top announcement bar.

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
