import { createTesterController } from "@/controllers/tester.controller";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
    return await createTesterController(request, "admin");
};
