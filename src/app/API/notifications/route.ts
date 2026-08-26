import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectdb";
import Notification from "@/models/Notification.model";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const recipientId = searchParams.get("recipientId");

        if (!recipientId) {
            return NextResponse.json(
                { success: false, message: "recipientId is required" },
                { status: 400 }
            );
        }

        const notifications = await Notification.find({ recipientId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const unreadCount = await Notification.countDocuments({
            recipientId,
            isRead: false,
        });

        return NextResponse.json({
            success: true,
            notifications,
            unreadCount,
        });
    } catch (error: any) {
        console.error("Fetch notifications error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { notificationId, recipientId, markAll } = body;

        if (markAll && recipientId) {
            await Notification.updateMany({ recipientId, isRead: false }, { isRead: true });
            return NextResponse.json({ success: true, message: "All notifications marked as read" });
        }

        if (notificationId) {
            await Notification.findByIdAndUpdate(notificationId, { isRead: true });
            return NextResponse.json({ success: true, message: "Notification marked as read" });
        }

        return NextResponse.json(
            { success: false, message: "Missing notificationId or recipientId" },
            { status: 400 }
        );
    } catch (error: any) {
        console.error("Update notifications error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to update notification" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const notificationId = searchParams.get("notificationId");
        const recipientId = searchParams.get("recipientId");
        const clearAll = searchParams.get("clearAll");

        if (clearAll === "true" && recipientId) {
            await Notification.deleteMany({ recipientId });
            return NextResponse.json({
                success: true,
                message: "All notifications cleared permanently",
            });
        }

        if (notificationId) {
            await Notification.findByIdAndDelete(notificationId);
            return NextResponse.json({
                success: true,
                message: "Notification deleted permanently",
            });
        }

        return NextResponse.json(
            { success: false, message: "notificationId or recipientId with clearAll=true is required" },
            { status: 400 }
        );
    } catch (error: any) {
        console.error("Delete notifications error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to delete notifications" },
            { status: 500 }
        );
    }
}
