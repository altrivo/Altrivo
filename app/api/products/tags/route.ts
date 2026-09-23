import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { CategoriesBackendService } from "@/services/categories-backend-service";
import { getVendorContext } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  try {
    const { searchParams } = new URL(request.url);
    let vendor_id = searchParams.get("vendor_id") || request.headers.get("x-vendor-id");
    if (!vendor_id || vendor_id === "vendor_dev_123") {
      try {
        const ctx = await getVendorContext();
        if (ctx?.vendor?.id) {
          vendor_id = ctx.vendor.id;
        }
      } catch {}
    }

    if (!vendor_id || vendor_id === "vendor_dev_123") {
      return NextResponse.json({ success: true, query: "", tags: [], total: 0 });
    }
    const q = searchParams.get("q") || searchParams.get("query") || "";

    const tags = await CategoriesBackendService.searchTags(q, vendor_id);
    const elapsedMs = Math.round(performance.now() - startTime);

    return NextResponse.json(
      {
        success: true,
        query: q,
        tags,
        total: tags.length,
        performance: {
          searchTimeMs: elapsedMs,
          sla: elapsedMs < 100 ? "PASS (<100ms GIN Index SLA)" : "WARN",
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
