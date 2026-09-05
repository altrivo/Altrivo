import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ProductsBackendService } from "@/services/products-backend-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendor_id = request.headers.get("x-vendor-id") || "vendor_dev_123";

    const product = await ProductsBackendService.getProductById(id, vendor_id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found or access denied (RLS)" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, product },
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
    const vendor_id = request.headers.get("x-vendor-id") || "vendor_dev_123";
    const body = await request.json();

    const updated = await ProductsBackendService.updateProduct(id, body, vendor_id);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Product not found or update unauthorized (RLS)" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        product: updated,
        message: "Product updated successfully",
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendor_id = request.headers.get("x-vendor-id") || "vendor_dev_123";

    const deleted = await ProductsBackendService.deleteProduct(id, vendor_id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Product not found or delete unauthorized (RLS)" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, id, message: "Product deleted successfully" },
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
