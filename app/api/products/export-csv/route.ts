import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ProductsBackendService } from "@/services/products-backend-service";
import type { BackendProductStatus } from "@/types/backend-product";
import { escapeCsvValue } from "@/utils/csv-product-parser";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendor_id = searchParams.get("vendor_id") || request.headers.get("x-vendor-id") || "vendor_dev_123";
    const status = (searchParams.get("status") as BackendProductStatus) || undefined;
    const category_id = searchParams.get("category_id") || undefined;
    const search = searchParams.get("search") || undefined;

    // Fetch filtered products
    const result = await ProductsBackendService.getProducts({
      vendor_id,
      status,
      category_id,
      search,
      limit: 10000,
    });

    const products = result.data;

    const headers = [
      "ID",
      "VendorID",
      "Title",
      "SKU",
      "Category",
      "Price",
      "ComparePrice",
      "Cost",
      "Stock",
      "Status",
      "Tags",
      "SEOSlug",
      "CreatedAt",
    ];

    const encoder = new TextEncoder();

    // Create ReadableStream to stream CSV response without Out-Of-Memory (OOM) risk
    const stream = new ReadableStream({
      async start(controller) {
        // Enqueue CSV Header
        controller.enqueue(encoder.encode(headers.join(",") + "\n"));

        for (const p of products) {
          const variants = p.variants && p.variants.length > 0 ? p.variants : [{ sku: `SKU-${p.id}`, stock: 10, price: p.price }];

          for (const v of variants) {
            const row = [
              escapeCsvValue(p.id),
              escapeCsvValue(p.vendor_id),
              escapeCsvValue(p.title),
              escapeCsvValue(v.sku),
              escapeCsvValue(p.category_id || "General"),
              escapeCsvValue(v.price || p.price),
              escapeCsvValue(p.compare_price || 0),
              escapeCsvValue(p.cost || 0),
              escapeCsvValue(v.stock ?? 0),
              escapeCsvValue(p.status),
              escapeCsvValue(p.tags || []),
              escapeCsvValue(p.seo_slug),
              escapeCsvValue(p.created_at),
            ];

            controller.enqueue(encoder.encode(row.join(",") + "\n"));
          }
        }

        controller.close();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="products_export_${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
