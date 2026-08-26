import { NextRequest } from "next/server";
import { deleteMessage } from "@/controllers/message.controller";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return await deleteMessage(request, { id });
}
