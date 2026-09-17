import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateProductInDatabase } from "@/lib/product-db-sync";

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

    const updatedFields: Record<string, number> = {};
    if (typeof body.price === "number") updatedFields.price = body.price;
    if (typeof body.stock === "number") updatedFields.stock = body.stock;
    if (typeof body.lowStockThreshold === "number")
      updatedFields.lowStockThreshold = body.lowStockThreshold;

    // Save directly to Supabase products & product_variants tables
    await updateProductInDatabase(id, {
      price: updatedFields.price,
      stock: updatedFields.stock,
      lowStockThreshold: updatedFields.lowStockThreshold,
    });

    return NextResponse.json(
      {
        success: true,
        id,
        updatedFields,
        updatedAt: new Date().toISOString(),
        message: "Inventory item updated successfully in database",
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
