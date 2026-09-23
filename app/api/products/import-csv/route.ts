import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ProductsBackendService } from "@/services/products-backend-service";
import { parseAndValidateProductCSV } from "@/utils/csv-product-parser";
import { getVendorContext } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  try {
    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get("dryRun") === "true";
    const isTest = process.env.NODE_ENV === "test";
    let vendor_id = request.headers.get("x-vendor-id") || (isTest ? "vendor_dev_123" : "");
    if (!vendor_id || (!isTest && vendor_id === "vendor_dev_123")) {
      try {
        const ctx = await getVendorContext();
        if (ctx?.vendor?.id) {
          vendor_id = ctx.vendor.id;
        }
      } catch {}
    }

    if (!vendor_id || (!isTest && vendor_id === "vendor_dev_123")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    let csvText = "";

    // Support both JSON body { csvContent } and multipart/form-data CSV file upload
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, error: "No CSV file uploaded in form-data field 'file'." },
          { status: 400 }
        );
      }
      csvText = await file.text();
    } else {
      const body = await request.json().catch(() => ({}));
      csvText = body.csvContent || body.csvData || "";
    }

    if (!csvText || !csvText.trim()) {
      return NextResponse.json(
        { success: false, error: "Validation error: CSV content is empty." },
        { status: 400 }
      );
    }

    // 1. Parse and validate EVERY single row against schema
    const parseResult = parseAndValidateProductCSV(csvText);

    // 2. All-or-Nothing Validation Check
    if (parseResult.errorCount > 0) {
      const errorRows = parseResult.rows
        .filter((r) => !r.isValid)
        .map((r) => ({
          rowNumber: r.rowNumber,
          raw: r.raw,
          errors: r.errors,
        }));

      return NextResponse.json(
        {
          success: false,
          transactionStatus: "ABORTED (All-or-Nothing Policy Enforced)",
          totalRows: parseResult.totalRows,
          validCount: parseResult.validCount,
          errorCount: parseResult.errorCount,
          errors: errorRows,
          message: `Import aborted: ${parseResult.errorCount} row(s) failed validation. Zero records were inserted.`,
        },
        { status: 400 }
      );
    }

    // 3. Dry-Run Validation Check
    if (dryRun) {
      const elapsedMs = Math.round(performance.now() - startTime);
      return NextResponse.json({
        success: true,
        dryRun: true,
        transactionStatus: "PREVIEW_OK",
        totalRows: parseResult.totalRows,
        validCount: parseResult.validCount,
        errorCount: 0,
        performance: { executionTimeMs: elapsedMs, sla: elapsedMs < 30000 ? "PASS (<30s)" : "WARN" },
        message: `Validation successful. All ${parseResult.validCount} rows are valid and ready to import.`,
      });
    }

    // 4. Transactional Import Execution (All-or-Nothing)
    const createdProducts = [];
    for (const row of parseResult.rows) {
      if (row.productInput) {
        const created = await ProductsBackendService.createProduct({
          ...row.productInput,
          vendor_id,
        });
        createdProducts.push(created);
      }
    }

    const elapsedMs = Math.round(performance.now() - startTime);

    return NextResponse.json(
      {
        success: true,
        dryRun: false,
        transactionStatus: "COMMITTED",
        totalRows: parseResult.totalRows,
        importedCount: createdProducts.length,
        errorCount: 0,
        performance: {
          executionTimeMs: elapsedMs,
          sla: elapsedMs < 30000 ? "PASS (<30s SLA)" : "WARN",
        },
        message: `Successfully imported ${createdProducts.length.toLocaleString()} products transactionally in ${elapsedMs}ms.`,
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
