import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStoreById, updateLayoutConfig } from '@/lib/store/store-service';
import { applyStorePatch } from '@/lib/ai/patch-engine';
import { createSnapshot } from '@/lib/store/version-manager';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { storeId, message } = body;

    if (!storeId || !message) {
      return NextResponse.json({ error: 'storeId and message are required' }, { status: 400 });
    }

    const store = await getStoreById(storeId);
    
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    if (user && store.vendor_id && store.vendor_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const patchResult = await applyStorePatch(store.layout_config, message);

    if (patchResult.success) {
      await createSnapshot(storeId, 'ai_patch', message);
      await updateLayoutConfig(storeId, patchResult.updatedLayout);
    }

    return NextResponse.json({ 
      updatedLayout: patchResult.updatedLayout, 
      patches: patchResult.patches, 
      method: patchResult.method, 
      tokensUsed: patchResult.tokensUsed, 
      costUsd: patchResult.costUsd, 
      success: patchResult.success 
    });
  } catch (error: any) {
    console.error('Error in AI chat:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
