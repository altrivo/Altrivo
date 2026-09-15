import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getStoreById, updateStore, deleteStore } from '@/lib/store/store-service';
import { createSnapshot } from '@/lib/store/version-manager';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const store = await getStoreById(id);
    
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    if (user && store.vendor_id && store.vendor_id !== user.id && store.vendor_id !== "vendor_dev_123") {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ store });
  } catch (error: any) {
    console.error('Error fetching store:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const store = await getStoreById(id);
    
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    if (user && store.vendor_id && store.vendor_id !== user.id && store.vendor_id !== "vendor_dev_123" && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await req.json();
    
    if (updates.layout_config && JSON.stringify(updates.layout_config) !== JSON.stringify(store.layout_config)) {
      try {
        await createSnapshot(store.id || id, 'manual_edit', 'Manual layout update');
      } catch (snapErr) {
        console.warn('[PATCH /api/stores/[id]] Snapshot warning:', snapErr);
      }
    }

    const updatedStore = await updateStore(id, updates);
    return NextResponse.json({ store: updatedStore });
  } catch (error: any) {
    console.error('Error updating store:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const store = await getStoreById(id);
    
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    
    let authedVendorId: string | null = user?.id || null;
    if (!authedVendorId) {
      try {
        const cookieStore = await cookies();
        authedVendorId = cookieStore.get("active_vendor_id")?.value || null;
      } catch {}
    }

    if (authedVendorId && store.vendor_id && store.vendor_id !== authedVendorId && store.vendor_id !== "vendor_dev_123") {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteStore(id);
    return NextResponse.json({ success: true, message: 'Store and all associated data permanently deleted' });
  } catch (error: any) {
    console.error('Error deleting store:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
