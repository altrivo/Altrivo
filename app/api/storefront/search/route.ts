import { NextResponse, NextRequest } from "next/server";
import { searchVendorProducts } from "@/lib/storefront/searchRepository";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const vendorId =
      searchParams.get("vendorId") || req.headers.get("x-vendor-id") || "v-default";
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);

    const offset = (page - 1) * limit;

    // Execute Postgres full-text + trigram similarity search (<200ms SLA)
    const { products, totalCount, executionTimeMs } = await searchVendorProducts(
      vendorId,
      query,
      limit,
      offset
    );

    return NextResponse.json(
      {
        success: true,
        query,
        vendorId,
        page,
        limit,
        totalCount,
        executionTimeMs,
        isSlaCompliant: executionTimeMs < 200,
        products,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Storefront Search Error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute storefront search query",
      },
      { status: 500 }
    );
  }
}
