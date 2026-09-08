import { NextResponse } from "next/server";
import { getStoreById, updateLayoutConfig } from "@/lib/store/store-service";

interface RequestBody {
  storeId?: string;
  storeSlug?: string;
  storeName?: string;
  currentLayout: any;
  userInstruction: string;
}

const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
];

async function callGemini(prompt: string, apiKey: string): Promise<any | null> {
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3,
            },
          }),
        }
      );

      console.log(`[Gemini calling ${model}]...`);
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log(`[Gemini ${model} OK]: text length:`, text ? text.length : 0);
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
      }
    } catch (err) {
      console.warn(`[Gemini Fetch Exception on ${model}]:`, err);
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { storeId, storeSlug, storeName, currentLayout, userInstruction } = body;

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

    console.log("[Editor Assistant] apiKey present:", !!apiKey);
    let aiResponse: any = null;

    if (apiKey) {
      const systemPrompt = `You are an expert, world-class e-commerce store designer, copywriter, and UI/UX engineer for the Altrivo e-commerce platform.
The vendor is editing their live store: "${effectiveStoreName}".

CURRENT STORE LAYOUT CONFIG (JSON):
${JSON.stringify(currentLayout, null, 2)}

VENDOR'S INSTRUCTION (Can be Roman Urdu, Urdu, or English):
"${userInstruction.trim()}"

STRICT INSTRUCTIONS:
1. UNDERSTAND THE INSTRUCTION PRECISELY:
   - Vendors often use Roman Urdu (e.g. "hero ki heading change karke 'Royal Suits' kardo", "color black and gold kardo", "top banner add karo free delivery ka", "button ka color green kardo", "about story me Pakistani craftsmanship likho", "ye section delete kardo").
   - Understand the vendor's intent and modify ONLY what was asked.
   - DO NOT overwrite or delete sections or props the user did not ask to change.
   - PRESERVE existing product catalog arrays and categories.

2. THEME COLORS & STYLING:
   - If user asks for color changes (e.g. "gold", "dark", "emerald", "navy", "light"), update "theme.colors":
     - primary: Hex color for buttons, key branding, highlights (e.g. Gold: #D4AF37, Emerald: #10B981, Navy: #1E3A8A, Black: #18181B)
     - secondary: Complementary accent color (e.g. #0284C7, #F59E0B)
     - background: Page background (e.g. Dark: #090D16 or #0F172A, Light: #FFFFFF or #F8FAFC)
     - text: High-contrast body text (e.g. Dark theme text: #F8FAFC, Light theme text: #0F172A)
   - If user asks for typography/fonts (e.g. "Playfair", "Inter", "serif", "sans"), update "theme.typography".

3. SECTION CONTENT & COPYWRITING:
   - If changing hero title/subtitle/CTA: Update the section where type starts with "Hero" (props.title, props.subtitle, props.ctaText, etc.).
   - If adding a promo banner: Add a "PromoBanner" section at the very top (index 0) with compelling copy (e.g. discount code, free delivery).
   - If adding testimonials or reviews: Add a "TestimonialSlider" section with authentic Pakistani / global reviews.
   - If adding brand story / about: Add a "BrandStory" section with compelling heritage and craftsmanship copy tailored to the store.
   - If adding feature highlights: Add a "FeatureGrid" section with icons (e.g. Cash On Delivery, Escrow Protection, Fast TCS Shipping).
   - If removing a section: Remove that specific section.

5. CLEAN HEADINGS & NO BADGE PILLS OR ICONS:
   - Headings must be clean, simple, styled text only.
   - Do NOT generate 'badge' properties, SVG icons, or pill badges (e.g., '✨ AI STUDIO DESIGN', 'FEATURED') above titles/headings in any component.
   - Keep sections clean, modern, and without decorative SVG pill tags above titles.

6. REQUIRED OUTPUT FORMAT:
   Return ONLY a valid JSON object with EXACTLY these three keys:
   - "reply": A warm, professional, and concise response in Roman Urdu (e.g., "Aapke hero section ki heading ko '...' se update kar diya gaya hai aur primary color ko ... kar diya gaya hai.").
   - "changesSummary": A short 1-line summary in English or Roman Urdu of what changed (e.g., "Updated Hero Title & Changed Theme to Royal Gold").
   - "updatedLayout": The complete modified layout JSON object containing all sections, theme, and updated properties.

DO NOT wrap your response in markdown code blocks like \`\`\`json. Output raw JSON ONLY.`;

      aiResponse = await callGemini(systemPrompt, apiKey);
    }

    // Smart fallback if Gemini is unreachable
    if (!aiResponse || !aiResponse.updatedLayout) {
      console.warn("[Editor Assistant] Gemini call failed or unavailable, applying smart fallback");
      const cloned = JSON.parse(JSON.stringify(currentLayout));
      const lower = userInstruction.toLowerCase();
      let reply = "Store layout update kar diya gaya hai!";
      let summary = "Updated store layout";

      if (lower.includes("dark") || lower.includes("black")) {
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
      } else if (lower.includes("purple") || lower.includes("brand") || lower.includes("violet")) {
        cloned.theme = cloned.theme || {};
        cloned.theme.colors = { ...cloned.theme.colors, primary: "#694873", secondary: "#5A3D63" };
        reply = "Theme colors ko Royal Brand Purple me update kar diya gaya hai!";
        summary = "Applied Royal Brand Purple Theme";
      } else if (lower.includes("banner") || lower.includes("sale") || lower.includes("discount")) {
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
        cloned.sections = [promo, ...cloned.sections.filter((s: any) => s.type !== "PromoBanner")];
        reply = "Top promo banner 20% discount aur Free Delivery ke sath add kar diya gaya hai!";
        summary = "Added Promo Announcement Banner";
      } else if (lower.includes("hero") || lower.includes("heading") || lower.includes("title")) {
        const cleanTitle = userInstruction
          .replace(/(change|hero|heading|title|kardo|krdo|kr dye|badlo|kar do|to|ko|kar dein)/gi, "")
          .trim() || `${effectiveStoreName} Signature Collection`;
        cloned.sections = cloned.sections.map((s: any) =>
          s.type?.startsWith("Hero") ? { ...s, props: { ...s.props, title: cleanTitle } } : s
        );
        reply = `Hero section ki heading ko update karke "${cleanTitle}" kar diya gaya hai!`;
        summary = `Updated Hero Heading to "${cleanTitle}"`;
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
