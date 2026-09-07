import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/services/notification-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "vendor_dev_123";
    const storeId = searchParams.get("storeId") || undefined;

    const preferences = await NotificationService.getUserPreferences(userId, storeId);

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const updated = await NotificationService.updatePreferences(userId, preferences);

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated successfully",
      preferences: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}
