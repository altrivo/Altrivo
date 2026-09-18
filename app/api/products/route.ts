import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  fetchProductsFromDatabase,
  createOrUpdateProductInDatabase,
  resolveStoreVendor,
} from "@/lib/product-db-sync";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId") || searchParams.get("store_id") || undefined;
    let vendorId = searchParams.get("vendorId") || searchParams.get("vendor_id") || request.headers.get("x-vendor-id") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    if (!vendorId && storeId) {
      const resolved = await resolveStoreVendor(storeId);
      if (resolved) vendorId = resolved;
    }

    if (!vendorId) {
      try {
        const cookieStore = await cookies();
        vendorId = cookieStore.get("active_vendor_id")?.value || undefined;
      } catch {}
    }

    const products = await fetchProductsFromDatabase({
      vendorId,
      storeId,
      status,
      search,
    });

    return NextResponse.json(
      {
        success: true,
        products,
        total: products.length,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const title = body.title || body.name;
    if (!title) {
      return NextResponse.json(
        { success: false, error: "Product title/name is required" },
        { status: 400 }
      );
    }

    let vendorId = body.vendor_id || body.vendorId || request.headers.get("x-vendor-id") || undefined;
    const storeId = body.storeId || body.store_id || undefined;

    if (!vendorId && storeId) {
      vendorId = await resolveStoreVendor(storeId);
    }

    if (!vendorId) {
      try {
        const cookieStore = await cookies();
        vendorId = cookieStore.get("active_vendor_id")?.value || undefined;
      } catch {}
    }

    // Save directly to Supabase products & product_variants tables
    const result = await createOrUpdateProductInDatabase(body, storeId, vendorId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to save product in database" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        product: result.product,
        message: "Product saved to database products table successfully",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
