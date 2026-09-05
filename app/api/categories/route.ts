import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { CategoriesBackendService } from "@/services/categories-backend-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendor_id = searchParams.get("vendor_id") || request.headers.get("x-vendor-id") || "vendor_dev_123";
    const format = (searchParams.get("format") as "tree" | "flat") || "tree";

    const categories = await CategoriesBackendService.getCategories(vendor_id, format);

    return NextResponse.json(
      {
        success: true,
        vendorId: vendor_id,
        format,
        categories,
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
    const body = await request.json().catch(() => ({}));
    const vendor_id = request.headers.get("x-vendor-id") || body.vendorId || "vendor_dev_123";

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Validation error: 'name' is required." },
        { status: 400 }
      );
    }

    const created = await CategoriesBackendService.createCategory({
      ...body,
      vendorId: vendor_id,
    });

    return NextResponse.json(
      {
        success: true,
        category: created,
        message: "Category created successfully",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    const status = errorMessage.includes("Maximum category nesting depth") ? 400 : 500;
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status }
    );
  }
}
