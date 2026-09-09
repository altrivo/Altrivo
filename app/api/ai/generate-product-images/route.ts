import { NextResponse } from "next/server";

interface RequestBody {
  prompt: string;
  style?: "studio" | "lifestyle" | "flatlay" | "moody";
}

const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
];

const STYLE_DESCRIPTIONS: Record<string, string> = {
  studio: "commercial studio product photography, clean isolated seamless pure white background, soft shadow, balanced softbox studio lighting, 8k commercial catalog, no humans",
  lifestyle: "aesthetic lifestyle product photography, natural warm sunlight, in-context realistic modern interior environment, complementary elegant props, 8k resolution",
  flatlay: "flat lay product photography, top-down 90 degree overhead view, clean aesthetic organized composition, minimalist styling props, 8k resolution",
  moody: "dark moody luxury product photography, dramatic ambient lighting, rich cinematic shadows, high contrast, luxury presentation, 8k detail",
};

// Curated high-resolution fallback pool for different product categories
const FALLBACK_CATEGORY_IMAGES: Record<string, string[]> = {
  clothing: [
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80",
  ],
  watches: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=800&q=80",
  ],
  shoes: [
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
  ],
  bags: [
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
  ],
  general: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
  ],
};

function getCategoryFallback(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  if (/shirt|cloth|dress|suit|kurta|wear|apparel|pant|trouser|blouse|coat|jacket/i.test(lower)) {
    return FALLBACK_CATEGORY_IMAGES.clothing;
  }
  if (/watch|ghari|dial|chrono|timepiece/i.test(lower)) {
    return FALLBACK_CATEGORY_IMAGES.watches;
  }
  if (/shoe|boot|sneaker|heel|sandal|loafer|khussa/i.test(lower)) {
    return FALLBACK_CATEGORY_IMAGES.shoes;
  }
  if (/bag|handbag|purse|tote|backpack|clutch/i.test(lower)) {
    return FALLBACK_CATEGORY_IMAGES.bags;
  }
  return FALLBACK_CATEGORY_IMAGES.general;
}

async function callGemini(systemPrompt: string, apiKey: string): Promise<any | null> {
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.4,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          try {
            return JSON.parse(text.trim());
          } catch (jsonErr) {
            console.warn(`[Gemini Image Gen JSON Parse Error on ${model}]:`, jsonErr);
          }
        }
      } else {
        const errText = await res.text();
        console.warn(`[Gemini Image Gen ${model} Error]: ${res.status}`, errText.substring(0, 150));
      }
    } catch (err) {
      console.warn(`[Gemini Image Gen Exception on ${model}]:`, err);
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { prompt, style = "studio" } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Product prompt is required" }, { status: 400 });
    }

    const cleanPrompt = prompt.trim();
    const styleDescription = STYLE_DESCRIPTIONS[style] || STYLE_DESCRIPTIONS.studio;

    // Read API key
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

    let geminiPlan: any = null;

    if (apiKey) {
      const geminiPrompt = `You are a world-class commercial product photographer, art director, and lighting engineer.
The vendor needs 4 professional studio product photos for an online store catalog.
Vendor's input (can be Roman Urdu, Urdu, or English): "${cleanPrompt}"
Selected Photography Style: "${style}" (${styleDescription})

Generate 4 distinct, highly detailed photorealistic image generation prompts for 4 different camera angles:
1. Front Studio View (centered front view, perfect commercial catalog presentation, clean background, balanced studio lighting)
2. 3/4 Perspective Angle (45-degree angle showing product depth, silhouette, dimensional rim lighting)
3. Material & Texture Macro (extreme close-up detail shot highlighting fabric weave, stitching, texture, material craftsmanship)
4. Styled Context Shot (in-context or styled setup with minimalist complementary aesthetic props matching the style)

Return ONLY a valid JSON object with EXACTLY this structure:
{
  "refinedProductName": "Professional clean product title in English",
  "variations": [
    { "angleName": "Front Studio View", "imagePrompt": "..." },
    { "angleName": "3/4 Perspective Angle", "imagePrompt": "..." },
    { "angleName": "Material Texture Macro", "imagePrompt": "..." },
    { "angleName": "Styled Presentation", "imagePrompt": "..." }
  ]
}

DO NOT wrap response in markdown code blocks like \`\`\`json. Output raw JSON ONLY.`;

      geminiPlan = await callGemini(geminiPrompt, apiKey);
    }

    // Default angle titles if Gemini was not reachable
    const defaultAngles = [
      "Front Studio View",
      "3/4 Perspective Angle",
      "Material Texture Macro",
      "Styled Presentation",
    ];

    const baseSeed = Math.floor(Math.random() * 100000);
    const fallbackList = getCategoryFallback(cleanPrompt);

    const generatedImages = defaultAngles.map((angleName, idx) => {
      const variationPrompt =
        geminiPlan?.variations?.[idx]?.imagePrompt ||
        `commercial product photography of ${cleanPrompt}, ${angleName}, ${styleDescription}`;

      const seed = baseSeed + idx * 73;
      // High-speed photorealistic AI Diffusion (800x800 square for product catalog)
      const aiDiffusionUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        variationPrompt
      )}?width=800&height=800&nologo=true&seed=${seed}`;

      return {
        id: `ai_img_${Date.now()}_${idx + 1}`,
        url: aiDiffusionUrl,
        fallbackUrl: fallbackList[idx % fallbackList.length],
        angleName: geminiPlan?.variations?.[idx]?.angleName || angleName,
        prompt: variationPrompt,
      };
    });

    return NextResponse.json({
      success: true,
      refinedProductName: geminiPlan?.refinedProductName || cleanPrompt,
      style,
      images: generatedImages,
    });
  } catch (err: any) {
    console.error("[generate-product-images] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate product images", details: err?.message },
      { status: 500 }
    );
  }
}
