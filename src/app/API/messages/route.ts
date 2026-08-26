import { NextRequest } from "next/server";
import { getMessages, createMessage, markMessagesAsRead, clearChatRoom } from "@/controllers/message.controller";

export async function GET(request: NextRequest) {
    return await getMessages(request);
}

export async function POST(request: NextRequest) {
    return await createMessage(request);
}

export async function PATCH(request: NextRequest) {
    return await markMessagesAsRead(request);
}

export async function DELETE(request: NextRequest) {
    return await clearChatRoom(request);
}
