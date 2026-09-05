import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { planStore } from '@/lib/ai/store-planner';
import { generateTemplatePreviews, generateFinalStore } from '@/lib/ai/store-generator';
import { generateStoreContent } from '@/lib/ai/content-engine';
import { generateStoreMedia } from '@/lib/ai/media-engine';
import { assembleCustomStore, SECTION_BLUEPRINT_CATALOG, type UserSectionSelections } from '@/lib/ai/section-blueprints';
import { createStore, generateUniqueSlug } from '@/lib/store/store-service';
import { createSnapshot } from '@/lib/store/version-manager';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, selectedTemplateId, selectedSections, chosenSections, chosenTemplateId, customComponents, themeColors, typography, plan: providedPlan } = body;

    const effectiveSections = selectedSections || chosenSections;
    const effectiveTemplateId = selectedTemplateId || chosenTemplateId;

    if (!prompt && !providedPlan) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Mode 1: Custom Section Blueprint Assembly (Vendor chose individual components + custom components)
    if (effectiveSections) {
      const plan = providedPlan || (await planStore(prompt)).plan;
      const [contentResult, media] = await Promise.all([
        generateStoreContent(plan),
        generateStoreMedia(plan),
      ]);

      const layoutConfig = assembleCustomStore(
        plan,
        contentResult.content,
        media,
        effectiveSections as UserSectionSelections,
        themeColors,
        typography,
        customComponents
      );

      const slug = await generateUniqueSlug(plan.suggestedName);

      const store = await createStore({
        name: plan.suggestedName,
        slug,
        niche: plan.industry,
        description: plan.suggestedTagline,
        layout_config: layoutConfig,
        seo_config: {
          title: contentResult.content.seoTitle,
          description: contentResult.content.seoDescription,
          keywords: plan.seoKeywords,
        },
        commerce_config: {
          currency: plan.currency || "PKR",
          currencySymbol: "₨",
          codEnabled: true,
          freeShippingThreshold: 5000,
          escrowEnabled: true,
        },
      });

      try {
        await createSnapshot(store.id, 'ai_generate', `Custom Blueprint Store: ${plan.suggestedName}`);
      } catch {
        // Non-fatal in dev mode
      }

      const totalTokens = 3500 + contentResult.tokensUsed;
      const totalCost = 0.0035 + contentResult.costUsd;

      return NextResponse.json({ store, tokensUsed: totalTokens, costUsd: totalCost }, { status: 201 });
    }

    // Mode 2: Standard Template Previews Mode
    if (!effectiveTemplateId) {
      const { plan, tokensUsed: planTokens, costUsd: planCost } = await planStore(prompt);
      const { previews, tokensUsed, costUsd } = await generateTemplatePreviews(plan);
      return NextResponse.json({
        previews,
        plan,
        blueprints: SECTION_BLUEPRINT_CATALOG,
        tokensUsed: tokensUsed + planTokens,
        costUsd: costUsd + planCost
      });
    } 
    
    // Mode 3: Preset Template Final Mode
    const plan = providedPlan || (await planStore(prompt)).plan;
    const { store: generated, tokensUsed, costUsd } = await generateFinalStore(plan, effectiveTemplateId);
    
    const slug = await generateUniqueSlug(generated.name);
    
    const store = await createStore({
      name: generated.name,
      slug,
      niche: generated.niche,
      description: generated.description,
      layout_config: generated.layoutConfig,
      seo_config: generated.seoConfig,
      commerce_config: generated.commerceConfig,
    });

    try {
      await createSnapshot(store.id, 'ai_generate', `AI generated store: ${generated.name}`);
    } catch {
      // Non-fatal in dev mode
    }

    return NextResponse.json({ store, tokensUsed, costUsd }, { status: 201 });
  } catch (error: any) {
    console.error('Error generating store:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}

