import { NextResponse } from "next/server";
import { getStoreById, updateLayoutConfig } from "@/lib/store/store-service";

interface RequestBody {
  storeId?: string;
  storeSlug?: string;
  storeName?: string;
  currentLayout: any;
  userInstruction: string;
  activeSectionId?: string;
  targetTag?: string;
  activeNiche?: string;
}

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
];

async function callGemini(prompt: string, apiKey: string): Promise<any | null> {
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(3500),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3,
            },
          }),
        }
      );

      console.log(`[Gemini calling ${model}] status:`, res.status);
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          try {
            return JSON.parse(text.trim());
          } catch (jsonErr) {
            console.warn(`[Gemini JSON Parse Error on ${model}]:`, jsonErr);
          }
        }
      } else {
        const errText = await res.text();
        console.warn(`[Gemini API ${model} Error]: ${res.status}`, errText.substring(0, 150));
        if (res.status === 503 || res.status === 429) {
          // Service is overloaded, break immediately to fallback
          break;
        }
      }
    } catch (err) {
      console.warn(`[Gemini Fetch Exception on ${model}]:`, err);
    }
  }
  return null;
}

// Color palette dictionary for multilingual color mapping (English + Roman Urdu)
const COLOR_MAP: Record<string, { hex: string; bgTheme: string; name: string }> = {
  white: { hex: "#FFFFFF", bgTheme: "white", name: "White (Safaid)" },
  safaid: { hex: "#FFFFFF", bgTheme: "white", name: "Safaid (White)" },
  chitta: { hex: "#FFFFFF", bgTheme: "white", name: "Safaid (White)" },
  light: { hex: "#F8FAFC", bgTheme: "light", name: "Light Soft Gray" },
  black: { hex: "#090D16", bgTheme: "black", name: "Sleek Black (Kala)" },
  kala: { hex: "#090D16", bgTheme: "black", name: "Kala (Sleek Black)" },
  dark: { hex: "#0F172A", bgTheme: "black", name: "Dark Navy" },
  slate: { hex: "#1E293B", bgTheme: "slate", name: "Modern Slate" },
  gold: { hex: "#D4AF37", bgTheme: "gold", name: "Royal Gold (Sunhara)" },
  sunhara: { hex: "#D4AF37", bgTheme: "gold", name: "Sunhara (Royal Gold)" },
  golden: { hex: "#D4AF37", bgTheme: "gold", name: "Royal Gold" },
  purple: { hex: "#694873", bgTheme: "glass", name: "Royal Purple" },
  jamni: { hex: "#694873", bgTheme: "glass", name: "Royal Jamni (Purple)" },
  violet: { hex: "#7C3AED", bgTheme: "glass", name: "Deep Violet" },
  emerald: { hex: "#10B981", bgTheme: "glass", name: "Emerald Green" },
  green: { hex: "#10B981", bgTheme: "glass", name: "Sabz (Green)" },
  sabz: { hex: "#10B981", bgTheme: "glass", name: "Sabz (Emerald Green)" },
  blue: { hex: "#2563EB", bgTheme: "slate", name: "Ocean Blue" },
  neela: { hex: "#2563EB", bgTheme: "slate", name: "Neela (Ocean Blue)" },
  red: { hex: "#DC2626", bgTheme: "glass", name: "Crimson Red" },
  surkh: { hex: "#DC2626", bgTheme: "glass", name: "Surkh (Red)" },
  lal: { hex: "#DC2626", bgTheme: "glass", name: "Lal (Red)" },
};

// High-converting luxury copywriting templates by niche
interface NicheCopyTemplate {
  title: string;
  subtitle: string;
  ctaText?: string;
  image?: string;
}

const NICHE_TEMPLATES: Record<string, NicheCopyTemplate> = {
  shoes: {
    title: "Handcrafted Distinction & Timeless Luxury",
    subtitle: "Discover bespoke footwear meticulously handcrafted from 100% full-grain leather, engineered for enduring comfort and effortless prestige.",
    ctaText: "Shop Collection",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
  },
  cosmetics: {
    title: "Pure Radiance & Botanical Luxury",
    subtitle: "Dermatologically formulated essentials designed to nourish, illuminate, and celebrate your natural skin glow.",
    ctaText: "Explore Beauty",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
  },
  jewelry: {
    title: "Timeless Allure & Master Craftsmanship",
    subtitle: "Exquisite handcrafted jewels and bespoke heirlooms set in 18K gold and radiant stones designed to captivate for generations.",
    ctaText: "View Heirlooms",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80",
  },
  clothing: {
    title: "Contemporary Elegance & Tailored Perfection",
    subtitle: "Explore bespoke silhouettes and luxury menswear masterfully tailored from premium Egyptian cotton and rich woven fabrics.",
    ctaText: "Explore Wardrobe",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
  },
  watches: {
    title: "Precision Engineering & Timeless Prestige",
    subtitle: "High-precision automatic chronographs and artisanal timepieces engineered with sapphire crystal for the modern connoisseur.",
    ctaText: "Discover Timepieces",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80",
  },
  perfume: {
    title: "Sensory Masterpieces & Unforgettable Sillage",
    subtitle: "Rare botanicals, pure oud, and French essences harmoniously blended for an unforgettable signature presence.",
    ctaText: "Experience Fragrances",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80",
  },
  general: {
    title: "Signature Luxury & Bespoke Distinction",
    subtitle: "Experience master craftsmanship, handpicked materials, and exclusive designs curated to elevate your lifestyle.",
    ctaText: "Explore Now",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
  },
};

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { storeId, storeSlug, storeName, currentLayout, userInstruction, activeSectionId, targetTag, activeNiche } = body;

    if (!userInstruction || !userInstruction.trim()) {
      return NextResponse.json({ error: "userInstruction is required" }, { status: 400 });
    }

    if (!currentLayout || typeof currentLayout !== "object") {
      return NextResponse.json({ error: "currentLayout is required" }, { status: 400 });
    }

    const effectiveStoreName = storeName || currentLayout.storeName || "My Store";
    const detectedStoreNiche = (activeNiche || currentLayout.niche || "shoes").toLowerCase();

    let apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const envPath = path.join(process.cwd(), ".env.local");
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, "utf8");
          for (const line of content.split("\n")) {
            if (line.startsWith("GEMINI_API_KEY=")) apiKey = line.split("=")[1].trim().replace(/['"]/g, "");
            if (!apiKey && line.startsWith("GOOGLE_API_KEY=")) apiKey = line.split("=")[1].trim().replace(/['"]/g, "");
          }
        }
      } catch {}
    }

    let aiResponse: any = null;

    if (apiKey) {
      const systemPrompt = `You are an expert, world-class e-commerce store designer, copywriter, and UI/UX engineer for the Altrivo e-commerce platform.
The vendor is editing their live store: "${effectiveStoreName}" (Industry/Niche: "${detectedStoreNiche}").

CURRENT STORE LAYOUT CONFIG (JSON):
${JSON.stringify(currentLayout, null, 2)}

ACTIVE CANVAS CONTEXT:
- Active Section ID (Currently selected on canvas): "${activeSectionId || "none"}"
- Explicit Section Tag from User: "${targetTag || "none"}"

VENDOR'S INSTRUCTION (Can be Roman Urdu, Urdu, or English):
"${userInstruction.trim()}"

STRICT RULES & PRECISION HANDLING:
1. TARGETED SECTIONS VIA TAGS (@hero, @navbar, @theme, @products, @banner, @story, @reviews, @active):
   - If user tags "@hero" or refers to hero: Target the Hero / CustomComponent section.
   - If user tags "@navbar" or refers to navbar/header: Target the header configuration.
   - If user tags "@theme": Target theme.colors (primary, secondary, background, text) or theme.typography.
   - If user tags "@banner": Add or modify the top PromoBanner section.
   - If user tags "@products": Modify product catalog layout / column limits.
   - If user tags "@active" or "is section ka": Target the section with id "${activeSectionId}".

2. INTELLIGENT COPYWRITING & TEXT REWRITES:
   - When the user asks to change, rewrite, or update text/content/copy/heading/para/title/description (e.g. "@hero text ko change kry", "text badlo", "hero ka text likho", "cosmetic type text likhy", "jewelry tone"):
     - YOU ARE AN EXPERT COPYWRITER. Generate a stunning, high-converting, boutique Headline (props.title) and persuasive Subheadline (props.subtitle) matching the store name, niche, and user tone.
     - DO NOT leave generic placeholder text like "Make A Hero Section With Text".
     - Craft elegant, bespoke copy tailored to the vendor's brand.

3. PRECISE PROPERTY MODIFICATION — DO NOT CONFUSE COLOR WITH TITLE:
   - BACKGROUND / COLOR CHANGES:
     - If the user asks to change background color (e.g. "background color change kr do white", "bg black kardo", "color emerald karo"):
       - Update the target section's "props.backgroundColor" (e.g. "#FFFFFF") and/or "props.bgTheme" ("white" | "slate" | "gold" | "black" | "light" | "glass").
       - Or if targeting store theme, update "theme.colors.background".
       - CRITICAL: NEVER overwrite or put instructions into "props.title" or "props.subtitle" when the user asked for a color or background change!

4. REQUIRED OUTPUT FORMAT:
   Return ONLY a valid JSON object with EXACTLY these three keys:
   - "reply": A warm, polite, and clear explanation in Roman Urdu (e.g. "Hero section ka text luxury footwear tone me rewrite kar diya gaya hai!").
   - "changesSummary": A short 1-line English summary (e.g. "Rewrote Hero Headline & Subtitle").
   - "updatedLayout": The complete updated layout JSON object.

DO NOT wrap your response in markdown code blocks like \`\`\`json. Output raw JSON ONLY.`;

      aiResponse = await callGemini(systemPrompt, apiKey);
    }

    // =========================================================================
    // SMART MULTI-PROPERTY & COPYWRITING ENGINE (Bulletproof Fallback Engine)
    // =========================================================================
    if (!aiResponse || !aiResponse.updatedLayout) {
      console.warn("[Editor Assistant] Running Smart Multi-Property & Copywriting Engine");
      const cloned = JSON.parse(JSON.stringify(currentLayout));
      const lower = userInstruction.toLowerCase();

      // 1. Detect Tag from input if not passed explicitly
      let tag = (targetTag || "").toLowerCase().replace("@", "");
      if (!tag) {
        const tagMatch = lower.match(/@(hero|navbar|header|theme|products|catalog|banner|story|about|reviews|footer|active)/);
        if (tagMatch) tag = tagMatch[1];
      }
      if (!tag) {
        if (lower.includes("navbar") || lower.includes("header") || lower.includes("menu")) tag = "navbar";
        else if (lower.includes("theme") || lower.includes("palette")) tag = "theme";
        else if (lower.includes("banner") || lower.includes("promo")) tag = "banner";
        else if (lower.includes("hero")) tag = "hero";
        else if (lower.includes("story") || lower.includes("about")) tag = "story";
        else if (lower.includes("review") || lower.includes("testimonial")) tag = "reviews";
        else if (lower.includes("product") || lower.includes("catalog")) tag = "products";
      }

      // Color parsing
      const isColorIntent = lower.includes("color") || lower.includes("colour") || lower.includes("background") || lower.includes("bg") || lower.includes("rang") || lower.includes("safaid") || lower.includes("kala");
      let matchedColor: { hex: string; bgTheme: string; name: string } | null = null;
      for (const [key, val] of Object.entries(COLOR_MAP)) {
        const regex = new RegExp(`\\b${key}\\b`, "i");
        if (regex.test(lower)) {
          matchedColor = val;
          break;
        }
      }
      const hexMatch = lower.match(/#([0-9a-f]{3}|[0-9a-f]{6})\b/i);
      if (hexMatch) {
        const hex = hexMatch[0].toUpperCase();
        matchedColor = { hex, bgTheme: hex === "#FFFFFF" || hex === "#FFF" ? "white" : "slate", name: hex };
      }

      let reply = "Aapki request ke mutabiq store update kar diya gaya hai!";
      let summary = "Updated store layout";

      // =======================================================================
      // SCOPE 1: NAVBAR / HEADER COMMANDS (Strictly Isolated)
      // =======================================================================
      if (tag === "navbar" || lower.includes("navbar") || (!tag && (lower.includes("header") || lower.includes("nav link")))) {
        cloned.header = cloned.header || {};

        let targetColor = matchedColor ? matchedColor.hex : "#D4AF37";
        let targetColorName = matchedColor ? matchedColor.name : "Royal Gold (#D4AF37)";

        if (!matchedColor) {
          const currentHover = cloned.header?.hoverColor || cloned.theme?.colors?.primary;
          if (currentHover === "#D4AF37") {
            targetColor = "#38BDF8";
            targetColorName = "Sky Blue (#38BDF8)";
          } else {
            targetColor = "#D4AF37";
            targetColorName = "Royal Gold (#D4AF37)";
          }
        }

        if (lower.includes("hover") || lower.includes("link") || lower.includes("underline") || lower.includes("active")) {
          cloned.header.hoverColor = targetColor;
          cloned.header.activeIndicatorColor = targetColor;
          cloned.theme = cloned.theme || {};
          cloned.theme.colors = cloned.theme.colors || {};
          cloned.theme.colors.secondary = targetColor;

          reply = `Navbar menu links ka hover aur active indicator color ${targetColorName} kar diya gaya hai! Navigation bar par hover ab ${targetColorName} me highlight hoga.`;
          summary = `Updated Navbar Hover Color to ${targetColorName}`;
        } else if (isColorIntent && matchedColor) {
          cloned.header.backgroundColor = matchedColor.hex;
          reply = `Navbar header ka background color ${matchedColor.name} kar diya gaya hai!`;
          summary = `Updated Navbar Background to ${matchedColor.name}`;
        } else if (lower.includes("logo") || lower.includes("naam") || lower.includes("title")) {
          const quoteMatch = userInstruction.match(/["']([^"']+)["']/);
          const extractedLogo = quoteMatch ? quoteMatch[1] : effectiveStoreName;
          cloned.storeName = extractedLogo;
          cloned.header.logoText = extractedLogo;
          reply = `Navbar logo / store name ko update karke "${extractedLogo}" kar diya gaya hai!`;
          summary = `Updated Navbar Logo to "${extractedLogo}"`;
        } else {
          cloned.header.hoverColor = targetColor;
          cloned.header.activeIndicatorColor = targetColor;
          reply = `Navbar styling aur link hover colors ko ${targetColorName} me update kar diya gaya hai!`;
          summary = `Updated Navbar Styling`;
        }

        aiResponse = {
          reply,
          changesSummary: summary,
          updatedLayout: cloned,
        };
      }
      // =======================================================================
      // SCOPE 2: THEME COLORS & PALETTE (Strictly Isolated)
      // =======================================================================
      else if (tag === "theme" || lower.includes("theme") || lower.includes("palette")) {
        cloned.theme = cloned.theme || {};
        cloned.theme.colors = cloned.theme.colors || {};

        if (matchedColor) {
          cloned.theme.colors.primary = matchedColor.hex;
          if (lower.includes("background") || lower.includes("bg")) {
            cloned.theme.colors.background = matchedColor.hex;
            if (matchedColor.bgTheme === "white") cloned.theme.colors.text = "#0F172A";
            if (matchedColor.bgTheme === "black") cloned.theme.colors.text = "#F8FAFC";
          }
          reply = `Store ka theme color ${matchedColor.name} me update kar diya gaya hai!`;
          summary = `Updated Store Theme to ${matchedColor.name}`;
        } else if (lower.includes("dark") || lower.includes("black")) {
          cloned.theme.colors = {
            ...cloned.theme.colors,
            background: "#090D16",
            text: "#F8FAFC",
            primary: "#D4AF37",
            secondary: "#94A3B8",
          };
          reply = "Store theme ko sleek Dark mode me change kar diya gaya hai!";
          summary = "Applied Dark Mode Theme";
        } else if (lower.includes("gold")) {
          cloned.theme.colors = { ...cloned.theme.colors, primary: "#D4AF37", secondary: "#B45309" };
          reply = "Store theme colors ko Royal Gold me change kar diya gaya hai!";
          summary = "Applied Royal Gold Theme";
        } else {
          reply = "Store theme colors ko modern palette me update kar diya gaya hai!";
          summary = "Updated Theme Colors";
        }

        aiResponse = {
          reply,
          changesSummary: summary,
          updatedLayout: cloned,
        };
      }
      // =======================================================================
      // SCOPE 3: PROMO BANNER (Strictly Isolated)
      // =======================================================================
      else if (tag === "banner" || lower.includes("banner") || lower.includes("sale") || lower.includes("discount") || lower.includes("promo")) {
        const promo = {
          id: `promo-${Date.now()}`,
          type: "PromoBanner",
          props: {
            text: "🎉 Limited Time Offer: Flat 20% OFF + Free Cash on Delivery Nationwide! Code: ALT20",
            discountCode: "ALT20",
            couponValue: "20% OFF",
            layout: "ribbon",
          },
        };
        cloned.sections = [promo, ...(cloned.sections || []).filter((s: any) => s.type !== "PromoBanner")];
        reply = "Top announcement promo banner 20% discount aur Free Delivery ke sath add kar diya gaya hai!";
        summary = "Added Promo Announcement Banner";

        aiResponse = {
          reply,
          changesSummary: summary,
          updatedLayout: cloned,
        };
      }
      // =======================================================================
      // SCOPE 4: CANVAS SECTIONS (Hero, Story, Reviews, Products)
      // =======================================================================
      else {
        let targetSection = null;
        if (tag === "active" && activeSectionId) {
          targetSection = cloned.sections?.find((s: any) => s.id === activeSectionId);
        }
        if (!targetSection && (tag === "hero" || lower.includes("hero") || lower.includes("top section"))) {
          targetSection = cloned.sections?.find((s: any) => s.type?.startsWith("Hero") || s.type === "CustomComponent" || s.id?.includes("hero")) || cloned.sections?.[0];
        }
        if (!targetSection && (tag === "story" || lower.includes("story") || lower.includes("about"))) {
          targetSection = cloned.sections?.find((s: any) => s.type === "BrandStory" || s.id?.includes("story"));
        }
        if (!targetSection && (tag === "reviews" || lower.includes("review") || lower.includes("testimonial"))) {
          targetSection = cloned.sections?.find((s: any) => s.type === "TestimonialSlider" || s.id?.includes("review"));
        }
        if (!targetSection && (tag === "products" || lower.includes("product") || lower.includes("catalog"))) {
          targetSection = cloned.sections?.find((s: any) => s.type?.includes("Product") || s.id?.includes("product"));
        }
        if (!targetSection && activeSectionId) {
          targetSection = cloned.sections?.find((s: any) => s.id === activeSectionId);
        }
        if (!targetSection && cloned.sections?.[0]) {
          targetSection = cloned.sections[0];
        }

        // Section Background Color
        if (isColorIntent && matchedColor && targetSection) {
          targetSection.props = targetSection.props || {};
          targetSection.props.backgroundColor = matchedColor.hex;
          targetSection.props.bgTheme = matchedColor.bgTheme;
          
          const sectionLabel = targetSection.props.title ? `"${targetSection.props.title}"` : "Hero";
          reply = `${sectionLabel} section ka background color ${matchedColor.name} kar diya gaya hai!`;
          summary = `Updated section background to ${matchedColor.name}`;
        }
        // Section Copywriting (STRICTLY requiring an actual text keyword)
        else if (
          targetSection &&
          (
            lower.includes("text") ||
            lower.includes("heading") ||
            lower.includes("title") ||
            lower.includes("headline") ||
            lower.includes("para") ||
            lower.includes("subtitle") ||
            lower.includes("description") ||
            lower.includes("tafseel") ||
            lower.includes("unwan") ||
            lower.includes("naam") ||
            lower.includes("copy") ||
            lower.includes("likh") ||
            lower.includes("rewrite") ||
            lower.includes("content")
          )
        ) {
          let explicitCustomTitle = "";
          const quoteMatch = userInstruction.match(/["']([^"']+)["']/);
          if (quoteMatch && quoteMatch[1].trim().length > 2) {
            explicitCustomTitle = quoteMatch[1].trim();
          } else {
            const isStyleRequest = lower.includes("type") || lower.includes("style") || lower.includes("mutabiq") || lower.includes("tarah") || lower.includes("hona chye") || lower.includes("aisa") || lower.includes("sy likh");
            if (!isStyleRequest) {
              const stripped = userInstruction
                .replace(/@(hero|navbar|theme|products|banner|active|story|reviews)/gi, "")
                .replace(/(text|heading|title|headline|subtitle|para|description|tafseel|unwan|naam|copy|likho|likhy|likh|rakho|kardo|krdo|kr dye|badlo|kar do|change kry|change karo|change kr do|change kardo|change|update|to|ko|kar dein|kry)/gi, "")
                .trim();
              if (stripped.length >= 4 && stripped.length <= 40 && !stripped.includes("..") && !stripped.includes("or") && !stripped.includes("aur") && !stripped.includes("ki") && !stripped.includes("ka")) {
                explicitCustomTitle = stripped;
              }
            }
          }

          let targetNiche = detectedStoreNiche;
          if (lower.includes("cosmetic") || lower.includes("beauty") || lower.includes("makeup") || lower.includes("skin")) {
            targetNiche = "cosmetics";
          } else if (lower.includes("jewelry") || lower.includes("jewel") || lower.includes("gold") || lower.includes("heirloom")) {
            targetNiche = "jewelry";
          } else if (lower.includes("perfume") || lower.includes("scent") || lower.includes("fragrance") || lower.includes("khushboo") || lower.includes("ittar")) {
            targetNiche = "perfume";
          } else if (lower.includes("watch") || lower.includes("ghari") || lower.includes("chrono")) {
            targetNiche = "watches";
          } else if (lower.includes("cloth") || lower.includes("kapre") || lower.includes("shirt") || lower.includes("kurta") || lower.includes("apparel") || lower.includes("fashion")) {
            targetNiche = "clothing";
          } else if (lower.includes("shoe") || lower.includes("footwear") || lower.includes("leather") || lower.includes("jota") || lower.includes("chappal")) {
            targetNiche = "shoes";
          }

          const template = NICHE_TEMPLATES[targetNiche] || NICHE_TEMPLATES.shoes;

          targetSection.props = targetSection.props || {};

          const finalTitle = explicitCustomTitle || template.title;
          targetSection.props.title = finalTitle;

          const finalSubtitle = `Custom tailored for ${effectiveStoreName}. ${template.subtitle}`;
          targetSection.props.subtitle = finalSubtitle;

          if (template.ctaText && !targetSection.props.ctaText) {
            targetSection.props.ctaText = template.ctaText;
          }

          if (lower.includes("image") || lower.includes("photo") || lower.includes("tasweer") || lower.includes("picture")) {
            let imgNiche = targetNiche;
            if (lower.includes("jewelry")) imgNiche = "jewelry";
            else if (lower.includes("cosmetic")) imgNiche = "cosmetics";
            else if (lower.includes("shoe")) imgNiche = "shoes";
            else if (lower.includes("cloth")) imgNiche = "clothing";
            else if (lower.includes("watch")) imgNiche = "watches";

            const selectedImg = NICHE_TEMPLATES[imgNiche]?.image || template.image;
            if (selectedImg) {
              targetSection.props.imageUrl = selectedImg;
              targetSection.props.heroImage = selectedImg;
            }
          }

          reply = `Hero section ke text ko ${targetNiche.toUpperCase()} boutique tone me rewrite kar diya gaya hai!\n\n✨ Naya Title: "${finalTitle}"\n📝 Subtitle: "${finalSubtitle}"`;
          summary = `Rewrote Hero Headline & Subtitle (${targetNiche})`;
        } else {
          reply = "Aapki instruction process ho gayi hai! Kisi specific section ke liye aap @hero, @navbar, @theme, ya @banner tag use kar sakte hain.";
          summary = "Processed editor instruction";
        }

        aiResponse = {
          reply,
          changesSummary: summary,
          updatedLayout: cloned,
        };
      }

      aiResponse = {
        reply,
        changesSummary: summary,
        updatedLayout: cloned,
      };
    }

    // Automatically persist the updated layout to Supabase if storeId or storeSlug is provided
    const targetId = storeId || storeSlug;
    if (targetId && aiResponse.updatedLayout) {
      try {
        const store = await getStoreById(targetId);
        if (store?.id) {
          await updateLayoutConfig(store.id, aiResponse.updatedLayout);
          console.log(`[Editor Assistant] Persisted AI updatedLayout to store ${store.id} (${store.slug})`);
        }
      } catch (dbErr) {
        console.warn("[Editor Assistant] DB persist non-fatal error:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      reply: aiResponse.reply || "Store successfully updated!",
      changesSummary: aiResponse.changesSummary || "Store modifications applied",
      updatedLayout: aiResponse.updatedLayout,
    });
  } catch (error: any) {
    console.error("[Editor Assistant Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI assistant command" },
      { status: 500 }
    );
  }
}
