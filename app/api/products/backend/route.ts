import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ProductsBackendService } from "@/services/products-backend-service";
import type { BackendProductStatus } from "@/types/backend-product";
import { getVendorContext } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") as BackendProductStatus) || undefined;
    const category_id = searchParams.get("category_id") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Resolve vendor_id: query param > session auth > reject — never use mock ID
    let vendor_id = searchParams.get("vendor_id") || request.headers.get("x-vendor-id");
    if (!vendor_id || vendor_id === "vendor_dev_123") {
      const ctx = await getVendorContext();
      if (ctx?.vendor?.id) {
        vendor_id = ctx.vendor.id;
      }
    }

    // CRITICAL: If no authenticated vendor, return empty — never use mock ID
    if (!vendor_id || vendor_id === "vendor_dev_123") {
      return NextResponse.json({ success: true, products: [], total: 0, performance: { queryTimeMs: 0, status: "EMPTY" } });
    }

    const startTime = performance.now();
    const result = await ProductsBackendService.getProducts({
      vendor_id,
      status,
      category_id,
      search,
      limit,
      offset,
    });
    const elapsedMs = Math.round(performance.now() - startTime);

    return NextResponse.json(
      {
        success: true,
        ...result,
        performance: {
          queryTimeMs: elapsedMs,
          status: elapsedMs < 200 ? "FAST (<200ms)" : "WARN",
        },
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

    // Resolve vendor_id: header > body > session — never use mock ID
    let vendor_id = request.headers.get("x-vendor-id") || body.vendor_id;
    if (!vendor_id || vendor_id === "vendor_dev_123") {
      const ctx = await getVendorContext();
      if (ctx?.vendor?.id) {
        vendor_id = ctx.vendor.id;
      }
    }

    if (!vendor_id || vendor_id === "vendor_dev_123") {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    if (!body.title || typeof body.price !== "number") {
      return NextResponse.json(
        { success: false, error: "Validation failed: 'title' (string) and 'price' (number) are required." },
        { status: 400 }
      );
    }

    const created = await ProductsBackendService.createProduct({
      ...body,
      vendor_id,
    });

    return NextResponse.json(
      {
        success: true,
        product: created,
        message: "Product created successfully",
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
