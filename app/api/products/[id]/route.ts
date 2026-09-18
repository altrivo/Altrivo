import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  updateProductInDatabase,
  deleteProductFromDatabase,
  toValidUUID,
} from "@/lib/product-db-sync";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    const prodId = toValidUUID(id);
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select(`
        id,
        vendor_id,
        name,
        title,
        description,
        category,
        price,
        compare_price,
        cost,
        image_url,
        tags,
        status,
        created_at,
        updated_at,
        product_variants (
          id,
          sku,
          price,
          stock,
          enabled,
          image_url
        )
      `)
      .eq("id", prodId)
      .single();

    if (error || !product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const simulateErrorHeader = request.headers.get("x-simulate-error");

    if (body.simulateError || simulateErrorHeader === "true" || body.price < 0 || body.stock < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection timeout or validation failure",
        },
        { status: 500 }
      );
    }

    const updatedFields: Record<string, any> = {};
    if (typeof body.price === "number") updatedFields.price = body.price;
    if (typeof body.stock === "number") updatedFields.stock = body.stock;
    if (typeof body.lowStockThreshold === "number") updatedFields.lowStockThreshold = body.lowStockThreshold;
    if (typeof body.status === "string") updatedFields.status = body.status;
    if (typeof body.name === "string") updatedFields.name = body.name;
    if (typeof body.title === "string") updatedFields.title = body.title;
    if (typeof body.description === "string") updatedFields.description = body.description;
    if (typeof body.category === "string") updatedFields.category = body.category;

    // Save directly to Supabase products & product_variants tables
    await updateProductInDatabase(id, updatedFields);

    return NextResponse.json(
      {
        success: true,
        id,
        updatedFields,
        updatedAt: new Date().toISOString(),
        message: "Product updated successfully in database",
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
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId") || searchParams.get("store_id") || undefined;

    const result = await deleteProductFromDatabase(id, storeId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to delete product from database" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        id,
        message: "Product deleted from database successfully",
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
