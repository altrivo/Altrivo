import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/services/notification-service";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  read: boolean;
  timestamp: string;
  message?: string;
  is_read?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get("userId");
    if (!userId || userId === "null" || userId === "undefined") {
      userId = request.cookies.get("active_vendor_id")?.value || "";
    }
    const storeId = searchParams.get("storeId") || undefined;

    if (!userId) {
      return NextResponse.json({
        success: true,
        notifications: [],
        unreadCount: 0,
      });
    }

    const data = await NotificationService.getNotifications(userId, storeId);
    
    // Normalize properties for both VendorNavbar and NotificationBell
    const formattedNotifications = data.notifications.map((n: any) => ({
      ...n,
      description: n.message || n.description,
      read: n.is_read ?? n.read ?? false,
      timestamp: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
    }));

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      unreadCount: data.unreadCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, markAll, markAllRead, storeId } = body;
    let userId = body.userId;
    if (!userId || userId === "null" || userId === "undefined") {
      userId = request.cookies.get("active_vendor_id")?.value || "";
    }

    if ((markAll || markAllRead) && userId) {
      await NotificationService.markAllAsRead(userId, storeId);
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (notificationId) {
      await NotificationService.markAsRead(notificationId);
      return NextResponse.json({ success: true, message: "Notification marked as read" });
    }

    return NextResponse.json({ success: false, error: "Missing notificationId or userId" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}
