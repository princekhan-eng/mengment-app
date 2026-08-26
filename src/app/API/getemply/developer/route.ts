import { getDeveloper } from "@/controllers/developer.controller";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    return getDeveloper(request);
}
