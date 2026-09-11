import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GEMINI_MODELS = [
  "gemini-flash-latest",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-2.5-pro",
];

function getGeminiApiKey(): string | null {
  let key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
  if (!key) {
    try {
      const envPath = path.join(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf8");
        for (const line of content.split("\n")) {
          if (line.startsWith("GEMINI_API_KEY=")) {
            key = line.split("=")[1].trim().replace(/['"]/g, "");
            break;
          }
          if (!key && line.startsWith("GOOGLE_API_KEY=")) {
            key = line.split("=")[1].trim().replace(/['"]/g, "");
          }
        }
      }
    } catch {}
  }
  return key;
}

function detectNiche(name?: string, promptText?: string, fallbackNiche?: string): string {
  const combined = `${name || ""} ${promptText || ""} ${fallbackNiche || ""}`.toLowerCase();
  if (/watch|ghari|timepiece|chronograph|rolex|dial|horolog/i.test(combined)) return "watches";
  if (/perfume|fragrance|attar|itr|oud|scent/i.test(combined)) return "perfumes";
  if (/shoe|footwear|sneaker|chappal|boot|loafer|khussa|sandal/i.test(combined)) return "shoes";
  if (/jewel|gold|silver|diamond|ring|necklace|earring/i.test(combined)) return "jewelry";
  if (/cloth|fashion|pret|wear|apparel|dress|kurta|suit|shirt|pant|abaya|hoodie/i.test(combined)) return "fashion";
  if (/tech|gadget|mobile|phone|electronic|audio|headphone|earbud|laptop|device/i.test(combined)) return "electronics";
  if (/beauty|cosmetic|skincare|serum|makeup|cream|lotion|glow/i.test(combined)) return "beauty";
  if (/home|decor|furniture|vase|chair|lamp|rug|living/i.test(combined)) return "home";
  return "general";
}

function getSmartFallbackPrompt(storeName: string, niche: string): string {
  const name = storeName || "Our Brand";
  switch (niche) {
    case "watches":
      return `${name} is a premier luxury watchmaker dedicated to precision automatic chronographs, sapphire crystal dials, and handcrafted leather timepieces that blend timeless elegance with bold modern aesthetics. Backed by nationwide Cash on Delivery (COD) across Pakistan and an effortless 7-day easy exchange guarantee for complete peace of mind.`;
    case "shoes":
      return `${name} crafts master artisan leather footwear and traditional Peshawari chappals from 100% pure full-grain calfskin leather. Built for timeless royal distinction and ergonomic all-day comfort, with nationwide Cash on Delivery and a 7-day hassle-free replacement guarantee across Pakistan.`;
    case "fashion":
      return `${name} offers contemporary luxury designer pret and bespoke festive apparel tailored from curated premium fabrics with modern minimal silhouettes. Experience effortless elegance with nationwide express Cash on Delivery and 100% genuine quality assurance across Pakistan.`;
    case "perfumes":
      return `${name} is an artisanal haute parfumerie specializing in pure extrait de parfum, royal Cambodian oud, and rare French floral essences. Matured for rich long-lasting projection and unforgettable sillage, with nationwide Cash on Delivery and free sample testers across Pakistan.`;
    case "electronics":
      return `${name} delivers cutting-edge wireless audio, mechanical gaming keyboards, and high-performance smart gadgets engineered with clean modern surfaces. Experience next-gen tech performance with nationwide Cash on Delivery and 100% buyer escrow protection across Pakistan.`;
    case "beauty":
      return `${name} offers clean botanical skincare, dermatologically tested glow serums, and organic wellness essentials crafted to nourish and revitalize your skin. Dedicated to authentic natural radiance with nationwide Cash on Delivery across Pakistan.`;
    case "jewelry":
      return `${name} curates timeless fine jewelry, handcrafted 18K gold designs, and certified diamond creations for life's most precious celebrations. Delivered in bespoke velvet presentation boxes with insured nationwide Cash on Delivery across Pakistan.`;
    case "home":
      return `${name} transforms living spaces with handcrafted ceramics, minimalist Scandinavian furniture, and warm ambient luxury home decor accents. Elevate your everyday sanctuary with nationwide doorstep Cash on Delivery across Pakistan.`;
    default:
      return `${name} delivers curated premium essentials engineered for unmatched durability, superior aesthetics, and refined modern luxury living. Shop with complete confidence with nationwide Cash on Delivery and 100% buyer escrow protection across Pakistan.`;
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, storeName, niche } = await req.json();

    const effectiveName = (storeName || "").trim() || "My Store";
    const effectivePrompt = (prompt || "").trim();
    const effectiveNiche = detectNiche(effectiveName, effectivePrompt, niche);

    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      return NextResponse.json({
        enhancedPrompt: getSmartFallbackPrompt(effectiveName, effectiveNiche),
      });
    }

    const promptText = `Write an inspiring, complete 2-to-3 sentence store vision description for an online e-commerce storefront named "${effectiveName}" in the "${effectiveNiche}" niche.
User's input or idea: "${effectivePrompt || effectiveName}".

Key points to include:
1. The brand's signature aesthetic and high-quality products (e.g. if watches: chronographs, luxury timepieces; if perfumes: pure oud, attar, luxury scents; if clothing: pret, luxury apparel; if tech: smart gear).
2. Customer trust highlights: 100% authentic craftsmanship, nationwide express Cash on Delivery (COD) across Pakistan, and a 7-day easy return policy.

IMPORTANT: Return ONLY the final polished paragraph as plain text. Do not include markdown code fences, bullet points, quotes, or incomplete sentences. The output must be completely finished and end with a period.`;

    for (const model of GEMINI_MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          let text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) {
            text = text.replace(/^```(?:markdown|text)?\s*/i, "").replace(/\s*```$/i, "");
            text = text.replace(/^["']|["']$/g, "").trim();

            if (text.length > 30) {
              return NextResponse.json({ enhancedPrompt: text });
            }
          }
        }
      } catch (err) {
        console.warn(`[Gemini Enhance Prompt ${model} Exception]:`, err);
      }
    }

    // High quality intelligent fallback if all models failed
    return NextResponse.json({
      enhancedPrompt: getSmartFallbackPrompt(effectiveName, effectiveNiche),
    });
  } catch (error: any) {
    console.error("[Enhance Prompt Error]:", error);
    return NextResponse.json(
      { enhancedPrompt: getSmartFallbackPrompt("My Store", "general") },
      { status: 200 }
    );
  }
}
