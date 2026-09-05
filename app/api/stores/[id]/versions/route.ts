import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStoreById } from '@/lib/store/store-service';
import { getVersionHistory, restoreVersion } from '@/lib/store/version-manager';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const url = new URL(req.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const versions = await getVersionHistory(id, limit);
    return NextResponse.json({ versions });
  } catch (error: any) {
    console.error('Error fetching version history:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

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

    const body = await req.json();
    const { versionNumber } = body;
    
    if (typeof versionNumber !== 'number') {
      return NextResponse.json({ error: 'Invalid version number' }, { status: 400 });
    }

    const restoredStore = await restoreVersion(id, versionNumber);
    return NextResponse.json({ store: restoredStore, restoredVersion: versionNumber });
  } catch (error: any) {
    console.error('Error restoring version:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
