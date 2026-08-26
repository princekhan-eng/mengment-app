import { createDeveloperController } from "@/controllers/developer.controller";
import { NextResponse, NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
    return await createDeveloperController(request, "admin");
};


