import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStoreById, publishStore } from '@/lib/store/store-service';
import { validateStoreConfig } from '@/lib/ai/store-validator';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = await getStoreById(id);
    
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    if (store.vendor_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const validationResult = validateStoreConfig(store.layout_config);
    if (!validationResult.valid) {
      return NextResponse.json({ error: 'Invalid store configuration', details: validationResult.errors }, { status: 422 });
    }

    const publishedStore = await publishStore(id);
    const url = `https://${publishedStore.subdomain || publishedStore.slug}.digishop.ai`;

    return NextResponse.json({ store: publishedStore, url });
  } catch (error: any) {
    console.error('Error publishing store:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
