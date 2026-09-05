import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ProductsBackendService } from "@/services/products-backend-service";
import type { BackendProductStatus } from "@/types/backend-product";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendor_id = searchParams.get("vendor_id") || request.headers.get("x-vendor-id") || "vendor_dev_123";
    const status = (searchParams.get("status") as BackendProductStatus) || undefined;
    const category_id = searchParams.get("category_id") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

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
    const vendor_id = request.headers.get("x-vendor-id") || body.vendor_id || "vendor_dev_123";

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
