import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, aspect = 'portrait', niche = 'shoes' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

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
            prompt: `High-end commercial studio product photography of ${prompt}, commercial catalog style, hyper-realistic, 8k resolution, elegant lighting, neutral background, for luxury e-commerce`,
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

    // 2. High-Speed AI Diffusion Generator (Free & Instant fallback)
    const seed = Math.floor(Math.random() * 100000);
    const cleanPrompt = `luxury ${niche} product photography, ${prompt}, cinematic lighting, photorealistic 8k commercial catalog, isolated studio background`;
    const aiGeneratedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

    return NextResponse.json({
      imageUrl: aiGeneratedUrl,
      provider: 'ai_diffusion_fast',
      prompt,
    });
  } catch (error: any) {
    console.error('[AI Image] Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image', details: error.message },
      { status: 500 }
    );
  }
}
