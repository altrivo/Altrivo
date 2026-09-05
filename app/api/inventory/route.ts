import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const simulateErrorHeader = request.headers.get("x-simulate-error");

    if (body.simulateError || simulateErrorHeader === "true" || body.value < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Simulated server error for optimistic rollback verification",
        },
        { status: 500 }
      );
    }

    const { id, field, value } = body;
    if (!id || !field || value === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: id, field, or value" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        id,
        field,
        value,
        updatedAt: new Date().toISOString(),
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
