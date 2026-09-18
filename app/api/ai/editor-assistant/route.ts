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
              temperature: 0.2,
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
          // Service is overloaded right now, fall back instantly
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

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { storeId, storeSlug, storeName, currentLayout, userInstruction, activeSectionId, targetTag } = body;

    if (!userInstruction || !userInstruction.trim()) {
      return NextResponse.json({ error: "userInstruction is required" }, { status: 400 });
    }

    if (!currentLayout || typeof currentLayout !== "object") {
      return NextResponse.json({ error: "currentLayout is required" }, { status: 400 });
    }

    const effectiveStoreName = storeName || currentLayout.storeName || "My Store";
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
The vendor is editing their live store: "${effectiveStoreName}".

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

2. PRECISE PROPERTY MODIFICATION — DO NOT CONFUSE COLOR WITH TITLE:
   - BACKGROUND / COLOR CHANGES:
     - If the user asks to change background color (e.g. "background color change kr do white", "bg black kardo", "color emerald karo"):
       - Update the target section's "props.backgroundColor" (e.g. "#FFFFFF") and/or "props.bgTheme" ("white" | "slate" | "gold" | "black" | "light" | "glass").
       - Or if targeting store theme, update "theme.colors.background".
       - CRITICAL: NEVER overwrite or put instructions into "props.title" or "props.subtitle" when the user asked for a color or background change!
   - TITLE / HEADLINE CHANGES:
     - Only update "props.title" when user explicitly requests a title or headline change (e.g. "title badal kar 'Luxury Shoes' kardo").
     - Extract only the title text, DO NOT include conversational filler like "kardo", "change", etc.
   - SUBTITLE / PARAGRAPH CHANGES:
     - Update "props.subtitle" or "props.paragraphs".
   - BUTTON / CTA CHANGES:
     - Update "props.ctaText", "props.ctaLink", or "props.buttonTheme".
   - BANNER PROMOTIONS:
     - Add PromoBanner at index 0 of sections if user asks for sale/coupon banner.

3. REQUIRED OUTPUT FORMAT:
   Return ONLY a valid JSON object with EXACTLY these three keys:
   - "reply": A warm, polite, and clear explanation in Roman Urdu (e.g. "Hero section ka background color White (#FFFFFF) kar diya gaya hai!").
   - "changesSummary": A short 1-line English summary (e.g. "Changed Hero Background to White").
   - "updatedLayout": The complete updated layout JSON object.

DO NOT wrap your response in markdown code blocks like \`\`\`json. Output raw JSON ONLY.`;

      aiResponse = await callGemini(systemPrompt, apiKey);
    }

    // =========================================================================
    // SMART MULTI-PROPERTY FALLBACK ENGINE (Bulletproof Roman Urdu & Tag Support)
    // =========================================================================
    if (!aiResponse || !aiResponse.updatedLayout) {
      console.warn("[Editor Assistant] Running Smart Multi-Property Fallback Engine");
      const cloned = JSON.parse(JSON.stringify(currentLayout));
      const lower = userInstruction.toLowerCase();

      // 1. Detect Tag from input if not passed explicitly (e.g., "@hero", "@theme", "@navbar", "@banner", "@products", "@story")
      let tag = (targetTag || "").toLowerCase().replace("@", "");
      if (!tag) {
        const tagMatch = lower.match(/@(hero|navbar|theme|products|catalog|banner|story|about|reviews|footer|active)/);
        if (tagMatch) tag = tagMatch[1];
      }

      // 2. Identify Targeted Section
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
      // If still not matched, check active section from canvas
      if (!targetSection && activeSectionId) {
        targetSection = cloned.sections?.find((s: any) => s.id === activeSectionId);
      }

      let reply = "Aapki request ke mutabiq store update kar diya gaya hai!";
      let summary = "Updated store layout";

      // 3. INTENT A: BACKGROUND COLOR / THEME COLOR
      const isColorIntent = lower.includes("color") || lower.includes("colour") || lower.includes("background") || lower.includes("bg") || lower.includes("rang") || lower.includes("safaid") || lower.includes("kala");
      
      // Match color from text
      let matchedColor: { hex: string; bgTheme: string; name: string } | null = null;
      for (const [key, val] of Object.entries(COLOR_MAP)) {
        // Match word boundaries to avoid false positives
        const regex = new RegExp(`\\b${key}\\b`, "i");
        if (regex.test(lower)) {
          matchedColor = val;
          break;
        }
      }
      // Check for hex color pattern e.g. #fff, #ffffff, #123456
      const hexMatch = lower.match(/#([0-9a-f]{3}|[0-9a-f]{6})\b/i);
      if (hexMatch) {
        const hex = hexMatch[0].toUpperCase();
        matchedColor = { hex, bgTheme: hex === "#FFFFFF" || hex === "#FFF" ? "white" : "slate", name: hex };
      }

      if (isColorIntent && matchedColor) {
        // If targeted section exists, update that section's background color
        if (targetSection) {
          targetSection.props = targetSection.props || {};
          targetSection.props.backgroundColor = matchedColor.hex;
          targetSection.props.bgTheme = matchedColor.bgTheme;
          
          const sectionLabel = targetSection.props.title ? `"${targetSection.props.title}"` : "Hero";
          reply = `${sectionLabel} section ka background color ${matchedColor.name} kar diya gaya hai!`;
          summary = `Updated section background to ${matchedColor.name}`;
        } else if (tag === "theme" || lower.includes("theme") || lower.includes("store") || lower.includes("puri") || lower.includes("website")) {
          // Update global theme
          cloned.theme = cloned.theme || {};
          cloned.theme.colors = cloned.theme.colors || {};
          cloned.theme.colors.background = matchedColor.hex;
          if (matchedColor.bgTheme === "black") {
            cloned.theme.colors.text = "#F8FAFC";
          } else if (matchedColor.bgTheme === "white") {
            cloned.theme.colors.text = "#0F172A";
          }
          reply = `Store ka overall theme background color ${matchedColor.name} kar diya gaya hai!`;
          summary = `Updated theme background to ${matchedColor.name}`;
        } else if (cloned.sections?.[0]) {
          // Default to top/hero section
          cloned.sections[0].props = cloned.sections[0].props || {};
          cloned.sections[0].props.backgroundColor = matchedColor.hex;
          cloned.sections[0].props.bgTheme = matchedColor.bgTheme;
          reply = `Top section ka background color ${matchedColor.name} kar diya gaya hai!`;
          summary = `Updated top section background to ${matchedColor.name}`;
        }
      }
      // 4. INTENT B: PROMO BANNER ADDITION
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
      }
      // 5. INTENT C: EXPLICIT TITLE / HEADING CHANGE (Only when explicit!)
      else if (lower.includes("heading") || lower.includes("title") || lower.includes("unwan") || lower.includes("naam")) {
        // Extract title from quotes if available
        let extractedTitle = "";
        const quoteMatch = userInstruction.match(/["']([^"']+)["']/);
        if (quoteMatch) {
          extractedTitle = quoteMatch[1].trim();
        } else {
          // Strip instruction keywords
          extractedTitle = userInstruction
            .replace(/@(hero|navbar|theme|products|banner|active)/gi, "")
            .replace(/(change|update|hero|heading|title|headline|unwan|naam|likho|rakho|kardo|krdo|kr dye|badlo|kar do|to|ko|kar dein)/gi, "")
            .trim();
        }

        if (extractedTitle && targetSection) {
          targetSection.props = targetSection.props || {};
          targetSection.props.title = extractedTitle;
          reply = `Section ki heading ko update karke "${extractedTitle}" kar diya gaya hai!`;
          summary = `Updated section heading to "${extractedTitle}"`;
        } else if (extractedTitle && cloned.sections?.[0]) {
          cloned.sections[0].props = cloned.sections[0].props || {};
          cloned.sections[0].props.title = extractedTitle;
          reply = `Hero section ki heading ko update karke "${extractedTitle}" kar diya gaya hai!`;
          summary = `Updated hero heading to "${extractedTitle}"`;
        }
      }
      // 6. INTENT D: SUBTITLE / PARAGRAPH CHANGE
      else if (lower.includes("subtitle") || lower.includes("para") || lower.includes("description") || lower.includes("tafseel")) {
        let extractedSub = "";
        const quoteMatch = userInstruction.match(/["']([^"']+)["']/);
        if (quoteMatch) {
          extractedSub = quoteMatch[1].trim();
        } else {
          extractedSub = userInstruction
            .replace(/@(hero|navbar|theme|products|banner|active)/gi, "")
            .replace(/(change|update|subtitle|subheading|para|description|tafseel|likho|kardo|krdo|badlo)/gi, "")
            .trim();
        }
        if (extractedSub && targetSection) {
          targetSection.props = targetSection.props || {};
          targetSection.props.subtitle = extractedSub;
          reply = `Section ke subtitle ko update kar diya gaya hai: "${extractedSub}"`;
          summary = `Updated subtitle`;
        }
      }
      // 7. INTENT E: GENERAL THEME PRESETS
      else if (lower.includes("dark") || lower.includes("black")) {
        cloned.theme = cloned.theme || {};
        cloned.theme.colors = {
          ...cloned.theme.colors,
          background: "#090D16",
          text: "#F8FAFC",
          primary: lower.includes("gold") ? "#D4AF37" : "#38BDF8",
          secondary: "#94A3B8",
        };
        reply = "Theme ko sleek Dark mode me change kar diya gaya hai!";
        summary = "Applied Dark Mode Theme";
      } else if (lower.includes("gold")) {
        cloned.theme = cloned.theme || {};
        cloned.theme.colors = { ...cloned.theme.colors, primary: "#D4AF37", secondary: "#B45309" };
        reply = "Theme colors ko Royal Gold me change kar diya gaya hai!";
        summary = "Applied Royal Gold Theme";
      } else {
        // Safe default: acknowledge without destructive changes
        reply = "Aapki instruction record ho gayi hai. Kisi specific section me tabdeeli ke liye aap @hero, @theme, ya @banner tag use kar sakte hain!";
        summary = "Processed editor instruction";
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
