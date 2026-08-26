import { getManagerById } from "@/controllers/getemploybyid.controller";
import { deleteManager } from "@/controllers/deleteEmployee.controller";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return await getManagerById(request);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return await deleteManager(request, id);
}
