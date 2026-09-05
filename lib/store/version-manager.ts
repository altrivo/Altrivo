import { createClient } from '@/lib/supabase/server';
import { getStoreById } from './store-service';
import type { StoreRow } from './store-service';

export interface StoreVersion {
  id: string;
  store_id: string;
  version_number: number;
  layout_snapshot: any;
  operation_type: string;
  operation_summary: string | null;
  actor_id: string | null;
  created_at: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getLatestVersionNumber(storeId: string): Promise<number> {
  if (!storeId || !UUID_REGEX.test(storeId)) return 0;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('store_versions')
      .select('version_number')
      .eq('store_id', storeId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return 0;
      return 0;
    }

    return data?.version_number || 0;
  } catch {
    return 0;
  }
}

export async function createSnapshot(storeId: string, operationType: string, summary?: string): Promise<StoreVersion | null> {
  try {
    // Get current store layout
    const store = await getStoreById(storeId);
    if (!store) {
      return null;
    }

    const actualStoreUuid = store.id && UUID_REGEX.test(store.id) ? store.id : null;
    if (!actualStoreUuid) {
      // Non-UUID local store, skip DB versioning
      return null;
    }

    const supabase = await createClient();
    const latestVersion = await getLatestVersionNumber(actualStoreUuid);
    const nextVersionNumber = latestVersion + 1;

    const { data: userData } = await supabase.auth.getUser();

    const payload = {
      store_id: actualStoreUuid,
      version_number: nextVersionNumber,
      layout_snapshot: store.layout_config,
      operation_type: operationType,
      operation_summary: summary || null,
      actor_id: userData?.user?.id || null,
    };

    const { data, error } = await supabase
      .from('store_versions')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn(`[version-manager] Failed to insert snapshot: ${error.message}`);
      return null;
    }

    return data as StoreVersion;
  } catch (err) {
    console.warn('[version-manager] createSnapshot error:', err);
    return null;
  }
}

export async function getVersionHistory(storeId: string, limit: number = 50): Promise<StoreVersion[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('store_versions')
    .select('*')
    .eq('store_id', storeId)
    .order('version_number', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get version history: ${error.message}`);
  }

  return data as StoreVersion[];
}

export async function getVersion(storeId: string, versionNumber: number): Promise<StoreVersion | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('store_versions')
    .select('*')
    .eq('store_id', storeId)
    .eq('version_number', versionNumber)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get version: ${error.message}`);
  }

  return data as StoreVersion;
}

export async function restoreVersion(storeId: string, versionNumber: number): Promise<StoreRow> {
  const supabase = await createClient();
  
  // Get the target version
  const targetVersion = await getVersion(storeId, versionNumber);
  if (!targetVersion) {
    throw new Error(`Version ${versionNumber} for store ${storeId} not found`);
  }

  // Update store with the restored layout
  const { data: updatedStore, error: updateError } = await supabase
    .from('stores')
    .update({ layout_config: targetVersion.layout_snapshot })
    .eq('id', storeId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to restore version layout to store: ${updateError.message}`);
  }

  // Create a new snapshot for this restore action
  await createSnapshot(storeId, 'restore', `Restored to version ${versionNumber}`);

  return updatedStore as StoreRow;
}
