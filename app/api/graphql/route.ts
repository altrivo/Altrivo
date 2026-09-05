import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ProductsBackendService } from "@/services/products-backend-service";
import type { BackendProductStatus } from "@/types/backend-product";

export async function POST(request: NextRequest) {
  try {
    const { query, variables } = await request.json();
    const vendor_id = request.headers.get("x-vendor-id") || "vendor_dev_123";

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { errors: [{ message: "GraphQL request must include a valid 'query' string." }] },
        { status: 400 }
      );
    }

    const trimmed = query.trim();

    // 1. Query: products
    if (trimmed.includes("query") && trimmed.includes("products")) {
      const result = await ProductsBackendService.getProducts({
        vendor_id: variables?.vendor_id || vendor_id,
        status: (variables?.status as BackendProductStatus) || undefined,
        category_id: variables?.category_id || undefined,
        search: variables?.search || undefined,
        limit: variables?.limit || 20,
        offset: variables?.offset || 0,
      });

      return NextResponse.json({
        data: {
          products: result.data,
          totalCount: result.total,
        },
      });
    }

    // 2. Query: product(id: ...)
    if (trimmed.includes("query") && trimmed.includes("product(")) {
      const id = variables?.id;
      if (!id) {
        return NextResponse.json({ errors: [{ message: "Variable 'id' is required for product query." }] });
      }

      const product = await ProductsBackendService.getProductById(id, vendor_id);
      return NextResponse.json({
        data: { product },
      });
    }

    // 3. Mutation: createProduct
    if (trimmed.includes("mutation") && trimmed.includes("createProduct")) {
      const input = variables?.input || {};
      const created = await ProductsBackendService.createProduct({
        ...input,
        vendor_id,
      });

      return NextResponse.json({
        data: { createProduct: created },
      });
    }

    // 4. Mutation: updateProduct
    if (trimmed.includes("mutation") && trimmed.includes("updateProduct")) {
      const id = variables?.id;
      const input = variables?.input || {};
      const updated = await ProductsBackendService.updateProduct(id, input, vendor_id);

      return NextResponse.json({
        data: { updateProduct: updated },
      });
    }

    // 5. Mutation: deleteProduct
    if (trimmed.includes("mutation") && trimmed.includes("deleteProduct")) {
      const id = variables?.id;
      const deleted = await ProductsBackendService.deleteProduct(id, vendor_id);

      return NextResponse.json({
        data: { deleteProduct: deleted },
      });
    }

    // Default fallback handler for introspection / custom queries
    const defaultProducts = await ProductsBackendService.getProducts({ vendor_id });
    return NextResponse.json({
      data: {
        products: defaultProducts.data,
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { errors: [{ message: errorMessage }] },
      { status: 500 }
    );
  }
}
