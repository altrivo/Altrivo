/**
 * DigiShop AI — Server-Side Session & Auth Helpers
 * 
 * Replaces the fake JWT auth with real Supabase session verification.
 * Used by API routes and server components to authenticate requests.
 */
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: "vendor" | "customer" | "admin";
  user_metadata: Record<string, any>;
}

export interface VendorContext {
  user: AuthUser;
  vendor: {
    id: string;
    name: string;
    business_name: string | null;
    email: string;
    phone: string | null;
    status: "pending" | "active" | "suspended" | "rejected";
  };
  stores: Array<{
    id: string;
    name: string;
    slug: string;
    is_published: boolean;
  }>;
}

export interface CustomerContext {
  user: AuthUser;
  customer: {
    id: string;
    store_id: string;
    auth_user_id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  storeId: string;
}

// ─── Core Session Retrieval ──────────────────────────────────────────────────

/**
 * Get the current authenticated user from Supabase session.
 * Works in server components and API routes that use cookies.
 * Returns null if no valid session exists.
 */
export async function getServerSession(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const role = user.user_metadata?.role || "customer";

    return {
      id: user.id,
      email: user.email || "",
      role,
      user_metadata: user.user_metadata || {},
    };
  } catch {
    return null;
  }
}

/**
 * Require authentication — throws/returns 401 context if no session.
 * Use in API routes that must be authenticated.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getServerSession();
  if (!user) {
    throw new AuthError("Authentication required", 401);
  }
  return user;
}

// ─── Vendor Context ──────────────────────────────────────────────────────────

/**
 * Get full vendor context: user + vendor profile + owned stores.
 * Returns null if user is not a vendor or vendor profile doesn't exist.
 */
export async function getVendorContext(): Promise<VendorContext | null> {
  const user = await getServerSession();
  if (!user) return null;

  const db = supabaseAdmin;
  if (!db) return null;

  try {
    // Fetch vendor profile (vendors.id = auth.users.id)
    const { data: vendor, error: vendorError } = await db
      .from("vendors")
      .select("id, name, business_name, email, phone, status")
      .eq("id", user.id)
      .maybeSingle();

    if (vendorError || !vendor) return null;

    // Fetch vendor's stores
    const { data: stores } = await db
      .from("stores")
      .select("id, name, slug, is_published")
      .eq("vendor_id", user.id)
      .order("created_at", { ascending: false });

    return {
      user: { ...user, role: "vendor" },
      vendor,
      stores: stores || [],
    };
  } catch {
    return null;
  }
}

/**
 * Require vendor authentication with active status.
 * Throws AuthError if not a vendor or vendor is not active.
 */
export async function requireVendor(): Promise<VendorContext> {
  const ctx = await getVendorContext();
  if (!ctx) {
    throw new AuthError("Vendor access required", 403);
  }
  if (ctx.vendor.status !== "active" && ctx.vendor.status !== "pending") {
    throw new AuthError(
      `Vendor account is ${ctx.vendor.status}. Contact support.`,
      403
    );
  }
  return ctx;
}

/**
 * Require vendor owns a specific store.
 */
export async function requireVendorStoreAccess(storeId: string): Promise<VendorContext> {
  const ctx = await requireVendor();
  const ownsStore = ctx.stores.some((s) => s.id === storeId);

  if (!ownsStore) {
    // Double-check in DB in case stores list was stale
    const db = supabaseAdmin;
    if (db) {
      const { data: store } = await db
        .from("stores")
        .select("id")
        .eq("id", storeId)
        .eq("vendor_id", ctx.user.id)
        .maybeSingle();

      if (!store) {
        throw new AuthError("Access denied: you do not own this store", 403);
      }
    } else {
      throw new AuthError("Access denied: you do not own this store", 403);
    }
  }

  return ctx;
}

// ─── Customer Context ────────────────────────────────────────────────────────

/**
 * Get customer context scoped to a specific store.
 * Creates or resolves the store_customers record for (auth_user_id + store_id).
 */
export async function getCustomerContext(storeId: string): Promise<CustomerContext | null> {
  const user = await getServerSession();
  if (!user) return null;

  const db = supabaseAdmin;
  if (!db) return null;

  try {
    // Look up the store_customer record for this user + store
    const { data: customer, error } = await db
      .from("store_customers")
      .select("id, store_id, auth_user_id, name, email, phone")
      .eq("auth_user_id", user.id)
      .eq("store_id", storeId)
      .maybeSingle();

    if (error || !customer) return null;

    return {
      user: { ...user, role: "customer" },
      customer,
      storeId,
    };
  } catch {
    return null;
  }
}

/**
 * Require customer authentication for a specific store.
 */
export async function requireCustomer(storeId: string): Promise<CustomerContext> {
  const ctx = await getCustomerContext(storeId);
  if (!ctx) {
    throw new AuthError("Customer access required for this store", 403);
  }
  return ctx;
}

// ─── Auth Error ──────────────────────────────────────────────────────────────

export class AuthError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

/**
 * Helper to extract auth user from a NextRequest's Authorization header.
 * Used for API routes that receive tokens (e.g., from mobile/external clients).
 * Falls back to cookie-based session if no header is present.
 */
export async function getAuthFromRequest(req: NextRequest): Promise<AuthUser | null> {
  // First try cookie-based session (primary for web)
  const sessionUser = await getServerSession();
  if (sessionUser) return sessionUser;

  // Fallback: check vendor cookie (legacy compatibility)
  const vendorCookie = req.cookies.get("active_vendor_id");
  if (vendorCookie?.value && supabaseAdmin) {
    try {
      const { data: vendor } = await supabaseAdmin
        .from("vendors")
        .select("id, email")
        .eq("id", vendorCookie.value)
        .maybeSingle();

      if (vendor) {
        return {
          id: vendor.id,
          email: vendor.email,
          role: "vendor",
          user_metadata: { role: "vendor" },
        };
      }
    } catch {
      // Cookie value invalid
    }
  }

  return null;
}
