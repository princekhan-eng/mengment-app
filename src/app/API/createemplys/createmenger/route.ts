import { createManagerController } from "@/controllers/menger.controller";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
    return await createManagerController(request);
};