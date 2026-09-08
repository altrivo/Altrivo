/**
 * DigiShop AI — Auth Helpers for API Routes
 *
 * Provides extraction helpers for API routes that receive requests.
 * Replaces the old fake JWT token validation with real Supabase auth.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  getServerSession,
  getVendorContext,
  getCustomerContext,
  requireVendor,
  requireCustomer,
  requireVendorStoreAccess,
  AuthError,
  type AuthUser,
  type VendorContext,
  type CustomerContext,
} from "./session";

// Re-export session types and helpers for convenience
export type { AuthUser, VendorContext, CustomerContext };
export { AuthError, getServerSession, getVendorContext, getCustomerContext };

// ─── Legacy Compatibility (for existing code that imports from jwtAuth) ──────

export interface VendorJwtPayload {
  vendorId: string;
  storeName: string;
  email: string;
  role: "vendor" | "admin";
}

/**
 * Verify vendor authentication from a request.
 * Replaces the old hardcoded token lookup with real Supabase session verification.
 * Returns null if not authenticated.
 */
export async function verifyVendorJwt(req: NextRequest): Promise<VendorJwtPayload | null> {
  try {
    const vendorCtx = await getVendorContext();
    if (!vendorCtx) return null;

    return {
      vendorId: vendorCtx.vendor.id,
      storeName: vendorCtx.stores[0]?.name || "My Store",
      email: vendorCtx.vendor.email,
      role: "vendor",
    };
  } catch {
    return null;
  }
}

// ─── API Route Wrappers ──────────────────────────────────────────────────────

/**
 * Wrap an API route handler with vendor authentication.
 * Provides the vendor context to the handler function.
 */
export function withVendorAuth(
  handler: (req: NextRequest, ctx: VendorContext) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const vendorCtx = await requireVendor();
      return await handler(req, vendorCtx);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode }
        );
      }
      return NextResponse.json(
        { success: false, error: "Authentication failed" },
        { status: 401 }
      );
    }
  };
}

/**
 * Wrap an API route handler with vendor + store ownership verification.
 */
export function withVendorStoreAuth(
  handler: (req: NextRequest, ctx: VendorContext, storeId: string) => Promise<NextResponse>
) {
  return async (req: NextRequest, routeCtx: { params: Promise<{ storeId: string }> }) => {
    try {
      const { storeId } = await routeCtx.params;
      const vendorCtx = await requireVendorStoreAccess(storeId);
      return await handler(req, vendorCtx, storeId);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode }
        );
      }
      return NextResponse.json(
        { success: false, error: "Authentication failed" },
        { status: 401 }
      );
    }
  };
}

/**
 * Wrap an API route handler with customer + store scope verification.
 */
export function withCustomerAuth(
  handler: (req: NextRequest, ctx: CustomerContext) => Promise<NextResponse>,
  storeIdSource: "header" | "query" | "body" = "header"
) {
  return async (req: NextRequest) => {
    try {
      let storeId: string | null = null;

      if (storeIdSource === "header") {
        storeId = req.headers.get("x-store-id");
      } else if (storeIdSource === "query") {
        storeId = req.nextUrl.searchParams.get("store_id");
      }

      if (!storeId) {
        return NextResponse.json(
          { success: false, error: "Store context required" },
          { status: 400 }
        );
      }

      const customerCtx = await requireCustomer(storeId);
      return await handler(req, customerCtx);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode }
        );
      }
      return NextResponse.json(
        { success: false, error: "Authentication failed" },
        { status: 401 }
      );
    }
  };
}
