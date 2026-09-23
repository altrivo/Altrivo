import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { CategoriesBackendService } from "@/services/categories-backend-service";
import { getVendorContext } from "@/lib/auth/session";

async function resolveVendorId(request: NextRequest): Promise<string | null> {
  let vendor_id = request.headers.get("x-vendor-id");
  if (!vendor_id || vendor_id === "vendor_dev_123") {
    try {
      const ctx = await getVendorContext();
      if (ctx?.vendor?.id) {
        vendor_id = ctx.vendor.id;
      }
    } catch {}
  }
  if (!vendor_id || vendor_id === "vendor_dev_123") return null;
  return vendor_id;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendor_id = await resolveVendorId(request);
    if (!vendor_id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const category = await CategoriesBackendService.getCategoryById(id, vendor_id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, category },
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendor_id = await resolveVendorId(request);
    if (!vendor_id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    const body = await request.json().catch(() => ({}));

    const updated = await CategoriesBackendService.updateCategory(id, body, vendor_id);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Category not found or update unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        category: updated,
        message: "Category updated successfully",
      },
      { status: 200 }
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendor_id = await resolveVendorId(request);
    if (!vendor_id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const deleted = await CategoriesBackendService.deleteCategory(id, vendor_id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, id, message: "Category deleted successfully" },
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
