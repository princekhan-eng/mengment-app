import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/connectdb";
import Message from "@/models/Message.model";
import Notification from "@/models/Notification.model";
import Manager from "@/models/menager.model";
import Developer from "@/models/developer.model";
import Tester from "@/models/tester.model";
import User from "@/models/auth.model";

export async function getMessages(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get("roomId");
        const senderId = searchParams.get("senderId");
        const receiverId = searchParams.get("receiverId");
        const limit = parseInt(searchParams.get("limit") || "100", 10);

        let query: any = {};

        if (roomId) {
            query.roomId = roomId;
        } else if (senderId && receiverId) {
            const roomFormat1 = `dm_${senderId}_${receiverId}`;
            const roomFormat2 = `dm_${receiverId}_${senderId}`;
            query = { roomId: { $in: [roomFormat1, roomFormat2] } };
        } else {
            return NextResponse.json(
                { success: false, message: "roomId or senderId/receiverId combination is required" },
                { status: 400 }
            );
        }

        const messages = await Message.find(query)
            .sort({ createdAt: 1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            count: messages.length,
            messages,
        });
    } catch (error: any) {
        console.error("Get messages error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch messages" },
            { status: 500 }
        );
    }
}

export async function createMessage(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { senderId, senderName, senderRole, receiverId, roomId, content, attachments } = body;

        if (!senderId || !senderName || !senderRole || !roomId) {
            return NextResponse.json(
                { success: false, message: "Missing required sender or room details" },
                { status: 400 }
            );
        }

        if (!content && (!attachments || attachments.length === 0)) {
            return NextResponse.json(
                { success: false, message: "Message content or attachment is required" },
                { status: 400 }
            );
        }

        const message = await Message.create({
            senderId,
            senderName,
            senderRole,
            receiverId: receiverId || null,
            roomId,
            content: content ? content.trim() : "",
            attachments: attachments || [],
            isRead: false,
        });

        const notifLink = senderRole === "admin" ? "/admin/messages" : `/dashboard/${senderRole}/messages`;

        // Save persistent notification record in database for direct messages
        if (receiverId) {
            try {
                await Notification.create({
                    recipientId: receiverId,
                    senderId,
                    senderName,
                    type: "new_message",
                    title: `New message from ${senderName}`,
                    message: content ? content.trim() : (attachments && attachments.length > 0 ? "Sent an attachment" : "Sent a message"),
                    link: notifLink,
                    isRead: false,
                });
                console.log(`[Notification] Created message notification in database for user: ${receiverId}`);
            } catch (err) {
                console.error("Failed to create message notification in database:", err);
            }
        } else if (roomId && !roomId.startsWith("dm_")) {
            // Channel message notifications for all other team members
            try {
                // Safeguard against CastError if senderId is a placeholder string (e.g. 'admin_default')
                const queryCond = mongoose.Types.ObjectId.isValid(senderId) ? { _id: { $ne: senderId } } : {};

                const [managers, developers, testers, admins] = await Promise.all([
                    Manager.find(queryCond, "_id").lean(),
                    Developer.find(queryCond, "_id").lean(),
                    Tester.find(queryCond, "_id").lean(),
                    User.find(queryCond, "_id").lean(),
                ]);

                const recipients = [
                    ...managers.map((m) => m._id.toString()),
                    ...developers.map((d) => d._id.toString()),
                    ...testers.map((t) => t._id.toString()),
                    ...admins.map((a) => a._id.toString()),
                ];

                const channelDisplayName =
                    roomId === "general"
                        ? "General Announcements"
                        : roomId === "dev-tasks"
                        ? "Dev Team Chat"
                        : roomId === "qa-bugs"
                        ? "QA Testing & Bugs"
                        : roomId;

                const notifPromises = recipients.map((recipId) => {
                    return Notification.create({
                        recipientId: recipId,
                        senderId,
                        senderName,
                        type: "new_message",
                        title: `New message in #${channelDisplayName}`,
                        message: `${senderName}: ${content ? content.trim() : (attachments && attachments.length > 0 ? "Sent an attachment" : "Sent a message")}`,
                        link: notifLink,
                        isRead: false,
                    });
                });

                await Promise.all(notifPromises);
                console.log(`[Notification] Created channel notifications in database for ${recipients.length} users`);
            } catch (err) {
                console.error("Failed to create channel notifications in database:", err);
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: "Message sent successfully",
                data: message,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Create message error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to send message" },
            { status: 500 }
        );
    }
}

export async function markMessagesAsRead(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { roomId, receiverId } = body;

        if (!roomId || !receiverId) {
            return NextResponse.json(
                { success: false, message: "roomId and receiverId are required" },
                { status: 400 }
            );
        }

        await Message.updateMany(
            { roomId, receiverId, isRead: false },
            { isRead: true }
        );

        return NextResponse.json({
            success: true,
            message: "Messages marked as read",
        });
    } catch (error: any) {
        console.error("Mark messages read error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to mark messages as read" },
            { status: 500 }
        );
    }
}

export async function deleteMessage(
    request: NextRequest,
    params: { id: string }
) {
    try {
        await connectDB();
        const messageId = params.id;

        if (!messageId) {
            return NextResponse.json(
                { success: false, message: "Message ID is required" },
                { status: 400 }
            );
        }

        const deleted = await Message.findByIdAndDelete(messageId);

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Message not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Message deleted permanently",
        });
    } catch (error: any) {
        console.error("Delete message error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to delete message" },
            { status: 500 }
        );
    }
}

export async function clearChatRoom(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get("roomId");

        if (!roomId) {
            return NextResponse.json(
                { success: false, message: "roomId parameter is required" },
                { status: 400 }
            );
        }

        await Message.deleteMany({ roomId });

        return NextResponse.json({
            success: true,
            message: "All messages in chat room deleted permanently",
        });
    } catch (error: any) {
        console.error("Clear chat room error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to clear chat room" },
            { status: 500 }
        );
    }
}
