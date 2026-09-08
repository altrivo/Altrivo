import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { currentLayout, userEditInstruction } = await req.json();

    if (!currentLayout || !userEditInstruction) {
      return NextResponse.json(
        { error: "Missing currentLayout or userEditInstruction in request body" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (apiKey) {
      // Full AI Integration: Send request to Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert design assistant. Below is the current dynamic storefront layout configuration in JSON format.
                    
                    Current Layout JSON:
                    ${JSON.stringify(currentLayout, null, 2)}
                    
                    The user wants to make this modification: "${userEditInstruction}"
                    
                    Your task is to modify the layout JSON configuration to fulfill the user's request.
                    Rules:
                    1. If the user asks to change theme colors or fonts, modify the "theme" block.
                    2. If the user asks to add a section, generate a new component block from the registry list and insert it at the correct index (or at the bottom if not specified).
                    3. Registry of available components: "HeroSplitImage", "HeroCenteredOverlay", "PromoBanner", "FeatureGrid", "ProductGridFeatured", "ProductSingleFocus", "CategoryCarousel", "TestimonialSlider", "BrandStory", "NewsletterSignup".
                    4. Keep existing text, products, list items, and links intact unless explicitly told to modify them.
                    5. Respond ONLY with the fully updated JSON object. Do not wrap it in markdown block tags (like \`\`\`json). Just return the raw JSON string.`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const updatedLayout = JSON.parse(rawText.trim());
          return NextResponse.json({ updatedLayout, method: "gemini-ai" });
        }
      }
    }

    // Smart Rule-based Fallback if API keys are missing or call fails
    const updatedLayout = JSON.parse(JSON.stringify(currentLayout)); // Deep clone
    const instruction = userEditInstruction.toLowerCase().trim();

    // 1. Color variations (e.g. "dark mode", "make background dark", "make background light")
    if (instruction.includes("dark")) {
      updatedLayout.theme.colors.background = "#0f172a";
      updatedLayout.theme.colors.text = "#f8fafc";
      updatedLayout.theme.colors.primary = "#38bdf8";
      updatedLayout.theme.colors.secondary = "#e2e8f0";
    } else if (instruction.includes("light") || instruction.includes("white")) {
      updatedLayout.theme.colors.background = "#ffffff";
      updatedLayout.theme.colors.text = "#1e293b";
      updatedLayout.theme.colors.primary = "#0f172a";
      updatedLayout.theme.colors.secondary = "#d97706";
    }

    if (instruction.includes("purple") || instruction.includes("violet") || instruction.includes("brand")) {
      updatedLayout.theme.colors.primary = "#694873";
    } else if (instruction.includes("gold") || instruction.includes("amber")) {
      updatedLayout.theme.colors.primary = "#d97706";
    } else if (instruction.includes("blue") || instruction.includes("cobalt")) {
      updatedLayout.theme.colors.primary = "#1d4ed8";
    }

    // 3. Typographical changes (e.g. "use sans-serif", "change font to playfair")
    if (instruction.includes("serif") || instruction.includes("playfair")) {
      updatedLayout.theme.typography.heading = "Playfair Display";
    } else if (instruction.includes("sans") || instruction.includes("inter")) {
      updatedLayout.theme.typography.heading = "Inter";
    }

    // 4. Adding layouts (e.g. "add newsletter", "add testimonials")
    if (instruction.includes("newsletter") || instruction.includes("subscribe")) {
      const exists = updatedLayout.sections.some((s: any) => s.type === "NewsletterSignup");
      if (!exists) {
        updatedLayout.sections.push({
          id: `news-${Date.now()}`,
          type: "NewsletterSignup",
          props: {
            title: "Join Our Inner Circle",
            subtitle: "Sign up to receive 10% off your first buy and priority drop notifications.",
            buttonText: "Join Now",
            layout: "box"
          }
        });
      }
    }

    if (instruction.includes("testimonial") || instruction.includes("review")) {
      const exists = updatedLayout.sections.some((s: any) => s.type === "TestimonialSlider");
      if (!exists) {
        updatedLayout.sections.push({
          id: `test-${Date.now()}`,
          type: "TestimonialSlider",
          props: {
            title: "Client Testimonials",
            layout: "carousel",
            testimonials: [
              { id: "1", name: "Zainab Ahmed", text: "Stunning quality, the craftsmanship is incredible!", rating: 5, role: "Verified Buyer" },
              { id: "2", name: "Bilal Khan", text: "Fast TCS express delivery and the escrow option gave me complete peace of mind.", rating: 5, role: "Verified Buyer" }
            ]
          }
        });
      }
    }

    if (instruction.includes("banner") || instruction.includes("promo")) {
      const exists = updatedLayout.sections.some((s: any) => s.type === "PromoBanner");
      if (!exists) {
        updatedLayout.sections.unshift({
          id: `promo-${Date.now()}`,
          type: "PromoBanner",
          props: {
            text: "Free shipping nationwide on all orders over ₨ 5,000! Limited time code: FREE5K",
            discountCode: "FREE5K",
            couponValue: "Free Shipping",
            layout: "ribbon"
          }
        });
      }
    }

    return NextResponse.json({ updatedLayout, method: "rule-fallback" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to process refinement", details: error.message },
      { status: 500 }
    );
  }
}
