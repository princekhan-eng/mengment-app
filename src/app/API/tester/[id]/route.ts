import { getTesterById } from "@/controllers/getemploybyid.controller";
import { deleteTester } from "@/controllers/deleteEmployee.controller";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest
) {
    return await getTesterById(request);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return await deleteTester(request, id);
}
