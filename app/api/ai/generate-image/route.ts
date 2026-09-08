import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, aspect = 'portrait', niche: requestedNiche } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const pLower = `${prompt} ${requestedNiche || ''}`.toLowerCase();
    let niche = requestedNiche || 'general';
    if (/watch|ghari|timepiece|chronograph|rolex|dial/i.test(pLower)) niche = 'watches';
    else if (/perfume|fragrance|attar|itr|oud|scent/i.test(pLower)) niche = 'perfumes';
    else if (/shoe|footwear|sneaker|chappal|boot|loafer|khussa/i.test(pLower)) niche = 'shoes';
    else if (/cloth|fashion|pret|wear|apparel|dress|kurta|suit/i.test(pLower)) niche = 'fashion';
    else if (/tech|gadget|mobile|phone|electronic|audio|headphone/i.test(pLower)) niche = 'electronics';
    else if (/beauty|cosmetic|skincare|serum|makeup/i.test(pLower)) niche = 'beauty';
    else if (/home|decor|furniture|vase|chair|lamp/i.test(pLower)) niche = 'home';
    else if (/jewel|gold|silver|diamond|ring|necklace/i.test(pLower)) niche = 'jewelry';

    const apiKey = process.env.OPENAI_API_KEY;

    // Dimensions based on aspect
    let width = 800;
    let height = 1000;
    if (aspect === 'square') {
      width = 800;
      height = 800;
    } else if (aspect === 'landscape') {
      width = 1200;
      height = 675;
    }

    // 1. If OpenAI API Key is provided, generate via DALL-E 3
    if (apiKey && apiKey.startsWith('sk-')) {
      try {
        const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: `High-end commercial studio product photography of ${prompt}, commercial catalog style, hyper-realistic, 8k resolution, elegant lighting, neutral background, for luxury ${niche} e-commerce`,
            n: 1,
            size: aspect === 'square' ? '1024x1024' : '1024x1792',
            quality: 'standard',
          }),
        });

        if (openaiRes.ok) {
          const data = await openaiRes.json();
          const imageUrl = data.data?.[0]?.url;
          if (imageUrl) {
            return NextResponse.json({
              imageUrl,
              provider: 'openai_dalle3',
              prompt,
            });
          }
        }
      } catch (dalleErr) {
        console.warn('[AI Image] OpenAI DALL-E 3 fallback:', dalleErr);
      }
    }

    // 2. High-Speed AI Diffusion Generator with Niche Tuning (3 Variations)
    const baseSeed = Math.floor(Math.random() * 100000);
    const cleanPrompt = `luxury ${niche} product photography, ${prompt}, cinematic studio lighting, photorealistic 8k commercial catalog, isolated clean background`;
    const url1 = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=${width}&height=${height}&nologo=true&seed=${baseSeed}`;
    const url2 = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt + ", editorial studio angle")}&width=${width}&height=${height}&nologo=true&seed=${baseSeed + 107}`;
    const url3 = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt + ", premium catalog showcase")}&width=${width}&height=${height}&nologo=true&seed=${baseSeed + 283}`;

    return NextResponse.json({
      imageUrl: url1,
      images: [url1, url2, url3],
      provider: 'ai_diffusion_fast',
      prompt,
      niche,
    });
  } catch (error: any) {
    console.error('[AI Image] Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image', details: error.message },
      { status: 500 }
    );
  }
}
