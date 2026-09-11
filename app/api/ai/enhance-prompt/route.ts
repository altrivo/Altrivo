import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
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

export async function POST(req: Request) {
  try {
    const { prompt, storeName, niche } = await req.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      // Fallback enhancement if no key is configured
      const enhanced = `${prompt.trim()}. Featuring premium artisanal craftsmanship, bespoke luxury design, verified authentic materials, and nationwide Cash on Delivery (COD) across Pakistan.`;
      return NextResponse.json({ enhancedPrompt: enhanced });
    }

    const systemInstruction = `You are a world-class e-commerce brand strategist and copywriter.
A vendor wants to build an online storefront on the Altrivo platform.
Given their initial store name: "${storeName || "Exclusive Brand"}", niche: "${niche || "general"}", and rough idea: "${prompt.trim()}".

Task:
Write an enhanced, compelling 2-3 sentence store vision prompt that clearly defines:
1. The unique brand aesthetic and target market.
2. The key signature products or handcrafted value proposition.
3. Buyer trust elements (e.g. premium materials, Cash on Delivery nationwide in Pakistan, easy exchange).

Keep it punchy, evocative, and under 55 words. Do NOT include markdown code fences or quotes. Return ONLY the enhanced prompt string.`;

    for (const model of GEMINI_MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemInstruction }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 200,
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) {
            // Clean quotes or markdown wrappers
            const cleaned = text.replace(/^["']|["']$/g, "").trim();
            return NextResponse.json({ enhancedPrompt: cleaned });
          }
        }
      } catch (err) {
        console.warn(`[Enhance Prompt Exception on ${model}]:`, err);
      }
    }

    // Fallback if all models failed
    const fallback = `${prompt.trim()}. Featuring premium artisanal craftsmanship, bespoke luxury design, verified authentic materials, and nationwide Cash on Delivery (COD) across Pakistan.`;
    return NextResponse.json({ enhancedPrompt: fallback });
  } catch (error: any) {
    console.error("[Enhance Prompt Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enhance prompt" },
      { status: 500 }
    );
  }
}
