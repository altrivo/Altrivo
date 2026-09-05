import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getVendorStores, createStore, generateUniqueSlug } from '@/lib/store/store-service';
import { createSnapshot } from '@/lib/store/version-manager';

export async function GET(req: Request) {
  try {
    const stores = await getVendorStores();
    return NextResponse.json({ stores });
  } catch (error: any) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ stores: [] });
  }
}

export async function POST(req: Request) {
  try {

    const body = await req.json();
    const { name, slug, niche, description, layout_config } = body;

    if (!name || !layout_config) {
      return NextResponse.json({ error: 'Missing required fields: name, layout_config' }, { status: 400 });
    }

    const finalSlug = slug || await generateUniqueSlug(name);

    const store = await createStore({
      name,
      slug: finalSlug,
      niche,
      description,
      layout_config
    });

    await createSnapshot(store.id, 'ai_generate', 'Initial store creation');

    return NextResponse.json({ store }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating store:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
