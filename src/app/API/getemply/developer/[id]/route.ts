import { getDeveloperById } from "@/controllers/getemploybyid.controller";
import { deleteDeveloper } from "@/controllers/deleteEmployee.controller";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    return getDeveloperById(request, id);
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    return deleteDeveloper(request, id);
}