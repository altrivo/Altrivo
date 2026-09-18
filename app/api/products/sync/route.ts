import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { syncProductsToDatabase, resolveStoreVendor } from "@/lib/product-db-sync";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const products = Array.isArray(body.products) ? body.products : Array.isArray(body) ? body : [];

    if (products.length === 0) {
      return NextResponse.json({ success: true, syncedCount: 0 });
    }

    const storeId = body.storeId || body.store_id || products[0]?.storeId || undefined;
    let vendorId = body.vendorId || body.vendor_id || request.headers.get("x-vendor-id") || undefined;

    if (!vendorId && storeId) {
      vendorId = await resolveStoreVendor(storeId);
    }

    if (!vendorId) {
      try {
        const cookieStore = await cookies();
        vendorId = cookieStore.get("active_vendor_id")?.value || undefined;
      } catch {}
    }

    const result = await syncProductsToDatabase(
      vendorId || "374c6044-19d9-49db-a508-dccf3c1f6f2f",
      storeId || "",
      products
    );

    return NextResponse.json(
      {
        success: result.success,
        syncedCount: result.syncedCount,
        message: `Synced ${result.syncedCount} products to database successfully`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
