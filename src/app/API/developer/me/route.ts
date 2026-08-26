import { getme } from "@/controllers/developer.controller";
import { NextRequest, NextResponse } from "next/server";

export const GET = (request: NextRequest) => {
    return getme(request);
}
