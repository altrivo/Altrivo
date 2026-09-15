import fs from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase";
import { StoreCustomer } from "@/types/customer";
import { getStoreById, getStoreBySlug, getVendorStores } from "@/lib/store/store-service";

const DATA_DIR = path.join(process.cwd(), ".data");
const CUSTOMERS_FILE = path.join(DATA_DIR, "store_customers.json");

function ensureFile(): StoreCustomer[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CUSTOMERS_FILE)) {
      fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const raw = fs.readFileSync(CUSTOMERS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("[customer-store] File read error:", err);
    return [];
  }
}

function persistToFile(customers: StoreCustomer[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), "utf-8");
  } catch (err) {
    console.warn("[customer-store] File write error:", err);
  }
}

/**
 * Resolve any store identifier (UUID, slug, name) to its standard { id, slug, name }
 */
export async function resolveStoreInfo(identifier: string): Promise<{ id: string; slug: string; name: string } | null> {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();

  try {
    const bySlug = await getStoreBySlug(clean);
    if (bySlug) {
      return { id: bySlug.id, slug: bySlug.slug, name: bySlug.name };
    }
    const byId = await getStoreById(identifier);
    if (byId) {
      return { id: byId.id, slug: byId.slug, name: byId.name };
    }
    const all = await getVendorStores();
    const found = all.find(
      (s) =>
        s.id?.toLowerCase() === clean ||
        s.slug?.toLowerCase() === clean ||
        s.name?.toLowerCase() === clean ||
        s.subdomain?.toLowerCase() === clean
    );
    if (found) {
      return { id: found.id, slug: found.slug, name: found.name };
    }
  } catch (err) {
    console.warn("[customer-store] Store resolution error:", err);
  }
  return null;
}

/**
 * Find a customer strictly registered for a specific store.
 */
export async function findStoreCustomer(storeIdentifier: string, email: string): Promise<StoreCustomer | null> {
  const cleanEmail = email.trim().toLowerCase();
  const storeInfo = await resolveStoreInfo(storeIdentifier);
  const targetStoreId = storeInfo?.id || storeIdentifier;
  const targetSlug = (storeInfo?.slug || storeIdentifier).toLowerCase();

  // 1. Check database via supabaseAdmin
  if (supabaseAdmin) {
    try {
      const { data: byId } = await supabaseAdmin
        .from("store_customers")
        .select("*")
        .eq("store_id", targetStoreId)
        .eq("email", cleanEmail)
        .maybeSingle();

      if (byId) {
        return {
          ...byId,
          store_id: targetStoreId,
          store_slug: storeInfo?.slug || byId.store_slug,
          store_name: storeInfo?.name || byId.store_name,
        };
      }

      // Check by store slug if store_id was stored as slug
      if (targetSlug && targetSlug !== targetStoreId) {
        const { data: bySlug } = await supabaseAdmin
          .from("store_customers")
          .select("*")
          .eq("store_id", targetSlug)
          .eq("email", cleanEmail)
          .maybeSingle();

        if (bySlug) {
          return {
            ...bySlug,
            store_id: targetStoreId,
            store_slug: targetSlug,
            store_name: storeInfo?.name || bySlug.store_name,
          };
        }
      }
    } catch (dbErr) {
      console.warn("[customer-store] DB lookup fallback:", dbErr);
    }
  }

  // 2. Check local persistent store
  const localList = ensureFile();
  const match = localList.find((c) => {
    if (c.email.trim().toLowerCase() !== cleanEmail) return false;
    const cStoreId = (c.store_id || "").toLowerCase();
    const cStoreSlug = (c.store_slug || "").toLowerCase();
    return (
      cStoreId === targetStoreId.toLowerCase() ||
      cStoreSlug === targetSlug ||
      cStoreId === targetSlug ||
      c.store_id === storeIdentifier
    );
  });

  if (match) {
    return {
      ...match,
      store_id: targetStoreId,
      store_slug: targetSlug,
      store_name: storeInfo?.name || match.store_name,
    };
  }

  return null;
}

/**
 * Persist store customer to DB and local backup
 */
export async function saveStoreCustomer(customer: StoreCustomer): Promise<void> {
  // 1. Save to local file
  const localList = ensureFile();
  const existingIdx = localList.findIndex(
    (c) =>
      c.email.trim().toLowerCase() === customer.email.trim().toLowerCase() &&
      (c.store_id === customer.store_id || c.store_slug === customer.store_slug)
  );

  if (existingIdx >= 0) {
    localList[existingIdx] = { ...localList[existingIdx], ...customer, updated_at: new Date().toISOString() };
  } else {
    localList.push(customer);
  }
  persistToFile(localList);

  // 2. Save to Supabase table
  if (supabaseAdmin) {
    try {
      await supabaseAdmin.from("store_customers").upsert({
        id: customer.id,
        store_id: customer.store_id,
        auth_user_id: customer.auth_user_id || customer.id,
        name: customer.name,
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone || "",
        created_at: customer.created_at || new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn("[customer-store] DB upsert notice:", dbErr);
    }
  }
}
